import React, { useState } from 'react';
import {
  Users, DollarSign, Activity, Server, Flag, FileText, BarChart3, 
  Shield, FileSearch, Settings, Search, Bell, Home, ChevronRight,
  UserPlus, UserMinus, Ban, Key, Eye, TrendingUp, AlertCircle,
  CheckCircle, Clock, CreditCard, Zap, Database, Globe, Mail,
  Code, Webhook, Lock, Download, Upload, RefreshCw, Play, Pause,
  Inbox, Filter
} from 'lucide-react';

interface SuperAdminPanelProps {
  onBackToLanding: () => void;
}

type Module = 
  | 'overview'
  | 'users'
  | 'billing'
  | 'usage'
  | 'health'
  | 'features'
  | 'content'
  | 'analytics'
  | 'audit'
  | 'support'
  | 'config';

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onBackToLanding }) => {
  const [activeModule, setActiveModule] = useState<Module>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const modules = [
    { id: 'overview' as Module, label: 'Overview', icon: Home, color: 'from-blue-500 to-cyan-500' },
    { id: 'users' as Module, label: 'Users & Accounts', icon: Users, color: 'from-purple-500 to-pink-500' },
    { id: 'billing' as Module, label: 'Billing & Subscriptions', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { id: 'usage' as Module, label: 'Usage & Limits', icon: Activity, color: 'from-orange-500 to-red-500' },
    { id: 'health' as Module, label: 'System Health', icon: Server, color: 'from-indigo-500 to-purple-500' },
    { id: 'features' as Module, label: 'Feature Flags', icon: Flag, color: 'from-teal-500 to-cyan-500' },
    { id: 'content' as Module, label: 'Content Management', icon: FileText, color: 'from-amber-500 to-orange-500' },
    { id: 'analytics' as Module, label: 'Analytics & Reports', icon: BarChart3, color: 'from-pink-500 to-rose-500' },
    { id: 'audit' as Module, label: 'Audit Logs', icon: FileSearch, color: 'from-slate-500 to-gray-600' },
    { id: 'support' as Module, label: 'Support Tools', icon: Shield, color: 'from-emerald-500 to-green-600' },
    { id: 'config' as Module, label: 'Configuration', icon: Settings, color: 'from-violet-500 to-purple-600' },
  ];

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'overview':
        return <OverviewModule />;
      case 'users':
        return <UsersModule />;
      case 'billing':
        return <BillingModule />;
      case 'usage':
        return <UsageModule />;
      case 'health':
        return <HealthModule />;
      case 'features':
        return <FeaturesModule />;
      case 'content':
        return <ContentModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'audit':
        return <AuditModule />;
      case 'support':
        return <SupportModule />;
      case 'config':
        return <ConfigModule />;
      default:
        return <OverviewModule />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Super Admin</h2>
              <p className="text-xs text-slate-500">System Control Panel</p>
            </div>
          </div>
          <button
            onClick={onBackToLanding}
            className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Portal
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? `bg-gradient-to-r ${module.color} text-white shadow-lg`
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-500'}`} />
                <span className="font-medium text-sm">{module.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users, logs, settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium shadow-lg">
              SA
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
};

// ===== MODULE COMPONENTS =====

const OverviewModule = () => (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
      System Overview
    </h1>

    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <EmptyMetricCard icon={Users} label="Total Users" color="from-purple-500 to-pink-500" />
      <EmptyMetricCard icon={DollarSign} label="MRR" color="from-green-500 to-emerald-500" />
      <EmptyMetricCard icon={Activity} label="Active Sessions" color="from-blue-500 to-cyan-500" />
      <EmptyMetricCard icon={Server} label="System Health" color="from-indigo-500 to-purple-500" />
    </div>

    {/* Recent Activity */}
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Recent System Activity</h2>
      <EmptyState icon={Activity} message="No recent activity" />
    </div>
  </div>
);

const UsersModule = () => (
  <div>
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Users & Accounts
      </h1>
      <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
        <UserPlus className="w-4 h-4" />
        Add User
      </button>
    </div>

    {/* Search & Filters */}
    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/60 shadow-lg mb-6 flex items-center gap-4">
      <input
        type="text"
        placeholder="Search users by email, name, or ID..."
        className="flex-1 px-4 py-2 bg-slate-50 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
        Search
      </button>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <ActionCard icon={Eye} label="Impersonate User" color="from-blue-500 to-cyan-500" />
      <ActionCard icon={Ban} label="Suspend Account" color="from-red-500 to-pink-500" />
      <ActionCard icon={Key} label="Reset Password" color="from-green-500 to-emerald-500" />
      <ActionCard icon={UserMinus} label="Delete User" color="from-orange-500 to-red-500" />
    </div>

    {/* Users Table */}
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium">User</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Plan</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Joined</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Last Active</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-6 py-12">
                <EmptyState icon={Users} message="No users found" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const BillingModule = () => (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-8">
      Billing & Subscriptions
    </h1>

    {/* Revenue Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <EmptyMetricCard icon={DollarSign} label="MRR" color="from-green-500 to-emerald-500" />
      <EmptyMetricCard icon={TrendingUp} label="ARR" color="from-blue-500 to-cyan-500" />
      <EmptyMetricCard icon={CreditCard} label="Active Subscriptions" color="from-purple-500 to-pink-500" />
      <EmptyMetricCard icon={AlertCircle} label="Failed Payments" color="from-red-500 to-orange-500" />
    </div>

    {/* Plan Distribution & Transactions */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Plan Distribution</h2>
        <EmptyState icon={BarChart3} message="No subscription data" />
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Transactions</h2>
        <EmptyState icon={CreditCard} message="No recent transactions" />
      </div>
    </div>
  </div>
);

const UsageModule = () => (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-8">
      Usage & Limits
    </h1>

    {/* Usage Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <EmptyMetricCard icon={Zap} label="API Calls Today" color="from-orange-500 to-red-500" />
      <EmptyMetricCard icon={Database} label="Storage Used" color="from-purple-500 to-pink-500" />
      <EmptyMetricCard icon={Globe} label="Bandwidth" color="from-blue-500 to-cyan-500" />
    </div>

    {/* Top Consumers */}
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Top API Consumers (Last 24h)</h2>
      <EmptyState icon={Activity} message="No usage data available" />
    </div>
  </div>
);

const HealthModule = () => (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
      System Health
    </h1>

    {/* System Status */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatusCard label="API Server" status="unknown" uptime="--" color="gray" />
      <StatusCard label="Database" status="unknown" uptime="--" color="gray" />
      <StatusCard label="Job Queue" status="unknown" uptime="--" color="gray" />
      <StatusCard label="Third-party APIs" status="unknown" uptime="--" color="gray" />
    </div>

    {/* Error Rates & Incidents */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Error Rates (Last Hour)</h2>
        <EmptyState icon={AlertCircle} message="No error data" />
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Incidents</h2>
        <EmptyState icon={Server} message="No incidents reported" />
      </div>
    </div>
  </div>
);

const FeaturesModule = () => (
  <div>
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
        Feature Flags
      </h1>
      <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg">
        <Flag className="w-4 h-4" />
        New Flag
      </button>
    </div>

    {/* Feature Flags List */}
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
      <EmptyState icon={Flag} message="No feature flags configured" />
    </div>
  </div>
);

const ContentModule = () => (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-8">
      Content Management
    </h1>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Email Templates */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Email Templates</h2>
          <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors">
            + New
          </button>
        </div>
        <EmptyState icon={Mail} message="No email templates" />
      </div>

      {/* System Announcements */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Announcements</h2>
          <button className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
            + New
          </button>
        </div>
        <EmptyState icon={Bell} message="No announcements" />
      </div>
    </div>
  </div>
);

const AnalyticsModule = () => (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-8">
      Analytics & Reports
    </h1>

    {/* Key Analytics */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <EmptyMetricCard icon={UserPlus} label="Signups (30d)" color="from-pink-500 to-rose-500" />
      <EmptyMetricCard icon={TrendingUp} label="Conversions" color="from-purple-500 to-pink-500" />
      <EmptyMetricCard icon={Activity} label="Retention" color="from-blue-500 to-cyan-500" />
      <EmptyMetricCard icon={DollarSign} label="ARPU" color="from-green-500 to-emerald-500" />
    </div>

    {/* Exportable Reports */}
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Exportable Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportCard name="User Growth Report" description="Monthly signup and churn analysis" />
        <ReportCard name="Revenue Report" description="MRR, ARR, and payment trends" />
        <ReportCard name="Feature Adoption" description="Usage metrics by feature" />
        <ReportCard name="Cohort Analysis" description="User retention by cohort" />
      </div>
    </div>
  </div>
);

const AuditModule = () => (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent mb-8">
      Audit Logs
    </h1>

    {/* Filters */}
    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/60 shadow-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select className="px-4 py-2 bg-slate-50 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-slate-500">
          <option>All Events</option>
          <option>User Actions</option>
          <option>Admin Actions</option>
          <option>System Events</option>
        </select>
        <select className="px-4 py-2 bg-slate-50 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-slate-500">
          <option>All Users</option>
          <option>Admins Only</option>
          <option>System Only</option>
        </select>
        <input
          type="date"
          className="px-4 py-2 bg-slate-50 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <button className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
          <Filter className="w-4 h-4" />
          Apply Filters
        </button>
      </div>
    </div>

    {/* Audit Log Table */}
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-500 to-gray-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium">Timestamp</th>
              <th className="px-6 py-4 text-left text-sm font-medium">User</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Action</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Resource</th>
              <th className="px-6 py-4 text-left text-sm font-medium">IP Address</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-6 py-12">
                <EmptyState icon={FileSearch} message="No audit logs found" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const SupportModule = () => (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-8">
      Support Tools
    </h1>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <ActionCard icon={Eye} label="Impersonate User" color="from-blue-500 to-cyan-500" />
      <ActionCard icon={RefreshCw} label="Reset User Cache" color="from-purple-500 to-pink-500" />
      <ActionCard icon={Key} label="Generate API Key" color="from-green-500 to-emerald-500" />
    </div>

    {/* Recent Tickets */}
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Support Tickets</h2>
      <EmptyState icon={Inbox} message="No support tickets" />
    </div>
  </div>
);

const ConfigModule = () => (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-8">
      Configuration
    </h1>

    <div className="space-y-6">
      {/* Pricing Plans */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Pricing Plans</h2>
        <EmptyState icon={DollarSign} message="No pricing plans configured" />
      </div>

      {/* Global Limits */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Global Limits & Quotas</h2>
        <EmptyState icon={Activity} message="No limits configured" />
      </div>

      {/* Integrations */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Third-party Integrations</h2>
        <EmptyState icon={Webhook} message="No integrations connected" />
      </div>
    </div>
  </div>
);

// ===== UTILITY COMPONENTS =====

interface EmptyMetricCardProps {
  icon: React.ElementType;
  label: string;
  color: string;
}

const EmptyMetricCard: React.FC<EmptyMetricCardProps> = ({ icon: Icon, label, color }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="text-sm text-slate-600 mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-400">--</p>
  </div>
);

interface ActionCardProps {
  icon: React.ElementType;
  label: string;
  color: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, label, color }) => (
  <button className={`p-4 bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group`}>
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <span className="font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
  </button>
);

interface StatusCardProps {
  label: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  uptime: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
}

const StatusCard: React.FC<StatusCardProps> = ({ label, status, uptime, color }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-lg">
    <div className="flex items-center justify-between mb-3">
      <span className="font-medium text-slate-700">{label}</span>
      <div className={`w-3 h-3 rounded-full ${
        color === 'green' ? 'bg-green-500' :
        color === 'yellow' ? 'bg-yellow-500' : 
        color === 'red' ? 'bg-red-500' : 'bg-gray-400'
      }`}></div>
    </div>
    <p className={`text-sm font-medium mb-1 ${
      color === 'green' ? 'text-green-600' :
      color === 'yellow' ? 'text-yellow-600' : 
      color === 'red' ? 'text-red-600' : 'text-gray-600'
    }`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </p>
    <p className="text-xs text-slate-500">Uptime: {uptime}</p>
  </div>
);

interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, message }) => (
  <div className="text-center py-12">
    <Icon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
    <p className="text-slate-500">{message}</p>
  </div>
);

interface ReportCardProps {
  name: string;
  description: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ name, description }) => (
  <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-medium text-slate-800">{name}</h3>
      <Download className="w-4 h-4 text-pink-500" />
    </div>
    <p className="text-sm text-slate-600 mb-3">{description}</p>
    <button className="w-full px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-sm hover:shadow-lg transition-all">
      Export CSV
    </button>
  </div>
);
