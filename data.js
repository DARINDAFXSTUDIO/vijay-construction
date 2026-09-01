// =========================================================================
// 🚀 1. PWA SERVICE WORKER AUTO-REGISTRATION (ABSOLUTE PATH LOCK)
// =========================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('✅ Service Worker Active (Offline Ready):', reg.scope);
      })
      .catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
  });
}

// =========================================================================
// ⏳ 2. SMART UNIVERSAL LOADER ENGINE (0-LAG VISUAL FEEDBACK)
// =========================================================================
(function initLoaderStyles() {
  const style = document.createElement('style');
  style.innerHTML = `
    #vj-global-loader {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      z-index: 999999; display: none; flex-direction: column;
      align-items: center; justify-content: center; gap: 16px; color: #ffffff;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .vj-spinner {
      width: 44px; height: 44px; border: 4px solid rgba(255, 255, 255, 0.18);
      border-top-color: #3b82f6; border-radius: 50%;
      animation: vjSpin 0.75s linear infinite;
    }
    @keyframes vjSpin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
})();

window.showGlobalLoader = function(message = "Kripya intezar karein...") {
  let loader = document.getElementById('vj-global-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'vj-global-loader';
    loader.innerHTML = `
      <div class="vj-spinner"></div>
      <span id="vj-loader-text" style="font-size: 13.5px; font-weight: 800; text-align: center; max-width: 290px; line-height: 1.4;"></span>
    `;
    document.body.appendChild(loader);
  }
  document.getElementById('vj-loader-text').innerText = message;
  loader.style.display = 'flex';

  clearTimeout(window._loaderTimeout);
  window._loaderTimeout = setTimeout(() => window.hideGlobalLoader(), 8000);
};

window.hideGlobalLoader = function() {
  const loader = document.getElementById('vj-global-loader');
  if (loader) loader.style.display = 'none';
};

// =========================================================================
// 🚀 3. NATIVE APP TOAST ENGINE & WEB AUDIO CHIME
// =========================================================================
(function initNativeUIStyles() {
  const style = document.createElement('style');
  style.innerHTML = `
    #vj-toast-container {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      z-index: 999999; width: calc(100% - 32px); max-width: 420px;
      pointer-events: none; display: flex; flex-direction: column; gap: 8px;
    }
    .vj-toast {
      pointer-events: auto; display: flex; align-items: center; gap: 12px;
      padding: 14px 18px; border-radius: 20px; background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      color: #ffffff; box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700;
      animation: vjToastSlideDown 0.35s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
      transition: all 0.3s ease;
    }
    .vj-toast-error { border-left: 4px solid #ef4444; }
    .vj-toast-success { border-left: 4px solid #10b981; }
    .vj-toast-info { border-left: 4px solid #3b82f6; }
    @keyframes vjToastSlideDown {
      0% { opacity: 0; transform: translateY(-24px) scale(0.94); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes vjToastSlideUp {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-24px) scale(0.94); }
    }
  `;
  document.head.appendChild(style);
})();

function showNativeToast(message, type = 'info') {
  if ('vibrate' in navigator) navigator.vibrate([25]);

  let container = document.getElementById('vj-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'vj-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  let icon = 'ℹ️';
  let typeClass = 'vj-toast-info';
  
  const msgLower = String(message).toLowerCase();
  if (type === 'error' || msgLower.includes('galat') || msgLower.includes('invalid') || msgLower.includes('error') || msgLower.includes('alert')) {
    icon = '⚠️';
    typeClass = 'vj-toast-error';
  } else if (type === 'success' || msgLower.includes('✓') || msgLower.includes('✅') || msgLower.includes('save') || msgLower.includes('ho gaya')) {
    icon = '✅';
    typeClass = 'vj-toast-success';
  }

  toast.className = `vj-toast ${typeClass}`;
  toast.innerHTML = `
    <span style="font-size: 18px; line-height: 1;">${icon}</span>
    <span style="flex: 1; line-height: 1.35;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'vjToastSlideUp 0.3s cubic-bezier(0.34, 1.3, 0.64, 1) forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

window.alert = function(msg) { showNativeToast(msg); };

window.playSuccessChime = function() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.warn("Audio chime failed:", e);
  }
};

// =========================================================================
// 🗄️ 4. BACKEND ENGINE (SUPABASE + FIREBASE HYBRID SYNC)
// =========================================================================
const SUPABASE_URL = 'https://lcacvkjmsmhbxipnkuvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uRAQfZWY4J4pg95Yw5e9_A_DbUo7XT1';
window.supabaseClient = null;

window.initSupabase = function() {
  if (window.supabase && !window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
};

const MASTER_DB_KEY = 'vijay_subadmin_master_v5';
const PERSISTENT_DB_URL = "https://vijay-construction-50c0f-default-rtdb.firebaseio.com/master_db.json";

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
    { id: 'CPAY2', projectId: 'P1', amount: 80000, mode: 'UPI (GooglePay)', milestone: 'Conduit & Piping', note: '2nd Stage Installment', date: '2026-08-28' }
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
  measurements: [
    { id: 'MB1', thekedarId: 'T2', siteId: 'P1', location: 'Drawing Room Flooring', length: 18.5, width: 14.0, unit: 'Sq.Ft', totalArea: 259, rate: 22, amount: 5698, date: '2026-08-28' }
  ],
  workers: [],
  materials: [],
  siteProofs: [],
  ledger: [
    { id: 'L1', site: 'P1', type: 'income', amount: 180000, note: 'Sharma Ji Advance (Flat 309)', date: '2026-08-28' }
  ],
  settlements: []
};

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

// Push notifications via internal serverless route
window.sendPushNotification = async function(title, message, targetPlayerId = null) {
  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, targetPlayerId })
    });
    return await res.json();
  } catch (err) {
    console.warn("Notification Relay Error:", err);
  }
};

window.getDeviceToken = function() {
  let token = localStorage.getItem('vc_device_token');
  if (!token) {
    token = 'DEV_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem('vc_device_token', token);
  }
  return token;
};

// Offline Attendance Queue
window.saveOfflineAttendance = function(labourId, status, date) {
  let queue = JSON.parse(localStorage.getItem('vc_offline_attendance') || '[]');
  queue.push({ labourId, status, date, timestamp: Date.now() });
  localStorage.setItem('vc_offline_attendance', JSON.stringify(queue));
  showNativeToast("📶 Offline: Haziri phone me save ho gayi!");
};

window.syncOfflineData = async function() {
  if (!navigator.onLine || !window.supabaseClient) return;
  let queue = JSON.parse(localStorage.getItem('vc_offline_attendance') || '[]');
  if (queue.length === 0) return;

  for (const item of queue) {
    await window.supabaseClient.from('attendance').insert([{
      labour_id: item.labourId,
      status: item.status,
      date: item.date
    }]);
  }

  localStorage.removeItem('vc_offline_attendance');
  showNativeToast("✅ Offline Haziri server par sync ho gayi!", 'success');
};

window.addEventListener('online', window.syncOfflineData);

// =========================================================================
// 📍 5. GPS DISTANCE & CALCULATION ENGINES
// =========================================================================
function calculateGPSDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

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

function calcClientBillingStats(db, projectId) {
  const p = (db.projects || []).find(x => x.id === projectId) || { totalValue: 0, received: 0, name: 'Site', client: 'Client' };
  const payments = (db.clientPayments || []).filter(cp => cp.projectId === projectId);
  const totalReceived = payments.reduce((sum, cp) => sum + Number(cp.amount || 0), 0) || Number(p.received || 0);
  const totalContract = Number(p.totalValue || 0);
  const balanceRecovery = Math.max(0, totalContract - totalReceived);
  const collectionPct = totalContract > 0 ? Math.round((totalReceived / totalContract) * 100) : 0;
  return { totalContract, totalReceived, balanceRecovery, collectionPct, paymentsList: payments };
}

// =========================================================================
// 📲 6. WHATSAPP ENGINE & CSV EXPORTERS
// =========================================================================
function generateWorkerWhatsAppSlip(w, siteName) {
  const shifts = calcWorkerShifts(w);
  const otPay = calcWorkerOTPay(w);
  const earned = shifts * (w.rate || 0);
  const gross = earned + otPay + (w.bakaaya || 0);
  const netPayable = Math.max(0, gross - (w.advance || 0));
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
🔻 *Advance Cut (खर्ची):* -₹${(w.advance || 0).toLocaleString('en-IN')}
---------------------------------------
🟢 *SATURDAY NET PAYABLE: ₹${netPayable.toLocaleString('en-IN')}*
---------------------------------------
_Verified by Vijay Sir_`
  );
}

function generateSupplierWhatsAppSlip(sup, db) {
  const fin = calcSupplierBalance(db, sup.id);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return encodeURIComponent(
`*📦 VIJAY CONSTRUCTION - SUPPLIER KHATA*
---------------------------------------
🏬 *Supplier:* ${sup.name}
📅 *Statement Date:* ${dateStr}
---------------------------------------
🛒 *Total Purchases Logged:* ₹${fin.totalPurchased.toLocaleString('en-IN')} (${fin.billsCount} Bills)
💳 *Total Payment Released:* ₹${fin.totalPaid.toLocaleString('en-IN')} (${fin.paymentsCount} Txns)
---------------------------------------
🔴 *NET OUTSTANDING DUE (बाकी): ₹${fin.balanceDue.toLocaleString('en-IN')}*`
  );
}

function generateThekedarMBWhatsAppSlip(t, db) {
  const stats = calcThekedarMBStats(db, t.id);
  const siteName = getProjectDetails(db, t.site).name;
  return encodeURIComponent(
`*📐 VIJAY CONSTRUCTION - THEKEDAR MB BILL*
---------------------------------------
👤 *Thekedar:* ${t.name}
🔨 *Work:* ${t.work}
📍 *Site:* ${siteName}
📐 *Total Measured Area:* ${stats.totalArea} Sq.Ft
💰 *Total Work Value:* ₹${(stats.totalMBValue || t.value).toLocaleString('en-IN')}
🔻 *Total Paid So Far:* -₹${stats.totalPaid.toLocaleString('en-IN')}
---------------------------------------
🟢 *NET PAYABLE BALANCE (बाकी): ₹${stats.netDue.toLocaleString('en-IN')}*`
  );
}

function generateClientWhatsAppReceipt(p, latestPayment, db) {
  const stats = calcClientBillingStats(db, p.id);
  return encodeURIComponent(
`*🧾 VIJAY CONSTRUCTION - OFFICIAL RECEIPT*
---------------------------------------
👤 *Client Name:* ${p.client}
📍 *Project / Site:* ${p.name}
💵 *Amount Received:* ₹${Number(latestPayment.amount).toLocaleString('en-IN')}
💳 *Payment Mode:* ${latestPayment.mode || 'Online'}
📊 *Contract Total:* ₹${stats.totalContract.toLocaleString('en-IN')}
🟢 *BALANCE DUE (बाकी): ₹${stats.balanceRecovery.toLocaleString('en-IN')}*`
  );
}

function generateClientPaymentReminder(p, db) {
  const stats = calcClientBillingStats(db, p.id);
  return encodeURIComponent(
`*🏗️ VIJAY CONSTRUCTION - INTIMATION*
---------------------------------------
Namaste ${p.client} Ji,
Aapke project (*${p.name}*) par kaam chal raha hai.
📊 *Outstanding Balance:* ₹${stats.balanceRecovery.toLocaleString('en-IN')}
Kripya agla installment release karein taaki operations continue rahein.`
  );
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
  let csv = "VIJAY CONSTRUCTION - LABOUR MUSTER REPORT\nGenerated Date," + dateStr + "\n\nID,Name,Role,Site,Rate,Shifts,OT Pay,Gross,Advance,Net Due,Phone\n";
  workers.forEach(w => {
    const site = getProjectDetails(db, w.site).name.replace(/,/g, ' ');
    csv += `"${w.id}","${w.name}","${w.role}","${site}",${w.rate},${calcWorkerShifts(w)},${calcWorkerOTPay(w)},${(calcWorkerShifts(w)*w.rate)+calcWorkerOTPay(w)},${w.advance || 0},${calcWorkerDue(w)},"${w.phone}"\n`;
  });
  downloadCSVFile(csv, `Labour_Report_${dateStr}.csv`);
}

function exportThekedarMBReportCSV(db) {
  const list = db.measurements || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - MB REPORT\nGenerated Date," + dateStr + "\n\nID,Thekedar,Site,Location,Length,Width,Unit,Area,Rate,Amount,Date\n";
  list.forEach(m => {
    const thek = (db.thekedars || []).find(t => t.id === m.thekedarId) || { name: 'Thekedar' };
    csv += `"${m.id}","${thek.name}","${getProjectDetails(db, m.siteId).name.replace(/,/g, ' ')}","${m.location.replace(/,/g, ' ')}",${m.length},${m.width},"${m.unit}",${m.totalArea},${m.rate},${m.amount},"${m.date}"\n`;
  });
  downloadCSVFile(csv, `MB_Report_${dateStr}.csv`);
}

function exportSupplierReportCSV(db) {
  const suppliers = db.suppliers || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - SUPPLIER KHATA\nGenerated Date," + dateStr + "\n\nID,Supplier,Category,Phone,Purchased,Paid,Balance Due\n";
  suppliers.forEach(s => {
    const supObj = typeof s === 'object' ? s : { id: s, name: s, phone: '', category: 'General' };
    const fin = calcSupplierBalance(db, supObj.id);
    csv += `"${supObj.id}","${supObj.name}","${supObj.category}","${supObj.phone}",${fin.totalPurchased},${fin.totalPaid},${fin.balanceDue}\n`;
  });
  downloadCSVFile(csv, `Suppliers_${dateStr}.csv`);
}

function exportClientBillingReportCSV(db) {
  const projects = db.projects || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - CLIENT BILLING\nGenerated Date," + dateStr + "\n\nID,Client,Site,Phone,Contract Value,Received,Due,Collection Pct\n";
  projects.forEach(p => {
    const stats = calcClientBillingStats(db, p.id);
    csv += `"${p.id}","${p.client}","${p.name}","${p.phone || ''}",${stats.totalContract},${stats.totalReceived},${stats.balanceRecovery},${stats.collectionPct}%\n`;
  });
  downloadCSVFile(csv, `Clients_${dateStr}.csv`);
}

function exportProjectMarginsCSV(db) {
  const projects = db.projects || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - MARGINS\nGenerated Date," + dateStr + "\n\nID,Client,Site,Contract,Received,Total Cost,Profit,Margin Pct\n";
  projects.forEach(p => {
    const fin = calcProjectMargin(db, p.id);
    csv += `"${p.id}","${p.client}","${p.name}",${fin.contractValue},${fin.inwardReceived},${fin.totalCost},${fin.netProfit},${fin.profitMarginPct}%\n`;
  });
  downloadCSVFile(csv, `Margins_${dateStr}.csv`);
}