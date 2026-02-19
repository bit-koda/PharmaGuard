import json
import os

from dotenv import load_dotenv

load_dotenv()


MECHANISM_DB = {
    "CYP2D6": "CYP2D6 encodes a cytochrome P450 enzyme responsible for the metabolism of ~25% of clinically used drugs, including codeine (prodrug activation to morphine) and many opioids.",
    "CYP2C19": "CYP2C19 metabolises clopidogrel (prodrug activation), proton pump inhibitors, and certain antidepressants. Poor metabolisers cannot convert clopidogrel to its active thiol metabolite.",
    "CYP2C9": "CYP2C9 is the primary enzyme metabolising S-warfarin. Reduced-function alleles (*2, *3) decrease warfarin clearance, raising bleeding risk.",
    "VKORC1": "VKORC1 encodes the pharmacological target of warfarin. The -1639G>A promoter variant increases sensitivity to warfarin by reducing VKORC1 expression.",
    "SLCO1B1": "SLCO1B1 encodes the hepatic uptake transporter OATP1B1. The *5 variant (rs4149056 T>C) reduces statin hepatic uptake, increasing systemic exposure and myopathy risk.",
    "TPMT": "TPMT catalyses S-methylation of thiopurines (azathioprine, 6-MP). Deficient activity leads to accumulation of cytotoxic thioguanine nucleotides, causing myelosuppression.",
    "NUDT15": "NUDT15 dephosphorylates thioguanine nucleotide metabolites. Deficiency causes excessive active metabolite accumulation and severe thiopurine toxicity.",
    "DPYD": "DPYD encodes dihydropyrimidine dehydrogenase, the rate-limiting enzyme for fluoropyrimidine catabolism. Deficiency causes toxic accumulation of 5-FU.",
}


def _build_fallback(profile, risk):
    gene = profile.get("primary_gene", "Unknown")
    phenotype = profile.get("phenotype", "Unknown")
    label = risk.get("risk_label", "Unknown")
    drug = risk.get("drug", "Unknown")
    variants = profile.get("detected_variants", [])
    recommendation = risk.get("recommendation", {}).get("action", "Consult specialist")

    # Build variant-specific citation text
    variant_citations = []
    for v in variants:
        rsid = v.get("rsid", "")
        star = v.get("star", "")
        g = v.get("gene", gene)
        if rsid and star:
            cite = f"{g} {star} ({rsid})"
            variant_citations.append(cite)

    # Summary
    summary = f"Patient carries {gene} {phenotype} phenotype affecting {drug} response → {label}."
    if variant_citations:
        summary += f" Detected variants: {'; '.join(variant_citations)}."

    # Use specific mechanism from database
    mechanism = MECHANISM_DB.get(gene, f"{gene} genetic variation modulates drug metabolism or pharmacological response.")

    # Add drug-specific context to mechanism
    if drug == "CODEINE" and gene == "CYP2D6":
        if phenotype == "PM":
            mechanism += " Poor metabolizers cannot convert codeine to morphine, resulting in lack of analgesia."
        elif phenotype == "UM":
            mechanism += " Ultra-rapid metabolizers produce excessive morphine, increasing toxicity risk."
        elif phenotype == "NM":
            mechanism += " Normal metabolizers efficiently convert codeine to morphine for standard analgesic effect."
    elif drug == "CLOPIDOGREL" and gene == "CYP2C19":
        if phenotype == "PM":
            mechanism += " Poor metabolizers cannot activate clopidogrel, leading to reduced antiplatelet effect and increased cardiovascular risk."
    elif drug == "WARFARIN" and gene in ["CYP2C9", "VKORC1"]:
        mechanism += " Variant alleles alter warfarin clearance or sensitivity, requiring dose adjustment to prevent bleeding or thrombosis."
    elif drug == "SIMVASTATIN" and gene == "SLCO1B1":
        if "*5" in profile.get("diplotype", ""):
            mechanism += " The *5 variant (rs4149056) reduces hepatic uptake, increasing systemic statin exposure and myopathy risk."

    return {
        "summary": summary,
        "mechanism": mechanism,
        "recommendation_rationale": recommendation,
        "limitations": "Interpretation based on detected variants and CPIC guidelines. Rare variants or structural variations may not be captured."
    }


def generate_explanation(profile, risk):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _build_fallback(profile, risk)

    try:
        import google.generativeai as genai
        from google.generativeai.generative_models import GenerativeModel

        genai.configure(api_key=api_key)
        model = GenerativeModel("gemini-flash-latest")

        prompt = {
            "drug": risk.get("drug"),
            "gene": profile.get("primary_gene"),
            "phenotype": profile.get("phenotype"),
            "diplotype": profile.get("diplotype"),
            "risk_label": risk.get("risk_label"),
            "severity": risk.get("severity"),
            "recommendation": risk.get("recommendation", {}).get("action"),
            "variants": [
                {
                    "rsid": v.get("rsid"),
                    "genotype": v.get("genotype"),
                    "star": v.get("star"),
                }
                for v in profile.get("detected_variants", [])
            ],
        }

        system = (
            "You are a clinical pharmacogenomics expert generating explanations for healthcare providers. "
            "Return ONLY valid JSON with exactly 4 keys: summary, mechanism, recommendation_rationale, limitations. "
            "\n\n"
            "REQUIREMENTS:\n"
            "- summary: 2-3 sentences citing specific rsIDs and star alleles, phenotype, and risk outcome.\n"
            "- mechanism: Detailed biological explanation of how the gene product (enzyme/transporter/receptor) processes the drug, "
            "and how the detected genetic variant alters that process at the molecular level. Be specific about metabolic pathways.\n"
            "- recommendation_rationale: Clinical justification for the dosing recommendation based on the phenotype.\n"
            "- limitations: Mention that interpretation is based on detected variants per CPIC guidelines and may not capture rare variants.\n"
            "\n"
            "Use precise pharmacological terminology. Avoid generic phrases like 'genetic variation alters metabolism'."
        )
        user = f"Generate explanation for: {json.dumps(prompt, ensure_ascii=True)}"

        response = model.generate_content(
            [system, user],
            request_options={"timeout": 15},
        )
        text = response.text.strip()
        # Strip markdown code fences reliably
        import re
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        return json.loads(text)
    except Exception:
        return _build_fallback(profile, risk)
