import React, { useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Shield, 
  BookOpen, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Layout,
  FileCheck,
  HelpCircle,
  Lock,
  Users
} from 'lucide-react';

interface HomePageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export default function HomePage({ onGetStarted, onLogin }: HomePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Campaign Builder',
      description: 'Create optimized Google Ads campaigns with intelligent keyword suggestions and ad copy generation.'
    },
    {
      icon: Zap,
      title: 'Keyword Planner',
      description: 'Discover high-performing keywords and analyze search volume, competition, and trends.'
    },
    {
      icon: Layout,
      title: 'Campaign Templates',
      description: 'Start with pre-built campaign structures for various industries and goals.'
    },
    {
      icon: FileCheck,
      title: 'CSV Validator',
      description: 'Validate and optimize your campaign exports before importing to Google Ads Editor.'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Track campaign performance and get insights to improve your ROI.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with encrypted data storage and regular backups.'
    }
  ];

  const policies = [
    {
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information.',
      link: '/privacy'
    },
    {
      title: 'Terms of Service',
      description: 'The terms and conditions for using our platform.',
      link: '/terms'
    },
    {
      title: 'Cookie Policy',
      description: 'Information about how we use cookies and similar technologies.',
      link: '/cookies'
    },
    {
      title: 'Refund Policy',
      description: 'Our policy on refunds and cancellations.',
      link: '/refunds'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center w-full">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Adiology
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors">
                Features
              </a>
              <a href="#policies" className="text-slate-600 hover:text-indigo-600 transition-colors">
                Policies
              </a>
              <a href="#documentation" className="text-slate-600 hover:text-indigo-600 transition-colors">
                Documentation
              </a>
              <button
                onClick={onLogin}
                className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-indigo-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-slate-600 hover:text-indigo-600" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#policies" className="block text-slate-600 hover:text-indigo-600" onClick={() => setMobileMenuOpen(false)}>
                Policies
              </a>
              <a href="#documentation" className="block text-slate-600 hover:text-indigo-600" onClick={() => setMobileMenuOpen(false)}>
                Documentation
              </a>
              <button
                onClick={() => { onLogin?.(); setMobileMenuOpen(false); }}
                className="w-full text-left text-slate-600 hover:text-indigo-600 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button
                onClick={() => { onGetStarted?.(); setMobileMenuOpen(false); }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 w-full flex justify-center items-center">
        <div className="max-w-4xl w-full mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6">
            Build Better
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Google Ads Campaigns
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Create, optimize, and manage your Google Ads campaigns with AI-powered tools designed for performance and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg font-semibold"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onLogin}
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 w-full flex justify-center items-center">
        <div className="max-w-7xl w-full mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to create and manage successful Google Ads campaigns
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section id="policies" className="py-20 px-4 sm:px-6 lg:px-8 w-full flex justify-center items-center">
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Policies & Legal</h2>
            <p className="text-xl text-slate-600">
              Transparent policies to protect you and your data
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((policy, index) => (
              <a
                key={index}
                href={policy.link}
                className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {policy.title}
                    </h3>
                    <p className="text-slate-600 text-sm">{policy.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="documentation" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 w-full flex justify-center items-center">
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Documentation</h2>
            <p className="text-xl text-slate-600">
              Learn how to get the most out of Adiology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/docs/getting-started"
              className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    Getting Started
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Quick start guide to create your first campaign
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </a>
            <a
              href="/docs/campaign-builder"
              className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    Campaign Builder Guide
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Learn how to use the AI-powered campaign builder
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </a>
            <a
              href="/docs/keyword-planner"
              className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    Keyword Planner
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Discover and analyze keywords for your campaigns
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </a>
            <a
              href="/docs/api"
              className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    API Documentation
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Integrate Adiology with your existing tools
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 w-full flex justify-center items-center">
        <div className="max-w-4xl w-full mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of marketers creating better Google Ads campaigns
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg font-semibold"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onLogin}
                className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <LogIn className="w-5 h-5" />
                Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 w-full flex justify-center items-center">
        <div className="max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Adiology
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                Build better Google Ads campaigns with AI-powered tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#documentation" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-indigo-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/help" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
                <li><a href="/docs" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
            <p>&copy; {new Date().getFullYear()} Adiology. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

