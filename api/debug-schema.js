// Quick database schema checker for Vercel API
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get table schema
    const schemaQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      ORDER BY ordinal_position;
    `;
    
    const schemaResult = await pool.query(schemaQuery);
    
    // Get sample data to understand the structure
    const sampleQuery = 'SELECT * FROM properties LIMIT 3';
    const sampleResult = await pool.query(sampleQuery);
    
    res.status(200).json({
      table_schema: schemaResult.rows,
      sample_data: sampleResult.rows,
      column_count: schemaResult.rows.length,
      row_count_sample: sampleResult.rows.length
    });
    
  } catch (error) {
    console.error('Schema check error:', error);
    res.status(500).json({ 
      error: 'Failed to check schema',
      message: error.message
    });
  }
}
