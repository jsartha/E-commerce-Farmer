import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const verificationCodes = new Map();

app.use(cors());
app.use(express.json());

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () => {
  if (!isSmtpConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const generateVerificationCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, smtpConfigured: isSmtpConfigured() });
});

app.post('/api/send-verification', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const name = String(req.body?.name || 'User').trim() || 'User';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(500).json({
        error: 'SMTP email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in your environment.',
      });
    }

    const code = generateVerificationCode();
    verificationCodes.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verify your Farmer account',
      text: `Hello ${name},\n\nYour verification code is ${code}. This code expires in 10 minutes.\n\nPlease enter it in the app to complete your registration.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2 style="margin-bottom: 12px;">Verify your account</h2>
          <p>Hello ${name},</p>
          <p>Your verification code is:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 8px; margin: 18px 0; color: #1f2937;">${code}</div>
          <p>This code expires in 10 minutes.</p>
          <p>Please enter it in the app to complete your registration.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: `Verification code sent to ${email}.` });
  } catch (error) {
    console.error('send-verification error:', error);
    return res.status(500).json({ error: 'Unable to send verification email right now.' });
  }
});

app.post('/api/verify-code', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const entry = verificationCodes.get(email);
  if (!entry) {
    return res.status(400).json({ error: 'No verification code found for this email.' });
  }

  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(email);
    return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
  }

  if (entry.code !== code) {
    return res.status(400).json({ error: 'The verification code is incorrect.' });
  }

  verificationCodes.delete(email);
  return res.json({ success: true, message: 'Email verified successfully.' });
});

app.listen(port, () => {
  console.log(`Verification API listening on http://localhost:${port}`);
});
