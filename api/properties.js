// Vercel serverless function for properties API
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { q, type, listing_type, min_price, max_price, bedrooms, bathrooms, location } = req.query;
      
      let query = 'SELECT * FROM properties WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      // Add search filters
      if (q) {
        query += ` AND (property_name ILIKE $${paramIndex} OR full_description ILIKE $${paramIndex} OR regions ILIKE $${paramIndex})`;
        params.push(`%${q}%`);
        paramIndex++;
      }
      
      if (type) {
        query += ` AND property_category ILIKE $${paramIndex}`;
        params.push(`%${type}%`);
        paramIndex++;
      }
      
      if (location) {
        query += ` AND regions ILIKE $${paramIndex}`;
        params.push(`%${location}%`);
        paramIndex++;
      }
      
      if (min_price) {
        query += ` AND CAST(REGEXP_REPLACE(price, '[^0-9]', '', 'g') AS INTEGER) >= $${paramIndex}`;
        params.push(parseInt(min_price));
        paramIndex++;
      }
      
      if (max_price) {
        query += ` AND CAST(REGEXP_REPLACE(price, '[^0-9]', '', 'g') AS INTEGER) <= $${paramIndex}`;
        params.push(parseInt(max_price));
        paramIndex++;
      }
      
      // Order by any available timestamp column
      query += ' ORDER BY id DESC LIMIT 1000';
      
      const result = await pool.query(query, params);
      res.status(200).json(result.rows);
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Properties API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
