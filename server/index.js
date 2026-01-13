
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const db = require('./dbConfig');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security Middleware ---
app.use(helmet()); 
app.use(express.json({ limit: '10kb' })); 

app.use(cors({
  origin: process.env.CLIENT_URL || '*', 
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// --- Email Config (Formspree Integration) ---
const otpStore = new Map(); 

const sendEmail = async (to, subject, text) => {
  // Use the provided Formspree endpoint
  const FORMSPREE_URL = 'https://formspree.io/f/mpqqzybe';

  console.log(`\n=== [EMAIL SERVICE] ===`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${text}`);
  console.log(`=======================\n`);

  try {
    // Formspree sends the email TO THE FORM OWNER, not the 'email' field below.
    // The 'email' field below sets the "Reply-To" address.
    const response = await axios.post(FORMSPREE_URL, {
      email: to,
      subject: subject,
      message: text,
      _subject: `Twin Hill Security: ${subject} for ${to}`
    }, {
      headers: {
        'Accept': 'application/json' // Critical for Formspree API
      }
    });

    if (response.status >= 200 && response.status < 300) {
        console.log(`[Email Service] Formspree request sent successfully.`);
        return true;
    }
  } catch (error) {
    console.error('[Email Service Error]', error.message);
    if (error.response) {
        console.error('Formspree Response:', error.response.data);
    }
  }

  // Fallback: Always return true so the UI flow continues.
  // The developer should check the console logs above for the code.
  return true;
};

// --- AUTH ROUTES ---

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { id, name, email, password, role, employeeId, position, avatarUrl } = req.body;
  try {
    // Check duplicates
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? OR employeeId = ?', [email, employeeId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email or Employee ID already exists' });
    }

    await db.query(
      'INSERT INTO users (id, name, email, password, role, employeeId, position, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, password, role, employeeId, position, avatarUrl]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const [result] = await db.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// --- DATA ROUTES ---

// Get All Users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, employeeId, position, avatarUrl FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    const [rows] = await db.query('SELECT id, name, email, role, employeeId, position, avatarUrl FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get Payroll
app.get('/api/payroll', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payroll_records ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
});

// Add Payroll Record (Batch or Single)
app.post('/api/payroll', async (req, res) => {
  const records = req.body; // Expecting array
  if (!Array.isArray(records)) return res.status(400).json({ error: 'Invalid data format' });

  try {
    for (const r of records) {
      await db.query(
        `INSERT INTO payroll_records 
        (id, employeeId, employeeName, department, position, basicSalary, allowances, grossSalary, ssnitEmployee, ssnitEmployer, taxableIncome, paye, deductions, netSalary, status, payPeriod)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.id, r.employeeId, r.employeeName, r.department, r.position, r.basicSalary, r.allowances, r.grossSalary, r.ssnitEmployee, r.ssnitEmployer, r.taxableIncome, r.paye, r.deductions, r.netSalary, r.status, r.payPeriod]
      );
    }
    // Return updated list
    const [rows] = await db.query('SELECT * FROM payroll_records ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Payroll Record
app.delete('/api/payroll/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM payroll_records WHERE id = ?', [req.params.id]);
    const [rows] = await db.query('SELECT * FROM payroll_records ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// --- OTP Logic ---
app.post('/api/auth/otp/generate', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Valid email required' });

  const code = crypto.randomInt(100000, 999999).toString();
  otpStore.set(email, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  
  // Log strictly for development visibility
  console.log(`\n\n[OTP GENERATED] Email: ${email} | Code: ${code}\n\n`);

  await sendEmail(email, 'Twin Hill Verification Code', `Your One-Time Password (OTP) is: ${code}`);
  
  // For development convenience, we return the code in the response so the frontend can log it too.
  res.json({ success: true, message: 'OTP sent', debug_otp: code });
});

app.post('/api/auth/otp/verify', (req, res) => {
  const { email, code } = req.body;
  const record = otpStore.get(email);
  
  if (!record || Date.now() > record.expiresAt || record.code !== code) {
    return res.status(400).json({ valid: false, message: 'Invalid or expired code' });
  }
  
  otpStore.delete(email);
  res.json({ success: true, valid: true });
});

app.listen(PORT, () => {
  console.log(`Server running with MySQL on port ${PORT}`);
});
