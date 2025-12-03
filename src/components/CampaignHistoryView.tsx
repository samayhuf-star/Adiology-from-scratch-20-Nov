import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, Eye, Trash2, Search, AlertCircle,
  CheckCircle2, Download, FolderOpen, Plus, Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { historyService } from '../utils/historyService';
import { notifications } from '../utils/notifications';

// Structure types mapping
const STRUCTURE_TYPES = [
  { id: 'skag', name: 'SKAG' },
  { id: 'stag', name: 'STAG' },
  { id: 'mix', name: 'MIX' },
  { id: 'stag_plus', name: 'STAG Plus' },
  { id: 'intent', name: 'Intent-Based' },
  { id: 'alpha_beta', name: 'Alpha/Beta' },
  { id: 'match_type', name: 'Match Type Split' },
  { id: 'funnel', name: 'Funnel-Based' },
  { id: 'brand_split', name: 'Brand Split' },
  { id: 'competitor', name: 'Competitor-Based' },
  { id: 'ngram', name: 'N-Gram' }
];

interface CampaignHistoryViewProps {
  onLoadCampaign: (data: any) => void;
}

interface SavedCampaign {
  id: string;
  name: string;
  timestamp: string;
  data: any;
  status?: 'draft' | 'completed' | 'in_progress';
}

export const CampaignHistoryView: React.FC<CampaignHistoryViewProps> = ({ onLoadCampaign }) => {
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedCampaigns();
  }, []);

  const loadSavedCampaigns = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const allHistory = await historyService.getAll();
      
      // Debug: Log all history items to see what we have
      console.log('📋 All history items:', allHistory);
      console.log('📋 History items count:', allHistory.length);
      
      // Filter only campaign types - check multiple possible type names
      const campaigns = allHistory.filter(item => {
        const type = (item.type || '').toLowerCase();
        const matches = type === 'builder-2-campaign' || 
               type === 'campaign' ||
               type === 'builder-2' ||
               type.includes('campaign') ||
               type.includes('builder');
        
        // Debug: Log filtering results
        if (allHistory.length > 0) {
          console.log(`🔍 Filtering item: type="${item.type}" (normalized: "${type}"), matches=${matches}`);
        }
        
        return matches;
      }).map(item => ({
        id: item.id,
        name: item.name,
        timestamp: item.timestamp,
        data: item.data,
        status: item.status || 'completed'
      }));

      console.log('✅ Filtered campaigns:', campaigns);
      console.log('✅ Campaign count:', campaigns.length);

      // Sort by timestamp (newest first)
      campaigns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setSavedCampaigns(campaigns);
    } catch (error) {
      console.error('Failed to load saved campaigns', error);
      setError(error instanceof Error ? error.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await historyService.delete(id);
      setSavedCampaigns(savedCampaigns.filter(c => c.id !== id));
      notifications.success('Campaign deleted successfully', { title: 'Deleted' });
    } catch (error) {
      console.error('Failed to delete campaign', error);
      notifications.error('Failed to delete campaign', { title: 'Error' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">In Progress</Badge>;
      case 'draft':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-300">Draft</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300">Unknown</Badge>;
    }
  };

  const getStepLabel = (stepNum: number) => {
    const steps = ['Setup', 'Keywords', 'Ads & Extensions', 'Geo Target', 'Review', 'Validate'];
    return steps[stepNum - 1] || 'Unknown';
  };

  const filteredCampaigns = savedCampaigns.filter(campaign => {
    const name = campaign.name || campaign.data?.campaignName || '';
    const structure = campaign.data?.structureType || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           structure.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Campaign History
          </h1>
          <p className="text-slate-600">
            View and manage your saved campaigns. Continue where you left off or start a new one.
          </p>
        </div>

        {/* Search */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-white border-slate-200"
              />
            </div>
            {!loading && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">{filteredCampaigns.length}</span> {filteredCampaigns.length === 1 ? 'campaign' : 'campaigns'} found
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaigns List */}
        {loading ? (
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading campaigns...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500 opacity-50" />
              <p className="font-semibold mb-2 text-red-600">Failed to load campaigns</p>
              <p className="text-sm text-slate-500 mb-4">{error}</p>
              <Button onClick={loadSavedCampaigns} className="bg-indigo-600 hover:bg-indigo-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredCampaigns.length === 0 ? (
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Saved Campaigns</h3>
              <p className="text-slate-500 mb-6">
                {searchQuery ? `No campaigns match "${searchQuery}"` : 'Start creating a campaign and it will be automatically saved here.'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => {
                    // Navigate to campaign builder
                    window.location.hash = '#builder-2';
                    window.location.reload();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              const data = campaign.data || campaign;
              const status = campaign.status || data.status || 'completed';
              const stepNum = data.step || 1;
              const timestamp = new Date(campaign.timestamp || data.timestamp);
              const campaignName = campaign.name || data.campaignName || 'Unnamed Campaign';
              
              // Extract base name and remove "(Draft - DATE)" or "(Completed - DATE)" from title
              const baseName = campaignName.replace(/\s*\(Draft\s*-\s*[^)]+\)/gi, '').replace(/\s*\(Completed\s*-\s*[^)]+\)/gi, '');
              const isDraft = /\(Draft\s*-/i.test(campaignName);
              
              return (
                <Card 
                  key={campaign.id} 
                  className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all flex flex-col overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <CardTitle 
                          className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 mb-2 break-words" 
                          title={campaignName}
                        >
                          {baseName}
                        </CardTitle>
                      </div>
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusBadge(status)}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-xs sm:text-sm">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate text-slate-500">{timestamp.toLocaleString('en-GB', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center justify-between text-sm gap-2">
                        <span className="text-slate-500 flex-shrink-0">Structure:</span>
                        <span className="font-medium text-slate-700 truncate text-right" title={STRUCTURE_TYPES.find(s => s.id === data.structureType)?.name || 'Not Selected'}>
                          {STRUCTURE_TYPES.find(s => s.id === data.structureType)?.name || 'Not Selected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm gap-2">
                        <span className="text-slate-500 flex-shrink-0">Current Step:</span>
                        <span className="font-medium text-slate-700 truncate text-right" title={getStepLabel(stepNum)}>
                          {getStepLabel(stepNum)}
                        </span>
                      </div>
                      {data.selectedKeywords && data.selectedKeywords.length > 0 && (
                        <div className="flex items-center justify-between text-sm gap-2">
                          <span className="text-slate-500 flex-shrink-0">Keywords:</span>
                          <span className="font-medium text-slate-700">{data.selectedKeywords.length}</span>
                        </div>
                      )}
                      {data.generatedAds && data.generatedAds.length > 0 && (
                        <div className="flex items-center justify-between text-sm gap-2">
                          <span className="text-slate-500 flex-shrink-0">Ads:</span>
                          <span className="font-medium text-slate-700">{data.generatedAds.length}</span>
                        </div>
                      )}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex gap-2 pt-1">
                      <Button 
                        onClick={() => onLoadCampaign(data)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white min-w-0"
                      >
                        <Eye className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">Continue</span>
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => deleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 px-3"
                        title="Delete campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

