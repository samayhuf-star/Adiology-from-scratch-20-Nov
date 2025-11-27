import React, { useState, useEffect } from 'react';
import {
  Users, DollarSign, Activity, Server, Flag, FileText, BarChart3, 
  Shield, FileSearch, Settings, Search, Bell, Home, ChevronRight,
  UserPlus, UserMinus, Ban, Key, Eye, TrendingUp, AlertCircle,
  CheckCircle, Clock, CreditCard, Zap, Database, Globe, Mail,
  Code, Webhook, Lock, Download, Upload, RefreshCw, Play, Pause,
  Inbox, Filter, X, TestTube, CheckCircle2, Palette
} from 'lucide-react';
import { CrazyKeywordsBuilder } from './CrazyKeywordsBuilder';
import { adminApi } from '../utils/api/admin';
import { lambdaTestApi, type LambdaTestBuild, type LambdaTestSession } from '../utils/api/lambdatest';
import { notifications } from '../utils/notifications';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentAuthUser } from '../utils/auth';
import { themes } from '../utils/themes';

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
  | 'config'
  | 'testing'
  | 'crazy-keywords'
  | 'themes';

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
    { id: 'testing' as Module, label: 'LambdaTest Results', icon: TestTube, color: 'from-orange-500 to-red-500' },
    { id: 'crazy-keywords' as Module, label: 'Crazy Keywords Builder', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { id: 'themes' as Module, label: 'Theme Settings', icon: Palette, color: 'from-indigo-500 to-purple-600' },
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
      case 'testing':
        return <TestingModule />;
      case 'crazy-keywords':
        return <CrazyKeywordsBuilder />;
      case 'themes':
        return <ThemeSettingsModule />;
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
              <h2 className="font-bold text-slate-800">Adiology</h2>
              <p className="text-xs text-slate-500">~ Samay</p>
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

const OverviewModule = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOverview();
      setStats(data);
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
      System Overview
    </h1>

    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          icon={Users} 
          label="Total Users" 
          value={loading ? '--' : (stats?.totalUsers || 0)} 
          color="from-purple-500 to-pink-500" 
        />
        <MetricCard 
          icon={DollarSign} 
          label="Active Subscriptions" 
          value={loading ? '--' : (stats?.activeSubscriptions || 0)} 
          color="from-green-500 to-emerald-500" 
        />
        <MetricCard 
          icon={UserPlus} 
          label="Recent Signups (30d)" 
          value={loading ? '--' : (stats?.recentSignups || 0)} 
          color="from-blue-500 to-cyan-500" 
        />
        <MetricCard 
          icon={Server} 
          label="System Health" 
          value={loading ? '--' : (stats?.systemHealth?.length > 0 ? 'Operational' : 'Unknown')} 
          color="from-indigo-500 to-purple-500" 
        />
    </div>

    {/* Recent Activity */}
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Recent System Activity</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : (
      <EmptyState icon={Activity} message="No recent activity" />
        )}
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="text-sm text-slate-600 mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const UsersModule = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', subscription_plan: 'free' });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await adminApi.getUsers({ 
        search: searchQuery || undefined, 
        page, 
        limit: 50 
      });
      setUsers(result.users || []);
      setPagination(result.pagination || { total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminApi.deleteUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      notifications.error('Failed to delete user', {
        title: 'Delete Failed'
      });
    }
  };

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    try {
      await adminApi.updateUser(userId, { 
        subscription_status: suspend ? 'suspended' : 'active' 
      });
      loadUsers();
    } catch (error: any) {
      console.error('Error suspending user:', error);
      notifications.error(error.message || 'Failed to update user status. Backend API required.', {
        title: 'Update Failed'
      });
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      notifications.warning('Please fill in email and password', {
        title: 'Required Fields'
      });
      return;
    }

    try {
      setAddingUser(true);
      await adminApi.createUser({
        email: newUser.email,
        password: newUser.password,
        full_name: newUser.full_name,
        subscription_plan: newUser.subscription_plan,
      });
      setShowAddUserDialog(false);
      setNewUser({ email: '', password: '', full_name: '', subscription_plan: 'free' });
      loadUsers();
      notifications.success('User created successfully!', {
        title: 'User Created'
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      notifications.error(error.message || 'Failed to create user. Backend API required.', {
        title: 'Creation Failed'
      });
    } finally {
      setAddingUser(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Generate password reset link for this user?')) return;
    
    try {
      const result = await adminApi.resetPassword(userId);
      if (result.link) {
        notifications.success(`Password reset link: ${result.link}`, {
          title: 'Reset Link Generated',
          duration: 10000
        });
      } else {
        notifications.info('Password reset initiated. Check backend logs for the reset link.', {
          title: 'Reset Initiated'
        });
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      notifications.error(error.message || 'Failed to reset password. Backend API required.', {
        title: 'Reset Failed'
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
  <div>
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Users & Accounts
      </h1>
      <button 
        onClick={() => setShowAddUserDialog(true)}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
      >
        <UserPlus className="w-4 h-4" />
        Add User
      </button>
    </div>

    {/* Search & Filters */}
    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/60 shadow-lg mb-6 flex items-center gap-4">
      <input
        type="text"
        placeholder="Search users by email, name, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        className="flex-1 px-4 py-2 bg-slate-50 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
        <button 
          onClick={handleSearch}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
        Search
      </button>
    </div>

    {/* Quick Actions - Info only, actions are in table */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-slate-700">Click user row to impersonate</span>
        </div>
      </div>
      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center gap-3">
          <Ban className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-slate-700">Use suspend button in table</span>
        </div>
      </div>
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-slate-700">Reset via user actions</span>
        </div>
      </div>
      <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
        <div className="flex items-center gap-3">
          <UserMinus className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-medium text-slate-700">Delete via user actions</span>
        </div>
      </div>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
                      <span className="ml-2 text-slate-600">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12">
                <EmptyState icon={Users} message="No users found" />
              </td>
            </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {user.subscription_plan || 'free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.subscription_status === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : user.subscription_status === 'suspended'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.subscription_status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(user.last_login_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSuspendUser(user.id, user.subscription_status !== 'suspended')}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title={user.subscription_status === 'suspended' ? 'Activate' : 'Suspend'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                          title="Delete"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, pagination.total)} of {pagination.total} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 bg-purple-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>

    {/* Add User Dialog */}
    <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. Note: Backend API is required for this functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="user@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              type="text"
              value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="plan">Subscription Plan</Label>
            <Select value={newUser.subscription_plan} onValueChange={(value) => setNewUser({ ...newUser, subscription_plan: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddUser}
            disabled={addingUser}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            {addingUser ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);
};

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

const AuditModule = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', userId: '' });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const result = await adminApi.getAuditLogs({ 
        action: filters.action || undefined,
        userId: filters.userId || undefined,
        page: 1,
        limit: 100
      });
      setLogs(result.logs || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent mb-8">
      Audit Logs
    </h1>

    {/* Filters */}
    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/60 shadow-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select 
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2 bg-slate-50 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="">All Events</option>
            <option value="update_user">User Actions</option>
            <option value="delete_user">Admin Actions</option>
            <option value="system">System Events</option>
        </select>
          <input
            type="text"
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            className="px-4 py-2 bg-slate-50 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        <input
          type="date"
          className="px-4 py-2 bg-slate-50 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
          <button 
            onClick={loadLogs}
            className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
          >
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-slate-500 mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12">
                <EmptyState icon={FileSearch} message="No audit logs found" />
              </td>
            </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.users?.email || log.user_id || 'System'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.resource_type} {log.resource_id ? `(${log.resource_id.substring(0, 8)}...)` : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                      {log.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Success
                      </span>
                    </td>
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
};

const SupportModule = () => (
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-8">
      Support Tools
    </h1>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <ActionCard icon={Eye} label="Impersonate User" color="from-blue-500 to-cyan-500" />
      <ActionCard icon={RefreshCw} label="Reset User Cache" color="from-purple-500 to-pink-500" />
    </div>

    {/* Recent Tickets */}
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Support Tickets</h2>
      <EmptyState icon={Inbox} message="No support tickets" />
    </div>
  </div>
);

const TestingModule = () => {
  const [builds, setBuilds] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuild, setSelectedBuild] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [consoleLogs, setConsoleLogs] = useState<any[]>([]);

  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    try {
      setLoading(true);
      const buildsData = await lambdaTestApi.getBuilds({ limit: 50 });
      setBuilds(buildsData.data || []);
      
      const sessionsData = await lambdaTestApi.getAllSessions({ limit: 100 });
      setSessions(sessionsData.data || []);
    } catch (error) {
      console.error('Error loading test results:', error);
      setBuilds([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerTest = async (type: 'selenium' | 'cypress' | 'playwright' | 'puppeteer' | 'k6') => {
    try {
      const result = await lambdaTestApi.triggerTest(type);
      notifications.success(result.message || `Test triggered for ${type}. Check LambdaTest dashboard for execution.`, {
        title: 'Test Triggered'
      });
      setTimeout(() => {
        loadTestResults();
      }, 2000);
    } catch (error: any) {
      notifications.error(`Failed to trigger test: ${error.message}`, {
        title: 'Test Trigger Failed'
      });
    }
  };

  const handleViewBuildDetails = async (buildId: string) => {
    try {
      const details = await lambdaTestApi.getBuildDetails(buildId);
      const buildSessions = await lambdaTestApi.getBuildSessions(buildId);
      setSelectedBuild(buildId);
      setSessions(buildSessions.data || []);
    } catch (error) {
      console.error('Error loading build details:', error);
    }
  };

  const handleViewSessionDetails = async (sessionId: string) => {
    try {
      const details = await lambdaTestApi.getSessionDetails(sessionId);
      const logs = await lambdaTestApi.getSessionConsoleLogs(sessionId);
      setSelectedSession(sessionId);
      setSessionDetails(details);
      setConsoleLogs(logs.data || []);
    } catch (error) {
      console.error('Error loading session details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'passed':
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'running':
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'timeout':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const testTypes = [
    { id: 'selenium', label: 'Selenium Testing' },
    { id: 'cypress', label: 'Cypress Testing' },
    { id: 'playwright', label: 'Playwright Testing' },
    { id: 'puppeteer', label: 'Puppeteer Testing' },
    { id: 'k6', label: 'K6 Testing' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          LambdaTest Results
        </h1>
        <Button onClick={loadTestResults} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Test Type Selection */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Trigger Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {testTypes.map((test) => (
            <button
              key={test.id}
              onClick={() => handleTriggerTest(test.id as any)}
              className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg flex flex-col items-center gap-2"
            >
              <TestTube className="w-8 h-8 text-orange-600" />
              <span className="font-medium text-slate-700 text-sm">{test.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Builds List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl mb-6">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Recent Builds ({builds.length})</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-slate-600">Loading test results...</p>
            </div>
          ) : builds.length === 0 ? (
            <div className="p-12 text-center">
              <TestTube className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No builds found. Trigger a test to see results.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">Build ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Start Time</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Tests</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {builds.map((build: any) => (
                  <tr key={build.build_id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      {build.build_id?.substring(0, 12) || 'N/A'}...
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {build.name || 'Unnamed Build'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(build.status)}`}>
                        {build.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {build.duration ? `${Math.round(build.duration / 1000)}s` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {build.start_time ? new Date(build.start_time).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {build.test_count ? `${build.passed || 0}/${build.test_count}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        onClick={() => handleViewBuildDetails(build.build_id)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Sessions List */}
      {selectedBuild && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl mb-6">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Build Sessions ({sessions.length})</h2>
            <Button onClick={() => setSelectedBuild(null)} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">Session ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Browser/OS</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Test Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session: any) => (
                  <tr key={session.session_id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      {session.session_id?.substring(0, 12) || 'N/A'}...
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {session.name || 'Unnamed Session'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {session.browser || 'N/A'} / {session.os || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {session.test_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {session.duration ? `${Math.round(session.duration / 1000)}s` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        onClick={() => handleViewSessionDetails(session.session_id)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && sessionDetails && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl mb-6">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Session Details</h2>
            <Button onClick={() => { setSelectedSession(null); setSessionDetails(null); setConsoleLogs([]); }} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500">Session ID</Label>
                <p className="text-sm font-mono text-slate-800">{sessionDetails.session_id || selectedSession}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Status</Label>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sessionDetails.status)}`}>
                  {sessionDetails.status}
                </span>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Browser</Label>
                <p className="text-sm text-slate-800">{sessionDetails.browser || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">OS</Label>
                <p className="text-sm text-slate-800">{sessionDetails.os || 'N/A'}</p>
              </div>
            </div>

            {/* Console Logs */}
            {consoleLogs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Console Logs</h3>
                <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {consoleLogs.map((log: any, idx: number) => (
                    <div key={idx} className="text-xs font-mono text-green-400 mb-1">
                      <span className="text-slate-500">[{log.timestamp || 'N/A'}]</span>{' '}
                      <span className={log.level === 'error' ? 'text-red-400' : 'text-green-400'}>
                        {log.message || log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ThemeSettingsModule = () => {
  const { theme, setTheme, availableThemes } = useTheme();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const user = await getCurrentAuthUser();
        if (user && user.email) {
          setUserEmail(user.email);
          // Only sam@sam.com can access theme settings
          if (user.email.toLowerCase() === 'sam@sam.com') {
            setIsAuthorized(true);
          }
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthorization();
  }, []);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    notifications.success(`Theme changed to ${themes[themeId]?.name || themeId}`, {
      title: 'Theme Updated',
      description: 'The new theme has been applied to both homepage and admin panel.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-8">
          Theme Settings
        </h1>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/60 shadow-xl">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
            <p className="text-slate-600 mb-4">
              Theme settings are only available to the super admin (sam@sam.com).
            </p>
            {userEmail && (
              <p className="text-sm text-slate-500">
                Current user: {userEmail}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-8">
        Theme Settings
      </h1>

      <div className="space-y-6">
        {/* Current Theme Info */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Current Theme</h2>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${theme.colors.primaryGradient} shadow-lg flex items-center justify-center`}>
              <Palette className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{theme.name}</h3>
              <p className="text-sm text-slate-600">{theme.description}</p>
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Available Themes</h2>
          <p className="text-sm text-slate-600 mb-6">
            Select a theme to apply it to both the homepage and admin panel. Changes take effect immediately.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableThemes.map((availableTheme) => {
              const isActive = theme.id === availableTheme.id;
              return (
                <button
                  key={availableTheme.id}
                  onClick={() => handleThemeChange(availableTheme.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                    isActive
                      ? `border-${availableTheme.colors.primary} bg-${availableTheme.colors.primaryLight} shadow-lg`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className={`w-6 h-6 text-${availableTheme.colors.primary}`} />
                    </div>
                  )}
                  <div className={`w-full h-24 rounded-lg mb-4 bg-gradient-to-br ${availableTheme.colors.primaryGradient} shadow-md`}></div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{availableTheme.name}</h3>
                  <p className="text-sm text-slate-600 text-left">{availableTheme.description}</p>
                  <div className="mt-4 flex gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-${availableTheme.colors.primary}`}></div>
                    <div className={`w-8 h-8 rounded-lg bg-${availableTheme.colors.secondary}`}></div>
                    <div className={`w-8 h-8 rounded-lg bg-${availableTheme.colors.accent}`}></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme Preview */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Theme Preview</h2>
          <div className={`p-6 rounded-xl bg-gradient-to-br ${theme.colors.primaryGradient} text-white`}>
            <h3 className="text-2xl font-bold mb-2">{theme.name} Theme</h3>
            <p className="text-white/90 mb-4">This theme is currently active across the application.</p>
            <div className="flex gap-2">
              <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">Primary</div>
              <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">Secondary</div>
              <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">Accent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
