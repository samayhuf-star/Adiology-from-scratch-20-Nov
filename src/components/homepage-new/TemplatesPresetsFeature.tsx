import { motion } from 'framer-motion';
import { useState } from 'react';

export function TemplatesPresetsFeature() {
  const [activeTab, setActiveTab] = useState<'templates' | 'presets'>('templates');

  const templateCategories = [
    { name: 'Mobile Optimized', icon: '📱' },
    { name: 'SEO Ready', icon: '🔍' },
    { name: 'High Converting', icon: '💰' },
    { name: 'Instant Deploy', icon: '⚡' },
    { name: 'Custom Domains', icon: '🌐' },
    { name: 'Fast Loading', icon: '🚀' }
  ];

  const presetIndustries = [
    { name: 'Plumber', icon: '🔧', color: 'blue' },
    { name: 'Electrician', icon: '⚡', color: 'yellow' },
    { name: 'Law Firm', icon: '⚖️', color: 'gray' },
    { name: 'Pest Control', icon: '🐛', color: 'green' },
    { name: 'Lawn Care', icon: '🌱', color: 'emerald' },
    { name: 'Flight', icon: '✈️', color: 'sky' }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-blue-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 rounded-full text-sm mb-6">
              Ready to Launch in 30 Seconds
            </div>
            
            <h2 className="text-gray-900 mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">30+ Templates</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">30+ Presets</span>
            </h2>
            
            <p className="text-gray-600 text-lg mb-8">
              Professional, conversion-optimized landing page templates paired with pre-configured Google Ad campaigns for every industry. Simply edit text, images, and launch—no coding, no hassle. From electricians to law firms, we've got you covered.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  title: 'Instant Deployment',
                  description: '30+ professional templates ready to go live in seconds'
                },
                {
                  title: 'Industry-Optimized Campaigns',
                  description: '30+ pre-configured Google Ad campaigns for all verticals'
                },
                {
                  title: 'Zero Coding Required',
                  description: 'Edit text and images—launch without technical knowledge'
                },
                {
                  title: 'Complete Workflow',
                  description: 'Website + campaigns working together from day one'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-gray-900 mb-1">{item.title}</div>
                    <div className="text-gray-600 text-sm">{item.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-2 group">
              Explore Templates & Presets
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>

          {/* Right - Interactive Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
              {/* Tab Selector */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                    activeTab === 'templates'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">🎨</span>
                    <span>30+ Templates</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('presets')}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                    activeTab === 'presets'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">🚀</span>
                    <span>30+ Presets</span>
                  </div>
                </button>
              </div>

              {/* Templates View */}
              {activeTab === 'templates' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key="templates"
                >
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
                    {/* Template Preview */}
                    <div className="bg-white rounded-xl overflow-hidden mb-4 border-2 border-gray-200">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2"></div>
                      <div className="p-6">
                        <div className="flex gap-3 mb-4">
                          <div className="text-4xl">🎨</div>
                          <div className="flex-1">
                            <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                            <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Template Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-xl text-purple-600">30+</div>
                        <div className="text-xs text-gray-500">Templates</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-xl text-pink-600">100%</div>
                        <div className="text-xs text-gray-500">Mobile Ready</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-xl text-green-600">30s</div>
                        <div className="text-xs text-gray-500">Go Live</div>
                      </div>
                    </div>
                  </div>

                  {/* Template Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {templateCategories.map((cat, index) => (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg border border-purple-100"
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-sm text-gray-700">{cat.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Presets View */}
              {activeTab === 'presets' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key="presets"
                >
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 mb-6">
                    {/* Campaign Preview */}
                    <div className="bg-white rounded-xl p-4 mb-4 border-2 border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-xl">
                          🚀
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-900 mb-1">Ready Campaign</div>
                          <div className="text-xs text-gray-500">Pre-configured & Optimized</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="flex items-center gap-2 bg-orange-50 p-2 rounded"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="text-xs text-gray-600">Ad Group {i} Ready</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Preset Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-xl text-orange-600">30+</div>
                        <div className="text-xs text-gray-500">Industries</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-xl text-red-600">100%</div>
                        <div className="text-xs text-gray-500">Optimized</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-xl text-green-600">1-Click</div>
                        <div className="text-xs text-gray-500">Launch</div>
                      </div>
                    </div>
                  </div>

                  {/* Industry Pills */}
                  <div className="grid grid-cols-2 gap-2">
                    {presetIndustries.map((industry, index) => (
                      <motion.div
                        key={industry.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100"
                      >
                        <span className="text-xl">{industry.icon}</span>
                        <span className="text-sm text-gray-700">{industry.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Floating Badge */}
              <motion.div
                className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-4 text-white"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="text-xs opacity-90">Combined</div>
                <div className="text-2xl">✨ 60+</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Industry Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap gap-3 justify-center"
        >
          <span className="text-gray-500 text-sm">Available for:</span>
          {['Plumber', 'Electrician', 'Law Firm', 'Pest Control', 'Lawn Care', 'Flight', 'HVAC', 'Roofing', 'Dentist', 'Real Estate'].map((industry) => (
            <span key={industry} className="px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 rounded-full text-sm border border-orange-100">
              {industry}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
