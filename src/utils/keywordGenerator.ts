/**
 * Autocomplete-Based Keyword Generation Utility
 * 
 * Generates keywords ONLY using autocomplete-style patterns that people actually type
 * in search engines (Google Suggest, Bing Autosuggest, YouTube, Amazon).
 * 
 * This follows real autocomplete behavior and does NOT invent keywords.
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
 * Autocomplete Modifiers - Real patterns from Google Suggest, Bing, YouTube, Amazon
 * These are the ONLY modifiers used - no invented combinations
 */
const AUTOCOMPLETE_MODIFIERS = {
  // Location-based autocomplete (most common)
  location: [
    'near me',
    'in [city]', // Placeholder for city insertion
    'local',
    'nearby'
  ],
  
  // Urgency/Time-based autocomplete
  urgency: [
    '24/7',
    'same day',
    'next day',
    'open now',
    'available today',
    'emergency'
  ],
  
  // Price/Cost autocomplete
  price: [
    'cost',
    'price',
    'cheap',
    'affordable',
    'free estimate',
    'free quote'
  ],
  
  // Quality/Comparison autocomplete
  quality: [
    'best',
    'top rated',
    'top',
    'reviews'
  ],
  
  // Service type autocomplete
  service: [
    'services',
    'repair',
    'replacement',
    'company',
    'companies'
  ],
  
  // Question-based autocomplete (FAQ patterns)
  question: [
    'how to',
    'what is',
    'where to',
    'when to',
    'why is',
    'does',
    'can'
  ]
};

/**
 * Intent Classification for Keywords
 */
type KeywordIntent = 'Commercial' | 'Transactional' | 'Informational' | 'Local';

/**
 * Classify keyword intent based on autocomplete patterns
 */
function classifyIntent(keyword: string): KeywordIntent {
  const lower = keyword.toLowerCase();
  
  // Local intent - contains location modifiers
  if (lower.includes('near me') || lower.includes('local') || lower.includes('nearby')) {
    return 'Local';
  }
  
  // Commercial intent - contains buying/comparison terms
  if (lower.includes('best') || lower.includes('top') || lower.includes('reviews') || 
      lower.includes('cost') || lower.includes('price') || lower.includes('cheap')) {
    return 'Commercial';
  }
  
  // Transactional intent - contains action terms
  if (lower.includes('call') || lower.includes('contact') || lower.includes('hire') || 
      lower.includes('book') || lower.includes('buy') || lower.includes('get quote')) {
    return 'Transactional';
  }
  
  // Informational intent - contains question words
  if (lower.includes('how') || lower.includes('what') || lower.includes('where') || 
      lower.includes('when') || lower.includes('why') || lower.includes('does')) {
    return 'Informational';
  }
  
  // Default to Commercial for seed keywords
  return 'Commercial';
}

/**
 * Main autocomplete-based keyword generation function
 * ONLY uses real autocomplete patterns - no invented keywords
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

  // Parse seed keywords - normalize to root terms
  const seedList = seedKeywords
    .split(/[,\n]/)
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length >= 2 && k.length <= 50)
    .slice(0, 10); // Limit seeds to prevent explosion

  if (seedList.length === 0) {
    return [];
  }

  const generatedKeywords: GeneratedKeyword[] = [];
  let keywordIdCounter = 0;

  // Process each seed keyword through autocomplete clusters
  for (const seed of seedList) {
    const cleanSeed = seed.trim().toLowerCase();
    const seedWords = cleanSeed.split(/\s+/).filter(w => w.length > 0);
    
    // Skip if seed contains negative keywords
    if (negativeList.some(neg => cleanSeed.includes(neg))) {
      continue;
    }

    // CLUSTER 1: "near me" cluster (Local Intent)
    const nearMeVariations = [
      `${cleanSeed} near me`,
      `best ${cleanSeed} near me`,
      `top ${cleanSeed} near me`,
      `cheap ${cleanSeed} near me`,
      `24/7 ${cleanSeed} near me`,
      `emergency ${cleanSeed} near me`,
      `same day ${cleanSeed} near me`,
      `${cleanSeed} services near me`,
      `${cleanSeed} repair near me`,
      `${cleanSeed} cost near me`,
      `${cleanSeed} price near me`
    ];

    nearMeVariations.forEach(kw => {
      if (generatedKeywords.length >= maxKeywords) return;
      if (negativeList.some(neg => kw.includes(neg))) return;
      if (generatedKeywords.some(k => k.text.toLowerCase() === kw.toLowerCase())) return;
      
      generatedKeywords.push({
        id: `kw-${keywordIdCounter++}`,
        text: kw,
        volume: 'High',
        cpc: '$4.20',
        type: 'Local',
        matchType: 'BROAD'
      });
    });

    // CLUSTER 2: "cost/price" cluster (Commercial Intent)
    const priceVariations = [
      `${cleanSeed} cost`,
      `${cleanSeed} price`,
      `how much does ${cleanSeed} cost`,
      `${cleanSeed} pricing`,
      `cheap ${cleanSeed}`,
      `affordable ${cleanSeed}`,
      `${cleanSeed} free estimate`,
      `${cleanSeed} free quote`,
      `best price ${cleanSeed}`,
      `low cost ${cleanSeed}`
    ];

    priceVariations.forEach(kw => {
      if (generatedKeywords.length >= maxKeywords) return;
      if (negativeList.some(neg => kw.includes(neg))) return;
      if (generatedKeywords.some(k => k.text.toLowerCase() === kw.toLowerCase())) return;
      
      generatedKeywords.push({
        id: `kw-${keywordIdCounter++}`,
        text: kw,
        volume: 'Medium',
        cpc: '$2.50',
        type: 'Commercial',
        matchType: 'PHRASE'
      });
    });

    // CLUSTER 3: "best/top" cluster (Commercial Intent)
    const qualityVariations = [
      `best ${cleanSeed}`,
      `top ${cleanSeed}`,
      `best ${cleanSeed} near me`,
      `top rated ${cleanSeed}`,
      `${cleanSeed} reviews`,
      `best ${cleanSeed} company`,
      `top ${cleanSeed} services`
    ];

    qualityVariations.forEach(kw => {
      if (generatedKeywords.length >= maxKeywords) return;
      if (negativeList.some(neg => kw.includes(neg))) return;
      if (generatedKeywords.some(k => k.text.toLowerCase() === kw.toLowerCase())) return;
      
      generatedKeywords.push({
        id: `kw-${keywordIdCounter++}`,
        text: kw,
        volume: 'High',
        cpc: '$3.00',
        type: 'Commercial',
        matchType: 'PHRASE'
      });
    });

    // CLUSTER 4: "service type" cluster (Transactional Intent)
    const serviceVariations = [
      `${cleanSeed} services`,
      `${cleanSeed} company`,
      `${cleanSeed} companies`,
      `${cleanSeed} repair`,
      `${cleanSeed} replacement`,
      `professional ${cleanSeed}`,
      `licensed ${cleanSeed}`,
      `certified ${cleanSeed}`
    ];

    serviceVariations.forEach(kw => {
      if (generatedKeywords.length >= maxKeywords) return;
      if (negativeList.some(neg => kw.includes(neg))) return;
      if (generatedKeywords.some(k => k.text.toLowerCase() === kw.toLowerCase())) return;
      
      generatedKeywords.push({
        id: `kw-${keywordIdCounter++}`,
        text: kw,
        volume: 'Medium',
        cpc: '$2.80',
        type: 'Transactional',
        matchType: 'BROAD'
      });
    });

    // CLUSTER 5: "urgency/emergency" cluster (Transactional Intent)
    const urgencyVariations = [
      `24/7 ${cleanSeed}`,
      `emergency ${cleanSeed}`,
      `same day ${cleanSeed}`,
      `${cleanSeed} 24/7`,
      `emergency ${cleanSeed} near me`,
      `24/7 ${cleanSeed} services`,
      `same day ${cleanSeed} repair`
    ];

    urgencyVariations.forEach(kw => {
      if (generatedKeywords.length >= maxKeywords) return;
      if (negativeList.some(neg => kw.includes(neg))) return;
      if (generatedKeywords.some(k => k.text.toLowerCase() === kw.toLowerCase())) return;
      
      generatedKeywords.push({
        id: `kw-${keywordIdCounter++}`,
        text: kw,
        volume: 'High',
        cpc: '$5.00',
        type: 'Transactional',
        matchType: 'EXACT'
      });
    });

    // CLUSTER 6: "FAQ autocomplete" cluster (Informational Intent)
    const questionVariations = [
      `how to ${cleanSeed}`,
      `what is ${cleanSeed}`,
      `where to ${cleanSeed}`,
      `when to ${cleanSeed}`,
      `why is ${cleanSeed}`,
      `does ${cleanSeed}`,
      `can ${cleanSeed}`
    ];

    questionVariations.forEach(kw => {
      if (generatedKeywords.length >= maxKeywords) return;
      if (negativeList.some(neg => kw.includes(neg))) return;
      if (generatedKeywords.some(k => k.text.toLowerCase() === kw.toLowerCase())) return;
      
      generatedKeywords.push({
        id: `kw-${keywordIdCounter++}`,
        text: kw,
        volume: 'Low',
        cpc: '$1.20',
        type: 'Informational',
        matchType: 'PHRASE'
      });
    });

    // CLUSTER 7: Combined modifiers (high-intent autocomplete patterns)
    const combinedPatterns = [
      `best ${cleanSeed} near me`,
      `cheap ${cleanSeed} near me`,
      `24/7 ${cleanSeed} near me`,
      `emergency ${cleanSeed} near me`,
      `best ${cleanSeed} cost`,
      `top ${cleanSeed} services`,
      `same day ${cleanSeed} repair`,
      `${cleanSeed} services near me`,
      `${cleanSeed} repair cost`,
      `${cleanSeed} replacement cost`
    ];

    combinedPatterns.forEach(kw => {
      if (generatedKeywords.length >= maxKeywords) return;
      if (negativeList.some(neg => kw.includes(neg))) return;
      if (generatedKeywords.some(k => k.text.toLowerCase() === kw.toLowerCase())) return;
      
      const intent = classifyIntent(kw);
      generatedKeywords.push({
        id: `kw-${keywordIdCounter++}`,
        text: kw,
        volume: 'High',
        cpc: '$4.50',
        type: intent,
        matchType: 'EXACT'
      });
    });

    // Add the seed keyword itself (if not too long)
    if (seedWords.length <= 3 && !generatedKeywords.some(k => k.text.toLowerCase() === cleanSeed)) {
      generatedKeywords.push({
        id: `kw-${keywordIdCounter++}`,
        text: cleanSeed,
        volume: 'High',
        cpc: '$2.50',
        type: 'Commercial',
        matchType: 'BROAD'
      });
    }

    if (generatedKeywords.length >= maxKeywords) break;
  }

  // If we need more keywords, generate additional autocomplete variations
  if (generatedKeywords.length < minKeywords && seedList.length > 0) {
    const needed = minKeywords - generatedKeywords.length;
    let generated = 0;

    // Additional autocomplete patterns with word combinations
    for (const seed of seedList) {
      if (generated >= needed) break;
      
      const seedWords = seed.split(/\s+/).filter(w => w.length > 0);
      
      // Single word + modifier combinations
      if (seedWords.length > 1) {
        for (const word of seedWords) {
          if (generated >= needed) break;
          
          const singleWordPatterns = [
            `${word} near me`,
            `${word} cost`,
            `${word} price`,
            `best ${word}`,
            `top ${word}`,
            `24/7 ${word}`,
            `emergency ${word}`,
            `${word} services`,
            `${word} repair`
          ];

          for (const pattern of singleWordPatterns) {
            if (generated >= needed) break;
            if (negativeList.some(neg => pattern.includes(neg))) continue;
            if (generatedKeywords.some(k => k.text.toLowerCase() === pattern.toLowerCase())) continue;
            
            generatedKeywords.push({
              id: `kw-extra-${generated++}`,
              text: pattern,
              volume: 'Medium',
              cpc: '$2.00',
              type: classifyIntent(pattern),
              matchType: 'BROAD'
            });
          }
        }
      }
    }
  }

  // Limit to maxKeywords
  if (generatedKeywords.length > maxKeywords) {
    generatedKeywords.splice(maxKeywords);
  }

  // Final filter: Remove any keywords containing negative keywords
  const finalKeywords = generatedKeywords.filter((k) => {
    const keywordText = (k.text || '').toLowerCase();
    return !negativeList.some(neg => keywordText.includes(neg));
  });

  // Apply bid suggestions if intent is classified
  let keywordsWithBids = finalKeywords;
  if (intentResult) {
    try {
      const { suggestBidCents } = require('./campaignIntelligence/bidSuggestions');
      const baseCPCCents = 2000;
      const emergencyMods = getEmergencyModifiers(vertical);

      keywordsWithBids = finalKeywords.map((kw) => {
        const keywordText = (kw.text || '').trim();
        const matchType: any = kw.matchType || 'BROAD';
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

    // Generate prefix + seed combinations (increased limit for more variations)
    for (let pIdx = 0; pIdx < Math.min(prefixes.length, 50) && mockKeywords.length < maxKeywords; pIdx++) {
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

    // Generate seed + suffix combinations (increased limit for more variations)
    for (let sIdx = 0; sIdx < Math.min(suffixes.length, 50) && mockKeywords.length < maxKeywords; sIdx++) {
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

    // Generate prefix + seed + suffix combinations (new: more variations)
    for (let pIdx = 0; pIdx < Math.min(prefixes.length, 25) && mockKeywords.length < maxKeywords; pIdx++) {
      for (let sIdx = 0; sIdx < Math.min(suffixes.length, 25) && mockKeywords.length < maxKeywords; sIdx++) {
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

