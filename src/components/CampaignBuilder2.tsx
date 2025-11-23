import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRight, Check, ChevronRight, Download, FileText, Globe, 
  Layout, Layers, MapPin, Mail, Hash, TrendingUp, Zap, 
  Phone, Repeat, Search, Sparkles, Edit3, Trash2, Save, RefreshCw, Clock,
  CheckCircle2, AlertCircle, ShieldCheck, AlertTriangle, Plus, Link2, Eye, 
  DollarSign, Smartphone, MessageSquare, Building2, FileText as FormIcon, 
  Tag, Image as ImageIcon, Gift, Target, Brain, Split, Map, Funnel, 
  Users, TrendingDown, Network, Filter
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { KeywordPlannerSelectable } from './KeywordPlannerSelectable';
import { LiveAdPreview } from './LiveAdPreview';
import { notifications } from '../utils/notifications';
import { generateCampaignStructure, type StructureSettings } from '../utils/campaignStructureGenerator';
import { exportCampaignToCSV } from '../utils/csvExporter';
import { api } from '../utils/api';
import { projectId } from '../utils/supabase/info';

// Structure Types
type StructureType = 
  | 'skag' 
  | 'stag' 
  | 'mix' 
  | 'stag_plus' 
  | 'intent' 
  | 'alpha_beta' 
  | 'match_type' 
  | 'geo' 
  | 'funnel' 
  | 'brand_split' 
  | 'competitor' 
  | 'ngram';

// Structure Definitions
const STRUCTURE_TYPES = [
  { id: 'skag' as StructureType, name: 'SKAG', icon: Zap, description: 'Single Keyword Ad Group - Maximum relevance' },
  { id: 'stag' as StructureType, name: 'STAG', icon: TrendingUp, description: 'Single Theme Ad Group - Balanced approach' },
  { id: 'mix' as StructureType, name: 'MIX', icon: Layers, description: 'Hybrid Structure - Best of both worlds' },
  { id: 'stag_plus' as StructureType, name: 'STAG+', icon: Brain, description: 'Smart Grouping - ML-powered themes' },
  { id: 'intent' as StructureType, name: 'IBAG', icon: Target, description: 'Intent-Based - High/Research/Brand/Competitor' },
  { id: 'alpha_beta' as StructureType, name: 'Alpha–Beta', icon: Split, description: 'Alpha winners, Beta discovery' },
  { id: 'match_type' as StructureType, name: 'Match-Type Split', icon: Filter, description: 'Broad/Phrase/Exact separation' },
  { id: 'geo' as StructureType, name: 'GEO-Segmented', icon: Map, description: 'Location-based segmentation' },
  { id: 'funnel' as StructureType, name: 'Funnel-Based', icon: Funnel, description: 'TOF/MOF/BOF intent grouping' },
  { id: 'brand_split' as StructureType, name: 'Brand vs Non-Brand', icon: Users, description: 'Brand and non-brand separation' },
  { id: 'competitor' as StructureType, name: 'Competitor Campaigns', icon: TrendingDown, description: 'Competitor brand queries' },
  { id: 'ngram' as StructureType, name: 'Smart Cluster', icon: Network, description: 'N-Gram ML clustering' },
];

export const CampaignBuilder2 = ({ initialData }: { initialData?: any }) => {
  // Wizard State
  const [step, setStep] = useState(1);
  const [structureType, setStructureType] = useState<StructureType | null>(null);
  
  // Generate default campaign name with date and time
  const generateDefaultCampaignName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/:/g, '-');
    return `Search Campaign ${dateStr} ${timeStr}`;
  };
  
  // Step 1: Setup
  const [campaignName, setCampaignName] = useState(generateDefaultCampaignName());
  const [matchTypes, setMatchTypes] = useState({ broad: true, phrase: true, exact: true });
  const [url, setUrl] = useState('https://example.com');
  
  // Step 2: Keywords
  const [seedKeywords, setSeedKeywords] = useState('');
  const [negativeKeywords, setNegativeKeywords] = useState('');
  const [generatedKeywords, setGeneratedKeywords] = useState<any[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  
  // Step 2 Dynamic State (structure-specific)
  const [intentGroups, setIntentGroups] = useState<{ [key: string]: string[] }>({
    high_intent: [],
    research: [],
    brand: [],
    competitor: []
  });
  const [selectedIntents, setSelectedIntents] = useState<string[]>(['high_intent', 'research', 'brand']);
  const [alphaKeywords, setAlphaKeywords] = useState<string[]>([]);
  const [betaKeywords, setBetaKeywords] = useState<string[]>([]);
  const [funnelGroups, setFunnelGroups] = useState<{ [key: string]: string[] }>({
    tof: [],
    mof: [],
    bof: []
  });
  const [brandKeywords, setBrandKeywords] = useState<string[]>([]);
  const [nonBrandKeywords, setNonBrandKeywords] = useState<string[]>([]);
  const [competitorKeywords, setCompetitorKeywords] = useState<string[]>([]);
  const [smartClusters, setSmartClusters] = useState<{ [key: string]: string[] }>({});
  
  // Step 3: Ads
  const [ads, setAds] = useState<any[]>([]);
  const [generatedAds, setGeneratedAds] = useState<any[]>([]);
  
  // Step 4: Geo
  const [targetCountry, setTargetCountry] = useState('United States');
  const [geoType, setGeoType] = useState('STANDARD');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedZips, setSelectedZips] = useState<string[]>([]);
  
  // Step 5: Review
  const [reviewData, setReviewData] = useState<any>(null);
  
  // Step 6: Validate
  const [validationResults, setValidationResults] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setCampaignName(initialData.campaignName || generateDefaultCampaignName());
      setStructureType(initialData.structureType || null);
      setUrl(initialData.url || 'https://example.com');
      setSelectedKeywords(initialData.selectedKeywords || []);
      setGeneratedAds(initialData.generatedAds || []);
    }
  }, [initialData]);

  // Step Indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 space-x-2 sm:space-x-4">
      {[
        { num: 1, label: 'Setup' },
        { num: 2, label: 'Keywords' },
        { num: 3, label: 'Ads & Extensions' },
        { num: 4, label: 'Geo Target' },
        { num: 5, label: 'Review' },
        { num: 6, label: 'Validate' }
      ].map((s, idx) => (
        <div key={s.num} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
            step >= s.num 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-slate-100 text-slate-400'
          }`}>
            {s.num}
          </div>
          <span className={`ml-3 font-medium hidden sm:block ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>
            {s.label}
          </span>
          {idx < 5 && (
            <div className={`w-6 sm:w-12 h-1 mx-2 sm:mx-3 rounded-full ${step > s.num ? 'bg-indigo-200' : 'bg-slate-100'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // Step 1: Setup with Structure Selection
  const renderStep1 = () => {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Campaign Setup</h2>
          <p className="text-slate-600">Choose your campaign structure and configure basic settings</p>
        </div>

        {/* Campaign Name */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Campaign Name</CardTitle>
            <CardDescription>Give your campaign a descriptive name</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Summer Sale Campaign 2025"
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Structure Selection */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Select Campaign Structure</CardTitle>
            <CardDescription>Choose the structure that best fits your campaign goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STRUCTURE_TYPES.map((structure) => {
                const Icon = structure.icon;
                const isSelected = structureType === structure.id;
                return (
                  <Card
                    key={structure.id}
                    onClick={() => setStructureType(structure.id)}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected 
                        ? 'border-2 border-indigo-500 bg-indigo-50' 
                        : 'border border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-1">{structure.name}</h3>
                          <p className="text-xs text-slate-600">{structure.description}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Match Types */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Match Types</CardTitle>
            <CardDescription>Select which match types to include</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="broad"
                  checked={matchTypes.broad}
                  onCheckedChange={(checked) => setMatchTypes({ ...matchTypes, broad: !!checked })}
                />
                <Label htmlFor="broad" className="cursor-pointer">Broad Match</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phrase"
                  checked={matchTypes.phrase}
                  onCheckedChange={(checked) => setMatchTypes({ ...matchTypes, phrase: !!checked })}
                />
                <Label htmlFor="phrase" className="cursor-pointer">Phrase Match</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exact"
                  checked={matchTypes.exact}
                  onCheckedChange={(checked) => setMatchTypes({ ...matchTypes, exact: !!checked })}
                />
                <Label htmlFor="exact" className="cursor-pointer">Exact Match</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Landing Page URL */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Landing Page URL</CardTitle>
            <CardDescription>Where should your ads direct users?</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={() => {
              if (!campaignName) {
                notifications.warning('Please enter a campaign name', { title: 'Campaign Name Required' });
                return;
              }
              if (!structureType) {
                notifications.warning('Please select a campaign structure', { title: 'Structure Required' });
                return;
              }
              if (!url) {
                notifications.warning('Please enter a landing page URL', { title: 'URL Required' });
                return;
              }
              setStep(2);
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
          >
            Next: Keywords <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  // Step 2: Keywords (Dynamic based on structure)
  const renderStep2 = () => {
    if (!structureType) {
      return <div>Please select a structure first</div>;
    }

    // Common keyword input section
    const commonKeywordSection = (
      <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle>Seed Keywords</CardTitle>
          <CardDescription>Enter your seed keywords (one per line)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={seedKeywords}
            onChange={(e) => setSeedKeywords(e.target.value)}
            placeholder="Call airline&#10;airline number&#10;call united number"
            rows={6}
            className="font-mono text-sm"
          />
          <div className="mt-4">
            <Button
              onClick={async () => {
                if (!seedKeywords.trim()) {
                  notifications.warning('Please enter seed keywords', { title: 'Seed Keywords Required' });
                  return;
                }

                setIsGeneratingKeywords(true);
                const loadingToast = notifications.loading('Generating keywords with AI...', {
                  title: 'AI Keyword Generation',
                  description: 'This may take a few moments. Please wait...',
                });

                try {
                  let keywords: any[] = [];

                  if (!projectId) {
                    // Fallback: Generate mock keywords
                    console.warn("Project ID is missing, using mock generation");
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    keywords = seedKeywords.split('\n').filter(k => k.trim()).map((k, i) => ({
                      id: `kw-${i}`,
                      text: k.trim(),
                      volume: 'High',
                      cpc: '$2.50',
                      type: 'Seed'
                    }));
                  } else {
                    // Call AI API
                    console.log("Attempting AI keyword generation...");
                    const data = await api.post('/generate-keywords', {
                      seeds: seedKeywords,
                      negatives: negativeKeywords
                    });

                    if (data.keywords && Array.isArray(data.keywords) && data.keywords.length > 0) {
                      console.log("AI generation successful:", data.keywords.length, "keywords");
                      keywords = data.keywords;
                    } else {
                      throw new Error("No keywords returned from AI");
                    }
                  }

                  setGeneratedKeywords(keywords);
                  
                  // Extract keyword texts for structure-specific grouping
                  const keywordTexts = keywords.map(k => k.text || k.id);
                  
                  // Populate structure-specific groups
                  if (structureType === 'intent') {
                    // Classify keywords by intent using AI-generated keywords
                    const highIntent = keywordTexts.filter(k => {
                      const lower = k.toLowerCase();
                      return lower.includes('call') || lower.includes('buy') || lower.includes('get') || 
                             lower.includes('purchase') || lower.includes('order') || lower.includes('now');
                    });
                    const research = keywordTexts.filter(k => {
                      const lower = k.toLowerCase();
                      return lower.includes('info') || lower.includes('compare') || lower.includes('best') ||
                             lower.includes('review') || lower.includes('guide') || lower.includes('how');
                    });
                    const brand = keywordTexts.filter(k => {
                      const lower = k.toLowerCase();
                      return lower.includes('your') || lower.includes('company') || lower.includes('brand') ||
                             lower.includes('official');
                    });
                    const competitor = keywordTexts.filter(k => {
                      const lower = k.toLowerCase();
                      return ['nextiva', 'hubspot', 'clickcease', 'semrush', 'competitor', 'alternative'].some(c => lower.includes(c));
                    });
                    setIntentGroups({ 
                      high_intent: highIntent, 
                      research, 
                      brand, 
                      competitor 
                    });
                    // Auto-select all intent groups that have keywords
                    const groupsWithKeywords = [];
                    if (highIntent.length > 0) groupsWithKeywords.push('high_intent');
                    if (research.length > 0) groupsWithKeywords.push('research');
                    if (brand.length > 0) groupsWithKeywords.push('brand');
                    if (competitor.length > 0) groupsWithKeywords.push('competitor');
                    if (groupsWithKeywords.length > 0) {
                      setSelectedIntents(groupsWithKeywords);
                    }
                  } else if (structureType === 'alpha_beta') {
                    // Split into beta (all keywords initially)
                    setBetaKeywords(keywordTexts);
                    setAlphaKeywords([]);
                  } else if (structureType === 'funnel') {
                    // Classify by funnel stage
                    const tof = keywordTexts.filter(k => {
                      const lower = k.toLowerCase();
                      return lower.includes('what') || lower.includes('how') || lower.includes('info') ||
                             lower.includes('guide') || lower.includes('learn');
                    });
                    const mof = keywordTexts.filter(k => {
                      const lower = k.toLowerCase();
                      return lower.includes('compare') || lower.includes('best') || lower.includes('review') ||
                             lower.includes('vs') || lower.includes('alternative');
                    });
                    const bof = keywordTexts.filter(k => {
                      const lower = k.toLowerCase();
                      return lower.includes('buy') || lower.includes('call') || lower.includes('get') ||
                             lower.includes('purchase') || lower.includes('order');
                    });
                    setFunnelGroups({ tof, mof, bof });
                  } else if (structureType === 'brand_split') {
                    // Detect brand keywords
                    const brand = keywordTexts.filter(k => {
                      const lower = k.toLowerCase();
                      return lower.includes('your') || lower.includes('company') || lower.includes('brand') ||
                             lower.includes('official');
                    });
                    const nonBrand = keywordTexts.filter(k => !brand.includes(k));
                    setBrandKeywords(brand);
                    setNonBrandKeywords(nonBrand);
                  } else if (structureType === 'competitor') {
                    // Detect competitor keywords
                    const competitors = keywordTexts.filter(k => {
                      const lower = k.toLowerCase();
                      return ['nextiva', 'hubspot', 'clickcease', 'semrush', 'competitor', 'alternative'].some(c => lower.includes(c));
                    });
                    setCompetitorKeywords(competitors);
                  } else if (structureType === 'stag_plus' || structureType === 'ngram') {
                    // Smart clustering - group by common words
                    const clusters: { [key: string]: string[] } = {};
                    keywordTexts.forEach(kw => {
                      const words = kw.toLowerCase().split(' ');
                      const clusterKey = words[0] || 'other';
                      if (!clusters[clusterKey]) {
                        clusters[clusterKey] = [];
                      }
                      clusters[clusterKey].push(kw);
                    });
                    setSmartClusters(clusters);
                  }
                  
                  if (loadingToast) loadingToast();
                  notifications.success(`Generated ${keywords.length} keywords successfully`, {
                    title: 'Keywords Generated',
                    description: `AI found ${keywords.length} keyword suggestions. Review and select the ones you want to use.`,
                  });
                } catch (error) {
                  console.log('ℹ️ Backend unavailable - using local fallback generation', error);
                  // Fallback: Generate mock keywords
                  const mockKeywords = seedKeywords.split('\n').filter(k => k.trim()).map((k, i) => ({
                    id: `kw-${i}`,
                    text: k.trim(),
                    volume: 'High',
                    cpc: '$2.50',
                    type: 'Seed'
                  }));
                  setGeneratedKeywords(mockKeywords);
                  if (loadingToast) loadingToast();
                  notifications.info(`Generated ${mockKeywords.length} keywords using local generation`, {
                    title: 'Keywords Generated (Offline Mode)',
                    description: 'Using local generation. Some features may be limited.',
                  });
                } finally {
                  setIsGeneratingKeywords(false);
                }
              }}
              disabled={!seedKeywords.trim() || isGeneratingKeywords}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {isGeneratingKeywords ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin"/> Generating...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2"/> Generate Keywords</>
              )}
            </Button>
          </div>
          
          {/* Display Generated Keywords */}
          {generatedKeywords.length > 0 && (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl mt-4">
              <CardHeader>
                <CardTitle>Generated Keywords ({generatedKeywords.length})</CardTitle>
                <CardDescription>Select keywords to include in your campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedKeywords.length === generatedKeywords.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const allKeywords = generatedKeywords.map(k => k.text || k.id);
                          setSelectedKeywords(allKeywords);
                        } else {
                          setSelectedKeywords([]);
                        }
                      }}
                    />
                    <Label className="font-semibold">Select All</Label>
                  </div>
                  <Badge variant="outline">{selectedKeywords.length} selected</Badge>
                </div>
                <ScrollArea className="h-64 border border-slate-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {generatedKeywords.map((keyword) => {
                      const keywordText = keyword.text || keyword.id;
                      const isSelected = selectedKeywords.includes(keywordText);
                      return (
                        <div
                          key={keyword.id || keywordText}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-indigo-50 border-2 border-indigo-500' 
                              : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedKeywords(selectedKeywords.filter(k => k !== keywordText));
                            } else {
                              setSelectedKeywords([...selectedKeywords, keywordText]);
                            }
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedKeywords([...selectedKeywords, keywordText]);
                              } else {
                                setSelectedKeywords(selectedKeywords.filter(k => k !== keywordText));
                              }
                            }}
                          />
                          <Label className="cursor-pointer flex-1">{keywordText}</Label>
                          {keyword.volume && (
                            <Badge variant="secondary" className="text-xs">{keyword.volume}</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    );

    // Structure-specific UI
    const renderStructureSpecificUI = () => {
      switch (structureType) {
        case 'skag':
        case 'stag':
        case 'mix':
          // Standard keyword selection
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Select Keywords</CardTitle>
                <CardDescription>Choose keywords for your campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <KeywordPlannerSelectable
                  initialData={{
                    seedKeywords,
                    negativeKeywords,
                    selectedKeywords
                  }}
                  onKeywordsSelected={(keywords) => setSelectedKeywords(keywords)}
                />
              </CardContent>
            </Card>
          );

        case 'stag_plus':
          // Smart Grouping
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Smart Groups</CardTitle>
                <CardDescription>AI-powered keyword clustering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.keys(smartClusters).length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>Generate keywords to see smart clusters</p>
                    </div>
                  ) : (
                    Object.entries(smartClusters).map(([clusterName, keywords]) => (
                      <div key={clusterName} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-800 mb-2">{clusterName}</h4>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((kw, idx) => (
                            <Badge key={idx} variant="secondary">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );

        case 'intent':
          // Intent-Based Groups
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Intent Groups</CardTitle>
                <CardDescription>Select which intent groups to include</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 'high_intent', label: 'High Intent', color: 'green' },
                    { id: 'research', label: 'Research', color: 'blue' },
                    { id: 'brand', label: 'Brand', color: 'purple' },
                    { id: 'competitor', label: 'Competitor', color: 'red' }
                  ].map((intent) => {
                    const intentKeywords = intentGroups[intent.id] || [];
                    const selectedIntentKeywords = intentKeywords.filter(kw => selectedKeywords.includes(kw));
                    return (
                      <div key={intent.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedIntents.includes(intent.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedIntents([...selectedIntents, intent.id]);
                                  // Auto-select all keywords in this intent group
                                  const newSelected = [...selectedKeywords];
                                  intentKeywords.forEach(kw => {
                                    if (!newSelected.includes(kw)) {
                                      newSelected.push(kw);
                                    }
                                  });
                                  setSelectedKeywords(newSelected);
                                } else {
                                  setSelectedIntents(selectedIntents.filter(i => i !== intent.id));
                                  // Remove keywords from this intent group
                                  setSelectedKeywords(selectedKeywords.filter(kw => !intentKeywords.includes(kw)));
                                }
                              }}
                            />
                            <Label className="font-semibold">{intent.label}</Label>
                          </div>
                          <Badge variant="outline">{intentKeywords.length} keywords ({selectedIntentKeywords.length} selected)</Badge>
                        </div>
                        {selectedIntents.includes(intent.id) && intentKeywords.length > 0 && (
                          <div className="mt-3">
                            <ScrollArea className="h-32 border border-slate-200 rounded-lg p-2">
                              <div className="flex flex-wrap gap-2">
                                {intentKeywords.map((kw, idx) => {
                                  const isSelected = selectedKeywords.includes(kw);
                                  return (
                                    <Badge
                                      key={idx}
                                      variant={isSelected ? "default" : "secondary"}
                                      className={`cursor-pointer ${isSelected ? 'bg-indigo-600' : ''}`}
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedKeywords(selectedKeywords.filter(k => k !== kw));
                                        } else {
                                          setSelectedKeywords([...selectedKeywords, kw]);
                                        }
                                      }}
                                    >
                                      {kw}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );

        case 'alpha_beta':
          // Alpha-Beta Split
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Alpha-Beta Split</CardTitle>
                <CardDescription>Beta discovery and Alpha winners</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="beta" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="beta">Beta Discovery</TabsTrigger>
                    <TabsTrigger value="alpha">Alpha Winners</TabsTrigger>
                  </TabsList>
                  <TabsContent value="beta" className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {betaKeywords.length === 0 ? (
                        <p className="text-slate-500">Generate keywords to populate Beta</p>
                      ) : (
                        betaKeywords.map((kw, idx) => (
                          <Badge key={idx} variant="secondary">{kw}</Badge>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="alpha" className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {alphaKeywords.length === 0 ? (
                        <p className="text-slate-500">Promote winners from Beta to Alpha</p>
                      ) : (
                        alphaKeywords.map((kw, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-700">{kw}</Badge>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );

        case 'match_type':
          // Match Type Split
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Match Type Split</CardTitle>
                <CardDescription>Keywords duplicated by match type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['broad', 'phrase', 'exact'].map((matchType) => (
                    <div key={matchType} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-semibold capitalize">{matchType} Match</Label>
                        <Badge variant="outline">{selectedKeywords.length} keywords</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedKeywords.slice(0, 10).map((kw, idx) => (
                          <Badge key={idx} variant="secondary">
                            {matchType === 'broad' ? kw : matchType === 'phrase' ? `"${kw}"` : `[${kw}]`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );

        case 'funnel':
          // Funnel-Based
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Funnel Groups</CardTitle>
                <CardDescription>TOF/MOF/BOF intent grouping</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 'tof', label: 'Top of Funnel (TOF)', color: 'blue' },
                    { id: 'mof', label: 'Middle of Funnel (MOF)', color: 'purple' },
                    { id: 'bof', label: 'Bottom of Funnel (BOF)', color: 'green' }
                  ].map((funnel) => (
                    <div key={funnel.id} className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-800 mb-2">{funnel.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {funnelGroups[funnel.id]?.length === 0 ? (
                          <p className="text-slate-500 text-sm">Generate keywords to populate</p>
                        ) : (
                          funnelGroups[funnel.id]?.slice(0, 10).map((kw, idx) => (
                            <Badge key={idx} variant="secondary">{kw}</Badge>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );

        case 'brand_split':
          // Brand vs Non-Brand
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Brand vs Non-Brand</CardTitle>
                <CardDescription>Automatic brand detection and separation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Brand Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {brandKeywords.length === 0 ? (
                        <p className="text-slate-500 text-sm">No brand keywords detected</p>
                      ) : (
                        brandKeywords.map((kw, idx) => (
                          <Badge key={idx} className="bg-purple-100 text-purple-700">{kw}</Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Non-Brand Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {nonBrandKeywords.length === 0 ? (
                        <p className="text-slate-500 text-sm">Generate keywords to populate</p>
                      ) : (
                        nonBrandKeywords.map((kw, idx) => (
                          <Badge key={idx} variant="secondary">{kw}</Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );

        case 'competitor':
          // Competitor Campaigns
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Competitor Keywords</CardTitle>
                <CardDescription>Detected competitor brand queries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {competitorKeywords.length === 0 ? (
                    <p className="text-slate-500">No competitor keywords detected. Generate keywords to detect competitors.</p>
                  ) : (
                    competitorKeywords.map((kw, idx) => (
                      <Badge key={idx} className="bg-red-100 text-red-700">{kw}</Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );

        case 'ngram':
          // N-Gram Smart Cluster
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Smart Clusters</CardTitle>
                <CardDescription>ML-powered N-gram clustering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.keys(smartClusters).length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Network className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>Generate keywords to see smart clusters</p>
                    </div>
                  ) : (
                    Object.entries(smartClusters).map(([clusterName, keywords]) => (
                      <div key={clusterName} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-800 mb-2">{clusterName}</h4>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((kw, idx) => (
                            <Badge key={idx} variant="secondary">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );

        default:
          return null;
      }
    };

    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Keywords</h2>
          <p className="text-slate-600">Generate and organize keywords based on your structure: {STRUCTURE_TYPES.find(s => s.id === structureType)?.name}</p>
        </div>

        {commonKeywordSection}
        {renderStructureSpecificUI()}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(1)}>
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={() => {
              if (selectedKeywords.length === 0) {
                notifications.warning('Please generate and select at least one keyword', { 
                  title: 'Keywords Required',
                  description: 'You need to select keywords before proceeding to the next step.'
                });
                return;
              }
              setStep(3);
            }}
            disabled={selectedKeywords.length === 0}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Ads & Extensions <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  // Step 3: Ads & Extensions (Structure-based templates)
  const renderStep3 = () => {
    // Generate ads based on structure
    const generateAdsForStructure = () => {
      const baseAds: any[] = [];
      const mainKeyword = selectedKeywords[0] || 'your service';

      switch (structureType) {
        case 'alpha_beta':
          // Alpha: Hyper-specific, Beta: Broader
          baseAds.push({
            id: 1,
            type: 'rsa',
            headline1: `${mainKeyword} - Exact Match Solution`,
            headline2: 'Precision Targeting',
            headline3: 'Optimized Performance',
            description1: `Get the exact ${mainKeyword} solution you need.`,
            description2: 'Tailored for high-converting searches.',
            finalUrl: url
          });
          baseAds.push({
            id: 2,
            type: 'rsa',
            headline1: `Best ${mainKeyword} Options`,
            headline2: 'Compare & Choose',
            headline3: 'Multiple Solutions',
            description1: `Explore various ${mainKeyword} options.`,
            description2: 'Find the perfect fit for your needs.',
            finalUrl: url
          });
          break;

        case 'intent':
          // Intent-matched templates
          if (selectedIntents.includes('high_intent')) {
            baseAds.push({
              id: 1,
              type: 'rsa',
              headline1: `Need ${mainKeyword} Now?`,
              headline2: 'Immediate Solutions',
              headline3: 'Fast Response',
              description1: `Get ${mainKeyword} immediately.`,
              description2: 'Quick and reliable service.',
              finalUrl: url
            });
          }
          if (selectedIntents.includes('research')) {
            baseAds.push({
              id: 2,
              type: 'rsa',
              headline1: `Affordable ${mainKeyword} Info`,
              headline2: 'Compare Prices',
              headline3: 'Research Options',
              description1: `Learn about ${mainKeyword} pricing.`,
              description2: 'Make informed decisions.',
              finalUrl: url
            });
          }
          break;

        case 'competitor':
          // Competitor-avoiding ads
          baseAds.push({
            id: 1,
            type: 'rsa',
            headline1: `Better Than Your Current Provider`,
            headline2: 'Superior Solutions',
            headline3: 'Proven Results',
            description1: 'Switch to a better solution.',
            description2: 'Experience the difference.',
            finalUrl: url
          });
          break;

        case 'funnel':
          // Funnel-based ads
          baseAds.push({
            id: 1,
            type: 'rsa',
            headline1: `Learn About ${mainKeyword}`,
            headline2: 'Educational Resources',
            headline3: 'Expert Guides',
            description1: `Discover everything about ${mainKeyword}.`,
            description2: 'Start your journey here.',
            finalUrl: url
          });
          baseAds.push({
            id: 2,
            type: 'rsa',
            headline1: `Get ${mainKeyword} Today`,
            headline2: 'Call to Action',
            headline3: 'Limited Time Offer',
            description1: `Act now and get ${mainKeyword}.`,
            description2: 'Don\'t miss out!',
            finalUrl: url
          });
          break;

        default:
          // Standard RSA ads
          baseAds.push({
            id: 1,
            type: 'rsa',
            headline1: `${mainKeyword} - Best Deals`,
            headline2: 'Shop Now & Save',
            headline3: 'Fast Delivery',
            description1: `Looking for ${mainKeyword}? We offer competitive prices.`,
            description2: 'Get started today!',
            finalUrl: url
          });
      }

      setGeneratedAds(baseAds);
    };

    useEffect(() => {
      if (step === 3 && generatedAds.length === 0 && structureType && selectedKeywords.length > 0) {
        generateAdsForStructure();
      }
    }, [step, structureType, selectedKeywords.length]);

    // Create extension
    const createExtension = (extensionType: string) => {
      if (selectedKeywords.length === 0) {
        notifications.warning('Please select keywords first', { title: 'Keywords Required' });
        return;
      }

      const hasRegularAds = generatedAds.some(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
      if (!hasRegularAds) {
        notifications.info('Creating a default ad first, then adding your extension', {
          title: 'Ad Required',
          description: 'Extensions need to be attached to an ad.'
        });
        // Create a default ad
        const defaultAd = {
          id: Date.now(),
          type: 'rsa',
          headline1: `${selectedKeywords[0] || 'Your Service'} - Best Deals`,
          headline2: 'Shop Now & Save',
          headline3: 'Fast Delivery',
          description1: `Looking for ${selectedKeywords[0] || 'your service'}? We offer competitive prices.`,
          description2: 'Get started today!',
          finalUrl: url
        };
        setGeneratedAds([defaultAd]);
      }

      const mainKeyword = selectedKeywords[0] || 'your service';
      const extensionId = Date.now();
      let extension: any = {
        id: extensionId,
        type: 'extension',
        extensionType: extensionType,
        finalUrl: url
      };

      // Generate extension content based on type
      switch (extensionType) {
        case 'snippet':
          extension.header = 'Types';
          extension.values = selectedKeywords.slice(0, 4).map(kw => kw.split(' ')[0]);
          break;
        case 'callout':
          extension.values = [
            `Free ${mainKeyword} Consultation`,
            '24/7 Expert Support',
            'Best Price Guarantee',
            'Fast & Reliable Service'
          ];
          break;
        case 'sitelink':
          extension.links = [
            { text: 'Shop Now', description: 'Browse our collection', url: url || 'www.example.com/shop' },
            { text: 'About Us', description: 'Learn more about us', url: url || 'www.example.com/about' },
            { text: 'Contact', description: 'Get in touch', url: url || 'www.example.com/contact' },
            { text: 'Support', description: 'Customer support', url: url || 'www.example.com/support' }
          ];
          break;
        case 'call':
          extension.phone = '(555) 123-4567';
          extension.callTrackingEnabled = false;
          break;
        case 'price':
          extension.type = 'SERVICES';
          extension.priceQualifier = 'From';
          extension.price = '$99';
          extension.currency = 'USD';
          extension.unit = 'per service';
          break;
        case 'app':
          extension.appStore = 'GOOGLE_PLAY';
          extension.appId = 'com.example.app';
          extension.appLinkText = 'Download Now';
          break;
        case 'location':
          extension.businessName = 'Your Business Name';
          extension.addressLine1 = '123 Main St';
          extension.city = 'City';
          extension.state = 'State';
          extension.postalCode = '12345';
          extension.country = 'United States';
          extension.phone = '(555) 123-4567';
          break;
        case 'message':
          extension.messageText = 'Message us for quick answers';
          extension.businessName = 'Your Business';
          extension.phone = '(555) 123-4567';
          break;
        case 'leadform':
          extension.formName = 'Get Started';
          extension.formDescription = 'Fill out this form to get in touch';
          extension.formType = 'CONTACT';
          break;
        case 'promotion':
          extension.promotionText = 'Special Offer';
          extension.promotionDescription = 'Get 20% off your first order';
          extension.occasion = 'SALE';
          extension.startDate = new Date().toISOString().split('T')[0];
          extension.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'image':
          extension.imageUrl = 'https://via.placeholder.com/1200x628';
          extension.imageAltText = 'Product Image';
          extension.imageName = 'Product Showcase';
          break;
      }

      // Attach extension to first regular ad if exists, otherwise add as separate item
      const regularAds = generatedAds.filter(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
      if (regularAds.length > 0) {
        // Attach to first ad
        const updatedAds = generatedAds.map(ad => {
          if (ad.id === regularAds[0].id) {
            return {
              ...ad,
              extensions: [...(ad.extensions || []), extension]
            };
          }
          return ad;
        });
        setGeneratedAds(updatedAds);
      } else {
        // Add as separate extension item
        setGeneratedAds([...generatedAds, extension]);
      }

      notifications.success(`${extensionType.charAt(0).toUpperCase() + extensionType.slice(1)} extension added`, {
        title: 'Extension Created'
      });
    };

    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Ads & Extensions</h2>
          <p className="text-slate-600">Structure-optimized ad templates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Extension Buttons */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500 uppercase tracking-wide">EXTENSIONS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => createExtension('snippet')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> SNIPPET EXTENSION
                </Button>
                <Button 
                  onClick={() => createExtension('callout')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> CALLOUT EXTENSION
                </Button>
                <Button 
                  onClick={() => createExtension('sitelink')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> SITELINK EXTENSION
                </Button>
                <Button 
                  onClick={() => createExtension('call')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> CALL EXTENSION
                </Button>
                <Button 
                  onClick={() => createExtension('price')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> PRICE EXTENSION
                </Button>
                <Button 
                  onClick={() => createExtension('app')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> APP EXTENSION
                </Button>
                <Button 
                  onClick={() => createExtension('location')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> LOCATION EXTENSION
                </Button>
                <Button 
                  onClick={() => createExtension('message')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> MESSAGE EXTENSION
                </Button>
                <Button 
                  onClick={() => createExtension('leadform')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> LEAD FORM EXTENSION
                </Button>
                <Button 
                  onClick={() => createExtension('promotion')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> PROMOTION EXTENSION
                </Button>
                <Button 
                  onClick={() => createExtension('image')} 
                  disabled={selectedKeywords.length === 0} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> IMAGE EXTENSION
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Ads with Extensions */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Generated Ads</CardTitle>
                <CardDescription>Ads optimized for {STRUCTURE_TYPES.find(s => s.id === structureType)?.name} structure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedAds.map((ad) => (
                    <div key={ad.id} className="border border-slate-200 rounded-lg p-4">
                      {ad.type === 'extension' ? (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <Badge className="mb-2 bg-purple-100 text-purple-700">
                            {ad.extensionType?.charAt(0).toUpperCase() + ad.extensionType?.slice(1)} Extension
                          </Badge>
                          <LiveAdPreview ad={ad} />
                        </div>
                      ) : (
                        <>
                          <LiveAdPreview ad={ad} />
                          {ad.extensions && ad.extensions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <p className="text-xs text-slate-500 mb-2 font-semibold">EXTENSIONS</p>
                              {ad.extensions.map((ext: any, idx: number) => (
                                <div key={idx} className="bg-purple-50 p-3 rounded border border-purple-200 mb-2">
                                  <Badge className="mb-2 bg-purple-100 text-purple-700">
                                    {ext.extensionType?.charAt(0).toUpperCase() + ext.extensionType?.slice(1)} Extension
                                  </Badge>
                                  <LiveAdPreview ad={ext} />
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(2)}>
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={() => setStep(4)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
          >
            Next: Geo Target <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  // Step 4: Geo Targeting (Dynamic based on structure)
  const renderStep4 = () => {
    const isGeoSegmented = structureType === 'geo';
    
    // Calculate number of campaigns for GEO-Segmented structure
    const getCampaignCount = () => {
      if (!isGeoSegmented) return 1;
      if (geoType === 'STATE' && selectedStates.length > 0) return selectedStates.length;
      if (geoType === 'CITY' && selectedCities.length > 0) return selectedCities.length;
      if (geoType === 'ZIP' && selectedZips.length > 0) return selectedZips.length;
      return 0;
    };

    const campaignCount = getCampaignCount();
    const geoUnitName = geoType === 'STATE' ? 'states' : geoType === 'CITY' ? 'cities' : geoType === 'ZIP' ? 'ZIPs' : 'locations';
    const geoUnitCount = geoType === 'STATE' ? selectedStates.length : geoType === 'CITY' ? selectedCities.length : geoType === 'ZIP' ? selectedZips.length : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Geo Targeting</h2>
          <p className="text-slate-600">Select target locations</p>
        </div>

        {/* GEO-Segmented Structure Warning */}
        {isGeoSegmented && (
          <Card className="border-2 border-indigo-500 bg-indigo-50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-indigo-900 mb-2">GEO-Segmented Structure Selected</h3>
                  <p className="text-indigo-800 mb-3">
                    This structure creates multiple campaigns, not one.
                  </p>
                  {campaignCount > 0 ? (
                    <p className="text-lg font-bold text-indigo-900">
                      We will create <span className="text-indigo-600">{campaignCount}</span> campaign{campaignCount !== 1 ? 's' : ''}.
                    </p>
                  ) : (
                    <p className="text-indigo-700">
                      Select geo-units below to see campaign count.
                    </p>
                  )}
                  {campaignCount > 0 && (
                    <p className="text-sm text-indigo-700 mt-2">
                      {geoUnitCount} {geoUnitName} = {campaignCount} campaign{campaignCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Target Country</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={targetCountry} onValueChange={setTargetCountry}>
              <SelectTrigger className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Geo Type Selection */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Geo Segmentation Type</CardTitle>
            <CardDescription>Choose how to segment your geo targeting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'STANDARD', label: 'Standard', icon: Hash },
                { id: 'STATE', label: 'States', icon: MapPin },
                { id: 'CITY', label: 'Cities', icon: Layout },
                { id: 'ZIP', label: 'ZIPs', icon: Mail }
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = geoType === type.id;
                return (
                  <Card
                    key={type.id}
                    onClick={() => setGeoType(type.id as any)}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected 
                        ? 'border-2 border-indigo-500 bg-indigo-50' 
                        : 'border border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`} />
                      <p className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {type.label}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Geo Selection based on type */}
        {geoType === 'STATE' && (
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle>Select States</CardTitle>
              <CardDescription>Choose states to target (each state = 1 campaign for GEO-Segmented)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {['California', 'Texas', 'Florida', 'New York', 'Illinois'].map((state) => (
                  <div key={state} className="flex items-center space-x-2">
                    <Checkbox
                      id={`state-${state}`}
                      checked={selectedStates.includes(state)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStates([...selectedStates, state]);
                        } else {
                          setSelectedStates(selectedStates.filter(s => s !== state));
                        }
                      }}
                    />
                    <Label htmlFor={`state-${state}`} className="cursor-pointer">{state}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {geoType === 'CITY' && (
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle>Select Cities</CardTitle>
              <CardDescription>Choose cities to target (each city = 1 campaign for GEO-Segmented)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'].map((city) => (
                  <div key={city} className="flex items-center space-x-2">
                    <Checkbox
                      id={`city-${city}`}
                      checked={selectedCities.includes(city)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCities([...selectedCities, city]);
                        } else {
                          setSelectedCities(selectedCities.filter(c => c !== city));
                        }
                      }}
                    />
                    <Label htmlFor={`city-${city}`} className="cursor-pointer">{city}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {geoType === 'ZIP' && (
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle>Select ZIP Codes</CardTitle>
              <CardDescription>Enter ZIP codes (each ZIP = 1 campaign for GEO-Segmented)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={selectedZips.join('\n')}
                onChange={(e) => {
                  const zips = e.target.value.split('\n').filter(z => z.trim());
                  setSelectedZips(zips);
                }}
                placeholder="10001&#10;10002&#10;10003"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                Enter one ZIP code per line. {selectedZips.length > 0 && `${selectedZips.length} ZIP${selectedZips.length !== 1 ? 's' : ''} = ${selectedZips.length} campaign${selectedZips.length !== 1 ? 's' : ''}`}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(3)}>
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={() => setStep(5)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
          >
            Next: Review <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  // Step 5: Review
  const renderStep5 = () => {
    // Calculate number of campaigns
    const getCampaignCount = () => {
      if (structureType === 'geo') {
        if (geoType === 'STATE') return selectedStates.length || 1;
        if (geoType === 'CITY') return selectedCities.length || 1;
        if (geoType === 'ZIP') return selectedZips.length || 1;
        return 1;
      }
      return 1; // Single campaign for other structures
    };

    // Calculate number of ad groups
    const getAdGroupCount = () => {
      if (!structureType) return 0;
      
      switch (structureType) {
        case 'skag':
          return selectedKeywords.length;
        case 'stag':
        case 'mix':
          // Estimate: group keywords into ~5-10 groups
          return Math.ceil(selectedKeywords.length / 5);
        case 'stag_plus':
        case 'ngram':
          return Object.keys(smartClusters).length || Math.ceil(selectedKeywords.length / 5);
        case 'intent':
          return selectedIntents.length;
        case 'alpha_beta':
          return 2; // Alpha and Beta
        case 'match_type':
          return Object.values(matchTypes).filter(Boolean).length;
        case 'geo':
          return getCampaignCount(); // 1 ad group per campaign
        case 'funnel':
          return Object.keys(funnelGroups).filter(k => funnelGroups[k].length > 0).length;
        case 'brand_split':
          return 2; // Brand and Non-Brand
        case 'competitor':
          return competitorKeywords.length > 0 ? 1 : 0;
        default:
          return Math.ceil(selectedKeywords.length / 5);
      }
    };

    const campaignCount = getCampaignCount();
    const adGroupCount = getAdGroupCount();
    const structureName = STRUCTURE_TYPES.find(s => s.id === structureType)?.name || 'Not Selected';

    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Review Campaign</h2>
          <p className="text-slate-600">Review your campaign configuration</p>
        </div>

        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Campaign Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-xs text-slate-500 uppercase tracking-wide">Number of Campaigns</Label>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{campaignCount}</p>
                {structureType === 'geo' && (
                  <p className="text-xs text-slate-500 mt-1">
                    {geoType === 'STATE' && selectedStates.length > 0 && `${selectedStates.length} states`}
                    {geoType === 'CITY' && selectedCities.length > 0 && `${selectedCities.length} cities`}
                    {geoType === 'ZIP' && selectedZips.length > 0 && `${selectedZips.length} ZIPs`}
                  </p>
                )}
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-xs text-slate-500 uppercase tracking-wide">Number of Ad Groups</Label>
                <p className="text-3xl font-bold text-purple-600 mt-2">{adGroupCount}</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-xs text-slate-500 uppercase tracking-wide">Structure Type</Label>
                <p className="text-xl font-semibold text-slate-800 mt-2">{structureName}</p>
              </div>
            </div>
            
            <Separator />
            
            {/* Additional Details */}
            <div className="space-y-3">
              <div>
                <Label className="font-semibold text-slate-700">Campaign Name:</Label>
                <p className="text-slate-600">{campaignName || 'Not set'}</p>
              </div>
              <div>
                <Label className="font-semibold text-slate-700">Keywords:</Label>
                <p className="text-slate-600">{selectedKeywords.length} selected</p>
              </div>
              <div>
                <Label className="font-semibold text-slate-700">Ads:</Label>
                <p className="text-slate-600">{generatedAds.length} generated</p>
              </div>
              <div>
                <Label className="font-semibold text-slate-700">Target Country:</Label>
                <p className="text-slate-600">{targetCountry}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(4)}>
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={() => setStep(6)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
          >
            Next: Validate <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  // Step 6: Validate
  const renderStep6 = () => {
    const handleExportCSV = () => {
      if (!structureType || !campaignName || selectedKeywords.length === 0) {
        notifications.warning('Please complete all required fields', { title: 'Incomplete Campaign' });
        return;
      }

      // Prepare settings for structure generation
      const settings: StructureSettings = {
        structureType,
        campaignName,
        keywords: selectedKeywords,
        matchTypes,
        url,
        negativeKeywords: negativeKeywords.split('\n').filter(k => k.trim()),
        geoType,
        selectedStates,
        selectedCities,
        selectedZips,
        targetCountry,
        ads: generatedAds
          .filter(ad => ad.type !== 'extension') // Filter out standalone extensions
          .map(ad => ({
            type: ad.type || 'rsa',
            headline1: ad.headline1,
            headline2: ad.headline2,
            headline3: ad.headline3,
            headline4: ad.headline4,
            headline5: ad.headline5,
            description1: ad.description1,
            description2: ad.description2,
            final_url: ad.finalUrl || url,
            path1: ad.path1,
            path2: ad.path2,
            extensions: ad.extensions || [] // Include extensions attached to ads
          })),
        intentGroups,
        selectedIntents,
        alphaKeywords,
        betaKeywords,
        funnelGroups,
        brandKeywords,
        nonBrandKeywords,
        competitorKeywords,
        smartClusters
      };

      // Generate campaign structure
      const structure = generateCampaignStructure(selectedKeywords, settings);
      
      // Export to CSV
      const filename = `${campaignName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      exportCampaignToCSV(structure, filename);
      
      notifications.success('Campaign exported successfully!', { 
        title: 'Export Complete',
        description: `Generated ${structure.campaigns.length} campaign(s) with ${structure.campaigns.reduce((sum, c) => sum + c.adgroups.length, 0)} ad group(s)`
      });
    };

    // Validation checks
    const validations = [
      { check: !!campaignName, message: 'Campaign name is valid' },
      { check: !!structureType, message: 'Structure selected' },
      { check: selectedKeywords.length > 0, message: 'Keywords configured' },
      { check: generatedAds.length > 0, message: 'Ads generated' },
      { check: !!url, message: 'Landing page URL configured' }
    ];

    const allValid = validations.every(v => v.check);

    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Validate Campaign</h2>
          <p className="text-slate-600">Validate your campaign before export</p>
        </div>

        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validations.map((validation, idx) => (
                <div key={idx} className={`flex items-center gap-2 ${validation.check ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.check ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{validation.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(5)}>
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={handleExportCSV}
            disabled={!allValid}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="mr-2 w-5 h-5" />
            Export CSV
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      {renderStepIndicator()}
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}
    </div>
  );
};

