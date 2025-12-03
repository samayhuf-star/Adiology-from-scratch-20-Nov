import { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, DollarSign, Activity, Calendar, Zap, 
  Clock, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight,
  Sparkles, Package, Target, FileText, BarChart3, Globe, FolderOpen, Layers,
  Plus, Minus, Type, Palette, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { supabase } from '../utils/supabase/client';
import { historyService } from '../utils/historyService';
import { getUserPublishedWebsites } from '../utils/publishedWebsites';
import { getUserPreferences, saveUserPreferences, initializeUserPreferences } from '../utils/userPreferences';
import { COLOR_COMBINATIONS, ColorCombination } from '../utils/colorCombinations';
import { 
  useScreenSize, 
  getResponsiveGridCols, 
  getResponsiveGap, 
  getResponsiveIconSize, 
  getResponsiveFontSize,
  getResponsivePadding
} from '../utils/responsive';

interface DashboardProps {
  user: any;
  onNavigate: (tab: string) => void;
}

interface UserStats {
  subscription: {
    plan: string;
    status: string;
    periodEnd: string | null;
  };
  usage: {
    apiCalls: number;
    campaigns: number;
    keywords: number;
  };
  activity: {
    lastLogin: string | null;
    totalActions: number;
  };
  userResources: {
    myCampaigns: number;
    myWebsites: number;
    myPresets: number;
    myDomains: number;
    myNegativeKeywords: number;
  };
}

interface RecentActivity {
  id: string;
  action: string;
  timestamp: string;
  resourceType: string;
  metadata: any;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState(getUserPreferences());
  const [showColorThemeMenu, setShowColorThemeMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const screenSize = useScreenSize();

  useEffect(() => {
    fetchDashboardData();
    initializeUserPreferences();
  }, [user]);

  useEffect(() => {
    // Apply preferences when they change
    saveUserPreferences(preferences);
  }, [preferences]);

  // Close color theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showColorThemeMenu && !target.closest('[data-color-theme-menu]')) {
        setShowColorThemeMenu(false);
      }
    };

    if (showColorThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorThemeMenu]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleColorPickerClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showColorPicker && !target.closest('[data-color-picker]') && !target.closest('[data-color-theme-menu]')) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleColorPickerClickOutside);
      return () => document.removeEventListener('mousedown', handleColorPickerClickOutside);
    }
  }, [showColorPicker]);

  const handleSpacingChange = (increase: boolean) => {
    const spacingOptions = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    const currentIndex = spacingOptions.indexOf(preferences.spacing);
    let newIndex = currentIndex;
    
    if (increase && currentIndex < spacingOptions.length - 1) {
      newIndex = currentIndex + 1;
    } else if (!increase && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    
    setPreferences({ ...preferences, spacing: spacingOptions[newIndex] });
  };

  const handleFontSizeChange = (increase: boolean) => {
    const fontSizeOptions = [0.875, 1.0, 1.125, 1.25, 1.375, 1.5];
    const currentIndex = fontSizeOptions.indexOf(preferences.fontSize);
    let newIndex = currentIndex;
    
    if (increase && currentIndex < fontSizeOptions.length - 1) {
      newIndex = currentIndex + 1;
    } else if (!increase && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    
    setPreferences({ ...preferences, fontSize: fontSizeOptions[newIndex] });
  };

  const handleColorThemeChange = (theme: 'default' | 'blue' | 'green' | 'custom') => {
    if (theme === 'custom') {
      setShowColorPicker(true);
      setShowColorThemeMenu(false);
    } else {
      const updatedPrefs = { ...preferences, colorTheme: theme, customColor: undefined, colorCombination: undefined };
      setPreferences(updatedPrefs);
      saveUserPreferences(updatedPrefs);
      setShowColorThemeMenu(false);
      setShowColorPicker(false);
    }
  };

  const handleColorCombinationChange = (combinationId: string) => {
    const updatedPrefs = { 
      ...preferences, 
      colorTheme: combinationId as any, 
      colorCombination: combinationId,
      customColor: undefined 
    };
    setPreferences(updatedPrefs);
    saveUserPreferences(updatedPrefs);
    setShowColorThemeMenu(false);
    setShowColorPicker(false);
  };

  const handleCustomColorChange = (color: string) => {
    const updatedPrefs = { ...preferences, colorTheme: 'custom', customColor: color, colorCombination: undefined };
    setPreferences(updatedPrefs);
    saveUserPreferences(updatedPrefs);
    setShowColorPicker(false);
    setShowColorThemeMenu(false);
  };

  const handleSidebarAutoCloseToggle = () => {
    const updatedPrefs = { ...preferences, sidebarAutoClose: !preferences.sidebarAutoClose };
    setPreferences(updatedPrefs);
    saveUserPreferences(updatedPrefs);
  };

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user subscription data
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;

      // Fetch usage metrics
      const { data: usageData } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch recent audit logs
      const { data: activityData } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Process usage metrics
      const apiCalls = usageData?.find(m => m.metric_type === 'api_calls')?.metric_value || 0;
      const campaigns = usageData?.find(m => m.metric_type === 'campaigns')?.metric_value || 0;
      const keywords = usageData?.find(m => m.metric_type === 'keywords')?.metric_value || 0;

      // Fetch user-specific resources
      let myCampaigns = 0;
      let myWebsites = 0;
      let myPresets = 0;
      let myDomains = 0;
      let myNegativeKeywords = 0;

      try {
        // Get campaigns from history
        const allHistory = await historyService.getAll();
        myCampaigns = allHistory.filter(item => 
          item.type === 'builder-2-campaign' || 
          item.type === 'campaign' ||
          item.type?.includes('campaign')
        ).length;

        // Get saved templates/presets from history
        myPresets = allHistory.filter(item => 
          item.type === 'website-template' || 
          item.type === 'campaign-preset' ||
          item.type?.includes('preset') ||
          item.type?.includes('template')
        ).length;

        // Get saved negative keywords from history
        myNegativeKeywords = allHistory.filter(item => 
          item.type === 'negative-keywords' ||
          item.type?.includes('negative')
        ).length;

        // Get published websites (gracefully handle missing table)
        try {
          const websites = await getUserPublishedWebsites(user.id);
          myWebsites = websites.length;
          
          // Domains - count unique domains from published websites
          const uniqueDomains = new Set(
            websites
              .map(w => {
                try {
                  const url = new URL(w.vercel_url || '');
                  return url.hostname.replace('www.', '');
                } catch {
                  return null;
                }
              })
              .filter(Boolean)
          );
          myDomains = uniqueDomains.size;
        } catch (websiteError: any) {
          // Silently handle published websites errors (table might not exist)
          // Don't log any errors - expected when table doesn't exist
          myWebsites = 0;
          myDomains = 0;
        }
      } catch (error: any) {
        // Silently handle all errors - expected when tables/endpoints don't exist
        // Continue with 0 counts if there's an error
      }

      setStats({
        subscription: {
          plan: user.subscription_plan || 'free',
          status: user.subscription_status || 'active',
          periodEnd: subscription?.current_period_end || null,
        },
        usage: {
          apiCalls: Number(apiCalls),
          campaigns: Number(campaigns),
          keywords: Number(keywords),
        },
        activity: {
          lastLogin: user.last_login_at || null,
          totalActions: activityData?.length || 0,
        },
        userResources: {
          myCampaigns,
          myWebsites,
          myPresets,
          myDomains,
          myNegativeKeywords,
        },
      });

      setRecentActivity(activityData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise':
        return 'from-purple-500 to-pink-500';
      case 'professional':
        return 'from-blue-500 to-cyan-500';
      case 'starter':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-slate-500 to-gray-500';
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'professional':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'starter':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <CheckCircle2 className="w-4 h-4" />;
    if (action.includes('export')) return <FileText className="w-4 h-4" />;
    if (action.includes('generate')) return <Sparkles className="w-4 h-4" />;
    if (action.includes('validate')) return <CheckCircle2 className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'text-green-600 bg-green-50';
    if (action.includes('export')) return 'text-blue-600 bg-blue-50';
    if (action.includes('generate')) return 'text-purple-600 bg-purple-50';
    if (action.includes('validate')) return 'text-emerald-600 bg-emerald-50';
    return 'text-slate-600 bg-slate-50';
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      id: 'builder-2',
      title: 'Create Campaign',
      description: 'Build a new campaign with AI',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      id: 'campaign-presets',
      title: 'Use Preset',
      description: 'Start from a template',
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'keyword-planner',
      title: 'Plan Keywords',
      description: 'Research and generate keywords',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      id: 'csv-validator-3',
      title: 'Validate CSV',
      description: 'Check your campaign files',
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="dashboard-modern-theme p-8 sm:p-10 lg:p-12 space-y-12" style={{
      '--user-spacing-multiplier': preferences.spacing,
      '--user-font-size-multiplier': preferences.fontSize
    } as React.CSSProperties}>
      {/* Header with Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold theme-gradient-text">
              Welcome back, {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-base text-slate-600">Here's what's happening with your campaigns today.</p>
          </div>
          <Button
            onClick={() => onNavigate('builder-2')}
            className="theme-button-primary shadow-lg hover:shadow-xl transition-all px-6 py-3"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* User Preference Controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Spacing:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSpacingChange(false)}
              disabled={preferences.spacing <= 0.75}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-slate-900 min-w-[3rem] text-center">
              {Math.round(preferences.spacing * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSpacingChange(true)}
              disabled={preferences.spacing >= 2.0}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-300"></div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Font Size:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFontSizeChange(false)}
              disabled={preferences.fontSize <= 0.875}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-slate-900 min-w-[3rem] text-center">
              {Math.round(preferences.fontSize * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFontSizeChange(true)}
              disabled={preferences.fontSize >= 1.5}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-300"></div>

          <div className="flex items-center gap-2 relative" data-color-theme-menu data-color-picker>
            <span className="text-sm font-medium text-slate-700">Color Theme:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorThemeMenu(!showColorThemeMenu)}
              className="h-8 px-3 gap-2"
            >
              <Palette className="w-4 h-4" />
              <span className="capitalize text-xs">
                {preferences.colorCombination 
                  ? COLOR_COMBINATIONS.find(c => c.id === preferences.colorCombination)?.name || 
                    (COLOR_COMBINATIONS.find(c => c.id === preferences.colorTheme)?.name) ||
                    'Custom'
                  : COLOR_COMBINATIONS.find(c => c.id === preferences.colorTheme)?.name ||
                    (preferences.colorTheme === 'custom' ? 'Custom' : 
                     preferences.colorTheme === 'default' ? 'Default' :
                     preferences.colorTheme.charAt(0).toUpperCase() + preferences.colorTheme.slice(1))}
              </span>
            </Button>
            {showColorThemeMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-[100] min-w-[320px] max-w-[400px] p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-3 px-2">Preset Themes</div>
                <div className="grid grid-cols-1 gap-2 mb-3">
                  <button
                    onClick={() => handleColorThemeChange('default')}
                    className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-3 border-2 ${
                      preferences.colorTheme === 'default' && !preferences.colorCombination
                        ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
                        : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex gap-1 shrink-0">
                      <div className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: '#4f46e5' }}></div>
                      <div className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: '#9333ea' }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${preferences.colorTheme === 'default' && !preferences.colorCombination ? 'text-slate-900' : 'text-slate-700'}`}>
                        Default (Indigo/Purple)
                      </div>
                      <div className="text-xs text-slate-500">Classic indigo and purple theme</div>
                    </div>
                    {preferences.colorTheme === 'default' && !preferences.colorCombination && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                  <button
                    onClick={() => handleColorThemeChange('blue')}
                    className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-3 border-2 ${
                      preferences.colorTheme === 'blue' && !preferences.colorCombination
                        ? 'bg-blue-50 border-blue-300 shadow-sm' 
                        : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex gap-1 shrink-0">
                      <div className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: '#2563eb' }}></div>
                      <div className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: '#0ea5e9' }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${preferences.colorTheme === 'blue' && !preferences.colorCombination ? 'text-slate-900' : 'text-slate-700'}`}>
                        Blue Theme
                      </div>
                      <div className="text-xs text-slate-500">Fresh and trustworthy blue tones</div>
                    </div>
                    {preferences.colorTheme === 'blue' && !preferences.colorCombination && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                  <button
                    onClick={() => handleColorThemeChange('green')}
                    className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-3 border-2 ${
                      preferences.colorTheme === 'green' && !preferences.colorCombination
                        ? 'bg-emerald-50 border-emerald-300 shadow-sm' 
                        : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex gap-1 shrink-0">
                      <div className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: '#059669' }}></div>
                      <div className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: '#10b981' }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${preferences.colorTheme === 'green' && !preferences.colorCombination ? 'text-slate-900' : 'text-slate-700'}`}>
                        Green Theme
                      </div>
                      <div className="text-xs text-slate-500">Natural and refreshing green tones</div>
                    </div>
                    {preferences.colorTheme === 'green' && !preferences.colorCombination && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                </div>
                <div className="border-t border-slate-200 my-2"></div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-3 px-2">Color Combinations</div>
                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                  {COLOR_COMBINATIONS.map((combo) => {
                    const isSelected = preferences.colorCombination === combo.id || 
                                     (preferences.colorTheme === combo.id);
                    return (
                      <button
                        key={combo.id}
                        onClick={() => handleColorCombinationChange(combo.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-3 border-2 ${
                          isSelected 
                            ? 'bg-slate-50 border-slate-300 shadow-sm' 
                            : 'border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className="flex gap-1 shrink-0">
                          <div 
                            className="w-6 h-6 rounded border border-slate-300" 
                            style={{ backgroundColor: combo.primary }}
                          ></div>
                          <div 
                            className="w-6 h-6 rounded border border-slate-300" 
                            style={{ backgroundColor: combo.secondary }}
                          ></div>
                          {combo.tertiary && (
                            <div 
                              className="w-6 h-6 rounded border border-slate-300" 
                              style={{ backgroundColor: combo.tertiary }}
                            ></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                            {combo.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{combo.description}</div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: combo.primary }} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-slate-200 my-2"></div>
                <button
                  onClick={() => handleColorThemeChange('custom')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3 ${
                    preferences.colorTheme === 'custom' ? 'bg-purple-50 text-purple-700' : 'text-slate-700'
                  }`}
                >
                  <div 
                    className="w-12 h-6 rounded border-2 border-slate-300 flex gap-0.5 p-0.5" 
                    style={{ 
                      backgroundColor: preferences.customColor || '#6366f1',
                    }}
                  >
                    <div 
                      className="flex-1 rounded" 
                      style={{ backgroundColor: preferences.customColor || '#6366f1' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">Custom Color</span>
                </button>
              </div>
            )}
            {showColorPicker && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-[110] p-4 min-w-[250px]">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 block">Choose Custom Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={preferences.customColor || '#6366f1'}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        const updatedPrefs = { ...preferences, colorTheme: 'custom', customColor: newColor, colorCombination: undefined };
                        setPreferences(updatedPrefs);
                        saveUserPreferences(updatedPrefs);
                      }}
                      className="w-16 h-10 rounded border-2 border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={preferences.customColor || '#6366f1'}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
                          const updatedPrefs = { ...preferences, colorTheme: 'custom', customColor: newColor, colorCombination: undefined };
                          setPreferences(updatedPrefs);
                          saveUserPreferences(updatedPrefs);
                        }
                      }}
                      placeholder="#6366f1"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setShowColorPicker(false);
                        setShowColorThemeMenu(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Done
                    </Button>
                    <Button
                      onClick={() => {
                        const updatedPrefs = { ...preferences, colorTheme: 'default', customColor: undefined, colorCombination: undefined };
                        setPreferences(updatedPrefs);
                        saveUserPreferences(updatedPrefs);
                        setShowColorPicker(false);
                        setShowColorThemeMenu(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-300"></div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Auto-Close Sidebar:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSidebarAutoCloseToggle}
              className={`h-8 px-3 gap-2 ${
                preferences.sidebarAutoClose 
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                  : 'bg-slate-50 border-slate-300 text-slate-600'
              }`}
            >
              {preferences.sidebarAutoClose ? (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  <span>ON</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4" />
                  <span>OFF</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* My Resources */}
      <div className="space-y-6">
        <h2 className={`${getResponsiveFontSize(screenSize, 'lg')} font-semibold text-slate-800 flex items-center gap-3`}>
          <FolderOpen className={`${getResponsiveIconSize(screenSize)} text-indigo-600`} />
          My Resources
        </h2>
        <div className={`grid ${getResponsiveGridCols(screenSize)} ${getResponsiveGap(screenSize)}`}>
          {/* My Campaigns */}
          <Card 
            className={`relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group cursor-pointer ${getResponsivePadding(screenSize)}`}
            onClick={() => onNavigate('builder-2')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div className={`${screenSize.isMobile ? 'w-10 h-10' : screenSize.isTablet ? 'w-12 h-12' : 'w-14 h-14'} rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg`}>
                  <Layers className={`${getResponsiveIconSize(screenSize)} text-white`} />
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-purple-300 px-3 py-1">
                  Total
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-800">
                  {(stats?.userResources?.myCampaigns || 0).toLocaleString()}
                </h3>
                <p className="text-base text-slate-600">My Campaigns</p>
              </div>
            </div>
          </Card>

          {/* My Presets */}
          <Card 
            className={`relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group cursor-pointer ${getResponsivePadding(screenSize)}`}
            onClick={() => onNavigate('campaign-presets')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 px-3 py-1">
                  Saved
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-800">
                  {(stats?.userResources?.myPresets || 0).toLocaleString()}
                </h3>
                <p className="text-base text-slate-600">My Presets</p>
              </div>
            </div>
          </Card>

          {/* Negative Keywords Builder */}
          <Card 
            className={`relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group cursor-pointer ${getResponsivePadding(screenSize)}`}
            onClick={() => onNavigate('negative-keywords')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-300 px-3 py-1">
                  Saved
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-800">
                  {(stats?.userResources?.myNegativeKeywords || 0).toLocaleString()}
                </h3>
                <p className="text-base text-slate-600">Negative Keywords Builder</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-indigo-200"
                onClick={() => onNavigate(action.id)}
              >
                <div className="space-y-5">
                  <div className={`w-14 h-14 rounded-xl ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${action.iconColor}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-800">{action.title}</h3>
                    <p className="text-base text-slate-600">{action.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <Card className="border-2 p-8">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.slice(0, 8).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-base text-slate-800">
                        {activity.action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </p>
                      {activity.resourceType && (
                        <p className="text-sm text-slate-600">
                          {activity.resourceType.charAt(0).toUpperCase() + activity.resourceType.slice(1)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 shrink-0">
                    {formatRelativeTime(activity.timestamp || activity.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <AlertCircle className="w-20 h-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-slate-600 mb-3">No recent activity</h3>
              <p className="text-base text-slate-500 mb-8">
                Start creating campaigns to see your activity here
              </p>
              <Button
                onClick={() => onNavigate('builder-2')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create First Campaign
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Last Login */}
        <Card className="border-2 p-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-base text-slate-600">Last Login</p>
              <p className="text-lg font-semibold text-slate-800">
                {formatRelativeTime(stats?.activity.lastLogin || null)}
              </p>
            </div>
          </div>
        </Card>

        {/* Total Actions */}
        <Card className="border-2 p-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-base text-slate-600">Total Actions (Recent)</p>
              <p className="text-lg font-semibold text-slate-800">
                {stats?.activity.totalActions || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

