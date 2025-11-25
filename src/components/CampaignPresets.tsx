import React, { useState } from 'react';
import { Search, Download, Edit, ExternalLink, CheckCircle, Package, Sparkles, Zap, TrendingUp, X } from 'lucide-react';
import { campaignPresets, CampaignPreset } from '../data/campaignPresets';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LandingPageTemplate } from './LandingPageTemplate';

interface CampaignPresetsProps {
  onLoadPreset: (presetData: any) => void;
}

export const CampaignPresets: React.FC<CampaignPresetsProps> = ({ onLoadPreset }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<CampaignPreset | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showLandingPagePreview, setShowLandingPagePreview] = useState(false);

  const filteredPresets = campaignPresets.filter(preset =>
    preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preset.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPreset = (preset: CampaignPreset) => {
    setSelectedPreset(preset);
    setShowReview(true);
  };

  const handleLoadToBuilder = () => {
    if (!selectedPreset) return;

    // Bug_58, Bug_59, Bug_70: Transform preset data to match CampaignBuilder format with all required fields
    const keywordObjects = selectedPreset.keywords.map((kw, idx) => ({
      id: `preset-kw-${idx}`,
      text: kw,
      volume: 'High',
      cpc: `$${selectedPreset.max_cpc.toFixed(2)}`,
      type: 'Phrase',
      selected: true
    }));

    // Convert preset ads to generatedAds format (array of ad objects)
    const generatedAdsFromPreset = selectedPreset.ad_groups.map((group, groupIdx) => ({
      id: Date.now() + groupIdx,
      adGroup: group.name,
      type: 'rsa',
      headline1: selectedPreset.ads[0]?.headline1 || '',
      headline2: selectedPreset.ads[0]?.headline2 || '',
      headline3: selectedPreset.ads[0]?.headline3 || '',
      description1: selectedPreset.ads[0]?.description1 || '',
      description2: selectedPreset.ads[0]?.description2 || '',
      finalUrl: selectedPreset.final_url || '',
      path1: '',
      path2: ''
    }));

    const presetData = {
      name: selectedPreset.campaign_name,
      step: 1, // Start at step 1 to ensure all data loads properly, user can navigate
      structure: 'SKAG', // Default structure
      geo: 'ZIP', // Default geo strategy
      matchTypes: { broad: true, phrase: true, exact: true }, // All match types enabled
      url: selectedPreset.final_url || '', // Landing page URL
      seedKeywords: selectedPreset.keywords.join('\n'), // Seed keywords for display
      negativeKeywords: selectedPreset.negative_keywords.join('\n'), // Negative keywords
      keywords: keywordObjects, // Full keyword objects
      generatedKeywords: keywordObjects, // Generated keywords (same as keywords for presets)
      selectedKeywords: selectedPreset.keywords, // Selected keyword texts
      ads: {
        rsa: {
          headline1: selectedPreset.ads[0]?.headline1 || '',
          headline2: selectedPreset.ads[0]?.headline2 || '',
          headline3: selectedPreset.ads[0]?.headline3 || '',
          description1: selectedPreset.ads[0]?.description1 || '',
          description2: selectedPreset.ads[0]?.description2 || ''
        },
        dki: {
          headline1: '{Keyword:Service}',
          headline2: '',
          headline3: '',
          description1: '',
          description2: '',
          path1: '',
          path2: ''
        },
        call: {
          phone: '',
          businessName: '',
          headline1: '',
          headline2: '',
          description1: '',
          description2: ''
        }
      },
      generatedAds: generatedAdsFromPreset, // Convert ads to generatedAds array format
      enabledAdTypes: ['rsa'],
      targetCountry: 'United States',
      targetType: 'ZIP',
      manualGeoInput: '',
      adGroups: selectedPreset.ad_groups.map(g => g.name),
      maxCpc: selectedPreset.max_cpc,
      dailyBudget: selectedPreset.daily_budget
    };

    onLoadPreset(presetData);
  };

  const handleExportCSV = () => {
    if (!selectedPreset) return;

    const rows: string[] = [];
    
    // Header row
    const headers = [
      'Campaign',
      'Ad group',
      'Criterion',
      'Type',
      'Max CPC',
      'Status',
      'Final URL',
      'Headline 1',
      'Headline 2',
      'Headline 3',
      'Description 1',
      'Description 2',
      'Path 1',
      'Path 2'
    ];
    rows.push(headers.join(','));

    // Generate rows for each keyword with match types
    selectedPreset.keywords.forEach(keyword => {
      const exactCount = Math.ceil(selectedPreset.match_distribution.exact * 1);
      const phraseCount = Math.ceil(selectedPreset.match_distribution.phrase * 1);
      const broadCount = Math.ceil(selectedPreset.match_distribution.broad_mod * 1);

      // Exact match
      if (exactCount > 0) {
        const row = [
          selectedPreset.campaign_name,
          selectedPreset.ad_groups[0].name, // Default to first ad group
          `[${keyword}]`,
          'Exact',
          selectedPreset.max_cpc.toString(),
          'Active',
          selectedPreset.final_url,
          selectedPreset.ads[0].headline1,
          selectedPreset.ads[0].headline2,
          selectedPreset.ads[0].headline3,
          selectedPreset.ads[0].description1,
          selectedPreset.ads[0].description2,
          '',
          ''
        ];
        rows.push(row.map(cell => {
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(','));
      }

      // Phrase match
      if (phraseCount > 0) {
        const row = [
          selectedPreset.campaign_name,
          selectedPreset.ad_groups[0].name,
          `"${keyword}"`,
          'Phrase',
          selectedPreset.max_cpc.toString(),
          'Active',
          selectedPreset.final_url,
          selectedPreset.ads[0].headline1,
          selectedPreset.ads[0].headline2,
          selectedPreset.ads[0].headline3,
          selectedPreset.ads[0].description1,
          selectedPreset.ads[0].description2,
          '',
          ''
        ];
        rows.push(row.map(cell => {
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(','));
      }

      // Broad modified match
      if (broadCount > 0) {
        const row = [
          selectedPreset.campaign_name,
          selectedPreset.ad_groups[0].name,
          `+${keyword.split(' ').join(' +')}`,
          'Broad Modified',
          selectedPreset.max_cpc.toString(),
          'Active',
          selectedPreset.final_url,
          selectedPreset.ads[0].headline1,
          selectedPreset.ads[0].headline2,
          selectedPreset.ads[0].headline3,
          selectedPreset.ads[0].description1,
          selectedPreset.ads[0].description2,
          '',
          ''
        ];
        rows.push(row.map(cell => {
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(','));
      }
    });

    // Download CSV
    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPreset.slug}-google-ads-export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (showReview && selectedPreset) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Review Preset: {selectedPreset.title}</h1>
            <p className="text-slate-600">Review and customize your campaign before exporting</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowReview(false);
              setSelectedPreset(null);
            }}
          >
            Back to Presets
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">Campaign Name</label>
                  <p className="text-slate-900 mt-1">{selectedPreset.campaign_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Ad Groups</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPreset.ad_groups.map((group, idx) => (
                      <Badge key={idx} variant="secondary">{group.name}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Max CPC</label>
                    <p className="text-slate-900 mt-1">${selectedPreset.max_cpc.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Daily Budget</label>
                    <p className="text-slate-900 mt-1">${selectedPreset.daily_budget}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Keywords ({selectedPreset.keywords.length})</h2>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {selectedPreset.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Negative Keywords */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Negative Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {selectedPreset.negative_keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="destructive" className="text-sm">
                    -{keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ad Copy */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Ad Copy</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Headlines</label>
                  <div className="mt-2 space-y-2">
                    <p className="text-slate-900 font-medium">{selectedPreset.ads[0].headline1}</p>
                    <p className="text-slate-900 font-medium">{selectedPreset.ads[0].headline2}</p>
                    <p className="text-slate-900 font-medium">{selectedPreset.ads[0].headline3}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Descriptions</label>
                  <div className="mt-2 space-y-2">
                    <p className="text-slate-600">{selectedPreset.ads[0].description1}</p>
                    <p className="text-slate-600">{selectedPreset.ads[0].description2}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Bug_69: Ensure all buttons are visible by removing overflow constraints */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Ready to Launch</h3>
              <p className="text-sm text-indigo-100 mb-6">
                This preset is optimized for high-intent pay-per-call campaigns. Review the details and export when ready.
              </p>
              <div className="space-y-3 flex flex-col">
                <Button
                  onClick={handleLoadToBuilder}
                  className="w-full bg-white text-black hover:bg-gray-100 flex-shrink-0"
                  size="lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit in Campaign Builder
                </Button>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="w-full border-white bg-white text-black hover:bg-gray-100 flex-shrink-0"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                {/* Bug_60, Bug_75: Fix Preview Landing Page button */}
                <Button
                  onClick={() => {
                    if (selectedPreset) {
                      // If landing page URL exists, open it in a new tab
                      if (selectedPreset.landing_page_url) {
                        window.open(selectedPreset.landing_page_url, '_blank');
                      } else {
                        // Fallback to the old preview component
                        setShowLandingPagePreview(true);
                        setShowReview(false);
                      }
                    }
                  }}
                  variant="outline"
                  className="w-full border-white bg-white text-black hover:bg-gray-100 flex-shrink-0"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview Landing Page
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold mb-3">Preset Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Keywords:</span>
                  <span className="font-medium">{selectedPreset.keywords.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ad Groups:</span>
                  <span className="font-medium">{selectedPreset.ad_groups.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Negative Keywords:</span>
                  <span className="font-medium">{selectedPreset.negative_keywords.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Match Distribution:</span>
                  <span className="font-medium">
                    {Math.round(selectedPreset.match_distribution.exact * 100)}% Exact,{' '}
                    {Math.round(selectedPreset.match_distribution.phrase * 100)}% Phrase,{' '}
                    {Math.round(selectedPreset.match_distribution.broad_mod * 100)}% Broad
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bug_60, Bug_75: Fix Preview Landing Page rendering
  if (showLandingPagePreview && selectedPreset) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10 shadow-sm">
          <h2 className="text-xl font-semibold">Landing Page Preview: {selectedPreset.title}</h2>
          <div className="flex gap-2">
            {selectedPreset.final_url && (
              <Button
                variant="outline"
                onClick={() => window.open(selectedPreset.final_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setShowLandingPagePreview(false);
                setShowReview(true);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Close Preview
            </Button>
          </div>
        </div>
        <div className="w-full">
          <LandingPageTemplate preset={selectedPreset} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Campaign Presets</h1>
            <p className="text-slate-600 mt-1">Plug-and-play Google Ads campaigns for high-intent home services</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {/* Bug_68: Cross icon to reset search box */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPresets.map((preset) => (
          <div
            key={preset.slug}
            className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => handleSelectPreset(preset)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                    {preset.title}
                  </h3>
                  <p className="text-sm text-slate-500">{preset.campaign_name}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:from-indigo-500 group-hover:to-purple-600 transition-all">
                  <TrendingUp className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Sparkles className="w-4 h-4" />
                  <span>{preset.keywords.length} keywords</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Zap className="w-4 h-4" />
                  <span>{preset.ad_groups.length} ad groups</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>${preset.max_cpc.toFixed(2)} max CPC</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {preset.ad_groups.slice(0, 2).map((group, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {group.name}
                  </Badge>
                ))}
                {preset.ad_groups.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{preset.ad_groups.length - 2} more
                  </Badge>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPreset(preset);
                }}
              >
                Use Preset
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No presets found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

