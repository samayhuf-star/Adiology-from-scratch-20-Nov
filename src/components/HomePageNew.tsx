import React from 'react';
import { Navigation } from './homepage-new/Navigation';
import { Hero } from './homepage-new/Hero';
import { Features } from './homepage-new/Features';
import { AIAdBuilderFeature } from './homepage-new/AIAdBuilderFeature';
import { CampaignStructuresFeature } from './homepage-new/CampaignStructuresFeature';
import { TemplatesPresetsFeature } from './homepage-new/TemplatesPresetsFeature';
import { BuilderSection } from './homepage-new/BuilderSection';
import { Pricing } from './homepage-new/Pricing';
import { CTASection } from './homepage-new/CTASection';
import { Footer } from './homepage-new/Footer';
import { createCheckoutSession } from '../utils/stripe';
import { notifications } from '../utils/notifications';
import { getCurrentAuthUser } from '../utils/auth';

interface HomePageNewProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onSelectPlan?: (planName: string, priceId: string, amount: number, isSubscription: boolean) => void;
}

export const HomePageNew: React.FC<HomePageNewProps> = ({ 
  onGetStarted, 
  onLogin,
  onSelectPlan 
}) => {
  const handleSelectPlan = async (
    planName: string, 
    priceId: string, 
    amount: number, 
    isSubscription: boolean
  ) => {
    try {
      // If onSelectPlan callback is provided, use it
      if (onSelectPlan) {
        onSelectPlan(planName, priceId, amount, isSubscription);
        return;
      }

      // Otherwise, try to get current user and create checkout session
      try {
        const user = await getCurrentAuthUser();
        
        if (user) {
          // User is logged in, redirect to checkout
          await createCheckoutSession(priceId, planName, user.id, user.email);
        } else {
          // User not logged in, redirect to signup first
          notifications.info('Please sign up first to select a plan', {
            title: 'Sign Up Required',
            description: 'You need to create an account before selecting a plan.',
          });
          onGetStarted();
        }
      } catch (error) {
        // If auth check fails, redirect to signup
        onGetStarted();
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      notifications.error('Failed to start checkout. Please try again.', {
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation onGetStarted={onGetStarted} onLogin={onLogin} />
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <CampaignStructuresFeature />
      <TemplatesPresetsFeature />
      <AIAdBuilderFeature />
      <BuilderSection />
      <Pricing onSelectPlan={handleSelectPlan} />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
};

