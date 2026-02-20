import { useState, useEffect } from 'react';
import { History, ChevronRight, Trash2, AlertCircle, User } from 'lucide-react';
import { fetchHistory, fetchPatientReport, deletePatientReport } from '../api/client';
import { listReportsLocal, getReportLocal, deleteReportLocal } from '../api/localHistory';

const RISK_COLORS = {
  Safe: 'text-green-700',
  'Standard Dose': 'text-green-700',
  'Reduced Effect': 'text-amber-700',
  'Increased Effect': 'text-amber-700',
  'Moderate Sensitivity': 'text-amber-700',
  'Increased Risk': 'text-amber-700',
  'Moderate Toxicity Risk': 'text-amber-700',
  'Adjust Dosage': 'text-amber-700',
  'Toxicity Risk': 'text-orange-700',
  'Reduced Efficacy': 'text-orange-700',
  'Bleeding Risk': 'text-orange-700',
  'High Sensitivity': 'text-red-700',
  'Myopathy Risk': 'text-red-700',
  Ineffective: 'text-red-700',
  Toxic: 'text-red-700',
  'Severe Toxicity Risk': 'text-red-700',
  'Severe Toxicity': 'text-red-700',
  Unknown: 'text-gray-600',
};

export default function PatientHistory({ onLoadReport }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory();
      const serverPatients = data.patients || [];
      if (serverPatients.length > 0) {
        setPatients(serverPatients);
      } else {
        // Fallback to localStorage (works on Vercel where server history is ephemeral)
        setPatients(listReportsLocal());
      }
    } catch {
      // Server unreachable — use localStorage
      setPatients(listReportsLocal());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const handleSelect = async (pid) => {
    try {
      const report = await fetchPatientReport(pid);
      onLoadReport(report);
      setOpen(false);
    } catch {
      // Fallback to localStorage
      const local = getReportLocal(pid);
      if (local) {
        onLoadReport(local);
        setOpen(false);
      } else {
        setError(`Could not load ${pid}`);
      }
    }
  };

  const handleDelete = async (e, pid) => {
    e.stopPropagation();
    deleteReportLocal(pid);
    try {
      await deletePatientReport(pid);
    } catch { /* server may not have it */ }
    setPatients((prev) => prev.filter((p) => p.patient_id !== pid));
  };

  return (
    <div className="relative z-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="View patient history"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                   glass-btn text-gray-700 dark:text-gray-300 transition-colors"
      >
        <History className="w-4 h-4" />
        History
        {patients.length > 0 && !open && (
          <span className="ml-1 text-[10px] bg-primary-600 text-white rounded-full px-1.5 py-0.5 leading-none">
            {patients.length}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 rounded-2xl glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Patient Reports
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {patients.length} record{patients.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading && (
            <div className="px-5 py-6 text-center text-sm text-gray-400 dark:text-gray-500">Loading…</div>
          )}

          {error && (
            <div className="px-5 py-3 flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {!loading && patients.length === 0 && !error && (
            <div className="px-5 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
            </div>
          )}

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {patients.map((p) => (
              <button
                key={p.patient_id}
                onClick={() => handleSelect(p.patient_id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                aria-label={`Load report for ${p.patient_id}`}
              >
                <div className="shrink-0 w-9 h-9 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <User className="w-4.5 h-4.5 text-primary-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 font-mono">
                      {p.patient_id}
                    </span>
                    <span className="text-[10px] bg-primary-500/15 text-primary-400 rounded-full px-2 py-0.5 font-semibold">
                      {p.drugs?.length || 0} drug{(p.drugs?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {p.drugs?.map((drug, i) => {
                      const label = p.risk_labels?.[i] || 'Unknown';
                      const color = RISK_COLORS[label] || RISK_COLORS.Unknown;
                      return (
                        <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-1">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{drug}</span>
                          <span className={`font-bold ${color}`}>· {label}</span>
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {p.timestamp && new Date(p.timestamp).toLocaleDateString()}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={(e) => handleDelete(e, p.patient_id)}
                    className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
