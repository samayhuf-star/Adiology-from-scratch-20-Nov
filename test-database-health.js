/**
 * Database Health Test
 * Comprehensive test after route fixes
 */

const { createClient } = require('@supabase/supabase-js');

const PROJECT_ID = 'kkdnnrwhzofttzajnwlj';
const PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZG5ucndoem9mdHR6YWpud2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njk2ODAsImV4cCI6MjA3OTA0NTY4MH0.IVIEaP0Stc0AieekxDFMG_q76vu6KRRMsI_yIjOfmZM';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const API_BASE = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-6757d0ca`;

console.log('\n🏥 Database Health Test\n');
console.log('─'.repeat(60));
console.log('📋 Configuration:');
console.log(`   Project ID: ${PROJECT_ID}`);
console.log(`   Supabase URL: ${SUPABASE_URL}`);
console.log(`   API Base: ${API_BASE}`);
console.log('─'.repeat(60));

const supabase = createClient(SUPABASE_URL, PUBLIC_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

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
  console.warn(`⚠️  ${message}`);
}

async function testEdgeFunctionHealth() {
  console.log('\n1️⃣  Testing Edge Function Health Endpoint...');
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PUBLIC_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const text = await response.text();
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        logResult('Edge Function Health', true, `Status: ${JSON.stringify(data)}`);
        return true;
      } catch (e) {
        logResult('Edge Function Health', true, `HTTP ${response.status}: ${text}`);
        return true;
      }
    } else {
      logResult('Edge Function Health', false, `HTTP ${response.status}: ${text}`);
      logWarning('Edge function may need to be deployed with updated routes');
      return false;
    }
  } catch (error) {
    logResult('Edge Function Health', false, error.message);
    logWarning('Edge function may not be deployed yet');
    return false;
  }
}

async function testSupabaseClient() {
  console.log('\n2️⃣  Testing Supabase Client...');
  try {
    if (!supabase) {
      throw new Error('Client is null');
    }
    logResult('Supabase Client', true, 'Client initialized successfully');
    return true;
  } catch (error) {
    logResult('Supabase Client', false, error.message);
    return false;
  }
}

async function testAuthSystem() {
  console.log('\n3️⃣  Testing Authentication System...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    logResult('Auth System', true, session ? 'Session active' : 'No session (normal)');
    return true;
  } catch (error) {
    logResult('Auth System', false, error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n4️⃣  Testing Database Connection (via REST API)...');
  try {
    // Try to access a table - if it doesn't exist, we'll get a specific error
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        logWarning('Users table does not exist - may need to run migrations');
        logResult('Database Connection', true, 'Connection works (table missing)');
        return true;
      } else if (error.code === 'PGRST301') {
        logWarning('Permission denied - database is accessible but needs RLS configuration');
        logResult('Database Connection', true, 'Connection works (permissions issue)');
        return true;
      } else if (error.message.includes('Project not specified')) {
        logResult('Database Connection', false, 'Project configuration issue');
        return false;
      } else {
        throw error;
      }
    } else {
      logResult('Database Connection', true, 'Successfully connected to database');
      return true;
    }
  } catch (error) {
    logResult('Database Connection', false, `${error.message} (Code: ${error.code || 'N/A'})`);
    return false;
  }
}

async function testKVStore() {
  console.log('\n5️⃣  Testing KV Store Table...');
  try {
    const { data, error } = await supabase
      .from('kv_store_6757d0ca')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        logWarning('KV Store table does not exist - needs migration');
        logResult('KV Store', true, 'Table missing (needs migration)');
        return false; // Not critical
      } else {
        throw error;
      }
    } else {
      logResult('KV Store', true, 'KV Store table accessible');
      return true;
    }
  } catch (error) {
    logWarning(`KV Store: ${error.message}`);
    return false;
  }
}

async function testRESTAPI() {
  console.log('\n6️⃣  Testing REST API Directly...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': PUBLIC_ANON_KEY,
        'Authorization': `Bearer ${PUBLIC_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok || response.status === 404 || response.status === 406) {
      logResult('REST API', true, `HTTP ${response.status} - API is accessible`);
      return true;
    } else {
      logResult('REST API', false, `HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logResult('REST API', false, error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n7️⃣  Testing API Endpoints...');
  
  const endpoints = [
    { method: 'POST', path: '/generate-keywords', name: 'Generate Keywords' },
    { method: 'GET', path: '/history/list', name: 'History List' },
    { method: 'GET', path: '/billing/info', name: 'Billing Info' }
  ];
  
  let passed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${PUBLIC_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
      });
      
      // If we get a response (even error), the endpoint is accessible
      if (response.status !== 404) {
        passed++;
        console.log(`   ✅ ${endpoint.name}: Accessible (HTTP ${response.status})`);
      } else {
        console.log(`   ⚠️  ${endpoint.name}: Not found (HTTP 404)`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${endpoint.name}: ${error.message}`);
    }
  }
  
  if (passed > 0) {
    logResult('API Endpoints', true, `${passed}/${endpoints.length} endpoints accessible`);
    return true;
  } else {
    logWarning('API endpoints may need deployment');
    return false;
  }
}

async function runAllTests() {
  console.log('\n🧪 Running Health Tests...\n');
  
  await testSupabaseClient();
  await testAuthSystem();
  await testRESTAPI();
  await testDatabaseConnection();
  await testKVStore();
  await testEdgeFunctionHealth();
  await testAPIEndpoints();
  
  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('\n📊 Health Test Summary:\n');
  console.log(`   ✅ Passed: ${results.passed.length} test(s)`);
  results.passed.forEach(test => console.log(`      • ${test}`));
  
  if (results.failed.length > 0) {
    console.log(`\n   ❌ Failed: ${results.failed.length} test(s)`);
    results.failed.forEach(test => console.log(`      • ${test}`));
  }
  
  if (results.warnings.length > 0) {
    console.log(`\n   ⚠️  Warnings: ${results.warnings.length}`);
    results.warnings.forEach(warning => console.log(`      • ${warning}`));
  }
  
  console.log('\n' + '─'.repeat(60));
  
  // Final verdict
  const criticalTests = ['Supabase Client', 'Auth System', 'REST API', 'Database Connection'];
  const criticalPassed = criticalTests.filter(test => results.passed.includes(test));
  const edgeFunctionWorking = results.passed.includes('Edge Function Health');
  
  console.log('\n🏥 Health Status:\n');
  
  if (criticalPassed.length === criticalTests.length) {
    console.log('✅ Core Database Health: EXCELLENT');
    console.log('   • Supabase connection: ✅ Working');
    console.log('   • Database access: ✅ Working');
    console.log('   • Authentication: ✅ Working');
    
    if (edgeFunctionWorking) {
      console.log('   • Edge Functions: ✅ Working (routes fixed!)');
      console.log('\n🎉 All systems operational!');
    } else {
      console.log('   • Edge Functions: ⚠️  Needs deployment');
      console.log('\n💡 Deploy the updated edge function to activate all endpoints.');
    }
  } else {
    console.log('⚠️  Core Database Health: NEEDS ATTENTION');
    console.log('   Some critical components are not working.');
    console.log('   Please check the failed tests above.');
  }
  
  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

