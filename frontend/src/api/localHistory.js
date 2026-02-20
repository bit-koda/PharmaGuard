const STORAGE_KEY = 'pharmaguard_history';
const MAX_REPORTS = 50;

function _read() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function _write(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, MAX_REPORTS)));
}

export function saveReportLocal(report) {
  const entries = Array.isArray(report) ? report : [report];
  const first = entries[0] || {};
  const pid = first.patient_id || `LOCAL_${Date.now()}`;

  const record = {
    patient_id: pid,
    timestamp: first.timestamp || new Date().toISOString(),
    drugs: entries.map((r) => r.drug).filter(Boolean),
    risk_labels: entries.map((r) => r['risk assessment']?.['risk label'] || 'Unknown'),
    report,
  };

  const reports = _read().filter((r) => r.patient_id !== pid);
  reports.unshift(record);
  _write(reports);
}

export function listReportsLocal() {
  return _read().map(({ patient_id, timestamp, drugs, risk_labels }) => ({
    patient_id,
    timestamp,
    drugs,
    risk_labels,
  }));
}

export function getReportLocal(patientId) {
  const found = _read().find((r) => r.patient_id === patientId);
  return found ? found.report : null;
}

export function deleteReportLocal(patientId) {
  const reports = _read().filter((r) => r.patient_id !== patientId);
  _write(reports);
}
