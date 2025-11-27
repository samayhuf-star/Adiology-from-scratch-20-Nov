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
  onContactSales?: () => void;
  onScheduleDemo?: () => void;
}

export const HomePageNew: React.FC<HomePageNewProps> = ({ 
  onGetStarted, 
  onLogin,
  onSelectPlan,
  onContactSales,
  onScheduleDemo
}) => {
  const handleContactSales = () => {
    if (onContactSales) {
      onContactSales();
    } else {
      // Scroll to contact section
      const element = document.querySelector('#contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen homepage-gradient w-full overflow-x-hidden relative">
      <div className="w-full max-w-full mx-auto">
        <Navigation onGetStarted={onGetStarted} onLogin={onLogin} />
        <Hero onGetStarted={onGetStarted} onContactSales={handleContactSales} />
        <Features />
        <CampaignStructuresFeature />
        <TemplatesPresetsFeature />
        <AIAdBuilderFeature />
        <BuilderSection />
        <Pricing onSelectPlan={onSelectPlan} />
        <ContactUs />
        <CTASection onGetStarted={onGetStarted} onScheduleDemo={onScheduleDemo || handleContactSales} />
        <Footer />
      </div>
    </div>
  );
};

