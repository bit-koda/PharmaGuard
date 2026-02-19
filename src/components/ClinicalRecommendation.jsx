import { Stethoscope, BookOpen } from 'lucide-react';

/**
 * Extract recommendation and explanation entries from single- or multi-drug result.
 */
function getEntries(result) {
  if (!result) return [];
  if (Array.isArray(result)) {
    return result.map((r) => ({
      drug: r.drug,
      rec: r['clinical recommendation'],
      explanation: r['llm generated explanation'],
    }));
  }
  return [{
    drug: result.drug,
    rec: result['clinical recommendation'],
    explanation: result['llm generated explanation'],
  }];
}

/** Render the recommendation object (could be {action:"..."} or a string). */
function RecText({ rec }) {
  if (!rec) return null;
  if (typeof rec === 'string') return <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rec}</p>;
  if (rec.action) return <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rec.action}</p>;
  return null;
}

/** Render the LLM explanation object safely. */
function ExplainBlock({ explanation }) {
  if (!explanation) return null;

  // If it's already a string, render directly
  if (typeof explanation === 'string') {
    return <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{explanation}</p>;
  }

  // Object with {summary, mechanism, recommendation_rationale, limitations}
  return (
    <div className="space-y-3">
      {explanation.summary && (
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{explanation.summary}</p>
      )}
      {explanation.mechanism && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Mechanism</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{explanation.mechanism}</p>
        </div>
      )}
      {explanation.recommendation_rationale && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Rationale</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{explanation.recommendation_rationale}</p>
        </div>
      )}
      {explanation.limitations && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Limitations</h4>
          <p className="text-xs text-amber-600 dark:text-amber-300">{explanation.limitations}</p>
        </div>
      )}
    </div>
  );
}

export default function ClinicalRecommendation({ result }) {
  const entries = getEntries(result);
  if (entries.length === 0) return null;

  return (
    <div className="space-y-4">
      {entries.map((entry, idx) => (
        <div key={idx} className="space-y-4">
          {/* Clinical Recommendation */}
          {entry.rec && (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Recommendation{entry.drug ? ` — ${entry.drug}` : ''}
                </h3>
              </div>
              <div className="p-5">
                <RecText rec={entry.rec} />
              </div>
            </div>
          )}

          {/* LLM Explanation */}
          {entry.explanation && (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  AI Explanation{entry.drug ? ` — ${entry.drug}` : ''}
                </h3>
              </div>
              <div className="p-5">
                <ExplainBlock explanation={entry.explanation} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
