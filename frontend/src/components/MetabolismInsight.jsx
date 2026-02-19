import { Dna } from 'lucide-react';

/**
 * Normalise profile data into an array of {gene, diplotype, phenotype}.
 * Single-drug response: pharmacogenomic_profile is an object.
 * Multi-drug response:  results[] each have their own profile.
 */
function getProfiles(result) {
  if (!result) return [];

  // Multi-drug: result.results is an array
  if (Array.isArray(result.results)) {
    return result.results.map((r) => {
      const p = r.pharmacogenomic_profile || {};
      return {
        gene: p.primary_gene || 'Unknown',
        diplotype: p.diplotype || 'Unknown',
        phenotype: p.phenotype || 'Unknown',
        drug: r.drug,
      };
    });
  }

  // Single-drug: pharmacogenomic_profile is one object
  const p = result.pharmacogenomic_profile;
  if (p && typeof p === 'object' && !Array.isArray(p)) {
    return [{
      gene: p.primary_gene || 'Unknown',
      diplotype: p.diplotype || 'Unknown',
      phenotype: p.phenotype || 'Unknown',
      drug: result.drug,
    }];
  }

  // Already an array (future-proof)
  if (Array.isArray(p)) return p;

  return [];
}

export default function MetabolismInsight({ result }) {
  const profiles = getProfiles(result);

  if (profiles.length === 0) return null;

  const phenotypeColor = (phenotype) => {
    const p = (phenotype || '').toLowerCase();
    if (p.includes('poor'))          return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    if (p.includes('intermediate'))  return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    if (p.includes('ultrarapid'))    return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
    if (p.includes('rapid'))         return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Dna className="w-4 h-4" />
          Metabolism Insight
        </h3>
      </div>

      <div className="p-5">
        <div className="grid gap-3">
          {profiles.map((g, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50
                         border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30
                                flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-700 dark:text-primary-400 font-mono">
                    {g.gene}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {g.gene}{g.drug ? ` — ${g.drug}` : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {g.diplotype || 'Unknown diplotype'}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${phenotypeColor(g.phenotype)}`}>
                {g.phenotype || 'Unknown'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
