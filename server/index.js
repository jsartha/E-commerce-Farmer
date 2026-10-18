import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { DatabaseSync } from 'node:sqlite';
import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
  pbkdf2,
} from 'node:crypto';
import { promisify } from 'node:util';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const accountTypes = new Set(['user', 'farmer', 'agri-business']);
const orderStatuses = new Set(['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled']);
const accountDataRoles = new Map([
  ['farmer-dashboard', 'farmer'],
  ['agri-business-dashboard', 'agri-business'],
  ['farmer-agri-orders', 'farmer'],
]);
const accountDataKeys = new Set([
  'farmer-dashboard',
  'agri-business-dashboard',
  'customer-orders',
  'farmer-agri-orders',
]);
const verificationCodes = new Map();
const pbkdf2Async = promisify(pbkdf2);

const databasePath = process.env.DATABASE_PATH
  ? resolve(process.env.DATABASE_PATH)
  : resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'marketplace.sqlite');
mkdirSync(dirname(databasePath), { recursive: true });
const database = new DatabaseSync(databasePath);
database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS accounts (
    email TEXT PRIMARY KEY,
    user_json TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL REFERENCES accounts(email) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_email_idx ON sessions(email);
  CREATE TABLE IF NOT EXISTS account_data (
    email TEXT NOT NULL REFERENCES accounts(email) ON DELETE CASCADE,
    data_key TEXT NOT NULL,
    data_json TEXT NOT NULL,
    PRIMARY KEY (email, data_key)
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    seller_email TEXT NOT NULL REFERENCES accounts(email),
    buyer_email TEXT NOT NULL REFERENCES accounts(email),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    total_price REAL NOT NULL,
    order_date TEXT NOT NULL,
    status TEXT NOT NULL,
    delivery_address TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS orders_seller_date_idx ON orders(seller_email, order_date DESC);
  CREATE INDEX IF NOT EXISTS orders_buyer_date_idx ON orders(buyer_email, order_date DESC);
`);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const hashPassword = async (password, salt = randomBytes(16)) => ({
  salt: salt.toString('hex'),
  hash: (await pbkdf2Async(password, salt, 310000, 32, 'sha256')).toString('hex'),
});

const verifyPassword = async (password, saltHex, expectedHashHex) => {
  const { hash } = await hashPassword(password, Buffer.from(saltHex, 'hex'));
  const actual = Buffer.from(hash, 'hex');
  const expected = Buffer.from(expectedHashHex, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

const createSession = (email) => {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  database.prepare(
    'INSERT INTO sessions (token_hash, email, expires_at) VALUES (?, ?, ?)'
  ).run(tokenHash, email, Date.now() + 30 * 24 * 60 * 60 * 1000);
  return token;
};

const requireSession = (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const session = database.prepare(`
    SELECT accounts.email, accounts.user_json
    FROM sessions
    JOIN accounts ON accounts.email = sessions.email
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(tokenHash, Date.now());
  if (!session) return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });

  req.account = {
    email: session.email,
    user: JSON.parse(session.user_json),
  };
  req.sessionTokenHash = tokenHash;
  return next();
};

const normalizeUser = (value) => {
  const email = String(value?.email || '').trim().toLowerCase();
  const name = String(value?.name || '').trim();
  const accountType = accountTypes.has(value?.accountType) ? value.accountType : 'user';
  if (!emailPattern.test(email) || !name) return null;
  return {
    name,
    email,
    provider: 'email',
    accountType,
    phone: String(value?.phone || '').trim(),
    birthDate: String(value?.birthDate || '').trim(),
    state: String(value?.state || '').trim(),
    district: String(value?.district || '').trim(),
    village: String(value?.village || '').trim(),
    farmSize: String(value?.farmSize || '').trim(),
    crops: Array.isArray(value?.crops) ? value.crops.filter((item) => typeof item === 'string') : [],
    businessName: String(value?.businessName || '').trim(),
    businessAddress: String(value?.businessAddress || '').trim(),
    productCategories: Array.isArray(value?.productCategories)
      ? value.productCategories.filter((item) => typeof item === 'string')
      : [],
    ...(typeof value?.avatar === 'string' ? { avatar: value.avatar } : {}),
  };
};

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

const sendCodeEmail = async ({ email, name, purpose }) => {
  if (!emailPattern.test(email)) {
    return { error: 'A valid email address is required.' };
  }

  if (!isSmtpConfigured()) {
    return {
      error: 'SMTP email delivery is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment.',
      status: 503,
    };
  }

  const code = String(randomInt(100000, 1000000));
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Reset your Farmer account password',
    text: `Hello ${name},\n\nYour password reset code is ${code}. This code expires in 10 minutes.\n\nEnter this code in the app to reset your password.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">Reset your password</h2>
        <p>Hello ${escapeHtml(name)},</p>
        <p>Your password reset code is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 8px; margin: 18px 0; color: #1f2937;">${code}</div>
        <p>This code expires in 10 minutes.</p>
        <p>Enter this code in the app to reset your password.</p>
      </div>
    `,
  });

  verificationCodes.set(`${purpose}:${email}`, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
  return { success: true, message: `Code sent to ${email}.` };
};

const mapOrder = (row) => ({
  id: row.id,
  customerName: row.customer_name,
  customerEmail: row.buyer_email,
  customerPhone: row.customer_phone,
  productName: row.product_name,
  productId: row.product_id,
  quantity: row.quantity,
  unit: row.unit,
  totalPrice: row.total_price,
  orderDate: row.order_date,
  status: row.status,
  deliveryAddress: row.delivery_address,
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, smtpConfigured: isSmtpConfigured(), database: 'sqlite' });
});

app.post('/api/auth/register', async (req, res) => {
  const user = normalizeUser(req.body?.user);
  const password = String(req.body?.password || '');
  if (!user) return res.status(400).json({ error: 'A valid name, email, and account type are required.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must contain at least 8 characters.' });

  const passwordData = await hashPassword(password);
  try {
    database.prepare(`
      INSERT INTO accounts (email, user_json, password_salt, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(user.email, JSON.stringify(user), passwordData.salt, passwordData.hash);
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'This email is already registered.' });
    }
    throw error;
  }

  return res.status(201).json({ user, sessionToken: createSession(user.email) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const account = database.prepare(
    'SELECT user_json, password_salt, password_hash FROM accounts WHERE email = ?'
  ).get(email);
  if (!account || !(await verifyPassword(password, account.password_salt, account.password_hash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const user = JSON.parse(account.user_json);
  return res.json({ user, sessionToken: createSession(email) });
});

app.get('/api/auth/session', requireSession, (req, res) => {
  res.json({ user: req.account.user });
});

app.patch('/api/auth/profile', requireSession, (req, res) => {
  const account = database.prepare('SELECT user_json FROM accounts WHERE email = ?').get(req.account.email);
  const currentUser = JSON.parse(account.user_json);
  const user = normalizeUser({
    ...currentUser,
    ...req.body?.profile,
    email: req.account.email,
    accountType: currentUser.accountType,
  });
  if (!user) return res.status(400).json({ error: 'The profile details are invalid.' });
  database.prepare('UPDATE accounts SET user_json = ? WHERE email = ?')
    .run(JSON.stringify(user), req.account.email);
  return res.json({ user });
});

app.post('/api/auth/logout', requireSession, (req, res) => {
  database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(req.sessionTokenHash);
  return res.json({ success: true });
});

app.get('/api/account-data/:key', requireSession, (req, res) => {
  if (!accountDataKeys.has(req.params.key)) {
    return res.status(400).json({ error: 'Unsupported account data key.' });
  }
  const requiredRole = accountDataRoles.get(req.params.key);
  if (requiredRole && req.account.user.accountType !== requiredRole) {
    return res.status(403).json({ error: 'Your account type cannot access this data.' });
  }
  const row = database.prepare(
    'SELECT data_json FROM account_data WHERE email = ? AND data_key = ?'
  ).get(req.account.email, req.params.key);
  return res.json({ data: row ? JSON.parse(row.data_json) : null });
});

app.put('/api/account-data/:key', requireSession, (req, res) => {
  if (!accountDataKeys.has(req.params.key)) {
    return res.status(400).json({ error: 'Unsupported account data key.' });
  }
  const requiredRole = accountDataRoles.get(req.params.key);
  if (requiredRole && req.account.user.accountType !== requiredRole) {
    return res.status(403).json({ error: 'Your account type cannot update this data.' });
  }
  if (!Object.hasOwn(req.body || {}, 'data')) {
    return res.status(400).json({ error: 'Account data is required.' });
  }
  database.prepare(`
    INSERT INTO account_data (email, data_key, data_json) VALUES (?, ?, ?)
    ON CONFLICT(email, data_key) DO UPDATE SET data_json = excluded.data_json
  `).run(req.account.email, req.params.key, JSON.stringify(req.body.data));
  return res.json({ data: req.body.data });
});

app.get('/api/marketplace/listings', requireSession, (_req, res) => {
  const rows = database.prepare(`
    SELECT accounts.email, accounts.user_json, account_data.data_key, account_data.data_json
    FROM account_data
    JOIN accounts ON accounts.email = account_data.email
    WHERE account_data.data_key IN ('farmer-dashboard', 'agri-business-dashboard')
  `).all();
  const products = rows.flatMap((row) => {
    const user = JSON.parse(row.user_json);
    const snapshot = JSON.parse(row.data_json);
    if (!Array.isArray(snapshot.products)) return [];
    const sellerType = row.data_key === 'farmer-dashboard' ? 'farmer' : 'agri-business';
    return snapshot.products.map((product) => ({
      ...product,
      sellerType,
      sellerEmail: row.email,
      sellerName: sellerType === 'agri-business' ? user.businessName || user.name : user.name,
      ...(sellerType === 'agri-business'
        ? { sellerLocation: [user.district, user.state].filter(Boolean).join(', ') }
        : {}),
    }));
  });
  return res.json({ products });
});

app.post('/api/orders', requireSession, (req, res) => {
  const body = req.body || {};
  const id = String(body.id || '').trim();
  const sellerEmail = String(body.sellerEmail || '').trim().toLowerCase();
  const productId = String(body.productId || '').trim();
  const productName = String(body.productName || '').trim();
  const unit = String(body.unit || '').trim();
  const deliveryAddress = String(body.deliveryAddress || '').trim();
  const quantity = Number(body.quantity);
  const seller = database.prepare('SELECT user_json FROM accounts WHERE email = ?').get(sellerEmail);
  if (!id || id.length > 120 || !sellerEmail || !productId || !productName || !unit || !deliveryAddress) {
    return res.status(400).json({ error: 'Order details are incomplete.' });
  }
  if (!seller || JSON.parse(seller.user_json).accountType !== 'farmer') {
    return res.status(404).json({ error: 'The farmer account for this listing could not be found.' });
  }
  if (sellerEmail === req.account.email) {
    return res.status(400).json({ error: 'You cannot place an order for your own listing.' });
  }
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Enter a valid order quantity.' });
  }
  const sellerSnapshot = database.prepare(
    'SELECT data_json FROM account_data WHERE email = ? AND data_key = ?'
  ).get(sellerEmail, 'farmer-dashboard');
  const products = sellerSnapshot ? JSON.parse(sellerSnapshot.data_json).products : [];
  const product = Array.isArray(products)
    ? products.find((item) => item.id === productId)
    : null;
  if (!product || product.status === 'Out of Stock') {
    return res.status(404).json({ error: 'This farmer listing is no longer available.' });
  }
  const availableQuantity = Number(product.quantity);
  if (!Number.isFinite(availableQuantity) || quantity > availableQuantity) {
    return res.status(400).json({ error: 'The requested quantity is greater than the available stock.' });
  }
  const unitPrice = Number(product.price);
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    return res.status(400).json({ error: 'The listing price is invalid.' });
  }
  const totalPrice = quantity * unitPrice;
  if (!Number.isFinite(totalPrice)) {
    return res.status(400).json({ error: 'The order total is invalid.' });
  }
  const order = {
    id,
    customerName: req.account.user.name,
    customerEmail: req.account.email,
    customerPhone: req.account.user.phone || '',
    productName: String(product.name || productName),
    productId,
    quantity,
    unit: String(product.unit || unit),
    totalPrice,
    orderDate: new Date().toISOString(),
    status: 'Pending',
    deliveryAddress,
  };
  try {
    database.prepare(`
      INSERT INTO orders (
        id, seller_email, buyer_email, customer_name, customer_phone, product_name,
        product_id, quantity, unit, total_price, order_date, status, delivery_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      order.id,
      sellerEmail,
      req.account.email,
      order.customerName,
      order.customerPhone,
      order.productName,
      order.productId,
      order.quantity,
      order.unit,
      order.totalPrice,
      order.orderDate,
      order.status,
      order.deliveryAddress
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'This order has already been recorded.' });
    }
    throw error;
  }
  return res.status(201).json({ order });
});

app.get('/api/farmer/orders', requireSession, (req, res) => {
  if (req.account.user.accountType !== 'farmer') {
    return res.status(403).json({ error: 'Only farmer accounts can view farmer orders.' });
  }
  const rows = database.prepare(
    'SELECT * FROM orders WHERE seller_email = ? ORDER BY order_date DESC'
  ).all(req.account.email);
  return res.json({ orders: rows.map(mapOrder) });
});

app.patch('/api/farmer/orders/:id/status', requireSession, (req, res) => {
  if (req.account.user.accountType !== 'farmer') {
    return res.status(403).json({ error: 'Only farmer accounts can update farmer orders.' });
  }
  const status = String(req.body?.status || '');
  if (!orderStatuses.has(status)) return res.status(400).json({ error: 'Invalid order status.' });
  const result = database.prepare(
    'UPDATE orders SET status = ? WHERE id = ? AND seller_email = ?'
  ).run(status, req.params.id, req.account.email);
  if (result.changes === 0) return res.status(404).json({ error: 'The order was not found.' });
  const row = database.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  return res.json({ order: mapOrder(row) });
});

app.post('/api/send-password-reset', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const account = database.prepare('SELECT user_json FROM accounts WHERE email = ?').get(email);
    if (!account) return res.status(404).json({ error: 'No account with this email was found.' });
    const user = JSON.parse(account.user_json);
    const result = await sendCodeEmail({ email, name: user.name || 'User', purpose: 'password-reset' });
    if (result.error) return res.status(result.status || 400).json({ error: result.error });
    return res.json(result);
  } catch (error) {
    console.error('send-password-reset error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to send a password reset email right now.',
    });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '').trim();
  const password = String(req.body?.newPassword || '');
  if (!emailPattern.test(email) || !code) {
    return res.status(400).json({ error: 'Email and reset code are required.' });
  }
  if (password.length < 8) return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
  const entry = verificationCodes.get(`password-reset:${email}`);
  if (!entry) return res.status(400).json({ error: 'No password reset code found for this email.' });
  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(`password-reset:${email}`);
    return res.status(400).json({ error: 'The password reset code has expired. Please request a new one.' });
  }
  if (entry.code !== code) return res.status(400).json({ error: 'The password reset code is incorrect.' });

  const passwordData = await hashPassword(password);
  const result = database.prepare(
    'UPDATE accounts SET password_salt = ?, password_hash = ? WHERE email = ?'
  ).run(passwordData.salt, passwordData.hash, email);
  verificationCodes.delete(`password-reset:${email}`);
  if (result.changes === 0) return res.status(404).json({ error: 'No account with this email was found.' });
  database.prepare('DELETE FROM sessions WHERE email = ?').run(email);
  return res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Marketplace API listening on http://localhost:${port}`);
});
