// =========================================================================
// 🌐 FRONTEND API CONNECTOR & PHASE 3 REPORTING ENGINE (data.js)
// =========================================================================

const API_AUTH = '/api/auth';
const API_WORKER = '/api/worker';
const API_ADMIN = '/api/admin';

// 1. API CALLS
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

// 2. FINANCIAL & WAGE CALCULATION HELPERS
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

// 3. PHASE 3: PROJECT-WISE PROFIT MARGIN ENGINE
function calcProjectMargin(db, projectId) {
  const project = (db.projects || []).find(p => p.id === projectId) || { totalValue: 0, received: 0, name: 'Site' };
  const inward = Number(project.received || 0);

  // A. Material & Direct Site Expenses from Ledger
  const siteLedger = (db.ledger || []).filter(l => l.site === projectId && l.type === 'expense');
  const materialAndDirectExp = siteLedger.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // B. Labour Cost on this site
  const siteWorkers = (db.workers || []).filter(w => w.site === projectId);
  const labourCost = siteWorkers.reduce((sum, w) => sum + (calcWorkerShifts(w) * w.rate) + calcWorkerOTPay(w), 0);

  // C. Thekedar Cost on this site
  const siteThekedars = (db.thekedars || []).filter(t => t.site === projectId || (t.work && t.work.includes(project.name)));
  const thekedarCost = siteThekedars.reduce((sum, t) => sum + Number(t.paid || 0), 0);

  const totalCost = materialAndDirectExp + labourCost + thekedarCost;
  const netProfit = inward - totalCost;
  const profitMarginPct = inward > 0 ? Math.round((netProfit / inward) * 100) : 0;
  const isLoss = netProfit < 0;

  return {
    contractValue: Number(project.totalValue || 0),
    inwardReceived: inward,
    materialExpense: materialAndDirectExp,
    labourExpense: labourCost,
    thekedarExpense: thekedarCost,
    totalCost,
    netProfit,
    profitMarginPct,
    isLoss,
    dueFromClient: Math.max(0, Number(project.totalValue || 0) - inward)
  };
}

// 4. PHASE 3: FORMATTED WHATSAPP WEEKLY PARCHA GENERATOR
function generateWorkerWhatsAppSlip(w, siteName) {
  const shifts = calcWorkerShifts(w);
  const otPay = calcWorkerOTPay(w);
  const earned = shifts * (w.rate || 0);
  const gross = earned + otPay + (w.bakaaya || 0);
  const advance = w.advance || 0;
  const netPayable = Math.max(0, gross - advance);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return encodeURIComponent(
`*🔨 VIJAY CONSTRUCTION - HAFTAWRI SLIP*
---------------------------------------
👤 *Worker Name:* ${w.name} (${w.role})
📍 *Site:* ${siteName}
📅 *Date:* ${dateStr}
---------------------------------------
✅ *Total Shifts:* ${shifts} Din (Rate: ₹${w.rate}/D)
💰 *Shift Wages:* ₹${earned.toLocaleString('en-IN')}
⏱️ *OT Pay:* +₹${otPay.toLocaleString('en-IN')}
${w.bakaaya > 0 ? `⏮️ *Pichhla Bakaaya:* +₹${w.bakaaya.toLocaleString('en-IN')}\n` : ''}💵 *Gross Total:* ₹${gross.toLocaleString('en-IN')}
🔻 *Advance Cut (खर्ची):* -₹${advance.toLocaleString('en-IN')}
---------------------------------------
🟢 *SATURDAY NET PAYABLE: ₹${netPayable.toLocaleString('en-IN')}*
---------------------------------------
_Verified & Approved by: Vijay Sir_`
  );
}