import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Download, FileText, Copy, Check, X, Filter, 
  TrendingUp, Target, Globe, Zap, Search, CheckCircle2,
  AlertCircle, RefreshCw, Plus, Minus
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { notifications } from '../utils/notifications';
import { api } from '../utils/api';

interface KeywordResult {
  id: string;
  keyword: string;
  score: number;
  intentTags: string[];
  funnelStage: string;
  cpc_est: string;
  matchVariants?: {
    broad: string;
    phrase: string;
    exact: string;
  };
}

const IntentBadges = ({ tags = [] }: { tags?: string[] }) => (
  <div className="flex gap-2 flex-wrap">
    {tags.map((t) => (
      <Badge key={t} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-0">
        {t}
      </Badge>
    ))}
  </div>
);

function useMockOrBackend() {
  async function run(payload: any) {
    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('backend error');
      const data = await res.json();
      return { ok: true, data };
    } catch (e) {
      // Fallback mock
      const mock = mockGenerator(payload.seed, payload.max_results || 50);
      return { ok: false, data: { results: mock } };
    }
  }
  return { run };
}

function mockGenerator(seed: string, n = 12): KeywordResult[] {
  const base = [
    'near me', 'quote', 'book appointment', 'price', 'call now', 
    'free trial', 'register', 'same day service', 'emergency', 
    'repair', 'installation', 'reviews', 'best', 'top rated', 
    'affordable', 'licensed', 'certified', '24/7', 'immediate',
    'professional', 'expert', 'local', 'trusted', 'guaranteed'
  ];
  
  return Array.from({ length: Math.min(n, 300) }).map((_, i) => {
    const modifier = base[i % base.length];
    return {
      id: `${i}-${modifier.replace(/\s+/g, '_')}`,
      keyword: `${seed} ${modifier}`,
      score: Math.max(35, 100 - (i % 20) * 2),
      intentTags: [
        modifier.includes('call') ? 'call' : 
        modifier.includes('book') ? 'booking' : 
        modifier.includes('register') || modifier.includes('signup') ? 'signup' :
        modifier.includes('price') || modifier.includes('quote') ? 'lead' : 'lead'
      ],
      funnelStage: i % 3 === 0 ? 'bottom' : i % 3 === 1 ? 'consideration' : 'awareness',
      cpc_est: (1 + (i % 10) * 0.6).toFixed(2),
      matchVariants: {
        broad: `${seed} ${modifier}`,
        phrase: `"${seed} ${modifier}"`,
        exact: `[${seed} ${modifier}]`
      }
    };
  });
}

export const CrazyKeywordsBuilder = () => {
  // Strategy panel state
  const [seedInput, setSeedInput] = useState('');
  const [geo, setGeo] = useState('US');
  const [intent, setIntent] = useState('lead');
  const [funnel, setFunnel] = useState('bottom');
  const [depth, setDepth] = useState('medium');
  const [maxResults, setMaxResults] = useState(300);
  const [matchTypes, setMatchTypes] = useState({ broad: true, phrase: true, exact: true });
  const [negatives, setNegatives] = useState('cheap\nfree\njob\nscam\nhiring\nhow\nwhere\nwhy\nwhen\ncareer\napply\nreviews\nfeedback');

  // Results state
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerItem, setDrawerItem] = useState<KeywordResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const apiHook = useMockOrBackend();

  function toggleMatch(mt: 'broad' | 'phrase' | 'exact') {
    setMatchTypes((s) => ({ ...s, [mt]: !s[mt] }));
  }

  function toggleSelect(id: string) {
    const s = new Set(selected);
    if (s.has(id)) {
      s.delete(id);
    } else {
      s.add(id);
    }
    setSelected(s);
  }

  function selectAll() {
    const allIds = new Set(results.map(r => r.id));
    setSelected(allIds);
    notifications.success(`Selected ${results.length} keywords`, {
      title: 'All Selected',
    });
  }

  function deselectAll() {
    setSelected(new Set());
    notifications.info('All keywords deselected');
  }

  async function handleGenerate({ asyncJob = false }: { asyncJob?: boolean } = {}) {
    if (!seedInput.trim()) {
      notifications.warning('Please enter seed keywords', {
        title: 'Seed Keywords Required',
        description: 'Enter at least one seed keyword to generate suggestions.',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSelected(new Set());
    setDrawerItem(null);

    const negativeList = negatives.split('\n').map(s => s.trim()).filter(Boolean);

    const payload = {
      seed: seedInput,
      geo,
      intent,
      funnel,
      depth,
      max_results: maxResults,
      include_synonyms: true,
      include_related: true,
      commercial_mods_count: 12,
      match_types: Object.keys(matchTypes).filter(k => matchTypes[k as keyof typeof matchTypes]),
      negative_keywords: negativeList
    };

    try {
      const { ok, data } = await apiHook.run(payload);
      const keywordResults = (data && data.results) || [];
      setResults(keywordResults);
      
      if (!ok) {
        setError('Running in demo mode (backend not available). Results are mock data.');
        notifications.info('Using mock data - backend not available', {
          title: 'Demo Mode',
          description: 'Generated keywords using local mock generator.',
        });
      } else {
        notifications.success(`Generated ${keywordResults.length} keywords`, {
          title: 'Keywords Generated',
          description: `Found ${keywordResults.length} keyword suggestions based on your criteria.`,
        });
      }
    } catch (err) {
      setError('An error occurred while generating keywords');
      notifications.error('Failed to generate keywords', {
        title: 'Generation Error',
        description: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  }

  function exportSelectedGoogleAds() {
    const rows = results.filter(r => selected.has(r.id));
    if (!rows.length) {
      notifications.warning('Please select keywords to export', {
        title: 'No Keywords Selected',
      });
      return;
    }

    const header = ['Campaign', 'Ad group', 'Criterion', 'Type', 'Max CPC', 'Status'].join(',') + '\n';
    const body = rows.map(r => {
      const campaign = 'Search Campaign 1';
      const adgroup = `${intent}_group`;
      const criterion = `"${r.keyword.replace(/"/g, '""')}"`;
      const type = 'Phrase';
      const maxcpc = r.cpc_est || '';
      const status = 'Enabled';
      return [campaign, adgroup, criterion, type, maxcpc, status].join(',');
    }).join('\n');
    const csv = header + body;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google_ads_export_${seedInput.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    notifications.success(`Exported ${rows.length} keywords to CSV`, {
      title: 'Export Complete',
      description: 'Your Google Ads CSV file has been downloaded.',
    });
  }

  function copyKeyword(keyword: string, id: string) {
    navigator.clipboard.writeText(keyword);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    notifications.success('Keyword copied to clipboard');
  }

  function addNegativeSuggestion(suggestion: string) {
    const current = negatives.split('\n').map(s => s.trim()).filter(Boolean);
    if (!current.includes(suggestion)) {
      setNegatives([...current, suggestion].join('\n'));
    }
  }

  const topScore = results.length ? Math.max(...results.map(r => r.score)) : 0;
  const avgCPC = results.length 
    ? (results.reduce((s, r) => s + Number(r.cpc_est || 0), 0) / results.length).toFixed(2)
    : '0.00';

  // Get unique words from results for negative suggestions
  const negativeSuggestions = Array.from(
    new Set(results.flatMap(r => (r.keyword || '').split(' ').slice(0, 2)))
  ).slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Crazy Keywords Builder
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            AI-powered conversion-intent focused keyword generation (lead, call, booking, signup)
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Strategy panel */}
        <motion.div 
          layout 
          className="lg:col-span-4"
        >
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                1. Define Your Strategy
              </CardTitle>
              <CardDescription>Configure your keyword generation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Seed Keywords</Label>
                <p className="text-xs text-slate-500 mb-2">Comma-separated (e.g., plumber service, emergency plumber)</p>
                <Input
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  placeholder="e.g. plumber service, emergency plumber"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Geo (Country)</Label>
                  <Input
                    value={geo}
                    onChange={(e) => setGeo(e.target.value)}
                    placeholder="US / IN"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Intent</Label>
                  <Select value={intent} onValueChange={setIntent}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="signup">Signup</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Funnel Stage</Label>
                  <Select value={funnel} onValueChange={setFunnel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="consideration">Consideration</SelectItem>
                      <SelectItem value="bottom">Bottom Funnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Long-tail Depth</Label>
                  <Select value={depth} onValueChange={setDepth}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="deep">Deep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Match Types</Label>
                <div className="mt-2 flex gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={matchTypes.broad}
                      onCheckedChange={() => toggleMatch('broad')}
                    />
                    <span className="text-sm">Broad</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={matchTypes.phrase}
                      onCheckedChange={() => toggleMatch('phrase')}
                    />
                    <span className="text-sm">Phrase</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={matchTypes.exact}
                      onCheckedChange={() => toggleMatch('exact')}
                    />
                    <span className="text-sm">Exact</span>
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Negative Keywords</Label>
                <p className="text-xs text-slate-500 mb-2">One per line</p>
                <Textarea
                  value={negatives}
                  onChange={(e) => setNegatives(e.target.value)}
                  placeholder="cheap&#10;free&#10;job&#10;scam"
                  className="mt-1 h-28 text-sm font-mono"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Max Results</Label>
                <Input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="mt-1"
                  min={50}
                  max={1000}
                />
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  onClick={() => handleGenerate()}
                  disabled={loading || !seedInput.trim()}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Keywords
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleGenerate({ asyncJob: true })}
                  variant="outline"
                  disabled={loading || !seedInput.trim()}
                  className="w-32"
                >
                  Deep Scan
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">{error}</p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-xs text-indigo-800">
                  <strong>Tip:</strong> Use negative keywords to avoid irrelevant long-tail suggestions (e.g., "jobs", "cheap", "free").
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* MIDDLE: Controls & Stats */}
        <motion.div 
          layout 
          className="lg:col-span-4"
        >
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600" />
                  2. Controls & Preview
                </CardTitle>
                <Badge variant="outline">{results.length} keywords</Badge>
              </div>
              <CardDescription>Filter and manage your generated keywords</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <div className="text-xs text-emerald-700 font-medium mb-1">Top Score</div>
                  <div className="text-2xl font-bold text-emerald-900">{topScore || '--'}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 font-medium mb-1">Avg CPC (est)</div>
                  <div className="text-2xl font-bold text-blue-900">${avgCPC}</div>
                </div>
              </div>

              <Separator />

              {/* Quick Filters */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Quick Filters</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setResults(r => r.filter(x => x.score >= 80))}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    High Score (80+)
                  </Button>
                  <Button
                    onClick={() => setResults(r => r.filter(x => x.intentTags && x.intentTags.includes('call')))}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Only Calls
                  </Button>
                  <Button
                    onClick={() => setResults(r => r.filter(x => x.funnelStage === 'bottom'))}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Bottom-Funnel
                  </Button>
                </div>
              </div>

              {/* Selection Controls */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Selection</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={selectAll}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    Select All ({results.length})
                  </Button>
                  <Button
                    onClick={deselectAll}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    Deselect All
                  </Button>
                </div>
                {selected.size > 0 && (
                  <p className="text-xs text-slate-600 mt-2">
                    {selected.size} keyword{selected.size !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Negative Suggestions */}
              {negativeSuggestions.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Negative Suggestions</Label>
                  <div className="flex flex-wrap gap-2">
                    {negativeSuggestions.map(s => (
                      <Button
                        key={s}
                        onClick={() => addNegativeSuggestion(s)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Export Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={exportSelectedGoogleAds}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                  disabled={selected.size === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected ({selected.size}) - Google Ads CSV
                </Button>
                <Button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `keywords_${seedInput.replace(/\s+/g, '_')}.json`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                    notifications.success('Keywords exported to JSON');
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={results.length === 0}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* RIGHT: Results */}
        <motion.div 
          layout 
          className="lg:col-span-4"
        >
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-600" />
                  3. Generated Keywords
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {selected.size} selected
                </Badge>
              </div>
              <CardDescription>Click any card for details</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {results.slice(0, maxResults).map((r) => (
                      <motion.div
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                          selected.has(r.id)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 bg-white hover:border-indigo-300'
                        }`}
                        onClick={() => setDrawerItem(r)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-slate-800 text-sm truncate">{r.keyword}</h4>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs font-bold ${
                                  r.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                  r.score >= 60 ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {r.score}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <IntentBadges tags={r.intentTags} />
                              <span className="text-xs text-slate-500 font-medium">
                                ${r.cpc_est || '-'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {r.funnelStage}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end flex-shrink-0">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelect(r.id);
                              }}
                              variant={selected.has(r.id) ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs h-7"
                            >
                              {selected.has(r.id) ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Selected
                                </>
                              ) : (
                                'Select'
                              )}
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyKeyword(r.keyword, r.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7"
                            >
                              {copiedId === r.id ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {!results.length && !loading && (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-12 text-center text-slate-400"
                      >
                        <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="font-medium">No keywords generated yet</p>
                        <p className="text-sm mt-1">Enter seed keywords and click "Generate Keywords" to create your list</p>
                      </motion.div>
                    )}

                    {loading && (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-12 text-center"
                      >
                        <RefreshCw className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-spin" />
                        <p className="font-medium text-slate-600">Generating keywords...</p>
                        <p className="text-sm text-slate-500 mt-1">This may take a few moments</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {/* Detail Drawer */}
              <AnimatePresence>
                {drawerItem && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-4 rounded-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{drawerItem.keyword}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                          <span>Score: <strong className="text-indigo-600">{drawerItem.score}</strong></span>
                          <span>•</span>
                          <span>Funnel: <strong className="text-purple-600">{drawerItem.funnelStage}</strong></span>
                          <span>•</span>
                          <span>CPC: <strong className="text-emerald-600">${drawerItem.cpc_est}</strong></span>
                        </div>
                        <div className="mb-3">
                          <IntentBadges tags={drawerItem.intentTags} />
                        </div>
                        {drawerItem.matchVariants && (
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700">Match Type Variants:</Label>
                            <div className="flex flex-wrap gap-2">
                              <code className="px-2 py-1 bg-white rounded border text-xs font-mono">
                                {drawerItem.matchVariants.broad}
                              </code>
                              <code className="px-2 py-1 bg-white rounded border text-xs font-mono">
                                {drawerItem.matchVariants.phrase}
                              </code>
                              <code className="px-2 py-1 bg-white rounded border text-xs font-mono">
                                {drawerItem.matchVariants.exact}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => setDrawerItem(null)}
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => {
                          copyKeyword(drawerItem.keyword, drawerItem.id);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Keyword
                      </Button>
                      <Button
                        onClick={() => {
                          toggleSelect(drawerItem.id);
                          notifications.success('Keyword selected');
                        }}
                        variant="default"
                        size="sm"
                        className="flex-1 bg-indigo-600"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {selected.has(drawerItem.id) ? 'Deselect' : 'Select'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

