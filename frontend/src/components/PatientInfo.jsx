import { User, Calendar, Pill, Dna, FileText } from 'lucide-react';

export default function PatientInfo({ result }) {
  if (!result) return null;

  const isArray = Array.isArray(result);
  const firstResult = isArray ? result[0] : result;
  const patientId = firstResult?.patient_id || 'Unknown';
  const timestamp = firstResult?.timestamp ? new Date(firstResult.timestamp).toLocaleString() : 'N/A';

  // Collect drugs
  const drugs = isArray
    ? result.map((r) => r.drug).filter(Boolean)
    : result?.drug
      ? [result.drug]
      : [];

  // Collect detected genes and variants
  const entries = isArray ? result : [result];
  const detectedGenes = (() => {
    const genes = new Set();
    for (const r of entries) {
      const pgx = r['pharmacogenomic profile'];
      const primaryGene = pgx?.['primary gene'];
      if (primaryGene) genes.add(primaryGene);
      if (pgx?.detected_variants) {
        for (const v of pgx.detected_variants) {
          if (v.gene) genes.add(v.gene);
        }
      }
    }
    return [...genes].sort();
  })();

  // Calculate total variants
  const totalVariants = (() => {
    const variants = new Set();
    for (const r of entries) {
      const pgx = r['pharmacogenomic profile'];
      if (pgx?.detected_variants) {
        for (const v of pgx.detected_variants) {
          const key = v.rsid || `${v.gene}:${v.star}:${v.genotype}`;
          variants.add(key);
        }
      }
    }
    return variants.size;
  })();

  return (
    <section aria-label="Patient information" className="rounded-2xl glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-500/15 flex items-center justify-center">
          <User className="w-4 h-4 text-primary-500" />
        </div>
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Patient Information
        </h2>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Patient ID */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Patient ID</span>
            </div>
            <p className="text-sm font-bold font-mono text-gray-900">{patientId}</p>
          </div>

          {/* Timestamp */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Analyzed On</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{timestamp}</p>
          </div>

          {/* Drugs Analyzed */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Pill className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Drugs</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {drugs.length > 0
                ? drugs.map((d) => (
                    <span key={d} className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-500/15 text-primary-700 border border-primary-500/20">
                      {d}
                    </span>
                  ))
                : <span className="text-sm text-gray-400">None</span>
              }
            </div>
          </div>

          {/* Variants / Genes */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Dna className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Genomic Data</span>
            </div>
            <p className="text-sm text-gray-900">
              <span className="font-bold">{totalVariants}</span>
              <span className="text-gray-500"> variants</span>
              {detectedGenes.length > 0 && (
                <>
                  <span className="text-gray-300 mx-1">·</span>
                  <span className="font-bold">{detectedGenes.length}</span>
                  <span className="text-gray-500"> genes</span>
                </>
              )}
            </p>
            {detectedGenes.length > 0 && (
              <p className="text-xs font-mono text-gray-500">{detectedGenes.join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
