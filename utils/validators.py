from typing import List

SUPPORTED_DRUGS = {
	"CODEINE",
	"WARFARIN",
	"CLOPIDOGREL",
	"SIMVASTATIN",
	"AZATHIOPRINE",
	"CAPECITABINE",
	"FLUOROURACIL",
}


def is_vcf_filename(filename: str) -> bool:
	if not filename:
		return False
	return filename.lower().endswith(".vcf")


def parse_drug_list(drugs: str) -> List[str]:
	if not drugs:
		return []
	items = [item.strip().upper() for item in drugs.split(",")]
	return [item for item in items if item]


def split_supported_drugs(drug_list: List[str]):
	supported = [drug for drug in drug_list if drug in SUPPORTED_DRUGS]
	unsupported = [drug for drug in drug_list if drug not in SUPPORTED_DRUGS]
	return supported, unsupported
