"""Pydantic response models enforcing the PharmaGuard JSON schema."""

from pydantic import BaseModel, Field
from typing import Literal


VALID_SEVERITIES = Literal["none", "low", "moderate", "high", "critical"]

VALID_RISK_LABELS = Literal[
    "Safe", "Unknown", "Ineffective", "Reduced Effect", "Increased Effect",
    "Toxic", "Reduced Efficacy", "Bleeding Risk",
    "High Sensitivity", "Moderate Sensitivity", "Standard Dose",
    "Myopathy Risk", "Increased Risk",
    "Severe Toxicity Risk", "Moderate Toxicity Risk",
    "Toxicity Risk", "Severe Toxicity",
]


class RiskAssessment(BaseModel):
    risk_label: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    severity: VALID_SEVERITIES


class DetectedVariant(BaseModel):
    gene: str
    rsid: str


class PharmacogenomicProfile(BaseModel):
    primary_gene: str
    diplotype: str
    phenotype: str
    detected_variants: list[DetectedVariant | dict]


class ClinicalRecommendation(BaseModel):
    action: str


class LLMExplanation(BaseModel):
    summary: str
    mechanism: str
    evidence: dict
    recommendation_rationale: str
    limitations: str


class QualityMetrics(BaseModel):
    vcf_parsing_success: bool
    variants_found: int = Field(ge=0)
    unsupported_drugs: list[str]


class SingleDrugResponse(BaseModel):
    patient_id: str
    drug: str
    timestamp: str
    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: ClinicalRecommendation
    llm_generated_explanation: LLMExplanation
    quality_metrics: QualityMetrics
    gene_coverage: dict = {}


class MultiDrugResponse(BaseModel):
    patient_id: str
    timestamp: str
    results: list[SingleDrugResponse]
    quality_metrics: QualityMetrics
    detected_genes: list[str] = []
    gene_coverage: list[dict] = []
    suggested_drugs: list[dict] = []
