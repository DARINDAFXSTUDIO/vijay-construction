// =========================================================================
// 🏗️ VIJAY CONSTRUCTION - CENTRAL CLOUD & OFFLINE DATABASE ENGINE
// =========================================================================

const MASTER_DB_KEY = 'vijay_subadmin_master_v5';

// 🌐 Free Cloud Realtime Database Sync URL (Firebase REST Endpoint)
// Aap apna free Firebase DB URL yahan daal sakte hain, ya ye default live URL use karein:
let CLOUD_SYNC_URL = "https://vijay-construction-app-default-rtdb.firebaseio.com/master_db.json";

// Default Master Seed Data
const defaultMasterDB = {
  projects: [
    { id: 'P1', client: 'Sharma Ji', name: 'Flat 309 (Dilshad Garden)', totalValue: 500000, received: 180000, progress: 65, phase: 'Plaster & Electrical Piping' },
    { id: 'P2', client: 'Gupta Ji', name: 'Villa 12 (Shahdara)', totalValue: 1200000, received: 400000, progress: 35, phase: 'Brickwork & Conduit Wiring' }
  ],
  suppliers: ["Gupta Building Material", "Aggarwal Hardware", "Sharma Paint & Sanitary"],
  workers: [
    { id: 'W1', name: 'Ramesh Mistri', role: 'Mistri', rate: 800, otRate: 100, site: 'P1', phone: '9811000001', pin: '1234', photo: '', att: {}, advance: 200, advanceList: [], bakaaya: 0, gpsMatch: true },
    { id: 'W2', name: 'Suresh Mazdoor', role: 'Mazdoor', rate: 500, otRate: 65, site: 'P1', phone: '9811000004', pin: '1234', photo: '', att: {}, advance: 100, advanceList: [], bakaaya: 0, gpsMatch: true }
  ],
  thekedars: [
    { id: 'T1', name: 'Raju Electrical Thekedar', phone: '9811000002', pin: '1234', site: 'P2', work: 'Wiring & DB Dressing @ Villa 12', value: 85000, paid: 54200, progress: 60 }
  ],
  materials: [
    { id: 'M1', type: 'material', category: 'Cement & Masonry', item: 'Ultratech PPC Cement (10 Bags)', site: 'P1', supplier: 'Gupta Building Material', requestedBy: 'Ramesh Mistri', time: '09:30 AM', status: 'Pending' },
    { id: 'M2', type: 'manpower', category: 'Manpower / Karigar', item: '2 Workers - Mazdoor (Kal Dhalai)', site: 'P1', requestedBy: 'Ramesh Mistri', time: '11:00 AM', status: 'Pending' }
  ],
  siteProofs: [
    { id: 'SP1', worker: 'Ramesh Mistri', site: 'Flat 309 (Dilshad Garden)', time: 'Today • 06:15 PM', img: '' }
  ],
  ledger: [
    { id: 'L1', site: 'P1', type: 'income', amount: 180000, note: 'Sharma Ji Advance (Flat 309)', date: new Date().toISOString().slice(0, 10) }
  ]
};

// 1. Live Cloud Database Se Data Fetch Karna (Real-Time Pull)
async function getCloudMasterDB() {
  try {
    const res = await fetch(CLOUD_SYNC_URL, { cache: 'no-store' });
    if (res.ok) {
      const cloudData = await res.json();
      if (cloudData && cloudData.workers) {
        localStorage.setItem(MASTER_DB_KEY, JSON.stringify(cloudData));
        return cloudData;
      }
    }
  } catch (err) {
    console.warn("Cloud offline, local cache loading...", err);
  }
  
  // Offline fallback
  const local = localStorage.getItem(MASTER_DB_KEY);
  if (!local) {
    localStorage.setItem(MASTER_DB_KEY, JSON.stringify(defaultMasterDB));
    return defaultMasterDB;
  }
  return JSON.parse(local);
}

// 2. Live Cloud Database Par Data Save Karna (Real-Time Push)
async function saveCloudMasterDB(data) {
  // Pehle local storage update karein taaki app instant response kare
  localStorage.setItem(MASTER_DB_KEY, JSON.stringify(data));
  
  // Cloud server par broadcast push
  try {
    await fetch(CLOUD_SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log("☁️ Successfully Synced to Cloud Server!");
  } catch (err) {
    console.warn("Could not push to cloud server:", err);
  }
}

// 3. Calculation Helpers
function calcWorkerShifts(w) {
  return Object.values(w.att || {}).reduce((acc, v) => {
    const status = typeof v === 'object' ? v.status : v;
    return acc + (status === 'P' ? 1.0 : (status === 'HD' ? 0.5 : 0));
  }, 0);
}

function calcWorkerOTPay(w) {
  const otRate = w.otRate || 100;
  return Object.values(w.att || {}).reduce((acc, v) => {
    const ot = typeof v === 'object' ? (v.ot || 0) : 0;
    return acc + (ot * otRate);
  }, 0);
}

function calcWorkerDue(w) {
  const earned = (calcWorkerShifts(w) * w.rate) + calcWorkerOTPay(w) + (w.bakaaya || 0);
  return Math.max(0, earned - (w.advance || 0));
}

function getProjectDetails(db, projectId) {
  return (db.projects || []).find(p => p.id === projectId) || { name: 'General Site', client: 'Client' };
}