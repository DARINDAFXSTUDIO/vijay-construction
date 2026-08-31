// =========================================================================
// 🌐 FRONTEND API CONNECTOR & CALCULATION UTILITIES
// =========================================================================

const API_AUTH = '/api/auth';
const API_WORKER = '/api/worker';
const API_ADMIN = '/api/admin';

// 1. AUTHENTICATION CALLS
async function apiLoginAdmin(adminPin) {
  const res = await fetch(API_AUTH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'admin_login', adminPin })
  });
  return await res.json();
}

async function apiLoginWorker(phone, pin) {
  const res = await fetch(API_AUTH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'worker_login', phone, pin })
  });
  return await res.json();
}

// 2. SCOPED WORKER DATA & ACTIONS
async function apiGetWorkerPortal(workerId) {
  const res = await fetch(`${API_WORKER}?workerId=${workerId}`, { cache: 'no-store' });
  return await res.json();
}

async function apiWorkerAction(action, workerId, payload) {
  const res = await fetch(API_WORKER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, workerId, payload })
  });
  return await res.json();
}

// 3. ADMIN OPERATIONS
async function apiGetAdminData() {
  const res = await fetch(API_ADMIN, { cache: 'no-store' });
  return await res.json();
}

async function apiAdminAction(action, payload) {
  const res = await fetch(API_ADMIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  });
  return await res.json();
}

// 4. CALCULATION HELPERS
function calcWorkerShifts(w) {
  if (!w || !w.att) return 0;
  return Object.values(w.att).reduce((acc, v) => {
    const status = typeof v === 'object' ? v.status : v;
    return acc + (status === 'P' ? 1.0 : (status === 'HD' ? 0.5 : 0));
  }, 0);
}

function calcWorkerOTPay(w) {
  if (!w || !w.att) return 0;
  const otRate = w.otRate || 100;
  return Object.values(w.att).reduce((acc, v) => {
    const ot = typeof v === 'object' ? (v.ot || 0) : 0;
    return acc + (ot * otRate);
  }, 0);
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
