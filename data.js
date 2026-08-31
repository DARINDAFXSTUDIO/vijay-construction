// =========================================================================
// 🏗️ VIJAY CONSTRUCTION - CENTRAL DATABASE & CLIENT BILLING ENGINE (data.js)
// =========================================================================

const MASTER_DB_KEY = 'vijay_subadmin_master_v5';
const PERSISTENT_DB_URL = "https://vijay-construction-50c0f-default-rtdb.firebaseio.com/master_db.json";

// Default Master Template with Client Invoices, Milestones & Payments
const defaultMasterDB = {
  projects: [
    { 
      id: 'P1', 
      client: 'Sharma Ji', 
      phone: '9811000009',
      name: 'Flat 309 (Dilshad Garden)', 
      lat: 28.6758, 
      lng: 77.3214, 
      totalValue: 500000, 
      received: 180000, 
      progress: 65, 
      phase: 'Plaster & Electrical Piping',
      milestones: [
        { id: 'M1', name: 'Booking Advance', targetAmt: 100000, status: 'Received' },
        { id: 'M2', name: 'Conduit & Electrical Piping', targetAmt: 150000, status: 'Received' },
        { id: 'M3', name: 'Plaster & Flooring Complete', targetAmt: 150000, status: 'Pending' },
        { id: 'M4', name: 'Final Paint & Handover', targetAmt: 100000, status: 'Pending' }
      ]
    },
    { 
      id: 'P2', 
      client: 'Gupta Ji', 
      phone: '9811000010',
      name: 'Villa 12 (Shahdara)', 
      lat: 28.6692, 
      lng: 77.2915, 
      totalValue: 1200000, 
      received: 400000, 
      progress: 35, 
      phase: 'Brickwork & Conduit Wiring',
      milestones: [
        { id: 'M1', name: 'Site Agreement & Advance', targetAmt: 250000, status: 'Received' },
        { id: 'M2', name: 'Structure & Brickwork', targetAmt: 350000, status: 'Partially Received' },
        { id: 'M3', name: 'Sanitary & Electrical Rough-in', targetAmt: 350000, status: 'Pending' },
        { id: 'M4', name: 'Finishing & Key Handover', targetAmt: 250000, status: 'Pending' }
      ]
    }
  ],
  clientPayments: [
    { id: 'CPAY1', projectId: 'P1', amount: 100000, mode: 'Bank Transfer (NEFT)', milestone: 'Booking Advance', note: 'Token Advance', date: '2026-08-15' },
    { id: 'CPAY2', projectId: 'P1', amount: 80000, mode: 'UPI (GooglePay)', milestone: 'Conduit & Piping', note: '2nd Stage Installment', date: '2026-08-28' },
    { id: 'CPAY3', projectId: 'P2', amount: 250000, mode: 'Cheque', milestone: 'Agreement Advance', note: 'Cheque No. 441029', date: '2026-08-10' },
    { id: 'CPAY4', projectId: 'P2', amount: 150000, mode: 'Bank Transfer (RTGS)', milestone: 'Structure Brickwork', note: 'Stage 2 payment', date: '2026-08-25' }
  ],
  suppliers: [
    { id: 'SUP1', name: 'Gupta Building Material', phone: '9811000005', category: 'Cement & Masonry', totalPurchased: 45000, totalPaid: 25000 },
    { id: 'SUP2', name: 'Aggarwal Hardware & Tools', phone: '9811000006', category: 'Hardware & Tools', totalPurchased: 18500, totalPaid: 10000 }
  ],
  supplierBills: [],
  supplierPayments: [],
  thekedars: [
    { id: 'T1', name: 'Raju Electrical Thekedar', phone: '9811000002', pin: '1234', site: 'P2', work: 'Wiring & DB Dressing @ Villa 12', value: 85000, paid: 54200, progress: 60 },
    { id: 'T2', name: 'Manoj Tiles Thekedar', phone: '9811000008', pin: '1234', site: 'P1', work: 'Vitrified Flooring & Bathroom Tiles', value: 45000, paid: 20000, progress: 45 }
  ],
  measurements: [],
  workers: [
    { id: 'W1', name: 'Ramesh Mistri', role: 'Mistri', rate: 800, otRate: 100, site: 'P1', phone: '9811000001', pin: '1234', photo: '', att: {}, advance: 200, advanceList: [{ date: '2026-08-28', amount: 200, reason: 'Field Cash' }], bakaaya: 0, gpsMatch: true },
    { id: 'W2', name: 'Suresh Mazdoor', role: 'Mazdoor', rate: 500, otRate: 65, site: 'P1', phone: '9811000004', pin: '1234', photo: '', att: {}, advance: 100, advanceList: [{ date: '2026-08-28', amount: 100, reason: 'Field Cash' }], bakaaya: 0, gpsMatch: true }
  ],
  materials: [],
  siteProofs: [],
  ledger: [
    { id: 'L1', site: 'P1', type: 'income', amount: 180000, note: 'Sharma Ji Advance (Flat 309)', date: '2026-08-28' },
    { id: 'L2', site: 'P2', type: 'income', amount: 400000, note: 'Gupta Ji Inward (Villa 12)', date: '2026-08-25' }
  ],
  settlements: []
};

// 1. DATA SYNC
async function getCloudMasterDB() {
  try {
    const res = await fetch(PERSISTENT_DB_URL, { cache: 'no-store' });
    if (res.ok) {
      const cloudData = await res.json();
      if (cloudData && cloudData.projects) {
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

// 2. 🏛️ CLIENT BILLING & WHATSAPP RECEIPT GENERATORS
function calcClientBillingStats(db, projectId) {
  const p = (db.projects || []).find(x => x.id === projectId) || { totalValue: 0, received: 0, name: 'Site', client: 'Client' };
  const payments = (db.clientPayments || []).filter(cp => cp.projectId === projectId);
  
  const totalReceived = payments.reduce((sum, cp) => sum + Number(cp.amount || 0), 0) || Number(p.received || 0);
  const totalContract = Number(p.totalValue || 0);
  const balanceRecovery = Math.max(0, totalContract - totalReceived);
  const collectionPct = totalContract > 0 ? Math.round((totalReceived / totalContract) * 100) : 0;

  return {
    totalContract,
    totalReceived,
    balanceRecovery,
    collectionPct,
    paymentsList: payments
  };
}

function generateClientWhatsAppReceipt(p, latestPayment, db) {
  const stats = calcClientBillingStats(db, p.id);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return encodeURIComponent(
`*🧾 VIJAY CONSTRUCTION - OFFICIAL PAYMENT RECEIPT*
---------------------------------------
👤 *Client Name:* ${p.client}
📍 *Project / Site:* ${p.name}
📅 *Receipt Date:* ${dateStr}
---------------------------------------
💵 *Amount Received:* ₹${Number(latestPayment.amount).toLocaleString('en-IN')}
💳 *Payment Mode:* ${latestPayment.mode || 'Online Transfer'}
📌 *Stage / Milestone:* ${latestPayment.milestone || 'Project Installment'}
${latestPayment.note ? `📝 *Note:* ${latestPayment.note}\n` : ''}---------------------------------------
📊 *CONTRACT ACCOUNT SUMMARY:*
• *Total Project Value:* ₹${stats.totalContract.toLocaleString('en-IN')}
• *Total Received to Date:* ₹${stats.totalReceived.toLocaleString('en-IN')} (${stats.collectionPct}%)
🟢 *OUTSTANDING BALANCE (बाकी): ₹${stats.balanceRecovery.toLocaleString('en-IN')}*
---------------------------------------
_Thank you for your business!_
*VIJAY CONSTRUCTION*
📞 Phone: +91 9268880221 | Dilshad Garden, Delhi`
  );
}

function generateClientPaymentReminder(p, db) {
  const stats = calcClientBillingStats(db, p.id);
  const nextMilestone = (p.milestones || []).find(m => m.status === 'Pending') || { name: 'Next Work Stage', targetAmt: stats.balanceRecovery };

  return encodeURIComponent(
`*🏗️ VIJAY CONSTRUCTION - PAYMENT INTIMATION*
---------------------------------------
Namaste ${p.client} Ji,

Aapke project (*${p.name}*) par *${p.phase || 'running work stage'}* ka kaam schedule ke mutabiq chal raha hai.

📌 *Upcoming Milestone:* ${nextMilestone.name}
💰 *Installment Due:* ₹${Number(nextMilestone.targetAmt || stats.balanceRecovery).toLocaleString('en-IN')}
📊 *Total Outstanding Balance:* ₹${stats.balanceRecovery.toLocaleString('en-IN')}

Kripya agla installment release karne ki kripa karein taaki material aur field operations smoothly continue rahein.

*Bank / UPI Details:*
📱 GooglePay / PhonePe: *9268880221*

_Regards,_
*Vijay Sir*
VIJAY CONSTRUCTION`
  );
}

// 3. 📊 1-CLICK CLIENT EXCEL REPORT
function exportClientBillingReportCSV(db) {
  const projects = db.projects || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - CLIENT BILLING & RECOVERY REPORT\n";
  csv += `Generated Date,${dateStr}\n\n`;
  csv += "Project ID,Client Name,Site Name,Mobile,Contract Value (Rs),Total Received (Rs),Recovery Balance (Rs),Collection (%),Current Phase\n";

  projects.forEach(p => {
    const stats = calcClientBillingStats(db, p.id);
    csv += `"${p.id}","${p.client.replace(/,/g, ' ')}","${p.name.replace(/,/g, ' ')}","${p.phone || ''}",${stats.totalContract},${stats.totalReceived},${stats.balanceRecovery},${stats.collectionPct}%,"${p.phase || 'Ongoing'}"\n`;
  });

  downloadCSVFile(csv, `Vijay_Construction_Client_Billing_${dateStr}.csv`);
}

// 4. SHARED CALCULATION & WAGE UTILITIES
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

function calcThekedarMBStats(db, thekedarId) {
  const t = (db.thekedars || []).find(x => x.id === thekedarId);
  if (!t) return { totalArea: 0, totalMBValue: 0, totalPaid: 0, netDue: 0, entriesCount: 0, mbEntries: [] };
  const mbEntries = (db.measurements || []).filter(m => m.thekedarId === thekedarId);
  const totalArea = mbEntries.reduce((sum, m) => sum + Number(m.totalArea || 0), 0);
  const totalMBValue = mbEntries.reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const totalPaid = Number(t.paid || 0);
  const effectiveContractVal = totalMBValue > 0 ? totalMBValue : Number(t.value || 0);
  return { totalArea: Math.round(totalArea * 100) / 100, totalMBValue, totalPaid, netDue: Math.max(0, effectiveContractVal - totalPaid), entriesCount: mbEntries.length, mbEntries };
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
  let csv = "VIJAY CONSTRUCTION - LABOUR REPORT\nDate," + dateStr + "\n\nID,Name,Role,Site,Rate,Shifts,OT Pay,Gross,Advance,Due,Phone\n";
  workers.forEach(w => {
    csv += `"${w.id}","${w.name}","${w.role}","${getProjectDetails(db, w.site).name.replace(/,/g, ' ')}",${w.rate},${calcWorkerShifts(w)},${calcWorkerOTPay(w)},${(calcWorkerShifts(w)*w.rate)+calcWorkerOTPay(w)},${w.advance || 0},${calcWorkerDue(w)},"${w.phone}"\n`;
  });
  downloadCSVFile(csv, `Vijay_Construction_Labour_${dateStr}.csv`);
}

function exportThekedarMBReportCSV(db) {
  const list = db.measurements || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - THEKEDAR MB REPORT\nDate," + dateStr + "\n\nID,Thekedar,Site,Location,L,W,Unit,Area,Rate,Amount,Date\n";
  list.forEach(m => {
    const thek = (db.thekedars || []).find(t => t.id === m.thekedarId) || { name: 'Thekedar' };
    csv += `"${m.id}","${thek.name}","${getProjectDetails(db, m.siteId).name.replace(/,/g, ' ')}","${m.location.replace(/,/g, ' ')}",${m.length},${m.width},"${m.unit}",${m.totalArea},${m.rate},${m.amount},"${m.date}"\n`;
  });
  downloadCSVFile(csv, `Vijay_Construction_MB_${dateStr}.csv`);
}

function exportSupplierReportCSV(db) {
  const suppliers = db.suppliers || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - SUPPLIER KHATA\nDate," + dateStr + "\n\nID,Supplier,Category,Phone,Purchased,Paid,Balance\n";
  suppliers.forEach(s => {
    const supObj = typeof s === 'object' ? s : { id: s, name: s, phone: '', category: 'General' };
    const fin = calcSupplierBalance(db, supObj.id);
    csv += `"${supObj.id}","${supObj.name}","${supObj.category}","${supObj.phone}",${fin.totalPurchased},${fin.totalPaid},${fin.balanceDue}\n`;
  });
  downloadCSVFile(csv, `Vijay_Construction_Suppliers_${dateStr}.csv`);
}