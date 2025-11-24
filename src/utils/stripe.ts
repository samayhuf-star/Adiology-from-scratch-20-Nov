import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe publishable key - should be set via environment variable in production
// For now, using a placeholder - replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(priceId: string, planName: string) {
  try {
    // Check if Stripe is properly configured
    if (STRIPE_PUBLISHABLE_KEY === 'pk_test_placeholder') {
      throw new Error('Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY environment variable.');
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        planName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create checkout session: ${response.statusText}`);
    }

    const { sessionId } = await response.json();
    
    if (!sessionId) {
      throw new Error('No session ID returned from server');
    }

    const stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Stripe failed to load. Please check your Stripe publishable key.');
    }

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw new Error(error.message || 'Failed to redirect to checkout');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again or contact support.');
  }
}

/**
 * Create a Stripe Customer Portal session for managing subscription
 */
export async function createCustomerPortalSession() {
  try {
    // Check if Stripe is properly configured
    if (STRIPE_PUBLISHABLE_KEY === 'pk_test_placeholder') {
      throw new Error('Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY environment variable.');
    }

    // Get user email for customer identification
    const authUser = localStorage.getItem('auth_user');
    let customerEmail = '';
    
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        customerEmail = user.email || '';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Try Supabase Edge Function first
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'kkdnnrwhzofttzajnwlj';
    const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    let response: Response;
    let portalUrl: string | null = null;

    try {
      // Try Supabase Edge Function
      response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6757d0ca/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            customerEmail,
            returnUrl: window.location.origin + '/billing',
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        portalUrl = data.url;
      }
    } catch (e) {
      console.warn('Supabase Edge Function unavailable, trying direct API:', e);
    }

    // Fallback: Try direct API endpoint
    if (!portalUrl) {
      try {
        response = await fetch('/api/create-portal-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerEmail,
            returnUrl: window.location.origin + '/billing',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          portalUrl = data.url;
        }
      } catch (e) {
        console.warn('Direct API unavailable:', e);
      }
    }

    if (!portalUrl) {
      // If no backend available, show instructions
      throw new Error(
        'Stripe Customer Portal is not available. Please contact support at support@adiology.com to manage your subscription.'
      );
    }
    
    // Redirect to Stripe Customer Portal
    window.location.href = portalUrl;
  } catch (error) {
    console.error('Error creating portal session:', error);
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again or contact support.');
  }
}

/**
 * Plan price IDs mapping (replace with your actual Stripe Price IDs)
 */
export const PLAN_PRICE_IDS = {
  lifetime_limited: 'price_lifetime_limited', // $99.99 one-time
  lifetime_unlimited: 'price_lifetime_unlimited', // $199 one-time
  monthly_25: 'price_monthly_25', // $49.99/month
  monthly_unlimited: 'price_monthly_unlimited', // $99.99/month
};

