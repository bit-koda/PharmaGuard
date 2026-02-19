import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { MAX_FILE_SIZE } from '../constants';

export default function FileUpload({ file, setFile }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (f) => {
    setError(null);
    if (!f) return;
    if (!(f.name.endsWith('.vcf') || f.name.endsWith('.txt'))) {
      setError('Only .vcf files are accepted');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError(`File exceeds 5 MB limit (${(f.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload VCF file. Click or drag and drop."
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all
          ${dragOver
            ? 'border-primary-500 bg-primary-500/10 scale-[1.01]'
            : file
              ? 'border-green-400/50 bg-green-500/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400/40 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".vcf,.txt"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400 truncate max-w-[250px]">
                {file.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                aria-label="Remove file"
                className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <X className="w-5 h-5 text-red-500" />
              </button>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            <p className="text-base text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                Click to upload
              </span>{' '}
              or drag &amp; drop
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
            </p>
          </div>
        )}
      </div>

      {/* Error / size indicator */}
      {error && (
        <div className="flex items-center gap-2 text-sm font-medium text-red-600" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
