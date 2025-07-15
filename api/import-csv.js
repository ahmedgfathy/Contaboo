// Vercel serverless function for CSV import
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { tableName, headers, data } = req.body;
    
    if (!tableName || !headers || !data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tableName, headers, data'
      });
    }

    // Validate table name (security)
    if (tableName !== 'properties_import') {
      return res.status(400).json({
        success: false,
        message: 'Invalid table name'
      });
    }

    console.log(`CSV Import - Processing ${data.length} rows`);

    // Clean and prepare headers (remove spaces, special characters)
    const cleanHeaders = headers.map(header => 
      header.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 63) // PostgreSQL column name limit
    );

    console.log('Original headers:', headers);
    console.log('Clean headers:', cleanHeaders);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process data in smaller batches to avoid query complexity
    const batchSize = 10;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        // Process each row individually within the batch
        for (const row of batch) {
          try {
            // Prepare values for this row
            const values = [];
            const placeholders = [];
            let placeholderIndex = 1;
            
            // Map row data to clean headers
            for (const cleanHeader of cleanHeaders) {
              const originalHeaderIndex = headers.findIndex(h => 
                h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 63) === cleanHeader
              );
              
              const value = originalHeaderIndex >= 0 ? row[originalHeaderIndex] : null;
              values.push(value);
              placeholders.push(`$${placeholderIndex++}`);
            }
            
            // Add imported_at timestamp
            values.push(new Date().toISOString());
            placeholders.push(`$${placeholderIndex++}`);

            // Create simple INSERT query for single row
            const query = `
              INSERT INTO ${tableName} (${cleanHeaders.join(', ')}, imported_at)
              VALUES (${placeholders.join(', ')})
              ON CONFLICT (id) DO UPDATE SET
              ${cleanHeaders.map(header => `${header} = EXCLUDED.${header}`).join(', ')},
              imported_at = EXCLUDED.imported_at
            `;

            await pool.query(query, values);
            successCount++;
            
          } catch (rowError) {
            console.error(`Error processing row in batch ${i}:`, rowError);
            errorCount++;
            errors.push({
              row: successCount + errorCount,
              error: rowError.message
            });
          }
        }
        
      } catch (batchError) {
        console.error(`Error processing batch ${i}-${i + batch.length}:`, batchError);
        errorCount += batch.length;
        errors.push({
          batch: `${i}-${i + batch.length}`,
          error: batchError.message
        });
      }
    }

    const response = {
      success: true,
      imported: successCount,
      message: `CSV import completed: ${successCount} imported, ${errorCount} failed`,
      stats: {
        totalRows: data.length,
        successCount,
        errorCount,
        tableName
      }
    };

    if (errors.length > 0) {
      response.errors = errors.slice(0, 10); // Limit errors in response
      response.message += ` (${errors.length} errors)`;
    }

    console.log('CSV Import completed:', response);
    res.status(200).json(response);
    
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({
      success: false,
      message: 'CSV import failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
