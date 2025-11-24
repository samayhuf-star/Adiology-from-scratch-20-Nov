/**
 * Test script for payment endpoints and Supabase integration
 * Run with: node test-payment-endpoints.js
 */

const SUPABASE_URL = 'https://kkdnnrwhzofttzajnwlj.supabase.co';
const API_BASE = `${SUPABASE_URL}/functions/v1/make-server-6757d0ca`;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZG5ucndoem9mdHR6YWpud2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njk2ODAsImV4cCI6MjA3OTA0NTY4MH0.IVIEaP0Stc0AieekxDFMG_q76vu6KRRMsI_yIjOfmZM';

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, endpoint, body = null, needsAuth = true) {
  try {
    log(`\n🧪 Testing: ${name}`, 'cyan');
    log(`   ${method} ${endpoint}`, 'blue');

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (needsAuth) {
      options.headers['Authorization'] = `Bearer ${ANON_KEY}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // Get response text first to handle non-JSON responses
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Not JSON - likely HTML error page
      log(`   ⚠️  Non-JSON response received`, 'yellow');
      log(`   Response preview: ${responseText.substring(0, 200)}...`, 'yellow');
      return { success: false, error: 'Non-JSON response', raw: responseText };
    }

    if (response.ok) {
      log(`   ✅ Success (${response.status})`, 'green');
      if (data.clientSecret) {
        log(`   Client Secret: ${data.clientSecret.substring(0, 20)}...`, 'yellow');
      }
      if (data.sessionId) {
        log(`   Session ID: ${data.sessionId}`, 'yellow');
      }
      if (data.url) {
        log(`   URL: ${data.url.substring(0, 50)}...`, 'yellow');
      }
      return { success: true, data };
    } else {
      log(`   ❌ Failed (${response.status})`, 'red');
      log(`   Error: ${data.error || JSON.stringify(data)}`, 'red');
      return { success: false, error: data };
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testHealthCheck() {
  return await testEndpoint('Health Check', 'GET', '/health', null, true);
}

async function testCreatePaymentIntent() {
  return await testEndpoint(
    'Create Payment Intent',
    'POST',
    '/stripe/create-payment-intent',
    {
      priceId: 'price_test_lifetime_limited',
      planName: 'Lifetime Limited',
      amount: 99.99,
      isSubscription: false,
      userId: '00000000-0000-0000-0000-000000000000', // Test user ID
    },
    true
  );
}

async function testCreateCheckoutSession() {
  return await testEndpoint(
    'Create Checkout Session',
    'POST',
    '/stripe/create-checkout-session',
    {
      priceId: 'price_test_monthly_unlimited',
      planName: 'Monthly Unlimited',
      userId: '00000000-0000-0000-0000-000000000000', // Test user ID
    },
    true
  );
}

async function testCreatePortalSession() {
  return await testEndpoint(
    'Create Portal Session',
    'POST',
    '/stripe/create-portal-session',
    {
      customerEmail: 'test@example.com',
      returnUrl: 'https://adiology.online/billing',
    },
    true
  );
}

async function testWebhookEndpoint() {
  // Test webhook endpoint (will fail without proper signature, but we can check if it's accessible)
  try {
    log(`\n🧪 Testing: Webhook Endpoint`, 'cyan');
    log(`   POST /stripe/webhook`, 'blue');

    const response = await fetch(`${API_BASE}/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature',
      },
      body: JSON.stringify({ type: 'test' }),
    });

    const data = await response.json();

    if (response.status === 400 && data.error?.includes('signature')) {
      log(`   ✅ Endpoint accessible (signature validation working)`, 'green');
      return { success: true, note: 'Signature validation is working' };
    } else if (response.status === 500 && data.error?.includes('configured')) {
      log(`   ⚠️  Endpoint accessible but Stripe not configured`, 'yellow');
      return { success: false, error: 'Stripe not configured' };
    } else {
      log(`   ✅ Endpoint accessible (${response.status})`, 'green');
      return { success: true, data };
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testSupabaseConnection() {
  try {
    log(`\n🧪 Testing: Supabase Connection`, 'cyan');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count&limit=1`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      },
    });

    if (response.ok || response.status === 200 || response.status === 401) {
      // 401 is expected if RLS is enabled, but it means Supabase is accessible
      log(`   ✅ Supabase is accessible`, 'green');
      return { success: true };
    } else {
      log(`   ⚠️  Supabase returned: ${response.status}`, 'yellow');
      return { success: false, status: response.status };
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('\n═══════════════════════════════════════════════════════', 'cyan');
  log('   Payment Endpoints & Supabase Integration Test', 'cyan');
  log('═══════════════════════════════════════════════════════\n', 'cyan');

  const results = {
    healthCheck: false,
    supabaseConnection: false,
    paymentIntent: false,
    checkoutSession: false,
    portalSession: false,
    webhook: false,
  };

  // Test 1: Health Check
  const healthResult = await testHealthCheck();
  results.healthCheck = healthResult.success;

  // Test 2: Supabase Connection
  const supabaseResult = await testSupabaseConnection();
  results.supabaseConnection = supabaseResult.success;

  // Test 3: Create Payment Intent
  const paymentIntentResult = await testCreatePaymentIntent();
  results.paymentIntent = paymentIntentResult.success;

  // Test 4: Create Checkout Session
  const checkoutResult = await testCreateCheckoutSession();
  results.checkoutSession = checkoutResult.success;

  // Test 5: Create Portal Session
  const portalResult = await testCreatePortalSession();
  results.portalSession = portalResult.success;

  // Test 6: Webhook Endpoint
  const webhookResult = await testWebhookEndpoint();
  results.webhook = webhookResult.success;

  // Summary
  log('\n═══════════════════════════════════════════════════════', 'cyan');
  log('   Test Results Summary', 'cyan');
  log('═══════════════════════════════════════════════════════\n', 'cyan');

  const tests = [
    { name: 'Health Check', result: results.healthCheck },
    { name: 'Supabase Connection', result: results.supabaseConnection },
    { name: 'Create Payment Intent', result: results.paymentIntent },
    { name: 'Create Checkout Session', result: results.checkoutSession },
    { name: 'Create Portal Session', result: results.portalSession },
    { name: 'Webhook Endpoint', result: results.webhook },
  ];

  tests.forEach(({ name, result }) => {
    if (result) {
      log(`✅ ${name}`, 'green');
    } else {
      log(`❌ ${name}`, 'red');
    }
  });

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  log(`\n📊 Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n🎉 All tests passed! Your setup is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the errors above.', 'yellow');
    log('\n💡 Common issues:', 'cyan');
    log('   - STRIPE_SECRET_KEY not set in Supabase Edge Function secrets', 'yellow');
    log('   - STRIPE_WEBHOOK_SECRET not set (optional but recommended)', 'yellow');
    log('   - Frontend URL not configured', 'yellow');
    log('   - Supabase RLS policies blocking access', 'yellow');
  }

  return results;
}

// Run tests
runAllTests().catch(console.error);

