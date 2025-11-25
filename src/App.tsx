import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, TrendingUp, Settings, Bell, Search, Menu, X, FileCheck, Lightbulb, Shuffle, MinusCircle, Shield, HelpCircle, Megaphone, User, LogOut, Sparkles, Zap, Package
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { Badge } from './components/ui/badge';
import { CampaignBuilder } from './components/CampaignBuilder';
import { CampaignBuilder2 } from './components/CampaignBuilder2';
import { CSVValidator2 } from './components/CSVValidator2';
import { KeywordPlanner } from './components/KeywordPlanner';
import { KeywordMixer } from './components/KeywordMixer';
import { NegativeKeywordsBuilder } from './components/NegativeKeywordsBuilder';
import { AdsBuilder } from './components/AdsBuilder';
import { HistoryPanel } from './components/HistoryPanel';
import { BillingPanel } from './components/BillingPanel';
import { SupportPanel } from './components/SupportPanel';
import { HelpSupport } from './components/HelpSupport';
import { SuperAdminLogin } from './components/SuperAdminLogin';
import { SuperAdminLanding } from './components/SuperAdminLanding';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { HomePage } from './components/HomePage';
import { Auth } from './components/Auth';
import { EmailVerification } from './components/EmailVerification';
import { PaymentPage } from './components/PaymentPage';
import { PaymentSuccess } from './components/PaymentSuccess';
import { SettingsPanel } from './components/SettingsPanel';
import { SupportHelpCombined } from './components/SupportHelpCombined';
import { ResetPassword } from './components/ResetPassword';
import { CampaignPresets } from './components/CampaignPresets';
import { supabase } from './utils/supabase/client';
import { getCurrentUserProfile, isAuthenticated, signOut, isSuperAdmin } from './utils/auth';
import './utils/createUser'; // Auto-create test user

type AppView = 'home' | 'auth' | 'user' | 'admin-login' | 'admin-landing' | 'admin-panel' | 'verify-email' | 'reset-password' | 'payment' | 'payment-success';

const App = () => {
  const [appView, setAppView] = useState<AppView>('home');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyData, setHistoryData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Campaign Created', message: 'Your campaign "Summer Sale" has been created successfully', time: '2 hours ago', read: false },
    { id: 2, title: 'Export Ready', message: 'Your CSV export is ready for download', time: '5 hours ago', read: false },
    { id: 3, title: 'Billing Update', message: 'Your subscription will renew on Dec 1, 2025', time: '1 day ago', read: true },
  ]);
  // Bug_64: Search suggestions state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const handleLoadHistory = (type: string, data: any) => {
    setHistoryData(data);
    setActiveTab(type);
  };

  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Mark as read
    handleMarkNotificationAsRead(notification.id);
    
    // Redirect based on notification type
    const title = notification.title.toLowerCase();
    if (title.includes('campaign')) {
      setActiveTab('campaign-builder');
    } else if (title.includes('export') || title.includes('csv')) {
      setActiveTab('csv-validator');
    } else if (title.includes('billing') || title.includes('subscription')) {
      setActiveTab('settings');
      // Optionally open billing tab in settings
      const settingsPanel = document.querySelector('[data-settings-tab="billing"]');
      if (settingsPanel) {
        (settingsPanel as HTMLElement).click();
      }
    } else if (title.includes('keyword')) {
      setActiveTab('keyword-planner');
    }
  };

  const handleViewAllNotifications = () => {
    // Navigate to a notifications view or show all notifications
    // For now, we'll just scroll to show all notifications in the dropdown
    // In a full implementation, this could open a dedicated notifications panel
    setActiveTab('settings');
    // You could also create a dedicated notifications tab/page
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        // Bug_62, Bug_76: Ensure proper logout
        await signOut();
        // Clear user state
        setUser(null);
        // Clear any cached data
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        // Redirect to home
        window.history.pushState({}, '', '/');
        setAppView('home');
        setActiveTab('dashboard');
        // Force page reload to clear all state
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error:', error);
        // Even if signOut fails, clear local state and redirect
        setUser(null);
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        window.location.href = '/';
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Set favicon on mount
  useEffect(() => {
    const setFavicon = () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="20" fill="url(#grad)"/>
          <path d="M30 70 L50 30 L70 70 M40 55 L60 55" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      `;
      
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const existingFavicon = document.querySelector("link[rel*='icon']");
      if (existingFavicon) {
        existingFavicon.remove();
      }
      
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = url;
      document.head.appendChild(link);
      
      document.title = 'Adiology - Google Campaign Builder';
    };
    
    setFavicon();
  }, []);


  // Initialize auth state and listen for changes
  useEffect(() => {
    let isMounted = true;
    let profileFetchInProgress = false;
    
    // Check initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          try {
            const userProfile = await getCurrentUserProfile();
            if (isMounted) {
              setUser(userProfile);
            }
          } catch (error) {
            console.error('Error fetching user profile during init:', error);
            if (isMounted) {
              // Set minimal user on error
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                role: 'user',
                subscription_plan: 'free',
                subscription_status: 'active',
              });
            }
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Prevent multiple simultaneous profile fetches
      if (profileFetchInProgress) {
        return;
      }

      if (session?.user && isMounted) {
        profileFetchInProgress = true;
        
        // Set minimal user immediately to avoid UI flicker
        const minimalUser = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: 'user',
          subscription_plan: 'free',
          subscription_status: 'active',
        };
        
        // Only update if user actually changed
        setUser(prevUser => {
          if (prevUser?.id === minimalUser.id) {
            return prevUser; // Don't update if same user
          }
          return minimalUser;
        });
        
        // Fetch full profile in background (non-blocking)
        getCurrentUserProfile()
          .then((userProfile) => {
            profileFetchInProgress = false;
            if (userProfile && isMounted) {
              setUser(prevUser => {
                // Only update if still the same user
                if (prevUser?.id === userProfile.id) {
                  return userProfile;
                }
                return prevUser;
              });
            }
          })
          .catch((error) => {
            profileFetchInProgress = false;
            console.warn('Profile fetch failed in auth listener (non-critical):', error);
            // Keep using minimal user - already set above
          });
      } else if (isMounted) {
        setUser(null);
        // If user signed out and we're on user view, go to home
        if (event === 'SIGNED_OUT' && appView === 'user') {
          setAppView('home');
        }
      }

      // Handle password recovery
      if (event === 'PASSWORD_RECOVERY' && isMounted) {
        setAppView('reset-password');
      }

      // Handle email verification
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at && isMounted) {
        // User just verified email, redirect to pricing/home
        if (window.location.pathname.includes('/verify-email')) {
          window.history.pushState({}, '', '/');
          setAppView('home');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Check URL path and authentication on mount
  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if user is accessing /reset-password route
    if (path === '/reset-password' || path.startsWith('/reset-password')) {
      setAppView('reset-password');
      return;
    }
    
    // Check if user is accessing /payment-success route
    if (path === '/payment-success' || path.startsWith('/payment-success')) {
      const planName = urlParams.get('plan') || 'Selected Plan';
      const amountParam = urlParams.get('amount') || '0.00';
      const amount = parseFloat(amountParam.replace('$', '').replace('/month', ''));
      const isSubscription = urlParams.get('subscription') === 'true';
      
      setSelectedPlan({
        name: planName,
        priceId: urlParams.get('priceId') || '',
        amount,
        isSubscription
      });
      setAppView('payment-success');
      return;
    }
    
    // Check if user is accessing /payment route
    if (path === '/payment' || path.startsWith('/payment')) {
      const planName = urlParams.get('plan') || 'Lifetime Unlimited';
      const priceId = urlParams.get('priceId') || '';
      const amount = parseFloat(urlParams.get('amount') || '199');
      const isSubscription = urlParams.get('subscription') === 'true';
      
      // Check if user is logged in
      if (!user) {
        // Redirect to signup
        window.history.pushState({}, '', '/');
        setAuthMode('signup');
        setAppView('auth');
        return;
      }
      
      setSelectedPlan({
        name: planName,
        priceId,
        amount,
        isSubscription
      });
      setAppView('payment');
      return;
    }
    
    // Check if user is accessing /verify-email route
    if (path === '/verify-email' || path.startsWith('/verify-email')) {
      setAppView('verify-email');
      return;
    }
    
    // Check if user is accessing /superadmin route
    if (path === '/superadmin' || path.startsWith('/superadmin/')) {
      if (user) {
        const checkSuperAdmin = async () => {
          const isAdmin = await isSuperAdmin();
          if (isAdmin) {
            setAppView('admin-landing');
          } else {
            setAppView('admin-login');
          }
        };
        checkSuperAdmin();
      } else {
      setAppView('admin-login');
      }
      return;
    }

    // Regular routes
    if (user) {
      // Check if superadmin
      const checkSuperAdmin = async () => {
        const isAdmin = await isSuperAdmin();
        if (isAdmin) {
          // Super admin accessing regular routes, redirect to superadmin
          window.history.pushState({}, '', '/superadmin');
          setAppView('admin-landing');
        } else {
          setAppView('user');
        }
      };
      checkSuperAdmin();
    } else {
      setAppView('home');
    }
  }, [loading, user]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = async () => {
      const path = window.location.pathname;
      
      if (path === '/reset-password' || path.startsWith('/reset-password')) {
        setAppView('reset-password');
        return;
      }
      
      if (path === '/verify-email' || path.startsWith('/verify-email')) {
        setAppView('verify-email');
        return;
      }
      
      if (path === '/superadmin' || path.startsWith('/superadmin/')) {
        if (user) {
          const isAdmin = await isSuperAdmin();
          if (isAdmin) {
              setAppView('admin-landing');
          } else {
            setAppView('admin-login');
            }
        } else {
        setAppView('admin-login');
        }
      } else {
        if (user) {
          const isAdmin = await isSuperAdmin();
          if (isAdmin) {
              window.history.pushState({}, '', '/superadmin');
              setAppView('admin-landing');
            } else {
              setAppView('user');
          }
        } else {
          setAppView('home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // Function to handle plan selection
  const handleSelectPlan = async (planName: string, priceId: string, amount: number, isSubscription: boolean) => {
    // Check if user is logged in
    const authenticated = await isAuthenticated();
    if (!authenticated || !user) {
      // User not logged in, redirect to signup
      setAuthMode('signup');
      setAppView('auth');
      return;
    }

    // User is logged in, redirect to payment page
    setSelectedPlan({ name: planName, priceId, amount, isSubscription });
    window.history.pushState({}, '', `/payment?plan=${encodeURIComponent(planName)}&priceId=${encodeURIComponent(priceId)}&amount=${amount}&subscription=${isSubscription}`);
    setAppView('payment');
  };

  // Render based on app view
  if (appView === 'home') {
    return (
      <HomePage
        onGetStarted={() => {
          setAuthMode('signup');
          setAppView('auth');
        }}
        onLogin={() => {
          setAuthMode('login');
          setAppView('auth');
        }}
        onSelectPlan={handleSelectPlan}
      />
    );
  }

  if (appView === 'payment' && selectedPlan) {
    return (
      <PaymentPage
        planName={selectedPlan.name}
        priceId={selectedPlan.priceId}
        amount={selectedPlan.amount}
        isSubscription={selectedPlan.isSubscription}
        onBack={() => {
          // Clear any pending payment attempts
          sessionStorage.removeItem('pending_payment');
          
          // Go back to pricing page (homepage with pricing section)
          window.history.pushState({}, '', '/');
          setAppView('home');
          
          // Scroll to pricing section after a brief delay
          setTimeout(() => {
            const pricingSection = document.getElementById('pricing');
            if (pricingSection) {
              pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }}
        onSuccess={() => {
          // Clear pending payment attempts
          sessionStorage.removeItem('pending_payment');
          
          window.history.pushState({}, '', `/payment-success?plan=${encodeURIComponent(selectedPlan.name)}&amount=$${selectedPlan.amount.toFixed(2)}${selectedPlan.isSubscription ? '/month' : ''}&subscription=${selectedPlan.isSubscription}&priceId=${encodeURIComponent(selectedPlan.priceId)}`);
          setAppView('payment-success');
        }}
      />
    );
  }

  if (appView === 'payment-success' && selectedPlan) {
    return (
      <PaymentSuccess
        planName={selectedPlan.name}
        amount={`$${selectedPlan.amount.toFixed(2)}${selectedPlan.isSubscription ? '/month' : ''}`}
        onGoToDashboard={async () => {
          // Ensure user is logged in
          const authenticated = await isAuthenticated();
          if (authenticated && user) {
            window.history.pushState({}, '', '/');
            setAppView('user');
            setActiveTab('dashboard');
          } else {
            window.history.pushState({}, '', '/');
            setAppView('home');
          }
        }}
      />
    );
  }

  if (appView === 'verify-email') {
    return (
      <EmailVerification
        onVerificationSuccess={() => {
          // Bug_74: Redirect to login screen after email verification
          window.history.pushState({}, '', '/');
          setAuthMode('login');
          setAppView('auth');
        }}
        onBackToHome={() => setAppView('home')}
      />
    );
  }

  if (appView === 'reset-password') {
    return (
      <ResetPassword
        onSuccess={async () => {
          // Password reset successful, redirect to login
          window.history.pushState({}, '', '/');
          setAuthMode('login');
          setAppView('auth');
        }}
        onBackToHome={() => setAppView('home')}
      />
    );
  }

  if (appView === 'auth') {
    return (
      <Auth
        initialMode={authMode}
        onLoginSuccess={async () => {
          // Navigate to dashboard immediately - don't wait for profile fetch
          setAppView('user');
          
          // Fetch profile in background (don't block navigation)
          try {
            // Wait a moment for auth state to propagate
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Try to get auth user first (faster)
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            
            if (authUser) {
              // Set minimal user immediately
              setUser({ 
                id: authUser.id, 
                email: authUser.email || '',
                full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                role: 'user',
                subscription_plan: 'free',
                subscription_status: 'active',
              });
              
              // Then fetch full profile in background (with timeout)
              Promise.race([
                getCurrentUserProfile(),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
                )
              ]).then((userProfile: any) => {
                if (userProfile) {
                  setUser(userProfile);
                  console.log('✅ User profile loaded:', userProfile);
                }
              }).catch((profileError: any) => {
                console.warn('⚠️ Profile fetch failed (non-critical):', profileError);
                // Keep using minimal user object - app will work fine
              });
            }
          } catch (error) {
            console.error('Error in onLoginSuccess:', error);
            // Navigation already happened, so we're good
          }
        }}
        onBackToHome={() => setAppView('home')}
      />
    );
  }

  if (appView === 'admin-login') {
    return (
      <SuperAdminLogin
        onLoginSuccess={() => setAppView('admin-landing')}
      />
    );
  }

  if (appView === 'admin-landing') {
    return (
      <SuperAdminLanding
        onSelectUserView={() => setAppView('user')}
        onSelectAdminPanel={() => setAppView('admin-panel')}
        onLogout={async () => {
          // Bug_62, Bug_76: Ensure proper logout
          try {
            await signOut();
            setUser(null);
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.clear();
            window.location.href = '/';
          } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.clear();
            window.location.href = '/';
          }
        }}
      />
    );
  }

  if (appView === 'admin-panel') {
    return (
      <SuperAdminPanel
        onBackToLanding={() => setAppView('admin-landing')}
      />
    );
  }

  // Protect user view - require authentication
  if (!user && appView === 'user' && !loading) {
    // Redirect to auth if not authenticated
    return (
      <HomePage
        onGetStarted={() => {
          setAuthMode('signup');
          setAppView('auth');
        }}
        onLogin={() => {
          setAuthMode('login');
          setAppView('auth');
        }}
      />
    );
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-800 to-purple-800">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Default: User view (protected)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaign-presets', label: 'Campaign Presets', icon: Package },
    { id: 'campaign-builder', label: 'Campaign Builder', icon: TrendingUp },
    { id: 'builder-2', label: 'Builder 2.0', icon: Sparkles },
    { id: 'keyword-planner', label: 'Keyword Planner', icon: Lightbulb },
    { id: 'keyword-mixer', label: 'Keyword Mixer', icon: Shuffle },
    { id: 'ads-builder', label: 'Ads Builder', icon: Megaphone },
    { id: 'negative-keywords', label: 'Negative Keywords', icon: MinusCircle },
    { id: 'csv-validator-2', label: 'CSV Validator 2.0', icon: FileCheck },
    { id: 'history', label: 'History', icon: FileCheck }, // Using FileCheck as placeholder for History icon if needed, or import History
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support-help', label: 'Support & Help', icon: HelpCircle },
  ];

  // Bug_64: Generate search suggestions based on query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const suggestions: string[] = [];

    // Add matching menu items
    menuItems.forEach(item => {
      if (item.label.toLowerCase().includes(query)) {
        suggestions.push(item.label);
      }
    });

    // Add common search terms
    const commonTerms = [
      'marketing', 'market analysis', 'market research',
      'campaign', 'campaigns', 'ad campaign',
      'keywords', 'keyword research', 'keyword planning',
      'ads', 'advertising', 'ad builder',
      'negative keywords', 'exclude keywords',
      'csv', 'export', 'import', 'validator',
      'settings', 'billing', 'account',
      'help', 'support', 'documentation'
    ];

    commonTerms.forEach(term => {
      if (term.toLowerCase().includes(query) && !suggestions.includes(term)) {
        suggestions.push(term);
      }
    });

    setSearchSuggestions(suggestions.slice(0, 8)); // Limit to 8 suggestions
    setShowSearchSuggestions(suggestions.length > 0);
  }, [searchQuery]);

  // Bug_64: Handle search suggestion click
  const handleSearchSuggestionClick = (suggestion: string) => {
    // Find matching menu item
    const matchingItem = menuItems.find(item => 
      item.label.toLowerCase() === suggestion.toLowerCase()
    );
    
    if (matchingItem) {
      setActiveTab(matchingItem.id);
      setSearchQuery('');
      setShowSearchSuggestions(false);
    } else {
      // For common terms, try to match to a menu item
      const termMap: Record<string, string> = {
        'marketing': 'campaign-builder',
        'campaign': 'campaign-builder',
        'campaigns': 'campaign-builder',
        'keywords': 'keyword-planner',
        'keyword research': 'keyword-planner',
        'keyword planning': 'keyword-planner',
        'ads': 'ads-builder',
        'advertising': 'ads-builder',
        'negative keywords': 'negative-keywords',
        'csv': 'csv-validator-2',
        'export': 'csv-validator-2',
        'settings': 'settings',
        'billing': 'settings',
        'help': 'support-help',
        'support': 'support-help'
      };

      const matchedTab = termMap[suggestion.toLowerCase()];
      if (matchedTab) {
        setActiveTab(matchedTab);
      }
      setSearchQuery('');
      setShowSearchSuggestions(false);
    }
  };

  const renderContent = () => {
    // Reset history data if leaving the tab to prevent stale data injection
    // This is a simplification; for robust app, manage state more carefully
    
    switch (activeTab) {
      case 'campaign-presets':
        return <CampaignPresets onLoadPreset={(presetData) => {
          setHistoryData(presetData);
          setActiveTab('campaign-builder');
        }} />;
      case 'campaign-builder':
        return <CampaignBuilder initialData={activeTab === 'campaign-builder' ? historyData : null} />;
      case 'builder-2':
        return <CampaignBuilder2 initialData={activeTab === 'builder-2' ? historyData : null} />;
      case 'csv-validator-2':
        return <CSVValidator2 />;
      case 'keyword-planner':
        return <KeywordPlanner initialData={activeTab === 'keyword-planner' ? historyData : null} />;
      case 'keyword-mixer':
        return <KeywordMixer initialData={activeTab === 'keyword-mixer' ? historyData : null} />;
      case 'negative-keywords':
        return <NegativeKeywordsBuilder initialData={activeTab === 'negative-keywords' ? historyData : null} />;
      case 'ads-builder':
        return <AdsBuilder />;
      case 'history':
        return <HistoryPanel onLoadItem={handleLoadHistory} />;
      case 'support-help':
        return <SupportHelpCombined />;
      case 'support':
        return <SupportPanel />;
      case 'settings':
        return <SettingsPanel />;
      case 'billing':
        return <SettingsPanel defaultTab="billing" />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.id === activeTab);
    return currentItem ? currentItem.label : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl relative z-10`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/60">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">Adiology</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns, keywords, tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchSuggestions(true)}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setShowSearchSuggestions(false), 200);
                }}
                onKeyDown={(e) => {
                  // Bug_63: Handle Enter key to execute search
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    e.preventDefault();
                    if (searchSuggestions.length > 0) {
                      handleSearchSuggestionClick(searchSuggestions[0]);
                    } else {
                      // If no suggestions, try to find matching menu item
                      const matchingItem = menuItems.find(item => 
                        item.label.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      if (matchingItem) {
                        setActiveTab(matchingItem.id);
                        setSearchQuery('');
                        setShowSearchSuggestions(false);
                      }
                    }
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
              />
              {/* Bug_64: Search suggestions dropdown */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-slate-800 mr-4">
              {getCurrentPageTitle()}
            </h2>
            
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
              <Bell className="w-5 h-5 text-slate-600" />
                  {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      Mark all as read
            </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`flex flex-col items-start p-3 cursor-pointer hover:bg-slate-50 ${
                          !notification.read ? 'bg-indigo-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                              )}
                              <span className="font-medium text-sm text-slate-800">
                                {notification.title}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 ml-4">
                              {notification.message}
                            </p>
                            <span className="text-xs text-slate-400 mt-1 ml-4 block">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-center justify-center text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      onClick={handleViewAllNotifications}
                    >
                      View all notifications
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  {user 
                    ? (() => {
                        const name = user.full_name || user.email || 'U';
                        const parts = name.split(' ');
                        return (parts[0]?.charAt(0) || '').toUpperCase() + (parts[1]?.charAt(0) || '').toUpperCase() || 'U';
                      })()
                    : 'U'
                  }
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-2">
                    {user ? (
                      <>
                        <div className="font-semibold text-slate-900">
                          {user.full_name || user.email?.split('@')[0] || 'User'}
                            </div>
                        <div className="text-xs text-slate-600">
                          {user.email || 'user@example.com'}
                          </div>
                        {user.subscription_plan && user.subscription_plan !== 'free' && (
                          <Badge className="w-fit bg-indigo-100 text-indigo-700 border-indigo-200">
                            {user.subscription_plan.charAt(0).toUpperCase() + user.subscription_plan.slice(1)}
                              </Badge>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-slate-900">User</div>
                        <div className="text-xs text-slate-600">user@example.com</div>
                      </>
                    )}
            </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <User className="w-4 h-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('billing')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('support')}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  variant="destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Dashboard View
const DashboardView = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
      Dashboard Overview
    </h1>
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-slate-200/60 shadow-xl text-center">
      <LayoutDashboard className="w-20 h-20 text-indigo-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Welcome to Adiology
      </h2>
      <p className="text-slate-600 max-w-lg mx-auto mb-4">
        Your Google Ads campaign management platform is ready. Navigate to Campaign Builder, CSV Validator, or Keyword tools to get started.
      </p>
    </div>
  </div>
);


export default App;