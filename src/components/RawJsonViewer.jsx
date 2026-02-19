import { useState } from 'react';
import { Code, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function RawJsonViewer({ result }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const jsonString = JSON.stringify(result, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <section aria-label="Raw JSON data" className="rounded-2xl glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-500/15 flex items-center justify-center">
            <Code className="w-4 h-4 text-primary-500" />
          </div>
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Raw JSON Response
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* JSON Content */}
      {isExpanded && (
        <div className="p-5 bg-gray-900 dark:bg-black">
          <div className="relative">
            <pre className="text-xs sm:text-sm font-mono text-gray-100 overflow-x-auto p-4 rounded-lg bg-gray-950 border border-gray-800">
              <code className="language-json">{jsonString}</code>
            </pre>
          </div>
          
          {/* Simple explanation */}
          <div className="mt-4 p-4 rounded-lg bg-blue-900/20 border border-blue-700/30">
            <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
              Understanding the JSON Response
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-mono mt-0.5">•</span>
                <span><code className="text-blue-300 font-mono">patient_id</code> - Extracted from VCF file header</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-mono mt-0.5">•</span>
                <span><code className="text-blue-300 font-mono">drug</code> - Medication being analyzed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-mono mt-0.5">•</span>
                <span><code className="text-blue-300 font-mono">risk assessment</code> - Risk classification (Safe, Moderate, High)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-mono mt-0.5">•</span>
                <span><code className="text-blue-300 font-mono">pharmacogenomic profile</code> - Genetic variants detected (diplotype, phenotype)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-mono mt-0.5">•</span>
                <span><code className="text-blue-300 font-mono">clinical recommendation</code> - Dosing guidance based on genetics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-mono mt-0.5">•</span>
                <span><code className="text-blue-300 font-mono">llm generated explanation</code> - AI-powered interpretation of results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-mono mt-0.5">•</span>
                <span><code className="text-blue-300 font-mono">quality_metrics</code> - VCF file parsing status</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
