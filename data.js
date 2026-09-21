/**
 * VIJAY CONSTRUCTION - Master Control Hub
 * Module: data.js (Enterprise Supabase CRUD & Offline Sync Engine)
 * Database Source of Truth: Supabase (PostgreSQL)
 */

// =========================================================================
// 🚀 1. PWA SERVICE WORKER REGISTRATION
// =========================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('✅ Service Worker Active (Scope Locked):', reg.scope);
      })
      .catch((err) => {
        console.warn('⚠️ Service Worker Registration Notice:', err);
      });
  });
}

// =========================================================================
// ⏳ 2. UNIVERSAL LOADER ENGINE (0-Lag Visual Feedback)
// =========================================================================
(function injectGlobalLoaderCSS() {
  const style = document.createElement('style');
  style.id = 'vj-global-loader-css';
  style.innerHTML = `
    #vj-global-loader {
      position: fixed; inset: 0; background: rgba(2, 6, 23, 0.88);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      z-index: 999999; display: none; flex-direction: column;
      align-items: center; justify-content: center; gap: 14px; color: #ffffff;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }
    .vj-loader-spinner {
      width: 42px; height: 42px; border: 4px solid rgba(255, 255, 255, 0.15);
      border-top-color: #3b82f6; border-radius: 50%;
      animation: vjSpin 0.7s linear infinite;
    }
    @keyframes vjSpin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
})();

window.showGlobalLoader = function(msg = "Kripya intezar karein...") {
  let loader = document.getElementById('vj-global-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'vj-global-loader';
    loader.innerHTML = `
      <div class="vj-loader-spinner"></div>
      <span id="vj-loader-msg" style="font-size: 13.5px; font-weight: 700; max-width: 280px; text-align: center; line-height: 1.4;"></span>
    `;
    document.body.appendChild(loader);
  }
  const textElem = document.getElementById('vj-loader-msg');
  if (textElem) textElem.innerText = msg;
  loader.style.display = 'flex';

  clearTimeout(window._loaderTimer);
  window._loaderTimer = setTimeout(() => window.hideGlobalLoader(), 12000);
};

window.hideGlobalLoader = function() {
  const loader = document.getElementById('vj-global-loader');
  if (loader) loader.style.display = 'none';
};

// =========================================================================
// 🔔 3. NATIVE TOAST ENGINE & AUDIO CHIME
// =========================================================================
(function injectNativeToastCSS() {
  const style = document.createElement('style');
  style.id = 'vj-native-toast-css';
  style.innerHTML = `
    #vj-toast-container {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      z-index: 999999; width: calc(100% - 32px); max-width: 420px;
      pointer-events: none; display: flex; flex-direction: column; gap: 8px;
    }
    .vj-toast {
      pointer-events: auto; display: flex; align-items: center; gap: 12px;
      padding: 13px 18px; border-radius: 16px; background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      color: #ffffff; box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif; 
      font-size: 13px; font-weight: 700;
      animation: vjSlideIn 0.3s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
      transition: all 0.3s ease;
    }
    .vj-toast-error { border-left: 4px solid #ef4444; }
    .vj-toast-success { border-left: 4px solid #10b981; }
    .vj-toast-info { border-left: 4px solid #3b82f6; }
    @keyframes vjSlideIn {
      0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes vjSlideOut {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-20px) scale(0.95); }
    }
  `;
  document.head.appendChild(style);
})();

window.showNativeToast = function(message, type = 'info') {
  if ('vibrate' in navigator) {
    try { navigator.vibrate([25]); } catch (e) {}
  }

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
  if (type === 'error' || msgLower.includes('error') || msgLower.includes('galat') || msgLower.includes('failed') || msgLower.includes('invalid')) {
    icon = '⚠️';
    typeClass = 'vj-toast-error';
  } else if (type === 'success' || msgLower.includes('success') || msgLower.includes('save') || msgLower.includes('sync') || msgLower.includes('ho gaya')) {
    icon = '✅';
    typeClass = 'vj-toast-success';
  }

  toast.className = `vj-toast ${typeClass}`;
  toast.innerHTML = `
    <span style="font-size: 17px; line-height: 1;">${icon}</span>
    <span style="flex: 1; line-height: 1.35;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'vjSlideOut 0.3s cubic-bezier(0.34, 1.3, 0.64, 1) forwards';
    setTimeout(() => toast.remove(), 290);
  }, 2700);
};

window.alert = function(msg) { window.showNativeToast(msg); };

window.playSuccessChime = function() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  } catch (e) {}
};

// =========================================================================
// 🗄️ 4. SUPABASE BACKEND CLIENT (SINGLE SOURCE OF TRUTH)
// =========================================================================
const SUPABASE_URL = 'https://lcacvkjmsmhbxipnkuvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uRAQfZWY4J4pg95Yw5e9_A_DbUo7XT1';
window.supabaseClient = null;

window.initSupabase = function() {
  if (window.supabase && !window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      realtime: { params: { eventsPerSecond: 10 } }
    });
  }
  return window.supabaseClient;
};

// Immediately boot Supabase
window.initSupabase();

const MASTER_DB_KEY = 'vijay_subadmin_master_v5';

const defaultMasterDB = {
  projects: [],
  workers: [],
  attendance: [],
  clientPayments: [],
  suppliers: [],
  supplierBills: [],
  supplierPayments: [],
  thekedars: [],
  measurements: [],
  materials: [],
  siteProofs: [],
  ledger: [],
  settlements: []
};

// Cloud-First Fetch: Seedhe PostgreSQL Tables se Data Hydrate Karein
async function getCloudMasterDB() {
  const local = localStorage.getItem(MASTER_DB_KEY);
  let parsedLocal = null;
  if (local) {
    try { parsedLocal = JSON.parse(local); } catch (e) { parsedLocal = null; }
  }

  const client = window.initSupabase();
  if (navigator.onLine && client) {
    try {
      // Parallel fetch for speed
      const [projRes, labourRes, attRes, stateRes] = await Promise.all([
        client.from('projects').select('*').order('created_at', { ascending: false }),
        client.from('labour').select('*').order('created_at', { ascending: false }),
        client.from('attendance').select('*').order('date', { ascending: false }),
        client.from('app_state').select('state').eq('id', 'master_control_hub').maybeSingle()
      ]);

      const mergedState = {
        ...(parsedLocal || defaultMasterDB),
        ...(stateRes.data && stateRes.data.state ? stateRes.data.state : {})
      };

      if (!projRes.error && projRes.data) {
        mergedState.projects = projRes.data.map(p => ({
          id: p.id,
          name: p.name,
          client: p.client,
          phone: p.phone,
          lat: p.lat,
          lng: p.lng,
          totalValue: Number(p.total_value) || 0,
          received: Number(p.received) || 0,
          progress: p.progress || 0,
          phase: p.phase || 'Ongoing'
        }));
      }

      if (!labourRes.error && labourRes.data) {
        mergedState.workers = labourRes.data.map(l => ({
          id: l.id,
          name: l.name,
          role: l.role || 'Helper',
          rate: Number(l.rate) || 500,
          otRate: Number(l.ot_rate) || 100,
          phone: l.phone || '',
          site: l.site_id || null,
          advance: Number(l.advance) || 0,
          bakaaya: Number(l.bakaaya) || 0,
          att: {}
        }));
      }

      // Map attendance records with Overtime protection
      if (!attRes.error && attRes.data && mergedState.workers) {
        attRes.data.forEach(rec => {
          const worker = mergedState.workers.find(w => String(w.id) === String(rec.labour_id));
          if (worker) {
            worker.att = worker.att || {};
            worker.att[rec.date] = {
              status: rec.status,
              ot: Number(rec.ot_hours) || 0,
              projectId: rec.project_id || null
            };
          }
        });
      }

      localStorage.setItem(MASTER_DB_KEY, JSON.stringify(mergedState));
      return mergedState;
    } catch (err) {
      console.warn("⚠️ Live Supabase fetch failed, fallback to local:", err);
    }
  }

  return parsedLocal || defaultMasterDB;
}

// Cloud-First Save
async function saveCloudMasterDB(data) {
  if (!data) return;
  localStorage.setItem(MASTER_DB_KEY, JSON.stringify(data));

  const client = window.initSupabase();
  if (navigator.onLine && client) {
    try {
      await client.from('app_state').upsert({
        id: 'master_control_hub',
        state: data,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("⚠️ Cloud state buffer saved locally:", err);
    }
  }
}

// Push notification hook
window.sendPushNotification = async function(title, message, targetPlayerId = null) {
  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, targetPlayerId })
    });
    return await res.json();
  } catch (err) {
    console.warn("Push notify offline:", err);
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

// =========================================================================
// ⏱️ 5. OFFLINE ATTENDANCE QUEUE & SYNC (With OT & Duplicate Prevention)
// =========================================================================
window.saveOfflineAttendance = function(labourId, status, date, projectId = null, otHours = 0) {
  let queue = JSON.parse(localStorage.getItem('vc_offline_attendance') || '[]');
  queue = queue.filter(q => !(String(q.labourId) === String(labourId) && q.date === date));
  queue.push({
    labourId,
    status,
    date,
    projectId: projectId || null,
    otHours: Number(otHours) || 0,
    timestamp: Date.now()
  });
  localStorage.setItem('vc_offline_attendance', JSON.stringify(queue));
  window.showNativeToast("📶 Offline: Haziri phone me save ho gayi!");
};

window.syncOfflineData = async function() {
  if (!navigator.onLine) return;
  const client = window.initSupabase();
  if (!client) return;

  let queue = JSON.parse(localStorage.getItem('vc_offline_attendance') || '[]');
  if (queue.length === 0) return;

  window.showGlobalLoader("Offline haziri server par bhej rahe hain...");

  const payload = queue.map(item => ({
    labour_id: item.labourId,
    project_id: item.projectId || null,
    status: item.status,
    ot_hours: Number(item.otHours) || 0,
    date: item.date,
    is_locked: false
  }));

  try {
    const { error } = await client.from('attendance').upsert(payload, {
      onConflict: 'labour_id,date'
    });

    if (!error) {
      localStorage.removeItem('vc_offline_attendance');
      window.playSuccessChime();
      window.showNativeToast("✅ Sabhi offline haziri sync ho gayi!", 'success');
    } else {
      console.error("Attendance sync error:", error);
      window.showNativeToast("⚠️ Sync me dikkat aayi: " + error.message, 'error');
    }
  } catch (e) {
    console.error("Network sync error:", e);
  } finally {
    window.hideGlobalLoader();
  }
};

window.addEventListener('online', window.syncOfflineData);

// =========================================================================
// 📍 6. CALCULATIONS & METRICS (Strict Math Validation)
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
  const otRate = Number(w.otRate) || 100;
  return Object.values(w.att).reduce((acc, v) => {
    const ot = typeof v === 'object' ? (Number(v.ot) || 0) : 0;
    return acc + (ot * otRate);
  }, 0);
}

function calcWorkerDue(w) {
  if (!w) return 0;
  const earned = (calcWorkerShifts(w) * (Number(w.rate) || 0)) + calcWorkerOTPay(w) + (Number(w.bakaaya) || 0);
  return Math.max(0, earned - (Number(w.advance) || 0));
}

function getProjectDetails(db, projectId) {
  const fallback = { id: 'default', name: 'Master Site', client: 'Client' };
  if (!db || !db.projects || !Array.isArray(db.projects) || db.projects.length === 0) return fallback;
  return db.projects.find(p => String(p.id) === String(projectId)) || db.projects[0] || fallback;
}

function calcProjectMargin(db, projectId) {
  const project = (db.projects || []).find(p => String(p.id) === String(projectId)) || { totalValue: 0, received: 0, name: 'Site' };
  const inward = Number(project.received || 0);
  const siteLedger = (db.ledger || []).filter(l => String(l.site) === String(projectId) && l.type === 'expense');
  const materialAndDirectExp = siteLedger.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const siteWorkers = (db.workers || []).filter(w => String(w.site) === String(projectId));
  const labourCost = siteWorkers.reduce((sum, w) => sum + (calcWorkerShifts(w) * (Number(w.rate) || 0)) + calcWorkerOTPay(w), 0);
  const siteThekedars = (db.thekedars || []).filter(t => String(t.site) === String(projectId));
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
// 📲 7. WHATSAPP ENGINE & CSV EXPORTS
// =========================================================================
function generateWorkerWhatsAppSlip(w, siteName) {
  const shifts = calcWorkerShifts(w);
  const otPay = calcWorkerOTPay(w);
  const earned = shifts * (Number(w.rate) || 0);
  const gross = earned + otPay + (Number(w.bakaaya) || 0);
  const netPayable = Math.max(0, gross - (Number(w.advance) || 0));
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
${w.bakaaya > 0 ? `⏮️ *Pichhla Bakaaya:* +₹${Number(w.bakaaya).toLocaleString('en-IN')}\n` : ''}💵 *Gross Total:* ₹${gross.toLocaleString('en-IN')}
🔻 *Advance Cut (खर्ची):* -₹${(Number(w.advance) || 0).toLocaleString('en-IN')}
---------------------------------------
🟢 *SATURDAY NET PAYABLE: ₹${netPayable.toLocaleString('en-IN')}*
---------------------------------------
_Verified by Vijay Sir_`
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
    const shifts = calcWorkerShifts(w);
    const otPay = calcWorkerOTPay(w);
    const gross = (shifts * (Number(w.rate) || 0)) + otPay;
    csv += `"${w.id}","${w.name}","${w.role}","${site}",${w.rate},${shifts},${otPay},${gross},${w.advance || 0},${calcWorkerDue(w)},"${w.phone}"\n`;
  });
  downloadCSVFile(csv, `Labour_Report_${dateStr}.csv`);
}