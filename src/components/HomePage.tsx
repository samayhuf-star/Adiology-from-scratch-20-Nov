import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Check, Zap, TrendingUp, Shield, Sparkles, 
  BarChart3, Target, Rocket, Users, Globe, Lock, 
  FileText, Search, Layers, Megaphone, Award, Star,
  ChevronRight, Play, Sparkle, Settings, Clock, CheckCircle2,
  ArrowDown, Brain, LineChart, ShieldCheck, Globe2, Download,
  Mail, Phone, MapPin, Twitter, Linkedin, Github, Facebook,
  Menu, X, Eye, Code, Database, Cpu, Wand2, FileCheck,
  MessageSquare, Bell, CreditCard, Gift, Infinity, Timer,
  TrendingDown, Activity, PieChart, Filter, Copy, ExternalLink, User
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface HomePageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onLogin }) => {
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
      features: ['Advanced analytics', 'Team collaboration', 'API access']
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-6000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-lg bg-white/90 border-b border-slate-200/50 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Build Winning Google Ads
              </span>
              <br />
              <span className="text-slate-800">Campaigns in Minutes</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              The most powerful, AI-driven platform for creating, managing, and optimizing your Google Ads campaigns. 
              <span className="font-semibold text-indigo-600"> From keyword research to campaign export, we've got you covered.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg px-8 py-6 h-auto shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105 w-full sm:w-auto"
              >
                Start Building Campaigns Free <Rocket className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto border-2 border-slate-300 hover:border-indigo-400 w-full sm:w-auto"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
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
      <section id="features" className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 px-4 py-1.5">
              Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Built with 20 years of digital marketing expertise, Adiology provides all the tools you need to create winning campaigns.
            </p>
          </div>

          {/* Featured Feature Showcase */}
          <div className="mb-16">
            <Card className="border-2 border-indigo-200 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardContent className="p-8 sm:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${detailedFeatures[activeFeature].color} flex items-center justify-center shadow-lg`}>
                        <detailedFeatures[activeFeature].icon className="w-8 h-8 text-white" />
                      </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
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
      <section id="how-it-works" className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
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
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 px-4 py-1.5">
              Perfect For
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              Built for Every Business Type
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
      <section id="testimonials" className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
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

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
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
      <section id="pricing" className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1.5">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              Free Forever. No Hidden Fees.
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              All core features are completely free. Start building campaigns today.
            </p>
          </div>

          <Card className="border-2 border-indigo-200 shadow-2xl">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-indigo-600 mb-2">$0</div>
                <div className="text-slate-600 mb-6">Forever Free</div>
                <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-1.5">
                  No Credit Card Required
                </Badge>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited campaigns',
                  'Unlimited keywords',
                  'Unlimited ads',
                  'AI-powered keyword generation',
                  'Campaign builder (all structures)',
                  'CSV validation & export',
                  'Ad extensions manager',
                  'Campaign history & templates',
                  'Geo-targeting',
                  '24/7 support'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg py-6"
                size="lg"
              >
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl overflow-hidden">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center text-white">
              <Sparkle className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                Ready to Transform Your Google Ads?
              </h2>
              <p className="text-lg sm:text-xl mb-8 sm:mb-12 opacity-90 max-w-2xl mx-auto">
                Join thousands of marketers who trust Adiology for their campaign management. Start building winning campaigns today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={onGetStarted}
                  className="bg-white text-indigo-600 hover:bg-slate-100 text-lg px-8 py-6 h-auto w-full sm:w-auto"
                >
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={onLogin}
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Sparkle className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white">Adiology</span>
                  <span className="text-xs text-slate-400 -mt-0.5">~ Samay</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Professional Google Ads campaign builder powered by AI. Transform your advertising workflow and build winning campaigns in minutes.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition" aria-label="GitHub">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Campaign Builder</a></li>
                <li><a href="#" className="hover:text-white transition">Keyword Planner</a></li>
                <li><a href="#" className="hover:text-white transition">CSV Validator</a></li>
                <li><a href="#" className="hover:text-white transition">Ads Builder</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Press Kit</a></li>
                <li><a href="#" className="hover:text-white transition">Partners</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition">Community</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
              </ul>
            </div>
          </div>

          {/* Policies & Legal */}
          <div className="border-t border-slate-800 pt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div>
                <h5 className="font-semibold text-white mb-3">Legal</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition text-slate-400">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">GDPR Compliance</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-3">Security</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition text-slate-400">Security Policy</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">Data Protection</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">Encryption</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">Vulnerability Reporting</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-3">Compliance</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition text-slate-400">CCPA Compliance</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">Accessibility</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">DMCA Policy</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">Acceptable Use</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-3">Resources</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition text-slate-400">Sitemap</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">Changelog</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">Roadmap</a></li>
                  <li><a href="#" className="hover:text-white transition text-slate-400">Open Source</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-400">
                  © {new Date().getFullYear()} Adiology. All rights reserved.
                </p>
                <div className="flex items-center gap-6 text-sm text-slate-400">
                  <span>Made with ❤️ by Samay</span>
                  <span>•</span>
                  <a href="mailto:support@adiology.com" className="hover:text-white transition">
                    <Mail className="w-4 h-4 inline mr-1" />
                    support@adiology.com
                  </a>
                </div>
              </div>
            </div>
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
