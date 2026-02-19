import RiskBadge from './RiskBadge';
import { ShieldCheck, AlertTriangle, Dna, BookOpen } from 'lucide-react';

function worstLabel(labels) {
  const priority = [
    'Severe Toxicity', 'Severe Toxicity Risk', 'Toxic',
    'Myopathy Risk', 'High Sensitivity', 'Bleeding Risk',
    'Reduced Efficacy', 'Ineffective', 'Toxicity Risk',
    'Moderate Toxicity Risk', 'Increased Risk', 'Moderate Sensitivity',
    'Increased Effect', 'Reduced Effect', 'Adjust Dosage',
    'Unknown', 'Standard Dose', 'Safe',
  ];
  for (const p of priority) if (labels.includes(p)) return p;
  return 'Unknown';
}

/** Extract per-drug structured data including recommendation, explanation */
function extractDrugData(result) {
  // Handle array response (multi-drug), single object, or old format with results array
  const entries = Array.isArray(result) ? result : Array.isArray(result?.results) ? result.results : result?.drug ? [result] : [];

  return entries.map((r) => {
    const profile = r['pharmacogenomic profile'] || {};
    const risk = r['risk assessment'] || {};
    const rec = r['clinical recommendation'];
    const recText = typeof rec === 'string' ? rec : rec?.action || null;
    const explanation = r['llm generated explanation'];
    const primaryGene = profile['primary gene'];

    const genes = primaryGene
      ? [{
          gene: primaryGene,
          diplotype: profile.diplotype || 'Unknown',
          phenotype: profile.phenotype || 'Unknown',
          variants: (profile.detected_variants || [])
            .filter(v => v.gene === primaryGene)
            .map(v => ({ rsid: v.rsid, star: v.star, genotype: v.genotype })),
        }]
      : [];

    return {
      drug: r.drug || 'Unknown',
      risk_label: risk['risk label'] || 'Unknown',
      confidence: risk.confidence_score,
      severity: risk.severity,
      recommendation: recText,
      explanation,
      source: null,
      coverage: null,
      genes,
    };
  });
}

function Row({ label, value, mono, badge }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium capitalize">{label}</span>
      {badge
        ? <RiskBadge level={value} />
        : <span className={`text-sm font-medium text-gray-800 dark:text-gray-200 ${mono ? 'font-mono' : ''}`}>{value}</span>
      }
    </div>
  );
}

function ExplainBlock({ explanation }) {
  if (!explanation) return null;
  if (typeof explanation === 'string') {
    return <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{explanation}</p>;
  }
  return (
    <div className="space-y-3">
      {explanation.summary && <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{explanation.summary}</p>}
      {explanation.mechanism && (
        <div>
          <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 tracking-wide">Mechanism</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{explanation.mechanism}</p>
        </div>
      )}
      {explanation.recommendation_rationale && (
        <div>
          <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 tracking-wide">Rationale</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{explanation.recommendation_rationale}</p>
        </div>
      )}

    </div>
  );
}

export default function RiskAnalysis({ result }) {
  const drugData = extractDrugData(result);
  const overall = worstLabel(drugData.map(d => d.risk_label));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
        </h2>
        <RiskBadge level={overall} />
      </div>

      <div className="flex flex-nowrap gap-5 overflow-x-auto pb-2">
      {drugData.map((d, idx) => (
        <article
          key={idx}
          aria-label={`${d.drug} analysis`}
          className="rounded-2xl glass-card overflow-hidden transition-all duration-200 min-w-[320px] max-w-[520px] w-[420px] flex-shrink-0"
        >
          {/* Drug header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">{d.drug}</h3>
            <RiskBadge level={d.risk_label} />
          </div>

          <div className="px-5 py-5 space-y-2">
            <Row label="risk" value={d.risk_label} badge />
            <Row label="severity" value={d.severity || 'N/A'} />
            <Row label="confidence" value={d.confidence != null ? `${(d.confidence * 100).toFixed(0)}%` : 'N/A'} />
            {d.source && <Row label="source" value={d.source} />}

            {/* Per-gene sections */}
            {d.genes.map((g, gi) => (
              <div key={gi} className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <p className="text-sm font-mono font-bold text-primary-600 dark:text-primary-400 mb-1.5">{g.gene}</p>
                <Row label="diplotype" value={g.diplotype} mono />
                <Row label="phenotype" value={g.phenotype} />

                {g.variants.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Variants</p>
                    <div className="space-y-1.5">
                      {g.variants.map((v, vi) => (
                        <div key={vi} className="flex items-center gap-3 text-sm font-mono bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{v.rsid}</span>
                          {v.star && <span className="text-primary-600 dark:text-primary-400 font-bold">{v.star}</span>}
                          {v.genotype && <span className="text-gray-500 dark:text-gray-400">{v.genotype}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Gene Coverage Warning */}
            {d.coverage && d.coverage.missing_genes?.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700" role="alert">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Coverage Warning</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.coverage.required_genes.map((gene) => {
                    const present = d.coverage.present_genes?.includes(gene);
                    return (
                      <span
                        key={gene}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold
                          ${present
                            ? 'bg-green-500/15 text-green-600 border border-green-500/20'
                            : 'bg-red-500/15 text-red-600 border border-red-500/20'
                          }`}
                      >
                        <Dna className="w-3.5 h-3.5" />
                        {gene}
                        {present ? ' \u2713' : ' \u2717'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {d.recommendation && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Recommendation</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{d.recommendation}</p>
              </div>
            )}

            {/* AI Explanation */}
            {d.explanation && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary-500" />
                  <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">AI Explanation</p>
                </div>
                <ExplainBlock explanation={d.explanation} />
              </div>
            )}
          </div>
        </article>
      ))}
      </div>

      {drugData.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No data available.</p>
      )}
    </div>
  );
}
