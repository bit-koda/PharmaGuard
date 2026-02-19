import { Loader2 } from 'lucide-react';

export default function LoadingState({ status }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4" role="status" aria-label="Analyzing">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      <p className="text-base font-medium text-gray-500 dark:text-gray-400 transition-all duration-300">
        {status || 'Starting analysis…'}
      </p>
    </div>
  );
}
