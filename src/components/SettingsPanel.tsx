import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Bell, Globe, Shield, Key, 
  Save, Eye, EyeOff, Trash2, Download, Upload,
  CheckCircle2, AlertCircle, CreditCard
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BillingPanel } from './BillingPanel';

interface SettingsPanelProps {
  defaultTab?: 'settings' | 'billing';
}

export const SettingsPanel = ({ defaultTab = 'settings' }: SettingsPanelProps) => {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [campaignAlerts, setCampaignAlerts] = useState(true);
  const [exportAlerts, setExportAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  
  // Privacy settings
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  
  // API settings
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      try {
        const userData = JSON.parse(authUser);
        setUser(userData);
        setName(userData.name || '');
        setEmail(userData.email || '');
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setEmailNotifications(settings.emailNotifications ?? true);
        setCampaignAlerts(settings.campaignAlerts ?? true);
        setExportAlerts(settings.exportAlerts ?? true);
        setWeeklyReports(settings.weeklyReports ?? false);
        setDataSharing(settings.dataSharing ?? false);
        setAnalytics(settings.analytics ?? true);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Update user data
      const updatedUser = {
        ...user,
        name: name.trim(),
        email: email.trim().toLowerCase()
      };
      
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setSaveMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setSaveMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // In a real app, verify current password with server
      // For now, just update it
      const updatedUser = {
        ...user,
        password: newPassword
      };
      
      // Update in localStorage users list
      const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
      const userIndex = savedUsers.findIndex((u: any) => u.email === user.email);
      if (userIndex !== -1) {
        savedUsers[userIndex].password = newPassword;
        localStorage.setItem('adiology_users', JSON.stringify(savedUsers));
      }
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setSaveMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = () => {
    const settings = {
      emailNotifications,
      campaignAlerts,
      exportAlerts,
      weeklyReports,
      dataSharing,
      analytics
    };
    
    localStorage.setItem('user_settings', JSON.stringify(settings));
    setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleExportData = () => {
    const userData = {
      profile: user,
      settings: {
        emailNotifications,
        campaignAlerts,
        exportAlerts,
        weeklyReports,
        dataSharing,
        analytics
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adiology-data-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your data. Type DELETE to confirm.')) {
        // Remove user from localStorage
        const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
        const filteredUsers = savedUsers.filter((u: any) => u.email !== user?.email);
        localStorage.setItem('adiology_users', JSON.stringify(filteredUsers));
        
        // Remove auth
        localStorage.removeItem('auth_user');
        localStorage.removeItem('user_settings');
        
        // Redirect to home
        window.location.reload();
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage your account settings, billing, and preferences</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-8 mt-0">

      {saveMessage && (
        <Alert variant={saveMessage.type === 'success' ? 'default' : 'destructive'}>
          {saveMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <AlertDescription>{saveMessage.text}</AlertDescription>
        </Alert>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information and account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" />
            Save Profile Changes
          </Button>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="currentPassword"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to be notified about your campaigns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-slate-500">Receive email updates about your account</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Campaign Alerts</Label>
              <p className="text-sm text-slate-500">Get notified when campaigns are created or updated</p>
            </div>
            <Switch checked={campaignAlerts} onCheckedChange={setCampaignAlerts} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Export Alerts</Label>
              <p className="text-sm text-slate-500">Notify when CSV exports are ready</p>
            </div>
            <Switch checked={exportAlerts} onCheckedChange={setExportAlerts} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-slate-500">Receive weekly summary reports</p>
            </div>
            <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
          </div>
          <Button onClick={handleSaveSettings} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" />
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Privacy & Data
          </CardTitle>
          <CardDescription>Control how your data is used and shared</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Sharing</Label>
              <p className="text-sm text-slate-500">Allow sharing of anonymized data for product improvement</p>
            </div>
            <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analytics</Label>
              <p className="text-sm text-slate-500">Help us improve by sharing usage analytics</p>
            </div>
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleExportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
            <Button onClick={handleSaveSettings} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              Save Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600" />
            API Access
          </CardTitle>
          <CardDescription>Manage your API keys and integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey || '••••••••••••••••'}
                readOnly
                className="pl-10 pr-10 bg-slate-50"
                placeholder="No API key set"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">API access is available for Pro plans. Upgrade to generate an API key.</p>
          </div>
          <Button variant="outline" disabled>
            <Key className="w-4 h-4 mr-2" />
            Generate API Key
            <Badge className="ml-2" variant="secondary">Pro</Badge>
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h3 className="font-semibold text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
            </div>
            <Button onClick={handleDeleteAccount} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="mt-0">
          <BillingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

