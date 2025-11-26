import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Check, Zap, TrendingUp, Shield, Sparkles, 
  BarChart3, Target, Rocket, Users, Globe,
  FileText, Search, Layers, Megaphone, Award, Star,
  ChevronRight, Settings, Clock, CheckCircle2,
  Brain, ShieldCheck, Download,
  Mail, MapPin, Twitter, Linkedin, Github, Facebook,
  Menu, X, Wand2, FileCheck,
  MessageSquare, Gift, Infinity, Timer,
  Activity, Filter, Split, Network, Funnel, TrendingDown, Play,
  Crown, CreditCard
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const campaignStructures = [
    { name: 'SKAG', icon: Zap, color: 'from-yellow-400 to-orange-500' },
    { name: 'STAG', icon: TrendingUp, color: 'from-blue-400 to-cyan-500' },
    { name: 'MIX', icon: Layers, color: 'from-indigo-400 to-purple-500' },
    { name: 'STAG+', icon: Brain, color: 'from-purple-400 to-pink-500' },
    { name: 'IBAG', icon: Target, color: 'from-green-400 to-emerald-500' },
    { name: 'Alpha-Beta', icon: Split, color: 'from-red-400 to-rose-500' },
    { name: 'Match-Type', icon: Filter, color: 'from-teal-400 to-cyan-500' },
    { name: 'GEO', icon: Globe, color: 'from-blue-500 to-indigo-600' },
    { name: 'Funnel', icon: Funnel, color: 'from-orange-400 to-red-500' },
    { name: 'Brand Split', icon: Users, color: 'from-violet-400 to-purple-500' },
    { name: 'Competitor', icon: TrendingDown, color: 'from-pink-400 to-rose-500' },
    { name: 'Smart Cluster', icon: Network, color: 'from-indigo-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Modern Glass Nav with Animation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-900/5' : 'bg-white/70 backdrop-blur-md'} border-b border-slate-200/50`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Adiology
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <Button variant="ghost" onClick={onLogin} className="text-sm font-medium hover:bg-indigo-50/50">
              Sign In
            </Button>
            <Button onClick={onGetStarted} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all">
              Get Started
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
          
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top duration-300">
            <div className="px-6 py-4 space-y-3">
              <a href="#features" className="block text-slate-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="block text-slate-700 hover:text-indigo-600 font-medium transition-colors">Pricing</a>
              <Button variant="ghost" onClick={onLogin} className="w-full justify-start font-medium">Sign In</Button>
              <Button onClick={onGetStarted} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero - Modern with Gradient Background */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-8 border border-indigo-100 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Trusted by 10,000+ marketers worldwide
            </span>
          </div>
            
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-tight">
            <span className="inline-block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-in slide-in-from-bottom duration-700">
              Build Winning
            </span>
            <br />
            <span className="inline-block text-slate-900 animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '100ms' }}>
              Google Ads Campaigns
            </span>
            <br />
            <span className="inline-block text-3xl md:text-5xl text-slate-600 animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
              in Minutes, Not Days ⚡
            </span>
          </h1>
            
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in duration-700" style={{ animationDelay: '300ms' }}>
            The AI-powered platform that transforms campaign creation from days to minutes. 
            <span className="block mt-2 font-semibold text-indigo-600">Professional campaigns, zero complexity.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in-50 duration-700" style={{ animationDelay: '400ms' }}>
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-6 text-lg font-semibold shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-105 transition-all group"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 px-10 py-6 text-lg font-semibold backdrop-blur-sm bg-white/50 hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Enhanced Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm animate-in fade-in duration-700" style={{ animationDelay: '500ms' }}>
            {[
              { icon: CheckCircle2, text: 'No credit card required' },
              { icon: Infinity, text: 'Free forever plan' },
              { icon: Timer, text: '5 minute setup' }
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                <badge.icon className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-slate-700">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar - Enhanced with Cards */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10K+', label: 'Campaigns Created', icon: Megaphone, color: 'from-blue-500 to-cyan-500' },
              { value: '500K+', label: 'Keywords Generated', icon: Search, color: 'from-purple-500 to-pink-500' },
              { value: '98%', label: 'Satisfaction Rate', icon: Star, color: 'from-yellow-500 to-orange-500' },
              { value: '24/7', label: 'Expert Support', icon: ShieldCheck, color: 'from-emerald-500 to-teal-500' },
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="relative group bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-black text-slate-900 mb-2 bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-600">{stat.label}</div>
                
                {/* Hover Effect Gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaign Structures - Modern Bento Grid */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-white to-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 px-4 py-1.5 shadow-lg shadow-indigo-500/30">
              ✨ Builder 2.0
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
              Pre-built Campaign
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Structures
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Professional structures optimized for maximum ROI from day one
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {campaignStructures.map((structure, idx) => {
              const Icon = structure.icon;
              return (
                <div
                  key={idx}
                  onClick={onGetStarted}
                  className="group relative bg-white border-2 border-slate-200 rounded-3xl p-6 hover:border-indigo-400 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Background Gradient on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${structure.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${structure.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                      {structure.name}
                    </h3>
                  </div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features - Modern Cards with Icons */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Zap, 
                title: 'AI-Powered Keywords',
                desc: 'Generate 1000+ relevant keywords instantly with our advanced AI engine',
                gradient: 'from-yellow-500 to-orange-500',
                bgGradient: 'from-yellow-50 to-orange-50'
              },
              { 
                icon: Target, 
                title: 'Smart Campaigns',
                desc: 'Professional campaign structures ready in just 5 minutes',
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50'
              },
              { 
                icon: FileCheck,
                title: 'Zero Errors',
                desc: 'Automatic validation and error checking before export',
                gradient: 'from-emerald-500 to-green-500',
                bgGradient: 'from-emerald-50 to-green-50'
              },
              { 
                icon: Globe,
                title: 'Geo-Targeting',
                desc: 'Precise location-based campaigns with advanced targeting',
                gradient: 'from-indigo-500 to-purple-500',
                bgGradient: 'from-indigo-50 to-purple-50'
              },
              {
                icon: Wand2,
                title: 'AI Ad Copy',
                desc: 'Compelling ad copy written automatically by AI',
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-50 to-pink-50'
              },
              {
                icon: Download,
                title: 'Instant Export',
                desc: 'Google Ads Editor ready CSV files in one click',
                gradient: 'from-rose-500 to-red-500',
                bgGradient: 'from-rose-50 to-red-50'
              },
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Enhanced Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-indigo-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-4 py-1.5 shadow-lg">
              ⭐ 4.9/5 Rating
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Loved by
              <span className="block mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                10,000+ Marketers
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote: "Transformed our workflow completely. We went from spending days on campaign creation to just minutes. The ROI has been incredible!",
                author: "Sarah Johnson",
                role: "Marketing Director",
                company: "TechCorp",
                result: "75% time saved",
                avatar: "SJ"
              },
              {
                quote: "The AI keyword generation is mind-blowing. Our CTR increased by 40% and we're seeing significantly better quality scores across the board.",
                author: "Michael Chen",
                role: "PPC Specialist",
                company: "GrowthLabs",
                result: "40% CTR increase",
                avatar: "MC"
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-2 border-slate-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <CardContent className="p-8 relative">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg text-slate-700 mb-8 leading-relaxed italic font-medium">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{testimonial.author}</p>
                          <p className="text-sm text-slate-600">{testimonial.role}</p>
                          <p className="text-xs text-slate-500">{testimonial.company}</p>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg px-4 py-2 text-sm font-semibold">
                        {testimonial.result}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Modern Cards with Gradients */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-white via-indigo-50/30 to-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 px-4 py-1.5 shadow-lg">
              💰 Simple Pricing
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-4">
              Choose Your
              <span className="block mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              No hidden fees • Cancel anytime • 14-day money back guarantee
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Starter', price: '$99.99', period: 'lifetime', campaigns: '15/month', popular: false, icon: Rocket, gradient: 'from-blue-500 to-cyan-500' },
              { name: 'Pro', price: '$199', period: 'lifetime', campaigns: 'Unlimited', popular: true, icon: Zap, gradient: 'from-indigo-600 to-purple-600' },
              { name: 'Growth', price: '$49.99', period: 'per month', campaigns: '25/month', popular: false, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500' },
              { name: 'Enterprise', price: '$99.99', period: 'per month', campaigns: 'Unlimited', popular: false, icon: Crown, gradient: 'from-purple-500 to-pink-500' },
            ].map((plan, idx) => {
              const Icon = plan.icon;
              return (
                <div
                  key={idx}
                  className={`relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 hover:-translate-y-2 overflow-hidden group ${
                    plan.popular 
                      ? 'border-indigo-500 shadow-2xl shadow-indigo-500/30 scale-105 lg:scale-110' 
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-xl'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 px-6 py-1.5 shadow-lg font-bold">
                        ⭐ Popular
                      </Badge>
                    </div>
                  )}
                  
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-indigo-50 to-purple-50' 
                      : 'bg-gradient-to-br from-slate-50 to-white group-hover:from-indigo-50/30 group-hover:to-purple-50/30'
                  } transition-all duration-300`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">{plan.name}</h3>
                      <div className="text-5xl font-black bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent mb-1">
                        {plan.price}
                      </div>
                      <div className="text-sm font-medium text-slate-600">{plan.period}</div>
                    </div>

                    <ul className="space-y-3 mb-6 text-sm">
                      {[
                        `${plan.campaigns} campaigns`,
                        'AI keyword generation',
                        'All campaign structures',
                        'CSV export',
                        '24/7 priority support'
                      ].map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-slate-700">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      onClick={onGetStarted}
                      className={`w-full font-bold shadow-lg transition-all duration-300 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/40 hover:shadow-xl hover:scale-105' 
                          : 'bg-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-slate-900 hover:text-white border-2 border-slate-300 hover:border-transparent hover:scale-105'
                      }`}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Banner */}
          <div className="mt-16 text-center">
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {[
                { icon: ShieldCheck, text: '14-day money back' },
                { icon: CreditCard, text: 'Secure payments' },
                { icon: Users, text: '10K+ happy users' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-600">
                  <item.icon className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Enhanced with Background */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8 border border-white/30">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              Limited time: Get 20% off Pro plan
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Ready to transform
            <br />
            your campaigns? 🚀
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of marketers building better campaigns with Adiology.
            <span className="block mt-2 font-semibold">Start free today, no credit card required.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-white hover:bg-slate-50 text-indigo-600 px-12 py-7 text-lg font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all group"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={onLogin}
              className="border-2 border-white/50 hover:bg-white/10 text-white backdrop-blur-sm px-12 py-7 text-lg font-bold hover:scale-105 transition-all"
            >
              Sign In
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-12 text-white">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '500K+', label: 'Campaigns Created' },
              { value: '98%', label: 'Satisfaction' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-black mb-1">{stat.value}</div>
                <div className="text-sm text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Modern with Gradient */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Adiology</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                The AI-powered platform for creating professional Google Ads campaigns in minutes.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-600 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-600 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-600 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110">
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                {['Features', 'Pricing', 'Campaign Builder', 'Templates', 'Integrations'].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                {['Documentation', 'Blog', 'Support', 'API Reference', 'Status'].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                {['About', 'Careers', 'Privacy', 'Terms', 'Contact'].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} Adiology. All rights reserved. Built with ❤️ for marketers.
            </div>
            <div className="flex gap-6 text-sm">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, idx) => (
                <a key={idx} href="#" className="text-slate-400 hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
