// =========================================================================
// 🏗️ VIJAY CONSTRUCTION - MEASUREMENT BOOK & CENTRAL ENGINE (data.js)
// =========================================================================

const MASTER_DB_KEY = 'vijay_subadmin_master_v5';
const PERSISTENT_DB_URL = "https://vijay-construction-50c0f-default-rtdb.firebaseio.com/master_db.json";

// Default Master Template with Measurement Book (MB)
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
  supplierBills: [],
  supplierPayments: [],
  thekedars: [
    { id: 'T1', name: 'Raju Electrical Thekedar', phone: '9811000002', pin: '1234', site: 'P2', work: 'Wiring & DB Dressing @ Villa 12', value: 85000, paid: 54200, progress: 60 },
    { id: 'T2', name: 'Manoj Tiles Thekedar', phone: '9811000008', pin: '1234', site: 'P1', work: 'Vitrified Flooring & Bathroom Tiles', value: 45000, paid: 20000, progress: 45 }
  ],
  measurements: [
    { id: 'MB1', thekedarId: 'T2', siteId: 'P1', location: 'Drawing Room Flooring', length: 18.5, width: 14.0, unit: 'Sq.Ft', totalArea: 259, rate: 22, amount: 5698, date: '2026-08-28' },
    { id: 'MB2', thekedarId: 'T2', siteId: 'P1', location: 'Master Bedroom Flooring', length: 15.0, width: 12.0, unit: 'Sq.Ft', totalArea: 180, rate: 22, amount: 3960, date: '2026-08-29' },
    { id: 'MB3', thekedarId: 'T2', siteId: 'P1', location: 'Kitchen Wall Tiles (Dado)', length: 24.0, width: 4.5, unit: 'Sq.Ft', totalArea: 108, rate: 25, amount: 2700, date: '2026-08-30' }
  ],
  thekedarPayments: [
    { id: 'TP1', thekedarId: 'T2', amount: 20000, mode: 'UPI', note: 'Advance against Flooring', date: '2026-08-27' }
  ],
  workers: [
    { id: 'W1', name: 'Ramesh Mistri', role: 'Mistri', rate: 800, otRate: 100, site: 'P1', phone: '9811000001', pin: '1234', photo: '', att: {}, advance: 200, advanceList: [{ date: '2026-08-28', amount: 200, reason: 'Field Cash' }], bakaaya: 0, gpsMatch: true },
    { id: 'W2', name: 'Suresh Mazdoor', role: 'Mazdoor', rate: 500, otRate: 65, site: 'P1', phone: '9811000004', pin: '1234', photo: '', att: {}, advance: 100, advanceList: [{ date: '2026-08-28', amount: 100, reason: 'Field Cash' }], bakaaya: 0, gpsMatch: true }
  ],
  materials: [],
  siteProofs: [],
  ledger: [
    { id: 'L1', site: 'P1', type: 'income', amount: 180000, note: 'Sharma Ji Advance (Flat 309)', date: '2026-08-29' }
  ],
  settlements: []
};

// 1. DATA SYNC
async function getCloudMasterDB() {
  try {
    const res = await fetch(PERSISTENT_DB_URL, { cache: 'no-store' });
    if (res.ok) {
      const cloudData = await res.json();
      if (cloudData && cloudData.thekedars) {
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

// 2. 📐 MEASUREMENT BOOK (MB) CALCULATION ENGINE
function calcThekedarMBStats(db, thekedarId) {
  const t = (db.thekedars || []).find(x => x.id === thekedarId);
  if (!t) return { totalArea: 0, totalMBValue: 0, totalPaid: 0, netDue: 0, entriesCount: 0 };

  const mbEntries = (db.measurements || []).filter(m => m.thekedarId === thekedarId);
  const totalArea = mbEntries.reduce((sum, m) => sum + Number(m.totalArea || 0), 0);
  const totalMBValue = mbEntries.reduce((sum, m) => sum + Number(m.amount || 0), 0);
  
  // Total Paid (Contract based or MB payments)
  const totalPaid = Number(t.paid || 0);
  const effectiveContractVal = totalMBValue > 0 ? totalMBValue : Number(t.value || 0);
  const netDue = Math.max(0, effectiveContractVal - totalPaid);

  return {
    totalArea: Math.round(totalArea * 100) / 100,
    totalMBValue,
    totalPaid,
    netDue,
    entriesCount: mbEntries.length,
    mbEntries
  };
}

// 3. 📲 WHATSAPP MB PARCHA GENERATOR
function generateThekedarMBWhatsAppSlip(t, db) {
  const stats = calcThekedarMBStats(db, t.id);
  const siteName = getProjectDetails(db, t.site).name;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  let itemsListText = '';
  stats.mbEntries.forEach((m, idx) => {
    itemsListText += `${idx + 1}. *${m.location}*\n   📏 ${m.length} × ${m.width} = *${m.totalArea} ${m.unit}* @ ₹${m.rate} = *₹${m.amount.toLocaleString('en-IN')}*\n`;
  });

  if (!itemsListText) {
    itemsListText = `1. *${t.work}* (Lump Sum Contract)\n   💵 Contract Value: ₹${t.value.toLocaleString('en-IN')}\n`;
  }

  return encodeURIComponent(
`*📐 VIJAY CONSTRUCTION - THEKEDAR MB BILL*
---------------------------------------
👤 *Thekedar:* ${t.name}
🔨 *Work:* ${t.work}
📍 *Site:* ${siteName}
📅 *Date:* ${dateStr}
---------------------------------------
*MEASUREMENT DETAILS (नाप-तोल हिसाब):*
${itemsListText}---------------------------------------
📐 *Total Measured Area:* ${stats.totalArea} Sq.Ft
💰 *Total Work Value:* ₹${(stats.totalMBValue || t.value).toLocaleString('en-IN')}
🔻 *Total Paid So Far:* -₹${stats.totalPaid.toLocaleString('en-IN')}
---------------------------------------
🟢 *NET PAYABLE BALANCE (बाकी): ₹${stats.netDue.toLocaleString('en-IN')}*
---------------------------------------
_Verified & Certified by: Vijay Sir_`
  );
}

// 4. 📊 1-CLICK EXCEL MB EXPORT
function exportThekedarMBReportCSV(db) {
  const list = db.measurements || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - THEKEDAR MEASUREMENT BOOK (MB) REPORT\n";
  csv += `Generated Date,${dateStr}\n\n`;
  csv += "Entry ID,Thekedar Name,Site Name,Room / Location,Length (Ft),Width (Ft),Unit,Total Area,Rate (Rs),Total Amount (Rs),Date\n";

  list.forEach(m => {
    const thek = (db.thekedars || []).find(t => t.id === m.thekedarId) || { name: 'Thekedar' };
    const site = getProjectDetails(db, m.siteId).name.replace(/,/g, ' ');
    csv += `"${m.id}","${thek.name}","${site}","${m.location.replace(/,/g, ' ')}",${m.length},${m.width},"${m.unit}",${m.totalArea},${m.rate},${m.amount},"${m.date}"\n`;
  });

  downloadCSVFile(csv, `Vijay_Construction_Thekedar_MB_${dateStr}.csv`);
}

// 5. STANDARD CALCULATION & WAGE UTILITIES
function calcWorkerShifts(w) {
  if (!w || !w.att) return 0;
  return Object.values(w.att).reduce((acc, v) => acc + ((typeof v === 'object' ? v.status : v) === 'P' ? 1.0 : ((typeof v === 'object' ? v.status : v) === 'HD' ? 0.5 : 0)), 0);
}

function calcWorkerOTPay(w) {
  if (!w || !w.att) return 0;
  return Object.values(w.att).reduce((acc, v) => acc + ((typeof v === 'object' ? (v.ot || 0) : 0) * (w.otRate || 100)), 0);
}

function calcWorkerDue(w) {
  if (!w) return 0;
  return Math.max(0, (calcWorkerShifts(w) * (w.rate || 0)) + calcWorkerOTPay(w) + (w.bakaaya || 0) - (w.advance || 0));
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

  return {
    contractValue: Number(project.totalValue || 0),
    inwardReceived: inward,
    materialExpense: materialAndDirectExp,
    labourExpense: labourCost,
    thekedarExpense: thekedarCost,
    totalCost,
    netProfit,
    profitMarginPct,
    isLoss: netProfit < 0,
    dueFromClient: Math.max(0, Number(project.totalValue || 0) - inward)
  };
}

function calcSupplierBalance(db, supId) {
  const sup = (db.suppliers || []).find(s => (typeof s === 'object' ? s.id : s) === supId);
  if (!sup || typeof sup !== 'object') return { totalPurchased: 0, totalPaid: 0, balanceDue: 0, billsCount: 0, paymentsCount: 0 };
  const bills = (db.supplierBills || []).filter(b => b.supplierId === supId);
  const payments = (db.supplierPayments || []).filter(p => p.supplierId === supId);
  const totalPurchased = bills.reduce((acc, b) => acc + Number(b.amount || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  return { totalPurchased, totalPaid, balanceDue: Math.max(0, totalPurchased - totalPaid), billsCount: bills.length, paymentsCount: payments.length };
}

function generateSupplierWhatsAppSlip(sup, db) {
  const fin = calcSupplierBalance(db, sup.id);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return encodeURIComponent(`*📦 VIJAY CONSTRUCTION - SUPPLIER KHATA*\nSupplier: ${sup.name}\nDate: ${dateStr}\nTotal Billed: ₹${fin.totalPurchased}\nTotal Paid: ₹${fin.totalPaid}\n*Outstanding Due: ₹${fin.balanceDue}*\nManaged by: Vijay Sir`);
}

function generateWorkerWhatsAppSlip(w, siteName) {
  const shifts = calcWorkerShifts(w);
  const otPay = calcWorkerOTPay(w);
  const earned = shifts * (w.rate || 0);
  const gross = earned + otPay + (w.bakaaya || 0);
  const netPayable = Math.max(0, gross - (w.advance || 0));
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return encodeURIComponent(`*🔨 VIJAY CONSTRUCTION - HAFTAWRI SLIP*\nWorker: ${w.name} (${w.role})\nSite: ${siteName}\nDate: ${dateStr}\nShifts: ${shifts} D (₹${w.rate}/D)\nGross: ₹${gross}\nAdvance Cut: -₹${w.advance || 0}\n*NET PAYABLE: ₹${netPayable}*\nApproved by: Vijay Sir`);
}

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
  let csv = "VIJAY CONSTRUCTION - LABOUR MUSTER & WAGE REPORT\nGenerated Date," + dateStr + "\n\nWorker ID,Name,Role,Assigned Site,Daily Rate,Shifts,OT Pay,Gross,Advance Cut,Saturday Net Due,Phone\n";
  workers.forEach(w => {
    const site = getProjectDetails(db, w.site).name.replace(/,/g, ' ');
    csv += `"${w.id}","${w.name}","${w.role}","${site}",${w.rate},${calcWorkerShifts(w)},${calcWorkerOTPay(w)},${(calcWorkerShifts(w)*w.rate)+calcWorkerOTPay(w)},${w.advance || 0},${calcWorkerDue(w)},"${w.phone}"\n`;
  });
  downloadCSVFile(csv, `Vijay_Construction_Labour_${dateStr}.csv`);
}

function exportSupplierReportCSV(db) {
  const suppliers = db.suppliers || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - SUPPLIER KHATA REPORT\nGenerated Date," + dateStr + "\n\nID,Supplier Name,Category,Mobile,Total Purchased,Total Paid,Balance Due\n";
  suppliers.forEach(s => {
    const supObj = typeof s === 'object' ? s : { id: s, name: s, phone: '', category: 'General' };
    const fin = calcSupplierBalance(db, supObj.id);
    csv += `"${supObj.id}","${supObj.name}","${supObj.category}","${supObj.phone}",${fin.totalPurchased},${fin.totalPaid},${fin.balanceDue}\n`;
  });
  downloadCSVFile(csv, `Vijay_Construction_Suppliers_${dateStr}.csv`);
}

function exportProjectMarginsCSV(db) {
  const projects = db.projects || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - PROJECT MARGINS SUMMARY\nGenerated Date," + dateStr + "\n\nID,Client,Site,Contract Value,Inward Received,Total Cost,Net Profit,Margin Pct\n";
  projects.forEach(p => {
    const fin = calcProjectMargin(db, p.id);
    csv += `"${p.id}","${p.client}","${p.name}",${fin.contractValue},${fin.inwardReceived},${fin.totalCost},${fin.netProfit},${fin.profitMarginPct}%\n`;
  });
  downloadCSVFile(csv, `Vijay_Construction_Margins_${dateStr}.csv`);
}