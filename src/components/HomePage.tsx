import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Check, Zap, TrendingUp, Shield, Sparkles, 
  BarChart3, Target, Rocket, Users, Globe, Lock, 
  FileText, Search, Layers, Megaphone, Award, Star,
  ChevronRight, Play, Sparkle, Settings, Clock, CheckCircle2,
  ArrowDown, Brain, LineChart, ShieldCheck, Globe2, Download,
  Mail, Phone, MapPin, Twitter, Linkedin, Github
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
      description: 'Generate hundreds of relevant keywords instantly using advanced AI technology. Our intelligent system analyzes your business and creates targeted keyword lists that drive results.',
      color: 'from-yellow-400 to-orange-500',
      image: '🔍'
    },
    {
      icon: Target,
      title: 'Smart Campaign Builder',
      description: 'Create professional Google Ads campaigns with guided step-by-step process. Build SKAG, STAG, or mixed campaign structures with ease.',
      color: 'from-blue-400 to-cyan-500',
      image: '🎯'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track performance and optimize your campaigns with real-time insights. Make data-driven decisions to improve your ROI.',
      color: 'from-green-400 to-emerald-500',
      image: '📊'
    },
    {
      icon: Shield,
      title: 'CSV Validation',
      description: 'Ensure your campaigns are Google Ads Editor ready with automatic validation. Export confidently knowing your data is perfect.',
      color: 'from-purple-400 to-pink-500',
      image: '✅'
    },
    {
      icon: Globe,
      title: 'Geo-Targeting',
      description: 'Target specific locations with intelligent city and region selection. Reach your audience where it matters most.',
      color: 'from-indigo-400 to-blue-500',
      image: '🌍'
    },
    {
      icon: Rocket,
      title: 'Export Ready',
      description: 'One-click export to Google Ads Editor format for immediate deployment. Get your campaigns live in minutes, not hours.',
      color: 'from-red-400 to-rose-500',
      image: '🚀'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Campaigns Created', icon: FileText },
    { value: '500K+', label: 'Keywords Generated', icon: Search },
    { value: '98%', label: 'Client Satisfaction', icon: Star },
    { value: '24/7', label: 'Support Available', icon: Clock }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Reduce campaign setup time from hours to minutes with our automated tools'
    },
    {
      icon: TrendingUp,
      title: 'Increase ROI',
      description: 'Optimize your campaigns with AI-powered insights and recommendations'
    },
    {
      icon: ShieldCheck,
      title: 'Reduce Errors',
      description: 'Automatic validation ensures your campaigns are error-free before export'
    },
    {
      icon: Brain,
      title: 'AI Intelligence',
      description: 'Leverage advanced AI to generate keywords and optimize ad performance'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechStart Inc.',
      content: 'Adiology transformed our Google Ads workflow. We went from spending days on campaign setup to minutes.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'PPC Specialist',
      company: 'Digital Agency',
      content: 'The keyword generation is incredible. It saved us countless hours and improved our campaign performance significantly.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'E-commerce Manager',
      company: 'Retail Pro',
      content: 'Best investment we made for our Google Ads campaigns. The CSV validation alone prevents so many errors.',
      rating: 5
    }
  ];

  const useCases = [
    {
      title: 'E-commerce Stores',
      description: 'Create product-focused campaigns with thousands of keywords in minutes',
      icon: '🛍️'
    },
    {
      title: 'Local Businesses',
      description: 'Target specific locations and generate location-based keywords',
      icon: '📍'
    },
    {
      title: 'SaaS Companies',
      description: 'Build comprehensive campaigns for software and service offerings',
      icon: '💻'
    },
    {
      title: 'Agencies',
      description: 'Scale your operations and manage multiple client campaigns efficiently',
      icon: '🏢'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
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
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1.5 inline-flex items-center gap-2">
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
              From keyword research to campaign export, we've got you covered.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg px-8 py-6 h-auto shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105 w-full sm:w-auto"
              >
                Start Building Campaigns <Rocket className="w-5 h-5 ml-2" />
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

            {/* Hero Image Placeholder */}
            <div className="max-w-5xl mx-auto mb-12 sm:mb-16 px-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-100 to-purple-100 p-8 sm:p-12 border border-indigo-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="text-4xl mb-2">📊</div>
                    <h3 className="font-bold text-slate-800 mb-2">Campaign Dashboard</h3>
                    <p className="text-sm text-slate-600">Real-time analytics and insights</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="text-4xl mb-2">🔍</div>
                    <h3 className="font-bold text-slate-800 mb-2">Keyword Generator</h3>
                    <p className="text-sm text-slate-600">AI-powered keyword research</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="text-4xl mb-2">🚀</div>
                    <h3 className="font-bold text-slate-800 mb-2">Export Ready</h3>
                    <p className="text-sm text-slate-600">One-click CSV export</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto mt-12 sm:mt-16 px-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 hover:shadow-lg transition-all">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
                  <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                  <div className="text-sm sm:text-base text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white/80">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
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
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all border border-slate-200">
                <benefit.icon className="w-10 h-10 text-indigo-600 mb-4" />
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
                <ul className="space-y-3">
                  {['Drag-and-drop campaign builder', 'Real-time preview', 'Instant validation', 'One-click export'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-8 sm:p-12 border border-indigo-200">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-semibold text-slate-700">Campaign Active</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">1,234 Keywords</div>
                    <div className="text-sm text-slate-600">45 Ad Groups</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-semibold text-slate-700">Performance</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">98% CTR</div>
                    <div className="text-sm text-slate-600">Optimized</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1.5">
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              From Idea to Campaign in 4 Steps
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Get your campaigns live in minutes, not days
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
            {[
              { step: '01', title: 'Setup Campaign', desc: 'Choose structure and geo-targeting', icon: Settings, image: '⚙️' },
              { step: '02', title: 'Generate Keywords', desc: 'AI-powered keyword research', icon: Search, image: '🔍' },
              { step: '03', title: 'Create Ads', desc: 'Build compelling ad copy', icon: Megaphone, image: '📢' },
              { step: '04', title: 'Export & Deploy', desc: 'Export to Google Ads Editor', icon: FileText, image: '📄' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 sm:p-8 border border-indigo-200 hover:shadow-xl transition-all h-full">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-4">{item.image}</div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-xl font-bold text-white">{item.step}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
                {idx < 3 && (
                  <ChevronRight className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 text-indigo-300 transform -translate-y-1/2" />
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {useCases.map((useCase, idx) => (
              <Card key={idx} className="border-2 border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="text-5xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{useCase.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 px-4 py-1.5">
              Customer Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              Loved by Marketers Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-2 border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-bold text-slate-800">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

      {/* Footer */}
      <footer className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div>
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
                Professional Google Ads campaign builder powered by AI. Transform your advertising workflow.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition"><Github className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">Campaign Builder</a></li>
                <li><a href="#" className="hover:text-white transition">Keyword Planner</a></li>
                <li><a href="#" className="hover:text-white transition">CSV Validator</a></li>
                <li><a href="#" className="hover:text-white transition">Ads Builder</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p className="text-slate-400">© 2024 Adiology. All rights reserved.</p>
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
