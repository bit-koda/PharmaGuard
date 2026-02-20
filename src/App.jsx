import { useState } from 'react';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import DrugInput from './components/DrugInput';
import RiskAnalysis from './components/RiskAnalysis';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';
import ExportButton from './components/ExportButton';
import PatientHistory from './components/PatientHistory';
import PatientInfo from './components/PatientInfo';
import RawJsonViewer from './components/RawJsonViewer';
import { analyzeVCF } from './api/client';
import { saveReportLocal } from './api/localHistory';
import { Send, RotateCcw } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);

  const canSubmit = file && selectedDrugs.length > 0 && !loading;

  const handleAnalyze = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStatus('Starting analysis…');
    try {
      const data = await analyzeVCF(file, selectedDrugs, null, (step) => setStatus(step));
      setResult(data);
      saveReportLocal(data);
      setHistoryKey((k) => k + 1);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleReset = () => {
    setFile(null);
    setSelectedDrugs([]);
    setResult(null);
    setError(null);
  };

  const handleLoadReport = (report) => {
    setResult(report);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 glass-bg transition-colors duration-300">
      <div className="glass-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Navbar />

      <main id="main-content" className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8 space-y-6 ${!result && !loading ? 'min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center' : ''}`}>
        {/* ─── Input Section (centered, hidden when report is showing) ── */}
        {!result && !loading && (
          <section aria-label="Upload and drug selection" className="relative z-20 w-full max-w-xl rounded-2xl glass-card p-6 sm:p-8 space-y-6">
            <FileUpload file={file} setFile={setFile} />
            <DrugInput selectedDrugs={selectedDrugs} setSelectedDrugs={setSelectedDrugs} />

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAnalyze}
                disabled={!canSubmit}
                aria-label="Analyze VCF file"
                className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-semibold transition-all
                  ${canSubmit
                    ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98] shadow-lg shadow-primary-500/25'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
              >
                <Send className="w-5 h-5" />
                Analyze
              </button>
              <button
                onClick={handleReset}
                aria-label="Reset form"
                title="Reset"
                className="px-4 py-3 rounded-xl text-sm glass-btn
                           text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}

        {/* ─── Patient History (hidden when report is showing) ── */}
        {!result && !loading && (
          <PatientHistory key={historyKey} onLoadReport={handleLoadReport} />
        )}

        {/* ─── Results Section ────────────────────────────── */}
        {loading && <LoadingState status={status} />}
        {error && <ErrorState message={error} onRetry={handleAnalyze} />}

        {result && !loading && (
          <>
            <div className="flex items-center justify-end flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <ExportButton result={result} />
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                             glass-btn text-gray-700 dark:text-gray-300
                             hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Analysis
                </button>
              </div>
            </div>

            <PatientInfo result={result} />
            <RiskAnalysis result={result} />
            <RawJsonViewer result={result} />
          </>
        )}
      </main>

    </div>
  );
}

export default App;
