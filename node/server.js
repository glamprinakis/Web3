// node/server.js
const express = require('express');
const mysql = require('mysql2/promise'); // promise API
const jwt = require('jsonwebtoken');

const app = express();

// --- Config from env (Docker compose will pass these) ---
const DB_HOST = process.env.DB_HOST || 'db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'lamprinakis_eshop';
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-prod';

// 🔍 DEBUG: Log all environment variables to understand what's being passed
console.log('🔧 Environment Debug Information:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', DB_HOST);
console.log('DB_USER:', DB_USER);
console.log('DB_PASSWORD:', DB_PASSWORD ? `${DB_PASSWORD.substring(0, 3)}***` : 'EMPTY');
console.log('DB_NAME:', DB_NAME);
console.log('JWT_SECRET:', JWT_SECRET ? `${JWT_SECRET.substring(0, 3)}***` : 'EMPTY');
console.log('All DB_ env vars:', Object.keys(process.env).filter(key => key.startsWith('DB_')).map(key => `${key}=${process.env[key] ? process.env[key].substring(0, 3) + '***' : 'EMPTY'}`));
console.log('Current working directory:', process.cwd());
console.log('Process args:', process.argv);
console.log('🔧 End Environment Debug\n');

// --- DB pool ---
let pool;

async function connectToDatabase(retries = 15) {
  // Skip database connection during tests
  if (process.env.NODE_ENV === 'test') {
    console.log('⚠️  Skipping database connection in test environment');
    return;
  }

  // List of possible passwords to try
  const possiblePasswords = ['xyz123', 'change-me', 'securepassword123', '', 'password', 'root'];
  
  while (retries > 0) {
    try {
      console.log(`🔗 Connecting to database at ${DB_HOST}:3306 with user ${DB_USER} (${retries} retries left)`);
      console.log(`🔑 Using password: ${DB_PASSWORD ? `${DB_PASSWORD.substring(0, 3)}*** (length: ${DB_PASSWORD.length})` : 'EMPTY/UNDEFINED'}`);
      
      // Verify we have all required connection parameters
      if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
        console.error('❌ Missing required database connection parameters:');
        console.error(`  DB_HOST: ${DB_HOST || 'MISSING'}`);
        console.error(`  DB_USER: ${DB_USER || 'MISSING'}`);
        console.error(`  DB_PASSWORD: ${DB_PASSWORD ? 'PROVIDED' : 'MISSING'}`);
        console.error(`  DB_NAME: ${DB_NAME || 'MISSING'}`);
        throw new Error('Missing required database connection parameters');
      }
      
      pool = await mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        multipleStatements: false,
        acquireTimeout: 60000,
        timeout: 60000,
      });
      
      // Test the connection
      console.log('🧪 Testing database connection...');
      const [rows] = await pool.execute('SELECT 1 as test');
      console.log('✅ Database connection successful');
      
      // Check if tables exist and have data
      const [tables] = await pool.execute('SHOW TABLES');
      console.log(`📋 Database tables: ${tables.map(t => Object.values(t)[0]).join(', ')}`);
      
      const [productCount] = await pool.execute('SELECT COUNT(*) as count FROM products');
      const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Database stats: ${productCount[0].count} products, ${userCount[0].count} users`);
      
      return; // Success, exit the function
      
    } catch (error) {
      console.error(`❌ Database connection failed (${retries} retries left):`, error.message);
      console.error(`🔍 Error code: ${error.code}`);
      console.error(`🔍 Error errno: ${error.errno}`);
      console.error(`🔍 Error sqlState: ${error.sqlState}`);
      
      // If it's an access denied error, try alternative passwords
      if (error.code === 'ER_ACCESS_DENIED_ERROR' && retries === 15) {
        console.log('🔍 Trying alternative passwords to identify the correct one...');
        for (const testPassword of possiblePasswords) {
          if (testPassword === DB_PASSWORD) continue; // Skip the one we already tried
          
          try {
            console.log(`🧪 Testing password: ${testPassword ? `${testPassword.substring(0, 3)}***` : 'EMPTY'}`);
            const testPool = await mysql.createPool({
              host: DB_HOST,
              user: DB_USER,
              password: testPassword,
              database: DB_NAME,
              waitForConnections: true,
              connectionLimit: 1,
            });
            
            const [testRows] = await testPool.execute('SELECT 1 as test');
            console.log(`✅ SUCCESS! Database was initialized with password: ${testPassword ? `${testPassword.substring(0, 3)}***` : 'EMPTY'}`);
            console.log(`🔧 Update your .env file on the server to: DB_PASSWORD=${testPassword}`);
            await testPool.end();
            break;
          } catch (testError) {
            console.log(`❌ Password ${testPassword ? `${testPassword.substring(0, 3)}***` : 'EMPTY'} failed`);
          }
        }
      }
      
      console.error(`🔍 Full error:`, error);
      retries--;
      
      if (retries === 0) {
        console.error('💀 Final database connection attempt failed.');
        console.error('Stack:', error.stack);
        // Don't exit process in production, let it restart
        if (process.env.NODE_ENV !== 'production') {
          process.exit(1);
        }
        return;
      }
      
      console.log(`⏳ Retrying database connection in 3 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

// Initialize database connection
connectToDatabase();

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

// --- Debug endpoint to check database connectivity ---
app.get('/debug/db', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ 
        database: 'not_connected', 
        message: 'Database pool not initialized' 
      });
    }
    
    const tables = await q('SHOW TABLES');
    const productCount = await q('SELECT COUNT(*) as count FROM products');
    const userCount = await q('SELECT COUNT(*) as count FROM users');
    const products = await q('SELECT pid, name, category, brand, price FROM products LIMIT 5');
    
    res.json({
      database: 'connected',
      tables: tables,
      productCount: productCount[0].count,
      userCount: userCount[0].count,
      sampleProducts: products
    });
  } catch (e) {
    res.status(500).json({ 
      database: 'error', 
      error: e.message,
      stack: e.stack 
    });
  }
});

// Helper for queries
async function q(sql, params = []) {
  if (!pool) {
    throw new Error('Database connection not available');
  }
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
    console.log('🛍️  Fetching all products...');
    const rows = await q('SELECT * FROM products');
    console.log(`✅ Found ${rows.length} products`);
    res.json(rows);
  } catch (e) {
    console.error('❌ Error fetching products:', e.message);
    console.error('Stack:', e.stack);
    res.status(500).json({ error: 'Failed to fetch products', message: e.message });
  }
});

app.get('/products/:cat', async (req, res) => {
  try {
    const allowed = ['desktops', 'hardware', 'laptops', 'monitors', 'networking', 'peripherals', 'tablets'];
    const cat = req.params.cat.toLowerCase();
    console.log(`🏷️  Fetching products for category: ${cat}`);
    if (!allowed.includes(cat)) return res.status(400).json({ message: 'Invalid category' });
    const rows = await q('SELECT * FROM products WHERE category = ?', [cat]);
    console.log(`✅ Found ${rows.length} products in category ${cat}`);
    res.json(rows);
  } catch (e) {
    console.error(`❌ Error fetching products for category ${req.params.cat}:`, e.message);
    res.status(500).json({ error: 'Failed to fetch products', message: e.message });
  }
});

// Get single product by ID
app.get('/products/id/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const rows = await q('SELECT * FROM products WHERE pid = ?', [pid]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
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

// Only start the server if this file is run directly (not imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

module.exports = app;