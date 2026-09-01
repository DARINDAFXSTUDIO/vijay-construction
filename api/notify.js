export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, message, targetPlayerId } = req.body;
  const ONESIGNAL_REST_KEY = process.env.ONESIGNAL_REST_KEY || "os_v2_app_p6vk56atavc7lkvd5fqtngztx6nkibk3p45uojmwaolar3lkfyhhtk75c77yipsmxtlouhguvxekrpika5isdlevgntsbbxbe7jjy5q";

  const payload = {
    app_id: "7faaaef8-1305-45f5-aaa3-e961369b33bf",
    headings: { en: title },
    contents: { en: message }
  };

  if (targetPlayerId) {
    payload.include_player_ids = [targetPlayerId];
  } else {
    payload.included_segments = ["Total Subscriptions"];
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
