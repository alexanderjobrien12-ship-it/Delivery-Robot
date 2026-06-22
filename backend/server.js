const express = require('express');
const cors    = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;

// When deployed to Render, set BACKEND_PUBLIC_URL to your Render URL.
// Until then, magic-link status updates only work on your home network.
const PUBLIC_URL = process.env.BACKEND_PUBLIC_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

// ── Order queue ───────────────────────────────────────────────────────────────
let orders = [];
let nextId = 1;

// All valid statuses in the order they happen
const VALID_STATUSES = ['pending', 'preparing', 'loading', 'in_transit', 'arriving', 'delivered'];

// Human-readable labels for each status (used in emails and the update page)
const STATUS_LABELS = {
  pending:    'Order received',
  preparing:  'Item being prepared',
  loading:    'Robot being loaded',
  in_transit: 'Robot in transit',
  arriving:   'Arriving soon',
  delivered:  'Delivered!',
};

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ── Email setup ───────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// Builds one big HTML button for each status step you can tap on your phone
function buildStatusButtons(order) {
  const future = VALID_STATUSES.filter(s => s !== 'pending' && s !== order.status);
  return future.map(status => {
    const url = `${PUBLIC_URL}/orders/${order.id}/update?status=${status}&secret=${process.env.ROBOT_SECRET}`;
    return `
      <a href="${url}" style="
        display:inline-block;
        padding:12px 20px;
        margin:6px 4px;
        background:#6366f1;
        color:white;
        text-decoration:none;
        border-radius:10px;
        font-family:sans-serif;
        font-weight:700;
        font-size:14px;
      ">${STATUS_LABELS[status]}</a>`;
  }).join('');
}

async function sendOrderEmail(order) {
  try {
    await resend.emails.send({
      from:    'OrderIt! <onboarding@resend.dev>',
      to:      [process.env.NOTIFY_EMAIL],
      subject: `New Order #${order.id} — ${order.item} to ${order.room}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#1e1b4b">New delivery order!</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#64748b">Order #</td><td><strong>${order.id}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Room</td><td><strong>${order.room}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Item</td><td><strong>${order.item}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Note</td><td>${order.note || '—'}</td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>

          <p style="color:#374151;font-weight:600;margin-bottom:10px">
            Tap to update status from your phone:
          </p>
          <div>${buildStatusButtons(order)}</div>
        </div>
      `,
    });
    console.log(`Email sent for order #${order.id}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /orders — website places a new order
app.post('/orders', async (req, res) => {
  const { room, item, note } = req.body;

  if (!room || !item) {
    return res.status(400).json({ error: 'Room and item are required.' });
  }

  const now = new Date().toISOString();
  const order = {
    id: nextId++,
    room,
    item,
    note:          note || '',
    status:        'pending',
    statusHistory: { pending: now }, // tracks the time each status was reached
    createdAt:     now,
  };

  orders.push(order);
  console.log(`New order #${order.id}: "${order.item}" → ${order.room}`);

  sendOrderEmail(order);
  res.status(201).json(order);
});

// GET /orders/:id/update — magic link tapped from phone email
// Opens a simple page that updates the status and confirms it
app.get('/orders/:id/update', (req, res) => {
  const secret = req.query.secret;
  const status = req.query.status;

  if (secret !== process.env.ROBOT_SECRET) {
    return res.status(403).send('<p>Unauthorized.</p>');
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).send('<p>Invalid status.</p>');
  }

  const id    = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).send('<p>Order not found.</p>');
  }

  order.status = status;
  order.statusHistory[status] = new Date().toISOString();
  console.log(`Order #${id} → ${status}`);

  // Build "next steps" buttons so you can keep tapping forward
  const nextButtons = buildStatusButtons(order);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>OrderIt! — Status Updated</title>
      <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 40px 20px; background: #f0f4ff; }
        h1   { color: #1e1b4b; }
        .pill { display: inline-block; background: #eef2ff; color: #6366f1; padding: 8px 18px; border-radius: 999px; font-weight: 700; font-size: 18px; margin: 12px 0; }
        p    { color: #64748b; }
        .btns { margin-top: 28px; }
      </style>
    </head>
    <body>
      <h1>Updated!</h1>
      <div class="pill">${STATUS_LABELS[status]}</div>
      <p>Order #${id} (${order.item} → ${order.room})<br/>The app updates automatically.</p>
      ${nextButtons ? `<div class="btns"><p style="color:#374151;font-weight:600">Next step:</p>${nextButtons}</div>` : ''}
    </body>
    </html>
  `);
});

// GET /orders — all orders (useful for debugging)
app.get('/orders', (req, res) => {
  res.json(orders);
});

// GET /orders/pending — EV3 robot polls this
app.get('/orders/pending', (req, res) => {
  if (req.headers['x-robot-secret'] !== process.env.ROBOT_SECRET) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  const next = orders.find(o => o.status === 'pending');
  res.json({ order: next || null });
});

// PATCH /orders/:id — user edits an order (only allowed before robot is loaded)
app.patch('/orders/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const editableStatuses = ['pending', 'preparing'];
  if (!editableStatuses.includes(order.status)) {
    return res.status(400).json({ error: 'Order can no longer be edited.' });
  }

  const { room, item, note } = req.body;
  if (room) order.room = room;
  if (item) order.item = item;
  if (note !== undefined) order.note = note;
  order.editedAt = new Date().toISOString();

  console.log(`Order #${id} edited`);
  sendEditEmail(order);
  res.json(order);
});

async function sendEditEmail(order) {
  try {
    await resend.emails.send({
      from:    'OrderIt! <onboarding@resend.dev>',
      to:      [process.env.NOTIFY_EMAIL],
      subject: `Order #${order.id} was edited — ${order.item} to ${order.room}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#1e1b4b">Order #${order.id} was edited</h2>
          <p style="color:#64748b">Here's what it looks like now:</p>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#64748b">Room</td><td><strong>${order.room}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Item</td><td><strong>${order.item}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Note</td><td>${order.note || '—'}</td></tr>
          </table>
        </div>
      `,
    });
    console.log(`Edit email sent for order #${order.id}`);
  } catch (err) {
    console.error('Edit email failed:', err.message);
  }
}

// PATCH /orders/:id/status — robot updates status
app.patch('/orders/:id/status', (req, res) => {
  if (req.headers['x-robot-secret'] !== process.env.ROBOT_SECRET) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const id     = parseInt(req.params.id);
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  order.status = status;
  order.statusHistory[status] = new Date().toISOString();
  console.log(`Order #${id} → ${status}`);
  res.json(order);
});

// GET /orders/:id — website polls this for live status
app.get('/orders/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json(order);
});

app.get('/', (req, res) => {
  res.json({ message: 'OrderIt! server running', orders: orders.length });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
