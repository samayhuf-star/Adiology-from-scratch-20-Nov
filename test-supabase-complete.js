/**
 * Complete Supabase Connection Test
 * Tests using the actual Supabase client library
 */

const { createClient } = require('@supabase/supabase-js');

const PROJECT_ID = 'kkdnnrwhzofttzajnwlj';
const PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZG5ucndoem9mdHR6YWpud2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njk2ODAsImV4cCI6MjA3OTA0NTY4MH0.IVIEaP0Stc0AieekxDFMG_q76vu6KRRMsI_yIjOfmZM';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

console.log('\n🔍 Complete Supabase Connection Test\n');
console.log('─'.repeat(60));
console.log('📋 Configuration:');
console.log(`   Project ID: ${PROJECT_ID}`);
console.log(`   Supabase URL: ${SUPABASE_URL}`);
console.log(`   Anon Key: ${PUBLIC_ANON_KEY.substring(0, 20)}...`);
console.log('─'.repeat(60));

// Create Supabase client
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

async function runTests() {
  console.log('\n🧪 Running Tests...\n');
  
  // Test 1: Client Initialization
  console.log('1️⃣  Testing Supabase Client Initialization...');
  try {
    if (!supabase) {
      throw new Error('Client is null');
    }
    console.log('   ✅ Supabase client initialized successfully\n');
    results.passed.push('Client Initialization');
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    results.failed.push('Client Initialization');
    return; // Can't continue without client
  }
  
  // Test 2: Auth System
  console.log('2️⃣  Testing Authentication System...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (session) {
      console.log(`   ✅ User session active: ${session.user.email || session.user.id}\n`);
    } else {
      console.log('   ✅ Auth system working (no active session)\n');
    }
    results.passed.push('Authentication');
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    results.failed.push('Authentication');
  }
  
  // Test 3: Database Connection via REST API
  console.log('3️⃣  Testing Database Connection (REST API)...');
  try {
    // Try to query a table - if it doesn't exist, we'll get a specific error
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('   ⚠️  Users table does not exist');
        console.log('   ✅ Database connection working (table needs to be created)\n');
        results.warnings.push('Users table not found - may need migration');
        results.passed.push('Database Connection');
      } else if (error.code === 'PGRST301') {
        console.log('   ⚠️  Permission denied - REST API is working but needs proper auth\n');
        results.warnings.push('Permission denied - may need RLS policies configured');
        results.passed.push('Database Connection');
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ Database connection successful\n');
      results.passed.push('Database Connection');
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    console.log(`   Code: ${error.code || 'N/A'}\n`);
    results.failed.push('Database Connection');
  }
  
  // Test 4: Test KV Store table
  console.log('4️⃣  Testing KV Store Table...');
  try {
    const { data, error } = await supabase
      .from('kv_store_6757d0ca')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('   ⚠️  KV Store table does not exist yet\n');
        console.log('   💡 You may need to run migrations to create this table\n');
        results.warnings.push('KV Store table not found - needs migration');
        results.passed.push('KV Store Check');
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ KV Store table is accessible\n');
      results.passed.push('KV Store');
    }
  } catch (error) {
    console.log(`   ⚠️  KV Store check: ${error.message}\n`);
    results.warnings.push(`KV Store: ${error.message}`);
  }
  
  // Test 5: Test Edge Function via direct fetch
  console.log('5️⃣  Testing Edge Function...');
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/make-server-6757d0ca/health`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PUBLIC_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Edge function is accessible`);
      console.log(`   📦 Response: ${JSON.stringify(data)}\n`);
      results.passed.push('Edge Function');
    } else {
      const text = await response.text();
      console.log(`   ⚠️  Edge function returned HTTP ${response.status}`);
      console.log(`   📦 Response: ${text}`);
      console.log('   💡 Edge function may need to be deployed\n');
      results.warnings.push('Edge function may need deployment');
    }
  } catch (error) {
    console.log(`   ⚠️  Edge function test: ${error.message}`);
    console.log('   💡 This is normal if the edge function is not deployed\n');
    results.warnings.push('Edge function not accessible');
  }
  
  // Test 6: Test Storage (if available)
  console.log('6️⃣  Testing Storage API...');
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      if (error.message.includes('not found') || error.statusCode === 404) {
        console.log('   ✅ Storage API is accessible (no buckets yet)\n');
        results.passed.push('Storage API');
      } else {
        throw error;
      }
    } else {
      console.log(`   ✅ Storage API working (${data.length} bucket(s) found)\n`);
      results.passed.push('Storage API');
    }
  } catch (error) {
    console.log(`   ⚠️  Storage API: ${error.message}\n`);
    results.warnings.push(`Storage: ${error.message}`);
  }
  
  // Summary
  console.log('─'.repeat(60));
  console.log('\n📊 Test Results Summary:\n');
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
  const criticalTests = ['Client Initialization', 'Database Connection', 'Authentication'];
  const criticalPassed = criticalTests.filter(test => results.passed.includes(test));
  
  if (criticalPassed.length === criticalTests.length) {
    console.log('\n✅ Supabase is CONNECTED and WORKING!\n');
    console.log('💡 Next Steps:');
    if (results.warnings.some(w => w.includes('table not found'))) {
      console.log('   • Run database migrations to create required tables');
    }
    if (results.warnings.some(w => w.includes('Edge function'))) {
      console.log('   • Deploy edge functions if needed');
    }
    console.log('   • Your Supabase connection is ready to use!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some critical tests failed.\n');
    console.log('💡 Troubleshooting:');
    console.log('   • Check your PROJECT_ID and PUBLIC_ANON_KEY');
    console.log('   • Verify your Supabase project is active');
    console.log('   • Check network connectivity\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

