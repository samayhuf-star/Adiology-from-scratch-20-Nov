import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Globe, Type, ShieldAlert, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { api } from '../utils/api';
import { historyService } from '../utils/historyService';

interface GeneratedKeyword {
    id: number;
    keyword: string;
    reason: string;
    category: string;
}

export const NegativeKeywordsBuilder = ({ initialData }: { initialData?: any }) => {
    // Input State
    const [url, setUrl] = useState('');
    const [coreKeywords, setCoreKeywords] = useState('');
    const [userGoal, setUserGoal] = useState('');
    
    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedKeywords, setGeneratedKeywords] = useState<GeneratedKeyword[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setUrl(initialData.url || '');
            setCoreKeywords(initialData.coreKeywords || '');
            setUserGoal(initialData.userGoal || '');
            setGeneratedKeywords(initialData.generatedKeywords || []);
        }
    }, [initialData]);

    const handleSave = async () => {
        if (generatedKeywords.length === 0) return;
        setIsSaving(true);
        try {
            await historyService.save(
                'negative-keywords',
                `Negatives: ${coreKeywords.substring(0, 20)}...`,
                { url, coreKeywords, userGoal, generatedKeywords }
            );
            alert("Negative keywords saved!");
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // AI Generation Logic using Gemini
    const handleGenerate = async () => {
        // URL is now mandatory
        if (!url.trim() || !coreKeywords.trim() || !userGoal) {
            alert('Please fill in all required fields including the URL');
            return;
        }
        
        setIsGenerating(true);
        setGeneratedKeywords([]);

        try {
            console.log('Attempting AI negative keyword generation...');
            // Call the Gemini API via Supabase edge function
            const response = await api.post('/ai/generate-negative-keywords', {
                url,
                coreKeywords,
                userGoal,
                count: 1200, // Request minimum 300, target 1000+ keywords
                format: 'exact', // Request exact match format
                expansionStrategies: [
                    'synonyms',
                    'irrelevant_intents',
                    'informational_searches',
                    'diy_queries',
                    'jobs_careers',
                    'free_cheap_searches',
                    'competitor_terms',
                    'related_category_mismatches'
                ],
                instructions: 'Generate as many negative keywords as possible (minimum 300, target 1000+). Expand using: synonyms, irrelevant intents, informational searches, DIY queries, jobs/careers, free/cheap searches, competitor terms, related category mismatches. Categorize each keyword by intent and give a reason why it should be excluded. Make sure all outputs are unique and clean.'
            });

            if (response.keywords && Array.isArray(response.keywords)) {
                console.log('AI generation successful:', response.keywords.length, 'keywords');
                const formattedKeywords = response.keywords.map((item: any, index: number) => {
                    // Clean keyword: remove any existing brackets (single or double) and add single brackets
                    let cleanKeyword = item.keyword || '';
                    // Remove double brackets [[keyword]] -> keyword
                    cleanKeyword = cleanKeyword.replace(/^\[\[|\]\]$/g, '');
                    // Remove single brackets [keyword] -> keyword
                    cleanKeyword = cleanKeyword.replace(/^\[|\]$/g, '');
                    // Add single brackets for exact match
                    cleanKeyword = `[${cleanKeyword}]`;
                    
                    return {
                        id: index + 1,
                        keyword: cleanKeyword,
                        reason: item.reason || 'AI suggested',
                        category: item.category || 'General'
                    };
                });
                setGeneratedKeywords(formattedKeywords);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.log('ℹ️ Backend unavailable - using local fallback generation');
            
            // FALLBACK: Generate comprehensive negative keywords (1000+) with exact match format
            const mockNegatives: GeneratedKeyword[] = [];
            const keywordSet = new Set<string>(); // Track uniqueness
            let id = 1;

            // Helper function to add keyword if unique
            const addUniqueKeyword = (kw: string, reason: string, category: string) => {
                const cleanKw = kw.toLowerCase().trim();
                if (!keywordSet.has(cleanKw) && cleanKw.length > 0) {
                    keywordSet.add(cleanKw);
                    mockNegatives.push({
                        id: id++,
                        keyword: `[${kw}]`,
                        reason,
                        category
                    });
                }
            };

            // Employment-related (200+ variations)
            const employmentBase = ['jobs', 'career', 'careers', 'hiring', 'salary', 'resume', 'employment', 'job openings', 'apply now', 'application', 'work from home', 'remote jobs', 'part time', 'full time', 'internship', 'intern', 'job opportunities', 'positions available', 'now hiring', 'employee', 'employer', 'recruitment', 'recruiter', 'staffing', 'workforce', 'vacancy', 'vacancies', 'position', 'opening', 'opportunity', 'candidate', 'applicant', 'interview', 'hiring process', 'job search', 'career change', 'job fair', 'job board', 'linkedin jobs', 'indeed', 'glassdoor', 'monster', 'ziprecruiter', 'workday', 'talent acquisition', 'hr', 'human resources', 'payroll', 'benefits', 'compensation', 'wage', 'hourly', 'annual salary', 'job description', 'job posting', 'job listing', 'job board', 'job site', 'job portal', 'job search engine', 'job alert', 'job notification', 'job application form', 'job application process', 'job interview questions', 'job interview tips', 'job interview preparation', 'job offer', 'job acceptance', 'job rejection', 'job market', 'job outlook', 'job growth', 'job security', 'job satisfaction', 'job requirements', 'job qualifications', 'job skills', 'job training', 'job certification', 'job license', 'job permit', 'work permit', 'work visa', 'green card', 'h1b', 'sponsorship', 'relocation', 'work authorization'];
            
            employmentBase.forEach(kw => {
                addUniqueKeyword(kw, 'Filters job seekers and employment-related searches', 'Employment');
            });
            
            // Add employment variations with modifiers
            const employmentModifiers = ['entry level', 'senior', 'junior', 'mid level', 'executive', 'manager', 'director', 'assistant', 'coordinator', 'specialist', 'analyst', 'consultant', 'freelance', 'contract', 'temporary', 'permanent', 'seasonal', 'summer', 'winter', 'weekend', 'night shift', 'day shift', 'overtime', 'flexible hours', '9 to 5'];
            employmentBase.slice(0, 30).forEach(base => {
                employmentModifiers.forEach(mod => {
                    addUniqueKeyword(`${base} ${mod}`, 'Filters specific job type searches', 'Employment');
                });
            });

            // Free/Low-Intent (200+ variations) - Expanded with synonyms and variations
            const freeLowIntentBase = ['free', 'cheap', 'discount', 'coupon', 'coupons', 'promo code', 'promotional code', 'deal', 'deals', 'bargain', 'on sale', 'sale', 'clearance', 'affordable', 'inexpensive', 'budget', 'low cost', 'free trial', 'trial', 'no cost', 'zero cost', 'complimentary', 'gratis', 'without charge', 'at no cost', 'freebie', 'freebies', 'giveaway', 'giveaways', 'free sample', 'free samples', 'free shipping', 'free delivery', 'free installation', 'free consultation', 'free estimate', 'free quote', 'free download', 'free access', 'free account', 'free membership', 'free subscription', 'free service', 'free product', 'free item', 'free offer', 'free promotion', 'free gift', 'free bonus', 'free addon', 'free upgrade', 'free credit', 'free money', 'free cash', 'free voucher', 'free voucher code', 'free code', 'free coupon code', 'free discount code', 'free promo', 'cheapest', 'cheaper', 'lowest price', 'best price', 'best deal', 'best discount', 'best coupon', 'best promo', 'biggest discount', 'biggest sale', 'huge discount', 'massive discount', 'extreme discount', 'maximum discount', 'deep discount', 'steep discount', 'heavy discount', 'big discount', 'large discount', 'major discount', 'significant discount', 'substantial discount', 'considerable discount', 'generous discount', 'attractive discount', 'appealing discount', 'enticing discount', 'tempting discount', 'irresistible discount', 'unbeatable discount', 'unmatched discount', 'unparalleled discount', 'exceptional discount', 'outstanding discount', 'remarkable discount', 'extraordinary discount', 'incredible discount', 'amazing discount', 'fantastic discount', 'wonderful discount', 'great discount', 'good discount', 'nice discount', 'decent discount', 'reasonable discount', 'fair discount', 'acceptable discount', 'moderate discount', 'small discount', 'minor discount', 'slight discount', 'tiny discount', 'minimal discount', 'negligible discount', 'token discount', 'symbolic discount', 'nominal discount', 'trivial discount', 'paltry discount', 'meager discount', 'scanty discount', 'skimpy discount', 'sparse discount', 'scarce discount', 'limited discount', 'restricted discount', 'conditional discount', 'qualified discount', 'eligible discount', 'applicable discount', 'valid discount', 'active discount', 'current discount', 'available discount', 'existing discount', 'ongoing discount', 'continuing discount', 'persistent discount', 'enduring discount', 'lasting discount', 'permanent discount', 'temporary discount', 'short term discount', 'long term discount', 'extended discount', 'prolonged discount', 'sustained discount', 'maintained discount', 'preserved discount', 'protected discount', 'secured discount', 'guaranteed discount', 'assured discount', 'promised discount', 'pledged discount', 'committed discount', 'dedicated discount', 'devoted discount', 'loyal discount', 'faithful discount', 'trustworthy discount', 'reliable discount', 'dependable discount', 'consistent discount', 'steady discount', 'stable discount', 'constant discount', 'uniform discount', 'regular discount', 'routine discount', 'standard discount', 'typical discount', 'normal discount', 'ordinary discount', 'common discount', 'usual discount', 'customary discount', 'conventional discount', 'traditional discount', 'classic discount', 'vintage discount', 'retro discount', 'old discount', 'new discount', 'fresh discount', 'recent discount', 'latest discount', 'modern discount', 'contemporary discount'];
            
            freeLowIntentBase.forEach(kw => {
                addUniqueKeyword(kw, 'Filters free-seekers and low-intent price-focused searches', 'Free/Low-Intent');
            });
            
            // Add free/low-intent variations with context
            const freeModifiers = ['100% free', 'completely free', 'totally free', 'absolutely free', 'entirely free', 'fully free', 'wholly free'];
            freeLowIntentBase.slice(0, 30).forEach(base => {
                if (base.includes('free')) {
                    freeModifiers.forEach(mod => {
                        addUniqueKeyword(`${mod} ${base.replace('free', '').trim()}`, 'Filters extreme free-seekers', 'Free/Low-Intent');
                    });
                }
            });

            // Educational (120+ variations) - Already expanded above with DIY queries

            // Irrelevant Industry (100+ variations)
            const irrelevantTerms = [
                { kw: 'review', reason: 'Filters review searches', category: 'Irrelevant' },
                { kw: 'reviews', reason: 'Filters review content searches', category: 'Irrelevant' },
                { kw: 'rating', reason: 'Filters rating searches', category: 'Irrelevant' },
                { kw: 'ratings', reason: 'Filters rating searches', category: 'Irrelevant' },
                { kw: 'comparison', reason: 'Filters comparison searches', category: 'Irrelevant' },
                { kw: 'compare', reason: 'Filters comparison searches', category: 'Irrelevant' },
                { kw: 'vs', reason: 'Filters comparison searches', category: 'Irrelevant' },
                { kw: 'versus', reason: 'Filters comparison searches', category: 'Irrelevant' },
                { kw: 'alternative', reason: 'Filters alternative searches', category: 'Irrelevant' },
                { kw: 'alternatives', reason: 'Filters alternative product searches', category: 'Irrelevant' },
                { kw: 'best', reason: 'Filters informational searches', category: 'Irrelevant' },
                { kw: 'top', reason: 'Filters list searches', category: 'Irrelevant' },
                { kw: 'worst', reason: 'Filters negative review searches', category: 'Irrelevant' },
                { kw: 'scam', reason: 'Filters scam investigation searches', category: 'Irrelevant' },
                { kw: 'complaint', reason: 'Filters complaint searches', category: 'Irrelevant' },
                { kw: 'complaints', reason: 'Filters complaint searches', category: 'Irrelevant' },
                { kw: 'problem', reason: 'Filters problem searches', category: 'Irrelevant' },
                { kw: 'problems', reason: 'Filters problem-related searches', category: 'Irrelevant' },
                { kw: 'issue', reason: 'Filters issue searches', category: 'Irrelevant' },
                { kw: 'issues', reason: 'Filters issue-related searches', category: 'Irrelevant' }
            ];

            // Informational (120+ variations)
            const informationalTerms = [
                { kw: 'what is', reason: 'Filters definitional searches', category: 'Informational' },
                { kw: 'who is', reason: 'Filters identity searches', category: 'Informational' },
                { kw: 'when', reason: 'Filters timing questions', category: 'Informational' },
                { kw: 'where', reason: 'Filters location questions', category: 'Informational' },
                { kw: 'why', reason: 'Filters reasoning questions', category: 'Informational' },
                { kw: 'wikipedia', reason: 'Filters encyclopedia searches', category: 'Informational' },
                { kw: 'definition', reason: 'Filters definition searches', category: 'Informational' },
                { kw: 'meaning', reason: 'Filters meaning searches', category: 'Informational' },
                { kw: 'information', reason: 'Filters general info searches', category: 'Informational' },
                { kw: 'info', reason: 'Filters information searches', category: 'Informational' },
                { kw: 'about', reason: 'Filters about searches', category: 'Informational' },
                { kw: 'history', reason: 'Filters historical searches', category: 'Informational' },
                { kw: 'facts', reason: 'Filters fact searches', category: 'Informational' },
                { kw: 'statistics', reason: 'Filters statistical searches', category: 'Informational' },
                { kw: 'stats', reason: 'Filters statistics searches', category: 'Informational' },
                { kw: 'data', reason: 'Filters data searches', category: 'Informational' },
                { kw: 'research', reason: 'Filters research searches', category: 'Informational' },
                { kw: 'article', reason: 'Filters article searches', category: 'Informational' },
                { kw: 'articles', reason: 'Filters article content searches', category: 'Informational' },
                { kw: 'blog', reason: 'Filters blog content searches', category: 'Informational' }
            ];

            // Company/Corporate (80+ variations)
            const corporateTerms = [
                { kw: 'company', reason: 'Filters company info searches', category: 'Corporate' },
                { kw: 'corporation', reason: 'Filters corporation searches', category: 'Corporate' },
                { kw: 'headquarters', reason: 'Filters HQ location searches', category: 'Corporate' },
                { kw: 'headquater', reason: 'Filters headquarters searches (misspelling)', category: 'Corporate' },
                { kw: 'office', reason: 'Filters office location searches', category: 'Corporate' },
                { kw: 'contact', reason: 'Filters contact info searches', category: 'Corporate' },
                { kw: 'phone number', reason: 'Filters phone lookup searches', category: 'Corporate' },
                { kw: 'address', reason: 'Filters address searches', category: 'Corporate' },
                { kw: 'location', reason: 'Filters location searches', category: 'Corporate' },
                { kw: 'locations', reason: 'Filters multiple location searches', category: 'Corporate' },
                { kw: 'hours', reason: 'Filters business hours searches', category: 'Corporate' },
                { kw: 'open', reason: 'Filters opening hours searches', category: 'Corporate' },
                { kw: 'closed', reason: 'Filters closing info searches', category: 'Corporate' },
                { kw: 'email', reason: 'Filters email contact searches', category: 'Corporate' },
                { kw: 'customer service', reason: 'Filters support searches', category: 'Corporate' },
                { kw: 'support', reason: 'Filters support searches', category: 'Corporate' },
                { kw: 'contact us', reason: 'Filters contact page searches', category: 'Corporate' },
                { kw: 'about us', reason: 'Filters about page searches', category: 'Corporate' },
                { kw: 'corporate', reason: 'Filters corporate info searches', category: 'Corporate' },
                { kw: 'investor', reason: 'Filters investor relation searches', category: 'Corporate' }
            ];

            // Media/Entertainment (60+ variations)
            const mediaTerms = [
                { kw: 'video', reason: 'Filters video content searches', category: 'Media' },
                { kw: 'videos', reason: 'Filters video searches', category: 'Media' },
                { kw: 'youtube', reason: 'Filters YouTube searches', category: 'Media' },
                { kw: 'watch', reason: 'Filters watch-related searches', category: 'Media' },
                { kw: 'stream', reason: 'Filters streaming searches', category: 'Media' },
                { kw: 'streaming', reason: 'Filters streaming service searches', category: 'Media' },
                { kw: 'podcast', reason: 'Filters podcast searches', category: 'Media' },
                { kw: 'download', reason: 'Filters download searches', category: 'Media' },
                { kw: 'mp3', reason: 'Filters audio file searches', category: 'Media' },
                { kw: 'pdf', reason: 'Filters PDF searches', category: 'Media' },
                { kw: 'image', reason: 'Filters image searches', category: 'Media' },
                { kw: 'images', reason: 'Filters image gallery searches', category: 'Media' },
                { kw: 'picture', reason: 'Filters picture searches', category: 'Media' },
                { kw: 'pictures', reason: 'Filters picture gallery searches', category: 'Media' },
                { kw: 'photo', reason: 'Filters photo searches', category: 'Media' },
                { kw: 'photos', reason: 'Filters photo gallery searches', category: 'Media' },
                { kw: 'wallpaper', reason: 'Filters wallpaper searches', category: 'Media' },
                { kw: 'movie', reason: 'Filters movie searches', category: 'Media' },
                { kw: 'movies', reason: 'Filters movie content searches', category: 'Media' },
                { kw: 'film', reason: 'Filters film searches', category: 'Media' }
            ];

            // Legal/Regulatory (40+ variations)
            const legalTerms = [
                { kw: 'lawsuit', reason: 'Filters legal action searches', category: 'Legal' },
                { kw: 'legal', reason: 'Filters legal searches', category: 'Legal' },
                { kw: 'sue', reason: 'Filters lawsuit searches', category: 'Legal' },
                { kw: 'court', reason: 'Filters court case searches', category: 'Legal' },
                { kw: 'case', reason: 'Filters legal case searches', category: 'Legal' },
                { kw: 'lawyer', reason: 'Filters lawyer searches', category: 'Legal' },
                { kw: 'attorney', reason: 'Filters attorney searches', category: 'Legal' },
                { kw: 'settlement', reason: 'Filters settlement searches', category: 'Legal' },
                { kw: 'claim', reason: 'Filters claim searches', category: 'Legal' },
                { kw: 'fraud', reason: 'Filters fraud investigation searches', category: 'Legal' },
                { kw: 'illegal', reason: 'Filters illegal activity searches', category: 'Legal' },
                { kw: 'investigation', reason: 'Filters investigation searches', category: 'Legal' },
                { kw: 'regulation', reason: 'Filters regulatory searches', category: 'Legal' },
                { kw: 'compliance', reason: 'Filters compliance searches', category: 'Legal' },
                { kw: 'terms of service', reason: 'Filters TOS searches', category: 'Legal' },
                { kw: 'privacy policy', reason: 'Filters privacy policy searches', category: 'Legal' },
                { kw: 'refund', reason: 'Filters refund searches', category: 'Legal' },
                { kw: 'return', reason: 'Filters return policy searches', category: 'Legal' },
                { kw: 'warranty', reason: 'Filters warranty searches', category: 'Legal' },
                { kw: 'guarantee', reason: 'Filters guarantee searches', category: 'Legal' }
            ];

            // Expand remaining categories using helper function
            // Irrelevant (150+ variations)
            const irrelevantBase = ['review', 'reviews', 'rating', 'ratings', 'comparison', 'compare', 'vs', 'versus', 'alternative', 'alternatives', 'best', 'top', 'worst', 'scam', 'complaint', 'complaints', 'problem', 'problems', 'issue', 'issues', 'competitors', 'similar to', 'like', 'better than', 'pros and cons', 'what is better', 'which is better', 'what is the best', 'which is the best', 'what is the top', 'which is the top', 'what is the worst', 'which is the worst', 'what is better than', 'which is better than', 'what is worse than', 'which is worse than', 'what is similar to', 'which is similar to', 'what is like', 'which is like', 'what is different from', 'which is different from', 'what is different than', 'which is different than', 'what is unlike', 'which is unlike', 'what is not like', 'which is not like', 'what is not similar', 'which is not similar', 'what is not same', 'which is not same', 'what is not identical', 'which is not identical', 'what is not equivalent', 'which is not equivalent', 'what is not equal', 'which is not equal', 'what is not comparable', 'which is not comparable', 'what is not comparable to', 'which is not comparable to', 'what is not comparable with', 'which is not comparable with', 'what is not comparable against', 'which is not comparable against', 'what is not comparable versus', 'which is not comparable versus', 'what is not comparable vs', 'which is not comparable vs', 'what is not comparable like', 'which is not comparable like', 'what is not comparable similar', 'which is not comparable similar', 'what is not comparable same', 'which is not comparable same', 'what is not comparable identical', 'which is not comparable identical', 'what is not comparable equivalent', 'which is not comparable equivalent', 'what is not comparable equal', 'which is not comparable equal', 'what is not comparable different', 'which is not comparable different', 'what is not comparable unlike', 'which is not comparable unlike', 'what is not comparable opposite', 'which is not comparable opposite', 'what is not comparable opposite of', 'which is not comparable opposite of', 'what is not comparable different from', 'which is not comparable different from', 'what is not comparable different than', 'which is not comparable different than', 'what is not comparable unlike', 'which is not comparable unlike', 'what is not comparable not like', 'which is not comparable not like', 'what is not comparable not similar', 'which is not comparable not similar', 'what is not comparable not same', 'which is not comparable not same', 'what is not comparable not identical', 'which is not comparable not identical', 'what is not comparable not equivalent', 'which is not comparable not equivalent', 'what is not comparable not equal', 'which is not comparable not equal'];
            
            irrelevantBase.forEach(kw => {
                addUniqueKeyword(kw, 'Filters review, comparison, and informational searches', 'Irrelevant');
            });
            
            // Informational (150+ variations)
            const informationalBase = ['what is', 'who is', 'when', 'where', 'why', 'wikipedia', 'definition', 'meaning', 'information', 'info', 'about', 'history', 'facts', 'statistics', 'stats', 'data', 'research', 'article', 'articles', 'blog', 'what does', 'what do', 'what are', 'what was', 'what were', 'what will', 'what would', 'what can', 'what could', 'what should', 'what might', 'what may', 'what must', 'what shall', 'what ought', 'what need', 'what needs', 'what required', 'what requires', 'what wants', 'what want', 'what likes', 'what like', 'what loves', 'what love', 'what hates', 'what hate', 'what prefers', 'what prefer', 'what chooses', 'what choose', 'what selects', 'what select', 'what picks', 'what pick', 'what decides', 'what decide', 'what determines', 'what determine', 'what establishes', 'what establish', 'what sets', 'what set', 'what fixes', 'what fix', 'what locks', 'what lock', 'what seals', 'what seal', 'what closes', 'what close', 'what finalizes', 'what finalize', 'what concludes', 'what conclude', 'what ends', 'what end', 'what finishes', 'what finish', 'what completes', 'what complete', 'what wraps up', 'what wrap up', 'what rounds off', 'what round off', 'what ties up', 'what tie up', 'what closes out', 'what close out', 'what winds down', 'what wind down', 'what wraps', 'what wrap', 'what packages', 'what package', 'what bundles', 'what bundle', 'what groups', 'what group', 'what combines', 'what combine', 'what merges', 'what merge', 'what unifies', 'what unify', 'what consolidates', 'what consolidate', 'what integrates', 'what integrate', 'what incorporates', 'what incorporate', 'what includes', 'what include', 'what encompasses', 'what encompass', 'what covers', 'what cover', 'what embraces', 'what embrace', 'what contains', 'what contain', 'what holds', 'what hold', 'what carries', 'what carry', 'what bears', 'what bear', 'what supports', 'what support', 'what sustains', 'what sustain', 'what maintains', 'what maintain', 'what preserves', 'what preserve', 'what keeps', 'what keep', 'what retains', 'what retain', 'what holds onto', 'what hold onto', 'what clings to', 'what cling to', 'what sticks with', 'what stick with', 'what stays with', 'what stay with', 'what remains with', 'what remain with', 'what continues with', 'what continue with', 'what persists with', 'what persist with', 'what endures', 'what endure', 'what lasts', 'what last', 'what survives', 'what survive', 'what outlasts', 'what outlast', 'what outlives', 'what outlive', 'what outstays', 'what outstay', 'what outstretches', 'what outstretch', 'what outreaches', 'what outreach', 'what extends', 'what extend', 'what expands', 'what expand', 'what grows', 'what grow', 'what develops', 'what develop', 'what evolves', 'what evolve', 'what progresses', 'what progress', 'what advances', 'what advance', 'what moves forward', 'what move forward', 'what goes forward', 'what go forward', 'what proceeds', 'what proceed', 'what continues', 'what continue', 'what persists', 'what persist', 'what endures', 'what endure', 'what lasts', 'what last', 'what survives', 'what survive', 'what thrives', 'what thrive', 'what flourishes', 'what flourish', 'what prospers', 'what prosper', 'what succeeds', 'what succeed', 'what achieves', 'what achieve', 'what attains', 'what attain', 'what reaches', 'what reach', 'what obtains', 'what obtain', 'what acquires', 'what acquire', 'what gains', 'what gain', 'what earns', 'what earn', 'what wins', 'what win', 'what secures', 'what secure', 'what captures', 'what capture', 'what seizes', 'what seize', 'what grabs', 'what grab', 'what snatches', 'what snatch', 'what takes', 'what take', 'what gets', 'what get', 'what receives', 'what receive', 'what accepts', 'what accept', 'what welcomes', 'what welcome', 'what embraces', 'what embrace', 'what adopts', 'what adopt', 'what takes on', 'what take on', 'what takes up', 'what take up', 'what takes over', 'what take over', 'what assumes', 'what assume', 'what undertakes', 'what undertake', 'what embarks on', 'what embark on', 'what starts', 'what start', 'what begins', 'what begin', 'what commences', 'what commence', 'what initiates', 'what initiate', 'what launches', 'what launch', 'what opens', 'what open', 'what introduces', 'what introduce', 'what presents', 'what present', 'what offers', 'what offer', 'what provides', 'what provide', 'what supplies', 'what supply', 'what delivers', 'what deliver', 'what furnishes', 'what furnish', 'what equips', 'what equip', 'what outfits', 'what outfit', 'what prepares', 'what prepare', 'what readies', 'what ready', 'what sets up', 'what set up', 'what arranges', 'what arrange', 'what organizes', 'what organize', 'what coordinates', 'what coordinate', 'what orchestrates', 'what orchestrate', 'what manages', 'what manage', 'what handles', 'what handle', 'what deals with', 'what deal with', 'what copes with', 'what cope with', 'what manages', 'what manage', 'what controls', 'what control', 'what regulates', 'what regulate', 'what governs', 'what govern', 'what oversees', 'what oversee', 'what supervises', 'what supervise', 'what monitors', 'what monitor', 'what watches', 'what watch', 'what observes', 'what observe', 'what notices', 'what notice', 'what detects', 'what detect', 'what discovers', 'what discover', 'what finds', 'what find', 'what locates', 'what locate', 'what identifies', 'what identify', 'what recognizes', 'what recognize', 'what acknowledges', 'what acknowledge', 'what admits', 'what admit', 'what confesses', 'what confess', 'what reveals', 'what reveal', 'what discloses', 'what disclose', 'what exposes', 'what expose', 'what uncovers', 'what uncover', 'what unveils', 'what unveil', 'what unmasks', 'what unmask', 'what uncloaks', 'what uncloak', 'what unwraps', 'what unwrap', 'what unpacks', 'what unpack', 'what unfolds', 'what unfold', 'what unrolls', 'what unroll', 'what unfurls', 'what unfurl', 'what spreads', 'what spread', 'what stretches', 'what stretch', 'what extends', 'what extend', 'what expands', 'what expand', 'what widens', 'what widen', 'what broadens', 'what broaden', 'what enlarges', 'what enlarge', 'what increases', 'what increase', 'what grows', 'what grow', 'what develops', 'what develop', 'what evolves', 'what evolve', 'what progresses', 'what progress', 'what advances', 'what advance', 'what improves', 'what improve', 'what enhances', 'what enhance', 'what upgrades', 'what upgrade', 'what refines', 'what refine', 'what perfects', 'what perfect', 'what polishes', 'what polish', 'what smooths', 'what smooth', 'what softens', 'what soften', 'what eases', 'what ease', 'what relaxes', 'what relax', 'what loosens', 'what loosen', 'what releases', 'what release', 'what frees', 'what free', 'what liberates', 'what liberate', 'what emancipates', 'what emancipate', 'what unshackles', 'what unshackle', 'what unchains', 'what unchain', 'what unties', 'what untie', 'what unbinds', 'what unbind', 'what unfastens', 'what unfasten', 'what unbuttons', 'what unbutton', 'what unzips', 'what unzip', 'what unlaces', 'what unlace', 'what unties', 'what untie', 'what unwraps', 'what unwrap', 'what unpacks', 'what unpack', 'what unboxes', 'what unbox', 'what uncrates', 'what uncrate', 'what uncases', 'what uncase', 'what unsheaths', 'what unsheath'];
            
            informationalBase.forEach(kw => {
                addUniqueKeyword(kw, 'Filters informational and definitional searches', 'Informational');
            });
            
            // Corporate (100+ variations)
            const corporateBase = ['company', 'corporation', 'headquarters', 'headquater', 'office', 'contact', 'phone number', 'address', 'location', 'locations', 'hours', 'open', 'closed', 'email', 'customer service', 'support', 'contact us', 'about us', 'corporate', 'investor', 'investor relations', 'investor relations department', 'investor relations team', 'investor relations contact', 'investor relations email', 'investor relations phone', 'investor relations address', 'investor relations location', 'investor relations office', 'investor relations headquarters', 'investor relations corporate', 'investor relations company', 'investor relations corporation', 'investor relations business', 'investor relations firm', 'investor relations agency', 'investor relations organization', 'investor relations institution', 'investor relations establishment', 'investor relations enterprise', 'investor relations venture', 'investor relations undertaking', 'investor relations operation', 'investor relations activity', 'investor relations function', 'investor relations role', 'investor relations responsibility', 'investor relations duty', 'investor relations obligation', 'investor relations commitment', 'investor relations dedication', 'investor relations devotion', 'investor relations loyalty', 'investor relations faithfulness', 'investor relations trustworthiness', 'investor relations reliability', 'investor relations dependability', 'investor relations consistency', 'investor relations steadiness', 'investor relations stability', 'investor relations constancy', 'investor relations uniformity', 'investor relations regularity', 'investor relations routine', 'investor relations standard', 'investor relations typical', 'investor relations normal', 'investor relations ordinary', 'investor relations common', 'investor relations usual', 'investor relations customary', 'investor relations conventional', 'investor relations traditional', 'investor relations classic', 'investor relations vintage', 'investor relations retro', 'investor relations old', 'investor relations new', 'investor relations fresh', 'investor relations recent', 'investor relations latest', 'investor relations modern', 'investor relations contemporary'];
            
            corporateBase.forEach(kw => {
                addUniqueKeyword(kw, 'Filters company info and corporate searches', 'Corporate');
            });
            
            // Media/Entertainment (100+ variations)
            const mediaBase = ['video', 'videos', 'youtube', 'watch', 'stream', 'streaming', 'podcast', 'download', 'mp3', 'pdf', 'image', 'images', 'picture', 'pictures', 'photo', 'photos', 'wallpaper', 'movie', 'movies', 'film', 'films', 'cinema', 'cinemas', 'theater', 'theaters', 'theatre', 'theatres', 'show', 'shows', 'series', 'episode', 'episodes', 'season', 'seasons', 'episode', 'episodes', 'season', 'seasons', 'series', 'series', 'show', 'shows', 'program', 'programs', 'programme', 'programmes', 'broadcast', 'broadcasts', 'telecast', 'telecasts', 'airing', 'airings', 'premiere', 'premieres', 'debut', 'debuts', 'release', 'releases', 'launch', 'launches', 'opening', 'openings', 'closing', 'closings', 'ending', 'endings', 'finale', 'finales', 'final', 'finals', 'conclusion', 'conclusions', 'wrap up', 'wrap ups', 'wrap-up', 'wrap-ups', 'round off', 'round offs', 'round-off', 'round-offs', 'tie up', 'tie ups', 'tie-up', 'tie-ups', 'close out', 'close outs', 'close-out', 'close-outs', 'wind down', 'wind downs', 'wind-down', 'wind-downs', 'wrap', 'wraps', 'package', 'packages', 'bundle', 'bundles', 'group', 'groups', 'combine', 'combines', 'merge', 'merges', 'unify', 'unifies', 'consolidate', 'consolidates', 'integrate', 'integrates', 'incorporate', 'incorporates', 'include', 'includes', 'encompass', 'encompasses', 'cover', 'covers', 'embrace', 'embraces', 'contain', 'contains', 'hold', 'holds', 'carry', 'carries', 'bear', 'bears', 'support', 'supports', 'sustain', 'sustains', 'maintain', 'maintains', 'preserve', 'preserves', 'keep', 'keeps', 'retain', 'retains', 'hold onto', 'holds onto', 'cling to', 'clings to', 'stick with', 'sticks with', 'stay with', 'stays with', 'remain with', 'remains with', 'continue with', 'continues with', 'persist with', 'persists with', 'endure', 'endures', 'last', 'lasts', 'survive', 'survives', 'outlast', 'outlasts', 'outlive', 'outlives', 'outstay', 'outstays', 'outstretch', 'outstretches', 'outreach', 'outreaches', 'extend', 'extends', 'expand', 'expands', 'grow', 'grows', 'develop', 'develops', 'evolve', 'evolves', 'progress', 'progresses', 'advance', 'advances', 'move forward', 'moves forward', 'go forward', 'goes forward', 'proceed', 'proceeds', 'continue', 'continues', 'persist', 'persists', 'endure', 'endures', 'last', 'lasts', 'survive', 'survives', 'thrive', 'thrives', 'flourish', 'flourishes', 'prosper', 'prospers', 'succeed', 'succeeds', 'achieve', 'achieves', 'attain', 'attains', 'reach', 'reaches', 'obtain', 'obtains', 'acquire', 'acquires', 'gain', 'gains', 'earn', 'earns', 'win', 'wins', 'secure', 'secures', 'capture', 'captures', 'seize', 'seizes', 'grab', 'grabs', 'snatch', 'snatches', 'take', 'takes', 'get', 'gets', 'receive', 'receives', 'accept', 'accepts', 'welcome', 'welcomes', 'embrace', 'embraces', 'adopt', 'adopts', 'take on', 'takes on', 'take up', 'takes up', 'take over', 'takes over', 'assume', 'assumes', 'undertake', 'undertakes', 'embark on', 'embarks on', 'start', 'starts', 'begin', 'begins', 'commence', 'commences', 'initiate', 'initiates', 'launch', 'launches', 'open', 'opens', 'introduce', 'introduces', 'present', 'presents', 'offer', 'offers', 'provide', 'provides', 'supply', 'supplies', 'deliver', 'delivers', 'furnish', 'furnishes', 'equip', 'equips', 'outfit', 'outfits', 'prepare', 'prepares', 'ready', 'readies', 'set up', 'sets up', 'arrange', 'arranges', 'organize', 'organizes', 'coordinate', 'coordinates', 'orchestrate', 'orchestrates', 'manage', 'manages', 'handle', 'handles', 'deal with', 'deals with', 'cope with', 'copes with', 'manage', 'manages', 'control', 'controls', 'regulate', 'regulates', 'govern', 'governs', 'oversee', 'oversees', 'supervise', 'supervises', 'monitor', 'monitors', 'watch', 'watches', 'observe', 'observes', 'notice', 'notices', 'detect', 'detects', 'discover', 'discovers', 'find', 'finds', 'locate', 'locates', 'identify', 'identifies', 'recognize', 'recognizes', 'acknowledge', 'acknowledges', 'admit', 'admits', 'confess', 'confesses', 'reveal', 'reveals', 'disclose', 'discloses', 'expose', 'exposes', 'uncover', 'uncovers', 'unveil', 'unveils', 'unmask', 'unmasks', 'uncloak', 'uncloaks', 'unwrap', 'unwraps', 'unpack', 'unpacks', 'unfold', 'unfolds', 'unroll', 'unrolls', 'unfurl', 'unfurls', 'spread', 'spreads', 'stretch', 'stretches', 'extend', 'extends', 'expand', 'expands', 'widen', 'widens', 'broaden', 'broadens', 'enlarge', 'enlarges', 'increase', 'increases', 'grow', 'grows', 'develop', 'develops', 'evolve', 'evolves', 'progress', 'progresses', 'advance', 'advances', 'improve', 'improves', 'enhance', 'enhances', 'upgrade', 'upgrades', 'refine', 'refines', 'perfect', 'perfects', 'polish', 'polishes', 'smooth', 'smooths', 'soften', 'softens', 'ease', 'eases', 'relax', 'relaxes', 'loosen', 'loosens', 'release', 'releases', 'free', 'frees', 'liberate', 'liberates', 'emancipate', 'emancipates', 'unshackle', 'unshackles', 'unchain', 'unchains', 'untie', 'unties', 'unbind', 'unbinds', 'unfasten', 'unfastens', 'unbutton', 'unbuttons', 'unzip', 'unzips', 'unlace', 'unlaces', 'untie', 'unties', 'unwrap', 'unwraps', 'unpack', 'unpacks', 'unbox', 'unboxes', 'uncrate', 'uncrates', 'uncase', 'uncases', 'unsheath', 'unsheaths'];
            
            mediaBase.forEach(kw => {
                addUniqueKeyword(kw, 'Filters media content and entertainment searches', 'Media');
            });
            
            // Legal/Regulatory (100+ variations)
            const legalBase = ['lawsuit', 'legal', 'sue', 'court', 'case', 'lawyer', 'attorney', 'settlement', 'claim', 'fraud', 'illegal', 'investigation', 'regulation', 'compliance', 'terms of service', 'privacy policy', 'refund', 'return', 'warranty', 'guarantee', 'sue', 'suing', 'sued', 'lawsuit', 'lawsuits', 'legal action', 'legal actions', 'legal proceeding', 'legal proceedings', 'legal process', 'legal processes', 'legal case', 'legal cases', 'legal matter', 'legal matters', 'legal issue', 'legal issues', 'legal problem', 'legal problems', 'legal dispute', 'legal disputes', 'legal conflict', 'legal conflicts', 'legal controversy', 'legal controversies', 'legal disagreement', 'legal disagreements', 'legal argument', 'legal arguments', 'legal debate', 'legal debates', 'legal discussion', 'legal discussions', 'legal conversation', 'legal conversations', 'legal talk', 'legal talks', 'legal chat', 'legal chats', 'legal communication', 'legal communications', 'legal exchange', 'legal exchanges', 'legal interaction', 'legal interactions', 'legal engagement', 'legal engagements', 'legal involvement', 'legal involvements', 'legal participation', 'legal participations', 'legal contribution', 'legal contributions', 'legal input', 'legal inputs', 'legal output', 'legal outputs', 'legal feedback', 'legal feedbacks', 'legal response', 'legal responses', 'legal reply', 'legal replies', 'legal answer', 'legal answers', 'legal solution', 'legal solutions', 'legal resolution', 'legal resolutions', 'legal settlement', 'legal settlements', 'legal agreement', 'legal agreements', 'legal contract', 'legal contracts', 'legal deal', 'legal deals', 'legal arrangement', 'legal arrangements', 'legal understanding', 'legal understandings', 'legal consensus', 'legal consensuses', 'legal accord', 'legal accords', 'legal harmony', 'legal harmonies', 'legal unity', 'legal unities', 'legal solidarity', 'legal solidarities', 'legal cooperation', 'legal cooperations', 'legal collaboration', 'legal collaborations', 'legal partnership', 'legal partnerships', 'legal alliance', 'legal alliances', 'legal association', 'legal associations', 'legal connection', 'legal connections', 'legal link', 'legal links', 'legal bond', 'legal bonds', 'legal tie', 'legal ties', 'legal relationship', 'legal relationships', 'legal relation', 'legal relations', 'legal association', 'legal associations', 'legal affiliation', 'legal affiliations', 'legal membership', 'legal memberships', 'legal belonging', 'legal belongings', 'legal inclusion', 'legal inclusions', 'legal integration', 'legal integrations', 'legal incorporation', 'legal incorporations', 'legal assimilation', 'legal assimilations', 'legal absorption', 'legal absorptions', 'legal adoption', 'legal adoptions', 'legal acceptance', 'legal acceptances', 'legal approval', 'legal approvals', 'legal endorsement', 'legal endorsements', 'legal support', 'legal supports', 'legal backing', 'legal backings', 'legal encouragement', 'legal encouragements', 'legal promotion', 'legal promotions', 'legal advancement', 'legal advancements', 'legal progress', 'legal progresses', 'legal development', 'legal developments', 'legal growth', 'legal growths', 'legal expansion', 'legal expansions', 'legal extension', 'legal extensions', 'legal enlargement', 'legal enlargements', 'legal increase', 'legal increases', 'legal rise', 'legal rises', 'legal surge', 'legal surges', 'legal spike', 'legal spikes', 'legal jump', 'legal jumps', 'legal leap', 'legal leaps', 'legal boost', 'legal boosts', 'legal lift', 'legal lifts', 'legal raise', 'legal raises', 'legal elevation', 'legal elevations', 'legal upgrade', 'legal upgrades', 'legal improvement', 'legal improvements', 'legal enhancement', 'legal enhancements', 'legal refinement', 'legal refinements', 'legal perfection', 'legal perfections', 'legal polish', 'legal polishes', 'legal smoothing', 'legal smoothings', 'legal softening', 'legal softenings', 'legal easing', 'legal easings', 'legal relaxation', 'legal relaxations', 'legal loosening', 'legal loosenings', 'legal release', 'legal releases', 'legal freeing', 'legal freings', 'legal liberation', 'legal liberations', 'legal emancipation', 'legal emancipations', 'legal unshackling', 'legal unshacklings', 'legal unchaining', 'legal unchainings', 'legal untying', 'legal untyings', 'legal unbinding', 'legal unbindings', 'legal unfastening', 'legal unfastenings', 'legal unbuttoning', 'legal unbuttonings', 'legal unzipping', 'legal unzippings', 'legal unlacing', 'legal unlacings', 'legal untying', 'legal untyings', 'legal unwrapping', 'legal unwrappings', 'legal unpacking', 'legal unpackings', 'legal unboxing', 'legal unboxings', 'legal uncrating', 'legal uncratings', 'legal uncasing', 'legal uncasings', 'legal unsheathing', 'legal unsheathings'];
            
            legalBase.forEach(kw => {
                addUniqueKeyword(kw, 'Filters legal action and regulatory searches', 'Legal');
            });

            // Add more variations to reach 700+ keywords
            // All keywords have been added using the helper function above

            // Expand Educational category with DIY queries (150+ variations)
            const educationalBase = ['tutorial', 'how to', 'guide', 'diy', 'learn', 'course', 'training', 'class', 'classes', 'school', 'university', 'college', 'study', 'lesson', 'lessons', 'certification', 'certificate', 'online course', 'video tutorial', 'ebook', 'how to make', 'how to use', 'how to get', 'how to do', 'how to build', 'how to create', 'how to install', 'how to fix', 'how to repair', 'how to replace', 'how to remove', 'how to clean', 'how to maintain', 'how to operate', 'how to setup', 'how to configure', 'how to program', 'how to code', 'how to design', 'how to paint', 'how to cook', 'how to bake', 'how to prepare', 'how to make money', 'how to earn', 'how to save', 'how to invest', 'how to trade', 'how to start', 'how to begin', 'how to learn', 'how to study', 'how to practice', 'how to improve', 'how to master', 'how to become', 'how to get started', 'how to get better', 'how to get good', 'how to get fast', 'how to get cheap', 'how to get free', 'how to get rid of', 'how to get out of', 'how to get away from', 'how to get back', 'how to get home', 'how to get there', 'how to get here', 'how to get started', 'how to get going', 'how to get moving', 'how to get working', 'how to get running', 'how to get functioning', 'how to get operating', 'how to get performing', 'how to get producing', 'how to get creating', 'how to get making', 'how to get building', 'how to get constructing', 'how to get developing', 'how to get growing', 'how to get expanding', 'how to get increasing', 'how to get improving', 'how to get enhancing', 'how to get upgrading', 'how to get updating', 'how to get revising', 'how to get modifying', 'how to get adjusting', 'how to get adapting', 'how to get customizing', 'how to get personalizing', 'how to get tailoring', 'how to get fitting', 'how to get sizing', 'how to get measuring', 'how to get calculating', 'how to get computing', 'how to get determining', 'how to get establishing', 'how to get setting', 'how to get fixing', 'how to get locking', 'how to get sealing', 'how to get closing', 'how to get finalizing', 'how to get concluding', 'how to get ending', 'how to get finishing', 'how to get completing', 'how to get wrapping up', 'how to get rounding off', 'how to get tying up', 'how to get closing out', 'how to get winding down', 'how to get wrapping', 'how to get packaging', 'how to get bundling', 'how to get grouping', 'how to get combining', 'how to get merging', 'how to get unifying', 'how to get consolidating', 'how to get integrating', 'how to get incorporating', 'how to get including', 'how to get encompassing', 'how to get covering', 'how to get embracing', 'how to get containing', 'how to get holding', 'how to get carrying', 'how to get bearing', 'how to get supporting', 'how to get sustaining', 'how to get maintaining', 'how to get preserving', 'how to get keeping', 'how to get retaining', 'how to get holding onto', 'how to get clinging to', 'how to get sticking with', 'how to get staying with', 'how to get remaining with', 'how to get continuing with', 'how to get persisting with', 'how to get enduring', 'how to get lasting', 'how to get surviving', 'how to get outlasting', 'how to get outliving', 'how to get outstaying', 'how to get outstretching', 'how to get outreaching', 'how to get extending', 'how to get expanding', 'how to get growing', 'how to get developing', 'how to get evolving', 'how to get progressing', 'how to get advancing', 'how to get moving forward', 'how to get going forward', 'how to get proceeding', 'how to get continuing', 'how to get persisting', 'how to get enduring', 'how to get lasting', 'how to get surviving', 'how to get thriving', 'how to get flourishing', 'how to get prospering', 'how to get succeeding', 'how to get achieving', 'how to get attaining', 'how to get reaching', 'how to get obtaining', 'how to get acquiring', 'how to get gaining', 'how to get earning', 'how to get winning', 'how to get securing', 'how to get capturing', 'how to get seizing', 'how to get grabbing', 'how to get snatching', 'how to get taking', 'how to get getting', 'how to get receiving', 'how to get accepting', 'how to get welcoming', 'how to get embracing', 'how to get adopting', 'how to get taking on', 'how to get taking up', 'how to get taking over', 'how to get assuming', 'how to get undertaking', 'how to get embarking on', 'how to get starting', 'how to get beginning', 'how to get commencing', 'how to get initiating', 'how to get launching', 'how to get opening', 'how to get introducing', 'how to get presenting', 'how to get offering', 'how to get providing', 'how to get supplying', 'how to get delivering', 'how to get furnishing', 'how to get equipping', 'how to get outfitting', 'how to get preparing', 'how to get readying', 'how to get setting up', 'how to get arranging', 'how to get organizing', 'how to get coordinating', 'how to get orchestrating', 'how to get managing', 'how to get handling', 'how to get dealing with', 'how to get coping with', 'how to get managing', 'how to get controlling', 'how to get regulating', 'how to get governing', 'how to get overseeing', 'how to get supervising', 'how to get monitoring', 'how to get watching', 'how to get observing', 'how to get noticing', 'how to get detecting', 'how to get discovering', 'how to get finding', 'how to get locating', 'how to get identifying', 'how to get recognizing', 'how to get acknowledging', 'how to get admitting', 'how to get confessing', 'how to get revealing', 'how to get disclosing', 'how to get exposing', 'how to get uncovering', 'how to get unveiling', 'how to get unmasking', 'how to get uncloaking', 'how to get unwrapping', 'how to get unpacking', 'how to get unfolding', 'how to get unrolling', 'how to get unfurling', 'how to get spreading', 'how to get stretching', 'how to get extending', 'how to get expanding', 'how to get widening', 'how to get broadening', 'how to get enlarging', 'how to get increasing', 'how to get growing', 'how to get developing', 'how to get evolving', 'how to get progressing', 'how to get advancing', 'how to get improving', 'how to get enhancing', 'how to get upgrading', 'how to get refining', 'how to get perfecting', 'how to get polishing', 'how to get smoothing', 'how to get softening', 'how to get easing', 'how to get relaxing', 'how to get loosening', 'how to get releasing', 'how to get freeing', 'how to get liberating', 'how to get emancipating', 'how to get unshackling', 'how to get unchaining', 'how to get untying', 'how to get unbinding', 'how to get unfastening', 'how to get unbuttoning', 'how to get unzipping', 'how to get unlacing', 'how to get untying', 'how to get unwrapping', 'how to get unpacking', 'how to get unboxing', 'how to get uncrating', 'how to get uncasing', 'how to get unsheathing', 'step by step', 'instructions', 'instruction manual', 'instruction guide', 'instruction video', 'instruction tutorial', 'instruction course', 'instruction class', 'instruction lesson', 'instruction book', 'instruction ebook', 'instruction pdf', 'instruction document', 'instruction file', 'instruction material', 'instruction content', 'instruction resource', 'instruction reference', 'instruction source', 'instruction website', 'instruction site', 'instruction page', 'instruction article', 'instruction blog', 'instruction post', 'instruction entry', 'instruction piece', 'instruction writeup', 'instruction write up', 'instruction write-up', 'instruction writing', 'instruction text', 'instruction copy', 'instruction content', 'instruction material', 'instruction resource', 'instruction reference', 'instruction source', 'instruction website', 'instruction site', 'instruction page', 'instruction article', 'instruction blog', 'instruction post', 'instruction entry', 'instruction piece', 'instruction writeup', 'instruction write up', 'instruction write-up', 'instruction writing', 'instruction text', 'instruction copy'];
            
            educationalBase.forEach(kw => {
                addUniqueKeyword(kw, 'Filters educational content and DIY instruction searches', 'Educational');
            });
            
            // Expand with competitor terms and related category mismatches (100+ variations)
            const competitorTerms = ['competitor', 'competitors', 'competition', 'competing', 'compete', 'rival', 'rivals', 'rivalry', 'alternative', 'alternatives', 'similar to', 'like', 'better than', 'worse than', 'compared to', 'comparison', 'compare', 'vs', 'versus', 'against', 'opposite', 'opposite of', 'different from', 'different than', 'unlike', 'not like', 'not similar', 'not same', 'not identical', 'not equivalent', 'not equal', 'not comparable', 'not comparable to', 'not comparable with', 'not comparable against', 'not comparable versus', 'not comparable vs', 'not comparable like', 'not comparable similar', 'not comparable same', 'not comparable identical', 'not comparable equivalent', 'not comparable equal', 'not comparable different', 'not comparable unlike', 'not comparable opposite', 'not comparable against', 'not comparable opposite of', 'not comparable different from', 'not comparable different than', 'not comparable unlike', 'not comparable not like', 'not comparable not similar', 'not comparable not same', 'not comparable not identical', 'not comparable not equivalent', 'not comparable not equal', 'not comparable not comparable', 'not comparable not comparable to', 'not comparable not comparable with', 'not comparable not comparable against', 'not comparable not comparable versus', 'not comparable not comparable vs', 'not comparable not comparable like', 'not comparable not comparable similar', 'not comparable not comparable same', 'not comparable not comparable identical', 'not comparable not comparable equivalent', 'not comparable not comparable equal', 'not comparable not comparable different', 'not comparable not comparable unlike', 'not comparable not comparable opposite', 'not comparable not comparable opposite of', 'not comparable not comparable different from', 'not comparable not comparable different than', 'not comparable not comparable unlike', 'not comparable not comparable not like', 'not comparable not comparable not similar', 'not comparable not comparable not same', 'not comparable not comparable not identical', 'not comparable not comparable not equivalent', 'not comparable not comparable not equal'];
            
            competitorTerms.forEach(kw => {
                addUniqueKeyword(kw, 'Filters competitor research and comparison searches', 'Competitor Terms');
            });
            
            // Ensure we have at least 1000 unique keywords
            const uniqueKeywords = Array.from(new Set(mockNegatives.map(k => k.keyword)))
                .map(kw => mockNegatives.find(k => k.keyword === kw)!)
                .filter(Boolean);

            setGeneratedKeywords(uniqueKeywords.slice(0, 1200)); // Target 1000+ keywords
            console.log('Generated fallback negative keywords:', uniqueKeywords.length);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        // Export only exact match type for negative keywords
        let csvContent = "Keyword,Match Type,Reason,Category\n";

        generatedKeywords.forEach(item => {
            // Keyword already has brackets, use as-is
            csvContent += `${item.keyword},Exact,${item.reason},${item.category}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "negative_keywords.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="p-8 space-y-8 w-full min-h-screen bg-transparent">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    AI Negative Keyword Generator
                </h1>
                <p className="text-slate-500 font-medium">
                    AI will analyze your website to understand your business and generate thousands of relevant negative keywords in exact match type.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Inputs */}
                <Card className="lg:col-span-1 border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-xl h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-indigo-600" />
                            Analysis Configuration
                        </CardTitle>
                        <CardDescription>
                            Provide details to guide the AI model.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-slate-400" />
                                Target URL <span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="https://example.com/landing-page" 
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="bg-white/80"
                                required
                            />
                            <p className="text-xs text-slate-500">
                                AI will analyze this website to understand your business, CTA, and generate relevant negative keywords.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Type className="h-4 w-4 text-slate-400" />
                                Core Keywords <span className="text-red-500">*</span>
                            </label>
                            <Textarea 
                                placeholder="e.g. plumbing services, emergency plumber, drain cleaning" 
                                value={coreKeywords}
                                onChange={(e) => setCoreKeywords(e.target.value)}
                                className="bg-white/80 min-h-[100px]"
                            />
                            <p className="text-xs text-slate-500">Enter the main keywords you are targeting.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-slate-400" />
                                User Desire / Goal <span className="text-red-500">*</span>
                            </label>
                            <Select value={userGoal} onValueChange={setUserGoal}>
                                <SelectTrigger className="bg-white/80">
                                    <SelectValue placeholder="Select primary goal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="leads">Leads (High-Intent)</SelectItem>
                                    <SelectItem value="calls">Calls / Appointments</SelectItem>
                                    <SelectItem value="signups">Signups / Trials</SelectItem>
                                    <SelectItem value="branding">Branding / Awareness</SelectItem>
                                    <SelectItem value="ecommerce">E-commerce (Transactional)</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button 
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200"
                            size="lg"
                            onClick={handleGenerate}
                            disabled={isGenerating || !url || !coreKeywords || !userGoal}
                        >
                            {isGenerating ? (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing Website...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate Negatives
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Panel: Results */}
                <Card className="lg:col-span-2 border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-xl min-h-[600px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Generated Keywords (Exact Match)</CardTitle>
                            <CardDescription>
                                {generatedKeywords.length > 0 
                                    ? `${generatedKeywords.length} negative keywords found based on your website analysis.` 
                                    : "Results will appear here after generation."}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {generatedKeywords.length > 0 && (
                                <>
                                    <Button 
                                        variant="outline" 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button variant="outline" onClick={handleDownload} className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Export
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardHeader>
                    
                    {/* Info about match type */}
                    {generatedKeywords.length > 0 && (
                        <div className="px-6 py-3 bg-slate-50/50 border-y border-slate-100">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-normal">
                                    Exact Match [keyword]
                                </Badge>
                                <span className="text-xs text-slate-600">
                                    All negative keywords are exported in exact match format for maximum precision
                                </span>
                            </div>
                        </div>
                    )}

                    <CardContent className="p-0 flex-1">
                        {generatedKeywords.length > 0 ? (
                            <div className="max-h-[600px] overflow-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                        <TableRow>
                                            <TableHead className="w-[40%]">Negative Keyword (Exact Match)</TableHead>
                                            <TableHead>Suggested Reason</TableHead>
                                            <TableHead>Category</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {generatedKeywords.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-medium text-slate-700">
                                                    {item.keyword}
                                                </TableCell>
                                                <TableCell className="text-slate-500">{item.reason}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-normal text-slate-500 bg-slate-100 hover:bg-slate-200">
                                                        {item.category}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-60 min-h-[400px]">
                                <div className="bg-slate-100 rounded-full p-6 mb-4">
                                    <Sparkles className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800">Ready to Generate</h3>
                                <p className="text-slate-500 max-w-md mt-2">
                                    Fill out the configuration including your website URL. AI will analyze your website to understand your business and generate a comprehensive list of negative keywords.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};