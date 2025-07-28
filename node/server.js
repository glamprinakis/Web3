// node/server.js
const express = require('express');
const mysql = require('mysql2/promise'); // promise API
const jwt = require('jsonwebtoken');

const app = express();

// --- Config from env (Docker compose will pass these) ---
const DB_HOST = process.env.DB_HOST || 'db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'visionstudio';
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-prod';

// --- DB pool ---
let pool;
(async () => {
  pool = await mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: false,
  });
})();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (you can remove this after putting Nginx in front for same-origin)
const ALLOW_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// --- Health ---
app.get('/health', (req, res) => res.json({ ok: true }));

// Helper for queries
async function q(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Generate total order id
function generateOrderID(uid) {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const formatted = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `ORDER-${formatted}-${uid}`;
}

// ========== Products ==========
app.get('/products', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM products');
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

app.get('/products/:cat', async (req, res) => {
  try {
    const allowed = ['desktops', 'hardware', 'laptops', 'monitors', 'networking', 'peripherals', 'tablets'];
    const cat = req.params.cat.toLowerCase();
    if (!allowed.includes(cat)) return res.status(400).json({ message: 'Invalid category' });
    const rows = await q('SELECT * FROM products WHERE category = ?', [cat]);
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

// ========== Carts ==========
app.get('/carts/:cartId', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM carts WHERE cid = ?', [req.params.cartId]);
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

app.get('/users/:uid/cart', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM carts WHERE uid = ?', [req.params.uid]);
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

app.post('/carts', async (req, res) => {
  try {
    const { uid, pid, amount, price } = req.body;
    if (!uid || !pid || !amount || typeof price === 'undefined') {
      return res.status(400).json({ message: 'uid, pid, amount, price are required' });
    }
    const result = await q(
      'INSERT INTO carts (uid, pid, insertionDate, amount, price) VALUES (?, ?, NOW(), ?, ?)',
      [uid, pid, amount, price]
    );
    res.json({ insertedId: result.insertId });
  } catch (e) {
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

app.delete('/carts/:id', async (req, res) => {
  try {
    const result = await q('DELETE FROM carts WHERE cid = ?', [req.params.id]);
    res.json({ affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete cart item' });
  }
});

app.delete('/users/:uid/cart', async (req, res) => {
  try {
    const result = await q('DELETE FROM carts WHERE uid = ?', [req.params.uid]);
    res.json({ affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

// ========== Auth ==========
app.post('/user/login', async (req, res) => {
  try {
    const { usr, pwd } = req.body;
    if (!usr || !pwd) return res.status(400).json({ message: 'Missing credentials' });

    const rows = await q('SELECT * FROM users WHERE username = ? AND password = ?', [usr, pwd]);
    if (rows.length === 0) return res.status(401).json({ message: 'Wrong username or password!' });

    const token = jwt.sign({ userId: rows[0].uid, userName: rows[0].username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong!' });
  }
});

app.post('/user/signup', async (req, res) => {
  try {
    const { name, surname, username, pwd, email, city, addr } = req.body;
    if (!username || !email) return res.status(409).json({ message: 'Username and email cannot be empty!' });

    const exists = await q('SELECT uid FROM users WHERE username = ? OR email = ?', [username, email]);
    if (exists.length > 0) return res.status(409).json({ message: 'Username or email already exists!' });

    await q(
      `INSERT INTO users (name, surname, username, password, email, city, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, surname, username, pwd, email, city, addr]
    );
    res.status(200).json({ message: 'User created successfully!' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// ========== Orders ==========
app.post('/orders', async (req, res) => {
  const { uid, orderItems } = req.body;
  if (!uid) return res.status(400).json({ message: 'User ID is required' });
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  const totalOrderID = generateOrderID(uid);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const item of orderItems) {
      const { productId: pid, amount, price } = item;
      await conn.execute(
        `INSERT INTO orders (uid, pid, totalOrderId, orderDate, orderAmount, orderCost, status)
         VALUES (?, ?, ?, NOW(), ?, ?, "pending")`,
        [uid, pid, totalOrderID, amount, price]
      );
    }

    await conn.execute('DELETE FROM carts WHERE uid = ?', [uid]);

    await conn.commit();
    res.status(200).json({ message: 'Order created successfully!', totalOrderID });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: 'Failed to create order' });
  } finally {
    conn.release();
  }
});

app.get('/users/:uid/orders', async (req, res) => {
  try {
    const rows = await q(
      'SELECT totalOrderId FROM orders WHERE uid = ? GROUP BY totalOrderId',
      [req.params.uid]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

app.get('/orders/:totalOrderId/products', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM orders WHERE totalOrderId = ?', [req.params.totalOrderId]);
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

// ========== Users ==========
app.get('/users/:uid', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM users WHERE uid = ?', [req.params.uid]);
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

app.post('/users/:uid/update', async (req, res) => {
  try {
    const { name, surname, username, pwd, email, city, addr } = req.body;
    const result = await q(
      `UPDATE users
         SET name = ?, surname = ?, username = ?, password = ?, email = ?, city = ?, address = ?
       WHERE uid = ? AND username = ?`,
      [name, surname, username, pwd, email, city, addr, req.params.uid, username]
    );
    res.json({ affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Message From Express Backend!' });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});