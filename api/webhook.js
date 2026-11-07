export default async function handler(req, res) {
  // 1. Meta Webhook Doğrulaması (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = process.env.VERIFY_TOKEN || 'carechat123';

    if (mode === 'subscribe' && token === verifyToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // 2. Gelen WhatsApp Mesajlarını Local Sunucuya İletme (POST Proxy)
  if (req.method === 'POST') {
    const localServerUrl = process.env.LOCAL_SERVER_URL;
    const webhookSecret = process.env.WEBHOOK_SECRET || '';

    if (!localServerUrl) {
      console.error('LOCAL_SERVER_URL tanimli degil.');
      return res.status(200).send('OK');
    }

    try {
      const response = await fetch(localServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': webhookSecret
        },
        body: JSON.stringify(req.body)
      });

      const data = await response.text();
      return res.status(200).send(data || 'OK');
    } catch (error) {
      console.error('Local sunucuya iletim hatasi:', error.message);
      return res.status(200).send('OK');
    }
  }

  return res.status(405).send('Method Not Allowed');
}
