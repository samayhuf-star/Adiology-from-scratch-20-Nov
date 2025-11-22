import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Check, Zap, TrendingUp, Shield, Sparkles, 
  BarChart3, Target, Rocket, Users, Globe, Lock, 
  FileText, Search, Layers, Megaphone, Award, Star,
  ChevronRight, Play, Sparkle, Settings
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

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Keyword Generation',
      description: 'Generate hundreds of relevant keywords instantly using advanced AI technology',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Target,
      title: 'Smart Campaign Builder',
      description: 'Create professional Google Ads campaigns with guided step-by-step process',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track performance and optimize your campaigns with real-time insights',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'CSV Validation',
      description: 'Ensure your campaigns are Google Ads Editor ready with automatic validation',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Globe,
      title: 'Geo-Targeting',
      description: 'Target specific locations with intelligent city and region selection',
      color: 'from-indigo-400 to-blue-500'
    },
    {
      icon: Rocket,
      title: 'Export Ready',
      description: 'One-click export to Google Ads Editor format for immediate deployment',
      color: 'from-red-400 to-rose-500'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Campaigns Created' },
    { value: '500K+', label: 'Keywords Generated' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Adiology
                </h1>
                <p className="text-xs text-slate-500">Professional Campaign Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onLogin} className="text-slate-600 hover:text-indigo-600">
                Sign In
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1">
            <Sparkle className="w-3 h-3 mr-2" />
            Trusted by 10,000+ Marketers Worldwide
          </Badge>
          
          <h1 className={`text-6xl md:text-7xl font-bold mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Build Winning Google Ads
            </span>
            <br />
            <span className="text-slate-800">Campaigns in Minutes</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The most powerful, AI-driven platform for creating, managing, and optimizing your Google Ads campaigns. 
            From keyword research to campaign export, we've got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg px-8 py-6 h-auto shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105"
            >
              Start Building Campaigns <Rocket className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 h-auto border-2 border-slate-300 hover:border-indigo-400"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Built with 20 years of digital marketing expertise, Adiology provides all the tools you need to create winning campaigns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card 
                key={idx} 
                className="border-2 border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl group cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              From Idea to Campaign in 4 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Setup Campaign', desc: 'Choose structure and geo-targeting', icon: Settings },
              { step: '02', title: 'Generate Keywords', desc: 'AI-powered keyword research', icon: Search },
              { step: '03', title: 'Create Ads', desc: 'Build compelling ad copy', icon: Megaphone },
              { step: '04', title: 'Export & Deploy', desc: 'Export to Google Ads Editor', icon: FileText },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <ChevronRight className="hidden md:block absolute top-10 left-full w-8 h-8 text-indigo-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl overflow-hidden">
            <CardContent className="p-12 text-center text-white">
              <Sparkle className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Transform Your Google Ads?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of marketers who trust Adiology for their campaign management
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={onGetStarted}
                  className="bg-white text-indigo-600 hover:bg-slate-100 text-lg px-8 py-6 h-auto"
                >
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={onLogin}
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Sparkle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Adiology</span>
              </div>
              <p className="text-sm">Professional Google Ads campaign builder powered by AI.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Campaign Builder</a></li>
                <li><a href="#" className="hover:text-white transition">Keyword Planner</a></li>
                <li><a href="#" className="hover:text-white transition">CSV Validator</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© 2024 Adiology. All rights reserved.</p>
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
      `}</style>
    </div>
  );
};

