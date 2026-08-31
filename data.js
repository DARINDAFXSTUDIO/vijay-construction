// =========================================================================
// 🏗️ VIJAY CONSTRUCTION - CENTRAL DATABASE & REPORTING ENGINE (data.js)
// =========================================================================

const MASTER_DB_KEY = 'vijay_subadmin_master_v5';
const PERSISTENT_DB_URL = "https://vijay-construction-50c0f-default-rtdb.firebaseio.com/master_db.json";

// Default Master Template
const defaultMasterDB = {
  projects: [
    { id: 'P1', client: 'Sharma Ji', name: 'Flat 309 (Dilshad Garden)', totalValue: 500000, received: 180000, progress: 65, phase: 'Plaster & Electrical Piping' },
    { id: 'P2', client: 'Gupta Ji', name: 'Villa 12 (Shahdara)', totalValue: 1200000, received: 400000, progress: 35, phase: 'Brickwork & Conduit Wiring' }
  ],
  suppliers: ["Gupta Building Material", "Aggarwal Hardware", "Sharma Paint & Sanitary"],
  workers: [
    { id: 'W1', name: 'Ramesh Mistri', role: 'Mistri', rate: 800, otRate: 100, site: 'P1', phone: '9811000001', pin: '1234', photo: '', att: {}, advance: 200, advanceList: [{ date: '2026-08-28', amount: 200, reason: 'Field Cash' }], bakaaya: 0, gpsMatch: true },
    { id: 'W2', name: 'Suresh Mazdoor', role: 'Mazdoor', rate: 500, otRate: 65, site: 'P1', phone: '9811000004', pin: '1234', photo: '', att: {}, advance: 100, advanceList: [{ date: '2026-08-28', amount: 100, reason: 'Field Cash' }], bakaaya: 0, gpsMatch: true }
  ],
  thekedars: [
    { id: 'T1', name: 'Raju Electrical Thekedar', phone: '9811000002', pin: '1234', site: 'P2', work: 'Wiring & DB Dressing @ Villa 12', value: 85000, paid: 54200, progress: 60 }
  ],
  materials: [
    { id: 'M1', type: 'material', category: 'Cement & Masonry', item: 'Ultratech PPC Cement (10 Bags)', site: 'P1', supplier: 'Gupta Building Material', requestedBy: 'Ramesh Mistri', time: '09:30 AM', status: 'Pending' }
  ],
  siteProofs: [],
  ledger: [
    { id: 'L1', site: 'P1', type: 'income', amount: 180000, note: 'Sharma Ji Advance (Flat 309)', date: '2026-08-29' }
  ],
  settlements: []
};

// 1. DATA FETCH (CLOUD + LOCAL CACHE FALLBACK)
async function getCloudMasterDB() {
  try {
    const res = await fetch(PERSISTENT_DB_URL, { cache: 'no-store' });
    if (res.ok) {
      const cloudData = await res.json();
      if (cloudData && cloudData.workers) {
        localStorage.setItem(MASTER_DB_KEY, JSON.stringify(cloudData));
        return cloudData;
      }
    }
  } catch (err) {
    console.warn("Cloud DB fetch fallback to local cache:", err.message);
  }

  const local = localStorage.getItem(MASTER_DB_KEY);
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }

  localStorage.setItem(MASTER_DB_KEY, JSON.stringify(defaultMasterDB));
  return defaultMasterDB;
}

// 2. DATA SAVE (PUSH TO CLOUD & CACHE)
async function saveCloudMasterDB(data) {
  if (!data) return;
  localStorage.setItem(MASTER_DB_KEY, JSON.stringify(data));

  try {
    await fetch(PERSISTENT_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error("Cloud DB write failed:", err.message);
  }
}

// 3. CALCULATION HELPERS
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

function calcProjectMargin(db, projectId) {
  const project = (db.projects || []).find(p => p.id === projectId) || { totalValue: 0, received: 0, name: 'Site' };
  const inward = Number(project.received || 0);

  const siteLedger = (db.ledger || []).filter(l => l.site === projectId && l.type === 'expense');
  const materialAndDirectExp = siteLedger.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const siteWorkers = (db.workers || []).filter(w => w.site === projectId);
  const labourCost = siteWorkers.reduce((sum, w) => sum + (calcWorkerShifts(w) * w.rate) + calcWorkerOTPay(w), 0);

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

// 4. 1-CLICK EXCEL / CSV EXPORT UTILITIES
function downloadCSVFile(csvContent, filename) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportLabourReportCSV(db) {
  const workers = db.workers || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  
  let csv = "VIJAY CONSTRUCTION - LABOUR MUSTER & WAGE REPORT\n";
  csv += `Generated Date,${dateStr}\n\n`;
  csv += "Worker ID,Name,Role,Assigned Site,Daily Rate (Rs),Total Shifts (Days),OT Hours,OT Pay (Rs),Gross Earned (Rs),Previous Bakaaya (Rs),Advance Cut (Rs),Saturday Net Payable (Rs),Phone\n";

  workers.forEach(w => {
    const siteName = getProjectDetails(db, w.site).name.replace(/,/g, ' ');
    const shifts = calcWorkerShifts(w);
    const otPay = calcWorkerOTPay(w);
    let otHours = 0;
    Object.values(w.att || {}).forEach(r => {
      otHours += (typeof r === 'object' ? (r.ot || 0) : 0);
    });
    const regularPay = shifts * (w.rate || 0);
    const gross = regularPay + otPay + (w.bakaaya || 0);
    const advance = w.advance || 0;
    const netDue = Math.max(0, gross - advance);

    csv += `"${w.id}","${w.name}","${w.role}","${siteName}",${w.rate},${shifts},${otHours},${otPay},${gross},${w.bakaaya || 0},${advance},${netDue},"${w.phone}"\n`;
  });

  downloadCSVFile(csv, `Vijay_Construction_Labour_Report_${dateStr}.csv`);
}

function exportLedgerReportCSV(db) {
  const ledger = db.ledger || [];
  const dateStr = new Date().toISOString().slice(0, 10);

  let csv = "VIJAY CONSTRUCTION - COMPANY LEDGER & EXPENSE REPORT\n";
  csv += `Generated Date,${dateStr}\n\n`;
  csv += "Entry ID,Date,Site Name,Type,Amount (Rs),Description / Note\n";

  ledger.forEach(item => {
    const siteName = getProjectDetails(db, item.site).name.replace(/,/g, ' ');
    const note = (item.note || '').replace(/,/g, ' ');
    csv += `"${item.id}","${item.date || dateStr}","${siteName}","${item.type.toUpperCase()}",${item.amount},"${note}"\n`;
  });

  downloadCSVFile(csv, `Vijay_Construction_Ledger_Report_${dateStr}.csv`);
}

function exportProjectMarginsCSV(db) {
  const projects = db.projects || [];
  const dateStr = new Date().toISOString().slice(0, 10);

  let csv = "VIJAY CONSTRUCTION - PROJECT MARGINS & COST SUMMARY\n";
  csv += `Generated Date,${dateStr}\n\n`;
  csv += "Project ID,Client Name,Site Name,Contract Value (Rs),Inward Received (Rs),Material Expense (Rs),Labour Expense (Rs),Thekedar Expense (Rs),Total Cost (Rs),Net Profit (Rs),Net Margin (%),Client Recovery Due (Rs)\n";

  projects.forEach(p => {
    const fin = calcProjectMargin(db, p.id);
    const siteName = p.name.replace(/,/g, ' ');
    const client = p.client.replace(/,/g, ' ');

    csv += `"${p.id}","${client}","${siteName}",${fin.contractValue},${fin.inwardReceived},${fin.materialExpense},${fin.labourExpense},${fin.thekedarExpense},${fin.totalCost},${fin.netProfit},${fin.profitMarginPct}%,${fin.dueFromClient}\n`;
  });

  downloadCSVFile(csv, `Vijay_Construction_Project_Margins_${dateStr}.csv`);
}