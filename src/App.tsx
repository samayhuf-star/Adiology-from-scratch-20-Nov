import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, TrendingUp, Settings, Bell, Search, Menu, X, FileCheck, Lightbulb, Shuffle, MinusCircle, Shield, HelpCircle, Megaphone, User, LogOut, Sparkles, Zap
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
import { CSVValidator } from './components/CSVValidator';
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
import './utils/createUser'; // Auto-create test user

type AppView = 'home' | 'auth' | 'user' | 'admin-login' | 'admin-landing' | 'admin-panel' | 'verify-email' | 'payment' | 'payment-success';

const App = () => {
  const [appView, setAppView] = useState<AppView>('home');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyData, setHistoryData] = useState<any>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Campaign Created', message: 'Your campaign "Summer Sale" has been created successfully', time: '2 hours ago', read: false },
    { id: 2, title: 'Export Ready', message: 'Your CSV export is ready for download', time: '5 hours ago', read: false },
    { id: 3, title: 'Billing Update', message: 'Your subscription will renew on Dec 1, 2025', time: '1 day ago', read: true },
  ]);

  const handleLoadHistory = (type: string, data: any) => {
    setHistoryData(data);
    setActiveTab(type);
  };

  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('auth_user');
      setAppView('home');
      setActiveTab('dashboard');
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

  // Inject ClickBlock Tracking Snippet
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://clickblock.co/tracking.js';
    script.setAttribute('data-snippet-id', 'AG-B4C29A7U');
    
    const s = document.getElementsByTagName('script')[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(script, s);
    } else {
      document.head.appendChild(script);
    }
  }, []);

  // Check URL path and authentication on mount
  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
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
      const authUser = localStorage.getItem('auth_user');
      if (!authUser) {
        // Redirect to signup
        window.history.pushState({}, '', '/');
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
      const authUser = localStorage.getItem('auth_user');
      if (authUser) {
        try {
          const user = JSON.parse(authUser);
          if (user.role === 'superadmin') {
            setAppView('admin-landing');
            return;
          }
        } catch (e) {
          // Invalid auth data
        }
      }
      // Not authenticated or not superadmin, show login
      setAppView('admin-login');
      return;
    }

    // Regular routes
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        if (user.role === 'superadmin') {
          // Super admin accessing regular routes, redirect to superadmin
          window.history.pushState({}, '', '/superadmin');
          setAppView('admin-landing');
        } else {
          setAppView('user');
        }
      } catch (e) {
        // Invalid auth data, show homepage
        setAppView('home');
      }
    } else {
      setAppView('home');
    }
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      if (path === '/verify-email' || path.startsWith('/verify-email')) {
        setAppView('verify-email');
        return;
      }
      
      if (path === '/superadmin' || path.startsWith('/superadmin/')) {
        const authUser = localStorage.getItem('auth_user');
        if (authUser) {
          try {
            const user = JSON.parse(authUser);
            if (user.role === 'superadmin') {
              setAppView('admin-landing');
              return;
            }
          } catch (e) {
            // Invalid auth data
          }
        }
        setAppView('admin-login');
      } else {
        const authUser = localStorage.getItem('auth_user');
        if (authUser) {
          try {
            const user = JSON.parse(authUser);
            if (user.role === 'superadmin') {
              window.history.pushState({}, '', '/superadmin');
              setAppView('admin-landing');
            } else {
              setAppView('user');
            }
          } catch (e) {
            setAppView('home');
          }
        } else {
          setAppView('home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Function to redirect to pricing page
  const handleRedirectToPricing = () => {
    // Set user as logged in (verified)
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    
    if (email) {
      const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
      const user = savedUsers.find((u: any) => u.email === email);
      
      if (user && user.verified) {
        localStorage.setItem('auth_user', JSON.stringify({ 
          email: user.email, 
          role: 'user',
          name: user.name,
          verified: true
        }));
        
        // Redirect to homepage and scroll to pricing
        window.history.pushState({}, '', '/');
        setAppView('home');
        
        // Scroll to pricing section after a brief delay
        setTimeout(() => {
          const pricingSection = document.getElementById('pricing');
          if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  // Function to handle plan selection
  const handleSelectPlan = (planName: string, priceId: string, amount: number, isSubscription: boolean) => {
    // Check if user is logged in
    const authUser = localStorage.getItem('auth_user');
    if (!authUser) {
      // User not logged in, redirect to signup
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
        onGetStarted={() => setAppView('auth')}
        onLogin={() => setAppView('auth')}
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
        onGoToDashboard={() => {
          // Ensure user is logged in
          const authUser = localStorage.getItem('auth_user');
          if (authUser) {
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

  if (appView === 'auth') {
    return (
      <Auth
        onLoginSuccess={() => {
          // Directly go to dashboard - no admin/user selection
          setAppView('user');
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
        onLogout={() => {
          localStorage.removeItem('auth_user');
          window.history.pushState({}, '', '/');
          setAppView('home');
          setActiveTab('dashboard');
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
  const authUser = localStorage.getItem('auth_user');
  if (!authUser && appView === 'user') {
    // Redirect to auth if not authenticated
    return (
      <HomePage
        onGetStarted={() => setAppView('auth')}
        onLogin={() => setAppView('auth')}
      />
    );
  }

  // Default: User view (protected)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaign-builder', label: 'Campaign Builder', icon: TrendingUp },
    { id: 'builder-2', label: 'Builder 2.0', icon: Sparkles },
    { id: 'keyword-planner', label: 'Keyword Planner', icon: Lightbulb },
    { id: 'keyword-mixer', label: 'Keyword Mixer', icon: Shuffle },
    { id: 'ads-builder', label: 'Ads Builder', icon: Megaphone },
    { id: 'negative-keywords', label: 'Negative Keywords', icon: MinusCircle },
    { id: 'csv-validator', label: 'CSV Validator', icon: FileCheck },
    { id: 'csv-validator-2', label: 'CSV Validator 2.0', icon: FileCheck },
    { id: 'history', label: 'History', icon: FileCheck }, // Using FileCheck as placeholder for History icon if needed, or import History
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support-help', label: 'Support & Help', icon: HelpCircle },
  ];

  const renderContent = () => {
    // Reset history data if leaving the tab to prevent stale data injection
    // This is a simplification; for robust app, manage state more carefully
    
    switch (activeTab) {
      case 'campaign-builder':
        return <CampaignBuilder initialData={activeTab === 'campaign-builder' ? historyData : null} />;
      case 'builder-2':
        return <CampaignBuilder2 initialData={activeTab === 'builder-2' ? historyData : null} />;
      case 'csv-validator':
        return <CSVValidator />;
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
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
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
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-slate-800 mr-4">
              {getCurrentPageTitle()}
            </h2>
            
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
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
                      className="text-xs text-indigo-600 hover:text-indigo-700"
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
                        onClick={() => handleMarkNotificationAsRead(notification.id)}
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
                    <DropdownMenuItem className="text-center justify-center text-sm text-indigo-600">
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
                  {(() => {
                    const authUser = localStorage.getItem('auth_user');
                    if (authUser) {
                      try {
                        const user = JSON.parse(authUser);
                        const name = user.name || user.email || 'U';
                        return name.charAt(0).toUpperCase() + (name.split(' ')[1]?.charAt(0) || '');
                      } catch (e) {
                        return 'U';
                      }
                    }
                    return 'U';
                  })()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-2">
                    {(() => {
                      const authUser = localStorage.getItem('auth_user');
                      const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
                      let userName = 'User';
                      let userEmail = 'user@example.com';
                      let userPlan = 'Free';
                      let nextBillingDate = null;
                      
                      if (authUser) {
                        try {
                          const user = JSON.parse(authUser);
                          userName = user.name || user.email?.split('@')[0] || 'User';
                          userEmail = user.email || 'user@example.com';
                          
                          // Get plan from user data
                          const userData = savedUsers.find((u: any) => u.email === user.email);
                          if (userData && userData.plan) {
                            userPlan = userData.plan;
                            nextBillingDate = userData.nextBillingDate;
                          } else if (user.plan) {
                            userPlan = user.plan;
                            nextBillingDate = user.nextBillingDate;
                          }
                        } catch (e) {
                          console.error('Error parsing user data:', e);
                        }
                      }
                      
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{userName}</p>
                              <p className="text-xs text-slate-500">{userEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                            <div>
                              <p className="text-xs text-slate-500">Plan</p>
                              <Badge className={`mt-1 ${
                                userPlan === 'Free' ? 'bg-slate-100 text-slate-700' :
                                userPlan.includes('Lifetime') ? 'bg-indigo-100 text-indigo-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {userPlan}
                              </Badge>
                            </div>
                            {nextBillingDate && (
                              <div className="text-right">
                                <p className="text-xs text-slate-500">Next billing</p>
                                <p className="text-xs font-medium text-slate-700 mt-1">
                                  {new Date(nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
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