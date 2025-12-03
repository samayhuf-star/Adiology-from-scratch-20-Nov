import { captureError } from '../errorTracking';

// Google Ads API Configuration
const GOOGLE_ADS_API_TOKEN = 'UzifgEs9SwOBo5bP_vmi2A';
const GOOGLE_ADS_API_BASE = 'https://googleads.googleapis.com/v16/customers';
const AI_API_KEY = 'AIzaSyBYyBnc99JTLGvUY3qdGFksUlf7roGUdao';
// Use gemini-1.5-flash (gemini-pro is deprecated)
const AI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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

  // Try Google Ads API first (will immediately throw due to CORS)
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
    // Silently fall back to AI (expected due to CORS restrictions)
    // Don't log or capture expected CORS errors
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
    // Log error with proper message
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullError = error instanceof Error ? error : new Error(errorMessage || 'AI fallback error');
    
    // Only capture non-timeout errors (timeouts are expected in some cases)
    if (!errorMessage.includes('timeout') && !errorMessage.includes('Network error')) {
      captureError(fullError, {
        module: 'googleAds',
        action: 'generateKeywords',
        metadata: { 
          seedKeywords,
          errorMessage: errorMessage || 'Unknown error'
        }
      });
    }
    
    // Final fallback: return basic variations
    console.warn('AI keyword generation failed, using basic variations:', errorMessage);
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
 * Note: Direct browser calls to Google Ads API are blocked by CORS
 * This function immediately throws to trigger AI fallback
 * In production, Google Ads API calls should be made from a backend server
 */
async function generateKeywordsFromGoogleAds(
  request: KeywordGenerationRequest & { location: string; language: string }
): Promise<KeywordResult[]> {
  // Google Ads API cannot be called directly from browser due to CORS restrictions
  // Always throw to use AI fallback instead
  // TODO: Implement backend endpoint for Google Ads API if needed
  throw new Error('Google Ads API requires backend proxy - using AI fallback');
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
    // Add timeout for AI API calls (60 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
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
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetails = response.statusText || `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetails = errorData.error?.message || errorData.message || errorDetails;
        } catch (e) {
          // If we can't parse error response, use status text
        }
        throw new Error(`AI API error: ${errorDetails} (Status: ${response.status})`);
      }

      const data = await response.json();
      
      // Check for API errors in response
      if (data.error) {
        throw new Error(`AI API error: ${data.error.message || data.error.code || 'Unknown error'}`);
      }
      
      // Extract keywords from AI response
      const keywordText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!keywordText) {
        throw new Error('AI API error: No keywords generated in response');
      }
      
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

      if (keywords.length === 0) {
        throw new Error('AI API error: Generated keywords list is empty');
      }

      return keywords;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout errors
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
        throw new Error('AI API error: Request timeout (60s) - API is taking too long to respond');
      }
      
      // Re-throw if it's already a formatted error
      if (fetchError.message?.includes('AI API error:')) {
        throw fetchError;
      }
      
      // Handle network errors
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        throw new Error('AI API error: Network error - Unable to reach AI service');
      }
      
      // Handle other errors
      throw new Error(`AI API error: ${fetchError.message || 'Unknown error occurred'}`);
    }
  } catch (error) {
    // Re-throw with better context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`AI API error: ${String(error)}`);
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
 * Note: Direct browser calls to Google Ads API are blocked by CORS
 * This function immediately throws to trigger AI fallback
 * In production, Google Ads API calls should be made from a backend server
 */
export async function generateKeywordsFromGoogleAdsSimplified(
  seedKeywords: string[],
  locationId: string = '2840', // US
  languageId: string = '1000', // English
  maxResults: number = 300,
  negativeKeywords: string[] = []
): Promise<KeywordResult[]> {
  // Google Ads API cannot be called directly from browser due to CORS restrictions
  // Always throw to use AI fallback instead
  // TODO: Implement backend endpoint for Google Ads API if needed
  throw new Error('Google Ads API requires backend proxy - using AI fallback');
}

