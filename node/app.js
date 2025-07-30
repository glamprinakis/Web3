const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    await connection.ping();
    await connection.end();
    
    res.json({
      status: 'healthy',
      message: 'API and database are operational',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add your other routes here...

module.exports = app;
