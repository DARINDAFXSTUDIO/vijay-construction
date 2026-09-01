// =========================================================================
// 🚀 1. NATIVE APP TOAST ENGINE & WEB AUDIO CHIME (UPGRADE #9)
// =========================================================================

(function initNativeUIStyles() {
  const style = document.createElement('style');
  style.innerHTML = `
    #vj-toast-container {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      width: calc(100% - 32px);
      max-width: 420px;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .vj-toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 20px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: #ffffff;
      box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      font-weight: 700;
      animation: vjToastSlideDown 0.35s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
      transition: all 0.3s ease;
    }
    .vj-toast-error { border-left: 4px solid #ef4444; }
    .vj-toast-success { border-left: 4px solid #10b981; }
    .vj-toast-warning { border-left: 4px solid #f59e0b; }
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
  if (type === 'error' || msgLower.includes('galat') || msgLower.includes('invalid') || msgLower.includes('galti') || msgLower.includes('warning') || msgLower.includes('door') || msgLower.includes('pehle se') || msgLower.includes('alert')) {
    icon = '⚠️';
    typeClass = 'vj-toast-error';
  } else if (type === 'success' || msgLower.includes('✓') || msgLower.includes('✅') || msgLower.includes('save') || msgLower.includes('sync') || msgLower.includes('ho gaya') || msgLower.includes('locked') || msgLower.includes('settled')) {
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

// Override alert globally
window.alert = function(msg) {
  showNativeToast(msg);
};

// 🔊 Audio Chime Engine (Web Audio API)
window.playSuccessChime = function() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
    console.warn("Audio Context blocked", e);
  }
};

// =========================================================================
// 🗄️ 2. SUPABASE + FIREBASE HYBRID BACKEND ENGINE
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

// =========================================================================
// 🔐 3. DEVICE BINDING, AUTO-LOGIN & ONESIGNAL (UPGRADES #2, #4, #8)
// =========================================================================

window.getDeviceToken = function() {
  let token = localStorage.getItem('vc_device_token');
  if (!token) {
    token = 'DEV_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem('vc_device_token', token);
  }
  return token;
};

window.sendPushNotification = async function(title, message, targetPlayerId = null) {
  const payload = {
    app_id: "7faaaef8-1305-45f5-aaa3-e961369b33bf",
    headings: { en: title },
    contents: { en: message },
    target_channel: "push"
  };

  if (targetPlayerId) {
    payload.include_player_ids = [targetPlayerId];
  } else {
    payload.included_segments = ["All"];
  }

  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn("OneSignal Dispatch Error:", err);
  }
};

window.saveOfflineAttendance = function(labourId, status, date) {
  let queue = JSON.parse(localStorage.getItem('vc_offline_attendance') || '[]');
  queue.push({ labourId, status, date, timestamp: Date.now() });
  localStorage.setItem('vc_offline_attendance', JSON.stringify(queue));
  showNativeToast("📶 Internet nahi hai. Haziri phone me save ho gayi!");
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
// 📍 4. GPS HAVERSINE DISTANCE ENGINE
// =========================================================================

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

// =========================================================================
// 🧮 5. LABOUR, FINANCIAL & MARGIN CALCULATIONS
// =========================================================================

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

// =========================================================================
// 📦 6. SUPPLIER & THEKEDAR MB CALCULATIONS
// =========================================================================

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

function calcThekedarMBStats(db, thekedarId) {
  const t = (db.thekedars || []).find(x => x.id === thekedarId);
  if (!t) return { totalArea: 0, totalMBValue: 0, totalPaid: 0, netDue: 0, entriesCount: 0, mbEntries: [] };

  const mbEntries = (db.measurements || []).filter(m => m.thekedarId === thekedarId);
  const totalArea = mbEntries.reduce((sum, m) => sum + Number(m.totalArea || 0), 0);
  const totalMBValue = mbEntries.reduce((sum, m) => sum + Number(m.amount || 0), 0);
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
// 📲 7. WHATSAPP ENGINE (PARCHAS, RECEIPTS & REMINDERS)
// =========================================================================

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
`*📦 VIJAY CONSTRUCTION - SUPPLIER KHATA*
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

// =========================================================================
// 📊 8. 1-CLICK EXCEL / CSV BACKUP DOWNLOAD EXPORTERS
// =========================================================================

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

function exportThekedarMBReportCSV(db) {
  const list = db.measurements || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - THEKEDAR MB REPORT\nGenerated Date," + dateStr + "\n\nID,Thekedar,Site,Location,Length,Width,Unit,Total Area,Rate,Amount,Date\n";
  list.forEach(m => {
    const thek = (db.thekedars || []).find(t => t.id === m.thekedarId) || { name: 'Thekedar' };
    csv += `"${m.id}","${thek.name}","${getProjectDetails(db, m.siteId).name.replace(/,/g, ' ')}","${m.location.replace(/,/g, ' ')}",${m.length},${m.width},"${m.unit}",${m.totalArea},${m.rate},${m.amount},"${m.date}"\n`;
  });
  downloadCSVFile(csv, `Vijay_Construction_MB_${dateStr}.csv`);
}

function exportSupplierReportCSV(db) {
  const suppliers = db.suppliers || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - SUPPLIER & VENDOR KHATA\nGenerated Date," + dateStr + "\n\nID,Supplier Name,Category,Mobile,Total Purchased,Total Paid,Balance Due\n";
  suppliers.forEach(s => {
    const supObj = typeof s === 'object' ? s : { id: s, name: s, phone: '', category: 'General' };
    const fin = calcSupplierBalance(db, supObj.id);
    csv += `"${supObj.id}","${supObj.name}","${supObj.category}","${supObj.phone}",${fin.totalPurchased},${fin.totalPaid},${fin.balanceDue}\n`;
  });
  downloadCSVFile(csv, `Vijay_Construction_Suppliers_${dateStr}.csv`);
}

function exportClientBillingReportCSV(db) {
  const projects = db.projects || [];
  const dateStr = new Date().toISOString().slice(0, 10);
  let csv = "VIJAY CONSTRUCTION - CLIENT BILLING & RECOVERY\nGenerated Date," + dateStr + "\n\nID,Client,Site,Mobile,Contract Value,Total Received,Balance Recovery,Collection Pct,Phase\n";
  projects.forEach(p => {
    const stats = calcClientBillingStats(db, p.id);
    csv += `"${p.id}","${p.client}","${p.name}","${p.phone || ''}",${stats.totalContract},${stats.totalReceived},${stats.balanceRecovery},${stats.collectionPct}%,"${p.phase || 'Ongoing'}"\n`;
  });
  downloadCSVFile(csv, `Vijay_Construction_Clients_${dateStr}.csv`);
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