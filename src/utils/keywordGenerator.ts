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
    maxKeywords = 630,
    minKeywords = 410
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
  // Prioritize vertical-specific modifiers first, then add generic ones
  const verticalPrefixes = [
    ...keywordModifiers.filter((m: string) => !m.includes('near me') && !m.includes('services')), // Location/service modifiers go to suffixes
    ...emergencyModifiers,
  ];
  
  // Generic prefixes (lower priority)
  const genericPrefixes = [
    'call', 'contact', 'phone', 'reach', 'get', 'find', 'hire', 'book',
    'best', 'top', 'professional', 'expert', 'certified', 'licensed',
    'trusted', 'reliable', 'local', 'nearby', 'fast', 'quick', 'easy',
    'affordable', 'quality', 'premium', 'experienced', 'free consultation',
    'get quote', 'request quote', 'schedule', 'book now', 'call now',
    '24/7', 'emergency', 'same day', 'immediate', 'urgent', 'asap',
  ];
  
  // Combine: vertical-specific first, then generic (prioritize relevant ones)
  const prefixes = [
    ...verticalPrefixes, // Vertical-specific modifiers first
    ...genericPrefixes.slice(0, 30), // Limit generic to avoid dilution
  ].slice(0, 50);

  // Call/Lead focused suffixes - include vertical modifiers
  const verticalSuffixes = [
    ...keywordModifiers.filter((m: string) => m.includes('near me') || m.includes('services')),
  ];
  
  // Generic suffixes (prioritize conversion-focused)
  const conversionSuffixes = [
    'call', 'contact', 'phone', 'call now', 'contact us', 'get quote',
    'free consultation', 'schedule', 'book', 'appointment', 'near me',
    'service', 'company', 'provider', 'expert', 'professional',
    'get started', 'sign up', 'apply now', 'request info',
    'pricing', 'quotes', 'rates', 'cost', 'price', 'options', 'solutions',
    'today', 'now', 'immediately', 'asap', 'same day', 'next day',
    'nearby', 'local', 'in my area', 'close to me', 'nearby me',
  ];
  
  // Combine: vertical-specific first, then conversion-focused
  const suffixes = [
    ...verticalSuffixes, // Vertical-specific modifiers first
    ...conversionSuffixes.slice(0, 35), // Limit to avoid too many generic combinations
  ].slice(0, 50);

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
  if (allServiceTokens.length > 0 && seedList.length < 15) {
    allServiceTokens.slice(0, 8).forEach((service: string) => {
      const cleanService = service.toLowerCase().trim();
      if (cleanService.length >= 3 && cleanService.length <= 40) {
        if (!seedList.some(s => s.toLowerCase().includes(cleanService) || cleanService.includes(s.toLowerCase()))) {
          seedList.push(cleanService);
        }
      }
    });
  }
  
  // Extract additional seed terms from landing page title/h1
  if (landingPageData) {
    const title = (landingPageData.title || '').trim();
    const h1 = (landingPageData.h1 || '').trim();
    
    // Extract 2-word phrases from title
    if (title && seedList.length < 20) {
      const titleWords = title.split(/\s+/).filter(w => w.length > 2);
      for (let i = 0; i < titleWords.length - 1 && seedList.length < 20; i++) {
        const phrase = `${titleWords[i]} ${titleWords[i + 1]}`.toLowerCase();
        if (phrase.length >= 5 && phrase.length <= 40) {
          if (!seedList.some(s => s.toLowerCase() === phrase)) {
            seedList.push(phrase);
          }
        }
      }
    }
    
    // Extract 2-word phrases from h1
    if (h1 && seedList.length < 25) {
      const h1Words = h1.split(/\s+/).filter(w => w.length > 2);
      for (let i = 0; i < h1Words.length - 1 && seedList.length < 25; i++) {
        const phrase = `${h1Words[i]} ${h1Words[i + 1]}`.toLowerCase();
        if (phrase.length >= 5 && phrase.length <= 40) {
          if (!seedList.some(s => s.toLowerCase() === phrase)) {
            seedList.push(phrase);
          }
        }
      }
    }
  }

  const locations = [
    'near me', 'local', 'nearby', 'in my area', 'close to me', 'nearby me',
    'in city', 'in town', 'in state', 'in region', 'in area', 'in location',
    'today', 'same day', 'next day', 'asap', 'immediately', 'now',
    'in zip code', 'in neighborhood', 'in district', 'in county', 'in metro'
  ];

  // Process each seed keyword - prioritize first few seeds (most relevant)
  const prioritySeeds = seedList.slice(0, Math.min(5, seedList.length)); // First 5 seeds are most relevant
  const remainingSeeds = seedList.slice(5);
  
  // Process priority seeds first with more variations
  for (let seedIdx = 0; seedIdx < seedList.length; seedIdx++) {
    const seed = seedList[seedIdx];
    const cleanSeed = seed.trim().toLowerCase();
    const isPriority = seedIdx < prioritySeeds.length;
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
            volume: isPriority ? 'High' : 'Medium',
            cpc: isPriority ? '$3.00' : '$2.50',
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
        volume: isPriority ? 'High' : 'Medium',
        cpc: isPriority ? '$3.00' : '$2.50',
        type: 'Seed'
      });
    }
    
    // For priority seeds, generate more variations
    const maxPrefixes = isPriority ? 50 : 30;
    const maxSuffixes = isPriority ? 50 : 30;

    // Generate prefix + seed combinations (prioritize vertical-specific prefixes)
    const prefixLimit = isPriority ? maxPrefixes : Math.min(30, prefixes.length);
    for (let pIdx = 0; pIdx < prefixLimit && mockKeywords.length < maxKeywords; pIdx++) {
      const prefix = prefixes[pIdx];
      const keyword = `${prefix} ${cleanSeed}`;
      const wordCount = getWordCount(keyword);
      if (wordCount >= 2 && wordCount <= 5 && !negativeList.some(n => keyword.includes(n))) {
        const existing = mockKeywords.find(k => k.text.toLowerCase() === keyword.toLowerCase());
        if (!existing) {
          mockKeywords.push({
            id: `kw-${seedIdx}-${keywordCounter++}`,
            text: keyword,
            volume: ['High', 'Medium', 'Low'][pIdx % 3],
            cpc: ['$2.50', '$1.80', '$1.20'][pIdx % 3],
            type: ['Exact', 'Phrase', 'Broad'][pIdx % 3]
          });
        }
      }
    }

    // Generate seed + suffix combinations (prioritize vertical-specific suffixes)
    const suffixLimit = isPriority ? maxSuffixes : Math.min(30, suffixes.length);
    for (let sIdx = 0; sIdx < suffixLimit && mockKeywords.length < maxKeywords; sIdx++) {
      const suffix = suffixes[sIdx];
      const keyword = `${cleanSeed} ${suffix}`;
      const wordCount = getWordCount(keyword);
      if (wordCount >= 2 && wordCount <= 5 && !negativeList.some(n => keyword.includes(n))) {
        const existing = mockKeywords.find(k => k.text.toLowerCase() === keyword.toLowerCase());
        if (!existing) {
          mockKeywords.push({
            id: `kw-${seedIdx}-${keywordCounter++}`,
            text: keyword,
            volume: ['High', 'Medium', 'Low'][sIdx % 3],
            cpc: ['$2.50', '$1.80', '$1.20'][sIdx % 3],
            type: ['Exact', 'Phrase', 'Broad'][sIdx % 3]
          });
        }
      }
    }

    // Generate prefix + seed + suffix combinations (prioritize for priority seeds)
    const comboLimit = isPriority ? 25 : 15;
    for (let pIdx = 0; pIdx < Math.min(prefixes.length, comboLimit) && mockKeywords.length < maxKeywords; pIdx++) {
      for (let sIdx = 0; sIdx < Math.min(suffixes.length, comboLimit) && mockKeywords.length < maxKeywords; sIdx++) {
        const prefix = prefixes[pIdx];
        const suffix = suffixes[sIdx];
        const keyword = `${prefix} ${cleanSeed} ${suffix}`;
        const wordCount = getWordCount(keyword);
        if (wordCount >= 3 && wordCount <= 6 && !negativeList.some(n => keyword.includes(n))) {
          const existing = mockKeywords.find(k => k.text.toLowerCase() === keyword.toLowerCase());
          if (!existing) {
            mockKeywords.push({
              id: `kw-${seedIdx}-${keywordCounter++}`,
              text: keyword,
              volume: 'High',
              cpc: '$3.00',
              type: 'Phrase'
            });
          }
        }
      }
    }

    // Generate intent + seed combinations (increased limit)
    for (let iIdx = 0; iIdx < Math.min(intents.length, 30) && mockKeywords.length < maxKeywords; iIdx++) {
      const intent = intents[iIdx];
      const keyword = `${intent} ${cleanSeed}`;
      const wordCount = getWordCount(keyword);
      if (wordCount >= 2 && wordCount <= 5 && !negativeList.some(n => keyword.includes(n))) {
        const existing = mockKeywords.find(k => k.text.toLowerCase() === keyword.toLowerCase());
        if (!existing) {
          mockKeywords.push({
            id: `kw-${seedIdx}-${keywordCounter++}`,
            text: keyword,
            volume: 'High',
            cpc: '$3.50',
            type: 'Exact'
          });
        }
      }
    }

    // Generate seed + location combinations (increased limit)
    for (let lIdx = 0; lIdx < Math.min(locations.length, 15) && mockKeywords.length < maxKeywords; lIdx++) {
      const loc = locations[lIdx];
      const keyword = `${cleanSeed} ${loc}`;
      const wordCount = getWordCount(keyword);
      if (wordCount >= 2 && wordCount <= 5 && !negativeList.some(n => keyword.includes(n))) {
        const existing = mockKeywords.find(k => k.text.toLowerCase() === keyword.toLowerCase());
        if (!existing) {
          mockKeywords.push({
            id: `kw-${seedIdx}-${keywordCounter++}`,
            text: keyword,
            volume: 'Medium',
            cpc: '$4.20',
            type: 'Local'
          });
        }
      }
    }

    // Generate intent + seed + location combinations (new: high-intent local keywords)
    for (let iIdx = 0; iIdx < Math.min(intents.length, 15) && mockKeywords.length < maxKeywords; iIdx++) {
      for (let lIdx = 0; lIdx < Math.min(locations.length, 10) && mockKeywords.length < maxKeywords; lIdx++) {
        const intent = intents[iIdx];
        const loc = locations[lIdx];
        const keyword = `${intent} ${cleanSeed} ${loc}`;
        const wordCount = getWordCount(keyword);
        if (wordCount >= 3 && wordCount <= 6 && !negativeList.some(n => keyword.includes(n))) {
          const existing = mockKeywords.find(k => k.text.toLowerCase() === keyword.toLowerCase());
          if (!existing) {
            mockKeywords.push({
              id: `kw-${seedIdx}-${keywordCounter++}`,
              text: keyword,
              volume: 'High',
              cpc: '$5.00',
              type: 'Exact'
            });
          }
        }
      }
    }

    // Stop processing if we have enough keywords
    if (mockKeywords.length >= maxKeywords) {
      break;
    }
  }

  // Generate more genuine variations if we need more keywords
  // Instead of padding with fake numbered keywords, create more combinations
  if (mockKeywords.length < minKeywords && seedList.length > 0) {
    const needed = minKeywords - mockKeywords.length;
    const additionalModifiers = [
      '24/7', 'emergency', 'same day', 'next day', 'immediate', 'urgent',
      'licensed', 'certified', 'insured', 'bonded', 'experienced', 'professional',
      'affordable', 'cheap', 'best price', 'low cost', 'discount', 'special offer',
      'free estimate', 'free quote', 'no obligation', 'guaranteed', 'warranty',
      'reviews', 'ratings', 'top rated', 'highly rated', 'best', 'top',
      'how to', 'what is', 'where to', 'when to', 'why', 'guide', 'tips',
      'cost', 'price', 'pricing', 'rates', 'quotes', 'estimate', 'budget'
    ];
    
    let generated = 0;
    for (let seedIdx = 0; seedIdx < seedList.length && generated < needed; seedIdx++) {
      const seed = seedList[seedIdx].trim().toLowerCase();
      const seedWords = seed.split(/\s+/);
      
      // Create word combinations from seed
      for (let i = 0; i < seedWords.length && generated < needed; i++) {
        for (let j = i + 1; j < seedWords.length && generated < needed; j++) {
          const combo = `${seedWords[i]} ${seedWords[j]}`;
          if (!mockKeywords.some(k => k.text.toLowerCase() === combo) &&
              !negativeList.some(n => combo.includes(n))) {
            mockKeywords.push({
              id: `kw-combo-${generated}`,
              text: combo,
              volume: 'Medium',
              cpc: '$1.50',
              type: 'Broad'
            });
            generated++;
          }
        }
      }
      
      // Add modifier combinations (expanded)
      for (let modIdx = 0; modIdx < additionalModifiers.length && generated < needed; modIdx++) {
        const modifier = additionalModifiers[modIdx];
        const variations = [
          `${modifier} ${seed}`,
          `${seed} ${modifier}`,
          ...(seedWords.length > 1 ? [
            `${modifier} ${seedWords[0]}`, 
            `${seedWords[0]} ${modifier}`,
            `${modifier} ${seedWords[seedWords.length - 1]}`,
            `${seedWords[seedWords.length - 1]} ${modifier}`
          ] : [])
        ];
        
        for (const variation of variations) {
          if (generated >= needed) break;
          const wordCount = getWordCount(variation);
          if (wordCount >= 2 && wordCount <= 5 &&
              !mockKeywords.some(k => k.text.toLowerCase() === variation.toLowerCase()) &&
              !negativeList.some(n => variation.includes(n))) {
            mockKeywords.push({
              id: `kw-mod-${generated}`,
              text: variation,
              volume: 'Medium',
              cpc: '$1.80',
              type: 'Phrase'
            });
            generated++;
          }
        }
      }
      
      // Add more combinations: modifier + word + another modifier
      if (seedWords.length >= 2 && generated < needed) {
        for (let i = 0; i < Math.min(additionalModifiers.length, 15) && generated < needed; i++) {
          for (let j = 0; j < Math.min(additionalModifiers.length, 15) && generated < needed; j++) {
            if (i === j) continue;
            const mod1 = additionalModifiers[i];
            const mod2 = additionalModifiers[j];
            const variations = [
              `${mod1} ${seed} ${mod2}`,
              `${seedWords[0]} ${mod1} ${mod2}`,
              `${mod1} ${mod2} ${seed}`
            ];
            
            for (const variation of variations) {
              if (generated >= needed) break;
              const wordCount = getWordCount(variation);
              if (wordCount >= 3 && wordCount <= 6 &&
                  !mockKeywords.some(k => k.text.toLowerCase() === variation.toLowerCase()) &&
                  !negativeList.some(n => variation.includes(n))) {
                mockKeywords.push({
                  id: `kw-mod2-${generated}`,
                  text: variation,
                  volume: 'Medium',
                  cpc: '$2.00',
                  type: 'Broad'
                });
                generated++;
              }
            }
          }
        }
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

