import { Beaker } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center">
        <Beaker className="w-8 h-8 text-primary-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Upload a VCF &amp; select drugs
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
          Analyze genomic variants for drug compatibility using CPIC guidelines.
        </p>
      </div>
    </div>
  );
}
