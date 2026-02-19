"""
PharmaGuard CPIC Risk Engine
Explicit handlers per drug type — no fragile condition-string parsing.
"""

import json
from pathlib import Path
from typing import Dict

BASE = Path(__file__).resolve().parent.parent
rules = json.load(open(BASE / "data/phenotype_rules.json"))


def _unknown_result(drug: str, action: str = "Unsupported drug", gene_missing: bool = False):
    return {
        "risk_label": "Unknown",
        "severity": "none",
        "recommendation": {"action": action},
        "confidence_score": 0.3,
        "drug": drug,
        "gene_missing": gene_missing,
    }


def _rule_to_result(rule: dict, drug: str, action_override: str = None, gene_missing: bool = False):
    return {
        "risk_label": rule.get("risk_label", "Unknown"),
        "severity": rule.get("severity", "none"),
        "recommendation": {"action": action_override or rule.get("recommendation", "Consult specialist")},
        "confidence_score": rule.get("confidence", 0.5),
        "drug": drug,
        "gene_missing": gene_missing,
    }


# ── Warfarin: CYP2C9 + VKORC1 combined risk matrix ───────────────────────────

def _assess_warfarin(phenotypes: Dict[str, dict], entry: dict) -> dict:
    cyp2c9_pheno = phenotypes.get("CYP2C9", {}).get("phenotype", "Unknown")
    vkorc1_pheno = phenotypes.get("VKORC1", {}).get("phenotype", "Unknown")

    matrix = entry.get("combined_risk_matrix", {})
    matrix_key = f"{cyp2c9_pheno}+{vkorc1_pheno}"

    rule = (
        matrix.get(matrix_key)
        or matrix.get(f"{cyp2c9_pheno}+Unknown")
        or matrix.get(f"Unknown+{vkorc1_pheno}")
        or matrix.get("Unknown+Unknown")
    )

    missing = [g for g in ("CYP2C9", "VKORC1") if g not in phenotypes]
    if not rule:
        return _unknown_result("WARFARIN", "Insufficient data for warfarin dosing", bool(missing))

    action = rule.get("recommendation", "Consult specialist")
    if missing:
        action = (
            f"No {', '.join(missing)} variants detected in uploaded VCF. "
            f"WARFARIN requires CYP2C9 and VKORC1 genotype data. {action}"
        )

    result = _rule_to_result(rule, "WARFARIN", action, bool(missing))
    result["alternative_drugs"] = entry.get("alternative_drugs", [])
    return result


# ── Azathioprine: worst-case TPMT / NUDT15 phenotype ─────────────────────────

def _assess_azathioprine(phenotypes: Dict[str, dict], entry: dict) -> dict:
    tpmt_pheno = phenotypes.get("TPMT", {}).get("phenotype", "Unknown")
    # Assume Normal if NUDT15 not in VCF (absence ≠ deficiency)
    nudt15_pheno = phenotypes.get("NUDT15", {}).get("phenotype", "Normal")

    phenotype_rules = entry.get("phenotype_rules", {})

    if tpmt_pheno == "Poor" or nudt15_pheno == "Poor":
        rule = phenotype_rules.get("Poor")
    elif tpmt_pheno == "Intermediate" or nudt15_pheno == "Intermediate":
        rule = phenotype_rules.get("Intermediate")
    elif tpmt_pheno == "Normal" and nudt15_pheno == "Normal":
        rule = phenotype_rules.get("Normal")
    else:
        rule = phenotype_rules.get("Unknown")

    if not rule:
        return _unknown_result("AZATHIOPRINE", "Insufficient TPMT/NUDT15 data")

    missing = [g for g in ("TPMT", "NUDT15") if g not in phenotypes]
    action = rule.get("recommendation", "Consult specialist")
    if "TPMT" not in phenotypes:
        action = (
            f"No TPMT variants detected in uploaded VCF. "
            f"AZATHIOPRINE requires TPMT data. {action}"
        )

    return _rule_to_result(rule, "AZATHIOPRINE", action, "TPMT" not in phenotypes)


# ── Single-gene drugs: CODEINE, CLOPIDOGREL, SIMVASTATIN, etc. ───────────────

def _assess_single_gene(drug: str, phenotypes: Dict[str, dict], entry: dict) -> dict:
    gene = entry.get("gene", entry.get("primary_gene", "Unknown"))
    gene_data = phenotypes.get(gene, {})
    phenotype = gene_data.get("phenotype", "Unknown")

    phenotype_rules = entry.get("phenotype_rules", {})
    rule = phenotype_rules.get(phenotype) or phenotype_rules.get("Unknown")

    if not rule:
        return _unknown_result(drug, "Insufficient genotype data", gene not in phenotypes)

    action = rule.get("recommendation", "Consult specialist")
    if gene not in phenotypes:
        action = (
            f"No {gene} variants detected in uploaded VCF. "
            f"{drug} metabolism depends on {gene}. "
            f"Prediction not possible — provide {gene} genotype data for assessment."
        )

    return _rule_to_result(rule, drug, action, gene not in phenotypes)


# ── Master entry point ────────────────────────────────────────────────────────

def assess_risk(drug: str, phenotypes: Dict[str, dict]):
    drug = drug.upper()
    entry = rules.get(drug)
    if not entry:
        return _unknown_result(drug, "Unsupported drug")

    if drug == "WARFARIN" and "combined_risk_matrix" in entry:
        return _assess_warfarin(phenotypes, entry)

    if drug == "AZATHIOPRINE" and "phenotype_rules" in entry:
        return _assess_azathioprine(phenotypes, entry)

    if "phenotype_rules" in entry:
        return _assess_single_gene(drug, phenotypes, entry)

    return _unknown_result(drug, "No matching rules for this drug")
