import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Globe, Link2, Sparkles, Brain, 
  Hash, MapPin, FileText, Download, AlertCircle, CheckCircle2,
  Loader2, Search, Filter, X, Plus, Edit3, Trash2, Save,
  Target, Zap, Layers, TrendingUp, Building2, ShoppingBag,
  Phone, Mail, Calendar, Clock, Eye, FileSpreadsheet, Copy,
  MessageSquare, Gift, Image as ImageIcon, DollarSign, MapPin as MapPinIcon,
  Star, RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { notifications } from '../utils/notifications';
import { extractLandingPageContent, type LandingPageExtractionResult } from '../utils/campaignIntelligence/landingPageExtractor';
import { mapGoalToIntent } from '../utils/campaignIntelligence/intentClassifier';
import { type IntentResult, IntentId } from '../utils/campaignIntelligence/schemas';
import { generateCampaignStructure, type StructureSettings } from '../utils/campaignStructureGenerator';
import { generateKeywords as generateKeywordsUtil } from '../utils/keywordGenerator';
import {
  generateAds as generateAdsUtility, 
  detectUserIntent,
  type AdGenerationInput,
  type ResponsiveSearchAd,
  type ExpandedTextAd,
  type CallOnlyAd
} from '../utils/googleAdGenerator';
import { exportCampaignToCSVV3, validateCSVBeforeExport, generateCSVV3 } from '../utils/csvGeneratorV3';
import { historyService } from '../utils/historyService';
import { api } from '../utils/api';
import { AutoFillButton } from './AutoFillButton';
import { 
  generateURL, 
  generateCampaignName, 
  generateSeedKeywords, 
  generateNegativeKeywords,
  generateLocationInput 
} from '../utils/autoFill';

// Campaign Structure Types (12 structures)
const CAMPAIGN_STRUCTURES = [
  { id: 'skag', name: 'SKAG', description: 'Single Keyword Ad Group', icon: Target },
  { id: 'stag', name: 'STAG', description: 'Single Theme Ad Group', icon: Layers },
  { id: 'mix', name: 'Mix', description: 'Hybrid Structure', icon: TrendingUp },
  { id: 'stag_plus', name: 'STAG+', description: 'Smart Grouping with ML', icon: Brain },
  { id: 'intent', name: 'Intent-Based', description: 'Group by Intent', icon: Target },
  { id: 'alpha_beta', name: 'Alpha-Beta', description: 'Winners & Discovery', icon: Zap },
  { id: 'match_type', name: 'Match-Type Split', description: 'Separate by Match Type', icon: Filter },
  { id: 'geo', name: 'GEO-Segmented', description: 'One Campaign per Geo', icon: MapPin },
  { id: 'funnel', name: 'Funnel-Based', description: 'TOF/MOF/BOF', icon: TrendingUp },
  { id: 'brand_split', name: 'Brand Split', description: 'Brand vs Non-Brand', icon: Building2 },
  { id: 'competitor', name: 'Competitor', description: 'Competitor Campaigns', icon: Target },
  { id: 'ngram', name: 'N-Gram Clusters', description: 'Smart Clustering', icon: Brain },
];

// Match Types
const MATCH_TYPES = [
  { id: 'broad', label: 'Broad Match', example: 'keyword' },
  { id: 'phrase', label: 'Phrase Match', example: '"keyword"' },
  { id: 'exact', label: 'Exact Match', example: '[keyword]' },
];

// Keyword Types for filtering
const KEYWORD_TYPES = [
  { id: 'broad', label: 'Broad Match' },
  { id: 'phrase', label: 'Phrase Match' },
  { id: 'exact', label: 'Exact Match' },
  { id: 'negative', label: 'Negative Keywords' },
];

// Default negative keywords (15-20 keywords as specified)
const DEFAULT_NEGATIVE_KEYWORDS = [
  'cheap',
  'discount',
  'cost',
  'reviews',
  'job',
  'apply',
  'information',
  'company',
  'free',
  'best',
  'providers',
  'office',
  'headquater',
  'brand',
];

// Extension types definition (used in handlers and render)
const extensionTypes = [
  { id: 'snippet', label: 'SNIPPET EXTENSION', icon: FileText },
  { id: 'callout', label: 'CALLOUT EXTENSION', icon: MessageSquare },
  { id: 'sitelink', label: 'SITELINK EXTENSION', icon: Link2 },
  { id: 'call', label: 'CALL EXTENSION', icon: Phone },
  { id: 'price', label: 'PRICE EXTENSION', icon: DollarSign },
  { id: 'app', label: 'APP EXTENSION', icon: Phone },
  { id: 'location', label: 'LOCATION EXTENSION', icon: MapPinIcon },
  { id: 'message', label: 'MESSAGE EXTENSION', icon: MessageSquare },
  { id: 'leadform', label: 'LEAD FORM EXTENSION', icon: FileText },
  { id: 'promotion', label: 'PROMOTION EXTENSION', icon: Gift },
  { id: 'image', label: 'IMAGE EXTENSION', icon: ImageIcon },
];

// Location Presets - Top locations
const LOCATION_PRESETS = {
  countries: [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
    'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Sweden', 'Norway',
    'Denmark', 'Finland', 'Poland', 'Austria', 'Ireland', 'Portugal', 'Greece'
  ],
  states: [
    'California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania',
    'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia',
    'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri',
    'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina', 'Alabama',
    'Louisiana', 'Kentucky', 'Oregon', 'Oklahoma', 'Connecticut', 'Utah'
  ],
  cities: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle',
    'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City',
    'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque',
    'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Raleigh',
    'Miami', 'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Tampa',
    'Arlington', 'New Orleans', 'Wichita', 'Cleveland'
  ],
  zipCodes: (() => {
    // Top 5000 most common US ZIP codes (major metropolitan areas)
    const majorMetros = [
      // NYC area
      ...Array.from({ length: 200 }, (_, i) => String(10001 + i).padStart(5, '0')),
      // LA area
      ...Array.from({ length: 300 }, (_, i) => String(90001 + i).padStart(5, '0')),
      // Chicago area
      ...Array.from({ length: 250 }, (_, i) => String(60601 + i).padStart(5, '0')),
      // Houston area
      ...Array.from({ length: 200 }, (_, i) => String(77001 + i).padStart(5, '0')),
      // Phoenix area
      ...Array.from({ length: 150 }, (_, i) => String(85001 + i).padStart(5, '0')),
      // Philadelphia area
      ...Array.from({ length: 200 }, (_, i) => String(19101 + i).padStart(5, '0')),
      // San Antonio
      ...Array.from({ length: 100 }, (_, i) => String(78201 + i).padStart(5, '0')),
      // San Diego
      ...Array.from({ length: 150 }, (_, i) => String(92101 + i).padStart(5, '0')),
      // Dallas
      ...Array.from({ length: 150 }, (_, i) => String(75201 + i).padStart(5, '0')),
      // San Jose
      ...Array.from({ length: 100 }, (_, i) => String(95101 + i).padStart(5, '0')),
      // Austin
      ...Array.from({ length: 100 }, (_, i) => String(78701 + i).padStart(5, '0')),
      // Jacksonville
      ...Array.from({ length: 100 }, (_, i) => String(32201 + i).padStart(5, '0')),
      // Fort Worth
      ...Array.from({ length: 100 }, (_, i) => String(76101 + i).padStart(5, '0')),
      // Columbus
      ...Array.from({ length: 100 }, (_, i) => String(43201 + i).padStart(5, '0')),
      // Charlotte
      ...Array.from({ length: 100 }, (_, i) => String(28201 + i).padStart(5, '0')),
      // San Francisco
      ...Array.from({ length: 100 }, (_, i) => String(94101 + i).padStart(5, '0')),
      // Indianapolis
      ...Array.from({ length: 100 }, (_, i) => String(46201 + i).padStart(5, '0')),
      // Seattle
      ...Array.from({ length: 100 }, (_, i) => String(98101 + i).padStart(5, '0')),
      // Denver
      ...Array.from({ length: 100 }, (_, i) => String(80201 + i).padStart(5, '0')),
      // Washington DC
      ...Array.from({ length: 100 }, (_, i) => String(20001 + i).padStart(5, '0')),
      // Boston
      ...Array.from({ length: 100 }, (_, i) => String(2101 + i).padStart(5, '0')),
      // El Paso
      ...Array.from({ length: 50 }, (_, i) => String(79901 + i).padStart(5, '0')),
      // Nashville
      ...Array.from({ length: 50 }, (_, i) => String(37201 + i).padStart(5, '0')),
      // Detroit
      ...Array.from({ length: 100 }, (_, i) => String(48201 + i).padStart(5, '0')),
      // Oklahoma City
      ...Array.from({ length: 50 }, (_, i) => String(73101 + i).padStart(5, '0')),
      // Portland
      ...Array.from({ length: 50 }, (_, i) => String(97201 + i).padStart(5, '0')),
      // Las Vegas
      ...Array.from({ length: 100 }, (_, i) => String(89101 + i).padStart(5, '0')),
      // Memphis
      ...Array.from({ length: 50 }, (_, i) => String(38101 + i).padStart(5, '0')),
      // Louisville
      ...Array.from({ length: 50 }, (_, i) => String(40201 + i).padStart(5, '0')),
      // Baltimore
      ...Array.from({ length: 100 }, (_, i) => String(21201 + i).padStart(5, '0')),
      // Milwaukee
      ...Array.from({ length: 50 }, (_, i) => String(53201 + i).padStart(5, '0')),
      // Albuquerque
      ...Array.from({ length: 50 }, (_, i) => String(87101 + i).padStart(5, '0')),
      // Tucson
      ...Array.from({ length: 50 }, (_, i) => String(85701 + i).padStart(5, '0')),
      // Fresno
      ...Array.from({ length: 50 }, (_, i) => String(93701 + i).padStart(5, '0')),
      // Sacramento
      ...Array.from({ length: 50 }, (_, i) => String(95814 + i).padStart(5, '0')),
      // Kansas City
      ...Array.from({ length: 50 }, (_, i) => String(64101 + i).padStart(5, '0')),
      // Mesa
      ...Array.from({ length: 50 }, (_, i) => String(85201 + i).padStart(5, '0')),
      // Atlanta
      ...Array.from({ length: 100 }, (_, i) => String(30301 + i).padStart(5, '0')),
      // Omaha
      ...Array.from({ length: 50 }, (_, i) => String(68101 + i).padStart(5, '0')),
      // Raleigh
      ...Array.from({ length: 50 }, (_, i) => String(27601 + i).padStart(5, '0')),
      // Miami
      ...Array.from({ length: 100 }, (_, i) => String(33101 + i).padStart(5, '0')),
      // Long Beach
      ...Array.from({ length: 50 }, (_, i) => String(90801 + i).padStart(5, '0')),
      // Virginia Beach
      ...Array.from({ length: 50 }, (_, i) => String(23451 + i).padStart(5, '0')),
      // Oakland
      ...Array.from({ length: 50 }, (_, i) => String(94601 + i).padStart(5, '0')),
      // Minneapolis
      ...Array.from({ length: 50 }, (_, i) => String(55401 + i).padStart(5, '0')),
      // Tulsa
      ...Array.from({ length: 50 }, (_, i) => String(74101 + i).padStart(5, '0')),
      // Tampa
      ...Array.from({ length: 50 }, (_, i) => String(33601 + i).padStart(5, '0')),
      // Arlington
      ...Array.from({ length: 50 }, (_, i) => String(76001 + i).padStart(5, '0')),
      // New Orleans
      ...Array.from({ length: 50 }, (_, i) => String(70112 + i).padStart(5, '0')),
      // Wichita
      ...Array.from({ length: 50 }, (_, i) => String(67201 + i).padStart(5, '0')),
      // Cleveland
      ...Array.from({ length: 100 }, (_, i) => String(44101 + i).padStart(5, '0')),
    ];
    // Remove duplicates and limit to 5000
    return [...new Set(majorMetros)].slice(0, 5000);
  })(),
};

interface AdGroup {
  id: string;
  name: string;
  keywords: string[];
}

interface CampaignData {
  url: string;
  campaignName: string;
  intent: IntentResult | null;
  vertical: string | null;
  cta: string | null;
  landingPageData: LandingPageExtractionResult | null; // Store landing page data for keyword generation
  selectedStructure: string | null;
  structureRankings: { id: string; score: number }[];
  seedKeywords: string[];
  negativeKeywords: string[];
  generatedKeywords: any[];
  selectedKeywords: any[];
  keywordTypes: { [key: string]: boolean };
  ads: any[];
  adTypes: string[];
  extensions: any[];
  adGroups: AdGroup[];
  selectedAdGroup: string | null;
  targetCountry: string;
  locations: {
    countries: string[];
    states: string[];
    cities: string[];
    zipCodes: string[];
  };
  csvData: any;
  csvErrors: any[];
}

export const CampaignBuilder3: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campaignSaved, setCampaignSaved] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState({ countries: '', states: '', cities: '', zipCodes: '' });
  const [campaignData, setCampaignData] = useState<CampaignData>({
    url: '',
    campaignName: '',
    intent: null,
    vertical: null,
    cta: null,
    landingPageData: null, // Store landing page data
    selectedStructure: null,
    structureRankings: [],
    seedKeywords: [],
    negativeKeywords: [...DEFAULT_NEGATIVE_KEYWORDS], // Initialize with default negative keywords
    generatedKeywords: [],
    selectedKeywords: [],
    keywordTypes: { broad: true, phrase: true, exact: true, negative: true }, // Show negative keywords by default
    ads: [],
    adTypes: ['rsa', 'dki'],
    extensions: [],
    adGroups: [],
    selectedAdGroup: 'ALL_AD_GROUPS',
    targetCountry: 'United States',
    locations: { countries: [], states: [], cities: [], zipCodes: [] },
    csvData: null,
    csvErrors: [],
  });

  // Enforce 3 ads maximum limit
  useEffect(() => {
    if (campaignData.ads.length > 3) {
      const excessAds = campaignData.ads.length - 3;
      setCampaignData(prev => ({
        ...prev,
        ads: prev.ads.slice(0, 3), // Hard limit to 3 ads
      }));
      notifications.warning(`Ads limited to maximum of 3. ${excessAds} ad(s) removed.`, {
        title: 'Limit Enforced',
        description: 'Only the first 3 ads are kept. Please delete ads if you want to add different ones.'
      });
    }
  }, [campaignData.ads.length]);

  // Generate default campaign name: Search-date-time
  useEffect(() => {
    if (!campaignData.campaignName && campaignData.url) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4);
      setCampaignData(prev => ({
        ...prev,
        campaignName: `Search-${dateStr}-${timeStr}`
      }));
    }
  }, [campaignData.url]);

  // Step 1: URL Input & AI Analysis
  const handleUrlSubmit = async () => {
    if (!campaignData.url || !campaignData.url.trim()) {
      notifications.error('Please enter a valid URL', { title: 'URL Required' });
      return;
    }

    setLoading(true);
    try {
      // Extract landing page content (may fail due to CSP - that's OK)
      let landingData: LandingPageExtractionResult;
      try {
        landingData = await extractLandingPageContent(campaignData.url || '');
      } catch (extractError: any) {
        // If extraction fails (e.g., CSP violation), use fallback
        console.warn('Landing page extraction failed, using fallback:', extractError);
        const extractDomain = (url: string): string => {
          if (!url || typeof url !== 'string') return 'example.com';
          try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
          } catch {
            return url.split('/')[0].replace(/^https?:\/\//, '').replace(/^www\./, '') || 'example.com';
          }
        };
        landingData = {
          domain: extractDomain(campaignData.url || 'example.com'),
          title: null,
          h1: null,
          metaDescription: null,
          services: [],
          phones: [],
          emails: [],
          hours: null,
          addresses: [],
          schemas: {},
          page_text_tokens: [],
          extractionMethod: 'fallback',
          extractedAt: new Date().toISOString(),
        };
      }
      
      // Detect intent, CTA, and vertical (with null checks)
      const intentResult = mapGoalToIntent(
        (landingData?.title || landingData?.h1 || '').trim(),
        landingData || {} as any,
        landingData?.phones?.[0] || ''
      );

      // Determine vertical from content
      const vertical = detectVertical(landingData);
      
      // Determine CTA
      const cta = detectCTA(landingData);

      // Generate seed keywords (3-4 keywords)
      const seedKeywords = await generateSeedKeywords(landingData, intentResult);

      setCampaignData(prev => ({
        ...prev,
        intent: intentResult,
        vertical,
        cta,
        landingPageData: landingData, // Store landing page data
        seedKeywords,
      }));

      // Auto-select best campaign structures
      const rankings = rankCampaignStructures(intentResult, vertical);
      setCampaignData(prev => ({
        ...prev,
        structureRankings: rankings,
        selectedStructure: rankings[0]?.id || 'stag',
      }));

      notifications.success('URL analyzed successfully', {
        title: 'Analysis Complete',
        description: `Detected: ${intentResult.intentLabel} intent, ${vertical} vertical`
      });

      setCurrentStep(2);
    } catch (error) {
      console.error('URL analysis error:', error);
      notifications.error('Failed to analyze URL', {
        title: 'Analysis Error',
        description: 'Please check the URL and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Campaign Structure Selection
  const handleStructureSelect = (structureId: string) => {
    setCampaignData(prev => ({ ...prev, selectedStructure: structureId }));
  };

  const handleNextFromStructure = () => {
    if (!campaignData.selectedStructure) {
      notifications.error('Please select a campaign structure', { title: 'Structure Required' });
      return;
    }
    setCurrentStep(3);
  };

  // Step 3: Keywords Generation
  const handleGenerateKeywords = async () => {
    if (campaignData.seedKeywords.length === 0) {
      notifications.error('Please provide seed keywords', { title: 'Seed Keywords Required' });
      return;
    }

    setLoading(true);
    try {
      // Try Python API endpoint first
      let generated: any[] = [];
      let useFallback = false;

      try {
        // Pass comprehensive context to API for better keyword generation
        const response = await api.post('/generate-keywords', {
          seeds: campaignData.seedKeywords,
          negatives: campaignData.negativeKeywords,
          vertical: campaignData.vertical || 'default',
          intent: campaignData.intent?.intentId || 'LEAD',
          cta: campaignData.cta || '',
          landingPageTitle: campaignData.landingPageData?.title || '',
          landingPageH1: campaignData.landingPageData?.h1 || '',
          services: campaignData.landingPageData?.services || [],
          campaignStructure: campaignData.selectedStructure || 'stag',
        });

        if (response && response.keywords && Array.isArray(response.keywords) && response.keywords.length > 0) {
          // Transform API response to our format
          generated = response.keywords
            .map((k: any, index: number) => {
              const keywordText = (k.text || k.keyword || k).toString().trim();
              return {
                id: `kw-${Date.now()}-${index}`,
                text: keywordText,
                keyword: keywordText,
                matchType: k.matchType || 'broad',
                volume: k.volume || 'Medium',
                cpc: k.cpc || '$2.50',
                type: k.type || 'Generated',
              };
            })
            .filter((kw: any) => kw.text && kw.text.length >= 3 && kw.text.length <= 50);
        } else {
          useFallback = true;
        }
      } catch (apiError: any) {
        // Check if it's an expected 404 (backend not deployed) - silently fallback
        const isExpectedError = 
          apiError?.name === 'NotFoundError' ||
          apiError?.message?.includes('404') ||
          apiError?.message?.includes('Request failed') ||
          apiError?.message?.includes('Network error');
        
        if (isExpectedError) {
          // Silently use fallback - don't log as error
          useFallback = true;
        } else {
          // Only log unexpected errors
          console.error('Unexpected API error:', apiError);
          useFallback = true;
        }
      }

      // Fallback to local keyword generation
      if (useFallback || generated.length === 0) {
        console.log('Using local keyword generation fallback');
        
        // Extract additional seed terms from landing page data
        let enhancedSeeds = [...campaignData.seedKeywords];
        if (campaignData.landingPageData) {
          const landing = campaignData.landingPageData;
          // Add services as seed keywords
          if (landing.services && landing.services.length > 0) {
            landing.services.slice(0, 5).forEach(service => {
              if (!enhancedSeeds.some(s => s.toLowerCase().includes(service.toLowerCase()))) {
                enhancedSeeds.push(service);
              }
            });
          }
          // Add title/h1 words as seeds
          const titleWords = (landing.title || '').split(/\s+/).filter(w => w.length > 3);
          const h1Words = (landing.h1 || '').split(/\s+/).filter(w => w.length > 3);
          [...titleWords, ...h1Words].slice(0, 5).forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanWord.length > 3 && !enhancedSeeds.some(s => s.toLowerCase().includes(cleanWord))) {
              enhancedSeeds.push(cleanWord);
            }
          });
        }
        
        // Use CTA to enhance keyword generation
        let ctaModifiers: string[] = [];
        if (campaignData.cta) {
          const ctaLower = campaignData.cta.toLowerCase();
          if (ctaLower.includes('call')) {
            ctaModifiers.push('call', 'phone', 'contact', 'reach', 'speak with');
          }
          if (ctaLower.includes('quote') || ctaLower.includes('estimate')) {
            ctaModifiers.push('quote', 'estimate', 'pricing', 'get quote', 'free quote');
          }
          if (ctaLower.includes('book') || ctaLower.includes('schedule')) {
            ctaModifiers.push('book', 'schedule', 'appointment', 'reserve');
          }
        }
        
        const localKeywords = generateKeywordsUtil({
          seedKeywords: enhancedSeeds.join('\n'), // Use enhanced seeds
          negativeKeywords: campaignData.negativeKeywords.join('\n'),
          vertical: campaignData.vertical || 'default',
          intentResult: campaignData.intent,
          landingPageData: campaignData.landingPageData, // Pass landing page data
          maxKeywords: 710,
          minKeywords: 410,
        });

        generated = localKeywords.map((kw, index) => ({
          id: kw.id || `kw-${Date.now()}-${index}`,
          text: kw.text,
          keyword: kw.text,
          matchType: kw.matchType || 'broad',
          volume: kw.volume || 'Medium',
          cpc: kw.cpc || '$2.50',
          type: kw.type || 'Generated',
        }));
      }

      // Generate 410-710 keywords (random range as specified)
      const targetCount = Math.floor(Math.random() * 300) + 410;
      const finalKeywords = generated.slice(0, Math.min(generated.length, targetCount));

      // Filter out keywords that match negative keywords
      const negativeList = campaignData.negativeKeywords.map(n => n.trim().toLowerCase()).filter(Boolean);
      const filteredByNegatives = finalKeywords.filter((kw: any) => {
        const keywordText = (kw.text || kw.keyword || '').toLowerCase();
        return !negativeList.some(neg => keywordText.includes(neg));
      });

      // Apply match types based on selected keyword types
      const formattedKeywords: any[] = [];
      filteredByNegatives.forEach((kw: any) => {
        // Extract base text (remove match type formatting if present)
        let baseText = kw.text || kw.keyword || '';
        baseText = baseText.replace(/^["\[\]]|["\[\]]$/g, '').trim();
        
        // Skip if base text contains negative keywords
        const baseTextLower = baseText.toLowerCase();
        if (negativeList.some(neg => baseTextLower.includes(neg))) {
          return; // Skip this keyword
        }
        
        if (campaignData.keywordTypes.broad) {
          formattedKeywords.push({
            ...kw,
            id: `${kw.id}-broad`,
            text: baseText,
            keyword: baseText,
            matchType: 'broad',
          });
        }
        
        if (campaignData.keywordTypes.phrase) {
          formattedKeywords.push({
            ...kw,
            id: `${kw.id}-phrase`,
            text: `"${baseText}"`,
            keyword: `"${baseText}"`,
            matchType: 'phrase',
          });
        }
        
        if (campaignData.keywordTypes.exact) {
          formattedKeywords.push({
            ...kw,
            id: `${kw.id}-exact`,
            text: `[${baseText}]`,
            keyword: `[${baseText}]`,
            matchType: 'exact',
          });
        }
      });

      // Shuffle for variety
      const shuffled = [...formattedKeywords].sort(() => Math.random() - 0.5);

      // Generate ad groups based on campaign structure
      const adGroups = generateAdGroupsFromKeywords(shuffled, campaignData.selectedStructure || 'stag');

      setCampaignData(prev => ({
        ...prev,
        generatedKeywords: shuffled,
        selectedKeywords: shuffled, // Auto-select all by default
        adGroups: adGroups,
      }));
      
      // Auto-save draft
      await autoSaveDraft();

      notifications.success(`Generated ${shuffled.length} keywords`, {
        title: 'Keywords Generated',
        description: useFallback 
          ? `Generated ${shuffled.length} keywords using local generation`
          : `Successfully generated ${shuffled.length} keywords using AI`
      });
    } catch (error) {
      console.error('Keyword generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Fallback: Use seed keywords as manual keywords
      if (campaignData.seedKeywords.length > 0) {
        const seedKeywordsAsKeywords = createKeywordsFromSeeds(campaignData.seedKeywords);
        
        setCampaignData(prev => ({
          ...prev,
          generatedKeywords: seedKeywordsAsKeywords,
          selectedKeywords: seedKeywordsAsKeywords,
        }));

        notifications.warning('Using seed keywords as manual keywords', {
          title: 'Generation Failed',
          description: `Keyword generation failed. Using ${seedKeywordsAsKeywords.length} seed keywords instead. You can proceed to the next step.`
        });
      } else {
        notifications.error('Failed to generate keywords', {
          title: 'Generation Error',
          description: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create keywords from seed keywords
  const createKeywordsFromSeeds = (seeds: string[]): any[] => {
    const keywords: any[] = [];
    const timestamp = Date.now();

    seeds.forEach((seed, seedIndex) => {
      const baseText = seed.trim();
      if (!baseText || baseText.length < 3) return;

      // Apply match types based on selected keyword types
      if (campaignData.keywordTypes.broad) {
        keywords.push({
          id: `seed-${timestamp}-${seedIndex}-broad`,
          text: baseText,
          keyword: baseText,
          matchType: 'broad',
          volume: 'Medium',
          cpc: '$2.50',
          type: 'Seed Keyword',
        });
      }
      
      if (campaignData.keywordTypes.phrase) {
        keywords.push({
          id: `seed-${timestamp}-${seedIndex}-phrase`,
          text: `"${baseText}"`,
          keyword: `"${baseText}"`,
          matchType: 'phrase',
          volume: 'Medium',
          cpc: '$2.50',
          type: 'Seed Keyword',
        });
      }
      
      if (campaignData.keywordTypes.exact) {
        keywords.push({
          id: `seed-${timestamp}-${seedIndex}-exact`,
          text: `[${baseText}]`,
          keyword: `[${baseText}]`,
          matchType: 'exact',
          volume: 'Medium',
          cpc: '$2.50',
          type: 'Seed Keyword',
        });
      }
    });

    return keywords;
  };

  const handleKeywordTypeToggle = (type: string) => {
    setCampaignData(prev => ({
      ...prev,
      keywordTypes: {
        ...prev.keywordTypes,
        [type]: !prev.keywordTypes[type],
      }
    }));
  };

  // Filter keywords based on selected types and negative keywords
  const negativeList = campaignData.negativeKeywords.map(n => n.trim().toLowerCase()).filter(Boolean);
  const filteredKeywords = campaignData.generatedKeywords.filter(kw => {
    // Filter by match type
    if (kw.matchType === 'broad' && !campaignData.keywordTypes.broad) return false;
    if (kw.matchType === 'phrase' && !campaignData.keywordTypes.phrase) return false;
    if (kw.matchType === 'exact' && !campaignData.keywordTypes.exact) return false;
    if (kw.isNegative && !campaignData.keywordTypes.negative) return false;
    
    // Filter out keywords containing negative keywords
    const keywordText = (kw.text || kw.keyword || '').toLowerCase();
    if (negativeList.some(neg => keywordText.includes(neg))) return false;
    
    return true;
  });

  // Auto-fill functions for each step
  const handleAutoFillStep1 = () => {
    const randomUrl = generateURL();
    const randomName = generateCampaignName();
    setCampaignData(prev => ({
      ...prev,
      url: randomUrl,
      campaignName: randomName,
    }));
    notifications.success('Step 1 auto-filled', { title: 'Auto Fill Complete' });
  };

  const handleAutoFillStep2 = () => {
    const randomStructure = CAMPAIGN_STRUCTURES[Math.floor(Math.random() * CAMPAIGN_STRUCTURES.length)];
    setCampaignData(prev => ({
      ...prev,
      selectedStructure: randomStructure.id,
    }));
    notifications.success('Step 2 auto-filled', { title: 'Auto Fill Complete' });
  };

  const handleAutoFillStep3 = () => {
    const seedKeywords = generateSeedKeywords().split(', ').filter(k => k.trim());
    const negativeKeywords = generateNegativeKeywords().split('\n').filter(k => k.trim());
    setCampaignData(prev => ({
      ...prev,
      seedKeywords: seedKeywords,
      negativeKeywords: [...DEFAULT_NEGATIVE_KEYWORDS, ...negativeKeywords],
    }));
    notifications.success('Step 3 auto-filled', { title: 'Auto Fill Complete' });
  };

  const handleAutoFillStep5 = () => {
    const randomCountry = LOCATION_PRESETS.countries[Math.floor(Math.random() * LOCATION_PRESETS.countries.length)];
    const randomCities = LOCATION_PRESETS.cities.slice(0, Math.floor(Math.random() * 20) + 5);
    const randomZips = LOCATION_PRESETS.zipCodes.slice(0, Math.floor(Math.random() * 50) + 10);
    
    setCampaignData(prev => ({
      ...prev,
      targetCountry: randomCountry,
      locations: {
        ...prev.locations,
        cities: randomCities,
        zipCodes: randomZips,
      },
    }));
    notifications.success('Step 5 auto-filled', { title: 'Auto Fill Complete' });
  };

  // Auto-save draft functionality
  const autoSaveDraft = async () => {
    try {
      if (campaignData.campaignName || campaignData.url) {
        await historyService.save('campaign', campaignData.campaignName || 'Draft Campaign', {
          name: campaignData.campaignName || 'Draft Campaign',
          url: campaignData.url,
          structure: campaignData.selectedStructure || 'stag',
          keywords: campaignData.selectedKeywords,
          ads: campaignData.ads,
          locations: campaignData.locations,
          intent: campaignData.intent,
          vertical: campaignData.vertical,
          cta: campaignData.cta,
          negativeKeywords: campaignData.negativeKeywords,
          adGroups: campaignData.adGroups,
          createdAt: new Date().toISOString(),
        }, 'draft');
      }
    } catch (error) {
      // Only log unexpected errors - "Item not found" is now handled gracefully
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('Item not found') && !errorMessage.includes('not found')) {
        console.error('Auto-save failed:', error);
      }
      // Don't show error to user for auto-save failures
    }
  };

  // Generate ad groups based on campaign structure
  const generateAdGroupsFromKeywords = (keywords: any[], structureType: string): AdGroup[] => {
    const groups: AdGroup[] = [];
    
    if (structureType === 'skag') {
      // SKAG: One ad group per keyword (limit to 20)
      keywords.slice(0, 20).forEach((kw, idx) => {
        const baseText = (kw.text || kw.keyword || '').replace(/^["\[\]]|["\[\]]$/g, '').trim();
        groups.push({
          id: `ag-${idx + 1}`,
          name: baseText.substring(0, 50) || `Ad Group ${idx + 1}`,
          keywords: [baseText],
        });
      });
    } else if (structureType === 'stag') {
      // STAG: Group by theme (first word)
      const themeGroups: { [key: string]: string[] } = {};
      keywords.forEach(kw => {
        const baseText = (kw.text || kw.keyword || '').replace(/^["\[\]]|["\[\]]$/g, '').trim();
        const firstWord = baseText.split(' ')[0]?.toLowerCase() || 'general';
        if (!themeGroups[firstWord]) {
          themeGroups[firstWord] = [];
        }
        if (!themeGroups[firstWord].includes(baseText)) {
          themeGroups[firstWord].push(baseText);
        }
      });
      
      Object.entries(themeGroups).slice(0, 10).forEach(([theme, kwList], idx) => {
        groups.push({
          id: `ag-${idx + 1}`,
          name: `Ad Group ${idx + 1} - ${theme.charAt(0).toUpperCase() + theme.slice(1)}`,
          keywords: kwList.slice(0, 20),
        });
      });
    } else {
      // Default: Create 5-10 ad groups
      const groupSize = Math.ceil(keywords.length / 8);
      for (let i = 0; i < 8 && i * groupSize < keywords.length; i++) {
        const groupKeywords = keywords.slice(i * groupSize, (i + 1) * groupSize)
          .map(kw => (kw.text || kw.keyword || '').replace(/^["\[\]]|["\[\]]$/g, '').trim())
          .filter(Boolean);
        if (groupKeywords.length > 0) {
          groups.push({
            id: `ag-${i + 1}`,
            name: `Ad Group ${i + 1}`,
            keywords: groupKeywords,
          });
        }
      }
    }
    
    return groups;
  };

  // Step 4: Ads Generation - DEPRECATED: Use handleAddNewAd instead
  // This function is kept for backward compatibility but should not be used
  // Ads should be created one at a time using handleAddNewAd
  const handleGenerateAds = async () => {
    notifications.warning('Please use the ad type buttons to create ads individually', {
      title: 'Manual Ad Creation',
      description: 'Click on RESP. SEARCH AD, DKI TEXT AD, or CALL ONLY AD buttons to create ads (maximum 3 ads allowed).'
    });
  };

  // Add a single ad of specified type (only if under 3 ads total)
  const handleAddNewAd = async (adType: 'rsa' | 'dki' | 'call') => {
    // Check if we already have 3 ads
    if (campaignData.ads.length >= 3) {
      notifications.warning('Maximum 3 ads allowed per ad group', {
        title: 'Limit Reached',
        description: 'You can only have 3 ads. Please delete an existing ad to add a new one.'
      });
      return;
    }

    // Check if this ad type already exists
    const existingAdType = campaignData.ads.find(ad => 
      (ad.type === adType) || 
      (adType === 'rsa' && ad.adType === 'RSA') ||
      (adType === 'dki' && ad.adType === 'DKI') ||
      (adType === 'call' && (ad.adType === 'CallOnly' || ad.type === 'call'))
    );

    if (existingAdType) {
      notifications.info(`A ${adType.toUpperCase()} ad already exists. Maximum 3 ads allowed.`, {
        title: 'Ad Type Exists'
      });
      return;
    }

    if (campaignData.selectedKeywords.length === 0) {
      notifications.error('Please select keywords first', { title: 'Keywords Required' });
      return;
    }

    setLoading(true);
    try {
      const keywordTexts = campaignData.selectedKeywords.map(k => k.text || k.keyword || k).slice(0, 10);
      
      const adInput: AdGenerationInput = {
        keywords: keywordTexts,
        baseUrl: campaignData.url,
        adType: adType === 'rsa' ? 'RSA' : adType === 'dki' ? 'ETA' : 'CALL_ONLY',
        industry: campaignData.vertical || 'general',
        businessName: 'Your Business',
        filters: {
          matchType: campaignData.keywordTypes.phrase ? 'phrase' : campaignData.keywordTypes.exact ? 'exact' : 'broad',
          campaignStructure: (campaignData.selectedStructure?.toUpperCase() || 'STAG') as 'SKAG' | 'STAG' | 'IBAG' | 'Alpha-Beta',
          uniqueSellingPoints: [],
          callToAction: campaignData.cta || undefined,
        },
      };

      const ad = generateAdsUtility(adInput);
      
      // Convert to our ad format
      let newAd: any = null;
      
      if (adType === 'rsa' && 'headlines' in ad) {
        const rsa = ad as ResponsiveSearchAd;
        newAd = {
          id: `ad-${Date.now()}-${Math.random()}`,
          type: 'rsa',
          adType: 'RSA',
          headlines: rsa.headlines || [],
          descriptions: rsa.descriptions || [],
          displayPath: rsa.displayPath || [],
          finalUrl: rsa.finalUrl || campaignData.url,
          selected: false,
          extensions: [],
        };
      } else if (adType === 'dki' && 'headline1' in ad) {
        const dki = ad as ExpandedTextAd;
        newAd = {
          id: `ad-${Date.now()}-${Math.random()}`,
          type: 'dki',
          adType: 'DKI',
          headline1: dki.headline1 || '',
          headline2: dki.headline2 || '',
          headline3: dki.headline3 || '',
          description1: dki.description1 || '',
          description2: dki.description2 || '',
          displayPath: dki.displayPath || [],
          finalUrl: dki.finalUrl || campaignData.url,
          selected: false,
          extensions: [],
        };
      } else if (adType === 'call' && 'phoneNumber' in ad) {
        const call = ad as CallOnlyAd;
        newAd = {
          id: `ad-${Date.now()}-${Math.random()}`,
          type: 'call',
          adType: 'CallOnly',
          headline1: call.headline1 || '',
          headline2: call.headline2 || '',
          description1: call.description1 || '',
          description2: call.description2 || '',
          phoneNumber: call.phoneNumber || '',
          businessName: call.businessName || '',
          finalUrl: call.verificationUrl || campaignData.url,
          selected: false,
          extensions: [],
        };
      }

      if (newAd) {
        // Ensure we don't exceed 3 ads limit
        setCampaignData(prev => {
          const currentAds = prev.ads.length >= 3 ? prev.ads.slice(0, 2) : prev.ads;
          return {
            ...prev,
            ads: [...currentAds, newAd].slice(0, 3), // Hard limit to 3 ads
          };
        });

        const finalAdCount = Math.min(campaignData.ads.length + 1, 3);
        notifications.success(`${adType.toUpperCase()} ad added successfully`, {
          title: 'Ad Added',
          description: `${finalAdCount} / 3 ads created`
        });
        
        // Auto-save draft
        await autoSaveDraft();
      } else {
        throw new Error(`Failed to generate ${adType} ad`);
      }
    } catch (error) {
      console.error(`Error generating ${adType} ad:`, error);
      notifications.error(`Failed to generate ${adType.toUpperCase()} ad`, {
        title: 'Generation Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAd = (adId: string) => {
    const ad = campaignData.ads.find(a => a.id === adId);
    if (!ad) {
      notifications.error('Ad not found', { title: 'Error' });
      return;
    }

    // For now, open a simple edit dialog using prompt/confirm
    // In the future, this can be replaced with a proper modal component
    if (ad.type === 'rsa' || ad.adType === 'RSA') {
      const newHeadline = prompt('Edit first headline:', ad.headlines?.[0] || '');
      if (newHeadline !== null && newHeadline.trim()) {
        setCampaignData(prev => ({
          ...prev,
          ads: prev.ads.map(a => 
            a.id === adId 
              ? { ...a, headlines: [newHeadline.trim(), ...(a.headlines?.slice(1) || [])] }
              : a
          ),
        }));
        notifications.success('Ad updated', { title: 'Updated' });
      }
    } else if (ad.type === 'dki' || ad.adType === 'DKI') {
      const newHeadline = prompt('Edit headline 1:', ad.headline1 || '');
      if (newHeadline !== null && newHeadline.trim()) {
        setCampaignData(prev => ({
          ...prev,
          ads: prev.ads.map(a => 
            a.id === adId 
              ? { ...a, headline1: newHeadline.trim() }
              : a
          ),
        }));
        notifications.success('Ad updated', { title: 'Updated' });
      }
    } else if (ad.type === 'call' || ad.adType === 'CallOnly') {
      const newHeadline = prompt('Edit headline 1:', ad.headline1 || '');
      if (newHeadline !== null && newHeadline.trim()) {
        setCampaignData(prev => ({
          ...prev,
          ads: prev.ads.map(a => 
            a.id === adId 
              ? { ...a, headline1: newHeadline.trim() }
              : a
          ),
        }));
        notifications.success('Ad updated', { title: 'Updated' });
      }
    }
  };

  const handleDuplicateAd = React.useCallback((adId: string) => {
    if (campaignData.ads.length >= 3) {
      notifications.warning('Maximum 3 ads allowed. Please delete an ad first to duplicate.', {
        title: 'Limit Reached'
      });
      return;
    }

    const ad = campaignData.ads.find(a => a.id === adId);
    if (!ad) {
      notifications.error('Ad not found', { title: 'Error' });
      return;
    }

    const duplicatedAd = {
      ...ad,
      id: `ad-${Date.now()}-${Math.random()}`,
    };

    setCampaignData(prev => ({
      ...prev,
      ads: [...prev.ads, duplicatedAd].slice(0, 3), // Ensure max 3
    }));

    notifications.success('Ad duplicated', { title: 'Duplicated' });
  }, [campaignData.ads]);

  const handleDeleteAd = (adId: string) => {
    setCampaignData(prev => ({
      ...prev,
      ads: prev.ads.filter(ad => ad.id !== adId).slice(0, 3), // Ensure max 3 after deletion
    }));
    notifications.success('Ad deleted', { title: 'Deleted' });
  };

  const handleToggleAdSelection = (adId: string) => {
    setCampaignData(prev => ({
      ...prev,
      ads: prev.ads.map(ad => 
        ad.id === adId ? { ...ad, selected: !ad.selected } : ad
      ),
    }));
  };

  const handleAddExtension = (adId: string, extensionType: string) => {
    // Get extension label from extensionTypes
    const extensionTypeInfo = extensionTypes.find(ext => ext.id === extensionType);
    const extensionLabel = extensionTypeInfo?.label || extensionType;

    // Create extension with proper format based on type
    const createExtension = (type: string, label: string) => {
      const baseExt = {
        id: `ext-${Date.now()}-${Math.random()}`,
        type: type,
        extensionType: type,
        text: label,
        label: label,
      };

      if (type === 'sitelink') {
        return {
          ...baseExt,
          links: [{ text: label, url: campaignData.url, description: '' }],
        };
      } else if (type === 'callout') {
        return {
          ...baseExt,
          callouts: [label],
          values: [label],
        };
      } else if (type === 'snippet') {
        return {
          ...baseExt,
          header: 'Services',
          values: [label],
        };
      } else if (type === 'call') {
        return {
          ...baseExt,
          phone: '',
          phoneNumber: '',
          countryCode: 'US',
        };
      }
      return baseExt;
    };

    setCampaignData(prev => {
      const updated = {
        ...prev,
        ads: prev.ads.map(ad => {
          if (ad.id === adId) {
            const newExtension = createExtension(extensionType, extensionLabel);
            return {
              ...ad,
              extensions: [...(ad.extensions || []), newExtension],
            };
          }
          return ad;
        }),
      };
      
      // Auto-save after adding extension
      setTimeout(() => autoSaveDraft(), 100);
      
      return updated;
    });
    
    notifications.success(`${extensionLabel} added`, { title: 'Extension Added' });
  };

  const handleAddExtensionToAllAds = (extensionType: string) => {
    if (campaignData.ads.length === 0) {
      notifications.warning('Please create ads first before adding extensions', {
        title: 'No Ads'
      });
      return;
    }

    // Get extension label from extensionTypes
    const extensionTypeInfo = extensionTypes.find(ext => ext.id === extensionType);
    const extensionLabel = extensionTypeInfo?.label || extensionType;

    // Create extension with proper format based on type
    const createExtension = (type: string, label: string) => {
      const baseExt = {
        id: `ext-${Date.now()}-${Math.random()}`,
        type: type,
        extensionType: type, // Also set extensionType for CSV compatibility
        text: label,
        label: label,
      };

      // Format based on extension type
      if (type === 'sitelink') {
        return {
          ...baseExt,
          links: [{ text: label, url: campaignData.url, description: '' }],
        };
      } else if (type === 'callout') {
        return {
          ...baseExt,
          callouts: [label],
          values: [label],
        };
      } else if (type === 'snippet') {
        return {
          ...baseExt,
          header: 'Services',
          values: [label],
        };
      } else if (type === 'call') {
        return {
          ...baseExt,
          phone: '',
          phoneNumber: '',
          countryCode: 'US',
        };
      }
      return baseExt;
    };

    setCampaignData(prev => {
      const updatedAds = prev.ads.map(ad => {
        const newExtension = createExtension(extensionType, extensionLabel);
        return {
          ...ad,
          extensions: [...(ad.extensions || []), newExtension],
        };
      });
      
      const updated = {
        ...prev,
        ads: updatedAds,
      };
      
      // Auto-save after adding extensions
      setTimeout(() => autoSaveDraft(), 100);
      
      notifications.success(`${extensionLabel} added to all ${prev.ads.length} ad(s)`, {
        title: 'Extensions Added'
      });
      
      return updated;
    });
  };

  const handleRemoveExtension = (adId: string, extensionId: string) => {
    setCampaignData(prev => ({
      ...prev,
      ads: prev.ads.map(ad => {
        if (ad.id === adId) {
          return {
            ...ad,
            extensions: (ad.extensions || []).filter(ext => ext.id !== extensionId),
          };
        }
        return ad;
      }),
    }));
    notifications.success('Extension removed', { title: 'Removed' });
  };


  // Helper function to convert ads to CSV-compatible format
  const convertAdsForCSV = (ads: any[]): any[] => {
    return ads.map(ad => {
      // If RSA ad with headlines array, convert to headline1, headline2, headline3 format
      if ((ad.type === 'rsa' || ad.adType === 'RSA') && ad.headlines && Array.isArray(ad.headlines)) {
        // Ensure at least 3 headlines and 2 descriptions
        const headlines = ad.headlines.length >= 3 ? ad.headlines : [
          ...ad.headlines,
          ...Array(3 - ad.headlines.length).fill('Professional Service')
        ];
        const descriptions = (ad.descriptions || []).length >= 2 ? ad.descriptions : [
          ...(ad.descriptions || []),
          ...Array(2 - (ad.descriptions?.length || 0)).fill('Get professional service you can trust.')
        ];
        
        return {
          ...ad,
          type: 'rsa',
          headline1: headlines[0] || 'Professional Service',
          headline2: headlines[1] || 'Expert Solutions',
          headline3: headlines[2] || 'Quality Guaranteed',
          headline4: headlines[3] || '',
          headline5: headlines[4] || '',
          headline6: headlines[5] || '',
          headline7: headlines[6] || '',
          headline8: headlines[7] || '',
          headline9: headlines[8] || '',
          headline10: headlines[9] || '',
          headline11: headlines[10] || '',
          headline12: headlines[11] || '',
          headline13: headlines[12] || '',
          headline14: headlines[13] || '',
          headline15: headlines[14] || '',
          description1: descriptions[0] || 'Get professional service you can trust.',
          description2: descriptions[1] || 'Contact us today for expert assistance.',
          description3: descriptions[2] || '',
          description4: descriptions[3] || '',
          path1: ad.displayPath?.[0] || '',
          path2: ad.displayPath?.[1] || '',
          final_url: ad.finalUrl || campaignData.url,
          extensions: convertExtensionsForCSV(ad.extensions || []),
        };
      }
      // DKI ads - ensure they have required fields
      if ((ad.type === 'dki' || ad.adType === 'DKI')) {
        return {
          ...ad,
          type: 'dki',
          headline1: ad.headline1 || 'Professional Service',
          headline2: ad.headline2 || 'Expert Solutions',
          headline3: ad.headline3 || 'Quality Guaranteed',
          description1: ad.description1 || 'Get professional service you can trust.',
          description2: ad.description2 || 'Contact us today for expert assistance.',
          final_url: ad.finalUrl || ad.final_url || campaignData.url,
          extensions: convertExtensionsForCSV(ad.extensions || []),
        };
      }
      // Call ads - ensure they have required fields
      if ((ad.type === 'call' || ad.adType === 'CallOnly')) {
        return {
          ...ad,
          type: 'callonly',
          headline1: ad.headline1 || 'Call Now',
          headline2: ad.headline2 || '24/7 Service',
          description1: ad.description1 || 'Get professional service you can trust.',
          description2: ad.description2 || 'Contact us today for expert assistance.',
          phoneNumber: ad.phoneNumber || '',
          final_url: ad.finalUrl || ad.final_url || campaignData.url,
          extensions: convertExtensionsForCSV(ad.extensions || []),
        };
      }
      // Fallback - ensure extensions are included
      return {
        ...ad,
        final_url: ad.finalUrl || ad.final_url || campaignData.url,
        extensions: convertExtensionsForCSV(ad.extensions || []),
      };
    });
  };

  // Helper function to convert extensions to CSV-compatible format
  const convertExtensionsForCSV = (extensions: any[]): any[] => {
    return extensions.map(ext => {
      // Convert our extension format to CSV generator expected format
      const baseExt = {
        ...ext,
        extensionType: ext.type, // CSV generator expects extensionType
      };

      // Format extensions based on type
      if (ext.type === 'sitelink') {
        return {
          ...baseExt,
          links: ext.links || [{ text: ext.text || ext.label || 'Learn More', url: campaignData.url }],
        };
      } else if (ext.type === 'callout') {
        return {
          ...baseExt,
          callouts: ext.callouts || [ext.text || ext.label || 'Professional Service'],
        };
      } else if (ext.type === 'snippet') {
        return {
          ...baseExt,
          header: ext.header || ext.label || 'Services',
          values: ext.values || [ext.text || 'Expert Solutions'],
        };
      } else if (ext.type === 'call') {
        return {
          ...baseExt,
          phone: ext.phone || ext.phoneNumber || '',
          phoneNumber: ext.phone || ext.phoneNumber || '',
          countryCode: ext.countryCode || 'US',
        };
      }
      return baseExt;
    });
  };

  // Step 6: CSV Generation & Validation
  const handleGenerateCSV = async () => {
    setLoading(true);
    try {
      // Convert ads to CSV-compatible format
      const convertedAds = convertAdsForCSV(campaignData.ads);
      
      const structure = generateCampaignStructure(
        campaignData.selectedKeywords.map(k => k.text || k.keyword || k),
        {
          structureType: campaignData.selectedStructure || 'stag',
          campaignName: campaignData.campaignName,
          keywords: campaignData.selectedKeywords.map(k => k.text || k.keyword || k),
          matchTypes: {
            broad: campaignData.keywordTypes.broad,
            phrase: campaignData.keywordTypes.phrase,
            exact: campaignData.keywordTypes.exact,
          },
          url: campaignData.url,
          ads: convertedAds, // Use converted ads
          negativeKeywords: campaignData.negativeKeywords, // Include negative keywords in structure
          selectedStates: campaignData.locations.states, // Include states
          selectedCities: campaignData.locations.cities, // Include cities
          selectedZips: campaignData.locations.zipCodes, // Include zip codes
          targetCountry: campaignData.targetCountry, // Include target country
        } as StructureSettings
      );

      const validation = validateCSVBeforeExport(structure);
      
      if (validation.isValid) {
        // Generate CSV content as string (not download)
        const csvData = generateCSVV3(structure);
        setCampaignData(prev => ({
          ...prev,
          csvData,
          csvErrors: [],
        }));
        notifications.success('CSV generated successfully', {
          title: 'CSV Ready'
        });
      } else {
        setCampaignData(prev => ({
          ...prev,
          csvErrors: validation.errors || [],
        }));
        notifications.warning('CSV has validation errors', {
          title: 'Validation Issues',
          description: 'Please review and fix errors before exporting'
        });
      }
    } catch (error) {
      console.error('CSV generation error:', error);
      notifications.error('Failed to generate CSV', {
        title: 'Generation Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCampaign = async () => {
    setLoading(true);
    try {
      // Generate CSV first
      await handleGenerateCSV();
      
      if (campaignData.csvErrors.length > 0) {
        notifications.warning('Please fix CSV errors before saving', {
          title: 'Validation Required',
          description: 'There are errors in the CSV that need to be fixed.'
        });
        setLoading(false);
        return;
      }

      await historyService.save('campaign', campaignData.campaignName, {
        name: campaignData.campaignName,
        url: campaignData.url,
        structure: campaignData.selectedStructure || 'stag',
        keywords: campaignData.selectedKeywords,
        ads: campaignData.ads,
        locations: campaignData.locations,
        intent: campaignData.intent,
        vertical: campaignData.vertical,
        cta: campaignData.cta,
        negativeKeywords: campaignData.negativeKeywords,
        adGroups: campaignData.adGroups,
        csvData: campaignData.csvData,
        createdAt: new Date().toISOString(),
      }, 'completed');

      setCampaignSaved(true);
      setCurrentStep(8); // Show success screen
    } catch (error) {
      console.error('Save error:', error);
      notifications.error('Failed to save campaign', {
        title: 'Save Error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Progress bar steps
  const steps = [
    { id: 1, label: 'URL Input' },
    { id: 2, label: 'Structure' },
    { id: 3, label: 'Keywords' },
    { id: 4, label: 'Ads & Extensions' },
    { id: 5, label: 'Geo Target' },
    { id: 6, label: 'Review' },
    { id: 7, label: 'CSV & Validate' },
  ];

  // Render functions for each step
  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Enter Your Website URL</h2>
        <p className="text-slate-600">AI will analyze your website to identify intent, CTA, and vertical</p>
        </div>
        <AutoFillButton onAutoFill={handleAutoFillStep1} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Website URL</CardTitle>
          <CardDescription>Enter the landing page URL for your campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="url"
              placeholder="https://www.example.com"
              value={campaignData.url}
              onChange={(e) => setCampaignData(prev => ({ ...prev, url: e.target.value }))}
              className="flex-1"
            />
            <Button onClick={handleUrlSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {campaignData.intent && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Intent</Label>
              <p className="text-slate-600">{campaignData.intent.intentLabel}</p>
            </div>
            {campaignData.vertical && (
              <div>
                <Label className="text-sm font-semibold">Vertical</Label>
                <p className="text-slate-600">{campaignData.vertical}</p>
              </div>
            )}
            {campaignData.cta && (
              <div>
                <Label className="text-sm font-semibold">CTA</Label>
                <p className="text-slate-600">{campaignData.cta}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-semibold">Campaign Name</Label>
              <Input
                value={campaignData.campaignName}
                onChange={(e) => setCampaignData(prev => ({ ...prev, campaignName: e.target.value }))}
                placeholder="Search-date-time"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Select Campaign Structure</h2>
        <p className="text-slate-600">AI has ranked the best structures for your vertical. Choose the one that fits your needs.</p>
        </div>
        <AutoFillButton onAutoFill={handleAutoFillStep2} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {CAMPAIGN_STRUCTURES.map((structure, idx) => {
          const ranking = campaignData.structureRankings.findIndex(r => r.id === structure.id);
          const isRecommended = ranking === 0 || ranking === 1 || ranking === 2;
          const rankLabel = ranking === 0 ? 'Best' : ranking === 1 ? '2nd Best' : ranking === 2 ? '3rd Best' : null;
          const isSelected = campaignData.selectedStructure === structure.id;
          const Icon = structure.icon;

          return (
            <Card
              key={structure.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-indigo-500 bg-indigo-50'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleStructureSelect(structure.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-indigo-600" />
                    <CardTitle className="text-lg">{structure.name}</CardTitle>
                  </div>
                  {isRecommended && rankLabel && (
                    <Badge variant={ranking === 0 ? 'default' : 'secondary'}>
                      {rankLabel}
                    </Badge>
                  )}
                </div>
                <CardDescription>{structure.description}</CardDescription>
              </CardHeader>
              {isSelected && (
                <CardContent>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Keywords Planner</h2>
        <p className="text-slate-600">Generate 410-710 keywords based on your seed keywords and campaign structure</p>
        </div>
        <AutoFillButton onAutoFill={handleAutoFillStep3} />
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seed Keywords</CardTitle>
              <CardDescription>AI-suggested seed keywords based on your URL</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {campaignData.seedKeywords.map((kw, idx) => (
                  <Badge key={idx} variant="secondary">{kw}</Badge>
                ))}
              </div>
              <Textarea
                placeholder="Enter additional seed keywords (one per line)"
                value={campaignData.seedKeywords.join('\n')}
                onChange={(e) => setCampaignData(prev => ({
                  ...prev,
                  seedKeywords: e.target.value.split('\n').filter(k => k.trim())
                }))}
                rows={4}
                className="mb-4"
              />
              <Button onClick={handleGenerateKeywords} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Keywords
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Negative Keywords</CardTitle>
              <CardDescription>These keywords will be excluded from generated keywords. You can add or update them.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <Input
                  placeholder="Enter negative keywords (comma-separated, e.g., cheap, discount, cost)"
                  value={campaignData.negativeKeywords.filter(n => !DEFAULT_NEGATIVE_KEYWORDS.includes(n)).join(', ')}
                  onChange={(e) => {
                    const userNegatives = e.target.value.split(',').map(n => n.trim()).filter(n => n.length > 0);
                    // Ensure default negative keywords are always included
                    const combined = [...DEFAULT_NEGATIVE_KEYWORDS, ...userNegatives];
                    setCampaignData(prev => ({
                      ...prev,
                      negativeKeywords: combined
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const userNegatives = input.value.split(',').map(n => n.trim()).filter(n => n.length > 0);
                      const combined = [...DEFAULT_NEGATIVE_KEYWORDS, ...userNegatives];
                      setCampaignData(prev => ({
                        ...prev,
                        negativeKeywords: combined
                      }));
                      input.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {campaignData.negativeKeywords.map((neg, idx) => {
                  const isDefault = DEFAULT_NEGATIVE_KEYWORDS.includes(neg);
                  return (
                    <Badge 
                      key={idx} 
                      variant="destructive"
                      className={isDefault ? "cursor-not-allowed opacity-90" : "cursor-pointer hover:opacity-80"}
                      onClick={() => {
                        // Only allow removal of non-default keywords
                        if (!isDefault) {
                          const updated = campaignData.negativeKeywords.filter((_, i) => i !== idx);
                          setCampaignData(prev => ({
                            ...prev,
                            negativeKeywords: updated
                          }));
                        }
                      }}
                    >
                      {neg}
                      {!isDefault && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Default negative keywords (highlighted in red) are always kept. You can add more or remove custom ones. These {campaignData.negativeKeywords.length} negative keywords will always be excluded when generating keywords.
              </p>
            </CardContent>
          </Card>

          {campaignData.generatedKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Keyword Type Filters</CardTitle>
                <CardDescription>Toggle keyword types to filter the list</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {KEYWORD_TYPES.map(type => (
                    <div key={type.id} className="flex items-center gap-2">
                      <Checkbox
                        id={type.id}
                        checked={campaignData.keywordTypes[type.id] || false}
                        onCheckedChange={() => handleKeywordTypeToggle(type.id)}
                      />
                      <Label htmlFor={type.id}>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Generated Keywords */}
        <div>
          {campaignData.generatedKeywords.length > 0 ? (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Generated Keywords ({filteredKeywords.length})</CardTitle>
                <CardDescription>Keywords organized by campaign structure: {campaignData.selectedStructure?.toUpperCase() || 'STAG'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-4">
                    {filteredKeywords.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <p>No keywords match your filters.</p>
                        <p className="text-xs mt-2">Try adjusting keyword type filters or negative keywords.</p>
                      </div>
                    ) : (
                      filteredKeywords.map((kw, idx) => (
                        <div key={kw.id || idx} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50 transition-colors">
                          <span className="text-sm flex-1">{kw.text || kw.keyword || kw}</span>
                          {kw.matchType && (
                            <Badge variant="outline" className="ml-2">{kw.matchType}</Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center">
                <Hash className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No keywords generated yet</p>
                <p className="text-xs text-slate-400">Enter seed keywords and click "Generate Keywords" to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const allAdGroups = ['ALL_AD_GROUPS', ...campaignData.adGroups.map(ag => ag.name)];
    // Limit display to maximum 3 ads
    const displayAds = campaignData.ads.length > 0 ? campaignData.ads.slice(0, 3) : [];

    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-end">
          <AutoFillButton onAutoFill={() => {
            if (campaignData.selectedKeywords.length === 0) {
              handleAutoFillStep3();
            }
            // Ads are now created manually by clicking ad type buttons
          }} />
              </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Ad Group Selector */}
            <Card>
              <CardContent className="p-4">
                <Select 
                  value={campaignData.selectedAdGroup || 'ALL_AD_GROUPS'} 
                  onValueChange={(value) => setCampaignData(prev => ({ ...prev, selectedAdGroup: value }))}
                >
                  <SelectTrigger className="w-full bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allAdGroups.map(group => (
                      <SelectItem key={group} value={group}>
                        {group === 'ALL_AD_GROUPS' ? 'ALL AD GROUPS' : group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Info Text */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-600">
                  You can preview different ad groups, however changing ads here will change all ad groups. 
                  In the next section you can edit ads individually for each ad group.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <span>Total Ads:</span>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-xs text-slate-400">Generating...</span>
                    </div>
                  ) : (
                    <span className="font-semibold">{Math.min(displayAds.length, 3)} / 3</span>
                  )}
          </div>
        </CardContent>
      </Card>

            {/* Ad Type Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleAddNewAd('rsa')}
                disabled={loading || campaignData.ads.length >= 3 || campaignData.ads.some(ad => ad.type === 'rsa' || ad.adType === 'RSA')}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 w-5 h-5" /> RESP. SEARCH AD
                  </>
                )}
              </Button>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleAddNewAd('dki')}
                disabled={loading || campaignData.ads.length >= 3 || campaignData.ads.some(ad => ad.type === 'dki' || ad.adType === 'DKI')}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 w-5 h-5" /> DKI TEXT AD
                  </>
                )}
              </Button>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleAddNewAd('call')}
                disabled={loading || campaignData.ads.length >= 3 || campaignData.ads.some(ad => ad.type === 'call' || ad.adType === 'CallOnly')}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 w-5 h-5" /> CALL ONLY AD
                  </>
                )}
              </Button>
            </div>

            {/* Extensions Section */}
        <Card>
          <CardHeader>
                <CardTitle className="text-sm">EXTENSIONS</CardTitle>
          </CardHeader>
              <CardContent className="space-y-2">
                {extensionTypes.map(ext => {
                  const Icon = ext.icon;
                  return (
                    <Button
                      key={ext.id}
                      variant="outline"
                      className="w-full justify-start border-purple-200 hover:bg-purple-50"
                      onClick={() => handleAddExtensionToAllAds(ext.id)}
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      <Icon className="mr-2 w-4 h-4" />
                      {ext.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
                        </div>

          {/* Right Content - Ads Display */}
          <div className="lg:col-span-3 space-y-4 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-sm font-medium text-slate-700">Generating ad...</p>
                  <p className="text-xs text-slate-500">Please wait</p>
                </div>
              </div>
            )}
            {displayAds.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Ads Created Yet</h3>
                  <p className="text-slate-500 mb-4">Click on an ad type button on the left to create an ad (Maximum 3 ads allowed)</p>
                </CardContent>
              </Card>
            ) : (
              displayAds.map((ad) => (
                <Card key={ad.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="text-xs">
                        {ad.type?.toUpperCase() || ad.adType || 'RSA'}
                      </Badge>
                        <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditAd(ad.id)} className="text-green-600 hover:text-green-700">
                          <Edit3 className="w-4 h-4 mr-1" />
                          EDIT
                          </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDuplicateAd(ad.id)} className="text-purple-600 hover:text-purple-700">
                          <Copy className="w-4 h-4 mr-1" />
                          DUPLICATE
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAd(ad.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-1" />
                          DELETE
                          </Button>
                        </div>
                      </div>
                      
                      {/* RSA Ad Display */}
                      {ad.type === 'rsa' && ad.headlines && (
                      <div className="space-y-3">
                          <div>
                          <Label className="text-xs text-slate-500 mb-2 block">Headlines / Paths</Label>
                          <div className="flex flex-wrap gap-2">
                              {ad.headlines.slice(0, 5).map((h, i) => (
                              <span key={i} className="text-sm text-slate-700">{h}</span>
                              ))}
                            {ad.displayPath && ad.displayPath.length > 0 && (
                              <span className="text-sm text-slate-500">| {ad.displayPath.join(' | ')}</span>
                              )}
                            </div>
                          </div>
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Display URL</Label>
                          <p className="text-xs text-blue-600 break-all">{ad.finalUrl || campaignData.url}</p>
                          </div>
                          {ad.descriptions && ad.descriptions.length > 0 && (
                            <div>
                            <Label className="text-xs text-slate-500 mb-1 block">Descriptions</Label>
                            {ad.descriptions.slice(0, 2).map((desc, i) => (
                              <p key={i} className="text-sm text-slate-600 mb-1">{desc}</p>
                            ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* DKI Ad Display */}
                      {(ad.type === 'dki' || ad.adType === 'DKI') && (
                      <div className="space-y-3">
                          {ad.headline1 && <p className="font-semibold text-sm">{ad.headline1}</p>}
                          {ad.headline2 && <p className="font-semibold text-sm">{ad.headline2}</p>}
                        {ad.headline3 && <p className="font-semibold text-sm">{ad.headline3}</p>}
                          {ad.description1 && <p className="text-sm text-slate-600">{ad.description1}</p>}
                        {ad.description2 && <p className="text-sm text-slate-600">{ad.description2}</p>}
                          {ad.finalUrl && (
                            <p className="text-xs text-blue-600">{ad.finalUrl}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Call-Only Ad Display */}
                      {(ad.type === 'call' || ad.adType === 'CallOnly') && (
                      <div className="space-y-3">
                          {ad.headline1 && <p className="font-semibold text-sm">{ad.headline1}</p>}
                        {ad.headline2 && <p className="font-semibold text-sm">{ad.headline2}</p>}
                          {ad.phoneNumber && (
                            <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-green-600" />
                            <span className="text-lg font-medium">{ad.phoneNumber}</span>
                            </div>
                          )}
                          {ad.description1 && <p className="text-sm text-slate-600">{ad.description1}</p>}
                        {ad.description2 && <p className="text-sm text-slate-600">{ad.description2}</p>}
                        </div>
                      )}
                      
                    {/* Extensions Display */}
                        {ad.extensions && ad.extensions.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <Label className="text-xs text-slate-500 mb-2 block">Extensions</Label>
                        <div className="space-y-2">
                            {ad.extensions.map((ext: any) => (
                            <div key={ext.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const extTypeInfo = extensionTypes.find(e => e.id === ext.type);
                                  const Icon = extTypeInfo?.icon || FileText;
                                  return <Icon className="w-4 h-4 text-indigo-600" />;
                                })()}
                                <span className="text-sm text-slate-700">
                                  {ext.text || ext.label || extensionTypes.find(e => e.id === ext.type)?.label || ext.type}
                                </span>
                          </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveExtension(ad.id, ext.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                      </div>
                ))}
              </div>
                      </div>
                    )}
          </CardContent>
        </Card>
              ))
      )}
          </div>
        </div>
    </div>
  );
  };

  const renderStep5 = () => {
    const hasSpecificLocations = 
      campaignData.locations.cities.length > 0 || 
      campaignData.locations.zipCodes.length > 0 || 
      campaignData.locations.states.length > 0;

    const handleCityPreset = (count: number) => {
      const cities = LOCATION_PRESETS.cities.slice(0, count);
      setCampaignData(prev => ({
          ...prev,
          locations: {
            ...prev.locations,
          cities: [...new Set([...prev.locations.cities, ...cities])],
        },
      }));
      autoSaveDraft();
    };

    const handleZipPreset = (count: number) => {
      const zips = LOCATION_PRESETS.zipCodes.slice(0, count);
      setCampaignData(prev => ({
        ...prev,
        locations: {
          ...prev.locations,
          zipCodes: [...new Set([...prev.locations.zipCodes, ...zips])],
        },
      }));
      autoSaveDraft();
    };

    const handleStatePreset = (count: number) => {
      const states = LOCATION_PRESETS.states.slice(0, count);
      setCampaignData(prev => ({
        ...prev,
        locations: {
          ...prev.locations,
          states: [...new Set([...prev.locations.states, ...states])],
        },
      }));
      autoSaveDraft();
    };

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Geo Target</h2>
            <p className="text-slate-600">Select the specific locations where your ads will be shown.</p>
          </div>
          <AutoFillButton onAutoFill={handleAutoFillStep5} />
        </div>

        <div className="space-y-6">
          {/* Target Country */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <CardTitle>Target Country</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Select 
                value={campaignData.targetCountry} 
                onValueChange={(value) => {
                  setCampaignData(prev => ({ ...prev, targetCountry: value }));
                  autoSaveDraft();
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_PRESETS.countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Specific Locations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <CardTitle>Specific Locations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Show info message if no specific locations selected */}
              {!hasSpecificLocations && (
                <Card className="bg-green-50 border-green-200 mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800 mb-1 text-sm">Whole Country Targeting (Default)</h3>
                        <p className="text-xs text-green-700">
                          Currently targeting entire {campaignData.targetCountry}. Add specific cities, states, or ZIP codes below to narrow targeting.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Always show location input options */}
              <div className="space-y-6">
                {/* States Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">States/Provinces</Label>
                    <Badge variant="outline" className="text-xs">
                      {campaignData.locations.states.length} selected
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Button variant="outline" size="sm" onClick={() => handleStatePreset(10)} className="bg-white">
                      Top 10 States
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleStatePreset(20)} className="bg-white">
                      Top 20 States
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleStatePreset(30)} className="bg-white">
                      Top 30 States
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleStatePreset(LOCATION_PRESETS.states.length)} className="bg-white">
                      All States ({LOCATION_PRESETS.states.length})
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter states/provinces manually (comma-separated, e.g., California, Texas, New York, Florida)..."
                    value={campaignData.locations.states.join(', ')}
                    onChange={(e) => {
                      const states = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      setCampaignData(prev => ({
                        ...prev,
                        locations: { ...prev.locations, states }
                      }));
                      autoSaveDraft();
                    }}
                    rows={3}
                    className="mb-2"
                  />
                  {campaignData.locations.states.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {campaignData.locations.states.slice(0, 10).map((state, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {state}
                          <X 
                            className="w-3 h-3 ml-1 cursor-pointer" 
                            onClick={() => {
                              setCampaignData(prev => ({
                                ...prev,
                                locations: {
                                  ...prev.locations,
                                  states: prev.locations.states.filter((_, i) => i !== idx)
                                }
                              }));
                              autoSaveDraft();
                            }}
                          />
                        </Badge>
                      ))}
                      {campaignData.locations.states.length > 10 && (
                        <Badge variant="secondary" className="text-xs">
                          +{campaignData.locations.states.length - 10} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* City Presets */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Cities</Label>
                    <Badge variant="outline" className="text-xs">
                      {campaignData.locations.cities.length} selected
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Button variant="outline" size="sm" onClick={() => handleCityPreset(20)} className="bg-white">
                      Top 20 Cities
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCityPreset(50)} className="bg-white">
                      Top 50 Cities
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCityPreset(100)} className="bg-white">
                      Top 100 Cities
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCityPreset(200)} className="bg-white">
                      Top 200 Cities
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCityPreset(LOCATION_PRESETS.cities.length)} className="bg-white">
                      All Cities ({LOCATION_PRESETS.cities.length})
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter cities manually (comma-separated, e.g., New York, NY, Los Angeles, CA, Chicago, IL)..."
                    value={campaignData.locations.cities.join(', ')}
                    onChange={(e) => {
                      const cities = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                      setCampaignData(prev => ({
                        ...prev,
                        locations: { ...prev.locations, cities }
                      }));
                      autoSaveDraft();
                    }}
                    rows={3}
                    className="mb-2"
                  />
                  {campaignData.locations.cities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {campaignData.locations.cities.slice(0, 10).map((city, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {city}
                          <X 
                            className="w-3 h-3 ml-1 cursor-pointer" 
                            onClick={() => {
                              setCampaignData(prev => ({
                                ...prev,
                                locations: {
                                  ...prev.locations,
                                  cities: prev.locations.cities.filter((_, i) => i !== idx)
                                }
                              }));
                              autoSaveDraft();
                            }}
                          />
                        </Badge>
                      ))}
                      {campaignData.locations.cities.length > 10 && (
                        <Badge variant="secondary" className="text-xs">
                          +{campaignData.locations.cities.length - 10} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* ZIP Code Presets */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Zip Codes</Label>
                    <Badge variant="outline" className="text-xs">
                      {campaignData.locations.zipCodes.length} selected
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(5000)} className="bg-white">
                      5,000 ZIPs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(10000)} className="bg-white">
                      10,000 ZIPs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(15000)} className="bg-white">
                      15,000 ZIPs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(30000)} className="bg-white">
                      30,000 ZIPs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(LOCATION_PRESETS.zipCodes.length)} className="bg-white">
                      All ZIPs ({LOCATION_PRESETS.zipCodes.length.toLocaleString()})
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter ZIP codes manually (comma-separated, e.g., 10001, 10002, 90210)..."
                    value={campaignData.locations.zipCodes.join(', ')}
                    onChange={(e) => {
                      const zips = e.target.value.split(',').map(z => z.trim()).filter(z => z);
                      setCampaignData(prev => ({
                        ...prev,
                        locations: { ...prev.locations, zipCodes: zips }
                      }));
                      autoSaveDraft();
                    }}
                    rows={3}
                    className="mb-2"
                  />
                  {campaignData.locations.zipCodes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {campaignData.locations.zipCodes.slice(0, 10).map((zip, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {zip}
                          <X 
                            className="w-3 h-3 ml-1 cursor-pointer" 
                            onClick={() => {
                              setCampaignData(prev => ({
                                ...prev,
                                locations: {
                                  ...prev.locations,
                                  zipCodes: prev.locations.zipCodes.filter((_, i) => i !== idx)
                                }
                              }));
                              autoSaveDraft();
                            }}
                          />
                        </Badge>
                      ))}
                      {campaignData.locations.zipCodes.length > 10 && (
                        <Badge variant="secondary" className="text-xs">
                          +{campaignData.locations.zipCodes.length - 10} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderStep6 = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-end">
        <div className="text-sm text-slate-500 mr-4">Review step - no inputs to fill</div>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Review Campaign</h2>
        <p className="text-slate-600">Review all ad groups, ads, keywords, and negative keywords before generating CSV</p>
      </div>

      <div className="space-y-6">
        {/* Ad Groups */}
          <Card>
            <CardHeader>
            <CardTitle>Ad Groups ({campaignData.adGroups.length})</CardTitle>
            <CardDescription>Ad groups organized by campaign structure: {campaignData.selectedStructure?.toUpperCase() || 'STAG'}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                {campaignData.adGroups.map((group, idx) => (
                  <div key={group.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{group.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {group.keywords.length} keywords
                        </p>
                      </div>
                      <Badge variant="outline">{idx + 1}</Badge>
                    </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

        {/* Ads */}
          <Card>
            <CardHeader>
            <CardTitle>Ads ({Math.min(campaignData.ads.length, 3)} / 3)</CardTitle>
            <CardDescription>All ads that will be used across ad groups (Maximum 3 ads per ad group)</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
              <div className="space-y-3">
                {campaignData.ads.slice(0, 3).map((ad) => (
                  <div key={ad.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{ad.type?.toUpperCase() || ad.adType || 'RSA'}</Badge>
                      <span className="text-xs text-slate-500">
                        {ad.extensions?.length || 0} extensions
                      </span>
                    </div>
                    {ad.type === 'rsa' && ad.headlines && (
                      <p className="text-sm text-slate-700 mt-2">
                        {ad.headlines.slice(0, 3).join(' | ')}
                      </p>
                    )}
                    {(ad.type === 'dki' || ad.adType === 'DKI') && ad.headline1 && (
                      <p className="text-sm text-slate-700 mt-2">{ad.headline1}</p>
                    )}
                    {(ad.type === 'call' || ad.adType === 'CallOnly') && ad.headline1 && (
                      <p className="text-sm text-slate-700 mt-2">{ad.headline1}</p>
                    )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

        {/* Keywords */}
          <Card>
            <CardHeader>
            <CardTitle>Keywords ({campaignData.selectedKeywords.length})</CardTitle>
            <CardDescription>All keywords selected for the campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
              <div className="flex flex-wrap gap-2">
                {campaignData.selectedKeywords.slice(0, 100).map((kw, idx) => (
                  <Badge key={kw.id || idx} variant="outline" className="text-xs">
                    {kw.text || kw.keyword || kw}
                  </Badge>
                ))}
                {campaignData.selectedKeywords.length > 100 && (
                  <Badge variant="secondary" className="text-xs">
                    +{campaignData.selectedKeywords.length - 100} more
                  </Badge>
                  )}
                </div>
              </ScrollArea>
          </CardContent>
        </Card>

        {/* Negative Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>Negative Keywords ({campaignData.negativeKeywords.length})</CardTitle>
            <CardDescription>Keywords that will be excluded from the campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {campaignData.negativeKeywords.map((neg, idx) => (
                <Badge 
                  key={idx} 
                  variant={DEFAULT_NEGATIVE_KEYWORDS.includes(neg) ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {neg}
                </Badge>
              ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );

  // Helper function to get location count and type
  const getLocationCountAndType = () => {
    const { cities, zipCodes, states, countries } = campaignData.locations;
    
    if (cities.length > 0) {
      return { count: cities.length, type: 'Cities' };
    } else if (zipCodes.length > 0) {
      return { count: zipCodes.length, type: 'ZIP Codes' };
    } else if (states.length > 0) {
      return { count: states.length, type: 'States' };
    } else if (countries.length > 0) {
      return { count: countries.length, type: 'Countries' };
    } else {
      // Whole country targeting
      return { count: 1, type: 'Country' };
    }
  };

  const renderStep8 = () => {
    const locationInfo = getLocationCountAndType();
    const structureName = CAMPAIGN_STRUCTURES.find(s => s.id === campaignData.selectedStructure)?.name || 'STAG';
    const targetLocationText = locationInfo.count === 1 && locationInfo.type === 'Country'
      ? `${campaignData.targetCountry} (Nationwide)`
      : `${campaignData.targetCountry} (${locationInfo.type})`;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-2">Campaign Created Successfully!</h2>
          <p className="text-lg text-slate-600">Your campaign is ready to export and implement.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-indigo-600 mb-1">1</div>
              <div className="text-sm text-slate-600">Campaign</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-indigo-600 mb-1">{campaignData.adGroups.length}</div>
              <div className="text-sm text-slate-600">Ad Groups</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">{campaignData.selectedKeywords.length}</div>
              <div className="text-sm text-slate-600">Keywords</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">{locationInfo.count}</div>
              <div className="text-sm text-slate-600">Locations ({locationInfo.type})</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Campaign Summary</CardTitle>
            <CardDescription>All checks passed - ready for export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500">Campaign Name</Label>
                <p className="text-sm font-medium text-slate-800 mt-1">{campaignData.campaignName}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Structure</Label>
                <p className="text-sm font-medium text-slate-800 mt-1">{structureName}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-slate-500">Target Location</Label>
                <p className="text-sm font-medium text-slate-800 mt-1">{targetLocationText}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Validation Complete</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Your campaign is validated and ready to export. Click 'Download CSV' below to get your file.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(6)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Review
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Reset and start new campaign
              window.location.reload();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Another Campaign
          </Button>
          <Button
            onClick={() => {
              const blob = new Blob([campaignData.csvData], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${campaignData.campaignName || 'campaign'}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              
              // Redirect to dashboard
              setTimeout(() => {
                const event = new CustomEvent('navigate', { detail: { tab: 'dashboard' } });
                window.dispatchEvent(event);
                if (window.location.hash) {
                  window.location.hash = '#dashboard';
                }
              }, 1000);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: { tab: 'dashboard' } });
              window.dispatchEvent(event);
              if (window.location.hash) {
                window.location.hash = '#dashboard';
              }
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  };

  const renderStep7 = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-end">
        <div className="text-sm text-slate-500 mr-4">CSV generation step - no inputs to fill</div>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">CSV Generation & Validation</h2>
        <p className="text-slate-600">Review your campaign CSV and fix any errors before exporting</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>CSV Headers</CardTitle>
          <CardDescription>Brief overview of CSV structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Campaign', 'Ad Group', 'Row Type', 'Final URL', 'Headline 1', 'Description 1', 'Status'].map(header => (
              <Badge key={header} variant="outline">{header}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateCSV} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
            Generate CSV
          </Button>
        </CardContent>
      </Card>

      {campaignData.csvErrors.length > 0 && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Validation Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {campaignData.csvErrors.map((error, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {campaignData.csvData && campaignData.csvErrors.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            <CardTitle className="text-green-600">CSV Ready</CardTitle>
            </div>
            <CardDescription>Your CSV has been validated and is ready for export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button onClick={handleSaveCampaign} className="w-full" size="lg">
                <Star className="w-5 h-5 mr-2" />
              Save Campaign & Go to Dashboard
            </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const blob = new Blob([campaignData.csvData], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${campaignData.campaignName || 'campaign'}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep === step.id ? 'text-indigo-600' : 'text-slate-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          <span className="text-sm text-slate-600">
            Step {currentStep} of {steps.length}
          </span>
            <Button
              onClick={() => {
                if (currentStep === 1) handleUrlSubmit();
                else if (currentStep === 2) handleNextFromStructure();
              else if (currentStep === 3) {
                if (campaignData.generatedKeywords.length === 0 && campaignData.seedKeywords.length > 0) {
                  const seedKeywordsAsKeywords = createKeywordsFromSeeds(campaignData.seedKeywords);
                  setCampaignData(prev => ({
                    ...prev,
                    generatedKeywords: seedKeywordsAsKeywords,
                    selectedKeywords: seedKeywordsAsKeywords,
                  }));
                }
                setCurrentStep(4);
              }
              else if (currentStep === 4) {
                if (campaignData.ads.length === 0) {
                  notifications.warning('Please generate ads first', { title: 'Ads Required' });
                  return;
                }
                setCurrentStep(5);
              }
              else if (currentStep === 5) {
                setCurrentStep(6);
                autoSaveDraft();
              }
              else if (currentStep === 6) {
                setCurrentStep(7);
                autoSaveDraft();
              }
              else if (currentStep === 7) {
                handleSaveCampaign();
              }
              else if (currentStep === 8) {
                // Success screen - no action needed
              }
              }}
              disabled={loading || currentStep === 8}
            size="sm"
            >
            {currentStep === 7 ? 'Save & Finish' : currentStep === 8 ? 'Download CSV' : 'Next Step'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

      {/* Content */}
      <div className="py-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
        {currentStep === 7 && renderStep7()}
        {currentStep === 8 && renderStep8()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
            <Button
              variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => {
              if (currentStep === 1) handleUrlSubmit();
              else if (currentStep === 2) handleNextFromStructure();
              else if (currentStep === 3) {
                if (campaignData.generatedKeywords.length === 0 && campaignData.seedKeywords.length > 0) {
                  const seedKeywordsAsKeywords = createKeywordsFromSeeds(campaignData.seedKeywords);
                  setCampaignData(prev => ({
                    ...prev,
                    generatedKeywords: seedKeywordsAsKeywords,
                    selectedKeywords: seedKeywordsAsKeywords,
                  }));
                }
                setCurrentStep(4);
              }
              else if (currentStep === 4) {
                if (campaignData.ads.length === 0) {
                  notifications.warning('Please generate ads first', { title: 'Ads Required' });
                  return;
                }
                setCurrentStep(5);
              }
              else if (currentStep === 5) {
                setCurrentStep(6);
                autoSaveDraft();
              }
              else if (currentStep === 6) {
                setCurrentStep(7);
                autoSaveDraft();
              }
              else if (currentStep === 7) {
                handleSaveCampaign();
              }
              else if (currentStep === 8) {
                // Success screen - no action needed
              }
            }}
            disabled={loading || currentStep === 8}
          >
            {currentStep === 7 ? 'Save & Finish' : currentStep === 8 ? 'Download CSV' : 'Next Step'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
    </div>
  );
};

// Helper functions
function detectVertical(landingData: LandingPageExtractionResult): string {
  const text = (landingData.title || '') + ' ' + (landingData.h1 || '') + ' ' + landingData.page_text_tokens.join(' ');
  const lowerText = text.toLowerCase();

  if (lowerText.includes('product') || lowerText.includes('shop') || lowerText.includes('buy') || lowerText.includes('cart')) {
    return 'E-commerce';
  }
  if (lowerText.includes('service') || lowerText.includes('consulting') || lowerText.includes('agency')) {
    return 'Services';
  }
  if (lowerText.includes('health') || lowerText.includes('medical') || lowerText.includes('doctor')) {
    return 'Healthcare';
  }
  if (lowerText.includes('law') || lowerText.includes('legal') || lowerText.includes('attorney')) {
    return 'Legal';
  }
  if (lowerText.includes('real estate') || lowerText.includes('property') || lowerText.includes('home')) {
    return 'Real Estate';
  }
  return 'General';
}

function detectCTA(landingData: LandingPageExtractionResult): string {
  const text = (landingData.title || '') + ' ' + (landingData.h1 || '') + ' ' + landingData.page_text_tokens.join(' ');
  const lowerText = text.toLowerCase();

  if (lowerText.includes('call') || lowerText.includes('phone') || landingData.phones?.length > 0) {
    return 'Call';
  }
  if (lowerText.includes('contact') || lowerText.includes('form') || lowerText.includes('quote')) {
    return 'Contact/Lead';
  }
  if (lowerText.includes('buy') || lowerText.includes('purchase') || lowerText.includes('order')) {
    return 'Purchase';
  }
  return 'Visit';
}

async function generateSeedKeywords(
  landingData: LandingPageExtractionResult,
  intent: IntentResult
): Promise<string[]> {
  // Enhanced seed keyword generation - extract more relevant terms from landing page
  const keywords: string[] = [];
  const seen = new Set<string>();
  
  // Helper to add keyword if not duplicate
  const addKeyword = (kw: string) => {
    const clean = kw.toLowerCase().trim();
    if (clean.length >= 3 && clean.length <= 40 && !seen.has(clean)) {
      seen.add(clean);
      keywords.push(clean);
    }
  };
  
  // Extract main terms from title and h1
  const title = (landingData.title || '').trim();
  const h1 = (landingData.h1 || '').trim();
  
  // Priority 1: Extract key phrases (2-3 word combinations) from title (most important)
  if (title) {
    const titleWords = title.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'from', 'our', 'your'].includes(w.toLowerCase()));
    for (let i = 0; i < titleWords.length - 1 && keywords.length < 8; i++) {
      const phrase = `${titleWords[i]} ${titleWords[i + 1]}`.toLowerCase();
      if (phrase.length >= 5 && phrase.length <= 40) {
        addKeyword(phrase);
      }
      // Also try 3-word phrases for title (high priority)
      if (i + 2 < titleWords.length && keywords.length < 10) {
        const phrase3 = `${titleWords[i]} ${titleWords[i + 1]} ${titleWords[i + 2]}`.toLowerCase();
        if (phrase3.length >= 7 && phrase3.length <= 50) {
          addKeyword(phrase3);
        }
      }
    }
  }
  
  // Priority 2: Extract key phrases from h1
  if (h1 && keywords.length < 12) {
    const h1Words = h1.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'from', 'our', 'your'].includes(w.toLowerCase()));
    for (let i = 0; i < h1Words.length - 1 && keywords.length < 14; i++) {
      const phrase = `${h1Words[i]} ${h1Words[i + 1]}`.toLowerCase();
      if (phrase.length >= 5 && phrase.length <= 40) {
        addKeyword(phrase);
      }
    }
  }
  
  // Priority 3: Add services as seed keywords (very relevant)
  if (landingData.services && landingData.services.length > 0) {
    landingData.services.slice(0, 6).forEach(service => {
      const cleanService = service.toLowerCase().trim();
      if (cleanService.length >= 3 && cleanService.length <= 40) {
        addKeyword(cleanService);
        // Also add variations of service names
        const serviceWords = cleanService.split(/\s+/);
        if (serviceWords.length > 1) {
          // Add first two words as a phrase
          addKeyword(`${serviceWords[0]} ${serviceWords[1]}`);
        }
      }
    });
  }
  
  // Priority 4: Extract important single words from title/h1 (nouns, verbs)
  const importantWords = [
    ...(title ? title.split(/\s+/).filter(w => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean.length >= 4 && !['the', 'and', 'for', 'with', 'from', 'our', 'your', 'best', 'top', 'get', 'call'].includes(clean);
    }) : []),
    ...(h1 ? h1.split(/\s+/).filter(w => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean.length >= 4 && !['the', 'and', 'for', 'with', 'from', 'our', 'your', 'best', 'top', 'get', 'call'].includes(clean);
    }) : [])
  ];
  
  importantWords.slice(0, 4).forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanWord.length >= 4) {
      addKeyword(cleanWord);
    }
  });
  
  // Priority 5: Extract terms from page text tokens (if available)
  if (landingData.page_text_tokens && landingData.page_text_tokens.length > 0) {
    const textTokens = landingData.page_text_tokens
      .filter(token => token.length >= 4 && token.length <= 20)
      .slice(0, 10);
    
    textTokens.forEach(token => {
      const clean = token.toLowerCase().trim();
      if (clean.length >= 4 && !['the', 'and', 'for', 'with', 'from', 'our', 'your'].includes(clean)) {
        addKeyword(clean);
      }
    });
  }

  // Priority 6: Add intent-based keyword variations
  if (intent.intentId === IntentId.CALL) {
    if (keywords.length > 0) {
      addKeyword(`${keywords[0]} call`);
      addKeyword(`call ${keywords[0]}`);
      addKeyword(`${keywords[0]} phone`);
      addKeyword(`phone ${keywords[0]}`);
    }
  } else if (intent.intentId === IntentId.LEAD) {
    if (keywords.length > 0) {
      addKeyword(`${keywords[0]} quote`);
      addKeyword(`${keywords[0]} estimate`);
      addKeyword(`get ${keywords[0]} quote`);
    }
  } else if (intent.intentId === IntentId.PURCHASE) {
    if (keywords.length > 0) {
      addKeyword(`buy ${keywords[0]}`);
      addKeyword(`shop ${keywords[0]}`);
      addKeyword(`${keywords[0]} for sale`);
    }
  }

  // Return top 8-10 most relevant keywords (prioritize longer, more specific phrases)
  const sorted = keywords.sort((a, b) => {
    // Prioritize longer phrases (more specific)
    if (b.split(/\s+/).length !== a.split(/\s+/).length) {
      return b.split(/\s+/).length - a.split(/\s+/).length;
    }
    // Then by length
    return b.length - a.length;
  });
  
  return sorted.slice(0, 10);
}

function rankCampaignStructures(intent: IntentResult, vertical: string): { id: string; score: number }[] {
  // AI-based ranking logic
  const scores: { [key: string]: number } = {};

  // Base scores
  CAMPAIGN_STRUCTURES.forEach(struct => {
    scores[struct.id] = 0;
  });

  // Intent-based scoring
  if (intent.intentId === IntentId.CALL) {
    scores['skag'] += 3;
    scores['geo'] += 2;
    scores['intent'] += 2;
  } else if (intent.intentId === IntentId.LEAD) {
    scores['stag'] += 3;
    scores['funnel'] += 2;
    scores['intent'] += 2;
  } else {
    scores['stag'] += 3;
    scores['mix'] += 2;
    scores['stag_plus'] += 2;
  }

  // Vertical-based scoring
  if (vertical === 'E-commerce') {
    scores['brand_split'] += 2;
    scores['funnel'] += 2;
  } else if (vertical === 'Services') {
    scores['geo'] += 2;
    scores['intent'] += 2;
  }

  // Convert to ranked array
  return Object.entries(scores)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}

function detectIsProduct(url: string, intent: IntentResult | null): boolean {
  // Simple detection - can be enhanced
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('shop') || lowerUrl.includes('product') || lowerUrl.includes('buy') || 
         (intent?.intentId === IntentId.PURCHASE);
}

