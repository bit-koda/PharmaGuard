import json
from pathlib import Path
from typing import Dict, List, Tuple

from app.services.risk_engine import assess_risk

BASE = Path(__file__).resolve().parent.parent

phenotype_tables = json.load(open(BASE / "data/phenotype_tables.json"))
drug_rules = json.load(open(BASE / "data/drug_rules.json"))


def _infer_diplotype(variants: List[dict]) -> str:
    """Combine per-variant star alleles into a single diplotype for one gene.

    Each variant carries a raw star allele (e.g. '*2') and a genotype
    ('0/1', '1/1').  Zygosity is determined here — the parser no longer
    expands alleles.
    """
    # Handle non-star-allele annotations (e.g. VKORC1 AA/GA/GG)
    for variant in variants:
        star = variant.get("star")
        if star and not star.startswith("*") and "/" not in star:
            return star

    # Collect allele contributions using genotype to determine zygosity
    alleles: list[str] = []
    for variant in variants:
        star = variant.get("star")
        if not star or not star.startswith("*"):
            continue
        genotype = variant.get("genotype", "")
        if "/" in star:
            # Legacy expanded form — extract non-wildtype
            for a in star.split("/"):
                if a != "*1":
                    alleles.append(a)
        elif genotype in ("1/1", "1|1"):
            alleles.append(star)
            alleles.append(star)
        elif genotype in ("0/1", "0|1", "1/0", "1|0"):
            alleles.append(star)
        # 0/0 = wildtype for this variant, contributes nothing

    if not alleles:
        return "*1/*1"

    unique = list(dict.fromkeys(alleles))
    if len(unique) >= 2:
        return f"{unique[0]}/{unique[1]}"
    if len(alleles) >= 2:
        return f"{alleles[0]}/{alleles[0]}"
    return f"*1/{alleles[0]}"


def _infer_phenotype(gene: str, variants: List[dict]) -> Tuple[str, str]:
    table = phenotype_tables.get(gene, {})
    default_pheno = table.get("default", "Unknown")

    # For genes like SLCO1B1/VKORC1 that may use raw genotype or
    # non-star annotations (CC, TT, AA), check those first
    for variant in variants:
        star = variant.get("star")
        if star and star in table:
            return star, table[star]

    for variant in variants:
        genotype = variant.get("genotype")
        if genotype and genotype in table:
            return genotype, table[genotype]

    diplotype = _infer_diplotype(variants)
    if diplotype != "*1/*1" and diplotype in table:
        return diplotype, table[diplotype]
    if diplotype in table:
        return diplotype, table[diplotype]

    return diplotype, default_pheno


def _build_gene_profiles(variants: List[dict]) -> Dict[str, dict]:
    profiles: Dict[str, dict] = {}
    for gene in {v.get("gene") for v in variants if v.get("gene")}:
        gene_variants = [v for v in variants if v.get("gene") == gene]
        diplotype, phenotype = _infer_phenotype(gene, gene_variants)
        profiles[gene] = {
            "diplotype": diplotype,
            "phenotype": phenotype,
            "detected_variants": gene_variants,
        }
    return profiles


def _genes_for_drug(drug: str) -> list:
    """Return all genes relevant to a drug."""
    rules = drug_rules.get(drug)
    if not rules:
        return []
    if "all_genes" in rules:
        return list(rules["all_genes"])
    if "gene" in rules:
        return [rules["gene"]]
    if "genes" in rules and rules["genes"]:
        return list(rules["genes"])
    return []


def _primary_gene_for_drug(drug: str) -> str:
    genes = _genes_for_drug(drug)
    return genes[0] if genes else "Unknown"


def interpret_variants(variants: List[dict], drug: str):
    gene_profiles = _build_gene_profiles(variants)
    primary_gene = _primary_gene_for_drug(drug)
    primary_profile = gene_profiles.get(primary_gene, {})

    risk = assess_risk(drug, gene_profiles)

    # Collect detected_variants from ALL relevant genes, not just primary
    all_relevant_genes = _genes_for_drug(drug)
    all_detected = []
    for g in all_relevant_genes:
        gp = gene_profiles.get(g, {})
        all_detected.extend(gp.get("detected_variants", []))

    profile = {
        "primary gene": primary_gene,
        "diplotype": primary_profile.get("diplotype", "Unknown"),
        "phenotype": primary_profile.get("phenotype", "Unknown"),
        "detected_variants": all_detected,
    }

    return profile, risk
