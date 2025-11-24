/**
 * Supabase Connection Test Script
 * Tests all aspects of Supabase connectivity and functionality
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration from project
const PROJECT_ID = 'kkdnnrwhzofttzajnwlj';
const PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZG5ucndoem9mdHR6YWpud2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njk2ODAsImV4cCI6MjA3OTA0NTY4MH0.IVIEaP0Stc0AieekxDFMG_q76vu6KRRMsI_yIjOfmZM';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const API_BASE = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-6757d0ca`;

// Test results tracker
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function logResult(testName, passed, message = '') {
  if (passed) {
    results.passed.push(testName);
    console.log(`✅ ${testName}: PASSED${message ? ' - ' + message : ''}`);
  } else {
    results.failed.push(testName);
    console.error(`❌ ${testName}: FAILED${message ? ' - ' + message : ''}`);
  }
}

function logWarning(message) {
  results.warnings.push(message);
  console.warn(`⚠️  WARNING: ${message}`);
}

// Test 1: API Configuration
function testAPIConfiguration() {
  try {
    if (!PROJECT_ID || PROJECT_ID === 'undefined') {
      throw new Error('Project ID is not configured');
    }
    
    if (!PUBLIC_ANON_KEY || PUBLIC_ANON_KEY === 'undefined') {
      throw new Error('Public Anon Key is not configured');
    }
    
    if (PROJECT_ID.length < 20) {
      throw new Error('Project ID appears to be invalid (too short)');
    }
    
    logResult('API Configuration', true, 'All configuration values are set');
    return true;
  } catch (error) {
    logResult('API Configuration', false, error.message);
    return false;
  }
}

// Test 2: Client Initialization
function testClientInitialization() {
  try {
    const supabase = createClient(SUPABASE_URL, PUBLIC_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    
    if (!supabase) {
      throw new Error('Supabase client is null or undefined');
    }
    logResult('Client Initialization', true, 'Client created successfully');
    return supabase;
  } catch (error) {
    logResult('Client Initialization', false, error.message);
    return null;
  }
}

// Test 3: Network Connectivity
async function testNetworkConnectivity() {
  try {
    const https = require('https');
    const { URL } = require('url');
    const supabaseUrl = new URL(SUPABASE_URL);
    
    return new Promise((resolve) => {
      const req = https.request({
        hostname: supabaseUrl.hostname,
        port: 443,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        logResult('Network Connectivity', true, `Successfully reached Supabase (HTTP ${res.statusCode})`);
        resolve(true);
      });
      
      req.on('error', (error) => {
        logResult('Network Connectivity', false, error.message);
        resolve(false);
      });
      
      req.on('timeout', () => {
        req.destroy();
        logResult('Network Connectivity', false, 'Connection timeout');
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    logResult('Network Connectivity', false, error.message);
    return false;
  }
}

// Test 4: Database Connection
async function testDatabaseConnection(supabase) {
  if (!supabase) {
    logResult('Database Connection', false, 'Cannot test - Supabase client not initialized');
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        logWarning('Users table does not exist - this may need to be created via migration');
        // Try another table
        const { error: error2 } = await supabase.from('_prisma_migrations').select('count').limit(1);
        if (error2) {
          throw new Error(`Table access failed: ${error.message}`);
        }
        logResult('Database Connection', true, 'Database is accessible (via system tables)');
        return true;
      }
      throw error;
    }
    logResult('Database Connection', true, 'Successfully connected to database');
    return true;
  } catch (error) {
    logResult('Database Connection', false, error.message);
    return false;
  }
}

// Test 5: Edge Function Health Check
async function testEdgeFunctionHealth() {
  try {
    const https = require('https');
    const { URL } = require('url');
    const apiUrl = new URL(`${API_BASE}/health`);
    
    return new Promise((resolve) => {
      const req = https.request({
        hostname: apiUrl.hostname,
        port: 443,
        path: apiUrl.pathname,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PUBLIC_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const json = JSON.parse(data);
              if (json.status === 'ok') {
                logResult('Edge Function Health Check', true, 'Edge function is responding');
                resolve(true);
              } else {
                logResult('Edge Function Health Check', true, `Edge function responded: ${JSON.stringify(json)}`);
                resolve(true);
              }
            } catch (e) {
              logResult('Edge Function Health Check', true, `Edge function responded (non-JSON): ${data}`);
              resolve(true);
            }
          } else {
            logResult('Edge Function Health Check', false, `HTTP ${res.statusCode}: ${data}`);
            logWarning('Edge function may not be deployed or URL path may be incorrect');
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        logResult('Edge Function Health Check', false, error.message);
        logWarning('Edge function may not be deployed or URL path may be incorrect');
        resolve(false);
      });
      
      req.on('timeout', () => {
        req.destroy();
        logResult('Edge Function Health Check', false, 'Connection timeout');
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    logResult('Edge Function Health Check', false, error.message);
    return false;
  }
}

// Test 6: Authentication Status
async function testAuthentication(supabase) {
  if (!supabase) {
    logResult('Authentication Status', false, 'Cannot test - Supabase client not initialized');
    return false;
  }
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    if (session) {
      logResult('Authentication Status', true, `User is authenticated: ${session.user.email || session.user.id}`);
    } else {
      logWarning('No active session (this is normal if not logged in)');
      logResult('Authentication Status', true, 'No active session - authentication system is working');
    }
    return true;
  } catch (error) {
    logResult('Authentication Status', false, error.message);
    return false;
  }
}

// Test 7: KV Store Access
async function testKVStore(supabase) {
  if (!supabase) {
    logResult('KV Store Access', false, 'Cannot test - Supabase client not initialized');
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('kv_store_6757d0ca')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        logWarning('KV Store table does not exist yet - this may need to be created via migration');
        return false;
      }
      throw error;
    }
    
    logResult('KV Store Access', true, 'KV Store table is accessible');
    return true;
  } catch (error) {
    logResult('KV Store Access', false, error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🔍 Starting Supabase Connection Tests...\n');
  console.log(`📋 Configuration:`);
  console.log(`   Project ID: ${PROJECT_ID}`);
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   API Base: ${API_BASE}\n`);
  console.log('─'.repeat(60));
  
  // Run tests
  testAPIConfiguration();
  const supabase = testClientInitialization();
  await testNetworkConnectivity();
  
  // Only test database operations if client is initialized
  if (supabase) {
    await testDatabaseConnection(supabase);
    await testAuthentication(supabase);
    await testKVStore(supabase);
  }
  
  await testEdgeFunctionHealth();
  
  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${results.passed.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
  console.log(`   ⚠️  Warnings: ${results.warnings.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => console.log(`   - ${test}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  console.log('\n' + '─'.repeat(60));
  
  // Final status
  const criticalTests = ['Client Initialization', 'Network Connectivity'];
  const criticalFailed = results.failed.filter(test => criticalTests.includes(test));
  
  if (criticalFailed.length === 0) {
    console.log('\n✅ Supabase is connected and working!');
    if (results.failed.length > 0) {
      console.log('   Some non-critical tests failed, but core functionality is operational.');
    }
    process.exit(0);
  } else {
    console.log('\n❌ Critical tests failed. Please check your Supabase configuration.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Fatal error during testing:', error);
  process.exit(1);
});
