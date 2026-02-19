TARGET_GENES = {
    "CYP2D6",
    "CYP2C19",
    "CYP2C9",
    "SLCO1B1",
    "TPMT",
    "DPYD",
    "VKORC1",
    "NUDT15",
}

# rsID → (gene, star_allele) mapping for real-world VCFs that lack GENE= in INFO
RSID_TO_GENE = {
    # CYP2D6
    "rs3892097": ("CYP2D6", "*4"),
    "rs16947":   ("CYP2D6", "*2"),
    "rs5030655": ("CYP2D6", "*6"),
    "rs1065852": ("CYP2D6", "*10"),
    # CYP2C19
    "rs4244285":  ("CYP2C19", "*2"),
    "rs4986893":  ("CYP2C19", "*3"),
    "rs12248560": ("CYP2C19", "*17"),
    # CYP2C9
    "rs1799853": ("CYP2C9", "*2"),
    "rs1057910": ("CYP2C9", "*3"),
    # SLCO1B1
    "rs4149056": ("SLCO1B1", None),
    # TPMT
    "rs1142345": ("TPMT", "*3A"),
    "rs1800462": ("TPMT", "*2"),
    "rs1800460": ("TPMT", "*3B"),
    # DPYD
    "rs3918290":  ("DPYD", "*2A"),
    "rs55886062": ("DPYD", "*13"),
    "rs67376798": ("DPYD", None),
    # VKORC1
    "rs9923231": ("VKORC1", None),
    # NUDT15
    "rs116855232": ("NUDT15", "*3"),
}


def _parse_info(info: str) -> dict:
    """Safely parse VCF INFO column into a dict with UPPER-CASE keys."""
    parsed = {}
    for field in info.split(";"):
        if "=" in field:
            k, v = field.split("=", 1)
            parsed[k.strip().upper()] = v.strip()
    return parsed


def _split_columns(line: str) -> list:
    """Split a VCF data line on tabs; fall back to whitespace if needed."""
    cols = line.split("\t")
    if len(cols) >= 8:
        return cols
    # Fallback: split on any whitespace (some tools export space-delimited)
    return line.split()


def extract_sample_id(content: str) -> str | None:
    """Return the sample id from the VCF header, if present."""
    if not content:
        return None

    for line in content.splitlines():
        if line.startswith("#CHROM"):
            cols = _split_columns(line)
            if len(cols) > 9:
                return cols[9].strip() or None
            return None
    return None


def parse_vcf(content: str):
    variants = []
    if not content:
        return variants

    # Strip BOM if present
    content = content.lstrip("\ufeff")

    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        cols = _split_columns(line)
        if len(cols) < 8:
            continue

        # ── Parse INFO field ──
        info_dict = _parse_info(cols[7])

        # ── Identify gene (INFO tag → rsID lookup) ──
        gene = info_dict.get("GENE") or info_dict.get("GENE_SYMBOL")
        if gene:
            gene = gene.upper()

        raw_rsid = cols[2] if len(cols) > 2 else "."
        rsid = info_dict.get("RS") or info_dict.get("RSID") or raw_rsid

        # Fall back to rsID-to-gene mapping when INFO has no GENE tag
        star_from_rsid = None
        if not gene or gene not in TARGET_GENES:
            lookup = RSID_TO_GENE.get(rsid)
            if lookup:
                gene, star_from_rsid = lookup

        if not gene or gene not in TARGET_GENES:
            continue

        # ── Star allele ──
        star = info_dict.get("STAR") or info_dict.get("STAR_ALLELE") or star_from_rsid

        # ── Genotype ──
        genotype = None
        if len(cols) > 9:
            format_keys = cols[8].split(":")
            sample_vals = cols[9].split(":")
            if "GT" in format_keys:
                gt_index = format_keys.index("GT")
                if gt_index < len(sample_vals):
                    genotype = sample_vals[gt_index]
        genotype = genotype or info_dict.get("GT")

        variants.append({
            "gene": gene,
            "rsid": rsid,
            "star": star,
            "genotype": genotype,
        })

    return variants
