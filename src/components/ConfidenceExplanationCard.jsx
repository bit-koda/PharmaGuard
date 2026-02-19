import { AlertTriangle } from 'lucide-react';

/**
 * Card to explain why confidence is low (e.g., missing genes, incomplete data).
 * Expects a `result` prop (single or multi-drug API result).
 */
export default function ConfidenceExplanationCard({ result }) {
  // Support both single and multi-drug result
  const entries = Array.isArray(result?.results)
    ? result.results
    : result && result.drug
    ? [result]
    : [];

  // Find any low-confidence or missing-gene explanations
  const lowConfidence = entries.filter(
    (r) =>
      (r.risk_assessment?.confidence_score !== undefined &&
        r.risk_assessment.confidence_score < 0.7) ||
      (r.pharmacogenomic_profile?.missing_genes &&
        r.pharmacogenomic_profile.missing_genes.length > 0)
  );

  if (lowConfidence.length === 0) return null;

  return (
    <div className="rounded-2xl border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 shadow-sm overflow-hidden mt-4">
      <div className="px-5 py-4 border-b border-yellow-200 dark:border-yellow-700 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
        <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
          Confidence Explanation
        </h3>
      </div>
      <div className="p-5 space-y-3">
        {lowConfidence.map((r, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-yellow-800 dark:text-yellow-300">
                {r.drug || r.pharmacogenomic_profile?.primary_gene || 'Unknown'}
              </span>
            </div>
            {r.pharmacogenomic_profile?.coverage_warning && (
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                {r.pharmacogenomic_profile.coverage_warning}
              </p>
            )}
            {r.risk_assessment?.confidence_score !== undefined && r.risk_assessment.confidence_score < 0.7 && (
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                Confidence is low due to missing or incomplete genotype data.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
