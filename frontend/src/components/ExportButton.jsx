import { useState } from 'react';
import { FileDown, Copy, Check } from 'lucide-react';

export default function ExportButton({ result }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  const jsonString = JSON.stringify(result, null, 2);

  const handleDownloadJSON = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmaguard_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = jsonString;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const btnClass = `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                 glass-btn text-gray-700 dark:text-gray-300
                 hover:text-gray-900 dark:hover:text-gray-100 transition-colors`;

  return (
    <div className="flex gap-2">
      <button onClick={handleDownloadJSON} className={btnClass} aria-label="Download report as JSON">
        <FileDown className="w-4 h-4" />
        Download JSON
      </button>
      <button onClick={handleCopy} className={btnClass} aria-label="Copy report JSON to clipboard">
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy JSON'}
      </button>
    </div>
  );
}
