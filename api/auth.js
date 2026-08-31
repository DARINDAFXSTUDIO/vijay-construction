export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false });

  const { action, phone, pin, adminPin, dbData } = req.body || {};

  // 1. Admin Verification
  if (action === 'admin_login') {
    if (adminPin === "2026") {
      return res.status(200).json({ success: true, role: 'admin' });
    }
    return res.status(401).json({ success: false, message: 'Galat Admin PIN' });
  }

  // 2. Worker / Thekedar Verification
  if (action === 'worker_login') {
    const workers = dbData?.workers || [];
    const thekedars = dbData?.thekedars || [];

    const workerMatch = workers.find(w => String(w.phone).trim() === String(phone).trim() && String(w.pin || '1234') === String(pin).trim());
    const thekMatch = thekedars.find(t => String(t.phone).trim() === String(phone).trim() && String(t.pin || '1234') === String(pin).trim());

    if (workerMatch) {
      return res.status(200).json({ success: true, role: 'labour', user: workerMatch });
    } else if (thekMatch) {
      return res.status(200).json({ success: true, role: 'subcon', user: thekMatch });
    }
    return res.status(401).json({ success: false, message: 'Galat Phone ya PIN' });
  }

  return res.status(400).json({ success: false });
}
