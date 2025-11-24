import React from 'react';
import { CampaignPreset } from '../data/campaignPresets';

interface LandingPageTemplateProps {
  preset: CampaignPreset;
  phone?: string;
}

export const LandingPageTemplate: React.FC<LandingPageTemplateProps> = ({ preset, phone = '1-800-ADIOLOGY' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-slate-800">
            Adiology
          </a>
          <a
            href="/contact"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Contact Sales
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="grid gap-8 md:grid-cols-2 items-center mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              {preset.title} Leads — Call-ready Campaigns
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Generate high-intent keywords, AI ads and a Google Ads Editor CSV ready to upload — optimized for calls, bookings and signups.
            </p>

            <div className="flex gap-3 mb-6">
              <a
                href="#start"
                className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-emerald-600 transition-colors font-medium"
              >
                Start with {preset.title}
              </a>
              <a
                href="#features"
                className="px-6 py-3 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors font-medium"
              >
                See features
              </a>
            </div>

            <div className="text-sm text-slate-500">
              <strong>Phone:</strong>{' '}
              <a href={`tel:${phone}`} className="text-indigo-600 hover:text-indigo-700">
                {phone}
              </a>{' '}
              • <strong>Email:</strong>{' '}
              <a href="mailto:info@adiology.online" className="text-indigo-600 hover:text-indigo-700">
                info@adiology.online
              </a>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Campaign Preview</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-indigo-100 mb-1">Campaign</p>
                  <p className="font-semibold">{preset.campaign_name}</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100 mb-1">Keywords</p>
                  <p className="font-semibold">{preset.keywords.length} high-intent keywords</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100 mb-1">Ad Groups</p>
                  <p className="font-semibold">{preset.ad_groups.length} optimized groups</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100 mb-1">Max CPC</p>
                  <p className="font-semibold">${preset.max_cpc.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-12">
          <h2 className="text-2xl font-semibold mb-6">What you get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">AI Keyword Planner</h3>
              <p className="text-sm text-slate-600">
                Intent filtered keywords (lead/call/booking), long-tail expansions & negative keyword suggestions.
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">One-click CSV Export</h3>
              <p className="text-sm text-slate-600">
                Google Ads Editor CSV preformatted — upload in minutes.
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">AI Ad Copy</h3>
              <p className="text-sm text-slate-600">
                Headlines & descriptions tailored to the {preset.title} vertical.
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Call-Ready Optimization</h3>
              <p className="text-sm text-slate-600">
                Phrase & exact match focused on call intent with call extensions & tracking.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-indigo-600">1</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Select {preset.title} Preset</h3>
            <p className="text-sm text-slate-600">
              Pick a ready-made campaign optimized for {preset.title} calls.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-indigo-600">2</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Review & Customize</h3>
            <p className="text-sm text-slate-600">
              Edit keywords, bids, budgets, and phone number on the review screen.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-indigo-600">3</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Download CSV & Launch</h3>
            <p className="text-sm text-slate-600">
              Download Google Ads Editor CSV or push to Google Ads (managed accounts).
            </p>
          </div>
        </section>

        {/* Policies */}
        <section id="policies" className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-12">
          <h2 className="text-xl font-semibold mb-4">Policies & Compliance (Important)</h2>
          <ul className="list-disc ml-6 space-y-2 text-sm text-slate-600">
            <li>
              <strong>Transparent pricing:</strong> no misleading prices or bait-and-switch.
            </li>
            <li>
              <strong>Honest claims:</strong> avoid unverifiable guarantees (e.g., "guaranteed results") unless substantiated.
            </li>
            <li>
              <strong>Legal licensing:</strong> all technicians must be licensed where required — disclose licensing on landing page.
            </li>
            <li>
              <strong>Local compliance:</strong> follow local advertising rules for regulated services (plumbing, gas work, electrical, medical-related claims).
            </li>
            <li>
              <strong>Call recording notice:</strong> include notice if calls are recorded (privacy requirement in some regions).
            </li>
            <li>
              <strong>Privacy & data:</strong> link to Privacy Policy and cookie policy; obtain consent for tracking where required.
            </li>
          </ul>
        </section>

        {/* Trust & CTA */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Trusted by local pros</h2>
            <p className="text-slate-600">
              Join 100s of local businesses generating call leads with Adiology.
            </p>
          </div>
          <div className="text-right md:text-left">
            <a
              id="start"
              href={`/app/presets/${preset.slug}`}
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Use {preset.title} Preset
            </a>
          </div>
        </section>

        {/* FAQ & Contact */}
        <section className="grid gap-6 md:grid-cols-2 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-lg mb-4">FAQ</h3>
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <strong>Q:</strong> Can I edit keywords?<br />
                <strong>A:</strong> Yes — all fields editable on the review screen.
              </div>
              <div>
                <strong>Q:</strong> Will CSV work in Google Ads Editor?<br />
                <strong>A:</strong> Yes — it follows Ads Editor format.
              </div>
              <div>
                <strong>Q:</strong> Are calls tracked?<br />
                <strong>A:</strong> We recommend integrating call tracking for accurate ROI (we support TFN integration).
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <p className="text-sm text-slate-600 mb-2">
              <strong>Email:</strong> info@adiology.online
              <br />
              <strong>Phone:</strong> {phone}
            </p>
            <p className="mt-4 text-sm text-slate-500">Business hours: Mon–Fri, 9AM–6PM</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-slate-500 pt-8 border-t border-slate-200">
          © {currentYear} Adiology — All rights reserved.{' '}
          <a href="/privacy" className="underline hover:text-slate-700">
            Privacy
          </a>{' '}
          •{' '}
          <a href="/terms" className="underline hover:text-slate-700">
            Terms
          </a>
        </footer>
      </main>
    </div>
  );
};

// Function to generate HTML string for server-side rendering
export function generateLandingPageHTML(preset: CampaignPreset, phone: string = '1-800-ADIOLOGY'): string {
  const currentYear = new Date().getFullYear();
  
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${preset.title} — Adiology</title>
  <meta name="description" content="Get high-intent keywords, AI generated ads, and Google Ads Editor CSVs for ${preset.title}. Call-ready leads.">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900">
  <header class="bg-white shadow">
    <div class="max-w-6xl mx-auto p-6 flex items-center justify-between">
      <a href="/" class="text-2xl font-bold">Adiology</a>
      <a href="/contact" class="px-4 py-2 bg-indigo-600 text-white rounded">Contact Sales</a>
    </div>
  </header>

  <main class="max-w-6xl mx-auto p-6">
    <!-- Hero -->
    <section class="grid gap-6 md:grid-cols-2 items-center mb-12">
      <div>
        <h1 class="text-3xl md:text-4xl font-extrabold">${preset.title} Leads — Call-ready Campaigns</h1>
        <p class="mt-3 text-lg text-slate-600">Generate high-intent keywords, AI ads and a Google Ads Editor CSV ready to upload — optimized for calls, bookings and signups.</p>

        <div class="mt-6 flex gap-3">
          <a href="#start" class="bg-emerald-500 text-white px-5 py-3 rounded shadow">Start with ${preset.title}</a>
          <a href="#features" class="px-5 py-3 rounded border">See features</a>
        </div>

        <div class="mt-6 text-sm text-slate-500">
          <strong>Phone:</strong> <a href="tel:${phone}" class="text-indigo-600">${phone}</a> • <strong>Email:</strong> <a href="mailto:info@adiology.online">info@adiology.online</a>
        </div>
      </div>

      <div>
        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-2xl p-8 text-white">
          <h2 class="text-2xl font-bold mb-4">Campaign Preview</h2>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-indigo-100 mb-1">Campaign</p>
              <p class="font-semibold">${preset.campaign_name}</p>
            </div>
            <div>
              <p class="text-sm text-indigo-100 mb-1">Keywords</p>
              <p class="font-semibold">${preset.keywords.length} high-intent keywords</p>
            </div>
            <div>
              <p class="text-sm text-indigo-100 mb-1">Ad Groups</p>
              <p class="font-semibold">${preset.ad_groups.length} optimized groups</p>
            </div>
            <div>
              <p class="text-sm text-indigo-100 mb-1">Max CPC</p>
              <p class="font-semibold">$${preset.max_cpc.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="mt-12 bg-white rounded-xl p-6 shadow">
      <h3 class="text-xl font-semibold">What you get</h3>
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-4 border rounded">
          <h4 class="font-semibold">AI Keyword Planner</h4>
          <p class="text-sm text-slate-600 mt-1">Intent filtered keywords (lead/call/booking), long-tail expansions & negative keyword suggestions.</p>
        </div>
        <div class="p-4 border rounded">
          <h4 class="font-semibold">One-click CSV Export</h4>
          <p class="text-sm text-slate-600 mt-1">Google Ads Editor CSV preformatted — upload in minutes.</p>
        </div>
        <div class="p-4 border rounded">
          <h4 class="font-semibold">AI Ad Copy</h4>
          <p class="text-sm text-slate-600 mt-1">Headlines & descriptions tailored to the ${preset.title} vertical.</p>
        </div>
        <div class="p-4 border rounded">
          <h4 class="font-semibold">Call-Ready Optimization</h4>
          <p class="text-sm text-slate-600 mt-1">Phrase & exact match focused on call intent with call extensions & tracking.</p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how" class="mt-8 grid gap-6 md:grid-cols-3">
      <div class="p-6 bg-white rounded shadow">
        <h4 class="font-semibold">1. Select ${preset.title} Preset</h4>
        <p class="text-sm text-slate-600 mt-2">Pick a ready-made campaign optimized for ${preset.title} calls.</p>
      </div>
      <div class="p-6 bg-white rounded shadow">
        <h4 class="font-semibold">2. Review & Customize</h4>
        <p class="text-sm text-slate-600 mt-2">Edit keywords, bids, budgets, and phone number on the review screen.</p>
      </div>
      <div class="p-6 bg-white rounded shadow">
        <h4 class="font-semibold">3. Download CSV & Launch</h4>
        <p class="text-sm text-slate-600 mt-2">Download Google Ads Editor CSV or push to Google Ads (managed accounts).</p>
      </div>
    </section>

    <!-- Policies -->
    <section id="policies" class="mt-8 bg-white p-6 rounded-xl shadow">
      <h3 class="font-semibold">Policies & Compliance (Important)</h3>
      <ul class="mt-3 list-disc ml-6 text-sm text-slate-600">
        <li><strong>Transparent pricing:</strong> no misleading prices or bait-and-switch.</li>
        <li><strong>Honest claims:</strong> avoid unverifiable guarantees (e.g., "guaranteed results") unless substantiated.</li>
        <li><strong>Legal licensing:</strong> all technicians must be licensed where required — disclose licensing on landing page.</li>
        <li><strong>Local compliance:</strong> follow local advertising rules for regulated services (plumbing, gas work, electrical, medical-related claims).</li>
        <li><strong>Call recording notice:</strong> include notice if calls are recorded (privacy requirement in some regions).</li>
        <li><strong>Privacy & data:</strong> link to Privacy Policy and cookie policy; obtain consent for tracking where required.</li>
      </ul>
    </section>

    <!-- Trust & CTA -->
    <section class="mt-8 p-6 bg-white rounded-xl shadow grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div>
        <h3 class="text-xl font-semibold">Trusted by local pros</h3>
        <p class="text-sm text-slate-600 mt-2">Join 100s of local businesses generating call leads with Adiology.</p>
      </div>
      <div class="text-right">
        <a id="start" href="/app/presets/${preset.slug}" class="bg-indigo-600 text-white px-6 py-3 rounded">Use ${preset.title} Preset</a>
      </div>
    </section>

    <!-- FAQ & Contact -->
    <section class="mt-8 grid gap-6 md:grid-cols-2">
      <div class="bg-white p-6 rounded-xl shadow">
        <h4 class="font-semibold">FAQ</h4>
        <div class="mt-4 space-y-3 text-sm text-slate-600">
          <div><strong>Q:</strong> Can I edit keywords? <br><strong>A:</strong> Yes — all fields editable on the review screen.</div>
          <div><strong>Q:</strong> Will CSV work in Google Ads Editor?<br><strong>A:</strong> Yes — it follows Ads Editor format.</div>
          <div><strong>Q:</strong> Are calls tracked?<br><strong>A:</strong> We recommend integrating call tracking for accurate ROI (we support TFN integration).</div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow">
        <h4 class="font-semibold">Contact Us</h4>
        <p class="text-sm text-slate-600 mt-2"><strong>Email:</strong> info@adiology.online <br><strong>Phone:</strong> ${phone}</p>
        <p class="mt-4 text-sm text-slate-500">Business hours: Mon–Fri, 9AM–6PM</p>
      </div>
    </section>

    <footer class="mt-8 text-center text-sm text-slate-500">
      © ${currentYear} Adiology — All rights reserved. <a href="/privacy" class="underline">Privacy</a> • <a href="/terms" class="underline">Terms</a>
    </footer>
  </main>
</body>
</html>`;
}

