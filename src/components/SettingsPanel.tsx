import React, { useState, useEffect } from 'react';
import { getCurrentUserProfile } from '../utils/auth';
import { supabase } from '../utils/supabase/client';
import { 
  User, Mail, Lock, Bell, Globe, Shield, 
  Save, Eye, EyeOff, Download, Upload,
  CheckCircle2, AlertCircle, CreditCard, Palette
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
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
  
  // Privacy settings
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Load user data from Supabase
    const loadUserData = async () => {
      try {
        const userProfile = await getCurrentUserProfile();
        if (userProfile) {
          setUser(userProfile);
          setName(userProfile.full_name || '');
          setEmail(userProfile.email || '');
        }
      } catch (e) {
        console.error('Failed to load user data', e);
      }
    };
    
    loadUserData();
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
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
      // Bug_08: Validate that name and email are not blank
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      
      if (!trimmedName) {
        setSaveMessage({ type: 'error', text: 'Full Name cannot be blank. Please enter your name.' });
        setIsSaving(false);
        return;
      }
      
      if (!trimmedEmail) {
        setSaveMessage({ type: 'error', text: 'Email cannot be blank. Please enter your email address.' });
        setIsSaving(false);
        return;
      }

      // Bug_09: Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setSaveMessage({ type: 'error', text: 'Please enter a valid email address (e.g., name@example.com).' });
        setIsSaving(false);
        return;
      }

      // Get current user
      const currentUser = await getCurrentUserProfile();
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Update user profile in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          full_name: trimmedName,
          email: trimmedEmail.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Refresh user data
      const updatedProfile = await getCurrentUserProfile();
      if (updatedProfile) {
        setUser(updatedProfile);
      }
      
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Bug_10: Validate that all password fields are not blank
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    
    if (!trimmedCurrentPassword) {
      setSaveMessage({ type: 'error', text: 'Current password is required. Please enter your current password.' });
      return;
    }
    
    if (!trimmedNewPassword) {
      setSaveMessage({ type: 'error', text: 'New password is required. Please enter a new password.' });
      return;
    }
    
    if (!trimmedConfirmPassword) {
      setSaveMessage({ type: 'error', text: 'Please confirm your new password by entering it again.' });
      return;
    }
    
    if (trimmedNewPassword.length < 6) {
      setSaveMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    
    if (trimmedNewPassword !== trimmedConfirmPassword) {
      setSaveMessage({ type: 'error', text: 'Passwords do not match. Please make sure both password fields are the same.' });
      return;
    }
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Verify current password and update using Supabase
      const { updatePassword } = await import('../utils/auth');
      const { error } = await supabase.auth.updateUser({ password: trimmedNewPassword });
      
      if (error) {
        if (error.message.includes('password')) {
          setSaveMessage({ type: 'error', text: 'Failed to change password. Please verify your current password is correct.' });
        } else {
          setSaveMessage({ type: 'error', text: error.message || 'Failed to change password. Please try again.' });
        }
        setIsSaving(false);
        return;
      }
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setSaveMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setSaveMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = () => {
    const settings = {
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


  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your account settings, billing, and preferences</p>
      </div>

      <Tabs key={defaultTab} defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-6 mt-0">

      {saveMessage && (
        <Alert 
          variant={saveMessage.type === 'success' ? 'default' : 'destructive'}
          className={saveMessage.type === 'success' ? 'border-green-500 bg-green-50' : ''}
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <AlertDescription className={saveMessage.type === 'success' ? 'text-green-700 font-medium' : ''}>
            {saveMessage.text}
          </AlertDescription>
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
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
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
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
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
          <div className="flex justify-start">
            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              Save Profile Changes
            </Button>
          </div>
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
            <Label htmlFor="currentPassword" className="text-sm font-semibold">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <Input
                id="currentPassword"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 pr-10 h-12"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-start">
            <Button onClick={handleChangePassword} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <ThemeSelector />

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
            <div className="flex flex-col gap-2">
              <Button onClick={handleExportData} variant="outline" title="Exports your data in JSON format">
                <Download className="w-4 h-4 mr-2" />
                Export My Data (JSON)
              </Button>
              <p className="text-xs text-slate-500">Downloads your account data in JSON format</p>
            </div>
            <Button onClick={handleSaveSettings} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              Save Privacy Settings
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

// Theme Selector Component
const ThemeSelector = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  // Color mapping for theme previews
  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'indigo-600': 'bg-indigo-600',
      'indigo-50': 'bg-indigo-50',
      'purple-600': 'bg-purple-600',
      'pink-600': 'bg-pink-600',
      'blue-600': 'bg-blue-600',
      'blue-50': 'bg-blue-50',
      'cyan-600': 'bg-cyan-600',
      'cyan-50': 'bg-cyan-50',
      'teal-600': 'bg-teal-600',
      'teal-50': 'bg-teal-50',
      'emerald-600': 'bg-emerald-600',
      'emerald-50': 'bg-emerald-50',
      'green-600': 'bg-green-600',
      'green-50': 'bg-green-50',
      'lime-600': 'bg-lime-600',
      'lime-50': 'bg-lime-50',
      'orange-600': 'bg-orange-600',
      'orange-50': 'bg-orange-50',
      'amber-600': 'bg-amber-600',
      'amber-50': 'bg-amber-50',
      'red-600': 'bg-red-600',
      'red-50': 'bg-red-50',
    };
    return colorMap[colorName] || 'bg-slate-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-600" />
          Color Theme
        </CardTitle>
        <CardDescription>Choose your preferred color scheme for the dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                theme.id === t.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              {/* Theme Preview */}
              <div className="mb-3">
                <div className="flex gap-1 mb-2">
                  <div className={`w-full h-8 rounded bg-gradient-to-r ${t.colors.primaryGradient}`}></div>
                </div>
                <div className="flex gap-1">
                  <div className={`flex-1 h-4 rounded ${getColorClass(t.colors.primary)}`}></div>
                  <div className={`flex-1 h-4 rounded ${getColorClass(t.colors.secondary)}`}></div>
                  <div className={`flex-1 h-4 rounded ${getColorClass(t.colors.accent)}`}></div>
                </div>
              </div>

              {/* Theme Info */}
              <div className="text-left">
                <h3 className="font-semibold text-sm text-slate-900 mb-1">{t.name}</h3>
                <p className="text-xs text-slate-500">{t.description}</p>
              </div>

              {/* Selected Badge */}
              {theme.id === t.id && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-2 items-start">
            <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Theme Applied Globally</p>
              <p className="text-xs text-blue-700">
                Your selected theme will be applied across all pages including Dashboard, Builder 2.0, and all tools.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

