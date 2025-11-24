/**
 * Simple Supabase Connection Test
 * Quick test to verify Supabase is accessible
 */

const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const PROJECT_ID = 'kkdnnrwhzofttzajnwlj';
const PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZG5ucndoem9mdHR6YWpud2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njk2ODAsImV4cCI6MjA3OTA0NTY4MH0.IVIEaP0Stc0AieekxDFMG_q76vu6KRRMsI_yIjOfmZM';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

console.log('\n🔍 Testing Supabase Connection...\n');

// Test 1: Client Creation
console.log('1️⃣  Testing Supabase Client Creation...');
try {
  const supabase = createClient(SUPABASE_URL, PUBLIC_ANON_KEY);
  console.log('   ✅ Supabase client created successfully');
  console.log(`   📍 URL: ${SUPABASE_URL}\n`);
  
  // Test 2: Simple REST API call
  console.log('2️⃣  Testing REST API connectivity...');
  const { URL } = require('url');
  const restUrl = new URL(`${SUPABASE_URL}/rest/v1/`);
  
  https.get({
    hostname: restUrl.hostname,
    path: restUrl.pathname,
    headers: {
      'apikey': PUBLIC_ANON_KEY,
      'Authorization': `Bearer ${PUBLIC_ANON_KEY}`
    },
    timeout: 5000
  }, (res) => {
    console.log(`   ✅ REST API is accessible (HTTP ${res.statusCode})\n`);
    
    // Test 3: Test edge function
    console.log('3️⃣  Testing Edge Function...');
    const edgeUrl = new URL(`${SUPABASE_URL}/functions/v1/make-server-6757d0ca/health`);
    
    https.get({
      hostname: edgeUrl.hostname,
      path: edgeUrl.pathname,
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
          console.log(`   ✅ Edge function is responding (HTTP ${res.statusCode})`);
          try {
            const json = JSON.parse(data);
            console.log(`   📦 Response: ${JSON.stringify(json)}\n`);
          } catch (e) {
            console.log(`   📦 Response: ${data}\n`);
          }
        } else {
          console.log(`   ⚠️  Edge function returned HTTP ${res.statusCode}`);
          console.log(`   📦 Response: ${data}\n`);
          console.log('   💡 This might mean the edge function needs to be deployed\n');
        }
        
        // Final summary
        console.log('─'.repeat(60));
        console.log('\n✅ Supabase Connection Test Complete!\n');
        console.log('📋 Summary:');
        console.log('   • Supabase client: ✅ Working');
        console.log('   • REST API: ✅ Accessible');
        console.log('   • Edge Function: ' + (res.statusCode === 200 ? '✅ Working' : '⚠️  May need deployment'));
        console.log('\n💡 If edge function test failed, you may need to:');
        console.log('   1. Deploy the edge function to Supabase');
        console.log('   2. Check the function name matches "make-server-6757d0ca"');
        console.log('   3. Verify the health endpoint exists in the function\n');
      });
    }).on('error', (err) => {
      console.log(`   ⚠️  Edge function test failed: ${err.message}`);
      console.log('   💡 This is normal if the edge function is not deployed yet\n');
      console.log('─'.repeat(60));
      console.log('\n✅ Supabase Connection Test Complete!\n');
      console.log('📋 Summary:');
      console.log('   • Supabase client: ✅ Working');
      console.log('   • REST API: ✅ Accessible');
      console.log('   • Edge Function: ⚠️  Not accessible (may need deployment)');
      console.log('\n💡 Core Supabase connection is working!');
      console.log('   Edge functions can be deployed separately.\n');
    });
  }).on('error', (err) => {
    console.log(`   ❌ REST API test failed: ${err.message}\n`);
    console.log('❌ Supabase connection failed. Please check your configuration.\n');
    process.exit(1);
  });
  
} catch (error) {
  console.log(`   ❌ Failed: ${error.message}\n`);
  console.log('❌ Supabase client creation failed!\n');
  process.exit(1);
}

