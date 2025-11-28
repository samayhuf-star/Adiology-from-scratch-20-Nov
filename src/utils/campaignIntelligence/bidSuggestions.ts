/**
 * Bid Suggestions - Match Type + Intent Based
 * 
 * Deterministic formula for recommended bids per keyword + match type
 */

import type { CampaignIntent, MatchType, BidSuggestion, BidTier } from './schemas';

export interface BidSuggestionInput {
  keyword: string;
  matchType: MatchType;
  intent: CampaignIntent;
  baseCPCEstimate?: number;
  hasEmergencyModifier?: boolean;
  hasHighValueModifier?: boolean;
  historicalData?: {
    ctr?: number;
    conversionRate?: number;
    cpa?: number;
    targetCPA?: number;
  };
}

// Intent multipliers
const MULTIPLIER_INTENT: Record<CampaignIntent, number> = {
  CALL_INTENT: 1.2,
  LEAD_INTENT: 1.0,
  TRAFFIC_INTENT: 0.7,
  PURCHASE_INTENT: 1.1,
};

// Match type multipliers
const MULTIPLIER_MATCH: Record<MatchType, number> = {
  exact: 1.0,
  phrase: 0.8,
  broad: 0.5,
  broad_modifier: 0.6,
};

/**
 * Calculate recommended bid
 */
export function calculateBidSuggestion(input: BidSuggestionInput): BidSuggestion {
  const {
    keyword,
    matchType,
    intent,
    baseCPCEstimate = 0,
    hasEmergencyModifier = false,
    hasHighValueModifier = false,
    historicalData,
  } = input;

  // Base CPC (use historical if available, otherwise use estimate or default)
  let B_base = baseCPCEstimate;
  
  if (historicalData?.cpa && historicalData?.targetCPA) {
    // Use CPA-based calculation if available
    const ctr = historicalData.ctr || 0.02; // Default 2% CTR
    const conversionRate = historicalData.conversionRate || 0.05; // Default 5% conversion
    B_base = (historicalData.targetCPA * conversionRate) / ctr;
  } else if (B_base === 0) {
    // Default base CPC (adjust per market)
    B_base = 2.0; // Default $2.00
  }

  // Get multipliers
  const multiplier_intent = MULTIPLIER_INTENT[intent] || 1.0;
  const multiplier_match = MULTIPLIER_MATCH[matchType] || 1.0;

  // Risk adjustment for emergency/high-value modifiers
  let risk_adjust = 1.0;
  if (hasEmergencyModifier) {
    risk_adjust = 1.15; // +15% for emergency
  } else if (hasHighValueModifier) {
    risk_adjust = 1.1; // +10% for high-value
  }

  // Calculate recommended bid
  const recommended_bid = roundToCent(B_base * multiplier_intent * multiplier_match * risk_adjust);

  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (historicalData && historicalData.ctr && historicalData.conversionRate) {
    confidence = 'high';
  } else if (baseCPCEstimate > 0) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Build reasoning
  const reasoningParts: string[] = [];
  reasoningParts.push(`${intent.replace('_INTENT', '')} intent`);
  reasoningParts.push(`${matchType} match`);
  if (hasEmergencyModifier) {
    reasoningParts.push('emergency modifier');
  }
  if (hasHighValueModifier) {
    reasoningParts.push('high-value modifier');
  }
  const reasoning = reasoningParts.join(' × ');

  return {
    keyword,
    matchType,
    intent,
    suggestedCPC: recommended_bid,
    suggestedCPCFormatted: formatCurrency(recommended_bid),
    confidence,
    reasoning,
    baseCPCMultiplier: multiplier_intent * multiplier_match * risk_adjust,
  };
}

/**
 * Get bid tier configuration
 */
export function getBidTier(matchType: MatchType, intent: CampaignIntent): BidTier {
  const multiplier = MULTIPLIER_INTENT[intent] * MULTIPLIER_MATCH[matchType];
  
  return {
    matchType,
    intent,
    multiplier: {
      min: multiplier * 0.9,
      max: multiplier * 1.1,
      default: multiplier,
    },
  };
}

/**
 * Calculate bid suggestions for multiple keywords
 */
export function calculateBidSuggestions(
  keywords: Array<{
    keyword: string;
    matchType: MatchType;
    hasEmergencyModifier?: boolean;
    hasHighValueModifier?: boolean;
  }>,
  intent: CampaignIntent,
  baseCPCEstimate?: number,
  historicalData?: Record<string, {
    ctr?: number;
    conversionRate?: number;
    cpa?: number;
  }>
): BidSuggestion[] {
  return keywords.map(kw => {
    const keywordHistorical = historicalData?.[kw.keyword];
    return calculateBidSuggestion({
      keyword: kw.keyword,
      matchType: kw.matchType,
      intent,
      baseCPCEstimate,
      hasEmergencyModifier: kw.hasEmergencyModifier,
      hasHighValueModifier: kw.hasHighValueModifier,
      historicalData: keywordHistorical,
    });
  });
}

/**
 * Round to nearest cent
 */
function roundToCent(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Format currency (simple version - can be enhanced with locale)
 */
function formatCurrency(value: number, currency = 'USD'): string {
  if (currency === 'USD') {
    return `$${value.toFixed(2)}`;
  }
  // Add more currency formats as needed
  return `${value.toFixed(2)} ${currency}`;
}

/**
 * Check if keyword has emergency modifier
 */
export function hasEmergencyModifier(keyword: string, emergencyModifiers: string[]): boolean {
  const lowerKeyword = keyword.toLowerCase();
  return emergencyModifiers.some(modifier => 
    lowerKeyword.includes(modifier.toLowerCase())
  );
}

/**
 * Check if keyword has high-value modifier
 */
export function hasHighValueModifier(keyword: string): boolean {
  const highValueTerms = ['premium', 'luxury', 'professional', 'expert', 'certified', 'licensed'];
  const lowerKeyword = keyword.toLowerCase();
  return highValueTerms.some(term => lowerKeyword.includes(term));
}

