/**
 * PharmaGuard API client
 * Talks to FastAPI backend at POST /analyze
 */

const API_BASE = ''; // proxy handled by Vite dev server

/**
 * Analyze a VCF file against selected drugs.
 * @param {File} vcfFile   – the .vcf file from <input type="file">
 * @param {string[]} drugs – array of drug names e.g. ["CODEINE","WARFARIN"]
 * @param {string|null} patientId – optional patient id; auto-generated if null
 * @returns {Promise<object>} – parsed JSON response from the backend
 */
export async function analyzeVCF(vcfFile, drugs, patientId = null, onProgress = null) {
  const form = new FormData();
  form.append('file', vcfFile);
  form.append('drugs', drugs.join(','));
  if (patientId) form.append('patient_id', patientId);

  // Use streaming only on localhost (dev); Vercel serverless buffers SSE
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const useStream = onProgress && isLocal;
  const endpoint = useStream ? `${API_BASE}/analyze/stream` : `${API_BASE}/analyze`;

  if (onProgress && !isLocal) {
    onProgress('Analyzing — this may take a moment…');
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.detail || body.message || `Server error ${res.status}`;
    throw new Error(msg);
  }

  if (!useStream) return res.json();

  // Parse SSE stream
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE lines
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === 'progress') {
          onProgress(event.step);
        } else if (event.type === 'result') {
          result = event.data;
        }
      } catch { /* skip malformed lines */ }
    }
  }

  if (!result) throw new Error('No result received from server');
  return result;
}

/**
 * Fetch history list (metadata only).
 */
export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
}

/**
 * Fetch a single patient report.
 */
export async function fetchPatientReport(patientId) {
  const res = await fetch(`${API_BASE}/history/${encodeURIComponent(patientId)}`);
  if (!res.ok) throw new Error(`Patient ${patientId} not found`);
  return res.json();
}

/**
 * Delete a patient report.
 */
export async function deletePatientReport(patientId) {
  const res = await fetch(`${API_BASE}/history/${encodeURIComponent(patientId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete ${patientId}`);
  return res.json();
}
