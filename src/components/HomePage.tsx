import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Check, Zap, TrendingUp, Shield, Sparkles, 
  BarChart3, Target, Rocket, Users, Globe, Lock, 
  FileText, Search, Layers, Megaphone, Award, Star,
  ChevronRight, Sparkle, Settings, Clock, CheckCircle2,
  ArrowDown, Brain, LineChart, ShieldCheck, Globe2, Download,
  Mail, Phone, MapPin, Twitter, Linkedin, Github, Facebook,
  Menu, X, Eye, Code, Database, Cpu, Wand2, FileCheck,
  MessageSquare, Bell, CreditCard, Gift, Infinity, Timer,
  TrendingDown, Activity, PieChart, Filter, Copy, ExternalLink, User,
  Split, Network, Funnel
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface HomePageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onSelectPlan?: (planName: string, priceId: string, amount: number, isSubscription: boolean) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onLogin, onSelectPlan }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % detailedFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const detailedFeatures = [
    {
      icon: Zap,
      title: 'AI-Powered Keyword Generation',
      description: 'Generate 100-1000+ relevant keywords instantly using advanced AI technology. Our intelligent system analyzes your business, landing pages, and competitors to create targeted keyword lists that drive results.',
      color: 'from-yellow-400 to-orange-500',
      image: '🔍',
      highlights: ['100-1000+ keywords per generation', 'AI-powered semantic analysis', 'Competitor keyword research', 'Long-tail keyword expansion', 'Search intent classification'],
      stats: '500K+ Keywords Generated'
    },
    {
      icon: Target,
      title: 'Smart Campaign Builder',
      description: 'Create professional Google Ads campaigns with our guided 6-step process. Build SKAG (Single Keyword Ad Groups), STAG (Single Theme Ad Groups), or mixed campaign structures with intelligent automation.',
      color: 'from-blue-400 to-cyan-500',
      image: '🎯',
      highlights: ['6-step guided workflow', 'SKAG/STAG/Mix structures', 'Dynamic ad group creation', 'Real-time validation', 'Undo/Redo functionality'],
      stats: '10K+ Campaigns Created'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics & Insights',
      description: 'Track performance and optimize your campaigns with real-time insights. Make data-driven decisions with comprehensive analytics, keyword performance metrics, and ROI tracking.',
      color: 'from-green-400 to-emerald-500',
      image: '📊',
      highlights: ['Real-time performance tracking', 'Keyword performance metrics', 'ROI analysis', 'Campaign comparison', 'Export-ready reports'],
      stats: '98% Client Satisfaction'
    },
    {
      icon: Shield,
      title: 'CSV Validation & Export',
      description: 'Ensure your campaigns are Google Ads Editor ready with automatic validation. Export confidently knowing your data is perfect, error-free, and ready for immediate deployment.',
      color: 'from-purple-400 to-pink-500',
      image: '✅',
      highlights: ['Automatic CSV validation', 'Google Ads Editor format', 'Error detection & fixing', 'Bulk export capabilities', 'One-click deployment'],
      stats: 'Zero Export Errors'
    },
    {
      icon: Globe,
      title: 'Intelligent Geo-Targeting',
      description: 'Target specific locations with intelligent city, state, and ZIP code selection. Reach your audience where it matters most with advanced geo-segmentation strategies.',
      color: 'from-indigo-400 to-blue-500',
      image: '🌍',
      highlights: ['City-level targeting', 'State segmentation', 'ZIP code precision', 'Country selection', 'Custom location lists'],
      stats: '50+ Countries Supported'
    },
    {
      icon: Rocket,
      title: 'Export Ready Deployment',
      description: 'One-click export to Google Ads Editor format for immediate deployment. Get your campaigns live in minutes, not hours, with our optimized export system.',
      color: 'from-red-400 to-rose-500',
      image: '🚀',
      highlights: ['One-click CSV export', 'Google Ads Editor ready', 'Bulk campaign export', 'Version control', 'Instant deployment'],
      stats: '24/7 Support Available'
    },
    {
      icon: Wand2,
      title: 'AI Ad Copy Generation',
      description: 'Create compelling ad copy with AI-powered headline and description generation. Generate multiple variations optimized for performance and conversion.',
      color: 'from-pink-400 to-rose-500',
      image: '✨',
      highlights: ['AI headline generation', 'Description optimization', 'Multiple ad variations', 'A/B testing ready', 'Performance predictions'],
      stats: '1M+ Ads Created'
    },
    {
      icon: FileCheck,
      title: 'Negative Keyword Builder',
      description: 'Generate 1000+ negative keywords automatically to exclude irrelevant searches. Protect your budget and improve campaign quality with intelligent negative keyword suggestions.',
      color: 'from-orange-400 to-red-500',
      image: '🚫',
      highlights: ['1000+ negative keywords', 'Intent-based filtering', 'Category classification', 'Auto-exclusion rules', 'Budget protection'],
      stats: '50% Cost Reduction'
    },
    {
      icon: MessageSquare,
      title: 'Responsive Search Ads (RSA)',
      description: 'Create high-performing Responsive Search Ads with multiple headlines and descriptions. Let Google optimize combinations for maximum performance.',
      color: 'from-cyan-400 to-blue-500',
      image: '📱',
      highlights: ['15 headline variations', '4 description options', 'Asset optimization', 'Performance tracking', 'Auto-rotation'],
      stats: '3x Better CTR'
    },
    {
      icon: Code,
      title: 'Dynamic Keyword Insertion',
      description: 'Build Dynamic Keyword Insertion (DKI) ads that automatically adapt to user searches. Increase relevance and click-through rates with personalized ad copy.',
      color: 'from-violet-400 to-purple-500',
      image: '🔤',
      highlights: ['Automatic keyword insertion', 'Fallback text options', 'Case optimization', 'Relevance scoring', 'Performance analytics'],
      stats: '2.5x Higher Relevance'
    },
    {
      icon: Gift,
      title: 'Ad Extensions Manager',
      description: 'Add powerful ad extensions including sitelinks, callouts, structured snippets, call extensions, and more. Enhance your ads with rich additional information.',
      color: 'from-emerald-400 to-green-500',
      image: '🎁',
      highlights: ['11 extension types', 'Sitelink management', 'Callout creation', 'Structured snippets', 'Call extensions'],
      stats: '40% More Clicks'
    },
    {
      icon: Database,
      title: 'Campaign History & Templates',
      description: 'Save and reuse successful campaigns with our history system. Build a library of proven templates to accelerate future campaign creation.',
      color: 'from-teal-400 to-cyan-500',
      image: '💾',
      highlights: ['Campaign history', 'Template library', 'Quick reload', 'Version tracking', 'Bulk operations'],
      stats: 'Unlimited Storage'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Campaigns Created', icon: FileText, color: 'text-blue-600' },
    { value: '500K+', label: 'Keywords Generated', icon: Search, color: 'text-purple-600' },
    { value: '98%', label: 'Client Satisfaction', icon: Star, color: 'text-yellow-600' },
    { value: '24/7', label: 'Support Available', icon: Clock, color: 'text-green-600' },
    { value: '1M+', label: 'Ads Created', icon: Megaphone, color: 'text-pink-600' },
    { value: '50+', label: 'Countries Supported', icon: Globe2, color: 'text-indigo-600' }
  ];

  const benefits = [
    {
      icon: Timer,
      title: 'Save 90% Time',
      description: 'Reduce campaign setup time from days to minutes with our automated tools and AI-powered workflows',
      metric: '10x Faster'
    },
    {
      icon: TrendingUp,
      title: 'Increase ROI',
      description: 'Optimize your campaigns with AI-powered insights, keyword suggestions, and performance recommendations',
      metric: '3x Better ROI'
    },
    {
      icon: ShieldCheck,
      title: 'Zero Errors',
      description: 'Automatic validation ensures your campaigns are error-free and Google Ads Editor ready before export',
      metric: '100% Accuracy'
    },
    {
      icon: Brain,
      title: 'AI Intelligence',
      description: 'Leverage advanced AI (Google Gemini) to generate keywords, optimize ad copy, and improve performance',
      metric: 'AI-Powered'
    },
    {
      icon: Infinity,
      title: 'Unlimited Scale',
      description: 'Create unlimited campaigns, keywords, and ads without restrictions. Scale your advertising effortlessly',
      metric: 'Unlimited'
    },
    {
      icon: Gift,
      title: 'Free Forever',
      description: 'Access all core features completely free. No credit card required, no hidden fees, no limits',
      metric: '100% Free'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechStart Inc.',
      content: 'Adiology transformed our Google Ads workflow. We went from spending days on campaign setup to minutes. The AI keyword generation alone saved us 20+ hours per week.',
      rating: 5,
      image: '👩‍💼',
      result: '75% time saved'
    },
    {
      name: 'Michael Chen',
      role: 'PPC Specialist',
      company: 'Digital Agency',
      content: 'The keyword generation is incredible. It saved us countless hours and improved our campaign performance significantly. Our CTR increased by 40% using their suggestions.',
      rating: 5,
      image: '👨‍💻',
      result: '40% CTR increase'
    },
    {
      name: 'Emily Rodriguez',
      role: 'E-commerce Manager',
      company: 'Retail Pro',
      content: 'Best investment we made for our Google Ads campaigns. The CSV validation alone prevents so many errors. We\'ve eliminated 100% of export issues.',
      rating: 5,
      image: '👩‍💼',
      result: 'Zero errors'
    },
    {
      name: 'David Kim',
      role: 'Founder',
      company: 'StartupXYZ',
      content: 'As a startup, we needed to move fast. Adiology let us launch professional campaigns in hours instead of weeks. The ROI improvement was immediate.',
      rating: 5,
      image: '👨‍💼',
      result: '3x ROI boost'
    }
  ];

  const useCases = [
    {
      title: 'E-commerce Stores',
      description: 'Create product-focused campaigns with thousands of keywords in minutes. Perfect for online retailers.',
      icon: '🛍️',
      features: ['Product keyword expansion', 'Shopping ad optimization', 'Seasonal campaign templates']
    },
    {
      title: 'Local Businesses',
      description: 'Target specific locations and generate location-based keywords. Ideal for service businesses.',
      icon: '📍',
      features: ['Local keyword targeting', 'Geo-specific ad groups', 'Call extension integration']
    },
    {
      title: 'SaaS Companies',
      description: 'Build comprehensive campaigns for software and service offerings. Optimized for B2B.',
      icon: '💻',
      features: ['Feature-based keywords', 'Trial-focused ads', 'Enterprise targeting']
    },
    {
      title: 'Marketing Agencies',
      description: 'Scale your operations and manage multiple client campaigns efficiently. Built for agencies.',
      icon: '🏢',
      features: ['Multi-client management', 'Template library', 'Bulk operations']
    },
    {
      title: 'Startups',
      description: 'Launch professional campaigns quickly without extensive PPC expertise. Perfect for growth.',
      icon: '🚀',
      features: ['Quick setup', 'AI guidance', 'Best practices built-in']
    },
    {
      title: 'Enterprise',
      description: 'Enterprise-grade features for large-scale campaign management. Built for scale.',
      icon: '🏛️',
      features: ['Advanced analytics', 'Team collaboration']
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Sign Up Free',
      desc: 'Create your account in seconds. No credit card required.',
      icon: User,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      step: '02',
      title: 'Setup Campaign',
      desc: 'Choose your campaign structure (SKAG/STAG/Mix) and geo-targeting preferences.',
      icon: Settings,
      color: 'from-purple-500 to-pink-500'
    },
    {
      step: '03',
      title: 'Generate Keywords',
      desc: 'Use AI to generate 100-1000+ relevant keywords based on your business.',
      icon: Search,
      color: 'from-green-500 to-emerald-500'
    },
    {
      step: '04',
      title: 'Create Ads',
      desc: 'Build compelling ads with AI-powered copy generation and extensions.',
      icon: Megaphone,
      color: 'from-orange-500 to-red-500'
    },
    {
      step: '05',
      title: 'Review & Validate',
      desc: 'Review your campaign and validate everything is error-free.',
      icon: FileCheck,
      color: 'from-indigo-500 to-blue-500'
    },
    {
      step: '06',
      title: 'Export & Deploy',
      desc: 'Export to Google Ads Editor and deploy your campaign in minutes.',
      icon: Rocket,
      color: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
        {/* Additional gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-50/30 to-purple-50/30"></div>
      </div>

      {/* Floating particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-indigo-300 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Enhanced Navigation */}
      <nav className="relative z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200/60 sticky top-0 shadow-lg shadow-indigo-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110">
                <Sparkle className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Adiology
                </h1>
                <p className="text-xs text-slate-500">~ Samay</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-slate-600 hover:text-indigo-600 transition font-medium">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 transition font-medium">How It Works</a>
              <a href="#testimonials" className="text-slate-600 hover:text-indigo-600 transition font-medium">Reviews</a>
              <a href="#pricing" className="text-slate-600 hover:text-indigo-600 transition font-medium">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onLogin} className="text-slate-600 hover:text-indigo-600 hidden sm:inline-flex">
                Sign In
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-200 pt-4">
              <div className="flex flex-col gap-3">
                <a href="#features" className="text-slate-600 hover:text-indigo-600 transition font-medium py-2">Features</a>
                <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 transition font-medium py-2">How It Works</a>
                <a href="#testimonials" className="text-slate-600 hover:text-indigo-600 transition font-medium py-2">Reviews</a>
                <a href="#pricing" className="text-slate-600 hover:text-indigo-600 transition font-medium py-2">Pricing</a>
                <Button variant="ghost" onClick={onLogin} className="justify-start text-slate-600 hover:text-indigo-600">
                  Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1.5 inline-flex items-center gap-2 animate-pulse">
              <Sparkle className="w-3 h-3" />
              Trusted by 10,000+ Marketers Worldwide
            </Badge>
            
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Build Winning Google Ads
              </span>
              <br />
              <span className="text-slate-800 relative">
                Campaigns in Minutes
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-50"></span>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              The most powerful, AI-driven platform for creating, managing, and optimizing your Google Ads campaigns. 
              <span className="font-semibold text-indigo-600"> From keyword research to campaign export, we've got you covered.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg px-8 py-6 h-auto shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105 w-full sm:w-auto group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start Building Campaigns Free <Rocket className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mb-12 px-4">
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">No Credit Card Required</span>
                  </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Free Forever</span>
                  </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Setup in 5 Minutes</span>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 max-w-6xl mx-auto mt-12 sm:mt-16 px-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
                  <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${stat.color}`} />
                  <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section id="features" className="relative z-10 py-20 sm:py-24 lg:py-28 px-4 sm:px-6 bg-white/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 px-4 py-1.5">
              Powerful Features
            </Badge>
          </div>

          {/* Prebuilt Campaign Structures Section */}
          <div className="mb-20 sm:mb-24 lg:mb-28">
            <div className="text-center mb-16 sm:mb-20">
              <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 px-4 py-1.5">
                Builder 2.0
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
                Prebuilt Super Successful Campaign Structures
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                Just select from the icons and we'll do the rest. Highly optimized campaigns from Day 1, Zero Wastage and tons of saving.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Highly Optimized from Day 1</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Zero Wastage</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Tons of Savings</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-16">
              {[
                { id: 'skag', name: 'SKAG', icon: Zap, description: 'Single Keyword Ad Group - Maximum relevance', color: 'from-yellow-400 to-orange-500' },
                { id: 'stag', name: 'STAG', icon: TrendingUp, description: 'Single Theme Ad Group - Balanced approach', color: 'from-blue-400 to-cyan-500' },
                { id: 'mix', name: 'MIX', icon: Layers, description: 'Hybrid Structure - Best of both worlds', color: 'from-indigo-400 to-purple-500' },
                { id: 'stag_plus', name: 'STAG+', icon: Brain, description: 'Smart Grouping - ML-powered themes', color: 'from-purple-400 to-pink-500' },
                { id: 'intent', name: 'IBAG', icon: Target, description: 'Intent-Based - High/Research/Brand/Competitor', color: 'from-green-400 to-emerald-500' },
                { id: 'alpha_beta', name: 'Alpha–Beta', icon: Split, description: 'Alpha winners, Beta discovery', color: 'from-red-400 to-rose-500' },
                { id: 'match_type', name: 'Match-Type Split', icon: Filter, description: 'Broad/Phrase/Exact separation', color: 'from-teal-400 to-cyan-500' },
                { id: 'geo', name: 'GEO-Segmented', icon: MapPin, description: 'Location-based segmentation', color: 'from-blue-500 to-indigo-600' },
                { id: 'funnel', name: 'Funnel-Based', icon: Funnel, description: 'TOF/MOF/BOF intent grouping', color: 'from-orange-400 to-red-500' },
                { id: 'brand_split', name: 'Brand vs Non-Brand', icon: Users, description: 'Brand and non-brand separation', color: 'from-violet-400 to-purple-500' },
                { id: 'competitor', name: 'Competitor Campaigns', icon: TrendingDown, description: 'Competitor brand queries', color: 'from-pink-400 to-rose-500' },
                { id: 'ngram', name: 'Smart Cluster', icon: Network, description: 'N-Gram ML clustering', color: 'from-indigo-500 to-purple-600' },
              ].map((structure) => {
                const Icon = structure.icon;
                return (
                  <Card 
                    key={structure.id}
                    className="border-2 border-slate-200 hover:border-indigo-400 transition-all hover:shadow-xl cursor-pointer group"
                    onClick={onGetStarted}
                  >
                    <CardContent className="p-6 sm:p-8">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${structure.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{structure.name}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{structure.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-16 sm:mt-20 text-center">                                  
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6 h-auto shadow-lg"
              >
                Start Building with Builder 2.0 <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Featured Feature Showcase */}
          <div className="mb-20 sm:mb-24">
            <Card className="border-2 border-indigo-200 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardContent className="p-8 sm:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      {(() => {
                        const FeatureIcon = detailedFeatures[activeFeature].icon;
                        return (
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${detailedFeatures[activeFeature].color} flex items-center justify-center shadow-lg`}>
                            <FeatureIcon className="w-8 h-8 text-white" />
                          </div>
                        );
                      })()}
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">{detailedFeatures[activeFeature].title}</h3>
                        <p className="text-indigo-600 font-semibold">{detailedFeatures[activeFeature].stats}</p>
                      </div>
                    </div>
                    <p className="text-lg text-slate-700 mb-6 leading-relaxed">{detailedFeatures[activeFeature].description}</p>
                    <ul className="space-y-3">
                      {detailedFeatures[activeFeature].highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-slate-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative">
                    <div className="text-8xl mb-4 text-center">{detailedFeatures[activeFeature].image}</div>
                    <div className="flex gap-2 justify-center mt-6">
                      {detailedFeatures.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveFeature(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === activeFeature ? 'bg-indigo-600 w-8' : 'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {detailedFeatures.map((feature, idx) => (
              <Card 
                key={idx} 
                className="border-2 border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl group cursor-pointer h-full"
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-4xl">{feature.image}</div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-4">{feature.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.highlights.slice(0, 3).map((highlight, hIdx) => (
                      <Badge key={hIdx} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-28 px-4 sm:px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1.5">
              Why Choose Adiology
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              Transform Your Google Ads Workflow
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Join thousands of marketers who have revolutionized their campaign management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all border border-slate-200 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <benefit.icon className="w-10 h-10 text-indigo-600" />
                  <Badge className="bg-green-100 text-green-700 border-green-200">{benefit.metric}</Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Visual Showcase */}
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                  See Your Campaigns Come to Life
                </h3>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Our intuitive interface makes campaign creation effortless. Watch as your ideas transform into fully optimized Google Ads campaigns.
                </p>
                <ul className="space-y-3 mb-6">
                  {['Drag-and-drop campaign builder', 'Real-time preview', 'Instant validation', 'One-click export', 'AI-powered suggestions', 'Undo/Redo functionality'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={onGetStarted} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  Try It Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-8 sm:p-12 border border-indigo-200">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-semibold text-slate-700">Campaign Active</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">1,234 Keywords</div>
                    <div className="text-sm text-slate-600">45 Ad Groups • 12 Ads</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-semibold text-slate-700">Performance</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">98% CTR</div>
                    <div className="text-sm text-slate-600">Optimized • Ready to Export</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-semibold text-slate-700">AI Suggestions</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">500+ Keywords</div>
                    <div className="text-sm text-slate-600">Generated in 30 seconds</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-20 sm:py-24 lg:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1.5">
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              From Idea to Campaign in 6 Steps
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Get your campaigns live in minutes, not days
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="relative">
                <div className={`bg-gradient-to-br ${item.color} rounded-xl p-6 sm:p-8 border border-white/20 hover:shadow-xl transition-all h-full text-white`}>
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-sm font-semibold opacity-90 mb-2">Step {item.step}</div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="opacity-90">{item.desc}</p>
                  </div>
                </div>
                {idx < howItWorks.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 text-indigo-300 transform -translate-y-1/2 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-28 px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 px-4 py-1.5">
              Perfect For
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              Built for Every Business Type
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
            {useCases.map((useCase, idx) => (
              <Card key={idx} className="border-2 border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="text-5xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{useCase.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{useCase.description}</p>
                  <ul className="space-y-2">
                    {useCase.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-20 sm:py-24 lg:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 px-4 py-1.5">
              Customer Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              Loved by Marketers Worldwide
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See how businesses are transforming their Google Ads campaigns with Adiology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 mt-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-2 border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{testimonial.image}</div>
                    <div className="flex-1">
                      <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">{testimonial.result}</Badge>
                    </div>
                  </div>
                  <p className="text-slate-700 mb-6 leading-relaxed italic text-lg">"{testimonial.content}"</p>
                  <div className="border-t border-slate-200 pt-4">
                    <p className="font-bold text-slate-800">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 sm:py-24 lg:py-28 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1.5">
              Choose Your Plan
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              Simple, Transparent Pricing
              </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Pick the perfect plan for your business needs. All plans include access to our powerful campaign building tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-8">
            {/* Lifetime Limited Plan */}
            <Card className="border-2 border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl relative">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <Badge className="mb-3 bg-indigo-100 text-indigo-700 border-indigo-200">Lifetime</Badge>
                  <div className="text-4xl font-bold text-slate-800 mb-1">$99.99</div>
                  <div className="text-sm text-slate-600 mb-4">One-time payment</div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">15 campaigns/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">All features included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">AI keyword generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Campaign builder</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">CSV validation & export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">24/7 support</span>
                  </li>
                </ul>
                <Button 
                  onClick={onGetStarted}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Lifetime Unlimited Plan */}
            <Card className="border-2 border-indigo-400 hover:border-indigo-500 transition-all hover:shadow-2xl relative bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">Popular</Badge>
              </div>
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <Badge className="mb-3 bg-indigo-100 text-indigo-700 border-indigo-200">Lifetime</Badge>
                  <div className="text-4xl font-bold text-slate-800 mb-1">$199</div>
                  <div className="text-sm text-slate-600 mb-4">One-time payment</div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-semibold">Unlimited campaigns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-semibold">Unlimited access to all tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">AI keyword generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Campaign builder</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">CSV validation & export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Priority support</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => {
                    if (onSelectPlan) {
                      onSelectPlan('Lifetime Unlimited', 'price_lifetime_unlimited', 199, false);
                    } else {
                      onGetStarted();
                    }
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Limited Plan */}
            <Card className="border-2 border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl relative">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <Badge className="mb-3 bg-green-100 text-green-700 border-green-200">Monthly</Badge>
                  <div className="text-4xl font-bold text-slate-800 mb-1">$49.99</div>
                  <div className="text-sm text-slate-600 mb-4">per month</div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">25 campaigns/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Access to other tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">AI keyword generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Campaign builder</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">CSV validation & export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">24/7 support</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => {
                    if (onSelectPlan) {
                      onSelectPlan('Monthly Limited', 'price_monthly_25', 49.99, true);
                    } else {
                      onGetStarted();
                    }
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Unlimited Plan */}
            <Card className="border-2 border-purple-300 hover:border-purple-400 transition-all hover:shadow-xl relative">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <Badge className="mb-3 bg-purple-100 text-purple-700 border-purple-200">Monthly</Badge>
                  <div className="text-4xl font-bold text-slate-800 mb-1">$99.99</div>
                  <div className="text-sm text-slate-600 mb-4">per month</div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-semibold">Unlimited campaigns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-semibold">Full access to all tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">AI keyword generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Campaign builder</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">CSV validation & export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Priority support</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => {
                    if (onSelectPlan) {
                      onSelectPlan('Monthly Unlimited', 'price_monthly_unlimited', 99.99, true);
                    } else {
                      onGetStarted();
                    }
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="relative z-10 py-20 sm:py-24 lg:py-28 px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Get In Touch
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8">
            {/* Contact Form */}
            <Card className="border-slate-200 shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h3>
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  notifications.success('Thank you for your message! We\'ll get back to you soon.', {
                    title: 'Message Sent',
                    description: 'Your contact form submission has been received.'
                  });
                  // Reset form
                  (e.target as HTMLFormElement).reset();
                }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-slate-700 font-medium mb-2 block">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="w-full"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-slate-700 font-medium mb-2 block">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="w-full"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-700 font-medium mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-slate-700 font-medium mb-2 block">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      className="w-full"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-slate-700 font-medium mb-2 block">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      className="w-full"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                <Button 
                    type="submit"
                  size="lg"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                >
                    Send Message <Mail className="w-5 h-5 ml-2" />
                </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6">Contact Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">Address</h4>
                        <p className="text-slate-600">
                          Sheridan, Wyoming USA 82801
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">Email</h4>
                        <a 
                          href="mailto:contact@adiology.com" 
                          className="text-indigo-600 hover:text-indigo-700 transition"
                        >
                          contact@adiology.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">Support</h4>
                        <a 
                          href="mailto:support@adiology.com" 
                          className="text-indigo-600 hover:text-indigo-700 transition"
                        >
                          support@adiology.com
                        </a>
                      </div>
                    </div>
              </div>
            </CardContent>
          </Card>

              <Card className="border-slate-200 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardContent className="p-6 sm:p-8">
                  <h4 className="font-semibold text-slate-800 mb-3">Business Hours</h4>
                  <div className="space-y-2 text-slate-600">
                    <p className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-medium">9:00 AM - 6:00 PM MST</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Saturday</span>
                      <span className="font-medium">10:00 AM - 4:00 PM MST</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Sunday</span>
                      <span className="font-medium">Closed</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Footer */}
      <footer className="relative z-10 py-8 sm:py-10 px-4 sm:px-6 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 mb-6">
            {/* Brand & Social */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Sparkle className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white">Adiology</span>
                  <span className="text-xs text-slate-400 -mt-0.5">~ Samay</span>
                </div>
              </div>
              <div className="flex gap-3">
                <a href="#" className="text-slate-400 hover:text-white transition" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition" aria-label="GitHub">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <a href="#contact" className="hover:text-white transition">Contact</a>
              <a href="#" className="hover:text-white transition">Help Center</a>
            </div>
          </div>

          {/* Legal Links & Bottom Bar */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-400">
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <span className="text-slate-600">•</span>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
                <span className="text-slate-600">•</span>
                <a href="#" className="hover:text-white transition">Cookie Policy</a>
                <span className="text-slate-600">•</span>
                <a href="#" className="hover:text-white transition">GDPR</a>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Made with ❤️ by Samay</span>
                <span className="hidden sm:inline">•</span>
                <a href="mailto:support@adiology.com" className="hover:text-white transition flex items-center gap-1">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">support@adiology.com</span>
                  <span className="sm:hidden">Support</span>
                </a>
              </div>
            </div>
            <p className="text-center sm:text-left text-xs text-slate-500 mt-4">
              © {new Date().getFullYear()} Adiology. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
};
