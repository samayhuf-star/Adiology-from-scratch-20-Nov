/**
 * Intent & Persona Classifier
 * 
 * Converts user goal + seeds → normalized campaign intent used everywhere
 * Deterministic rules-based classification
 */

import type { CampaignGoal, CampaignIntent, IntentClassification } from './schemas';

export interface IntentClassifierInput {
  goal: string;
  goalType?: CampaignGoal;
  landingPageUrl?: string;
  landingPageData?: {
    hasPhone?: boolean;
    hasForm?: boolean;
    hasEcommerce?: boolean;
    hasCart?: boolean;
    hasPriceTags?: boolean;
  };
  trackingPhone?: string;
  vertical?: string;
}

export interface IntentClassificationResult extends IntentClassification {
  intent_id: CampaignIntent;
  intent_label: string;
  confidence: number;
  persona: string;
  recommended_device_profile: 'mobile-first' | 'desktop-first' | 'all-devices';
  primary_kpis: string[];
  suggested_ad_types: ('CallOnly' | 'RSA' | 'ETA' | 'Display')[];
  suggested_extensions: ('CallExtension' | 'LocationExtension' | 'SitelinkExtension' | 'CalloutExtension')[];
}

// Persona lookup table: vertical + intent → persona
const PERSONA_LOOKUP: Record<string, Record<CampaignIntent, string>> = {
  electrician: {
    CALL_INTENT: 'Emergency Seeker',
    LEAD_INTENT: 'Service Shopper',
    TRAFFIC_INTENT: 'Information Seeker',
    PURCHASE_INTENT: 'Product Buyer',
  },
  plumber: {
    CALL_INTENT: 'Emergency Seeker',
    LEAD_INTENT: 'Service Shopper',
    TRAFFIC_INTENT: 'Information Seeker',
    PURCHASE_INTENT: 'Product Buyer',
  },
  hvac: {
    CALL_INTENT: 'Emergency Seeker',
    LEAD_INTENT: 'Service Shopper',
    TRAFFIC_INTENT: 'Information Seeker',
    PURCHASE_INTENT: 'Product Buyer',
  },
  lawyer: {
    CALL_INTENT: 'Legal Consultation Seeker',
    LEAD_INTENT: 'Case Evaluation Seeker',
    TRAFFIC_INTENT: 'Legal Information Seeker',
    PURCHASE_INTENT: 'Legal Service Buyer',
  },
  dentist: {
    CALL_INTENT: 'Appointment Seeker',
    LEAD_INTENT: 'Treatment Inquiry Seeker',
    TRAFFIC_INTENT: 'Dental Information Seeker',
    PURCHASE_INTENT: 'Dental Product Buyer',
  },
  doctor: {
    CALL_INTENT: 'Medical Consultation Seeker',
    LEAD_INTENT: 'Appointment Seeker',
    TRAFFIC_INTENT: 'Health Information Seeker',
    PURCHASE_INTENT: 'Medical Product Buyer',
  },
  restaurant: {
    CALL_INTENT: 'Reservation Seeker',
    LEAD_INTENT: 'Catering Inquiry Seeker',
    TRAFFIC_INTENT: 'Menu Browser',
    PURCHASE_INTENT: 'Food Orderer',
  },
  auto_repair: {
    CALL_INTENT: 'Emergency Repair Seeker',
    LEAD_INTENT: 'Service Quote Seeker',
    TRAFFIC_INTENT: 'Repair Information Seeker',
    PURCHASE_INTENT: 'Parts Buyer',
  },
  general: {
    CALL_INTENT: 'Local Service Seeker',
    LEAD_INTENT: 'Quote Seeker',
    TRAFFIC_INTENT: 'Information Seeker',
    PURCHASE_INTENT: 'Product Buyer',
  },
};

/**
 * Classify campaign intent based on goal and landing page signals
 */
export function classifyIntent(input: IntentClassifierInput): IntentClassificationResult {
  const goalText = (input.goal || '').toLowerCase();
  const landingPage = input.landingPageData || {};
  
  // Score each intent type
  const scores = {
    CALL_INTENT: 0,
    LEAD_INTENT: 0,
    TRAFFIC_INTENT: 0,
    PURCHASE_INTENT: 0,
  };
  
  // CALL_INTENT scoring
  if (goalText.includes('call') || goalText.includes('phone') || goalText.includes('talk')) {
    scores.CALL_INTENT += 2;
  }
  if (input.trackingPhone) {
    scores.CALL_INTENT += 2;
  }
  if (landingPage.hasPhone) {
    scores.CALL_INTENT += 1.5;
  }
  
  // LEAD_INTENT scoring
  if (goalText.includes('lead') || goalText.includes('quote') || goalText.includes('form') || goalText.includes('callback')) {
    scores.LEAD_INTENT += 2;
  }
  if (landingPage.hasForm) {
    scores.LEAD_INTENT += 1.5;
  }
  
  // TRAFFIC_INTENT scoring
  if (goalText.includes('traffic') || goalText.includes('visits') || goalText.includes('clicks')) {
    scores.TRAFFIC_INTENT += 2;
  }
  // Default to traffic if no strong signals
  if (Object.values(scores).every(s => s === 0)) {
    scores.TRAFFIC_INTENT = 1;
  }
  
  // PURCHASE_INTENT scoring
  if (goalText.includes('purchase') || goalText.includes('buy') || goalText.includes('sale')) {
    scores.PURCHASE_INTENT += 2;
  }
  if (landingPage.hasEcommerce || landingPage.hasCart || landingPage.hasPriceTags) {
    scores.PURCHASE_INTENT += 1.5;
  }
  
  // Find max score (argmax)
  const maxScore = Math.max(...Object.values(scores));
  const intent = (Object.keys(scores).find(key => scores[key as CampaignIntent] === maxScore) || 'TRAFFIC_INTENT') as CampaignIntent;
  
  // Calculate confidence (0-1)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? maxScore / totalScore : 0.5;
  
  // Get persona
  const vertical = (input.vertical || 'general').toLowerCase();
  const personaMap = PERSONA_LOOKUP[vertical] || PERSONA_LOOKUP.general;
  const persona = personaMap[intent] || 'Service Seeker';
  
  // Determine device profile
  const recommended_device_profile: 'mobile-first' | 'desktop-first' | 'all-devices' = 
    intent === 'CALL_INTENT' ? 'mobile-first' :
    intent === 'LEAD_INTENT' ? 'all-devices' :
    intent === 'TRAFFIC_INTENT' ? 'desktop-first' :
    'all-devices';
  
  // Primary KPIs
  const primary_kpis = 
    intent === 'CALL_INTENT' ? ['calls', 'call_conversion_rate'] :
    intent === 'LEAD_INTENT' ? ['leads', 'lead_conversion_rate', 'form_submissions'] :
    intent === 'TRAFFIC_INTENT' ? ['clicks', 'ctr', 'impressions'] :
    ['purchases', 'revenue', 'conversion_rate'];
  
  // Suggested ad types
  const suggested_ad_types: ('CallOnly' | 'RSA' | 'ETA' | 'Display')[] = 
    intent === 'CALL_INTENT' ? ['CallOnly', 'RSA'] :
    intent === 'LEAD_INTENT' ? ['RSA', 'ETA'] :
    intent === 'TRAFFIC_INTENT' ? ['RSA', 'Display'] :
    ['RSA', 'Display'];
  
  // Suggested extensions
  const suggested_extensions: ('CallExtension' | 'LocationExtension' | 'SitelinkExtension' | 'CalloutExtension')[] = 
    intent === 'CALL_INTENT' ? ['CallExtension', 'LocationExtension'] :
    intent === 'LEAD_INTENT' ? ['SitelinkExtension', 'CalloutExtension', 'CallExtension'] :
    intent === 'TRAFFIC_INTENT' ? ['SitelinkExtension', 'CalloutExtension'] :
    ['SitelinkExtension', 'CalloutExtension'];
  
  // Determine tone
  const tone: 'urgent' | 'professional' | 'friendly' | 'authoritative' = 
    intent === 'CALL_INTENT' ? 'urgent' :
    intent === 'LEAD_INTENT' ? 'professional' :
    intent === 'TRAFFIC_INTENT' ? 'friendly' :
    'professional';
  
  // Suggested match types
  const suggestedMatchTypes = 
    intent === 'CALL_INTENT' ? ['exact', 'phrase'] as const :
    intent === 'LEAD_INTENT' ? ['exact', 'phrase', 'broad'] as const :
    intent === 'TRAFFIC_INTENT' ? ['phrase', 'broad'] as const :
    ['exact', 'phrase'] as const;
  
  return {
    intent_id: intent,
    intent_label: intent.replace('_INTENT', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    confidence: Math.min(0.99, Math.max(0.5, confidence)),
    persona,
    recommended_device_profile,
    primary_kpis,
    suggested_ad_types,
    suggested_extensions,
    intent,
    suggestedMatchTypes,
    tone,
    voice: `${tone} ${persona.toLowerCase()}`,
  };
}

/**
 * Get persona from vertical and intent
 */
export function getPersona(vertical: string, intent: CampaignIntent): string {
  const verticalKey = vertical.toLowerCase();
  const personaMap = PERSONA_LOOKUP[verticalKey] || PERSONA_LOOKUP.general;
  return personaMap[intent] || 'Service Seeker';
}

