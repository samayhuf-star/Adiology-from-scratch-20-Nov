import React from 'react';
import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { Features } from './Features';
import { AIAdBuilderFeature } from './AIAdBuilderFeature';
import { CampaignStructuresFeature } from './CampaignStructuresFeature';
import { TemplatesPresetsFeature } from './TemplatesPresetsFeature';
import { BuilderSection } from './BuilderSection';
import { Pricing } from './Pricing';
import { ContactUs } from './ContactUs';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

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
  return (
    <div className="min-h-screen homepage-gradient w-full overflow-x-hidden relative">
      <div className="w-full max-w-full mx-auto">
      <Navigation onGetStarted={onGetStarted} onLogin={onLogin} />
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <CampaignStructuresFeature />
      <TemplatesPresetsFeature />
      <AIAdBuilderFeature />
      <BuilderSection />
        <Pricing onSelectPlan={onSelectPlan} />
        <ContactUs />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />
      </div>
    </div>
  );
};

