/**
 * Shared Keyword Generation Utility
 * 
 * Comprehensive keyword generation logic that creates keywords from seed keywords
 * using prefixes, suffixes, intents, and locations. This is the primary logic
 * used across all components (CampaignBuilder2, KeywordPlanner, KeywordPlannerSelectable, etc.)
 */

export interface KeywordGenerationOptions {
  seedKeywords: string;
  negativeKeywords?: string;
  vertical?: string;
  intentResult?: any;
  landingPageData?: any;
  maxKeywords?: number; // Default 600
  minKeywords?: number; // Default 300
}

export interface GeneratedKeyword {
  id: string;
  text: string;
  volume: string;
  cpc: string;
  type: string;
  suggestedBidCents?: number;
  suggestedBid?: string;
  bidReason?: string;
  matchType?: string;
}

/**
 * Get vertical config for keyword modifiers (import from campaignIntelligence)
 */
function getVerticalConfig(vertical: string = 'default'): any {
  // Import dynamically to avoid circular dependencies
  try {
    const { getVerticalConfig: getConfig } = require('./campaignIntelligence/verticalTemplates');
    return getConfig(vertical);
  } catch {
    return {
      serviceTokens: [],
      keywordModifiers: [],
      emergencyModifiers: []
    };
  }
}

/**
 * Get keyword modifiers for a vertical
 */
function getKeywordModifiers(vertical: string = 'default'): string[] {
  const config = getVerticalConfig(vertical);
  return config.keywordModifiers || [];
}

/**
 * Get emergency modifiers for a vertical
 */
function getEmergencyModifiers(vertical: string = 'default'): string[] {
  const config = getVerticalConfig(vertical);
  return config.emergencyModifiers || [];
}

/**
 * Get word count helper
 */
function getWordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Main keyword generation function
 * This is the shared logic used across all components
 */
export function generateKeywords(options: KeywordGenerationOptions): GeneratedKeyword[] {
  const {
    seedKeywords,
    negativeKeywords = '',
    vertical = 'default',
    intentResult,
    landingPageData,
    maxKeywords = 600,
    minKeywords = 300
  } = options;

  // Parse negative keywords (comma or newline separated)
  const negativeList = negativeKeywords
    .split(/[,\n]/)
    .map(n => n.trim().toLowerCase())
    .filter(Boolean);

  // Parse seed keywords
  const seedList = seedKeywords.split('\n').filter(k => k.trim());
  const mockKeywords: GeneratedKeyword[] = [];

  // Use vertical templates for keyword expansion
  const verticalConfig = getVerticalConfig(vertical);
  const serviceTokens = verticalConfig.serviceTokens || [];
  const keywordModifiers = getKeywordModifiers(vertical);
  const emergencyModifiers = getEmergencyModifiers(vertical);

  // Add services from landing page if available
  const allServiceTokens = [
    ...serviceTokens,
    ...(landingPageData?.services || [])
  ];

  // Expanded variation lists - use vertical-specific modifiers
  const prefixes = [
    ...keywordModifiers.filter((m: string) => !m.includes('near me')), // Location modifiers go to suffixes
    ...emergencyModifiers,
    'call', 'contact', 'phone', 'reach', 'get', 'find', 'hire', 'book',
    'best', 'top', 'professional', 'expert', 'certified', 'licensed',
    'trusted', 'reliable', 'local', 'nearby', 'fast', 'quick', 'easy',
    'affordable', 'quality', 'premium', 'experienced', 'free consultation',
    'get quote', 'request quote', 'schedule', 'book now', 'call now'
  ].slice(0, 30); // Limit to prevent too many iterations

  // Call/Lead focused suffixes - include vertical modifiers
  const suffixes = [
    ...keywordModifiers.filter((m: string) => m.includes('near me') || m.includes('services')),
    'call', 'contact', 'phone', 'call now', 'contact us', 'get quote',
    'free consultation', 'schedule', 'book', 'appointment', 'near me',
    'service', 'company', 'provider', 'expert', 'professional',
    'get started', 'sign up', 'apply now', 'request info', 'learn more',
    'pricing', 'quotes', 'rates', 'cost', 'price', 'options', 'solutions'
  ].slice(0, 30); // Limit to prevent too many iterations

  // Call/Lead Intent Keywords - Optimized for conversions
  const callLeadIntents = [
    'call', 'contact', 'reach', 'phone', 'call now', 'contact us', 'get quote',
    'request quote', 'free consultation', 'schedule', 'book', 'appointment',
    'speak with', 'talk to', 'connect with', 'reach out', 'get in touch',
    'call today', 'phone number', 'contact number', 'call us',
    'hire', 'book now', 'schedule now', 'get started', 'sign up', 'register',
    'apply', 'apply now', 'get quote now', 'request info', 'get info',
    'learn more', 'find out more', 'get help', 'need help', 'want to know'
  ].slice(0, 20); // Limit to prevent too many iterations

  // Use intent-based keywords if intent is classified
  let intents = callLeadIntents; // Default
  if (intentResult) {
    const IntentId = {
      CALL: 'CALL',
      LEAD: 'LEAD',
      TRAFFIC: 'TRAFFIC'
    };
    if (intentResult.intentId === IntentId.CALL) {
      intents = ['call', 'contact', 'phone', 'call now', 'contact us', 'reach', 'speak with', 'talk to'];
    } else if (intentResult.intentId === IntentId.LEAD) {
      intents = ['get quote', 'request quote', 'free consultation', 'schedule', 'book', 'appointment'];
    } else if (intentResult.intentId === IntentId.TRAFFIC) {
      intents = ['learn more', 'find out more', 'get info', 'visit', 'browse', 'explore'];
    }
  }

  // Add service tokens as additional seeds if landing page has services
  if (allServiceTokens.length > 0 && seedList.length < 10) {
    allServiceTokens.slice(0, 5).forEach((service: string) => {
      if (!seedList.some(s => s.toLowerCase().includes(service.toLowerCase()))) {
        seedList.push(service);
      }
    });
  }

  const locations = [
    'near me', 'local', 'nearby', 'in my area', 'close to me', 'nearby me',
    'in city', 'in town', 'in state', 'in region', 'in area', 'in location'
  ];

  // Process each seed keyword
  for (let seedIdx = 0; seedIdx < seedList.length; seedIdx++) {
    const seed = seedList[seedIdx];
    const cleanSeed = seed.trim().toLowerCase();
    let keywordCounter = 0;

    // Only use seeds that are 1-2 words
    const seedWordCount = getWordCount(cleanSeed);
    if (seedWordCount > 2) {
      // If seed is too long, split it into 2-word phrases
      const words = cleanSeed.split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        const shortSeed = `${words[i]} ${words[i + 1]}`;
        if (!negativeList.some(n => shortSeed.includes(n))) {
          mockKeywords.push({
            id: `kw-${seedIdx}-${keywordCounter++}`,
            text: shortSeed,
            volume: 'High',
            cpc: '$2.50',
            type: 'Seed'
          });
        }
      }
      continue; // Skip this seed for further generation
    }

    // Add the seed keyword itself (if 1-2 words and not in negatives)
    if (!negativeList.some(n => cleanSeed.includes(n))) {
      mockKeywords.push({
        id: `kw-${seedIdx}-${keywordCounter++}`,
        text: seed.trim(),
        volume: 'High',
        cpc: '$2.50',
        type: 'Seed'
      });
    }

    // Generate prefix + seed combinations (limit iterations and stop at maxKeywords)
    for (let pIdx = 0; pIdx < Math.min(prefixes.length, 20) && mockKeywords.length < maxKeywords; pIdx++) {
      const prefix = prefixes[pIdx];
      const keyword = `${prefix} ${cleanSeed}`;
      const wordCount = getWordCount(keyword);
      if (wordCount >= 2 && wordCount <= 4 && !negativeList.some(n => keyword.includes(n))) {
        mockKeywords.push({
          id: `kw-${seedIdx}-${keywordCounter++}`,
          text: keyword,
          volume: ['High', 'Medium', 'Low'][pIdx % 3],
          cpc: ['$2.50', '$1.80', '$1.20'][pIdx % 3],
          type: ['Exact', 'Phrase', 'Broad'][pIdx % 3]
        });
      }
    }

    // Generate seed + suffix combinations (limit iterations and stop at maxKeywords)
    for (let sIdx = 0; sIdx < Math.min(suffixes.length, 20) && mockKeywords.length < maxKeywords; sIdx++) {
      const suffix = suffixes[sIdx];
      const keyword = `${cleanSeed} ${suffix}`;
      const wordCount = getWordCount(keyword);
      if (wordCount >= 2 && wordCount <= 4 && !negativeList.some(n => keyword.includes(n))) {
        mockKeywords.push({
          id: `kw-${seedIdx}-${keywordCounter++}`,
          text: keyword,
          volume: ['High', 'Medium', 'Low'][sIdx % 3],
          cpc: ['$2.50', '$1.80', '$1.20'][sIdx % 3],
          type: ['Exact', 'Phrase', 'Broad'][sIdx % 3]
        });
      }
    }

    // Generate intent + seed combinations (limit iterations and stop at maxKeywords)
    for (let iIdx = 0; iIdx < Math.min(intents.length, 15) && mockKeywords.length < maxKeywords; iIdx++) {
      const intent = intents[iIdx];
      const keyword = `${intent} ${cleanSeed}`;
      const wordCount = getWordCount(keyword);
      if (wordCount >= 2 && wordCount <= 4 && !negativeList.some(n => keyword.includes(n))) {
        mockKeywords.push({
          id: `kw-${seedIdx}-${keywordCounter++}`,
          text: keyword,
          volume: 'High',
          cpc: '$3.50',
          type: 'Exact'
        });
      }
    }

    // Generate seed + location combinations (limit iterations and stop at maxKeywords)
    for (let lIdx = 0; lIdx < Math.min(locations.length, 6) && mockKeywords.length < maxKeywords; lIdx++) {
      const loc = locations[lIdx];
      const keyword = `${cleanSeed} ${loc}`;
      const wordCount = getWordCount(keyword);
      if (wordCount >= 2 && wordCount <= 4 && !negativeList.some(n => keyword.includes(n))) {
        mockKeywords.push({
          id: `kw-${seedIdx}-${keywordCounter++}`,
          text: keyword,
          volume: 'Medium',
          cpc: '$4.20',
          type: 'Local'
        });
      }
    }

    // Stop processing if we have enough keywords
    if (mockKeywords.length >= maxKeywords) {
      break;
    }
  }

  // Ensure we have minKeywords
  if (mockKeywords.length < minKeywords) {
    const needed = minKeywords - mockKeywords.length;
    for (let i = 0; i < needed; i++) {
      const base = mockKeywords[i % mockKeywords.length];
      const variation = `${base.text} ${i}`;
      if (!negativeList.some(n => variation.includes(n))) {
        mockKeywords.push({
          id: `kw-extra-${i}`,
          text: variation,
          volume: base.volume,
          cpc: base.cpc,
          type: base.type
        });
      }
    }
  }

  // Limit to maxKeywords
  if (mockKeywords.length > maxKeywords) {
    mockKeywords.splice(maxKeywords);
  }

  // Final filter: Remove any keywords containing negative keywords
  const finalKeywords = mockKeywords.filter((k) => {
    const keywordText = (k.text || k.id || '').toLowerCase();
    return !negativeList.some(neg => keywordText.includes(neg));
  });

  // Apply bid suggestions to keywords if intent is classified
  let keywordsWithBids = finalKeywords;
  if (intentResult) {
    try {
      const { suggestBidCents } = require('./campaignIntelligence/bidSuggestions');
      const baseCPCCents = 2000; // Default $20.00 in cents
      const emergencyMods = getEmergencyModifiers(vertical);

      keywordsWithBids = finalKeywords.map((kw) => {
        const keywordText = (kw.text || kw.id || '').trim();
        const matchType: any =
          kw.type === 'Exact' || keywordText.startsWith('[') ? 'EXACT' :
          kw.type === 'Phrase' || keywordText.startsWith('"') ? 'PHRASE' :
          'BROAD';

        // Check for emergency modifiers
        const hasEmergency = emergencyMods.some((m: string) =>
          keywordText.toLowerCase().includes(m.toLowerCase())
        );

        const bidResult = suggestBidCents(
          baseCPCCents,
          intentResult.intentId,
          matchType,
          hasEmergency ? ['emergency'] : []
        );

        return {
          ...kw,
          suggestedBidCents: bidResult.bid,
          suggestedBid: `$${(bidResult.bid / 100).toFixed(2)}`,
          bidReason: bidResult.reason,
          matchType: matchType,
        };
      });
    } catch (e) {
      console.log('Could not apply bid suggestions:', e);
    }
  }

  return keywordsWithBids;
}

