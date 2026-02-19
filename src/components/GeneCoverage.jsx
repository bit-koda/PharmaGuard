import { AlertTriangle, CheckCircle2, Dna, ShieldAlert } from 'lucide-react';

/**
 * Shows gene coverage analysis — which required genes are present/missing
 * in the uploaded VCF for each selected drug.
 */
export default function GeneCoverage({ result }) {
  // Gather coverage from single or multi response
  let coverageList = [];
  if (Array.isArray(result?.gene_coverage)) {
    coverageList = result.gene_coverage;
  } else if (result?.gene_coverage) {
    coverageList = [result.gene_coverage];
  } else if (Array.isArray(result?.results)) {
    coverageList = result.results
      .filter((r) => r.gene_coverage)
      .map((r) => r.gene_coverage);
  } else if (result?.pharmacogenomic_profile?.coverage_warning) {
    // Single-drug with missing genes
    coverageList = [{
      drug: result.drug,
      required_genes: [result.pharmacogenomic_profile.primary_gene],
      present_genes: [],
      missing_genes: result.pharmacogenomic_profile.missing_genes || [],
      fully_covered: false,
    }];
  }

  if (coverageList.length === 0) return null;

  const hasMissing = coverageList.some((c) => c.missing_genes?.length > 0);
  if (!hasMissing) return null; // Don't show if everything is fully covered

  return (
    <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-amber-200 dark:border-amber-700 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500" />
        <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
          Gene Coverage Warning
        </h3>
      </div>

      <div className="p-5 space-y-3">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Some selected drugs require gene data not found in your VCF file.
          Results for these drugs may be incomplete.
        </p>

        {coverageList.map((c, i) => (
          <div
            key={i}
            className="rounded-xl p-3 bg-white/60 dark:bg-gray-800/60 border border-amber-200 dark:border-amber-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{c.drug}</span>
              {c.fully_covered ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Covered
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Incomplete
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(c.required_genes || []).map((gene) => {
                const isPresent = c.present_genes?.includes(gene);
                return (
                  <span
                    key={gene}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold
                      ${isPresent
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}
                  >
                    <Dna className="w-3 h-3" />
                    {gene}
                    {isPresent ? ' ✓' : ' ✗ missing'}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
