// =========================================================================
// 🔒 SERVERLESS AUTHENTICATION ENDPOINT (/api/auth)
// =========================================================================

// Shared Database Storage (Persistent in-memory / Serverless state)
import { getGlobalDB } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const { action, phone, pin, adminPin } = req.body || {};
  const db = getGlobalDB();

  // 1. ADMIN AUTHENTICATION (Master PIN server par verify hota hai)
  if (action === 'admin_login') {
    const MASTER_PIN = process.env.ADMIN_PIN || "2026";
    if (adminPin === MASTER_PIN) {
      const adminToken = `vj_adm_${Buffer.from(`admin_${Date.now()}`).toString('base64')}`;
      return res.status(200).json({
        success: true,
        role: 'admin',
        token: adminToken,
        message: 'Admin Hub Authenticated'
      });
    }
    return res.status(401).json({ success: false, message: 'Galat Master PIN!' });
  }

  // 2. WORKER / SUBCONTRACTOR AUTHENTICATION (Sirf authenticated user ka data return hoga)
  if (action === 'worker_login') {
    if (!phone || !pin) {
      return res.status(400).json({ success: false, message: 'Phone aur PIN required hain' });
    }

    const cleanPhone = String(phone).trim();
    const cleanPin = String(pin).trim();

    // Check Worker
    const worker = (db.workers || []).find(w => String(w.phone).trim() === cleanPhone && String(w.pin || '1234').trim() === cleanPin);
    if (worker) {
      const workerToken = `vj_usr_${Buffer.from(`${worker.id}_${Date.now()}`).toString('base64')}`;
      return res.status(200).json({
        success: true,
        role: 'labour',
        token: workerToken,
        userId: worker.id,
        user: {
          id: worker.id,
          name: worker.name,
          role: worker.role,
          trade: worker.role,
          site: worker.site,
          rate: worker.rate,
          otRate: worker.otRate || 100,
          photo: worker.photo || ''
        }
      });
    }

    // Check Subcontractor (Thekedar)
    const thekedar = (db.thekedars || []).find(t => String(t.phone).trim() === cleanPhone && String(t.pin || '1234').trim() === cleanPin);
    if (thekedar) {
      const thekToken = `vj_thk_${Buffer.from(`${thekedar.id}_${Date.now()}`).toString('base64')}`;
      return res.status(200).json({
        success: true,
        role: 'subcon',
        token: thekToken,
        userId: thekedar.id,
        user: {
          id: thekedar.id,
          name: thekedar.name,
          role: 'subcon',
          trade: thekedar.work,
          work: thekedar.work,
          site: thekedar.site,
          value: thekedar.value,
          paid: thekedar.paid,
          progress: thekedar.progress || 0
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Galat Mobile Number ya PIN!' });
  }

  return res.status(400).json({ success: false, message: 'Invalid Action' });
}
