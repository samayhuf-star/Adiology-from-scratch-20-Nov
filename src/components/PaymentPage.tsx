import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { 
  CreditCard, Lock, CheckCircle2, AlertCircle, ArrowLeft, 
  Sparkle, Shield, Loader2, Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { getStripe, PLAN_PRICE_IDS } from '../utils/stripe';
import { notifications } from '../utils/notifications';

interface PaymentPageProps {
  planName: string;
  priceId: string;
  amount: number;
  isSubscription: boolean;
  onBack: () => void;
  onSuccess: (planName: string, amount: number, isSubscription: boolean) => void;
}

interface PlanDetails {
  name: string;
  price: string;
  priceId: string;
  isSubscription: boolean;
  amount: number;
  features: string[];
}

const PLAN_DETAILS: Record<string, PlanDetails> = {
  'Lifetime Limited': {
    name: 'Lifetime Limited',
    price: '$99.99',
    priceId: PLAN_PRICE_IDS.lifetime_limited,
    isSubscription: false,
    features: [
      '15 campaigns/month',
      'All features included',
      'AI keyword generation',
      'Campaign builder',
      'CSV validation & export',
      '24/7 support'
    ]
  },
  'Lifetime Unlimited': {
    name: 'Lifetime Unlimited',
    price: '$199',
    priceId: PLAN_PRICE_IDS.lifetime_unlimited,
    isSubscription: false,
    features: [
      'Unlimited campaigns',
      'Unlimited access to all tools',
      'AI keyword generation',
      'Campaign builder',
      'CSV validation & export',
      'Priority support'
    ]
  },
  'Monthly Limited': {
    name: 'Monthly Limited',
    price: '$49.99',
    priceId: PLAN_PRICE_IDS.monthly_25,
    isSubscription: true,
    features: [
      '25 campaigns/month',
      'Access to other tools',
      'AI keyword generation',
      'Campaign builder',
      'CSV validation & export',
      '24/7 support'
    ]
  },
  'Monthly Unlimited': {
    name: 'Monthly Unlimited',
    price: '$99.99',
    priceId: PLAN_PRICE_IDS.monthly_unlimited,
    isSubscription: true,
    features: [
      'Unlimited campaigns',
      'Full access to all tools',
      'AI keyword generation',
      'Campaign builder',
      'CSV validation & export',
      'Priority support'
    ]
  }
};

// Payment Form Component
const PaymentForm: React.FC<{
  plan: PlanDetails;
  onSuccess: () => void;
  onBack: () => void;
}> = ({ plan, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent on mount
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      // In production, this would call your backend API
      // For now, we'll use Stripe's client-side approach
      // The backend should create a PaymentIntent and return client_secret
      
      // Simulate API call - in production, replace with actual API
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
            priceId: plan.priceId,
            planName: plan.name,
            amount: plan.amount,
            isSubscription: plan.isSubscription,
          }),
      });

      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } else {
        // Fallback: Use Stripe Checkout instead
        console.log('Payment Intent API not available, will use Checkout');
      }
    } catch (err) {
      // Fallback: Use Stripe Checkout instead
      console.log('Payment Intent API not available, will use Checkout');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait...');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    if (!cardComplete) {
      setError('Please complete the card details');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // If we have clientSecret, use PaymentIntent (supports 3D Secure)
      if (clientSecret) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              // Get user email from auth
              email: (() => {
                try {
                  const authUser = localStorage.getItem('auth_user');
                  if (authUser) {
                    return JSON.parse(authUser).email;
                  }
                } catch (e) {
                  return undefined;
                }
              })(),
            },
          },
        });

        if (confirmError) {
          setError(confirmError.message || 'Payment failed');
          setIsProcessing(false);
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          // Payment succeeded
          handlePaymentSuccess();
          return;
        }

        if (paymentIntent?.status === 'requires_action') {
          // 3D Secure authentication required
          const { error: actionError } = await stripe.handleCardAction(clientSecret);
          
          if (actionError) {
            setError(actionError.message || '3D Secure authentication failed');
            setIsProcessing(false);
            return;
          }

          // Retry payment after 3D Secure
          const { error: retryError, paymentIntent: retryPaymentIntent } = await stripe.confirmCardPayment(clientSecret);
          
          if (retryError) {
            setError(retryError.message || 'Payment failed after authentication');
            setIsProcessing(false);
            return;
          }

          if (retryPaymentIntent?.status === 'succeeded') {
            handlePaymentSuccess();
            return;
          }
        }
      } else {
        // Fallback: Use Stripe Checkout
        // Create checkout session and redirect
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: plan.priceId,
            planName: plan.name,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const { sessionId } = await response.json();
        const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });

        if (redirectError) {
          setError(redirectError.message || 'Failed to redirect to checkout');
          setIsProcessing(false);
        }
        // Redirect will happen, so we don't need to handle success here
        return;
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // Update user subscription status in localStorage (in production, this would be done by backend webhook)
    try {
      const authUser = localStorage.getItem('auth_user');
      if (authUser) {
        const user = JSON.parse(authUser);
        const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
        const userIndex = savedUsers.findIndex((u: any) => u.email === user.email);
        
        if (userIndex !== -1) {
          savedUsers[userIndex].plan = plan.name;
          savedUsers[userIndex].subscriptionStatus = 'active';
          savedUsers[userIndex].subscribedAt = new Date().toISOString();
          localStorage.setItem('adiology_users', JSON.stringify(savedUsers));
        }
      }
    } catch (e) {
      console.error('Error updating subscription:', e);
    }

    notifications.success('Payment successful!', {
      title: 'Payment Complete',
      description: `You've successfully subscribed to ${plan.name}. Redirecting...`,
    });

    setIsProcessing(false);
    
    // Redirect to success page
    setTimeout(() => {
      onSuccess(plan.name, plan.amount, plan.isSubscription);
    }, 1500);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        '::placeholder': {
          color: '#94a3b8',
        },
        fontFamily: 'system-ui, sans-serif',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Plan Summary */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Plan</span>
          <span className="text-sm font-semibold text-slate-900">{plan.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <span className="text-lg font-bold text-indigo-600">{plan.price}{plan.isSubscription ? '/month' : ''}</span>
        </div>
      </div>

      {/* Card Element */}
      <div className="space-y-2">
        <Label className="text-slate-900 font-semibold flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Card Details
        </Label>
        <div className="p-4 border border-slate-300 rounded-lg bg-white">
          <CardElement
            options={cardElementOptions}
            onChange={(e) => {
              setCardComplete(e.complete);
              if (e.error) {
                setError(e.error.message);
              } else {
                setError(null);
              }
            }}
          />
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Your payment is secured by Stripe
        </p>
      </div>

      {/* Test Card Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Test Card (Stripe Test Mode):</p>
        <div className="text-xs text-blue-700 space-y-1 font-mono">
          <div>Card: 4242 4242 4242 4242</div>
          <div>Expiry: Any future date (e.g., 12/34)</div>
          <div>CVC: Any 3 digits (e.g., 123)</div>
          <div className="mt-2 text-blue-600">For 3D Secure: Use card 4000 0025 0000 3155</div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !cardComplete || isProcessing}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-12 text-lg font-semibold"
      >
        {isProcessing ? (
          <span className="flex items-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Lock className="w-4 h-4 mr-2" />
            Pay {plan.price}
            {plan.isSubscription && ' / month'}
          </span>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <Shield className="w-4 h-4" />
        Secured by Stripe • 256-bit SSL encryption
      </div>
    </form>
  );
};

// Main Payment Page Component
export const PaymentPage: React.FC<PaymentPageProps> = ({
  planName,
  priceId,
  amount,
  isSubscription,
  onBack,
  onSuccess,
}) => {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const plan = PLAN_DETAILS[planName] || {
    name: planName,
    price: `$${amount.toFixed(2)}`,
    priceId,
    isSubscription,
    features: []
  };

  useEffect(() => {
    // Load Stripe
    const stripe = getStripe();
    setStripePromise(stripe);
  }, []);

  const elementsOptions: StripeElementsOptions = {
    mode: plan.isSubscription ? 'subscription' : 'payment',
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-800 to-purple-800 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="border border-slate-200 shadow-2xl bg-white backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-slate-700 hover:text-indigo-600 font-medium"
                disabled={false}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg mb-3">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Adiology</h2>
              <p className="text-xs text-slate-500 -mt-0.5">~ Samay</p>
            </div>
            <CardTitle className="text-xl font-bold text-center text-slate-900">
              Complete Your Payment
            </CardTitle>
            <CardDescription className="text-center text-slate-600">
              Secure payment powered by Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stripePromise ? (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <PaymentForm plan={plan} onSuccess={onSuccess} onBack={onBack} />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

