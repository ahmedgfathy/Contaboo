const { Pool } = require('pg');
const { validateDatabaseSchema, checkSchemaMigrationNeeded } = require('./regex-patterns');

// Frontend Code Validation Patterns
// These patterns help identify outdated Vue.js components, forms, and JavaScript code
const FRONTEND_VALIDATION_PATTERNS = {
  field_binding: "(v-model|:value|:bind)=\"(oldFieldName|oldPropertyStructure)\"",
  api_response_mapping: "\\b(data|response)\\.(oldKey|chatContent|legacyField)\\b",
  form_fields: "<input[^>]+name=[\"'](oldFieldName|descriptionText|agentPhone)[\"'][^>]*>",
  component_props: ":(prop|value)=\"(oldProp|outdatedField)\"",
  table_headers: "<th[^>]*>(Old Header|Chat Content|Legacy Field)</th>",
  js_variable_refs: "\\b(let|const|var)\\s+(oldField|chatData)\\s*=\\s*.*"
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { checkFrontend } = req.query;
      
      // Get current schema information
      const schemaQuery = `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name IN ('chat_messages', 'properties_import', 'properties')
        ORDER BY table_name, ordinal_position;
      `;
      
      const schemaResult = await pool.query(schemaQuery);
      
      // Get table creation statements (approximated)
      const tablesQuery = `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename IN ('chat_messages', 'properties_import', 'properties');
      `;
      
      const tablesResult = await pool.query(tablesQuery);
      
      // Get index information
      const indexQuery = `
        SELECT 
          t.relname as table_name,
          i.relname as index_name,
          a.attname as column_name
        FROM pg_class t,
             pg_class i,
             pg_index ix,
             pg_attribute a
        WHERE t.oid = ix.indrelid
          AND i.oid = ix.indexrelid
          AND a.attrelid = t.oid
          AND a.attnum = ANY(ix.indkey)
          AND t.relkind = 'r'
          AND t.relname IN ('chat_messages', 'properties_import', 'properties')
        ORDER BY t.relname, i.relname;
      `;
      
      const indexResult = await pool.query(indexQuery);
      
      // Create a synthetic schema string for validation
      let schemaString = '';
      const tableColumns = {};
      
      schemaResult.rows.forEach(row => {
        if (!tableColumns[row.table_name]) {
          tableColumns[row.table_name] = [];
        }
        tableColumns[row.table_name].push({
          name: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable,
          default: row.column_default
        });
      });
      
      // Build schema representation
      Object.entries(tableColumns).forEach(([tableName, columns]) => {
        schemaString += `CREATE TABLE ${tableName} (\\n`;
        columns.forEach(col => {
          schemaString += `  ${col.name} ${col.type.toUpperCase()}`;
          if (col.nullable === 'NO') schemaString += ' NOT NULL';
          if (col.default) schemaString += ` DEFAULT ${col.default}`;
          schemaString += ',\\n';
        });
        schemaString += ');\\n\\n';
      });
      
      // Add index information to schema string
      indexResult.rows.forEach(row => {
        schemaString += `CREATE INDEX ON ${row.table_name} (${row.column_name});\\n`;
      });
      
      // Validate schema using regex patterns
      const validationResult = checkSchemaMigrationNeeded(schemaString);
      
      // Check for essential real estate fields
      const essentialFields = ['purpose', 'area', 'price', 'description', 'broker_name', 'broker_mobile'];
      const missingFields = [];
      
      essentialFields.forEach(field => {
        const fieldExists = schemaResult.rows.some(row => 
          row.column_name.toLowerCase().includes(field.toLowerCase())
        );
        if (!fieldExists) {
          missingFields.push(field);
        }
      });
      
      // Generate recommendations
      const recommendations = [];
      
      if (missingFields.length > 0) {
        recommendations.push({
          type: 'missing_fields',
          severity: 'high',
          message: `Add missing real estate fields: ${missingFields.join(', ')}`,
          sql: missingFields.map(field => 
            `ALTER TABLE chat_messages ADD COLUMN ${field} TEXT;`
          ).join('\\n')
        });
      }
      
      // Check for data type issues
      const dataTypeIssues = schemaResult.rows.filter(row => {
        if (row.column_name.toLowerCase().includes('price') && row.data_type === 'text') {
          return true;
        }
        if (row.column_name.toLowerCase().includes('date') && row.data_type === 'character varying') {
          return true;
        }
        if (row.column_name.toLowerCase().includes('is_') && row.data_type === 'character varying') {
          return true;
        }
        return false;
      });
      
      if (dataTypeIssues.length > 0) {
        recommendations.push({
          type: 'data_type_optimization',
          severity: 'medium',
          message: 'Optimize data types for better performance and accuracy',
          issues: dataTypeIssues.map(issue => ({
            table: issue.table_name,
            column: issue.column_name,
            currentType: issue.data_type,
            recommendedType: getRecommendedDataType(issue.column_name)
          }))
        });
      }
      
      // Frontend validation (if requested)
      let frontendValidation = null;
      if (checkFrontend === 'true') {
        // Simulate frontend code check (in real implementation, you'd read actual Vue files)
        const sampleFrontendCode = `
          <template>
            <form>
              <input name="agentPhone" v-model="oldFieldName" />
              <th>Chat Content</th>
            </form>
          </template>
          <script>
          export default {
            computed: {
              chatData() {
                return this.response.chatContent;
              }
            }
          }
          </script>
        `;
        
        const frontendIssues = validateFrontendCode(sampleFrontendCode, 'vue');
        const migrationSuggestions = generateFrontendMigrationSuggestions(frontendIssues);
        
        frontendValidation = {
          issues: frontendIssues,
          migrationSuggestions: migrationSuggestions,
          filesChecked: ['components/*.vue', 'pages/*.vue', 'utils/*.js'],
          frontendReadinessScore: calculateFrontendReadinessScore(frontendIssues)
        };
      }
      
      res.status(200).json({
        success: true,
        schema: {
          tables: tablesResult.rows.map(t => t.tablename),
          columns: tableColumns,
          indexes: indexResult.rows
        },
        validation: validationResult,
        recommendations: recommendations,
        missingFields: missingFields,
        frontendValidation: frontendValidation,
        summary: {
          totalTables: tablesResult.rows.length,
          totalColumns: schemaResult.rows.length,
          totalIndexes: indexResult.rows.length,
          migrationNeeded: validationResult.migrationNeeded || missingFields.length > 0,
          readinessScore: calculateReadinessScore(validationResult, missingFields),
          frontendCompatible: frontendValidation ? frontendValidation.frontendReadinessScore > 80 : null
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Schema validation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Database schema validation error',
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};

function getRecommendedDataType(columnName) {
  const name = columnName.toLowerCase();
  
  if (name.includes('price') || name.includes('amount')) {
    return 'DECIMAL(15,2)';
  }
  if (name.includes('date') || name.includes('created') || name.includes('updated')) {
    return 'TIMESTAMP';
  }
  if (name.includes('is_') || name.includes('active') || name.includes('enabled')) {
    return 'BOOLEAN';
  }
  if (name.includes('id')) {
    return 'SERIAL PRIMARY KEY';
  }
  
  return 'TEXT';
}

function calculateReadinessScore(validationResult, missingFields) {
  let score = 100;
  
  // Deduct points for high severity issues
  score -= validationResult.highSeverityCount * 20;
  
  // Deduct points for missing essential fields
  score -= missingFields.length * 15;
  
  // Deduct points for total issues
  score -= validationResult.totalIssues * 5;
  
  return Math.max(0, Math.min(100, score));
}

// Function to validate frontend code for outdated patterns
function validateFrontendCode(codeContent, fileType = 'vue') {
  const issues = [];
  
  Object.entries(FRONTEND_VALIDATION_PATTERNS).forEach(([issueType, pattern]) => {
    const regex = new RegExp(pattern, 'gi');
    const matches = codeContent.match(regex);
    
    if (matches && matches.length > 0) {
      issues.push({
        type: issueType,
        matches: matches,
        severity: getFrontendSeverityLevel(issueType),
        recommendation: getFrontendRecommendation(issueType),
        fileType: fileType
      });
    }
  });
  
  return issues;
}

// Function to get severity level for frontend issues
function getFrontendSeverityLevel(issueType) {
  const severityMap = {
    field_binding: 'high',        // Breaks data binding
    api_response_mapping: 'high', // Breaks API integration
    form_fields: 'medium',        // Affects form functionality
    component_props: 'medium',    // Affects component communication
    table_headers: 'low',         // UI/UX issue
    js_variable_refs: 'medium'    // Potential runtime errors
  };
  
  return severityMap[issueType] || 'low';
}

// Function to get recommendations for frontend issues
function getFrontendRecommendation(issueType) {
  const recommendations = {
    field_binding: 'Update v-model bindings to use current field names from the updated database schema',
    api_response_mapping: 'Update API response mappings to use new property names (e.g., message_text instead of chatContent)',
    form_fields: 'Update form field names to match current database columns (e.g., broker_mobile instead of agentPhone)',
    component_props: 'Update component props to use current property names for consistency',
    table_headers: 'Update table headers to reflect current field names and improve user experience',
    js_variable_refs: 'Rename JavaScript variables to use current naming conventions'
  };
  
  return recommendations[issueType] || 'Review and update as needed';
}

// Function to generate migration suggestions for frontend
function generateFrontendMigrationSuggestions(issues) {
  const suggestions = [];
  
  issues.forEach(issue => {
    switch (issue.type) {
      case 'field_binding':
        suggestions.push({
          pattern: 'v-model="oldFieldName"',
          replacement: 'v-model="purpose"',
          description: 'Update field binding to use new schema field names'
        });
        break;
        
      case 'api_response_mapping':
        suggestions.push({
          pattern: 'response.chatContent',
          replacement: 'response.message_text',
          description: 'Update API response property access'
        });
        break;
        
      case 'form_fields':
        suggestions.push({
          pattern: 'name="agentPhone"',
          replacement: 'name="broker_mobile"',
          description: 'Update form field names to match database schema'
        });
        break;
        
      case 'component_props':
        suggestions.push({
          pattern: ':value="oldProp"',
          replacement: ':value="area"',
          description: 'Update component props to use current field names'
        });
        break;
        
      case 'table_headers':
        suggestions.push({
          pattern: '<th>Chat Content</th>',
          replacement: '<th>Message Text</th>',
          description: 'Update table headers for better user experience'
        });
        break;
        
      case 'js_variable_refs':
        suggestions.push({
          pattern: 'const chatData = ',
          replacement: 'const messageData = ',
          description: 'Update variable names for consistency'
        });
        break;
    }
  });
  
  return suggestions;
}

function calculateFrontendReadinessScore(frontendIssues) {
  let score = 100;
  
  frontendIssues.forEach(issue => {
    switch (issue.severity) {
      case 'high':
        score -= 25;
        break;
      case 'medium':
        score -= 15;
        break;
      case 'low':
        score -= 5;
        break;
    }
  });
  
  return Math.max(0, Math.min(100, score));
}
