import { captureError } from '../errorTracking';

// Google Ads API Configuration
const GOOGLE_ADS_API_TOKEN = 'UzifgEs9SwOBo5bP_vmi2A';
const GOOGLE_ADS_API_BASE = 'https://googleads.googleapis.com/v16/customers';
const AI_API_KEY = 'AIzaSyBYyBnc99JTLGvUY3qdGFksUlf7roGUdao';
const AI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface KeywordGenerationRequest {
  seedKeywords: string[];
  location?: string;
  language?: string;
  maxResults?: number;
  negativeKeywords?: string[];
}

interface KeywordResult {
  keyword: string;
  matchType?: 'broad' | 'phrase' | 'exact';
  competition?: 'low' | 'medium' | 'high';
  avgMonthlySearches?: number;
  competitionIndex?: number;
}

interface GoogleAdsKeywordResponse {
  results: Array<{
    text: string;
    keywordIdeaMetrics?: {
      avgMonthlySearches?: string;
      competition?: string;
      competitionIndex?: string;
    };
  }>;
}

/**
 * Generate keywords using Google Ads API
 * Falls back to AI if Google Ads API is unavailable
 * Returns format compatible with existing components: { keywords: [{ text, id, ... }] }
 */
export async function generateKeywords(
  request: KeywordGenerationRequest
): Promise<{ keywords: Array<{ text: string; id: string; [key: string]: any }> }> {
  const {
    seedKeywords,
    location = '2840', // United States location code
    language = '1000', // English language code
    maxResults = 300,
    negativeKeywords = []
  } = request;

  // Try Google Ads API first
  try {
    const keywords = await generateKeywordsFromGoogleAds({
      seedKeywords,
      location,
      language,
      maxResults,
      negativeKeywords
    });
    
    if (keywords && keywords.length > 0) {
      // Transform to component-compatible format
      return {
        keywords: keywords.map((kw, index) => ({
          text: kw.keyword,
          id: `kw-${Date.now()}-${index}`,
          keyword: kw.keyword,
          matchType: kw.matchType || 'broad',
          competition: kw.competition,
          avgMonthlySearches: kw.avgMonthlySearches,
          competitionIndex: kw.competitionIndex
        }))
      };
    }
  } catch (error) {
    console.warn('Google Ads API failed, falling back to AI:', error);
    captureError(error instanceof Error ? error : new Error('Google Ads API error'), {
      module: 'googleAds',
      action: 'generateKeywords',
      metadata: { seedKeywords }
    });
  }

  // Fallback to AI
  try {
    const keywords = await generateKeywordsFromAI({
      seedKeywords,
      maxResults,
      negativeKeywords
    });
    
    // Transform to component-compatible format
    return {
      keywords: keywords.map((kw, index) => ({
        text: kw.keyword,
        id: `kw-${Date.now()}-${index}`,
        keyword: kw.keyword,
        matchType: kw.matchType || 'broad'
      }))
    };
  } catch (error) {
    captureError(error instanceof Error ? error : new Error('AI fallback error'), {
      module: 'googleAds',
      action: 'generateKeywords',
      metadata: { seedKeywords }
    });
    
    // Final fallback: return basic variations
    const keywords = generateBasicKeywordVariations(seedKeywords, maxResults, negativeKeywords);
    return {
      keywords: keywords.map((kw, index) => ({
        text: kw.keyword,
        id: `kw-${Date.now()}-${index}`,
        keyword: kw.keyword,
        matchType: kw.matchType || 'broad'
      }))
    };
  }
}

/**
 * Generate keywords using Google Ads Keyword Planner API
 * Uses the provided API token for authentication
 * Note: Google Ads API typically requires OAuth2 authentication and a customer ID
 * If authentication fails, this will throw an error to trigger AI fallback
 */
async function generateKeywordsFromGoogleAds(
  request: KeywordGenerationRequest & { location: string; language: string }
): Promise<KeywordResult[]> {
  const { seedKeywords, location, language, maxResults, negativeKeywords } = request;
  
  try {
    // Google Ads API endpoint for generating keyword ideas
    // Note: This requires proper OAuth2 setup with access token and customer ID
    // The token provided might be a developer token, which requires additional OAuth2 flow
    
    // Try direct API call first (may fail without OAuth2)
    const response = await fetch(
      'https://googleads.googleapis.com/v16/customers:generateKeywordIdeas',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GOOGLE_ADS_API_TOKEN}`,
          'Content-Type': 'application/json',
          'developer-token': GOOGLE_ADS_API_TOKEN
        },
        body: JSON.stringify({
          // Note: customerId is required but may not be available without OAuth2
          // This will likely fail and trigger AI fallback
          keywordSeed: {
            keywords: seedKeywords
          },
          geoTargetConstants: [`geoTargetConstants/${location}`],
          languageConstant: `languageConstants/${language}`,
          pageSize: Math.min(maxResults, 10000), // Google Ads API limit
          includeAdultKeywords: false
        })
      }
    );

    if (!response.ok) {
      // If authentication fails (401/403), throw to trigger AI fallback
      if (response.status === 401 || response.status === 403) {
        throw new Error('Google Ads API authentication failed - using AI fallback');
      }
      const errorText = await response.text();
      console.error('Google Ads API error:', response.status, errorText);
      throw new Error(`Google Ads API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Google Ads API response to our format
    const keywords: KeywordResult[] = [];
    
    if (data.results && Array.isArray(data.results)) {
      for (const result of data.results) {
        const keywordText = result.text || result.keywordText;
        if (keywordText && !containsNegativeKeyword(keywordText, negativeKeywords)) {
          const metrics = result.keywordIdeaMetrics || result.keyword_idea_metrics || {};
          keywords.push({
            keyword: keywordText,
            avgMonthlySearches: parseInt(metrics.avgMonthlySearches || metrics.avg_monthly_searches || '0'),
            competition: mapCompetition(metrics.competition),
            competitionIndex: parseInt(metrics.competitionIndex || metrics.competition_index || '0')
          });
        }
      }
    }
    
    return keywords.slice(0, maxResults);
  } catch (error) {
    // If Google Ads API fails (e.g., authentication issues, CORS, etc.), throw to trigger fallback
    console.warn('Google Ads API call failed, will use AI fallback:', error);
    throw error;
  }
}

/**
 * Generate keywords using Google Gemini AI as fallback
 */
async function generateKeywordsFromAI(
  request: Pick<KeywordGenerationRequest, 'seedKeywords' | 'maxResults' | 'negativeKeywords'>
): Promise<KeywordResult[]> {
  const { seedKeywords, maxResults = 300, negativeKeywords = [] } = request;
  
  const prompt = `Generate ${maxResults} highly relevant Google Ads keywords based on these seed keywords: ${seedKeywords.join(', ')}.

Requirements:
- Focus on commercial and conversion-intent keywords
- Include long-tail variations
- Include location-based variations (if applicable)
- Include question-based queries (how, what, where, when)
- Include comparison keywords (best, top, vs, compare)
- Include action keywords (buy, get, find, hire, book, order)
- Exclude these negative keywords: ${negativeKeywords.join(', ') || 'none'}
- Return only the keywords, one per line
- Do not include explanations or formatting`;

  try {
    const response = await fetch(`${AI_API_BASE}?key=${AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract keywords from AI response
    const keywordText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const keywords = keywordText
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Remove numbering, bullets, and empty lines
        const cleaned = line.replace(/^[\d\-\•\*\.]\s*/, '').trim();
        return cleaned.length > 0 && 
               !cleaned.toLowerCase().includes('keyword') &&
               !cleaned.toLowerCase().includes('example') &&
               !containsNegativeKeyword(cleaned, negativeKeywords);
      })
      .slice(0, maxResults)
      .map(keyword => ({
        keyword: keyword.replace(/^[\d\-\•\*\.]\s*/, '').trim(),
        matchType: 'broad' as const
      }));

    return keywords;
  } catch (error) {
    throw error;
  }
}

/**
 * Generate basic keyword variations as final fallback
 */
function generateBasicKeywordVariations(
  seedKeywords: string[],
  maxResults: number,
  negativeKeywords: string[]
): KeywordResult[] {
  const keywords: KeywordResult[] = [];
  const modifiers = [
    'best', 'top', 'cheap', 'affordable', 'professional', 'expert',
    'near me', 'online', 'local', 'service', 'company', 'provider',
    'how to', 'what is', 'where to', 'when to', 'why',
    'buy', 'get', 'find', 'hire', 'book', 'order', 'compare',
    'reviews', 'prices', 'cost', 'quote', 'estimate'
  ];

  for (const seed of seedKeywords) {
    if (containsNegativeKeyword(seed, negativeKeywords)) continue;
    
    // Add seed as-is
    keywords.push({ keyword: seed, matchType: 'exact' });
    
    // Add with modifiers
    for (const modifier of modifiers) {
      if (keywords.length >= maxResults) break;
      
      const variations = [
        `${modifier} ${seed}`,
        `${seed} ${modifier}`,
        `${modifier} ${seed} near me`
      ];
      
      for (const variation of variations) {
        if (keywords.length >= maxResults) break;
        if (!containsNegativeKeyword(variation, negativeKeywords)) {
          keywords.push({ keyword: variation, matchType: 'broad' });
        }
      }
    }
    
    if (keywords.length >= maxResults) break;
  }

  return keywords.slice(0, maxResults);
}

/**
 * Check if a keyword contains any negative keywords
 */
function containsNegativeKeyword(keyword: string, negativeKeywords: string[]): boolean {
  const keywordLower = keyword.toLowerCase();
  return negativeKeywords.some(neg => 
    keywordLower.includes(neg.toLowerCase().trim())
  );
}

/**
 * Map Google Ads competition string to our format
 */
function mapCompetition(competition?: string): 'low' | 'medium' | 'high' | undefined {
  if (!competition) return undefined;
  
  const comp = competition.toLowerCase();
  if (comp.includes('low')) return 'low';
  if (comp.includes('medium')) return 'medium';
  if (comp.includes('high')) return 'high';
  
  return undefined;
}

/**
 * Simplified Google Ads API call using Keyword Planner API
 * Note: This requires proper OAuth2 setup in production
 */
export async function generateKeywordsFromGoogleAdsSimplified(
  seedKeywords: string[],
  locationId: string = '2840', // US
  languageId: string = '1000', // English
  maxResults: number = 300,
  negativeKeywords: string[] = []
): Promise<KeywordResult[]> {
  // This is a placeholder for the actual Google Ads API implementation
  // In production, you would:
  // 1. Implement OAuth2 flow to get access token
  // 2. Get customer ID from authenticated user
  // 3. Call Google Ads API with proper authentication
  
  // For now, we'll use a direct API approach if the token works
  // Otherwise fall back to AI
  
  try {
    // Attempt to use Google Ads API directly
    // Note: This may not work without proper OAuth2 setup
    const response = await fetch(
      'https://googleads.googleapis.com/v16/customers:generateKeywordIdeas',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GOOGLE_ADS_API_TOKEN}`,
          'Content-Type': 'application/json',
          'developer-token': GOOGLE_ADS_API_TOKEN
        },
        body: JSON.stringify({
          customerId: 'YOUR_CUSTOMER_ID', // Would need from OAuth
          keywordSeed: {
            keywords: seedKeywords
          },
          geoTargetConstants: [`geoTargetConstants/${locationId}`],
          languageConstant: `languageConstants/${languageId}`,
          pageSize: maxResults
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      const keywords: KeywordResult[] = [];
      
      if (data.results) {
        for (const result of data.results) {
          const keyword = result.text;
          if (keyword && !containsNegativeKeyword(keyword, negativeKeywords)) {
            keywords.push({
              keyword,
              avgMonthlySearches: result.keywordIdeaMetrics?.avgMonthlySearches,
              competition: mapCompetition(result.keywordIdeaMetrics?.competition),
              competitionIndex: result.keywordIdeaMetrics?.competitionIndex
            });
          }
        }
      }
      
      return keywords.slice(0, maxResults);
    }
    
    throw new Error('Google Ads API request failed');
  } catch (error) {
    // Re-throw to trigger AI fallback
    throw error;
  }
}

