import { motion } from 'motion/react';

export function BuilderSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm mb-6">
              Builder 2.0 Campaign Wizard
            </div>
            
            <h2 className="text-gray-900 mb-6">
              See Everything Live and Go Live in <span className="text-orange-600">30 Seconds</span>
            </h2>
            
            <p className="text-gray-600 text-lg mb-8">
              Builder 2.0 makes campaign creation effortless. With zip targeting of 30,000 zips or 500 cities, live previews, and complete presets for everything, launching campaigns has never been faster.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  title: 'Smart Zip Targeting',
                  description: 'Target 30,000 zip codes or 500 cities with precision instantly'
                },
                {
                  title: 'Live Campaign Preview',
                  description: 'See your campaign exactly as it will appear before going live'
                },
                {
                  title: '30-Second Launch',
                  description: 'From start to live in just 30 seconds with no complex setup'
                },
                {
                  title: 'Complete Preset Library',
                  description: 'Every aspect has a preset: keywords, audiences, bids, schedules'
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
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
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

            <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-2 group">
              Try Campaign Wizard
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>

          {/* Right - Wizard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-xl">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                {/* Wizard Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
                  <div className="text-sm opacity-90 mb-2">Campaign Wizard</div>
                  <div className="text-2xl mb-4">Launch Your Campaign</div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className={`h-1 flex-1 rounded ${step <= 2 ? 'bg-white' : 'bg-white/30'}`} />
                    ))}
                  </div>
                </div>

                {/* Wizard Content */}
                <div className="p-6 space-y-6 bg-white">
                  {/* Targeting Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🎯</span>
                      <span className="text-gray-900">Geographic Targeting</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-orange-50 border-2 border-orange-500 rounded-lg">
                        <div className="text-sm text-orange-600">30,000 Zip Codes</div>
                      </div>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-sm text-gray-600">500 Cities</div>
                      </div>
                    </div>
                  </div>

                  {/* Template Selection */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🎨</span>
                      <span className="text-gray-900">Template</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`aspect-video ${i === 1 ? 'bg-orange-100 border-2 border-orange-500' : 'bg-gray-100 border border-gray-200'} rounded-lg`} />
                      ))}
                    </div>
                  </div>

                  {/* Live Preview Button */}
                  <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
                    <span>Preview & Go Live</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center mt-6">
                <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                  <div className="text-2xl text-orange-600">30K</div>
                  <div className="text-xs text-gray-500">Zip Codes</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                  <div className="text-2xl text-red-600">500</div>
                  <div className="text-xs text-gray-500">Cities</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                  <div className="text-2xl text-orange-600">30s</div>
                  <div className="text-xs text-gray-500">Launch Time</div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-4 text-white"
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="text-xs opacity-90">Time to Launch</div>
              <div className="text-2xl">⚡ 30s</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Use Case Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap gap-3 justify-center"
        >
          <span className="text-gray-500 text-sm">Perfect for:</span>
          {['Quick Launches', 'Geo-Targeted Campaigns', 'Multi-City Campaigns', 'Preset Campaigns', 'A/B Testing', 'Rapid Deployment'].map((useCase) => (
            <span key={useCase} className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm border border-orange-100">
              {useCase}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
