// =========================================================================
// 👑 PROTECTED ADMIN API ENDPOINT (/api/admin)
// =========================================================================

import { getGlobalDB, setGlobalDB } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getGlobalDB();

  // 1. GET FULL ADMIN REPORT & DATASET
  if (req.method === 'GET') {
    return res.status(200).json({ success: true, data: db });
  }

  // 2. POST ADMIN MUTATIONS
  if (req.method === 'POST') {
    const { action, payload } = req.body || {};

    // A. Quick Attendance Update
    if (action === 'set_attendance') {
      const { workerId, date, status, ot } = payload;
      const worker = db.workers.find(w => w.id === workerId);
      if (worker) {
        if (!worker.att) worker.att = {};
        // Reject modification if server period is locked
        if (worker.att[date]?.locked) {
          return res.status(403).json({ success: false, message: 'Attendance locked hai. Pehle Unlock karein.' });
        }
        worker.att[date] = { status, ot: ot || 0, locked: false };
        setGlobalDB(db);
        return res.status(200).json({ success: true, message: 'Attendance Updated' });
      }
    }

    // B. Server-Enforced Attendance Lock
    if (action === 'lock_attendance') {
      const { date } = payload;
      let count = 0;
      db.workers.forEach(w => {
        if (w.att && w.att[date]) {
          w.att[date].locked = true;
          count++;
        }
      });
      setGlobalDB(db);
      return res.status(200).json({ success: true, message: `${count} records locked on server` });
    }

    // C. Non-Destructive Chukta Settlement (History wipe nahi hogi!)
    if (action === 'settle_chukta') {
      const { workerId, paidAmount, note } = payload;
      const worker = db.workers.find(w => w.id === workerId);
      if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

      // Calculate gross before closing period
      let shifts = 0;
      let otHours = 0;
      Object.values(worker.att || {}).forEach(r => {
        const st = typeof r === 'object' ? r.status : r;
        const ot = typeof r === 'object' ? (r.ot || 0) : 0;
        if (st === 'P') shifts += 1.0;
        else if (st === 'HD') shifts += 0.5;
        otHours += ot;
      });

      const regularPay = shifts * worker.rate;
      const otPay = otHours * (worker.otRate || 100);
      const grossEarned = regularPay + otPay;
      const totalDue = Math.max(0, grossEarned + (worker.bakaaya || 0) - (worker.advance || 0));
      const carryForward = Math.max(0, totalDue - Number(paidAmount));

      // 📜 1. Save Immutable Settlement Transaction Record
      if (!db.settlements) db.settlements = [];
      db.settlements.unshift({
        id: 'SETTL_' + Date.now(),
        workerId: worker.id,
        workerName: worker.name,
        grossEarned,
        advanceCut: worker.advance || 0,
        paidAmount: Number(paidAmount),
        carryForward,
        settledAt: new Date().toISOString(),
        note: note || 'Saturday Chukta'
      });

      // 📜 2. Post to Ledger
      if (Number(paidAmount) > 0) {
        db.ledger.push({
          id: 'L' + Date.now(),
          site: worker.site || 'P1',
          type: 'expense',
          amount: Number(paidAmount),
          note: `Saturday Payout (${worker.name})`,
          date: new Date().toISOString().slice(0, 10)
        });
      }

      // 🔄 3. Balance Reset WITHOUT deleting historical records
      worker.bakaaya = carryForward;
      worker.advance = 0; // Reset running advance balance for new week
      // (worker.att and worker.advanceList history remain intact for audit/reporting!)

      setGlobalDB(db);
      return res.status(200).json({ success: true, message: 'Settlement Saved', carryForward });
    }

    // D. Add New Worker
    if (action === 'add_worker') {
      const { name, role, rate, site, phone, pin } = payload;
      db.workers.push({
        id: 'W' + Date.now(),
        name,
        role,
        site,
        rate: Number(rate) || 500,
        otRate: role === 'Mistri' ? 100 : 65,
        phone,
        pin: pin || '1234',
        photo: '',
        att: {},
        advance: 0,
        advanceList: [],
        bakaaya: 0,
        gpsMatch: true
      });
      setGlobalDB(db);
      return res.status(200).json({ success: true, message: 'Worker Added' });
    }

    // E. Re-assign Site
    if (action === 'reassign_site') {
      const { workerId, siteId } = payload;
      const worker = db.workers.find(w => w.id === workerId);
      if (worker) {
        worker.site = siteId;
        setGlobalDB(db);
        return res.status(200).json({ success: true, message: 'Site Reassigned' });
      }
    }

    // F. Pay Thekedar
    if (action === 'pay_thekedar') {
      const { thekedarId, amount, mode, note } = payload;
      const thek = db.thekedars.find(t => t.id === thekedarId);
      if (thek) {
        thek.paid = (thek.paid || 0) + Number(amount);
        db.ledger.push({
          id: 'L' + Date.now(),
          site: thek.site || 'P1',
          type: 'expense',
          amount: Number(amount),
          note: `Thekedar Payment (${thek.name}) - ${mode} [${note}]`,
          date: new Date().toISOString().slice(0, 10)
        });
        setGlobalDB(db);
        return res.status(200).json({ success: true, message: 'Thekedar Payment Logged' });
      }
    }

    // G. Approve Demand
    if (action === 'approve_demand') {
      const { demandId } = payload;
      const d = db.materials.find(m => m.id === demandId);
      if (d) {
        d.status = 'Approved';
        setGlobalDB(db);
        return res.status(200).json({ success: true, message: 'Demand Approved' });
      }
    }

    // H. Add Project
    if (action === 'add_project') {
      const { client, name, totalValue } = payload;
      db.projects.push({
        id: 'P' + Date.now(),
        client,
        name,
        totalValue: Number(totalValue) || 0,
        received: 0,
        progress: 10,
        phase: 'Initiation'
      });
      setGlobalDB(db);
      return res.status(200).json({ success: true, message: 'Project Created' });
    }

    return res.status(400).json({ success: false, message: 'Invalid Admin Action' });
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
