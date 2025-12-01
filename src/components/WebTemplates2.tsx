import React, { useState, useEffect } from 'react';
import { 
  Layout, Eye, Edit, Download, Globe, 
  Loader2, Search, Filter, Star, Code, Smartphone, Monitor
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { notifications } from '../utils/notifications';

// Top 25 templates from the GitHub repo (using templates that actually exist)
const TOP_TEMPLATES = [
  { id: '3-col-portfolio', name: '3 Column Portfolio', category: 'Portfolio', description: 'Clean three-column portfolio layout' },
  { id: 'above-educational-bootstrap-responsive-template', name: 'Above Educational', category: 'Education', description: 'Bootstrap responsive educational template' },
  { id: 'ace-responsive-coming-soon-template', name: 'Ace Coming Soon', category: 'Coming Soon', description: 'Responsive coming soon page template' },
  { id: 'add-life-health-fitness-free-bootstrap-html5-template', name: 'Add Life Health', category: 'Health & Fitness', description: 'Health and fitness bootstrap template' },
  { id: 'aerosky-real-estate-html-responsive-website-template', name: 'Aerosky Real Estate', category: 'Real Estate', description: 'Real estate responsive website template' },
  { id: 'agile-agency-free-bootstrap-web-template', name: 'Agile Agency', category: 'Agency', description: 'Free bootstrap agency web template' },
  { id: 'alive-responsive-coming-soon-template', name: 'Alive Coming Soon', category: 'Coming Soon', description: 'Responsive coming soon template' },
  { id: 'amaze-photography-bootstrap-html5-template', name: 'Amaze Photography', category: 'Photography', description: 'Photography bootstrap HTML5 template' },
  { id: 'aroma-beauty-and-spa-responsive-bootstrap-template', name: 'Aroma Beauty & Spa', category: 'Beauty', description: 'Beauty and spa responsive template' },
  { id: 'atlanta-free-business-bootstrap-template', name: 'Atlanta Business', category: 'Business', description: 'Free business bootstrap template' },
  { id: 'avenger-multi-purpose-responsive-html5-bootstrap-template', name: 'Avenger Multi-Purpose', category: 'Multi-Purpose', description: 'Multi-purpose responsive HTML5 bootstrap template' },
  { id: 'b-school-free-education-html5-website-template', name: 'B School Education', category: 'Education', description: 'Free education HTML5 website template' },
  { id: 'basic-free-html5-template-for-multi-purpose', name: 'Basic Multi-Purpose', category: 'Multi-Purpose', description: 'Basic free HTML5 template for multi-purpose' },
  { id: 'beauty-salon-bootstrap-html5-template', name: 'Beauty Salon', category: 'Beauty', description: 'Beauty salon bootstrap HTML5 template' },
  { id: 'bestro-restaurant-bootstrap-html5-template', name: 'Bestro Restaurant', category: 'Restaurant', description: 'Restaurant bootstrap HTML5 template' },
  { id: 'blazer-responsive-html5-coming-soon-template', name: 'Blazer Coming Soon', category: 'Coming Soon', description: 'Responsive HTML5 coming soon template' },
  { id: 'brand-html5-app-landing-page-responsive-web-template', name: 'Brand App Landing', category: 'App Landing', description: 'HTML5 app landing page responsive template' },
  { id: 'businessline-corporate-portfolio-bootstrap-responsive-web-template', name: 'Businessline Corporate', category: 'Corporate', description: 'Corporate portfolio bootstrap responsive template' },
  { id: 'businessr-corporate-bootstrap-responsive-web-template', name: 'Businessr Corporate', category: 'Corporate', description: 'Corporate bootstrap responsive template' },
  { id: 'car-care-auto-mobile-html5-bootstrap-web-template', name: 'Car Care Auto', category: 'Automotive', description: 'Car care auto mobile HTML5 bootstrap template' },
  { id: 'car-repair-html5-bootstrap-template', name: 'Car Repair', category: 'Automotive', description: 'Car repair HTML5 bootstrap template' },
  { id: 'car-zone-automobile-bootstrap-responsive-web-template', name: 'Car Zone', category: 'Automotive', description: 'Automobile bootstrap responsive template' },
  { id: 'city-square-bootstrap-responsive-web-template', name: 'City Square', category: 'Business', description: 'City square bootstrap responsive template' },
  { id: 'cloud-hosting-free-bootstrap-responsive-website-template', name: 'Cloud Hosting', category: 'Hosting', description: 'Cloud hosting free bootstrap responsive template' },
  { id: 'clouds-html5-multipurpose-landing-page-template', name: 'Clouds Multipurpose', category: 'Landing Page', description: 'HTML5 multipurpose landing page template' },
];

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const WebTemplates2: React.FC = () => {
  const [templates] = useState<Template[]>(TOP_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [templateCode, setTemplateCode] = useState<string>('');
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Fetch template HTML from local server first, then fallback to GitHub
  const fetchTemplateHtml = async (template: Template): Promise<string> => {
    // Try local server first
    const localUrl = `/web-templates-2/${template.id}/index.html`;
    
    try {
      const localResponse = await fetch(localUrl, {
        cache: 'no-cache'
      });
      
      if (localResponse.ok) {
        let html = await localResponse.text();
        
        // Fix paths to be relative to local server
        const localBase = `/web-templates-2/${template.id}/`;
        
        // Replace CSS links
        html = html.replace(/href=["']([^"']+\.css[^"']*)["']/gi, (match, path) => {
            if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:') || path.startsWith('/web-templates-2')) return match;
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            return `href="${localBase}${cleanPath}"`;
        });
        
        // Replace JS, images, fonts
        html = html.replace(/src=["']([^"']+\.(js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)[^"']*)["']/gi, (match, path) => {
            if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:') || path.startsWith('/web-templates-2')) return match;
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            return `src="${localBase}${cleanPath}"`;
        });
        
        // Fix background images
        html = html.replace(/background-image:\s*url\(["']?([^"')]+)["']?\)/gi, (match, path) => {
            if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:') || path.startsWith('/web-templates-2')) return match;
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            return `background-image: url("${localBase}${cleanPath}")`;
        });
        
        // Fix link tags
        html = html.replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi, (match, path) => {
            if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:') || path.startsWith('/web-templates-2')) return match;
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            return match.replace(`href="${path}"`, `href="${localBase}${cleanPath}"`);
        });
        
        // Remove external links
        html = html.replace(/<a([^>]*)\s+href=["']https?:\/\/[^"']+["']([^>]*)>/gi, (match, before, after) => {
            return `<a${before} href="#" onclick="return false;"${after}>`;
        });
        
        // Add base tag
        if (!html.includes('<base')) {
            html = html.replace(/<head[^>]*>/i, `$&<base href="${localBase}">`);
        }
        
        return html;
      }
    } catch (error) {
      console.log('Local template not found, trying GitHub...');
    }
    
    // Fallback to GitHub
    const baseUrl = `https://raw.githubusercontent.com/samayhuf-star/website-templates/master/${template.id}/`;
    const possiblePaths = [
      `${baseUrl}index.html`,
      `https://raw.githubusercontent.com/samayhuf-star/website-templates/master/${template.id}.html`,
      `https://raw.githubusercontent.com/samayhuf-star/website-templates/main/${template.id}/index.html`,
    ];
    
    let html = '';
    let lastError: Error | null = null;
    
    for (const url of possiblePaths) {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          html = await response.text();
          break;
        }
      } catch (error: any) {
        lastError = error;
        continue;
      }
    }
    
    if (!html || html.trim().length === 0) {
      throw lastError || new Error(`Template "${template.name}" not found. The template may not be available in the repository.`);
    }
    
    // Fix paths for GitHub content
    html = html.replace(/href=["']([^"']+\.css[^"']*)["']/gi, (match, path) => {
        if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) return match;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `href="${baseUrl}${cleanPath}"`;
    });
    
    html = html.replace(/src=["']([^"']+\.(js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)[^"']*)["']/gi, (match, path) => {
        if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) return match;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `src="${baseUrl}${cleanPath}"`;
    });
    
    html = html.replace(/background-image:\s*url\(["']?([^"')]+)["']?\)/gi, (match, path) => {
        if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) return match;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `background-image: url("${baseUrl}${cleanPath}")`;
    });
    
    html = html.replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi, (match, path) => {
        if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) return match;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return match.replace(`href="${path}"`, `href="${baseUrl}${cleanPath}"`);
    });
    
    html = html.replace(/<a([^>]*)\s+href=["']https?:\/\/[^"']+["']([^>]*)>/gi, (match, before, after) => {
        return `<a${before} href="#" onclick="return false;"${after}>`;
    });
    
    if (!html.includes('<base')) {
        html = html.replace(/<head[^>]*>/i, `$&<base href="${baseUrl}">`);
    }
    
    return html;
  };

  const handlePreview = async (template: Template) => {
    setSelectedTemplate(template);
    setLoadingTemplate(true);
    setShowPreview(true);
    
    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    
    try {
      const html = await fetchTemplateHtml(template);
      if (!html || html.trim().length === 0) {
        throw new Error('Template content is empty');
      }
      
      setTemplateHtml(html);
      
      // Create blob URL for iframe
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error: any) {
      console.error('Preview error:', error);
      setShowPreview(false);
      notifications.error(error.message || 'Failed to load template preview', {
        title: 'Preview Error',
        description: 'The template may not be available. Please try a different template or check your internet connection.'
      });
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleEdit = async (template: Template) => {
    setSelectedTemplate(template);
    setLoadingTemplate(true);
    setShowEditor(true);
    
    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    
    try {
      const html = await fetchTemplateHtml(template);
      if (!html || html.trim().length === 0) {
        throw new Error('Template content is empty');
      }
      
      setTemplateHtml(html);
      setTemplateCode(html);
      
      // Create blob URL for iframe
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error: any) {
      console.error('Edit error:', error);
      setShowEditor(false);
      notifications.error(error.message || 'Failed to load template for editing', {
        title: 'Edit Error',
        description: 'The template may not be available. Please try a different template or check your internet connection.'
      });
    } finally {
      setLoadingTemplate(false);
    }
  };
  
  // Cleanup blob URLs on unmount and when dialogs close
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Cleanup when dialogs close
  useEffect(() => {
    if (!showPreview && !showEditor && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  }, [showPreview, showEditor, previewUrl]);

  const handleDownload = async (template: Template) => {
    try {
      setLoading(true);
      
      // Try to fetch template HTML
      let html = '';
      try {
        html = await fetchTemplateHtml(template);
      } catch (fetchError) {
        // If fetch fails, try direct GitHub URL
        const repoUrl = `https://raw.githubusercontent.com/samayhuf-star/website-templates/master/${template.id}/index.html`;
        const response = await fetch(repoUrl);
        if (response.ok) {
          html = await response.text();
        } else {
          throw new Error('Template not found. Please try previewing it first.');
        }
      }
      
      if (!html) {
        throw new Error('Template content is empty');
      }
      
      // Create blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      notifications.success('Template downloaded successfully', {
        title: 'Download Complete',
        description: `Downloaded ${template.name} as ${template.id}.html`
      });
    } catch (error: any) {
      console.error('Download error:', error);
      notifications.error(error.message || 'Failed to download template. Please try previewing it first.', {
        title: 'Download Failed',
        description: 'The template may not be available. Try using the Preview button first.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Web Templates 2.0
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Top 25 open-source HTML5 templates from GitHub
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {template.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {template.category}
                  </Badge>
                </div>
                <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-4 line-clamp-2">
                {template.description}
              </CardDescription>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 min-w-[100px] text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(template);
                  }}
                  disabled={loadingTemplate}
                >
                  {loadingTemplate && selectedTemplate?.id === template.id ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Eye className="w-3 h-3 mr-1" />
                  )}
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1 min-w-[100px] text-xs theme-button-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(template);
                  }}
                  disabled={loadingTemplate}
                >
                  {loadingTemplate && selectedTemplate?.id === template.id ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Edit className="w-3 h-3 mr-1" />
                  )}
                  Edit
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="w-full mt-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(template);
                }}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 mr-1" />
                )}
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No templates found matching your search.</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                <p className="text-sm text-slate-500 mt-1">{selectedTemplate?.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden relative">
            {loadingTemplate ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                  <p className="text-slate-600">Loading template...</p>
                </div>
              </div>
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                className={`w-full h-full border-0 ${
                  previewMode === 'mobile' ? 'max-w-[375px] mx-auto block' : ''
                }`}
                title={selectedTemplate?.name}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-slate-500">
                  <p>Template preview unavailable</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Edit: {selectedTemplate?.name}</DialogTitle>
                <p className="text-sm text-slate-500 mt-1">Visual editor for {selectedTemplate?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
          <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
              <div className="h-full overflow-auto px-6 pb-6">
                {loadingTemplate ? (
                  <div className="flex items-center justify-center h-full min-h-[600px]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                      <p className="text-slate-600">Loading template...</p>
                    </div>
                  </div>
                ) : previewUrl ? (
                  <div className={`bg-white shadow-xl rounded-lg overflow-hidden mx-auto ${
                    previewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'
                  }`}>
                    <iframe
                      src={previewUrl}
                      className="w-full border-0"
                      style={{ minHeight: '600px' }}
                      title={`Edit ${selectedTemplate?.name}`}
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[600px]">
                    <div className="text-center text-slate-500">
                      <p>Template preview unavailable</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="code" className="flex-1 overflow-hidden mt-4">
              <ScrollArea className="h-full px-6 pb-6">
                {loadingTemplate ? (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                      <p className="text-slate-600">Loading source code...</p>
                    </div>
                  </div>
                ) : templateCode ? (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-words text-xs">
                      {templateCode}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                    <div className="text-slate-400 text-xs">
                      Source code not available
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <DialogFooter className="px-6 pb-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedTemplate) {
                  handleDownload(selectedTemplate);
                }
              }}
              className="theme-button-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

