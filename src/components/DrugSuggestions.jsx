import { Lightbulb, ArrowRight, Dna } from 'lucide-react';

/**
 * When the backend detects that the VCF contains genes relevant to
 * drugs the user did NOT select, it returns suggested_drugs[].
 * This component surfaces those as smart recommendations.
 */
export default function DrugSuggestions({ result, onSelectDrug }) {
  const suggestions = result?.suggested_drugs || [];

  // Filter out drugs already analyzed in the current result
  const analyzedDrugs = new Set();
  if (result?.drug) analyzedDrugs.add(result.drug.toUpperCase());
  if (Array.isArray(result?.results)) {
    result.results.forEach((r) => {
      if (r.drug) analyzedDrugs.add(r.drug.toUpperCase());
    });
  }

  const unanalyzed = suggestions.filter(
    (s) => !analyzedDrugs.has(s.drug.toUpperCase())
  );

  if (unanalyzed.length === 0) return null;

  return (
    <div className="rounded-2xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-teal-200 dark:border-teal-700 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-teal-600 dark:text-teal-500" />
        <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
          Smart Drug Suggestions
        </h3>
      </div>

      <div className="p-5 space-y-3">
        <p className="text-sm text-teal-700 dark:text-teal-400">
          Your VCF file contains gene data relevant to these additional drugs.
          Consider running an analysis for better clinical insight.
        </p>

        <div className="grid gap-2">
          {unanalyzed.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl p-3
                         bg-white/60 dark:bg-gray-800/60 border border-teal-200 dark:border-teal-700
                         hover:bg-teal-100/50 dark:hover:bg-teal-900/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                  <Dna className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{s.drug}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Genes: <span className="font-mono">{s.genes?.join(', ')}</span>
                  </p>
                </div>
              </div>

              {onSelectDrug && (
                <button
                  onClick={() => onSelectDrug(s.drug)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                             bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Analyze <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
