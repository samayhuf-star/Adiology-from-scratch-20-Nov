import { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, DollarSign, Activity, Calendar, Zap, 
  Clock, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight,
  Sparkles, Package, Target, FileText, BarChart3, Globe, FolderOpen, Layers
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { supabase } from '../utils/supabase/client';
import { historyService } from '../utils/historyService';
import { getUserPublishedWebsites } from '../utils/publishedWebsites';

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

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

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

        // Get published websites
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
      } catch (error) {
        console.error('Error fetching user resources:', error);
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
      <div className="p-8">
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
      id: 'csv-validator-2',
      title: 'Validate CSV',
      description: 'Check your campaign files',
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-gradient-text mb-1">
            Welcome back, {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-sm text-slate-600">Here's what's happening with your campaigns today.</p>
        </div>
        <Button
          onClick={() => onNavigate('builder-2')}
          className="theme-button-primary shadow-lg hover:shadow-xl transition-all"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Subscription Card */}
        <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group p-6">
          <div className={`absolute inset-0 bg-gradient-to-br ${getPlanColor(stats?.subscription.plan || 'free')} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(stats?.subscription.plan || 'free')} flex items-center justify-center shadow-lg`}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <Badge className={getPlanBadgeColor(stats?.subscription.plan || 'free')}>
                {(stats?.subscription.plan || 'free').charAt(0).toUpperCase() + (stats?.subscription.plan || 'free').slice(1)}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Your Plan</h3>
            <p className="text-sm text-slate-600">
              {stats?.subscription.status === 'active' ? 'Active' : stats?.subscription.status}
              {stats?.subscription.periodEnd && (
                <span className="block mt-1">Renews {formatDate(stats.subscription.periodEnd)}</span>
              )}
            </p>
          </div>
        </Card>

        {/* API Usage Card */}
        <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-medium">Active</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              {stats?.usage.apiCalls.toLocaleString() || 0}
            </h3>
            <p className="text-sm text-slate-600">API Calls (30 days)</p>
          </div>
        </Card>

        {/* Campaigns Card */}
        <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-300">
                Total
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              {stats?.usage.campaigns.toLocaleString() || 0}
            </h3>
            <p className="text-sm text-slate-600">Campaigns Created</p>
          </div>
        </Card>

        {/* Keywords Card */}
        <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                Generated
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              {stats?.usage.keywords.toLocaleString() || 0}
            </h3>
            <p className="text-sm text-slate-600">Keywords Generated</p>
          </div>
        </Card>
      </div>

      {/* My Resources */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-indigo-600" />
          My Resources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* My Campaigns */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                  Total
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                {(stats?.userResources?.myCampaigns || 0).toLocaleString()}
              </h3>
              <p className="text-sm text-slate-600">My Campaigns</p>
            </div>
          </Card>

          {/* My Websites */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  Published
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                {(stats?.userResources?.myWebsites || 0).toLocaleString()}
              </h3>
              <p className="text-sm text-slate-600">My Websites</p>
            </div>
          </Card>

          {/* My Presets */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                  Saved
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                {(stats?.userResources?.myPresets || 0).toLocaleString()}
              </h3>
              <p className="text-sm text-slate-600">My Presets</p>
            </div>
          </Card>

          {/* My Domains */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                  Active
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                {(stats?.userResources?.myDomains || 0).toLocaleString()}
              </h3>
              <p className="text-sm text-slate-600">My Domains</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-indigo-200"
                onClick={() => onNavigate(action.id)}
              >
                <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${action.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">{action.title}</h3>
                <p className="text-sm text-slate-600">{action.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Recent Activity
        </h2>
        <Card className="border-2 p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 8).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {activity.action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </p>
                      {activity.resourceType && (
                        <p className="text-sm text-slate-600 mt-0.5">
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
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No recent activity</h3>
              <p className="text-sm text-slate-500 mb-6">
                Start creating campaigns to see your activity here
              </p>
              <Button
                onClick={() => onNavigate('builder-2')}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create First Campaign
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Last Login */}
        <Card className="border-2 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Last Login</p>
              <p className="text-base font-semibold text-slate-800 mt-0.5">
                {formatRelativeTime(stats?.activity.lastLogin || null)}
              </p>
            </div>
          </div>
        </Card>

        {/* Total Actions */}
        <Card className="border-2 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Actions (Recent)</p>
              <p className="text-base font-semibold text-slate-800 mt-0.5">
                {stats?.activity.totalActions || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

