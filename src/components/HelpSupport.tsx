import React, { useState } from 'react';
import { 
    Book, HelpCircle, MessageSquare, Search, ChevronRight, ChevronDown,
    FileText, Zap, Target, BarChart3, Settings, Download, Upload,
    CheckCircle2, AlertCircle, Send, X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    createdAt: string;
}

const documentationSections = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: Zap,
        articles: [
            {
                title: 'Welcome to Google Ads Dashboard',
                content: `Our platform helps you create professional Google Ads campaigns in minutes. This dashboard provides a comprehensive suite of tools including a 5-step Campaign Builder, Keyword Planner with AI-powered suggestions, CSV Validator for bulk imports, and an Ad Creation interface supporting RSA (Responsive Search Ads), DKI (Dynamic Keyword Insertion), and Call-Only ads.`
            },
            {
                title: 'Quick Start Guide',
                content: `1. Navigate to "Campaign Builder" from the main menu
2. Choose your campaign structure (SKAG, STAG, or Mix)
3. Use the Keyword Planner to generate 100-1000 keywords
4. Select keywords for your campaign
5. Create ads using our templates
6. Configure geo-targeting
7. Review and export your campaign as CSV`
            },
            {
                title: 'System Requirements',
                content: `- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for AI-powered features
- Screen resolution: 1280x720 or higher recommended
- JavaScript enabled`
            }
        ]
    },
    {
        id: 'campaign-builder',
        title: 'Campaign Builder',
        icon: Target,
        articles: [
            {
                title: '5-Step Campaign Builder Overview',
                content: `The Campaign Builder guides you through creating professional Google Ads campaigns in 5 simple steps:

**Step 1: Setup**
Configure your campaign structure (SKAG/STAG/Mix), geo segmentation, match types, and landing page URL.

**Step 2: Keywords**
Generate and select keywords using our AI-powered Keyword Planner. Select from 100-1000 generated keywords with checkbox selection.

**Step 3: Ads & Extensions**
Create Responsive Search Ads, DKI Ads, and Call-Only Ads with AI-generated text suggestions.

**Step 4: Geo Targeting**
Select target countries, states, cities, or ZIP codes for your campaign.

**Step 5: Review & Export**
Review your complete campaign configuration and export as CSV for Google Ads import.`
            },
            {
                title: 'Campaign Structures Explained',
                content: `**SKAG (Single Keyword Ad Group)**
Creates one ad group per keyword for maximum relevance and Quality Score. Best for highly targeted campaigns with specific keywords.

**STAG (Single Theme Ad Group)**
Groups related keywords into themed ad groups. Balances management efficiency with relevance.

**Mix (Hybrid Structure)**
Combines SKAG and STAG approaches based on keyword performance and search volume. Recommended for most campaigns.`
            },
            {
                title: 'Match Types Guide',
                content: `**Broad Match**
Keyword shows ads for searches that include misspellings, synonyms, related searches, and other variations. Format: keyword

**Phrase Match**
Ads show for searches that include the meaning of your keyword. Format: "keyword"

**Exact Match**
Ads show only for searches that have the same meaning or intent as the keyword. Format: [keyword]

**Best Practice**: Use all three match types for comprehensive coverage, with negative keywords to filter irrelevant traffic.`
            }
        ]
    },
    {
        id: 'keyword-planner',
        title: 'Keyword Planner',
        icon: Search,
        articles: [
            {
                title: 'Using the Keyword Planner',
                content: `The Keyword Planner uses AI (Google Gemini) to generate comprehensive keyword lists:

**How to Use:**
1. Enter 3-5 seed keywords (comma-separated)
2. Select target match types (Broad, Phrase, Exact)
3. Add negative keywords (one per line)
4. Click "Generate 100-300 Keywords"
5. Select keywords using checkboxes
6. Click "Continue to Ads" to proceed

**Features:**
- AI-powered keyword expansion
- Fallback generation when offline
- 100-300 keywords per generation
- Append mode for additional keywords
- Negative keyword filtering`
            },
            {
                title: 'Negative Keyword Strategy',
                content: `Negative keywords prevent your ads from showing for irrelevant searches:

**Best Practices:**
- Use the "Generate 500-1000" button for comprehensive coverage
- Include job-related terms: job, career, hiring, apply
- Filter informational queries: how to, what is, reviews
- Exclude competitor brands
- Block price-focused terms: cheap, discount, free
- Remove geographic terms if not relevant: near me, location

**Common Categories:**
- Jobs/Careers: job, career, hiring, apply, salary
- Information: how to, guide, tutorial, tips
- Reviews: review, rating, feedback, complaint
- Competitors: [competitor names]
- Price: cheap, free, discount, sale`
            },
            {
                title: 'Keyword Selection Tips',
                content: `**Selecting High-Quality Keywords:**
- Choose keywords with commercial intent
- Include brand terms for better conversion
- Select long-tail keywords for specific targeting
- Balance broad and specific terms
- Use "Select All" for quick selection
- Review and deselect irrelevant keywords

**Red Flags:**
- Overly generic keywords (high competition)
- Keywords containing negative intent
- Terms too far from your offering
- Extremely low search volume terms`
            }
        ]
    },
    {
        id: 'ad-creation',
        title: 'Ad Creation',
        icon: FileText,
        articles: [
            {
                title: 'Responsive Search Ads (RSA)',
                content: `RSAs automatically test different combinations of headlines and descriptions:

**Best Practices:**
- Create 8-15 unique headlines
- Write 2-4 descriptions
- Include keywords in headlines
- Add your unique value proposition
- Use calls-to-action (CTA)
- Pin important headlines to specific positions

**Character Limits:**
- Headlines: 30 characters each
- Descriptions: 90 characters each
- Display URL paths: 15 characters each

**Tips:**
- Use our AI text generator for suggestions
- Vary message angles across headlines
- Include price/offers when relevant
- Test emotional vs. rational appeals`
            },
            {
                title: 'Dynamic Keyword Insertion (DKI)',
                content: `DKI automatically inserts the user's search query into your ad:

**Format:** {Keyword:Default Text}

**Example:**
Headline: "Buy {Keyword:Running Shoes} Online"
If user searches "nike sneakers", ad shows: "Buy Nike Sneakers Online"
If keyword doesn't fit, shows: "Buy Running Shoes Online"

**Best Practices:**
- Always provide default text
- Ensure default text fits character limits
- Use title case for {Keyword:}
- Test with multiple keyword variations
- Review for grammatical sense

**When to Use:**
- Large keyword lists
- Product-specific campaigns
- E-commerce campaigns
- Location-based services`
            },
            {
                title: 'Call-Only Ads',
                content: `Call-Only ads show only on mobile devices and prompt users to call:

**Required Elements:**
- Business name
- Phone number
- 2 headlines (30 characters each)
- 2 descriptions (90 characters each)

**Best Practices:**
- Use "Call Now" or "Call Today" in headlines
- Mention 24/7 availability if applicable
- Highlight emergency services
- Include location if relevant
- Test different phone numbers
- Track calls with Google forwarding numbers

**Ideal For:**
- Emergency services
- Local services
- High-value consultations
- Appointment-based businesses
- Time-sensitive offers`
            }
        ]
    },
    {
        id: 'csv-validator',
        title: 'CSV Validator',
        icon: Upload,
        articles: [
            {
                title: 'Using the CSV Validator',
                content: `The CSV Validator checks your Google Ads import files for errors:

**How to Use:**
1. Navigate to CSV Validator from the menu
2. Upload your CSV file
3. Review validation results
4. Fix errors highlighted in red
5. Download corrected CSV

**What it Checks:**
- Required columns present
- Character limit compliance
- URL format validation
- Match type syntax
- Duplicate detection
- Invalid characters`
            },
            {
                title: 'CSV Format Requirements',
                content: `**Required Columns:**
- Campaign Name
- Ad Group Name
- Keyword
- Match Type
- Final URL

**Optional Columns:**
- Max CPC
- Ad Headlines (1-15)
- Ad Descriptions (1-4)
- Display Path (1-2)
- Location Targets
- Negative Keywords

**Format Rules:**
- UTF-8 encoding
- Comma-separated values
- Headers in first row
- No empty required fields
- URLs must include http:// or https://`
            }
        ]
    },
    {
        id: 'exporting',
        title: 'Exporting & Importing',
        icon: Download,
        articles: [
            {
                title: 'Exporting Campaigns',
                content: `**Export Options:**
1. **CSV Export**: Standard Google Ads import format
2. **Save Draft**: Save to history for later editing
3. **Copy to Clipboard**: Quick copy for spreadsheets

**CSV Export Process:**
1. Complete all campaign builder steps
2. Click "Export CSV" in Step 5
3. Choose file location
4. File downloads automatically

**What's Included:**
- All campaign settings
- Ad groups with keywords
- Ads with extensions
- Geo-targeting settings
- Negative keywords
- Match type formatting`
            },
            {
                title: 'Importing to Google Ads',
                content: `**Import Process:**
1. Log into Google Ads
2. Click Tools & Settings → Bulk Actions → Uploads
3. Select "Upload CSV file"
4. Choose your exported file
5. Review preview
6. Click "Apply"

**Tips:**
- Review preview carefully before applying
- Start with paused campaigns for testing
- Check budget settings after import
- Verify tracking parameters
- Test on small campaign first

**Common Import Issues:**
- Character encoding (use UTF-8)
- Missing required fields
- Invalid URL formats
- Duplicate keywords
- Budget not set`
            }
        ]
    },
    {
        id: 'ai-features',
        title: 'AI-Powered Features',
        icon: Zap,
        articles: [
            {
                title: 'AI Text Generation',
                content: `Our platform uses Google Gemini AI for intelligent text generation:

**Features:**
- Keyword expansion from seed keywords
- Ad headline suggestions
- Description copywriting
- Negative keyword recommendations
- Landing page analysis

**Fallback System:**
When AI is unavailable, the system automatically falls back to:
- Local keyword generation algorithms
- Template-based ad copy
- Pre-defined negative keyword lists
- No interruption to your workflow

**Network Messages:**
You may see "ℹ️ Backend unavailable - using local fallback generation" - this is normal and indicates the fallback system is working.`
            },
            {
                title: 'AI Best Practices',
                content: `**Getting Better AI Results:**
- Provide specific seed keywords
- Add industry context when possible
- Use negative keywords to refine
- Review and edit AI suggestions
- Combine AI suggestions with your expertise

**Limitations:**
- AI doesn't know your brand voice (review & edit)
- May generate generic terms (refine with negatives)
- Needs clear input (garbage in, garbage out)
- Best used as starting point, not final copy`
            }
        ]
    },
    {
        id: 'account',
        title: 'Account & Settings',
        icon: Settings,
        articles: [
            {
                title: 'Managing Your Account',
                content: `**Account Features:**
- Campaign history
- Saved drafts
- Export history
- User preferences

**Accessing History:**
1. Click "History" in navigation
2. View all saved campaigns
3. Load campaign to continue editing
4. Delete old campaigns

**Privacy & Data:**
- Campaigns saved to your account only
- Data encrypted in transit
- No sharing with third parties
- Delete data anytime`
            }
        ]
    }
];

const faqItems = [
    {
        question: "How do I create my first campaign?",
        answer: "Click 'Campaign Builder' in the navigation menu, then follow the 5-step wizard. Start by selecting your campaign structure (SKAG, STAG, or Mix), then generate keywords, create ads, set geo-targeting, and finally review and export your campaign."
    },
    {
        question: "What are SKAG, STAG, and Mix structures?",
        answer: "SKAG (Single Keyword Ad Group) creates one ad group per keyword for maximum relevance. STAG (Single Theme Ad Group) groups related keywords together. Mix combines both approaches based on your keywords. For most campaigns, we recommend Mix structure."
    },
    {
        question: "How does the AI keyword generation work?",
        answer: "We use Google's Gemini AI to expand your seed keywords into 100-300 relevant variations. Enter 3-5 core keywords, and the AI generates related terms, questions, locations, and modifiers. If AI is unavailable, we use a local fallback algorithm so you're never blocked."
    },
    {
        question: "Can I generate negative keywords automatically?",
        answer: "Yes! In the Keyword Planner, click the 'Generate 500-1000' button next to the Negative Keywords field. This generates a comprehensive list of 500-1000 common negative keywords covering jobs, reviews, informational queries, and more."
    },
    {
        question: "What's the difference between Broad, Phrase, and Exact match?",
        answer: "Broad match (keyword) shows ads for related searches including synonyms. Phrase match (\"keyword\") shows ads for searches containing the keyword phrase. Exact match ([keyword]) shows ads only for that specific keyword or close variants. Use all three with negative keywords for best results."
    },
    {
        question: "How do I select keywords for my campaign?",
        answer: "After generating keywords in Step 2, click on individual keywords to select them, or use 'Select All' to choose all generated keywords. Selected keywords are highlighted in indigo. You must select at least one keyword to proceed to the next step."
    },
    {
        question: "What are Responsive Search Ads (RSA)?",
        answer: "RSAs allow you to provide multiple headlines and descriptions. Google automatically tests different combinations to find the best performing ads. You can create up to 15 headlines and 4 descriptions, and Google will show the most effective combinations to each user."
    },
    {
        question: "How does Dynamic Keyword Insertion (DKI) work?",
        answer: "DKI inserts the user's search query into your ad using the format {Keyword:Default Text}. For example, if your ad says 'Buy {Keyword:Shoes} Online' and someone searches 'running sneakers', the ad shows 'Buy Running Sneakers Online'. Always provide default text in case the query doesn't fit."
    },
    {
        question: "When should I use Call-Only ads?",
        answer: "Use Call-Only ads for mobile-only campaigns where phone calls are your primary goal. They're ideal for emergency services, local businesses, appointment-based services, and high-value consultations. The ad only shows a phone number and prompts users to call directly."
    },
    {
        question: "How do I export my campaign to Google Ads?",
        answer: "Complete all 5 steps in the Campaign Builder, then click 'Export CSV' in Step 5 (Review). The campaign downloads as a CSV file. In Google Ads, go to Tools & Settings → Bulk Actions → Uploads, select your CSV file, review the preview, and click Apply."
    },
    {
        question: "Can I save my campaign and continue later?",
        answer: "Yes! Click 'Save Draft' in Step 5 to save your campaign to history. Access it anytime from the History menu to continue editing or export again."
    },
    {
        question: "What do I do if I see 'Backend unavailable' messages?",
        answer: "This is normal! It means the AI service is temporarily unavailable, and the system is using local fallback generation. Your workflow continues uninterrupted with slightly different keyword suggestions. The quality is still excellent for most use cases."
    },
    {
        question: "How many keywords should I generate?",
        answer: "Start with 100-300 keywords for most campaigns. You can click 'Append More Keywords' to generate additional keywords if needed. Too many keywords can make campaign management difficult, so focus on quality over quantity."
    },
    {
        question: "Can I edit keywords after generation?",
        answer: "Generated keywords cannot be edited individually in the tool. Instead, export your campaign CSV and edit keywords in Excel/Google Sheets before importing to Google Ads. Alternatively, regenerate keywords with different seeds and negative keywords."
    },
    {
        question: "What character limits apply to ads?",
        answer: "RSA Headlines: 30 characters each (up to 15). RSA Descriptions: 90 characters each (up to 4). Display URL paths: 15 characters each. Call-Only ads have the same limits. The platform automatically validates these limits."
    },
    {
        question: "How do I validate my CSV before importing?",
        answer: "Use the CSV Validator tool from the main menu. Upload your CSV file, and it will check for errors like missing required fields, character limit violations, invalid URLs, and formatting issues. Fix any errors shown in red before importing to Google Ads."
    },
    {
        question: "Can I target specific locations?",
        answer: "Yes! In Step 4 (Geo Targeting), select your target country and choose targeting by states, cities, or ZIP codes. You can enter specific locations manually or use preset ZIP code lists for major metros."
    },
    {
        question: "What file formats are supported for export?",
        answer: "We export in CSV (Comma-Separated Values) format, which is the standard format for Google Ads bulk uploads. The CSV is UTF-8 encoded and follows Google Ads' import specifications."
    },
    {
        question: "Is my campaign data secure?",
        answer: "Yes! All data is encrypted in transit and stored securely in your account only. We never share your campaign data with third parties. You can delete your campaigns from history at any time."
    },
    {
        question: "How does the AI integration work?",
        answer: "The platform handles all AI integrations behind the scenes. All AI-powered features like keyword generation and ad creation work automatically without requiring any API keys from users."
    }
];

export const HelpSupport = () => {
    const [activeTab, setActiveTab] = useState('documentation');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<any>(null);
    const [showArticleDialog, setShowArticleDialog] = useState(false);
    
    // Support Ticket State
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium'
    });

    const handleSearchFilter = (item: any) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.title?.toLowerCase().includes(query) ||
            item.content?.toLowerCase().includes(query) ||
            item.question?.toLowerCase().includes(query) ||
            item.answer?.toLowerCase().includes(query)
        );
    };

    const filteredDocs = documentationSections.map(section => ({
        ...section,
        articles: section.articles.filter(handleSearchFilter)
    })).filter(section => section.articles.length > 0);

    const filteredFAQs = faqItems.filter(handleSearchFilter);

    const handleSubmitTicket = () => {
        const newTicket: SupportTicket = {
            id: `TICKET-${Date.now()}`,
            subject: ticketForm.subject,
            description: ticketForm.description,
            category: ticketForm.category,
            priority: ticketForm.priority,
            status: 'open',
            createdAt: new Date().toISOString()
        };
        
        setTickets([newTicket, ...tickets]);
        setTicketForm({ subject: '', description: '', category: 'general', priority: 'medium' });
        setShowTicketForm(false);
        alert('Support ticket submitted successfully! Our team will respond within 24 hours.');
    };

    const getStatusBadge = (status: string) => {
        const variants: any = {
            'open': 'default',
            'in-progress': 'secondary',
            'resolved': 'outline',
            'closed': 'outline'
        };
        const colors: any = {
            'open': 'bg-blue-100 text-blue-800',
            'in-progress': 'bg-amber-100 text-amber-800',
            'resolved': 'bg-green-100 text-green-800',
            'closed': 'bg-slate-100 text-slate-600'
        };
        return <Badge className={colors[status]}>{status.replace('-', ' ').toUpperCase()}</Badge>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Help & Support Center
                    </h1>
                    <p className="text-slate-600">
                        Everything you need to master the Google Ads Dashboard
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Search documentation, FAQs, or get help..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 py-6 text-lg bg-white border-slate-300 shadow-lg"
                        />
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full max-w-xl grid-cols-3 h-12">
                        <TabsTrigger value="documentation" className="flex items-center gap-2">
                            <Book className="w-4 h-4" />
                            Documentation
                        </TabsTrigger>
                        <TabsTrigger value="faq" className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            FAQ
                        </TabsTrigger>
                        <TabsTrigger value="support" className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Support Tickets
                        </TabsTrigger>
                    </TabsList>

                    {/* Documentation Tab */}
                    <TabsContent value="documentation" className="space-y-6">
                        {filteredDocs.length === 0 && searchQuery && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                    <p className="text-slate-600">No documentation found for "{searchQuery}"</p>
                                </CardContent>
                            </Card>
                        )}
                        
                        {filteredDocs.map((section) => (
                            <Card key={section.id} className="border-slate-200 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <section.icon className="w-6 h-6 text-indigo-600" />
                                        {section.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4">
                                        {section.articles.map((article, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedArticle({ ...article, sectionTitle: section.title });
                                                    setShowArticleDialog(true);
                                                }}
                                                className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700">
                                                        {article.title}
                                                    </h3>
                                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                    {article.content.substring(0, 150)}...
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* FAQ Tab */}
                    <TabsContent value="faq">
                        <Card className="border-slate-200 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                                <CardDescription>
                                    Quick answers to common questions about the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {filteredFAQs.length === 0 && searchQuery ? (
                                    <div className="py-12 text-center">
                                        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600">No FAQs found for "{searchQuery}"</p>
                                    </div>
                                ) : (
                                    <Accordion type="single" collapsible className="w-full">
                                        {filteredFAQs.map((item, idx) => (
                                            <AccordionItem key={idx} value={`faq-${idx}`}>
                                                <AccordionTrigger className="text-left hover:text-indigo-600">
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-slate-600 whitespace-pre-wrap">
                                                    {item.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Support Tickets Tab */}
                    <TabsContent value="support" className="space-y-6">
                        <Card className="border-slate-200 shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">Support Tickets</CardTitle>
                                        <CardDescription>
                                            Submit a ticket and track your support requests
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => setShowTicketForm(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        New Ticket
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {tickets.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Support Tickets</h3>
                                        <p className="text-slate-600 mb-4">
                                            You haven't submitted any support tickets yet.
                                        </p>
                                        <Button
                                            onClick={() => setShowTicketForm(true)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            Submit Your First Ticket
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {tickets.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800">{ticket.subject}</h3>
                                                        <p className="text-sm text-slate-500">{ticket.id}</p>
                                                    </div>
                                                    {getStatusBadge(ticket.status)}
                                                </div>
                                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                                    {ticket.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Badge variant="outline">{ticket.category}</Badge>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        Priority: <Badge variant="outline">{ticket.priority}</Badge>
                                                    </span>
                                                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Article Dialog */}
                <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center gap-2 text-sm text-indigo-600 mb-2">
                                <Book className="w-4 h-4" />
                                {selectedArticle?.sectionTitle}
                            </div>
                            <DialogTitle className="text-2xl">{selectedArticle?.title}</DialogTitle>
                        </DialogHeader>
                        <div className="prose prose-slate max-w-none">
                            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                {selectedArticle?.content}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* New Ticket Dialog */}
                <Dialog open={showTicketForm} onOpenChange={setShowTicketForm}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Submit Support Ticket</DialogTitle>
                            <DialogDescription>
                                Describe your issue and our team will respond within 24 hours
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Subject
                                </label>
                                <Input
                                    placeholder="Brief description of your issue"
                                    value={ticketForm.subject}
                                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Category
                                    </label>
                                    <Select
                                        value={ticketForm.category}
                                        onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General Question</SelectItem>
                                            <SelectItem value="technical">Technical Issue</SelectItem>
                                            <SelectItem value="bug">Bug Report</SelectItem>
                                            <SelectItem value="feature">Feature Request</SelectItem>
                                            <SelectItem value="account">Account Issue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Priority
                                    </label>
                                    <Select
                                        value={ticketForm.priority}
                                        onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Description
                                </label>
                                <Textarea
                                    placeholder="Please provide detailed information about your issue..."
                                    value={ticketForm.description}
                                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                    className="min-h-[150px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowTicketForm(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitTicket}
                                disabled={!ticketForm.subject || !ticketForm.description}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Submit Ticket
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
