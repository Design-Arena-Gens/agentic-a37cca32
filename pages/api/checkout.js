export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  const { name, email, address, items, total } = req.body || {};
  if (!name || !email || !address || !Array.isArray(items) || !Number.isFinite(total)) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }
  await new Promise((r) => setTimeout(r, 600));
  return res.status(200).json({
    success: true,
    message: `Thanks ${name}! Your order (${items.length} items, total $${total.toFixed(
      2
    )}) has been placed.`,
    orderId: Math.random().toString(36).slice(2, 10)
  });
}

