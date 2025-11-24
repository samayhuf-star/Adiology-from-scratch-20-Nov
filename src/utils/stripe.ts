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
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    const stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create a Stripe Customer Portal session for managing subscription
 */
export async function createCustomerPortalSession() {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    
    // Redirect to Stripe Customer Portal
    window.location.href = url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
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

