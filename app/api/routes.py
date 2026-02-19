from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import StreamingResponse
from datetime import datetime
import asyncio
import json
import uuid
from pathlib import Path
from typing import Optional

from app.services.vcf_service import parse_vcf, extract_sample_id
from app.services.pgx_service import interpret_variants
from app.services.llm_service import generate_explanation
from app.services.history_service import next_patient_id, save_report, get_report, list_reports, delete_report
from app.utils.validators import is_vcf_filename, parse_drug_list, split_supported_drugs

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

router = APIRouter()

# ── Load drug→gene mapping for coverage checks ──────────────────────
_DRUG_RULES = json.load(open(Path(__file__).resolve().parent.parent / "data" / "drug_rules.json"))


def _required_genes_for_drug(drug: str) -> list[str]:
    """Return the list of genes a drug depends on."""
    entry = _DRUG_RULES.get(drug.upper(), {})
    if "all_genes" in entry:
        return list(entry["all_genes"])
    if "gene" in entry:
        return [entry["gene"]]
    if "genes" in entry:
        return list(entry["genes"])
    return []


def _gene_coverage(variants: list[dict], drugs: list[str]):
    """Analyse which genes the VCF has vs what the selected drugs need."""
    detected_genes = {v.get("gene") for v in variants if v.get("gene")}
    coverage = []
    for drug in drugs:
        required = _required_genes_for_drug(drug)
        present = [g for g in required if g in detected_genes]
        missing = [g for g in required if g not in detected_genes]
        coverage.append({
            "drug": drug.upper(),
            "required_genes": required,
            "present_genes": present,
            "missing_genes": missing,
            "fully_covered": len(missing) == 0,
        })
    return coverage


def _suggest_drugs(variants: list[dict]) -> list[dict]:
    """Suggest drugs whose required genes are present in the VCF."""
    detected_genes = {v.get("gene") for v in variants if v.get("gene")}
    suggestions = []
    for drug, entry in _DRUG_RULES.items():
        required = list(entry.get("all_genes", [entry["gene"]] if "gene" in entry else entry.get("genes", [])))
        if required and all(g in detected_genes for g in required):
            suggestions.append({
                "drug": drug,
                "genes": required,
                "mechanism": entry.get("mechanism", ""),
            })
    return suggestions


# ── Debug endpoint — upload a VCF and see raw parse results ──────────
@router.post("/debug/vcf")
async def debug_vcf(file: UploadFile = File(...)):
    """Return raw parsed rows and extracted variants for debugging."""
    raw = await file.read()
    content = raw.decode("utf-8", errors="replace")
    lines = [l for l in content.splitlines() if l.strip() and not l.startswith("#")]
    variants = parse_vcf(content)
    return {
        "data_lines": len(lines),
        "parsed_rows": lines[:20],          # first 20 non-header lines
        "extracted_variants": variants,
        "variants_found": len(variants),
    }


# ── History endpoints ────────────────────────────────────────────────
@router.get("/history")
async def get_history():
    """Return a list of all past patient reports (metadata only)."""
    return {"patients": list_reports()}


@router.get("/history/{patient_id}")
async def get_patient_report(patient_id: str):
    """Return the full stored report for a given patient."""
    report = get_report(patient_id)
    if report is None:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found.")
    return report


@router.delete("/history/{patient_id}")
async def delete_patient_report(patient_id: str):
    if not delete_report(patient_id):
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found.")
    return {"status": "deleted", "patient_id": patient_id}


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    drugs: str = Form(...),
    patient_id: Optional[str] = Form(None),
):
    if not is_vcf_filename(file.filename):
        raise HTTPException(status_code=400, detail="Invalid file type. Upload a .vcf file.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty VCF file.")

    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 5 MB limit.")

    try:
        content = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="VCF file must be UTF-8 text.") from exc

    drug_list = parse_drug_list(drugs)
    if not drug_list:
        raise HTTPException(status_code=400, detail="No drug provided.")

    supported, unsupported = split_supported_drugs(drug_list)
    if not supported:
        raise HTTPException(status_code=400, detail="No supported drugs provided.")

    variants = parse_vcf(content)
    if not patient_id:
        patient_id = extract_sample_id(content) or next_patient_id()
    timestamp = datetime.utcnow().isoformat()

    # ── Gene coverage analysis ───────────────────────────────
    detected_genes = sorted({v.get("gene") for v in variants if v.get("gene")})
    coverage = _gene_coverage(variants, supported)
    suggestions = _suggest_drugs(variants)

    def build_result(drug: str, drug_coverage: dict):
        pgx_profile, risk_results = interpret_variants(variants, drug)
        explanation = generate_explanation(pgx_profile, risk_results)

        return {
            "patient_id": patient_id,
            "drug": risk_results["drug"],
            "timestamp": timestamp,
            "risk assessment": {
                "risk label": risk_results["risk_label"],
                "confidence_score": risk_results["confidence_score"],
                "severity": risk_results["severity"],
            },
            "pharmacogenomic profile": pgx_profile,
            "clinical recommendation": risk_results["recommendation"],
            "llm generated explanation": explanation,
            "quality_metrics": {
                "vcf_parsing_success": True,
            },
        }

    coverage_by_drug = {c["drug"]: c for c in coverage}

    if len(supported) == 1:
        response = await asyncio.to_thread(
            build_result, supported[0], coverage_by_drug.get(supported[0].upper(), {})
        )
    else:
        # Run all drug analyses in parallel threads
        response = list(await asyncio.gather(*[
            asyncio.to_thread(build_result, drug, coverage_by_drug.get(drug.upper(), {}))
            for drug in supported
        ]))

    # Persist to history
    save_report(patient_id, response)
    return response


@router.post("/analyze/stream")
async def analyze_stream(
    file: UploadFile = File(...),
    drugs: str = Form(...),
    patient_id: Optional[str] = Form(None),
):
    """Streaming version of /analyze that sends progress events via SSE."""
    if not is_vcf_filename(file.filename):
        raise HTTPException(status_code=400, detail="Invalid file type. Upload a .vcf file.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty VCF file.")
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 5 MB limit.")
    try:
        content = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="VCF file must be UTF-8 text.") from exc

    drug_list = parse_drug_list(drugs)
    if not drug_list:
        raise HTTPException(status_code=400, detail="No drug provided.")
    supported, unsupported = split_supported_drugs(drug_list)
    if not supported:
        raise HTTPException(status_code=400, detail="No supported drugs provided.")

    async def event_generator():
        def _sse(data: dict) -> str:
            return f"data: {json.dumps(data)}\n\n"

        yield _sse({"type": "progress", "step": "Parsing VCF file…"})
        variants = await asyncio.to_thread(parse_vcf, content)
        nonlocal patient_id
        if not patient_id:
            patient_id = extract_sample_id(content) or next_patient_id()
        timestamp = datetime.utcnow().isoformat()

        yield _sse({"type": "progress", "step": f"Found {len(variants)} pharmacogenomic variants"})

        coverage = _gene_coverage(variants, supported)
        coverage_by_drug = {c["drug"]: c for c in coverage}

        results = []
        total = len(supported)
        for i, drug in enumerate(supported, 1):
            yield _sse({"type": "progress", "step": f"Working on {drug.upper()} ({i}/{total})…"})
            pgx_profile, risk_results = await asyncio.to_thread(interpret_variants, variants, drug)
            explanation = await asyncio.to_thread(generate_explanation, pgx_profile, risk_results)

            results.append({
                "patient_id": patient_id,
                "drug": risk_results["drug"],
                "timestamp": timestamp,
                "risk assessment": {
                    "risk label": risk_results["risk_label"],
                    "confidence_score": risk_results["confidence_score"],
                    "severity": risk_results["severity"],
                },
                "pharmacogenomic profile": pgx_profile,
                "clinical recommendation": risk_results["recommendation"],
                "llm generated explanation": explanation,
                "quality_metrics": {"vcf_parsing_success": True},
            })

        response = results[0] if len(results) == 1 else results
        save_report(patient_id, response)

        yield _sse({"type": "progress", "step": "Finalizing report…"})
        yield _sse({"type": "result", "data": response})

    return StreamingResponse(event_generator(), media_type="text/event-stream")
