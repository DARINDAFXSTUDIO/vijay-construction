let serverMasterDB = null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Data Mangna (GET)
  if (req.method === 'GET') {
    return res.status(200).json({ success: true, data: serverMasterDB });
  }

  // Data Save Karna (POST)
  if (req.method === 'POST') {
    serverMasterDB = req.body;
    return res.status(200).json({ success: true, message: 'Cloud Synced' });
  }

  return res.status(405).json({ success: false });
}
