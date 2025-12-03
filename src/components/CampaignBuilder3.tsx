import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Globe, Link2, Sparkles, Brain, 
  Hash, MapPin, FileText, Download, AlertCircle, CheckCircle2,
  Loader2, Search, Filter, X, Plus, Edit3, Trash2, Save,
  Target, Zap, Layers, TrendingUp, Building2, ShoppingBag,
  Phone, Mail, Calendar, Clock, Eye, FileSpreadsheet
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
import { exportCampaignToCSVV3, validateCSVBeforeExport } from '../utils/csvGeneratorV3';
import { historyService } from '../utils/historyService';
import { api } from '../utils/api';

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

interface CampaignData {
  url: string;
  campaignName: string;
  intent: IntentResult | null;
  vertical: string | null;
  cta: string | null;
  selectedStructure: string | null;
  structureRankings: { id: string; score: number }[];
  seedKeywords: string[];
  generatedKeywords: any[];
  selectedKeywords: any[];
  keywordTypes: { [key: string]: boolean };
  ads: any[];
  adTypes: string[];
  extensions: any[];
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
  const [locationSearchTerm, setLocationSearchTerm] = useState({ countries: '', states: '', cities: '', zipCodes: '' });
  const [campaignData, setCampaignData] = useState<CampaignData>({
    url: '',
    campaignName: '',
    intent: null,
    vertical: null,
    cta: null,
    selectedStructure: null,
    structureRankings: [],
    seedKeywords: [],
    generatedKeywords: [],
    selectedKeywords: [],
    keywordTypes: { broad: true, phrase: true, exact: true, negative: false },
    ads: [],
    adTypes: ['rsa', 'dki'],
    extensions: [],
    locations: { countries: [], states: [], cities: [], zipCodes: [] },
    csvData: null,
    csvErrors: [],
  });

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
      // Extract landing page content
      const landingData = await extractLandingPageContent(campaignData.url);
      
      // Detect intent, CTA, and vertical
      const intentResult = mapGoalToIntent(
        landingData.title || landingData.h1 || '',
        landingData as any,
        landingData.phones?.[0]
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
        const response = await api.post('/generate-keywords', {
          seeds: campaignData.seedKeywords,
          negatives: [], // Can add negative keywords later if needed
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
        // Check if it's an expected 404 (backend not deployed)
        const isExpectedError = 
          apiError?.name === 'NotFoundError' ||
          apiError?.message?.includes('404') ||
          apiError?.message?.includes('Request failed');
        
        if (isExpectedError) {
          console.log('Python API unavailable, using local keyword generation fallback');
          useFallback = true;
        } else {
          throw apiError; // Re-throw unexpected errors
        }
      }

      // Fallback to local keyword generation
      if (useFallback || generated.length === 0) {
        console.log('Using local keyword generation fallback');
        const localKeywords = generateKeywordsUtil({
          seedKeywords: campaignData.seedKeywords.join('\n'),
          negativeKeywords: '',
          vertical: campaignData.vertical || 'default',
          intentResult: campaignData.intent,
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

      // Apply match types based on selected keyword types
      const formattedKeywords: any[] = [];
      finalKeywords.forEach((kw: any) => {
        // Extract base text (remove match type formatting if present)
        let baseText = kw.text || kw.keyword || '';
        baseText = baseText.replace(/^["\[\]]|["\[\]]$/g, '').trim();
        
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

      setCampaignData(prev => ({
        ...prev,
        generatedKeywords: shuffled,
        selectedKeywords: shuffled, // Auto-select all by default
      }));

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

  // Filter keywords based on selected types
  const filteredKeywords = campaignData.generatedKeywords.filter(kw => {
    if (kw.matchType === 'broad' && !campaignData.keywordTypes.broad) return false;
    if (kw.matchType === 'phrase' && !campaignData.keywordTypes.phrase) return false;
    if (kw.matchType === 'exact' && !campaignData.keywordTypes.exact) return false;
    if (kw.isNegative && !campaignData.keywordTypes.negative) return false;
    return true;
  });

  // Step 4: Ads Generation
  const handleGenerateAds = async () => {
    if (campaignData.selectedKeywords.length === 0) {
      notifications.error('Please select keywords first', { title: 'Keywords Required' });
      return;
    }

    setLoading(true);
    try {
      const keywordTexts = campaignData.selectedKeywords.map(k => k.text || k.keyword || k).slice(0, 10);
      const ads: any[] = [];

      // Generate ads for each selected ad type
      for (const adType of campaignData.adTypes) {
        try {
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
          if (adType === 'rsa' && 'headlines' in ad) {
            const rsa = ad as ResponsiveSearchAd;
            ads.push({
              id: `ad-${Date.now()}-${Math.random()}`,
              type: 'rsa',
              adType: 'RSA',
              headlines: rsa.headlines || [],
              descriptions: rsa.descriptions || [],
              displayPath: rsa.displayPath || [],
              finalUrl: rsa.finalUrl || campaignData.url,
              selected: false,
              extensions: [],
            });
          } else if (adType === 'dki' && 'headline1' in ad) {
            const dki = ad as ExpandedTextAd;
            ads.push({
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
            });
          } else if (adType === 'call' && 'phoneNumber' in ad) {
            const call = ad as CallOnlyAd;
            ads.push({
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
            });
          }
        } catch (adError) {
          console.error(`Error generating ${adType} ad:`, adError);
          // Continue with other ad types
        }
      }
      
      setCampaignData(prev => ({
        ...prev,
        ads: ads,
      }));

      notifications.success(`Generated ${ads.length} ads successfully`, {
        title: 'Ads Generated'
      });
    } catch (error) {
      console.error('Ad generation error:', error);
      notifications.error('Failed to generate ads', {
        title: 'Generation Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAd = (adId: string) => {
    // TODO: Implement ad editing dialog
    notifications.info('Ad editing feature coming soon', { title: 'Edit Ad' });
  };

  const handleDeleteAd = (adId: string) => {
    setCampaignData(prev => ({
      ...prev,
      ads: prev.ads.filter(ad => ad.id !== adId),
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
    setCampaignData(prev => ({
      ...prev,
      ads: prev.ads.map(ad => {
        if (ad.id === adId) {
          const newExtension = {
            id: `ext-${Date.now()}`,
            type: extensionType,
            text: '',
          };
          return {
            ...ad,
            extensions: [...(ad.extensions || []), newExtension],
          };
        }
        return ad;
      }),
    }));
  };

  // Step 5: Location Selection
  const handleLocationNext = () => {
    if (campaignData.locations.countries.length === 0 && 
        campaignData.locations.states.length === 0 && 
        campaignData.locations.cities.length === 0 && 
        campaignData.locations.zipCodes.length === 0) {
      notifications.warning('No locations selected. Campaign will target all locations.', {
        title: 'No Locations'
      });
    }
    setCurrentStep(6);
  };

  // Step 6: CSV Generation & Validation
  const handleGenerateCSV = async () => {
    setLoading(true);
    try {
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
          ads: campaignData.ads,
        } as StructureSettings
      );

      const validation = validateCSVBeforeExport(structure);
      
      if (validation.isValid) {
        const csvData = await exportCampaignToCSVV3(structure);
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
    try {
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
        createdAt: new Date().toISOString(),
      }, 'completed');

      notifications.success('Campaign saved successfully', {
        title: 'Campaign Saved',
        description: 'Redirecting to dashboard...'
      });

      // Redirect to dashboard after a delay
      setTimeout(() => {
        const event = new CustomEvent('navigate', { detail: { tab: 'dashboard' } });
        window.dispatchEvent(event);
        // Also try to update the active tab if the app is listening
        if (window.location.hash) {
          window.location.hash = '#dashboard';
        }
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      notifications.error('Failed to save campaign', {
        title: 'Save Error'
      });
    }
  };

  // Render functions for each step
  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Enter Your Website URL</h2>
        <p className="text-slate-600">AI will analyze your website to identify intent, CTA, and vertical</p>
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Select Campaign Structure</h2>
        <p className="text-slate-600">AI has ranked the best structures for your vertical. Choose the one that fits your needs.</p>
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Keywords Planner</h2>
        <p className="text-slate-600">Generate 410-710 keywords based on your seed keywords and campaign structure</p>
      </div>

      <Card className="mb-6">
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
          />
          <Button onClick={handleGenerateKeywords} disabled={loading} className="mt-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate Keywords
          </Button>
        </CardContent>
      </Card>

      {campaignData.generatedKeywords.length > 0 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Keyword Type Filters</CardTitle>
              <CardDescription>Toggle keyword types to filter the list</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
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

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generated Keywords ({filteredKeywords.length})</CardTitle>
              <CardDescription>Keywords organized by campaign structure</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredKeywords.map((kw, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{kw.text || kw.keyword || kw}</span>
                      {kw.matchType && (
                        <Badge variant="outline">{kw.matchType}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Ads & Extensions</h2>
        <p className="text-slate-600">Generate ads using AI based on your website intent and selected keywords</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ad Types</CardTitle>
          <CardDescription>Select the types of ads you want to generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {['rsa', 'dki', 'call'].map(type => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={type}
                  checked={campaignData.adTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    setCampaignData(prev => ({
                      ...prev,
                      adTypes: checked
                        ? [...prev.adTypes, type]
                        : prev.adTypes.filter(t => t !== type)
                    }));
                  }}
                />
                <Label htmlFor={type} className="uppercase">{type}</Label>
              </div>
            ))}
          </div>
          <Button onClick={handleGenerateAds} disabled={loading} className="mt-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate Ads
          </Button>
        </CardContent>
      </Card>

      {campaignData.ads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Ads ({campaignData.ads.length})</CardTitle>
            <CardDescription>Review, edit, delete, or add extensions to ads</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {campaignData.ads.map((ad) => (
                  <Card key={ad.id} className={ad.selected ? 'ring-2 ring-indigo-500' : ''}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={ad.selected || false}
                            onCheckedChange={() => handleToggleAdSelection(ad.id)}
                          />
                          <Badge>{ad.type?.toUpperCase() || ad.adType || 'RSA'}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditAd(ad.id)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAd(ad.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* RSA Ad Display */}
                      {ad.type === 'rsa' && ad.headlines && (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-slate-500">Headlines</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ad.headlines.slice(0, 5).map((h, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{h}</Badge>
                              ))}
                              {ad.headlines.length > 5 && (
                                <Badge variant="outline" className="text-xs">+{ad.headlines.length - 5} more</Badge>
                              )}
                            </div>
                          </div>
                          {ad.descriptions && ad.descriptions.length > 0 && (
                            <div>
                              <Label className="text-xs text-slate-500">Descriptions</Label>
                              <p className="text-sm text-slate-600 mt-1">{ad.descriptions[0]}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-xs text-slate-500">Final URL</Label>
                            <p className="text-xs text-blue-600 mt-1">{ad.finalUrl}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* DKI Ad Display */}
                      {(ad.type === 'dki' || ad.adType === 'DKI') && (
                        <div className="space-y-2">
                          {ad.headline1 && <p className="font-semibold text-sm">{ad.headline1}</p>}
                          {ad.headline2 && <p className="font-semibold text-sm">{ad.headline2}</p>}
                          {ad.description1 && <p className="text-sm text-slate-600">{ad.description1}</p>}
                          {ad.finalUrl && (
                            <p className="text-xs text-blue-600">{ad.finalUrl}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Call-Only Ad Display */}
                      {(ad.type === 'call' || ad.adType === 'CallOnly') && (
                        <div className="space-y-2">
                          {ad.headline1 && <p className="font-semibold text-sm">{ad.headline1}</p>}
                          {ad.phoneNumber && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">{ad.phoneNumber}</span>
                            </div>
                          )}
                          {ad.description1 && <p className="text-sm text-slate-600">{ad.description1}</p>}
                        </div>
                      )}
                      
                      {/* Extensions Section */}
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-slate-500">Extensions</Label>
                          <Select onValueChange={(value) => handleAddExtension(ad.id, value)}>
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Add Extension" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sitelink">Sitelink</SelectItem>
                              <SelectItem value="callout">Callout</SelectItem>
                              <SelectItem value="call">Call</SelectItem>
                              <SelectItem value="message">Message</SelectItem>
                              <SelectItem value="price">Price</SelectItem>
                              <SelectItem value="promotion">Promotion</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {ad.extensions && ad.extensions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {ad.extensions.map((ext: any) => (
                              <Badge key={ext.id} variant="secondary" className="text-xs">
                                {ext.type}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep5 = () => {
    const filteredCountries = LOCATION_PRESETS.countries.filter(c => 
      c.toLowerCase().includes(locationSearchTerm.countries.toLowerCase())
    );
    const filteredStates = LOCATION_PRESETS.states.filter(s => 
      s.toLowerCase().includes(locationSearchTerm.states.toLowerCase())
    );
    const filteredCities = LOCATION_PRESETS.cities.filter(c => 
      c.toLowerCase().includes(locationSearchTerm.cities.toLowerCase())
    );
    const filteredZipCodes = LOCATION_PRESETS.zipCodes.filter(z => 
      z.includes(locationSearchTerm.zipCodes)
    );

    const handleToggleLocation = (type: 'countries' | 'states' | 'cities' | 'zipCodes', value: string) => {
      setCampaignData(prev => {
        const current = prev.locations[type];
        const isSelected = current.includes(value);
        return {
          ...prev,
          locations: {
            ...prev.locations,
            [type]: isSelected
              ? current.filter(item => item !== value)
              : [...current, value]
          }
        };
      });
    };

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Location Selection</h2>
          <p className="text-slate-600">Select target locations for your campaign. You can select multiple locations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Countries ({campaignData.locations.countries.length} selected)</CardTitle>
              <CardDescription>Top 20 countries</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search countries..."
                value={locationSearchTerm.countries}
                onChange={(e) => setLocationSearchTerm(prev => ({ ...prev, countries: e.target.value }))}
                className="mb-3"
              />
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredCountries.map(country => (
                    <div key={country} className="flex items-center gap-2">
                      <Checkbox
                        checked={campaignData.locations.countries.includes(country)}
                        onCheckedChange={() => handleToggleLocation('countries', country)}
                      />
                      <Label className="text-sm cursor-pointer" onClick={() => handleToggleLocation('countries', country)}>
                        {country}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>States ({campaignData.locations.states.length} selected)</CardTitle>
              <CardDescription>Top 30 US states</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search states..."
                value={locationSearchTerm.states}
                onChange={(e) => setLocationSearchTerm(prev => ({ ...prev, states: e.target.value }))}
                className="mb-3"
              />
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredStates.map(state => (
                    <div key={state} className="flex items-center gap-2">
                      <Checkbox
                        checked={campaignData.locations.states.includes(state)}
                        onCheckedChange={() => handleToggleLocation('states', state)}
                      />
                      <Label className="text-sm cursor-pointer" onClick={() => handleToggleLocation('states', state)}>
                        {state}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cities ({campaignData.locations.cities.length} selected)</CardTitle>
              <CardDescription>Top 50 US cities</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search cities..."
                value={locationSearchTerm.cities}
                onChange={(e) => setLocationSearchTerm(prev => ({ ...prev, cities: e.target.value }))}
                className="mb-3"
              />
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredCities.map(city => (
                    <div key={city} className="flex items-center gap-2">
                      <Checkbox
                        checked={campaignData.locations.cities.includes(city)}
                        onCheckedChange={() => handleToggleLocation('cities', city)}
                      />
                      <Label className="text-sm cursor-pointer" onClick={() => handleToggleLocation('cities', city)}>
                        {city}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ZIP Codes ({campaignData.locations.zipCodes.length} selected)</CardTitle>
              <CardDescription>Top 5000 ZIP codes</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search ZIP codes..."
                value={locationSearchTerm.zipCodes}
                onChange={(e) => setLocationSearchTerm(prev => ({ ...prev, zipCodes: e.target.value }))}
                className="mb-3"
              />
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredZipCodes.slice(0, 100).map(zip => (
                    <div key={zip} className="flex items-center gap-2">
                      <Checkbox
                        checked={campaignData.locations.zipCodes.includes(zip)}
                        onCheckedChange={() => handleToggleLocation('zipCodes', zip)}
                      />
                      <Label className="text-sm cursor-pointer" onClick={() => handleToggleLocation('zipCodes', zip)}>
                        {zip}
                      </Label>
                    </div>
                  ))}
                  {filteredZipCodes.length > 100 && (
                    <p className="text-xs text-slate-500 mt-2">
                      Showing first 100 of {filteredZipCodes.length} results. Use search to find specific ZIP codes.
                    </p>
                  )}
                </div>
              </ScrollArea>
              <div className="mt-3">
                <Textarea
                  placeholder="Or enter ZIP codes manually (comma-separated)"
                  value={campaignData.locations.zipCodes.filter(z => !LOCATION_PRESETS.zipCodes.includes(z)).join(', ')}
                  onChange={(e) => {
                    const zips = e.target.value.split(',').map(z => z.trim()).filter(z => z);
                    const presetZips = campaignData.locations.zipCodes.filter(z => LOCATION_PRESETS.zipCodes.includes(z));
                    setCampaignData(prev => ({
                      ...prev,
                      locations: {
                        ...prev.locations,
                        zipCodes: [...presetZips, ...zips]
                      }
                    }));
                  }}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderStep6 = () => (
    <div className="max-w-6xl mx-auto p-6">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">CSV Ready</CardTitle>
            <CardDescription>Your CSV has been validated and is ready for export</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSaveCampaign} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Campaign & Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Progress bar
  const steps = [
    { id: 1, label: 'URL Input' },
    { id: 2, label: 'Structure' },
    { id: 3, label: 'Keywords' },
    { id: 4, label: 'Ads' },
    { id: 5, label: 'Location' },
    { id: 6, label: 'CSV & Validate' },
  ];

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

      {/* Content */}
      <div className="py-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </div>

      {/* Navigation */}
      {currentStep !== 3 && (
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
                else if (currentStep === 4) setCurrentStep(5);
                else if (currentStep === 5) handleLocationNext();
                else if (currentStep === 6) handleSaveCampaign();
              }}
              disabled={loading}
            >
              {currentStep === 6 ? 'Save & Finish' : 'Next Step'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 3 Navigation - Moved up below keywords */}
      {currentStep === 3 && (
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => {
                // If no keywords generated, use seed keywords as fallback
                if (campaignData.generatedKeywords.length === 0 && campaignData.seedKeywords.length > 0) {
                  const seedKeywordsAsKeywords = createKeywordsFromSeeds(campaignData.seedKeywords);
                  setCampaignData(prev => ({
                    ...prev,
                    generatedKeywords: seedKeywordsAsKeywords,
                    selectedKeywords: seedKeywordsAsKeywords,
                  }));
                  notifications.info('Using seed keywords as manual keywords', {
                    title: 'Proceeding with Seed Keywords',
                    description: `Using ${seedKeywordsAsKeywords.length} seed keywords for campaign creation.`
                  });
                }
                setCurrentStep(4);
              }}
              disabled={loading || (campaignData.generatedKeywords.length === 0 && campaignData.seedKeywords.length === 0)}
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
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
  // Use AI to generate 3-4 seed keywords
  const keywords: string[] = [];
  
  const mainTerms = [
    landingData.title,
    landingData.h1,
    ...landingData.services.slice(0, 2),
  ].filter(Boolean);

  mainTerms.forEach(term => {
    if (term && keywords.length < 4) {
      keywords.push(term.toLowerCase());
    }
  });

  // Add intent-based keywords
  if (intent.intentId === IntentId.CALL) {
    keywords.push(`${mainTerms[0]} near me`);
  } else if (intent.intentId === IntentId.LEAD) {
    keywords.push(`${mainTerms[0]} quote`);
  }

  return keywords.slice(0, 4);
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

