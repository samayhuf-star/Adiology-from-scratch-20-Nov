/**
 * PostgreSQL Database Connection Test
 * Tests direct PostgreSQL connection to Supabase database
 */

const https = require('https');

console.log('\n🔍 Testing Supabase PostgreSQL Connection...\n');

// Database connection info from the connection string
const DB_HOST = 'db.kkdnnrwhzofttzajnwlj.supabase.co';
const DB_PORT = 5432;
const PROJECT_ID = 'kkdnnrwhzofttzajnwlj';
const PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZG5ucndoem9mdHR6YWpud2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njk2ODAsImV4cCI6MjA3OTA0NTY4MH0.IVIEaP0Stc0AieekxDFMG_q76vu6KRRMsI_yIjOfmZM';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

console.log('📋 Connection Details:');
console.log(`   Database Host: ${DB_HOST}`);
console.log(`   Database Port: ${DB_PORT}`);
console.log(`   Project ID: ${PROJECT_ID}`);
console.log(`   Supabase URL: ${SUPABASE_URL}\n`);
console.log('─'.repeat(60));
console.log('\n⚠️  Note: Direct PostgreSQL connection requires the database password.');
console.log('   This test will verify network connectivity and REST API access instead.\n');
console.log('─'.repeat(60));

// Test 1: Network connectivity to database host
console.log('\n1️⃣  Testing Network Connectivity to Database Host...');
const net = require('net');

const testTcpConnection = () => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      console.log(`   ✅ Successfully connected to ${DB_HOST}:${DB_PORT}`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`   ⚠️  Connection timeout to ${DB_HOST}:${DB_PORT}`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`   ⚠️  Connection test: ${err.message}`);
      console.log('   💡 This is normal - direct TCP connections may be blocked for security');
      resolve(false);
    });
    
    socket.connect(DB_PORT, DB_HOST);
  });
};

// Test 2: REST API access (recommended way to access Supabase)
console.log('\n2️⃣  Testing Supabase REST API Access...');
const testRestAPI = () => {
  return new Promise((resolve) => {
    const restUrl = `${SUPABASE_URL}/rest/v1/`;
    const { URL } = require('url');
    const url = new URL(restUrl);
    
    https.get({
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        'apikey': PUBLIC_ANON_KEY,
        'Authorization': `Bearer ${PUBLIC_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404 || res.statusCode === 406) {
        console.log(`   ✅ REST API is accessible (HTTP ${res.statusCode})`);
        console.log('   ✅ This means the database is reachable through Supabase REST API');
        resolve(true);
      } else {
        console.log(`   ⚠️  Unexpected status code: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`   ❌ REST API test failed: ${err.message}`);
      resolve(false);
    });
  });
};

// Test 3: Test authentication endpoint
console.log('\n3️⃣  Testing Supabase Auth Endpoint...');
const testAuthEndpoint = () => {
  return new Promise((resolve) => {
    const authUrl = `${SUPABASE_URL}/auth/v1/health`;
    const { URL } = require('url');
    const url = new URL(authUrl);
    
    https.get({
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        'apikey': PUBLIC_ANON_KEY,
        'Authorization': `Bearer ${PUBLIC_ANON_KEY}`
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✅ Auth endpoint is accessible (HTTP ${res.statusCode})`);
          resolve(true);
        } else {
          console.log(`   ⚠️  Auth endpoint returned: ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`   ⚠️  Auth endpoint test: ${err.message}`);
      resolve(false);
    });
  });
};

// Test 4: Test Edge Function
console.log('\n4️⃣  Testing Edge Function Endpoint...');
const testEdgeFunction = () => {
  return new Promise((resolve) => {
    const edgeUrl = `${SUPABASE_URL}/functions/v1/make-server-6757d0ca/health`;
    const { URL } = require('url');
    const url = new URL(edgeUrl);
    
    https.get({
      hostname: url.hostname,
      path: url.pathname,
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
          console.log(`   ✅ Edge function is accessible (HTTP ${res.statusCode})`);
          try {
            const json = JSON.parse(data);
            console.log(`   📦 Response: ${JSON.stringify(json)}`);
          } catch (e) {
            console.log(`   📦 Response: ${data}`);
          }
          resolve(true);
        } else {
          console.log(`   ⚠️  Edge function returned: ${res.statusCode}`);
          console.log(`   📦 Response: ${data}`);
          console.log('   💡 Edge function may need to be deployed');
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`   ⚠️  Edge function test: ${err.message}`);
      console.log('   💡 Edge function may not be deployed yet');
      resolve(false);
    });
  });
};

// Run all tests
async function runTests() {
  const results = {
    network: false,
    restAPI: false,
    auth: false,
    edgeFunction: false
  };
  
  // Run tests sequentially
  results.network = await testTcpConnection();
  results.restAPI = await testRestAPI();
  results.auth = await testAuthEndpoint();
  results.edgeFunction = await testEdgeFunction();
  
  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('\n📊 Test Summary:\n');
  console.log(`   Network Connectivity: ${results.network ? '✅' : '⚠️  (may be blocked for security)'}`);
  console.log(`   REST API Access: ${results.restAPI ? '✅' : '❌'}`);
  console.log(`   Auth Endpoint: ${results.auth ? '✅' : '⚠️'}`);
  console.log(`   Edge Function: ${results.edgeFunction ? '✅' : '⚠️'}`);
  
  console.log('\n' + '─'.repeat(60));
  
  if (results.restAPI) {
    console.log('\n✅ Supabase is connected and working!');
    console.log('\n💡 Recommendations:');
    console.log('   • Use Supabase REST API or client libraries (recommended)');
    console.log('   • Direct PostgreSQL connections require password and may be blocked');
    console.log('   • Edge functions should be deployed separately if needed');
    console.log('   • REST API access confirms database is accessible\n');
    process.exit(0);
  } else {
    console.log('\n❌ Supabase REST API is not accessible.');
    console.log('   Please check your configuration and network connectivity.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error during testing:', error);
  process.exit(1);
});

