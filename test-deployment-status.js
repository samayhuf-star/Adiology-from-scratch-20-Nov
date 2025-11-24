/**
 * Test Edge Function Deployment Status
 * This script checks if the Edge Function is deployed and accessible
 */

const SUPABASE_URL = 'https://kkdnnrwhzofttzajnwlj.supabase.co';
const FUNCTION_NAME = 'make-server-6757d0ca';
const API_BASE = `${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZG5ucndoem9mdHR6YWpud2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njk2ODAsImV4cCI6MjA3OTA0NTY4MH0.IVIEaP0Stc0AieekxDFMG_q76vu6KRRMsI_yIjOfmZM';

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

async function checkDeployment() {
  log('\n═══════════════════════════════════════════════════════', 'cyan');
  log('   Edge Function Deployment Status Check', 'cyan');
  log('═══════════════════════════════════════════════════════\n', 'cyan');

  log('🔍 Checking Edge Function deployment...\n', 'blue');

  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    
    log(`📊 Response Status: ${response.status}`, response.status === 200 ? 'green' : 'yellow');
    log(`📄 Response Preview: ${responseText.substring(0, 150)}...\n`, 'yellow');

    if (response.status === 200) {
      try {
        const data = JSON.parse(responseText);
        if (data.status === 'ok') {
          log('✅ Edge Function is DEPLOYED and WORKING!', 'green');
          log('\n🧪 Testing payment endpoints...\n', 'blue');
          return true;
        }
      } catch (e) {
        // Not JSON but 200 - might be HTML
        log('⚠️  Edge Function responded but with unexpected format', 'yellow');
      }
    } else if (response.status === 404) {
      log('❌ Edge Function NOT FOUND (404)', 'red');
      log('\n💡 The function needs to be deployed:', 'cyan');
      log('   1. Run: ./scripts/deploy-edge-function.sh', 'yellow');
      log('   2. Or deploy via Supabase Dashboard', 'yellow');
      return false;
    } else if (responseText.includes('Project not specified')) {
      log('❌ Edge Function NOT DEPLOYED', 'red');
      log('\n💡 Deployment Required:', 'cyan');
      log('   The function exists but is not deployed to Supabase.', 'yellow');
      log('\n📝 To deploy:', 'cyan');
      log('   1. Install Supabase CLI: npm install -g supabase', 'yellow');
      log('   2. Login: supabase login', 'yellow');
      log('   3. Link project: supabase link --project-ref kkdnnrwhzofttzajnwlj', 'yellow');
      log('   4. Deploy: supabase functions deploy make-server-6757d0ca --no-verify-jwt', 'yellow');
      log('\n   OR deploy via Supabase Dashboard:', 'cyan');
      log('   https://supabase.com/dashboard/project/kkdnnrwhzofttzajnwlj/functions', 'yellow');
      return false;
    } else {
      log(`⚠️  Unexpected response: ${response.status}`, 'yellow');
      log(`   Response: ${responseText.substring(0, 200)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Connection Error: ${error.message}`, 'red');
    log('\n💡 Possible issues:', 'cyan');
    log('   - Network connectivity problem', 'yellow');
    log('   - Edge Function not deployed', 'yellow');
    log('   - Incorrect URL or project reference', 'yellow');
    return false;
  }

  return false;
}

async function testPaymentEndpoints() {
  log('═══════════════════════════════════════════════════════', 'cyan');
  log('   Payment Endpoints Test', 'cyan');
  log('═══════════════════════════════════════════════════════\n', 'cyan');

  const endpoints = [
    {
      name: 'Create Payment Intent',
      method: 'POST',
      path: '/stripe/create-payment-intent',
      body: {
        priceId: 'price_test',
        planName: 'Lifetime Limited',
        amount: 99.99,
        isSubscription: false,
        userId: '00000000-0000-0000-0000-000000000000',
      },
    },
    {
      name: 'Create Checkout Session',
      method: 'POST',
      path: '/stripe/create-checkout-session',
      body: {
        priceId: 'price_test',
        planName: 'Monthly Unlimited',
        userId: '00000000-0000-0000-0000-000000000000',
      },
    },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      log(`🧪 Testing: ${endpoint.name}`, 'cyan');
      
      const response = await fetch(`${API_BASE}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(endpoint.body),
      });

      const responseText = await response.text();
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          if (data.error && data.error.includes('not configured')) {
            log(`   ⚠️  Endpoint works but Stripe not configured`, 'yellow');
            log(`   Error: ${data.error}`, 'yellow');
            results.push({ name: endpoint.name, status: 'partial', error: data.error });
          } else {
            log(`   ✅ Success!`, 'green');
            results.push({ name: endpoint.name, status: 'success' });
          }
        } catch (e) {
          log(`   ⚠️  Non-JSON response`, 'yellow');
          results.push({ name: endpoint.name, status: 'error', error: 'Non-JSON response' });
        }
      } else {
        log(`   ❌ Failed (${response.status})`, 'red');
        log(`   Response: ${responseText.substring(0, 100)}`, 'red');
        results.push({ name: endpoint.name, status: 'error', error: responseText });
      }
    } catch (error) {
      log(`   ❌ Error: ${error.message}`, 'red');
      results.push({ name: endpoint.name, status: 'error', error: error.message });
    }
    log('');
  }

  return results;
}

async function main() {
  const isDeployed = await checkDeployment();
  
  if (isDeployed) {
    const results = await testPaymentEndpoints();
    
    log('\n═══════════════════════════════════════════════════════', 'cyan');
    log('   Summary', 'cyan');
    log('═══════════════════════════════════════════════════════\n', 'cyan');
    
    results.forEach(({ name, status, error }) => {
      if (status === 'success') {
        log(`✅ ${name}`, 'green');
      } else if (status === 'partial') {
        log(`⚠️  ${name} - ${error}`, 'yellow');
      } else {
        log(`❌ ${name}`, 'red');
      }
    });

    const needsStripe = results.some(r => r.status === 'partial' && r.error?.includes('Stripe'));
    
    if (needsStripe) {
      log('\n💡 Next Steps:', 'cyan');
      log('   1. Add STRIPE_SECRET_KEY to Supabase Edge Function secrets', 'yellow');
      log('   2. Add STRIPE_WEBHOOK_SECRET (optional but recommended)', 'yellow');
      log('   3. Add FRONTEND_URL for redirect URLs', 'yellow');
      log('\n   Go to: https://supabase.com/dashboard/project/kkdnnrwhzofttzajnwlj/functions/make-server-6757d0ca/settings', 'blue');
    }
  } else {
    log('\n❌ Cannot test payment endpoints - Edge Function not deployed', 'red');
  }
}

main().catch(console.error);

