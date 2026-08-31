// =========================================================================
// 👷 SCOPED WORKER API ENDPOINT (/api/worker)
// =========================================================================

import { getGlobalDB, setGlobalDB } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getGlobalDB();

  // 1. GET WORKER'S SCOPED PORTAL DATA
  if (req.method === 'GET') {
    const { workerId, phone } = req.query;

    const worker = (db.workers || []).find(w => w.id === workerId || w.phone === phone);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker account nahi mila' });
    }

    const assignedProject = (db.projects || []).find(p => p.id === worker.site) || { name: 'General Site' };
    const myDemands = (db.materials || []).filter(m => m.requestedBy === worker.name).slice(0, 10);

    // Calculate wages server-side (Consistent OT rate calculation)
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
    const netDue = Math.max(0, grossEarned + (worker.bakaaya || 0) - (worker.advance || 0));

    return res.status(200).json({
      success: true,
      worker: {
        id: worker.id,
        name: worker.name,
        role: worker.role,
        rate: worker.rate,
        otRate: worker.otRate || 100,
        photo: worker.photo || '',
        siteName: assignedProject.name,
        siteId: worker.site,
        att: worker.att || {},
        advanceList: worker.advanceList || [],
        financials: {
          shifts,
          otHours,
          regularPay,
          otPay,
          grossEarned,
          advance: worker.advance || 0,
          bakaaya: worker.bakaaya || 0,
          netDue
        }
      },
      demands: myDemands
    });
  }

  // 2. POST WORKER ACTION (Controlled state mutations)
  if (req.method === 'POST') {
    const { action, workerId, payload } = req.body || {};
    const worker = (db.workers || []).find(w => w.id === workerId);

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Unauthorized worker operation' });
    }

    // A. Cash Kharcha Advance Request
    if (action === 'request_kharcha') {
      const amt = Number(payload.amount);
      if (amt <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

      worker.advance = (worker.advance || 0) + amt;
      if (!worker.advanceList) worker.advanceList = [];
      const todayStr = new Date().toISOString().slice(0, 10);
      worker.advanceList.unshift({ date: todayStr, amount: amt, reason: payload.reason || 'Field Cash' });

      // Automatically post to company ledger
      db.ledger.push({
        id: 'L' + Date.now(),
        site: worker.site || 'P1',
        type: 'expense',
        amount: amt,
        note: `Labour Field Advance (${worker.name})`,
        date: todayStr
      });

      setGlobalDB(db);
      return res.status(200).json({ success: true, message: 'Advance Logged' });
    }

    // B. Submit Material / Manpower Demand
    if (action === 'submit_demand') {
      db.materials.unshift({
        id: (payload.type === 'manpower' ? 'LBR' : 'M') + Date.now(),
        type: payload.type || 'material',
        category: payload.category || 'General',
        item: payload.item,
        urgency: payload.urgency || 'Normal',
        shift: payload.shift || '',
        site: worker.site || 'P1',
        supplier: payload.supplier || 'Gupta Building Material',
        requestedBy: worker.name,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'Pending'
      });

      setGlobalDB(db);
      return res.status(200).json({ success: true, message: 'Demand Sent to Admin' });
    }

    // C. Upload Site Pack-Up Proof Photo
    if (action === 'upload_proof') {
      const proj = (db.projects || []).find(p => p.id === worker.site) || { name: 'General Site' };
      db.siteProofs.unshift({
        id: 'SP' + Date.now(),
        worker: worker.name,
        site: proj.name,
        time: `Today • ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        img: payload.img
      });

      setGlobalDB(db);
      return res.status(200).json({ success: true, message: 'Pack-Up Proof Saved' });
    }

    // D. Update Profile Photo
    if (action === 'update_photo') {
      worker.photo = payload.photo;
      setGlobalDB(db);
      return res.status(200).json({ success: true, message: 'Profile Photo Updated' });
    }

    return res.status(400).json({ success: false, message: 'Unknown Worker Action' });
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
