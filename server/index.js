const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors());

const dataPath = (file) => path.join(__dirname, 'data', file);
const readJson = (file) => JSON.parse(fs.readFileSync(dataPath(file), 'utf-8'));
const writeJson = (file, data) => fs.writeFileSync(dataPath(file), JSON.stringify(data, null, 2));

const priceToCents = (price) => {
  const num = parseFloat(String(price).replace(/[^\d.,]/g, '').replace(',', '.'));
  return Math.round(num * 100);
};

const generateTicketCode = (eventId) =>
  `RBS-${String(eventId).padStart(4, '0')}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

// --- Stripe webhook (needs raw body — must be registered BEFORE express.json()) ---
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { type } = session.metadata || {};

    try {
      if (type === 'product') {
        const orders = readJson('orders.json');
        const order = orders.find((o) => o.sessionId === session.id);
        if (order) {
          order.status = 'paid';
          order.paidAt = new Date().toISOString();
          writeJson('orders.json', orders);
        }
      } else if (type === 'ticket') {
        const tickets = readJson('tickets.json');
        const ticket = tickets.find((t) => t.sessionId === session.id);
        if (ticket) {
          ticket.status = 'paid';
          ticket.paidAt = new Date().toISOString();
          ticket.code = generateTicketCode(ticket.eventId);
          ticket.qr = await QRCode.toDataURL(ticket.code, { margin: 1, width: 480 });
          writeJson('tickets.json', tickets);
        }
      }
    } catch (err) {
      console.error('Failed to process webhook event:', err);
    }
  }

  res.json({ received: true });
});

app.use(express.json());

app.get('/api/products', (req, res) => {
  try {
    res.json(readJson('products.json'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.get('/api/events', (req, res) => {
  try {
    res.json(readJson('events.json'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// Past events (recap only — not sellable, no checkout)
app.get('/api/archive', (req, res) => {
  try {
    res.json(readJson('archive.json'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load archive' });
  }
});

app.get('/api/tracks', (req, res) => {
  try {
    res.json(readJson('tracks.json'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load tracks' });
  }
});

app.post('/api/contact', (req, res) => {
  const { firstName, lastName, subject, message } = req.body || {};
  console.log('--- NEW CONTACT MESSAGE ---');
  console.log('From:', firstName, lastName);
  console.log('Subject:', subject);
  console.log('Message:', message);
  console.log('---------------------------');
  res.json({ success: true });
});

// --- Checkout: t-shirts / merch ---
app.post('/api/checkout/product', async (req, res) => {
  try {
    const { productId, size } = req.body || {};
    const products = readJson('products.json');
    const product = products.find((p) => p.id === productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!size) return res.status(400).json({ error: 'Size is required' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: `${product.name} — Taille ${size}` },
            unit_amount: priceToCents(product.price),
          },
          quantity: 1,
        },
      ],
      success_url: `${CLIENT_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/store`,
      metadata: { type: 'product', productId: String(product.id), productName: product.name, size, price: product.price },
    });

    const orders = readJson('orders.json');
    orders.push({
      sessionId: session.id,
      productId: product.id,
      productName: product.name,
      price: product.price,
      size,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    writeJson('orders.json', orders);

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout (product) failed:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

app.get('/api/orders/:sessionId', (req, res) => {
  const orders = readJson('orders.json');
  const order = orders.find((o) => o.sessionId === req.params.sessionId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// --- Checkout: event tickets ---
app.post('/api/checkout/ticket', async (req, res) => {
  try {
    const { eventId } = req.body || {};
    const events = readJson('events.json');
    const event = events.find((e) => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: `${event.name} — ${event.location}` },
            unit_amount: priceToCents(event.price),
          },
          quantity: 1,
        },
      ],
      success_url: `${CLIENT_URL}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/ticket-office`,
      metadata: { type: 'ticket', eventId: String(event.id), eventName: event.name, price: event.price },
    });

    const tickets = readJson('tickets.json');
    tickets.push({
      sessionId: session.id,
      eventId: event.id,
      eventName: event.name,
      location: event.location,
      date: event.date,
      price: event.price,
      status: 'pending',
      code: null,
      qr: null,
      createdAt: new Date().toISOString(),
    });
    writeJson('tickets.json', tickets);

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout (ticket) failed:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

app.get('/api/tickets/:sessionId', (req, res) => {
  const tickets = readJson('tickets.json');
  const ticket = tickets.find((t) => t.sessionId === req.params.sessionId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

app.get('/', (req, res) => {
  res.json({
    status: 'RBS API running',
    endpoints: [
      '/api/products',
      '/api/events',
      '/api/archive',
      '/api/tracks',
      '/api/contact',
      '/api/checkout/product',
      '/api/checkout/ticket',
      '/api/orders/:sessionId',
      '/api/tickets/:sessionId',
      '/api/webhook',
    ],
  });
});

app.listen(PORT, () => {
  console.log(`RBS server running on http://localhost:${PORT}`);
});
