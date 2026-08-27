const API_BASE = 'http://localhost:8000/api';

export async function fetchHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, using local state:', err);
    return null;
  }
}

export async function fetchAllRecords() {
  try {
    const res = await fetch(`${API_BASE}/data/records`);
    if (!res.ok) throw new Error('Failed to fetch records');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchAllMasters() {
  try {
    const res = await fetch(`${API_BASE}/data/masters`);
    if (!res.ok) throw new Error('Failed to fetch masters');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchAdjudicationQueue() {
  try {
    const res = await fetch(`${API_BASE}/agent1/queue`);
    if (!res.ok) throw new Error('Failed to fetch queue');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function submitAdjudication(adjudicationId: string, action: 'APPROVE' | 'REJECT', modifiedDescription?: string, modifiedGrade?: string) {
  try {
    const res = await fetch(`${API_BASE}/agent1/adjudicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adjudicationId,
        action,
        modifiedDescription,
        modifiedGrade,
      }),
    });
    if (!res.ok) throw new Error('Failed to adjudicate');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function runSourcingSimulation(rates: any[], volumeDiscountPercent: number, mseAllocationPercent: number) {
  try {
    const res = await fetch(`${API_BASE}/agent3/sourcing-simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rates,
        volumeDiscountPercent,
        mseAllocationPercent,
      }),
    });
    if (!res.ok) throw new Error('Simulation failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchLedgerBlocks() {
  try {
    const res = await fetch(`${API_BASE}/agent5/ledger`);
    if (!res.ok) throw new Error('Ledger failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function revertDriftAlert(alertId: string) {
  try {
    const res = await fetch(`${API_BASE}/agent5/revert-drift/${alertId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Revert failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDriftAlerts() {
  try {
    const res = await fetch(`${API_BASE}/agent5/drift-alerts`);
    if (!res.ok) throw new Error('Failed to fetch drift alerts');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDuplicateClusters() {
  try {
    const res = await fetch(`${API_BASE}/data/duplicates`);
    if (!res.ok) throw new Error('Failed to fetch duplicates');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function runOCRSpellcheck(rawText: string) {
  try {
    const res = await fetch(`${API_BASE}/agent2/ocr-spellcheck`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });
    if (!res.ok) throw new Error('OCR failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function runLiveMatchEvaluation(localDescription: string, masterNationalCode: string) {
  try {
    const res = await fetch(`${API_BASE}/agent1/evaluate-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localDescription, masterNationalCode }),
    });
    if (!res.ok) throw new Error('Match evaluation failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function uploadCSV(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/data/upload-csv`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export function getExportCSVUrl() {
  return `${API_BASE}/data/export-mapped-csv`;
}
