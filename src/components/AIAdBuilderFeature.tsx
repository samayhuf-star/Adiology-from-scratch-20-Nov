import { motion } from 'framer-motion';

export function AIAdBuilderFeature() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-blue-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 rounded-full text-sm mb-6">
              AI-Powered Ad Creation
            </div>
            
            <h2 className="text-gray-900 mb-6">
              AI Builds Your <span className="text-purple-600">High-Quality Ads</span> & Extensions
            </h2>
            
            <p className="text-gray-600 text-lg mb-8">
              Our AI automatically creates super high-quality ads and all Google extensions to maximize your Ad Rank and beat your competitors from day one.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  title: 'Maximum Ad Rank',
                  description: 'AI optimizes every element for the highest Quality Score'
                },
                {
                  title: 'Beat Competitors',
                  description: 'Advanced analysis ensures you outperform competition'
                },
                {
                  title: 'All Extension Types',
                  description: 'Automatically creates all relevant Google extensions'
                },
                {
                  title: 'Instant Generation',
                  description: 'Complete ad sets generated in seconds, not hours'
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
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
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

            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-2 group">
              Let AI Build Your Ads
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>

          {/* Right - Extension Coverage */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-gray-900">Complete Extension Coverage</h3>
                  <p className="text-gray-500 text-sm">All 10 extension types included</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { name: 'Sitelink Extensions', icon: '🔗' },
                  { name: 'Callout Extensions', icon: '💬' },
                  { name: 'Structured Snippets', icon: '📋' },
                  { name: 'Call Extensions', icon: '📞' },
                  { name: 'Location Extensions', icon: '📍' },
                  { name: 'Price Extensions', icon: '💰' },
                  { name: 'App Extensions', icon: '📱' },
                  { name: 'Promotion Extensions', icon: '🎁' },
                  { name: 'Image Extensions', icon: '🖼️' },
                  { name: 'Lead Form Extensions', icon: '📝' }
                ].map((extension, index) => (
                  <motion.div
                    key={extension.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-lg">{extension.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 text-xs truncate">{extension.name}</div>
                      </div>
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center pt-6 border-t border-gray-200">
                <div className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                  <div className="text-2xl text-purple-600">10/10</div>
                  <div className="text-xs text-gray-500">Quality Score</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                  <div className="text-2xl text-blue-600">+340%</div>
                  <div className="text-xs text-gray-500">CTR Boost</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                  <div className="text-2xl text-green-600">{'<10s'}</div>
                  <div className="text-xs text-gray-500">Generation</div>
                </div>
              </div>

              {/* Badge */}
              <motion.div
                className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-4 text-white"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="text-xs opacity-90">Coverage</div>
                <div className="text-2xl">✅ 100%</div>
              </motion.div>
            </div>
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
          {['E-commerce', 'SaaS', 'B2B', 'Local Business', 'Lead Generation', 'App Install'].map((useCase) => (
            <span key={useCase} className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm border border-purple-100">
              {useCase}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}