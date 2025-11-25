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
  Activity, Filter, Split, Network, Funnel, TrendingDown, Play
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
    <div className="min-h-screen bg-white">
      {/* Minimalist Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
      </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Adiology
            </span>
              </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition">Features</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition">Pricing</a>
            <Button variant="ghost" onClick={onLogin} className="text-sm">Sign In</Button>
            <Button onClick={onGetStarted} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
              Get Started
              </Button>
          </div>

          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
          </div>
          
          {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-slate-600 hover:text-slate-900">Features</a>
              <a href="#pricing" className="block text-slate-600 hover:text-slate-900">Pricing</a>
              <Button variant="ghost" onClick={onLogin} className="w-full justify-start">Sign In</Button>
              <Button onClick={onGetStarted} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                Get Started
                </Button>
              </div>
            </div>
          )}
      </nav>

      {/* Hero - Ultra Minimalist */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full mb-8 border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm text-slate-600">Trusted by 10,000+ marketers</span>
          </div>
            
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-slate-900 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Build Winning
              </span>
              <br />
            <span className="text-slate-900">Google Ads Campaigns</span>
            </h1>
            
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            The AI-powered platform that transforms campaign creation from days to minutes. 
            Professional campaigns, zero complexity.
            </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                onClick={onGetStarted}
              size="lg"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 group"
              >
              Start Building Free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-slate-200 hover:border-slate-300"
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Demo
              </Button>
            </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No credit card</span>
                  </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Free forever</span>
                  </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>5min setup</span>
              </div>
            </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 border-y border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Campaigns', icon: FileText },
              { value: '500K+', label: 'Keywords', icon: Search },
              { value: '98%', label: 'Satisfaction', icon: Star },
              { value: '24/7', label: 'Support', icon: Clock },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-3 text-indigo-600" />
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Campaign Structures - Modern Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-slate-100 text-slate-700 border-0">Builder 2.0</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Pre-built Campaign Structures
              </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
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
                  className="group relative bg-white border border-slate-100 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${structure.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                  <h3 className="font-bold text-slate-900">{structure.name}</h3>
                </div>
              );
            })}
              </div>
            </div>
      </section>

      {/* Features - Clean Layout */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
              {[
                { 
                  icon: Zap, 
                title: 'AI-Powered Keywords',
                desc: 'Generate 1000+ relevant keywords instantly',
                color: 'text-yellow-600'
                },
                { 
                  icon: Target, 
                title: 'Smart Campaigns',
                desc: 'Professional structures in 5 minutes',
                color: 'text-blue-600'
                },
                { 
                icon: FileCheck,
                title: 'Zero Errors',
                desc: 'Automatic validation before export',
                color: 'text-green-600'
                },
                { 
                icon: Globe,
                title: 'Geo-Targeting',
                desc: 'Precise location-based campaigns',
                color: 'text-indigo-600'
                },
              {
                icon: Wand2,
                title: 'AI Ad Copy',
                desc: 'Compelling ads written automatically',
                color: 'text-purple-600'
              },
              {
                icon: Rocket,
                title: 'Instant Export',
                desc: 'Google Ads Editor ready in one click',
                color: 'text-red-600'
              },
            ].map((feature, idx) => (
              <div key={idx} className="relative">
                <feature.icon className={`w-10 h-10 mb-4 ${feature.color}`} />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Loved by Marketers
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "Transformed our workflow. We went from days to minutes.",
                author: "Sarah Johnson",
                role: "Marketing Director",
                result: "75% time saved"
              },
              {
                quote: "The AI keyword generation is incredible. CTR up 40%.",
                author: "Michael Chen",
                role: "PPC Specialist",
                result: "40% CTR increase"
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-slate-100">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-lg text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{testimonial.author}</p>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-0">{testimonial.result}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Minimalist */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Simple Pricing
              </h2>
            <p className="text-xl text-slate-600">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Starter', price: '$99.99', period: 'lifetime', campaigns: '15/month', popular: false },
              { name: 'Pro', price: '$199', period: 'lifetime', campaigns: 'Unlimited', popular: true },
              { name: 'Growth', price: '$49.99', period: 'per month', campaigns: '25/month', popular: false },
              { name: 'Enterprise', price: '$99.99', period: 'per month', campaigns: 'Unlimited', popular: false },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all ${
                  plan.popular ? 'border-indigo-600 shadow-xl' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white border-0">Popular</Badge>
              </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">{plan.name}</h3>
                  <div className="text-4xl font-bold text-slate-900 mb-1">{plan.price}</div>
                  <div className="text-sm text-slate-600">{plan.period}</div>
                </div>

                <ul className="space-y-3 mb-6 text-sm">
                  {[
                    `${plan.campaigns} campaigns`,
                    'AI keyword generation',
                    'All campaign structures',
                    'CSV export',
                    '24/7 support'
                  ].map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                  </li>
                  ))}
                </ul>

                <Button 
                  onClick={onGetStarted}
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full ${plan.popular ? 'bg-slate-900 hover:bg-slate-800 text-white' : ''}`}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Ready to transform your campaigns?
            </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of marketers building better campaigns with Adiology
          </p>
                <Button 
            onClick={onGetStarted}
                  size="lg"
            className="bg-slate-900 hover:bg-slate-800 text-white px-8"
                >
            Start Building Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
        </div>
      </section>

      {/* Footer - Ultra Minimal */}
      <footer className="border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
                </div>
              <span className="text-lg font-bold text-slate-900">Adiology</span>
                </div>

            <div className="flex gap-6 text-sm">
              <a href="#features" className="text-slate-600 hover:text-slate-900">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900">Pricing</a>
              <a href="#" className="text-slate-600 hover:text-slate-900">Support</a>
              </div>

            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-slate-900 transition">
                <Twitter className="w-5 h-5" />
                </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition">
                <Linkedin className="w-5 h-5" />
                </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition">
                <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100 text-sm text-slate-600">
            <p>© 2025 Adiology. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-900">Privacy</a>
              <a href="#" className="hover:text-slate-900">Terms</a>
              <a href="mailto:support@adiology.com" className="hover:text-slate-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
