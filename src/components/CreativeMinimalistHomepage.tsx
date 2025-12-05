import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Brain, Layers, Network, Shield, Sparkles } from 'lucide-react';

interface CreativeMinimalistHomepageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
  onSelectPlan?: (planName: string, priceId: string, amount: number, isSubscription: boolean) => void;
}

export default function CreativeMinimalistHomepage({ 
  onGetStarted, 
  onLogin, 
  onSelectPlan 
}: CreativeMinimalistHomepageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load Microedits script on home page
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.microedits.com/XGgDKb-.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      const existingScript = document.querySelector('script[src="https://app.microedits.com/XGgDKb-.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <Navigation onGetStarted={onGetStarted} onLogin={onLogin} />

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20"
      >
        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => {
            const randomX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000;
            const randomY = typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 800;
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                initial={{ 
                  x: randomX,
                  y: randomY,
                  opacity: 0
                }}
                animate={{
                  y: [null, typeof window !== 'undefined' ? Math.random() * window.innerHeight : randomY + 200],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            );
          })}
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.h1 
              className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              whileHover={{ 
                scale: 1.02,
                filter: 'brightness(1.2)'
              }}
            >
              TRANSFORM YOUR
              <br />
              <motion.span
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  background: 'linear-gradient(90deg, #a78bfa, #3b82f6, #ec4899, #a78bfa)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CAMPAIGN WORKFLOW
              </motion.span>
              <br />
              WITH ADIOLOGY
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Stop guessing what works. Copy proven campaign structures that dominate search results and deliver results from day one.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-6 justify-center"
          >
            <motion.button
              onClick={onGetStarted}
              className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl font-bold text-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  backgroundSize: '200% 100%',
                }}
              />
              <span className="relative z-10 flex items-center gap-3">
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              onClick={onGetStarted}
              className="px-10 py-5 bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              See It In Action
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Showcase - Interactive Grid */}
      <FeatureShowcase onGetStarted={onGetStarted} />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Final CTA */}
      <FinalCTA onGetStarted={onGetStarted} />
    </div>
  );
}

// Navigation Component
function Navigation({ onGetStarted, onLogin }: { onGetStarted?: () => void; onLogin?: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <span className="text-white font-bold text-xl">adiology</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <button onClick={onLogin} className="text-gray-300 hover:text-white transition-colors">Sign In</button>
            <motion.button
              onClick={onGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 space-y-3"
            >
              <a href="#features" className="block text-gray-300 hover:text-white">Features</a>
              <a href="#pricing" className="block text-gray-300 hover:text-white">Pricing</a>
              <button onClick={onLogin} className="block w-full text-left text-gray-300 hover:text-white">Sign In</button>
              <button onClick={onGetStarted} className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold">
                Get Started
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

// Feature Showcase - Interactive Grid (Bento-box style)
function FeatureShowcase({ onGetStarted }: { onGetStarted?: () => void }) {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience instant campaign deployment. Launch complete Google Ads infrastructure in minutes, not weeks.',
      gradient: 'from-yellow-400 to-orange-500',
      size: 'large' as const,
    },
    {
      icon: Brain,
      title: 'AI Intelligence',
      description: 'Let intelligence do the heavy lifting. Our AI automatically creates high-quality ads and extensions.',
      gradient: 'from-purple-500 to-pink-500',
      size: 'medium' as const,
    },
    {
      icon: Layers,
      title: 'Infinite Flexibility',
      description: 'Mold it perfectly to your vision. 12 proven campaign structures, 30+ templates, unlimited customization.',
      gradient: 'from-blue-500 to-cyan-500',
      size: 'medium' as const,
    },
    {
      icon: Network,
      title: 'Seamless Harmony',
      description: 'Unite your team in perfect synchronization. Real-time collaboration and shared campaign libraries.',
      gradient: 'from-green-500 to-emerald-500',
      size: 'small' as const,
    },
    {
      icon: Shield,
      title: 'Fortress Protection',
      description: 'Fortress-grade security with feather-light experience. Enterprise security without the complexity.',
      gradient: 'from-indigo-500 to-purple-500',
      size: 'small' as const,
    },
    {
      icon: Sparkles,
      title: 'Future Forward',
      description: 'The future of campaign management is here. Cutting-edge features that keep you ahead of the competition.',
      gradient: 'from-pink-500 to-rose-500',
      size: 'large' as const,
    },
  ];

  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="text-white">To Dominate Search</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colSpan = feature.size === 'large' ? 'md:col-span-2 lg:col-span-2' : '';
            const rowSpan = feature.size === 'large' ? 'md:row-span-2' : '';

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`group relative ${colSpan} ${rowSpan} bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all cursor-pointer overflow-hidden`}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity`}
                />
                <div className="relative z-10">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  <motion.div
                    className="mt-6 flex items-center gap-2 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <span className="text-sm font-semibold">Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Social Proof Section
function SocialProofSection() {
  const [counters, setCounters] = useState({ users: 0, campaigns: 0, savings: 0 });

  useEffect(() => {
    const targets = { users: 10000, campaigns: 50000, savings: 95 };
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    const interval = setInterval(() => {
      setCounters(prev => ({
        users: Math.min(prev.users + Math.ceil(targets.users / steps), targets.users),
        campaigns: Math.min(prev.campaigns + Math.ceil(targets.campaigns / steps), targets.campaigns),
        savings: Math.min(prev.savings + targets.savings / steps, targets.savings),
      }));
    }, increment);

    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      quote: "Cut our campaign setup time from weeks to minutes. This is a game-changer.",
      author: "Sarah Chen",
      role: "Marketing Director",
      company: "TechCorp"
    },
    {
      quote: "The AI ad builder alone is worth 10x the price. Incredible quality.",
      author: "Michael Rodriguez",
      role: "PPC Manager",
      company: "Growth Agency"
    },
    {
      quote: "Finally, a tool that understands how campaigns actually work.",
      author: "Emily Johnson",
      role: "Founder",
      company: "StartupXYZ"
    }
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
            Trusted by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Industry Leaders</span>
          </h2>
        </motion.div>

        {/* Animated Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { value: counters.users, label: 'Happy Users', suffix: '+' },
            { value: counters.campaigns, label: 'Campaigns Launched', suffix: '+' },
            { value: counters.savings, label: 'Time Saved', suffix: '%' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
            >
              <motion.div
                className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
                key={stat.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {stat.value.toLocaleString()}{stat.suffix}
              </motion.div>
              <div className="text-gray-300 text-lg">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all"
            >
              <div className="text-yellow-400 mb-4">★★★★★</div>
              <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div>
                <div className="text-white font-semibold">{testimonial.author}</div>
                <div className="text-gray-400 text-sm">{testimonial.role}, {testimonial.company}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTA({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, 100, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"
              animate={{
                x: [0, -100, 0],
                y: [0, -100, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
                delay: 5
              }}
            />
          </div>

          <div className="relative z-10">
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              Ready to Transform
              <br />
              Your Campaigns?
            </motion.h2>
            <motion.p
              className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join thousands of marketers who've already made the switch. Start your journey today—no credit card required.
            </motion.p>
            <motion.button
              onClick={onGetStarted}
              className="group relative px-12 py-6 bg-white text-purple-600 rounded-2xl font-black text-xl overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <span className="relative z-10 flex items-center gap-3">
                Start Your Journey Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </motion.button>
            <motion.div
              className="mt-8 flex items-center justify-center gap-6 text-white/80 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Setup in minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>14-day money back</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

