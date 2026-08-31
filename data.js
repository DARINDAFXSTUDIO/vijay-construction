// =========================================================================
// 🏗️ VIJAY CONSTRUCTION - CENTRAL DATABASE & REPORTING ENGINE (data.js)
// =========================================================================

const MASTER_DB_KEY = 'vijay_subadmin_master_v5';
const PERSISTENT_DB_URL = "https://vijay-construction-50c0f-default-rtdb.firebaseio.com/master_db.json";

// Default Master Template with Delhi NCR Site Coordinates & Full Schema
const defaultMasterDB = {
  projects: [
    { id: 'P1', client: 'Sharma Ji', name: 'Flat 309 (Dilshad Garden)', lat: 28.6758, lng: 77.3214, totalValue: 500000, received: 180000, progress: 65, phase: 'Plaster & Electrical Piping' },
    { id: 'P2', client: 'Gupta Ji', name: 'Villa 12 (Shahdara)', lat: 28.6692, lng: 77.2915, totalValue: 1200000, received: 400000, progress: 35, phase: 'Brickwork & Conduit Wiring' }
  ],
  suppliers: [
    { id: 'SUP1', name: 'Gupta Building Material', phone: '9811000005', category: 'Cement & Masonry', totalPurchased: 45000, totalPaid: 25000 },
    { id: 'SUP2', name: 'Aggarwal Hardware & Tools', phone: '9811000006', category: 'Hardware & Tools', totalPurchased: 18500, totalPaid: 10000 },
    { id: 'SUP3', name: 'Sharma Paint & Sanitary', phone: '9811000007', category: 'Paint & Plumbing', totalPurchased: 32000, totalPaid: 32000 }
  ],
  supplierBills: [
    { id: 'BILL1', supplierId: 'SUP1', site: 'P1', item: '50 Bags Ultratech Cement', billNo: 'INV-102', amount: 19500, date: '2026-08-25' },
    { id: 'BILL2', supplierId: 'SUP1', site: 'P1', item: '200 Ft Rodi & Badarpur', billNo: 'INV-109', amount: 25500, date: '2026-08-28' },
    { id: 'BILL3', supplierId: 'SUP2', site: 'P2', item: 'Cutting Blades, Screws & PVC Pipes', billNo: 'INV-441', amount: 18500, date: '2026-08-27' }
  ],
  supplierPayments: [
    { id: 'SPAY1', supplierId: 'SUP1', amount: 25000, mode: 'UPI', note: 'Part payment for INV-102', date: '2026-08-29' },
    { id: 'SPAY2', supplierId: 'SUP2', amount: 10000, mode: 'Cash', note: 'Field Cash Handover', date: '2026-08-28' },
    { id: 'SPAY3', supplierId: 'SUP3', amount: 32000, mode: 'Bank', note: 'Full Settlement', date: '2026-08-26' }
  ],
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

// 1. DATA SYNC (CLOUD REALTIME DATABASE + LOCAL FALLBACK)
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
    console.warn("Cloud DB fetch fallback to cache:", err.message);
  }

  const local = localStorage.getItem(MASTER_DB_KEY);
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }

  localStorage.setItem(MASTER_DB_KEY, JSON.stringify(defaultMasterDB));
  return defaultMasterDB;
}

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

// 2. 📍 GPS HAVERSINE DISTANCE HELPER (In Meters)
function calculateGPSDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// 3. WAGES & FINANCIAL CALCULATIONS
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

// 4. SUPPLIER KHATA CALCULATIONS
function calcSupplierBalance(db, supId) {
  const sup = (db.suppliers || []).find(s => (typeof s === 'object' ? s.id : s) === supId);
  if (!sup || typeof sup !== 'object') return { totalPurchased: 0, totalPaid: 0, balanceDue: 0, billsCount: 0, paymentsCount: 0 };

  const bills = (db.supplierBills || []).filter(b => b.supplierId === supId);
  const payments = (db.supplierPayments || []).filter(p => p.supplierId === supId);

  const totalPurchased = bills.reduce((acc, b) => acc + Number(b.amount || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const balanceDue = Math.max(0, totalPurchased - totalPaid);

  return { totalPurchased, totalPaid, balanceDue, billsCount: bills.length, paymentsCount: payments.length };
}

// 5. WHATSAPP PARCHA GENERATORS
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

function generateSupplierWhatsAppSlip(sup, db) {
  const fin = calcSupplierBalance(db, sup.id);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return encodeURIComponent(
`*📦 VIJAY CONSTRUCTION - SUPPLIER KHATA PARCHA*
---------------------------------------
🏬 *Supplier:* ${sup.name}
📂 *Category:* ${sup.category || 'Building Material'}
📅 *Statement Date:* ${dateStr}
---------------------------------------
🛒 *Total Purchases Logged:* ₹${fin.totalPurchased.toLocaleString('en-IN')} (${fin.billsCount} Bills)
💳 *Total Payment Released:* ₹${fin.totalPaid.toLocaleString('en-IN')} (${fin.paymentsCount} Txns)
---------------------------------------
🔴 *NET OUTSTANDING DUE (बाकी): ₹${fin.balanceDue.toLocaleString('en-IN')}*
---------------------------------------
_Account Managed by: Vijay Sir • Dilshad Garden, Delhi_`
  );
}

// 6. 1-CLICK EXCEL / CSV EXPORTS
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
  csv += "Worker ID,Name,Role,Assigned Site,Daily Rate (Rs),Total Shifts (Days),OT Pay (Rs),Gross Earned (Rs),Advance Cut (Rs),Saturday Net Payable (Rs),Phone\n";

  workers.forEach(w => {
    const siteName = getProjectDetails(db, w.site).name.replace(/,/g, ' ');
    const shifts = calcWorkerShifts(w);
    const otPay = calcWorkerOTPay(w);
    const regularPay = shifts * (w.rate || 0);
    const gross = regularPay + otPay + (w.bakaaya || 0);
    const netDue = Math.max(0, gross - (w.advance || 0));
    csv += `"${w.id}","${w.name}","${w.role}","${siteName}",${w.rate},${shifts},${otPay},${gross},${w.advance || 0},${netDue},"${w.phone}"\n`;
  });

  downloadCSVFile(csv, `Vijay_Construction_Labour_Report_${dateStr}.csv`);
}

function exportSupplierReportCSV(db) {
  const suppliers = db.suppliers || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - SUPPLIER & VENDOR KHATA REPORT\n";
  csv += `Generated Date,${dateStr}\n\n`;
  csv += "Supplier ID,Supplier Name,Category,Mobile Number,Total Purchased (Rs),Total Paid (Rs),Outstanding Balance (Rs)\n";

  suppliers.forEach(s => {
    const supObj = typeof s === 'object' ? s : { id: s, name: s, phone: 'N/A', category: 'General' };
    const fin = calcSupplierBalance(db, supObj.id);
    csv += `"${supObj.id}","${supObj.name}","${supObj.category || 'General'}","${supObj.phone || ''}",${fin.totalPurchased},${fin.totalPaid},${fin.balanceDue}\n`;
  });

  downloadCSVFile(csv, `Vijay_Construction_Supplier_Khata_${dateStr}.csv`);
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
  csv += "Project ID,Client Name,Site Name,Contract Value (Rs),Inward Received (Rs),Total Cost (Rs),Net Profit (Rs),Net Margin (%)\n";

  projects.forEach(p => {
    const fin = calcProjectMargin(db, p.id);
    csv += `"${p.id}","${p.client.replace(/,/g, ' ')}","${p.name.replace(/,/g, ' ')}",${fin.contractValue},${fin.inwardReceived},${fin.totalCost},${fin.netProfit},${fin.profitMarginPct}%\n`;
  });

  downloadCSVFile(csv, `Vijay_Construction_Project_Margins_${dateStr}.csv`);
}