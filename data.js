const MASTER_DB_KEY = 'vijay_subadmin_master_v5';

// 1. Cloud Se Fresh Data Lena
async function getCloudMasterDB() {
  try {
    const res = await fetch('/api/sync', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.workers) {
        localStorage.setItem(MASTER_DB_KEY, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn("Using local cache...", err);
  }

  const local = localStorage.getItem(MASTER_DB_KEY);
  if (local) return JSON.parse(local);
  return defaultMasterDB;
}

// 2. Cloud Par Data Save Karna
async function saveCloudMasterDB(data) {
  if (!data) return;
  localStorage.setItem(MASTER_DB_KEY, JSON.stringify(data));

  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn("Cloud save error:", err);
  }
}

// 3. Calculation Helpers
function calcWorkerShifts(w) {
  if (!w || !w.att) return 0;
  return Object.values(w.att).reduce((acc, v) => acc + ((v.status || v) === 'P' ? 1 : ((v.status || v) === 'HD' ? 0.5 : 0)), 0);
}

function calcWorkerOTPay(w) {
  if (!w || !w.att) return 0;
  return Object.values(w.att).reduce((acc, v) => acc + ((v.ot || 0) * (w.otRate || 100)), 0);
}

function calcWorkerDue(w) {
  if (!w) return 0;
  const earned = (calcWorkerShifts(w) * (w.rate || 0)) + calcWorkerOTPay(w) + (w.bakaaya || 0);
  return Math.max(0, earned - (w.advance || 0));
}

function getProjectDetails(db, projectId) {
  if (!db || !db.projects) return { name: 'General Site', client: 'Client' };
  return db.projects.find(p => p.id === projectId) || { name: 'General Site', client: 'Client' };
}