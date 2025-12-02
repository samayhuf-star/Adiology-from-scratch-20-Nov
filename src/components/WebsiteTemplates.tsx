import React, { useState, useEffect } from 'react';
import { 
  Layout, Eye, Edit, Copy, Save, Download, Globe, 
  CheckCircle, AlertCircle, Palette, Type, Image as ImageIcon,
  Settings, Code, Smartphone, Monitor, X, Plus, Trash2, Search, Filter, Rocket, ExternalLink, Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { notifications } from '../utils/notifications';
import { historyService } from '../utils/historyService';
import { allTemplates as importedTemplates, serviceCategories } from '../data/websiteTemplateLibrary';
// Removed publish-related imports

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  color?: string;
  sections: TemplateSection[];
}

interface TemplateSection {
  id: string;
  type: 'hero' | 'features' | 'services' | 'testimonials' | 'cta' | 'footer' | 'privacy' | 'terms' | 'about';
  title: string;
  content: any;
  styles?: any;
}

interface SavedTemplate {
  id: string;
  name: string;
  originalTemplateId: string;
  customizedSections: TemplateSection[];
  createdAt: string;
  updatedAt: string;
}

// Template image mapping - ensures all templates have relevant, unique images
// Maps template IDs and category names to specific, relevant images
const templateImageMap: Record<string, string> = {
  // Base templates
  'plumbing-1': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop',
  'hvac-1': 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&h=600&fit=crop',
  'electrical-1': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
  'roofing-1': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&h=600&fit=crop',
  'landscaping-1': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600&fit=crop',
  
  // Generated templates - using category-based matching
  'cleaning-6': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  'pest-control-6': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
  'locksmith-6': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&h=600&fit=crop',
  'garage-door-6': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'painting-6': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop',
  'carpet-cleaning-6': 'https://images.unsplash.com/photo-1600428964546-988ac40e86f1?w=800&h=600&fit=crop',
  'window-cleaning-6': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&h=600&fit=crop',
  'handyman-6': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
  'moving-6': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&h=600&fit=crop',
  'pool-service-6': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop',
  'tree-service-6': 'https://images.unsplash.com/photo-1616680214084-22670de1bc82?w=800&h=600&fit=crop',
  'appliance-repair-6': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop',
  'flooring-6': 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&h=600&fit=crop',
  'home-security-6': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=600&fit=crop',
  'solar-6': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
  'gutter-cleaning-6': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
  'concrete-6': 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop',
  'fencing-6': 'https://images.unsplash.com/photo-1587502537815-0c8b5c9ba39a?w=800&h=600&fit=crop',
  'siding-6': 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&h=600&fit=crop',
  'pressure-washing-6': 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=600&fit=crop',
  'junk-removal-6': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop',
  'septic-service-6': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  'insulation-6': 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&h=600&fit=crop',
  'chimney-service-6': 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop',
  'waterproofing-6': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
};

// Category-based image mapping for templates that don't have specific IDs
const categoryImageMap: Record<string, string> = {
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  'Pest Control': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
  'Locksmith': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&h=600&fit=crop',
  'Garage Door': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'Painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop',
  'Carpet Cleaning': 'https://images.unsplash.com/photo-1600428964546-988ac40e86f1?w=800&h=600&fit=crop',
  'Window Cleaning': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&h=600&fit=crop',
  'Handyman': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
  'Moving': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&h=600&fit=crop',
  'Pool Service': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop',
  'Tree Service': 'https://images.unsplash.com/photo-1616680214084-22670de1bc82?w=800&h=600&fit=crop',
  'Appliance Repair': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop',
  'Flooring': 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&h=600&fit=crop',
  'Home Security': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=600&fit=crop',
  'Solar': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
  'Gutter Cleaning': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
  'Concrete': 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop',
  'Fencing': 'https://images.unsplash.com/photo-1587502537815-0c8b5c9ba39a?w=800&h=600&fit=crop',
  'Siding': 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&h=600&fit=crop',
  'Pressure Washing': 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=600&fit=crop',
  'Junk Removal': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop',
  'Septic Service': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  'Insulation': 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&h=600&fit=crop',
  'Chimney Service': 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop',
  'Waterproofing': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
};

// Helper function to get template image with fallbacks
const getTemplateImage = (template: Template): string | null => {
  // 1. Try template-specific image map (by ID)
  if (templateImageMap[template.id]) {
    return templateImageMap[template.id];
  }
  
  // 2. Try category-based image map
  if (categoryImageMap[template.category]) {
    return categoryImageMap[template.category];
  }
  
  // 3. Try hero background image (most reliable source)
  const heroSection = template.sections.find(s => s.type === 'hero');
  if (heroSection?.content?.backgroundImage) {
    return heroSection.content.backgroundImage;
  }
  
  // 4. Try first service image
  const serviceSection = template.sections.find(s => s.type === 'services');
  if (serviceSection?.content?.services?.[0]?.image) {
    return serviceSection.content.services[0].image;
  }
  
  // 5. Try any service image
  if (serviceSection?.content?.services) {
    for (const service of serviceSection.content.services) {
      if (service.image) {
        return service.image;
      }
    }
  }
  
  // 6. Try about section image
  const aboutSection = template.sections.find(s => s.type === 'about');
  if (aboutSection?.content?.image) {
    return aboutSection.content.image;
  }
  
  // 7. Return null to show thumbnail emoji
  return null;
};

// Template Card Component with Image Error Handling
const TemplateCard: React.FC<{ 
  template: Template; 
  templateImage: string | null;
  onUseTemplate: (template: Template) => Promise<void>;
  onExportTemplate: (template: Template) => void;
}> = ({ template, templateImage, onUseTemplate, onExportTemplate }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-2 hover:border-indigo-300 flex flex-col">
      {/* Template Preview/Thumbnail with Vertical Image */}
      <div className="relative h-64 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
        {templateImage && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}
            <img 
              src={templateImage} 
              alt={template.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              onLoad={() => setImageLoading(false)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="text-7xl opacity-80 group-hover:scale-110 transition-transform duration-300">
            {template.thumbnail}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 backdrop-blur-sm text-slate-700 border-0 shadow-lg font-semibold">
            {template.category}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-white/90 backdrop-blur-sm border-white/50 text-slate-700 font-medium">
              {template.sections.length} sections
            </Badge>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-white/90 backdrop-blur-sm border-white/50 text-slate-700 font-medium">
              <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
              Google Ads
            </Badge>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-white/90 backdrop-blur-sm border-white/50 text-slate-700 font-medium">
              <Smartphone className="w-2.5 h-2.5 mr-0.5" />
              Responsive
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Template Info */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {template.name}
        </h3>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[2.5rem] flex-1">
          {template.description}
        </p>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button 
            onClick={() => onUseTemplate(template)}
            variant="default"
            size="sm"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl"
          >
            <Edit className="w-4 h-4 mr-1" />
            Use / Edit
          </Button>
          <Button 
            onClick={() => onExportTemplate(template)}
            variant="outline"
            size="sm"
            className="flex-shrink-0 px-3"
            title="Download HTML"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Function to reorder sections so "about" comes right after "hero"
const reorderSections = (sections: TemplateSection[]): TemplateSection[] => {
  if (!sections || sections.length === 0) return sections;
  
  const heroIndex = sections.findIndex(s => s.type === 'hero');
  const aboutIndex = sections.findIndex(s => s.type === 'about');
  
  // If both hero and about exist, reorder them
  if (heroIndex !== -1 && aboutIndex !== -1 && aboutIndex !== heroIndex + 1) {
    const newSections = [...sections];
    const aboutSection = newSections.splice(aboutIndex, 1)[0];
    // Insert about section right after hero
    newSections.splice(heroIndex + 1, 0, aboutSection);
    return newSections;
  }
  
  return sections;
};

export const WebsiteTemplates: React.FC = () => {
  // Reorder sections in all imported templates so "about" comes after "hero"
  const reorderedTemplates = (importedTemplates as Template[]).map(template => ({
    ...template,
    sections: reorderSections(template.sections)
  }));
  
  const [baseTemplates] = useState<Template[]>(reorderedTemplates);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSection, setActiveSection] = useState<string>('hero-1');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showPreviewDialog, setShowPreviewDialog] = useState<Template | SavedTemplate | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState<{ type: 'privacy' | 'terms'; section: TemplateSection | null } | null>(null);

  useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = async () => {
    try {
      const saved = await historyService.getByType('website-template');
      const converted = saved.map((item: any) => {
        // Handle different data structures
        let sections: TemplateSection[] = [];
        let originalTemplateId = 'unknown';
        
        if (item.data) {
          // Check for nested template structure
          if (item.data.template && item.data.template.customizedSections) {
            sections = item.data.template.customizedSections;
            originalTemplateId = item.data.template.originalTemplateId || 'unknown';
          } 
          // Check for direct sections structure
          else if (item.data.sections) {
            sections = item.data.sections;
            originalTemplateId = item.data.originalTemplateId || 'unknown';
          }
          // Fallback to originalTemplateId if available
          else if (item.data.originalTemplateId) {
            originalTemplateId = item.data.originalTemplateId;
          }
        }
        
        return {
          id: item.id,
          name: item.name,
          originalTemplateId: originalTemplateId,
          customizedSections: Array.isArray(sections) ? sections : [],
          createdAt: item.timestamp || new Date().toISOString(),
          updatedAt: item.timestamp || new Date().toISOString()
        };
      });
      setSavedTemplates(converted);
    } catch (error) {
      console.error('Failed to load saved templates', error);
      notifications.error('Failed to load saved templates', { title: 'Load Error' });
    }
  };

  // Filter templates based on category and search
  const filteredTemplates = baseTemplates.filter((template) => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Function to ensure template has all required sections
  const completeTemplateSections = (sections: TemplateSection[]): TemplateSection[] => {
    // Handle edge cases
    if (!sections || !Array.isArray(sections)) {
      sections = [];
    }
    
    const requiredSections: { [key: string]: TemplateSection } = {};
    const allSections: TemplateSection[] = [];
    
    // First, preserve ALL existing sections (including any custom/additional sections)
    sections.forEach(section => {
      if (section && section.type) {
        // If services section exists, ensure all services have images
        if (section.type === 'services' && section.content?.services) {
          section.content.services = section.content.services.map((service: any, idx: number) => {
            if (!service.image && idx < 3) {
              // Add default images if missing
              const defaultImages = [
                'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
              ];
              return { ...service, image: defaultImages[idx] || defaultImages[0] };
            }
            return service;
          });
          // Ensure we have at least 3 services
          while (section.content.services.length < 3) {
            const defaultImages = [
              'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
            ];
            const idx = section.content.services.length;
            section.content.services.push({
              image: defaultImages[idx] || defaultImages[0],
              title: `Service ${idx + 1}`,
              description: 'Professional service description',
              price: 'Starting at $99'
            });
          }
        }
        requiredSections[section.type] = section;
      }
    });
    
    // Add missing sections with default content (privacy and terms are now only in footer as links)
    // Order: hero, about, features, services, testimonials, cta, footer
    const sectionTypes: Array<'hero' | 'features' | 'services' | 'testimonials' | 'cta' | 'footer' | 'about'> = 
      ['hero', 'about', 'features', 'services', 'testimonials', 'cta', 'footer'];
    
    sectionTypes.forEach(type => {
      if (!requiredSections[type]) {
        // Create default section based on type
        switch (type) {
          case 'hero':
            requiredSections[type] = {
              id: 'hero-1',
              type: 'hero',
              title: 'Hero Section',
              content: {
                heading: 'Professional Services You Can Trust',
                subheading: 'Expert solutions for your business needs with 24/7 support',
                ctaText: 'Get Started Today',
                ctaPhone: '1-800-123-4567',
                backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
              }
            };
            break;
          case 'features':
            requiredSections[type] = {
              id: 'features-1',
              type: 'features',
              title: 'Features Section',
              content: {
                heading: 'Why Choose Us',
                features: [
                  { icon: '⚡', title: 'Fast Response', description: 'Quick turnaround time for all service requests' },
                  { icon: '🎯', title: 'Expert Team', description: 'Certified professionals with years of experience' },
                  { icon: '💯', title: 'Quality Guaranteed', description: '100% satisfaction guarantee on all services' },
                  { icon: '🔒', title: 'Secure & Safe', description: 'Licensed, bonded, and fully insured' }
                ]
              }
            };
            break;
          case 'services':
            requiredSections[type] = {
              id: 'services-1',
              type: 'services',
              title: 'Services Section',
              content: {
                heading: 'Our Services',
                subheading: 'Comprehensive solutions tailored to your needs',
                services: [
                  {
                    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
                    title: 'Consultation',
                    description: 'Expert consultation to assess your needs and provide tailored solutions',
                    price: 'Starting at $99'
                  },
                  {
                    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
                    title: 'Implementation',
                    description: 'Professional implementation of solutions with minimal disruption',
                    price: 'Custom Pricing'
                  },
                  {
                    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
                    title: 'Support & Maintenance',
                    description: 'Ongoing support and maintenance to ensure optimal performance',
                    price: 'From $199/month'
                  }
                ]
              }
            };
            break;
          case 'testimonials':
            requiredSections[type] = {
              id: 'testimonials-1',
              type: 'testimonials',
              title: 'Testimonials Section',
              content: {
                heading: 'What Our Clients Say',
                testimonials: [
                  {
                    name: 'John Smith',
                    company: 'ABC Corporation',
                    rating: 5,
                    text: 'Outstanding service! They exceeded our expectations and delivered results quickly.',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
                  },
                  {
                    name: 'Sarah Johnson',
                    company: 'XYZ Industries',
                    rating: 5,
                    text: 'Professional, reliable, and efficient. Highly recommend their services!',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
                  },
                  {
                    name: 'Michael Brown',
                    company: 'Tech Solutions Inc',
                    rating: 5,
                    text: 'Best decision we made for our business. Great team and excellent results.',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
                  }
                ]
              }
            };
            break;
          case 'cta':
            requiredSections[type] = {
              id: 'cta-1',
              type: 'cta',
              title: 'Call to Action',
              content: {
                heading: 'Ready to Get Started?',
                subheading: 'Contact us today for a free consultation',
                ctaText: 'Call Now',
                phone: '1-800-123-4567',
                email: 'info@yourcompany.com',
                hours: 'Available 24/7'
              }
            };
            break;
          case 'about':
            requiredSections[type] = {
              id: 'about-1',
              type: 'about',
              title: 'About Us',
              content: {
                heading: 'About Our Company',
                subheading: 'Your Trusted Service Provider',
                description: 'With years of experience, we are your trusted professionals. We provide comprehensive services for residential and commercial properties, delivering quality workmanship and exceptional customer service on every project.',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
                stats: [
                  { number: '15+', label: 'Years Experience' },
                  { number: '5,000+', label: 'Happy Customers' },
                  { number: '100%', label: 'Satisfaction Rate' },
                  { number: '24/7', label: 'Available Service' }
                ],
                values: [
                  { icon: '⚡', title: 'Fast Service', description: 'Quick response and completion times' },
                  { icon: '💰', title: 'Fair Pricing', description: 'Competitive rates with no hidden fees' },
                  { icon: '🎓', title: 'Expert Team', description: 'Trained and certified professionals' },
                  { icon: '✅', title: 'Guaranteed Work', description: 'Satisfaction guaranteed on all services' }
                ]
              }
            };
            break;
          case 'how-it-works':
            requiredSections[type] = {
              id: 'how-it-works-1',
              type: 'how-it-works',
              title: 'How It Works',
              content: {
                heading: 'Simple Process, Professional Results',
                subheading: 'Getting your service is easy with our streamlined process',
                steps: [
                  {
                    number: '1',
                    title: 'Contact Us',
                    description: 'Call us or request service online. We\'ll respond quickly to your inquiry.',
                    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
                    icon: '📞'
                  },
                  {
                    number: '2',
                    title: 'Free Estimate',
                    description: 'Our expert will assess your needs and provide upfront pricing.',
                    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
                    icon: '💰'
                  },
                  {
                    number: '3',
                    title: 'Schedule Service',
                    description: 'We\'ll schedule a convenient time that works for you.',
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                    icon: '📅'
                  },
                  {
                    number: '4',
                    title: 'Professional Service',
                    description: 'We complete the work efficiently, test everything, and clean up thoroughly.',
                    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
                    icon: '✅'
                  }
                ]
              }
            };
            break;
          case 'contact':
            requiredSections[type] = {
              id: 'contact-1',
              type: 'contact',
              title: 'Contact Us',
              content: {
                heading: 'Get In Touch',
                subheading: 'We\'re here to help with all your needs',
                description: 'Have a question or need immediate service? Contact us today and our team will be happy to assist you.',
                formFields: [
                  { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
                  { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
                  { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '(555) 123-4567' },
                  { name: 'service', label: 'Service Needed', type: 'select', required: true, options: ['Service Request', 'Estimate', 'Emergency Service', 'Maintenance', 'Other'] },
                  { name: 'message', label: 'Message', type: 'textarea', required: false, placeholder: 'Tell us about your needs...' }
                ],
                contactInfo: {
                  phone: '1-800-123-4567',
                  email: 'info@yourcompany.com',
                  address: '123 Service Street, Your City, ST 12345',
                  hours: 'Mon-Sat: 7AM-7PM'
                },
                mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184132576684!2d-73.98811768459398!3d40.75889597932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus'
              }
            };
            break;
          case 'footer':
            requiredSections[type] = {
              id: 'footer-1',
              type: 'footer',
              title: 'Footer',
              content: {
                contactTitle: 'Contact us',
                address: '1th Avenue, New York - United States',
                phone: '+22 342 2345 345 | Fax: +22 724 2342 343',
                email: 'info@example.com',
                skype: 'my-company',
                mailingListTitle: 'Mailing list',
                mailingListDescription: 'Lorem ipsum dolor sit amet, ea eum labitur scsstie percipitoleat.',
                followUsTitle: 'Follow us',
                socialIcons: [
                  { name: 'Facebook', icon: 'f', href: '#' },
                  { name: 'Google+', icon: 'g+', href: '#' },
                  { name: 'YouTube', icon: '▶', href: '#' },
                  { name: 'Dribbble', icon: 'b', href: '#' },
                  { name: 'LinkedIn', icon: 'in', href: '#' },
                  { name: 'Twitter', icon: '🐦', href: '#' },
                  { name: 'RSS', icon: 'S', href: '#' },
                  { name: 'Pinterest', icon: 'P', href: '#' }
                ],
                latestNewsTitle: 'Latest News',
                latestNewsDescription: 'Lorem ipsum dolor labitur scsstie per sit amet, ea eum labitur scsstie percipitoleat.',
                latestNewsButtonText: 'Get Mores!',
                copyright: `© ${new Date().getFullYear()} All rights reserved.`
              }
            };
            break;
          // Privacy and Terms are now only accessible via footer links (modal/dialog)
          // They are not rendered as full page sections anymore
        }
      }
    });
    
    // Return sections in the correct order, preserving any additional sections
    const orderedSections = sectionTypes.map(type => requiredSections[type]).filter(Boolean);
    
    // Add any additional sections that weren't in the standard list
    sections.forEach(section => {
      if (section && section.type && !sectionTypes.includes(section.type as any)) {
        orderedSections.push(section);
      }
    });
    
    // Reorder to ensure about comes right after hero
    return reorderSections(orderedSections);
  };

  const handleViewTemplate = (template: Template | SavedTemplate) => {
    setShowPreviewDialog(template);
  };

  const handleMakeCopy = async (template: Template | SavedTemplate) => {
    try {
      let sections: TemplateSection[];
      let originalId: string;
      let templateName: string;

      if ('customizedSections' in template) {
        // It's a saved template
        sections = JSON.parse(JSON.stringify(template.customizedSections));
        originalId = template.originalTemplateId;
        templateName = `${template.name} (Copy)`;
      } else {
        // It's a base template
        sections = completeTemplateSections(JSON.parse(JSON.stringify(template.sections)));
        originalId = template.id;
        templateName = `${template.name} (Copy)`;
      }

      const newTemplate: SavedTemplate = {
        id: `template-${Date.now()}`,
        name: templateName,
        originalTemplateId: originalId,
        customizedSections: sections,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save the copy
      await historyService.save(
        'website-template',
        newTemplate.name,
        {
          originalTemplateId: newTemplate.originalTemplateId,
          sections: newTemplate.customizedSections
        },
        'draft'
      );

      await loadSavedTemplates();
      notifications.success('Template copied successfully!', { title: 'Copied' });
    } catch (error) {
      console.error('Failed to copy template:', error);
      notifications.error('Failed to copy template', { title: 'Error' });
    }
  };

  const handleEditTemplate = async (template?: SavedTemplate | Template, isBase: boolean = false) => {
    try {
      if (template && 'customizedSections' in template) {
        // It's a saved template - ensure it has all sections
        const savedTemplate = template as SavedTemplate;
        const sections = savedTemplate.customizedSections || [];
        
        // Validate sections is an array
        if (!Array.isArray(sections)) {
          throw new Error('Invalid template structure: customizedSections must be an array');
        }
        
        const completedTemplate = {
          ...savedTemplate,
          customizedSections: completeTemplateSections(sections)
        };
        setEditingTemplate(completedTemplate);
      } else if (template && isBase) {
        // Create new template from base template
        const baseTemplate = template as Template;
        if (!baseTemplate.sections || !Array.isArray(baseTemplate.sections)) {
          throw new Error('Invalid base template structure: sections must be an array');
        }
        
        const completedSections = completeTemplateSections(JSON.parse(JSON.stringify(baseTemplate.sections)));
        const newTemplate: SavedTemplate = {
          id: `template-${Date.now()}`,
          name: `${baseTemplate.name} (Custom)`,
          originalTemplateId: baseTemplate.id,
          customizedSections: completedSections,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setEditingTemplate(newTemplate);
        setTemplateName(newTemplate.name);
      } else {
        // Create new template from first base template
        if (!baseTemplates || baseTemplates.length === 0) {
          throw new Error('No base templates available');
        }
        
        const firstTemplate = baseTemplates[0];
        if (!firstTemplate.sections || !Array.isArray(firstTemplate.sections)) {
          throw new Error('Invalid base template structure: sections must be an array');
        }
        
        const completedSections = completeTemplateSections(JSON.parse(JSON.stringify(firstTemplate.sections)));
        const newTemplate: SavedTemplate = {
          id: `template-${Date.now()}`,
          name: 'Untitled Template',
          originalTemplateId: firstTemplate.id,
          customizedSections: completedSections,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setEditingTemplate(newTemplate);
      }
      setShowEditor(true);
    } catch (error) {
      console.error('Failed to edit template:', error);
      notifications.error(
        error instanceof Error ? error.message : 'Failed to open template editor. Please try again.',
        { title: 'Edit Error' }
      );
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    if (!templateName.trim()) {
      notifications.error('Please enter a template name', { title: 'Name Required' });
      return;
    }

    try {
      const updatedTemplate = {
        ...editingTemplate,
        name: templateName,
        updatedAt: new Date().toISOString()
      };

      await historyService.save(
        'website-template',
        templateName,
        {
          id: updatedTemplate.id,
          originalTemplateId: updatedTemplate.originalTemplateId,
          sections: updatedTemplate.customizedSections
        },
        'completed'
      );

      await loadSavedTemplates();
      notifications.success('Template saved successfully!', { title: 'Saved' });
      setShowSaveDialog(false);
      setShowEditor(false);
      setTemplateName('');
    } catch (error) {
      console.error('Failed to save template:', error);
      notifications.error('Failed to save template. Please try again.', { title: 'Save Error' });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await historyService.delete(id);
      await loadSavedTemplates();
      notifications.success('Template deleted', { title: 'Deleted' });
    } catch (error) {
      console.error('Failed to delete template:', error);
      notifications.error('Failed to delete template. Please try again.', { title: 'Delete Error' });
    }
  };

  const handleExportHTML = async (template: SavedTemplate) => {
    // Auto-save template to user's saved websites when exported/downloaded
    try {
      await historyService.save(
        'website-template',
        template.name,
        {
          id: template.id,
          originalTemplateId: template.originalTemplateId,
          sections: template.customizedSections,
          exported: true,
          exportedAt: new Date().toISOString()
        },
        'completed'
      );
      // Silent save - don't show notification to avoid interrupting user flow
    } catch (error) {
      console.error('Failed to auto-save exported template:', error);
      // Continue anyway - user can still export
    }

    const html = generateHTMLFromTemplate(template);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    notifications.success('Template exported successfully!', { title: 'Exported' });
  };

  // Removed handlePublishWebsite function

  const generateHTMLFromTemplate = (template: SavedTemplate): string => {
    // Generate complete HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(template.name)}</title>
    <style>
        /* 0) Safe defaults */
        html, body { 
            box-sizing: border-box; 
            -webkit-font-smoothing: antialiased; 
            -moz-osx-font-smoothing: grayscale; 
        }
        *, *::before, *::after { 
            box-sizing: inherit; 
            margin: 0; 
            padding: 0; 
        }
        
        /* 1) Viewport - must be in <head> */
        /* <meta name="viewport" content="width=device-width, initial-scale=1"> */
        
        /* 2) Prevent horizontal scroll while we fix elements */
        html, body { 
            overflow-x: hidden; 
        }
        
        html { 
            -webkit-text-size-adjust: 100%; 
            -ms-text-size-adjust: 100%; 
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            width: 100%;
        }
        
        /* 3) Make images/iframes responsive */
        img, picture, video, iframe, embed, object { 
            max-width: 100%; 
            height: auto; 
            display: block; 
        }
        
        /* 4) Flexible card baseline — use for testimonial/service/feature cards */
        .responsive-card-row {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
            align-items: stretch;
        }
        
        /* Each card becomes flexible and will wrap on small screens */
        .responsive-card-row > .card,
        .responsive-card-row > .testimonial,
        .responsive-card-row > .feature {
            flex: 1 1 220px;
            max-width: 320px;
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 1rem; 
            width: 100%;
        }
        .section { 
            padding: 3rem 1rem; 
            width: 100%;
            overflow-x: hidden;
            box-sizing: border-box;
        }
        a { 
            text-decoration: none; 
            color: inherit; 
            -webkit-tap-highlight-color: rgba(0,0,0,0.1);
        }
        img { 
            max-width: 100%; 
            height: auto; 
            display: block;
        }
        button, a[href^="tel:"], a[href^="mailto:"] {
            min-height: 44px;
            min-width: 44px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(0,0,0,0.1);
        }
        .grid { 
            display: grid; 
            gap: 1.5rem; 
            width: 100%;
        }
        .grid > * {
            min-width: 0; /* Important: allow shrinking inside grid */
        }
        .grid-cols-1 { 
            grid-template-columns: repeat(1, minmax(0, 1fr)); 
        }
        h1, h2, h3, h4, h5, h6 {
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        p, span, div {
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        /* 5) Fix absolute/translated elements on small screens */
        @media (max-width: 640px) {
            /* Remove harmful absolute positioning or transforms on small screens */
            .hero-image, .image-card, .floating-icons, .social-bubbles {
                position: static !important;
                transform: none !important;
                margin: 0 auto;
                width: 100% !important;
                max-width: 420px;
            }
            
            /* Reduce heading sizes */
            h1 { 
                font-size: clamp(1.4rem, 5vw, 2rem) !important; 
                line-height: 1.05; 
                word-wrap: break-word; 
            }
            h2 { 
                font-size: clamp(1.2rem, 4.2vw, 1.6rem) !important; 
                line-height: 1.3; 
                word-wrap: break-word; 
            }
            h3 { 
                font-size: 1.25rem !important; 
                line-height: 1.4; 
                word-wrap: break-word; 
            }
            p { 
                font-size: 0.9375rem; 
                word-wrap: break-word; 
            }
            
            /* Make CTA/buttons full width */
            .cta, .btn-primary, button, a[href^="tel:"], a[href^="mailto:"] {
                width: 100% !important;
                max-width: 420px;
                margin: 0.6rem auto;
                display: block;
                font-size: 1rem;
                padding: 0.875rem 1.25rem;
                box-sizing: border-box;
            }
            
            /* Footer columns stack vertically */
            .footer .col, .footer-content > div {
                width: 100% !important;
                display: block;
                padding: 1rem 0;
            }
            .footer .social-bubbles {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                align-items: center;
            }
            
            .section { 
                padding: 2rem 1rem; 
                width: 100%;
                max-width: 100vw;
                overflow-x: hidden;
                box-sizing: border-box;
            }
            .container {
                padding: 0 1rem;
                width: 100%;
                max-width: 100vw;
                box-sizing: border-box;
            }
            .grid {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
        }
        
        /* 6) If elements still overflow, force break words & clamp widths */
        .card, .testimonial, .feature {
            word-wrap: break-word;
            overflow-wrap: anywhere;
        }
        @media (min-width: 640px) {
            .container { padding: 0 1.5rem; }
            .section { padding: 4rem 1.5rem; }
            .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 768px) {
            .container { padding: 0 2rem; }
            .section { padding: 5rem 2rem; }
            .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .md\\:text-2xl { font-size: 1.5rem; }
            .md\\:text-5xl { font-size: 3rem; }
            .md\\:text-6xl { font-size: 3.75rem; }
        }
        @media (min-width: 1024px) {
            .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        
        /* ---------- Mobile-fix overrides for template ---------- */
        
        /* Safety & helpers */
        html, body, #__next { box-sizing: border-box; }
        *, *::before, *::after { box-sizing: inherit; }
        html, body { overflow-x: hidden !important; }
        img, picture, video, iframe, embed, object { max-width: 100% !important; height: auto !important; display: block !important; }
        
        /* Ensure flex/grid children can shrink (common source of overflow) */
        .min-w-0-fix { min-width: 0 !important; }
        
        /* ---------------- .grid (features / services / testimonials) ---------------- */
        /* Make grid responsive using auto-fit + minmax so cards wrap naturally */
        .grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
            gap: 1rem !important;
            align-items: start !important;
            justify-items: center !important;
            width: 100% !important;
            box-sizing: border-box !important;
        }
        
        /* Card items inside .grid: allow shrink, set safe max-width and full width on small screens */
        .grid > div,
        .grid > * {
            min-width: 0 !important;
            width: 100% !important;
            max-width: 360px !important;
            box-sizing: border-box !important;
            display: block !important;
        }
        
        /* Keep inner content from forcing overflow (eg: large shadows/pseudo elements) */
        .grid > div * { word-wrap: break-word !important; overflow-wrap: anywhere !important; }
        
        /* Optional: visual centering for card content */
        .grid > div { margin: 0 auto !important; }
        
        /* ---------------- Footer: .footer-content ---------------- */
        /* Make footer columns use flex that wraps on small screens */
        .footer-content {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 1rem !important;
            align-items: flex-start !important;
            justify-content: space-between !important;
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 1rem 0 !important;
        }
        
        /* Individual footer columns: stack to 100% on small screens and keep tidy on large */
        .footer-content > div {
            flex: 1 1 220px !important;
            min-width: 0 !important;
            width: 100% !important;
            max-width: 320px !important;
            box-sizing: border-box !important;
            padding: 0.25rem 0 !important;
        }
        
        /* Social icons inside footer: prevent overlap and make them wrap */
        .footer-content .social,
        .footer-content .social-icons,
        .footer-content .social-bubbles,
        .social-bubbles {
            display: flex !important;
            gap: 0.5rem !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: flex-start !important;
            position: static !important;
            transform: none !important;
            margin: 0 !important;
        }
        
        .footer-content .social .social-icon,
        .footer-content .social-icon,
        .social-bubbles .social-icon {
            width: 36px !important;
            height: 36px !important;
            min-width: 36px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin: 0 !important;
            border-radius: 999px !important;
            transform: none !important;
        }
        
        /* ---------------- Hero sections (section[class*="section"]) ---------------- */
        /* Target hero/section areas to remove dangerous absolute positioning or transforms on small screens */
        section[class*="section"],
        .section {
            box-sizing: border-box !important;
            width: 100% !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
        }
        
        /* Make any images inside hero/section flow normally on mobile */
        section[class*="section"] img,
        .section img {
            position: static !important;
            transform: none !important;
            width: 100% !important;
            max-width: 480px !important;
            height: auto !important;
            margin: 0.6rem auto !important;
            object-fit: cover !important;
        }
        
        /* Force CTA buttons inside sections to be full width on small screens */
        section[class*="section"] .cta,
        .section .cta,
        section[class*="section"] .btn,
        .section .btn {
            display: block !important;
            width: 100% !important;
            max-width: 420px !important;
            margin: 0.6rem auto !important;
        }
        
        /* ---------------- Typography scaling and small-screen rules ---------------- */
        @media (max-width: 640px) {
            h1, .page-title, .hero-title { font-size: clamp(1.4rem, 6.5vw, 2rem) !important; line-height: 1.05 !important; text-align: center !important; }
            h2, .section-title { font-size: clamp(1.1rem, 5.0vw, 1.5rem) !important; text-align: center !important; }
            
            /* ensure grid cards stack with full width */
            .grid { grid-template-columns: repeat(1, 1fr) !important; gap: 1rem !important; }
            
            /* footer columns stack vertically on small screens */
            .footer-content { flex-direction: column !important; gap: 1rem !important; align-items: stretch !important; }
            .footer-content > div { width: 100% !important; max-width: 100% !important; padding: .6rem 0 !important; }
            
            /* remove any floating/absolute positions used for decorative elements */
            .floating, .floating-image, .floating-icons, .floating-cta, .hero .decor, .side-image {
                position: static !important;
                transform: none !important;
                margin: .4rem auto !important;
                width: 100% !important;
            }
        }
    </style>
</head>
<body>
    ${template.customizedSections.map(section => renderSectionHTML(section)).join('\n')}
</body>
</html>`;
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Validate and sanitize URLs to prevent XSS via javascript: or data: schemes
  const sanitizeUrl = (url: string | undefined | null): string => {
    if (!url) return '';
    const trimmed = url.trim();
    // Block javascript: and data: URLs which can execute code
    if (trimmed.toLowerCase().startsWith('javascript:') || 
        trimmed.toLowerCase().startsWith('data:') ||
        trimmed.toLowerCase().startsWith('vbscript:')) {
      return '#';
    }
    // Allow http, https, tel, mailto, and relative paths
    if (trimmed.startsWith('http://') || 
        trimmed.startsWith('https://') || 
        trimmed.startsWith('tel:') || 
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('/') ||
        trimmed.startsWith('./') ||
        trimmed.startsWith('../') ||
        !trimmed.includes(':')) {
      return trimmed;
    }
    // Block other protocols
    return '#';
  };

  const renderSectionHTML = (section: TemplateSection): string => {
    const content = section.content || {};
    
    switch (section.type) {
      case 'hero':
        return `<section id="${section.id}" class="section" style="position: relative; min-height: 300px; display: flex; align-items: center; justify-content: center; text-align: center; color: white; background-image: url('${escapeHtml(sanitizeUrl(content.backgroundImage))}'); background-size: cover; background-position: center; width: 100%; overflow-x: hidden;">
            <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3));"></div>
            <div style="position: relative; z-index: 10; max-width: 64rem; margin: 0 auto; padding: 1.5rem 1rem; width: 100%;">
                <h1 style="font-size: 1.75rem; font-weight: 800; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); line-height: 1.2; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.heading || '')}</h1>
                <p style="font-size: 0.9375rem; margin-bottom: 1.5rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); line-height: 1.5; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.subheading || '')}</p>
                <div style="display: flex; flex-direction: column; gap: 0.75rem; justify-content: center; width: 100%; max-width: 500px; margin: 0 auto;">
                    <a href="#contact" style="padding: 0.875rem 1.5rem; font-size: 1rem; font-weight: 600; border-radius: 0.5rem; background: #4f46e5; color: white; transition: all 0.3s; text-align: center; min-height: 44px; display: flex; align-items: center; justify-content: center; width: 100%; touch-action: manipulation; -webkit-tap-highlight-color: rgba(255,255,255,0.2);">${escapeHtml(content.ctaText || 'Get Started')}</a>
                    <a href="tel:${escapeHtml((content.ctaPhoneNumber || content.ctaPhone || '').replace(/[^0-9+()-]/g, ''))}" style="padding: 0.875rem 1.5rem; font-size: 1rem; font-weight: 600; border-radius: 0.5rem; background: white; color: #4f46e5; transition: all 0.3s; text-align: center; min-height: 44px; display: flex; align-items: center; justify-content: center; width: 100%; touch-action: manipulation; -webkit-tap-highlight-color: rgba(79,70,229,0.1);">📞 ${escapeHtml(content.ctaPhoneDisplay || content.ctaPhone || '')}</a>
                </div>
            </div>
            <style>
                @media (max-width: 639px) {
                    #${section.id} { min-height: 300px; padding: 2rem 1rem; }
                    #${section.id} h1 { font-size: 1.75rem !important; }
                    #${section.id} p { font-size: 0.9375rem !important; }
                }
                @media (min-width: 640px) {
                    #${section.id} { min-height: 500px; }
                    #${section.id} h1 { font-size: 2.5rem; }
                    #${section.id} p { font-size: 1.25rem; }
                    #${section.id} .cta-buttons { flex-direction: row; }
                    #${section.id} .cta-buttons a { width: auto; min-width: 200px; }
                }
                @media (min-width: 768px) {
                    #${section.id} { min-height: 600px; }
                    #${section.id} h1 { font-size: 3.5rem; }
                    #${section.id} p { font-size: 1.5rem; }
                    #${section.id} .cta-buttons { gap: 1rem; }
                }
            </style>
    </section>`;

      case 'features':
        const features = content.features || [];
        return `<section id="${section.id}" class="section" style="padding: 2rem 1rem; background: #f8fafc; width: 100%; overflow-x: hidden;">
            <div style="max-width: 72rem; margin: 0 auto; width: 100%;">
                <h2 style="font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 1.5rem; color: #0f172a; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.heading || '')}</h2>
                <div class="features-grid" style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; width: 100%;">
                    ${features.map((feature: any) => `
                        <div style="background: white; padding: 1.25rem; border-radius: 0.75rem; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; box-sizing: border-box;">
                            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">${escapeHtml(feature.icon || '')}</div>
                            <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #4f46e5; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(feature.title || '')}</h3>
                            <p style="color: #64748b; font-size: 0.875rem; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.5;">${escapeHtml(feature.description || '')}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <style>
                #${section.id} .features-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    width: 100%;
                }
                @media (max-width: 639px) {
                    #${section.id} { padding: 2rem 1rem !important; }
                    #${section.id} h2 { font-size: clamp(1.25rem, 5vw, 1.5rem) !important; margin-bottom: 1.5rem !important; }
                }
                @media (min-width: 640px) {
                    #${section.id} { padding: 4rem 1.5rem; }
                    #${section.id} .features-grid { grid-template-columns: repeat(2, 1fr); }
                    #${section.id} h2 { font-size: clamp(1.75rem, 4vw, 2.25rem); margin-bottom: 2.5rem; }
                }
                @media (min-width: 1024px) {
                    #${section.id} { padding: 5rem 2rem; }
                    #${section.id} .features-grid { grid-template-columns: repeat(4, 1fr); }
                    #${section.id} h2 { font-size: clamp(2rem, 3vw, 3rem); margin-bottom: 3rem; }
                }
            </style>
        </section>`;

      case 'services':
        const services = content.services || [];
        return `<section id="${section.id}" class="section" style="padding: 2rem 1rem; background: white; width: 100%; overflow-x: hidden;">
            <div style="max-width: 72rem; margin: 0 auto; width: 100%;">
                <h2 style="font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 1rem; color: #0f172a; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.heading || '')}</h2>
                ${content.subheading ? `<p style="text-align: center; color: #64748b; margin-bottom: 1.5rem; font-size: 0.9375rem; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.subheading)}</p>` : ''}
                <div class="services-grid" style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; width: 100%;">
                    ${services.map((service: any) => `
                        <div style="background: white; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; width: 100%; box-sizing: border-box;">
                            ${service.image ? `<img src="${escapeHtml(sanitizeUrl(service.image))}" alt="${escapeHtml(service.title || '')}" style="width: 100%; height: 10rem; object-fit: cover; display: block; max-width: 100%;">` : '<div style="width: 100%; height: 10rem; background: #f1f5f9;"></div>'}
                            <div style="padding: 1.25rem;">
                                <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #0f172a; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(service.title || '')}</h3>
                                <p style="color: #64748b; margin-bottom: 1rem; font-size: 0.875rem; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.5;">${escapeHtml(service.description || '')}</p>
                                ${service.price ? `<p style="color: #4f46e5; font-weight: 700; font-size: 1rem;">${escapeHtml(service.price)}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <style>
                #${section.id} .services-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    width: 100%;
                }
                @media (max-width: 639px) {
                    #${section.id} { padding: 2rem 1rem !important; }
                    #${section.id} h2 { font-size: clamp(1.25rem, 5vw, 1.5rem) !important; }
                }
                @media (min-width: 640px) {
                    #${section.id} { padding: 4rem 1.5rem; }
                    #${section.id} .services-grid { grid-template-columns: repeat(2, 1fr); }
                    #${section.id} h2 { font-size: clamp(1.75rem, 4vw, 2.25rem); }
                }
                @media (min-width: 1024px) {
                    #${section.id} { padding: 5rem 2rem; }
                    #${section.id} .services-grid { grid-template-columns: repeat(3, 1fr); }
                    #${section.id} h2 { font-size: clamp(2rem, 3vw, 3rem); }
                }
            </style>
        </section>`;

      case 'testimonials':
        const testimonials = content.testimonials || [];
        return `<section id="${section.id}" class="section" style="padding: 2rem 1rem; background: #f8fafc; width: 100%; overflow-x: hidden;">
            <div style="max-width: 72rem; margin: 0 auto; width: 100%;">
                <h2 style="font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 1.5rem; color: #0f172a; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.heading || '')}</h2>
                <div class="testimonials-grid" style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; width: 100%;">
                    ${testimonials.map((testimonial: any) => `
                        <div style="background: white; padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; box-sizing: border-box;">
                            <div style="display: flex; align-items: center; margin-bottom: 0.75rem;">
                                ${testimonial.avatar ? `<img src="${escapeHtml(sanitizeUrl(testimonial.avatar))}" alt="${escapeHtml(testimonial.name || '')}" style="width: 2.5rem; height: 2.5rem; border-radius: 50%; margin-right: 0.75rem; object-fit: cover; flex-shrink: 0; max-width: 100%;">` : '<div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; margin-right: 0.75rem; background: #e2e8f0; flex-shrink: 0;"></div>'}
                                <div style="min-width: 0; flex: 1;">
                                    <h4 style="font-weight: 600; color: #0f172a; font-size: 0.9375rem; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(testimonial.name || '')}</h4>
                                    ${testimonial.company ? `<p style="font-size: 0.75rem; color: #64748b; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(testimonial.company)}</p>` : ''}
                                </div>
                            </div>
                            ${testimonial.rating ? `<div style="display: flex; margin-bottom: 0.5rem; color: #fbbf24; font-size: 1rem; flex-wrap: wrap;">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>` : ''}
                            <p style="color: #334155; font-style: italic; font-size: 0.875rem; line-height: 1.5; word-wrap: break-word; overflow-wrap: break-word;">"${escapeHtml(testimonial.text || '')}"</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <style>
                #${section.id} .testimonials-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    width: 100%;
                }
                @media (max-width: 639px) {
                    #${section.id} { padding: 2rem 1rem !important; }
                    #${section.id} h2 { font-size: clamp(1.25rem, 5vw, 1.5rem) !important; margin-bottom: 1.5rem !important; }
                }
                @media (min-width: 640px) {
                    #${section.id} { padding: 4rem 1.5rem; }
                    #${section.id} .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
                    #${section.id} h2 { font-size: clamp(1.75rem, 4vw, 2.25rem); margin-bottom: 2.5rem; }
                }
                @media (min-width: 1024px) {
                    #${section.id} { padding: 5rem 2rem; }
                    #${section.id} .testimonials-grid { grid-template-columns: repeat(3, 1fr); }
                    #${section.id} h2 { font-size: clamp(2rem, 3vw, 3rem); margin-bottom: 3rem; }
                }
            </style>
        </section>`;

      case 'cta':
        return `<section id="${section.id}" class="section" style="padding: 2rem 1rem; text-align: center; color: white; background: linear-gradient(135deg, #4f46e5, #7c3aed); width: 100%; overflow-x: hidden;">
            <div style="max-width: 64rem; margin: 0 auto; width: 100%;">
                <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.heading || '')}</h2>
                ${content.subheading ? `<p style="font-size: 0.9375rem; margin-bottom: 1.5rem; opacity: 0.9; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.subheading)}</p>` : ''}
                <div style="display: flex; flex-direction: column; gap: 0.75rem; justify-content: center; align-items: center; margin-bottom: 1.5rem; max-width: 500px; margin-left: auto; margin-right: auto; width: 100%;">
                    ${(content.phoneNumber || content.phone) ? `<a href="tel:${escapeHtml((content.phoneNumber || content.phone || '').replace(/[^0-9+()-]/g, ''))}" style="padding: 0.875rem 1.5rem; font-size: 1rem; font-weight: 600; border-radius: 0.5rem; background: white; color: #4f46e5; transition: all 0.3s; width: 100%; min-height: 44px; display: flex; align-items: center; justify-content: center; touch-action: manipulation; -webkit-tap-highlight-color: rgba(79,70,229,0.1);">📞 ${escapeHtml(content.ctaText || 'Call Now')} ${escapeHtml(content.phoneDisplay || content.phone || '')}</a>` : ''}
                    ${content.email ? `<a href="mailto:${escapeHtml(content.email.replace(/[<>"']/g, ''))}" style="padding: 0.875rem 1.5rem; font-size: 1rem; font-weight: 600; border-radius: 0.5rem; background: #4338ca; color: white; transition: all 0.3s; width: 100%; min-height: 44px; display: flex; align-items: center; justify-content: center; touch-action: manipulation; -webkit-tap-highlight-color: rgba(255,255,255,0.1);">✉️ Email Us</a>` : ''}
                </div>
                ${content.hours ? `<div style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 1rem; font-size: 0.875rem; flex-wrap: wrap;"><span>🕐</span><p style="opacity: 0.9; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.hours)}</p></div>` : ''}
            </div>
            <style>
                @media (max-width: 639px) {
                    #${section.id} { padding: 2rem 1rem; }
                    #${section.id} h2 { font-size: 1.5rem !important; }
                }
                @media (min-width: 640px) {
                    #${section.id} { padding: 4rem 1.5rem; }
                    #${section.id} h2 { font-size: 2.25rem; }
                    #${section.id} .subheading { font-size: 1.25rem; margin-bottom: 2rem; }
                    #${section.id} .cta-buttons { flex-direction: row; gap: 1rem; }
                    #${section.id} .cta-buttons a { width: auto; min-width: 200px; }
                }
                @media (min-width: 768px) {
                    #${section.id} { padding: 5rem 2rem; }
                    #${section.id} h2 { font-size: 3rem; }
                    #${section.id} .subheading { font-size: 1.5rem; }
                }
            </style>
        </section>`;

      case 'footer':
        const socialIconsHtml = (content.socialIcons || [
          { name: 'Facebook', icon: 'f', href: '#' },
          { name: 'Google+', icon: 'g+', href: '#' },
          { name: 'YouTube', icon: '▶', href: '#' },
          { name: 'Dribbble', icon: 'b', href: '#' },
          { name: 'LinkedIn', icon: 'in', href: '#' },
          { name: 'Twitter', icon: '🐦', href: '#' },
          { name: 'RSS', icon: 'S', href: '#' },
          { name: 'Pinterest', icon: 'P', href: '#' }
        ]).map((icon: any) => 
          `<a href="${escapeHtml(sanitizeUrl(icon.href || '#'))}" style="width: 2.5rem; height: 2.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: all 0.2s; font-size: 0.875rem; font-weight: 600;">${escapeHtml(icon.icon || icon.name?.[0] || '?')}</a>`
        ).join('');
        
        return `<footer id="${section.id}" style="background: #0f172a; color: #cbd5e1; padding: 2rem 1rem 1.5rem; width: 100%; overflow-x: hidden;">
            <div style="max-width: 72rem; margin: 0 auto; width: 100%;">
                <div style="display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 2rem; width: 100%;" class="footer-content">
                    <!-- Contact us Column -->
                    <div>
                        <h4 style="color: white; font-weight: 600; margin-bottom: 1rem; font-size: 1rem; line-height: 1.5;">${escapeHtml(content.contactTitle || 'Contact us')}</h4>
                        <div style="color: #94a3b8; font-size: 0.875rem; line-height: 1.8;">
                            ${content.address ? `<p style="margin: 0 0 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;"><span>📍</span><span>${escapeHtml(content.address)}</span></p>` : ''}
                            ${(content.phoneNumber || content.phone) ? `<p style="margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;"><span>📞</span><a href="tel:${escapeHtml((content.phoneNumber || content.phone || '').replace(/[^0-9+()-]/g, ''))}" style="color: #60a5fa; text-decoration: none;">${escapeHtml(content.phoneDisplay || content.phone || '')}</a></p>` : ''}
                            ${content.email ? `<p style="margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;"><span>✉️</span><a href="mailto:${escapeHtml(content.email.replace(/[<>"']/g, ''))}" style="color: #60a5fa; text-decoration: none;">${escapeHtml(content.email)}</a></p>` : ''}
                            ${content.skype ? `<p style="margin: 0; display: flex; align-items: center; gap: 0.5rem;"><span>💬</span><a href="skype:${escapeHtml(content.skype.replace(/[^a-zA-Z0-9._-]/g, ''))}?chat" style="color: #60a5fa; text-decoration: none;">${escapeHtml(content.skype)}</a></p>` : ''}
                        </div>
                    </div>
                    
                    <!-- Mailing list Column -->
                    <div>
                        <h4 style="color: white; font-weight: 600; margin-bottom: 1rem; font-size: 1rem; line-height: 1.5;">${escapeHtml(content.mailingListTitle || 'Mailing list')}</h4>
                        ${content.mailingListDescription ? `<p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1rem;">${escapeHtml(content.mailingListDescription)}</p>` : ''}
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="email" placeholder="Your email address..." style="flex: 1; padding: 0.5rem 0.75rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.25rem; color: white; font-size: 0.875rem;" />
                            <button style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Go!</button>
                        </div>
                    </div>
                    
                    <!-- Follow us Column -->
                    <div>
                        <h4 style="color: white; font-weight: 600; margin-bottom: 1rem; font-size: 1rem; line-height: 1.5;">${escapeHtml(content.followUsTitle || 'Follow us')}</h4>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; max-width: 12rem;">
                            ${socialIconsHtml}
                        </div>
                    </div>
                    
                    <!-- Latest News Column -->
                    <div>
                        <h4 style="color: white; font-weight: 600; margin-bottom: 1rem; font-size: 1rem; line-height: 1.5;">${escapeHtml(content.latestNewsTitle || 'Latest News')}</h4>
                        ${content.latestNewsDescription ? `<p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1rem;">${escapeHtml(content.latestNewsDescription)}</p>` : ''}
                        <button style="width: 100%; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">${escapeHtml(content.latestNewsButtonText || 'Get Mores!')}</button>
                    </div>
                </div>
                ${content.copyright ? `<div style="padding-top: 1.5rem; border-top: 1px solid #1e293b; text-align: center; color: #94a3b8; font-size: 0.75rem; margin-top: 1.5rem;">${escapeHtml(content.copyright)}</div>` : ''}
            </div>
            <style>
                #${section.id} .footer-content {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                    width: 100%;
                }
                @media (max-width: 639px) {
                    #${section.id} { padding: 2rem 1rem 1.5rem !important; }
                    #${section.id} .footer-content { grid-template-columns: 1fr !important; }
                }
                @media (min-width: 640px) {
                    #${section.id} { padding: 4rem 1.5rem 2rem; }
                    #${section.id} .footer-content { grid-template-columns: repeat(2, 1fr); }
                    #${section.id} h4 { font-size: 1.125rem; }
                    #${section.id} p, #${section.id} li { font-size: 1rem; }
                }
                @media (min-width: 768px) {
                    #${section.id} .footer-content { grid-template-columns: repeat(4, 1fr); }
                    #${section.id} .copyright { font-size: 0.875rem; }
                }
            </style>
        </footer>`;

      case 'privacy':
        // Convert markdown to HTML for better rendering
        const privacyContent = (content.content || '').replace(/\n/g, '<br>')
          .replace(/##\s+(.+)/g, '<h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #0f172a;">$1</h2>')
          .replace(/###\s+(.+)/g, '<h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #0f172a;">$1</h3>')
          .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
          .replace(/\*\s+(.+)/g, '<li style="margin-left: 1.5rem; margin-bottom: 0.5rem; list-style-type: disc;">$1</li>')
          .replace(/^(.+)$/gm, (match) => {
            if (match.trim().startsWith('<')) return match;
            if (match.trim().startsWith('#')) return match;
            return `<p style="margin-bottom: 1rem; line-height: 1.7; color: #334155;">${match}</p>`;
          });
        
        return `<section id="${section.id}" class="section" style="padding: 4rem 1.5rem; background: white;">
            <div style="max-width: 64rem; margin: 0 auto;">
                <h1 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; color: #0f172a; line-height: 1.2;">Privacy Policy</h1>
                ${content.lastUpdated ? `<p style="color: #64748b; margin-bottom: 2rem; font-size: 0.9375rem;">Last Updated: ${escapeHtml(content.lastUpdated)}</p>` : ''}
                <div style="color: #334155; line-height: 1.7;">${privacyContent}</div>
            </div>
        </section>`;

      case 'terms':
        // Convert markdown to HTML for better rendering
        const termsContent = (content.content || '').replace(/\n/g, '<br>')
          .replace(/##\s+(.+)/g, '<h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #0f172a;">$1</h2>')
          .replace(/###\s+(.+)/g, '<h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #0f172a;">$1</h3>')
          .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
          .replace(/\*\s+(.+)/g, '<li style="margin-left: 1.5rem; margin-bottom: 0.5rem; list-style-type: disc;">$1</li>')
          .replace(/^(.+)$/gm, (match) => {
            if (match.trim().startsWith('<')) return match;
            if (match.trim().startsWith('#')) return match;
            return `<p style="margin-bottom: 1rem; line-height: 1.7; color: #334155;">${match}</p>`;
          });
        
        return `<section id="${section.id}" class="section" style="padding: 4rem 1.5rem; background: white;">
            <div style="max-width: 64rem; margin: 0 auto;">
                <h1 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; color: #0f172a; line-height: 1.2;">Terms of Service</h1>
                ${content.lastUpdated ? `<p style="color: #64748b; margin-bottom: 2rem; font-size: 0.9375rem;">Last Updated: ${escapeHtml(content.lastUpdated)}</p>` : ''}
                <div style="color: #334155; line-height: 1.7;">${termsContent}</div>
            </div>
        </section>`;

      case 'about':
        return `<section id="${section.id}" class="section" style="padding: 2rem 1rem; background: linear-gradient(to bottom, white, #f8fafc, white); width: 100%; overflow-x: hidden;">
            <div style="max-width: 72rem; margin: 0 auto; width: 100%;">
                <div class="about-grid" style="display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: center; width: 100%;">
                    <div style="width: 100%;">
                        <h2 style="font-size: clamp(1.5rem, 5vw, 3rem); font-weight: 700; margin-bottom: 1rem; color: #0f172a; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.heading || '')}</h2>
                        ${content.subheading ? `<p style="font-size: clamp(1rem, 3vw, 1.25rem); color: #4f46e5; font-weight: 600; margin-bottom: 1.5rem; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.subheading)}</p>` : ''}
                        ${content.description ? `<p style="font-size: clamp(0.9375rem, 2.5vw, 1.125rem); color: #64748b; margin-bottom: 2rem; line-height: 1.7; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.description)}</p>` : ''}
                        ${content.stats ? `
                            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem; width: 100%;">
                                ${content.stats.map((stat: any) => `
                                    <div style="text-align: center; width: 100%;">
                                        <div style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 700; color: #4f46e5; margin-bottom: 0.5rem;">${escapeHtml(stat.number || '')}</div>
                                        <div style="font-size: clamp(0.75rem, 2vw, 0.875rem); color: #64748b; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(stat.label || '')}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${content.values ? `
                            <div class="values-grid" style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; width: 100%;">
                                ${content.values.map((value: any) => `
                                    <div style="display: flex; align-items: start; gap: 1rem; width: 100%;">
                                        <div style="font-size: 2rem; flex-shrink: 0;">${escapeHtml(value.icon || '')}</div>
                                        <div style="min-width: 0; flex: 1;">
                                            <h3 style="font-weight: 600; color: #0f172a; margin-bottom: 0.25rem; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(value.title || '')}</h3>
                                            <p style="font-size: 0.875rem; color: #64748b; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(value.description || '')}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div style="width: 100%;">
                        ${content.image ? `<img src="${escapeHtml(sanitizeUrl(content.image))}" alt="About us" style="width: 100%; max-width: 100%; height: auto; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: block;">` : ''}
                    </div>
                </div>
            </div>
            <style>
                #${section.id} .about-grid { grid-template-columns: 1fr; }
                #${section.id} .stats-grid { grid-template-columns: repeat(2, 1fr); }
                #${section.id} .values-grid { grid-template-columns: 1fr; }
                @media (min-width: 768px) {
                    #${section.id} { padding: 4rem 1.5rem; }
                    #${section.id} .about-grid { grid-template-columns: 1fr 1fr; gap: 3rem; }
                    #${section.id} .stats-grid { grid-template-columns: repeat(4, 1fr); }
                    #${section.id} .values-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 1024px) {
                    #${section.id} { padding: 5rem 2rem; }
                }
            </style>
        </section>`;

      case 'how-it-works':
        return `<section id="${section.id}" class="section" style="padding: 2rem 1rem; background: white; width: 100%; overflow-x: hidden;">
            <div style="max-width: 72rem; margin: 0 auto; width: 100%;">
                <h2 style="font-size: clamp(1.5rem, 5vw, 3rem); font-weight: 700; text-align: center; margin-bottom: 1rem; color: #0f172a; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.heading || '')}</h2>
                ${content.subheading ? `<p style="font-size: clamp(0.9375rem, 3vw, 1.25rem); color: #64748b; text-align: center; margin-bottom: 2rem; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(content.subheading)}</p>` : ''}
                <div class="steps-grid" style="display: grid; grid-template-columns: 1fr; gap: 2rem; width: 100%;">
                    ${(content.steps || []).map((step: any, idx: number) => `
                        <div style="text-align: center; width: 100%;">
                            <div style="position: relative; margin-bottom: 1.5rem;">
                                <div style="width: 5rem; height: 5rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.875rem; font-weight: 700; margin: 0 auto 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                                    ${step.number || (idx + 1)}
                                </div>
                                <div style="font-size: 2.5rem; margin-bottom: 1rem;">${escapeHtml(step.icon || '')}</div>
                                ${step.image ? `<img src="${escapeHtml(sanitizeUrl(step.image))}" alt="${escapeHtml(step.title || '')}" style="width: 100%; max-width: 100%; height: auto; min-height: 12rem; object-fit: cover; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 1rem; display: block;">` : ''}
                            </div>
                            <h3 style="font-size: clamp(1rem, 3vw, 1.25rem); font-weight: 600; margin-bottom: 0.5rem; color: #0f172a; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(step.title || '')}</h3>
                            <p style="color: #64748b; line-height: 1.6; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(step.description || '')}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <style>
                #${section.id} .steps-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                    width: 100%;
                }
                @media (min-width: 640px) {
                    #${section.id} { padding: 4rem 1.5rem; }
                    #${section.id} .steps-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 1024px) {
                    #${section.id} { padding: 5rem 2rem; }
                    #${section.id} .steps-grid { grid-template-columns: repeat(4, 1fr); }
                }
            </style>
        </section>`;

      case 'contact':
        return `<section id="${section.id}" class="section" style="padding: 2rem 1rem; background: linear-gradient(to bottom, #f8fafc, white); width: 100%; overflow-x: hidden;">
            <div style="max-width: 72rem; margin: 0 auto; width: 100%;">
                <div class="contact-grid" style="display: grid; grid-template-columns: 1fr; gap: 2rem; width: 100%;">
                    <div>
                        <h2 style="font-size: 3rem; font-weight: 700; margin-bottom: 1rem; color: #0f172a;">${escapeHtml(content.heading || '')}</h2>
                        ${content.subheading ? `<p style="font-size: 1.25rem; color: #4f46e5; font-weight: 600; margin-bottom: 1rem;">${escapeHtml(content.subheading)}</p>` : ''}
                        ${content.description ? `<p style="font-size: 1.125rem; color: #64748b; margin-bottom: 2rem; line-height: 1.7;">${escapeHtml(content.description)}</p>` : ''}
                        ${content.contactInfo ? `
                            <div style="margin-bottom: 2rem;">
                                ${content.contactInfo.phone ? `
                                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                                        <span style="font-size: 1.5rem;">📞</span>
                                        <a href="tel:${escapeHtml((content.contactInfo.phone || '').replace(/[^0-9+()-]/g, ''))}" style="font-size: 1.125rem; color: #334155; text-decoration: none; transition: color 0.2s;">${escapeHtml(content.contactInfo.phone)}</a>
                                    </div>
                                ` : ''}
                                ${content.contactInfo.email ? `
                                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                                        <span style="font-size: 1.5rem;">✉️</span>
                                        <a href="mailto:${escapeHtml((content.contactInfo.email || '').replace(/[<>"']/g, ''))}" style="font-size: 1.125rem; color: #334155; text-decoration: none; transition: color 0.2s;">${escapeHtml(content.contactInfo.email)}</a>
                                    </div>
                                ` : ''}
                                ${content.contactInfo.address ? `
                                    <div style="display: flex; align-items: start; gap: 0.75rem; margin-bottom: 1rem;">
                                        <span style="font-size: 1.5rem;">📍</span>
                                        <p style="font-size: 1.125rem; color: #334155; line-height: 1.6;">${escapeHtml(content.contactInfo.address)}</p>
                                    </div>
                                ` : ''}
                                ${content.contactInfo.hours ? `
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <span style="font-size: 1.5rem;">🕐</span>
                                        <p style="font-size: 1.125rem; color: #334155;">${escapeHtml(content.contactInfo.hours)}</p>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                        ${content.mapEmbed ? `
                            <div style="margin-top: 2rem; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <iframe src="${escapeHtml(sanitizeUrl(content.mapEmbed))}" width="100%" height="300" style="border: 0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                        ` : ''}
                    </div>
                    <div>
                        <form style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                            ${(content.formFields || []).map((field: any) => `
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem;">
                                        ${escapeHtml(field.label || '')} ${field.required ? '<span style="color: #ef4444;">*</span>' : ''}
                                    </label>
                                    ${field.type === 'textarea' ? `
                                        <textarea style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 1rem; font-family: inherit; resize: vertical;" placeholder="${escapeHtml(field.placeholder || '')}" ${field.required ? 'required' : ''} rows="4"></textarea>
                                    ` : field.type === 'select' ? `
                                        <select style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 1rem; font-family: inherit;" ${field.required ? 'required' : ''}>
                                            <option value="">Select ${escapeHtml(field.label || '')}</option>
                                            ${(field.options || []).map((opt: string) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
                                        </select>
                                    ` : `
                                        <input type="${field.type || 'text'}" style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 1rem; font-family: inherit;" placeholder="${escapeHtml(field.placeholder || '')}" ${field.required ? 'required' : ''}>
                                    `}
                                </div>
                            `).join('')}
                            <button type="submit" style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border: none; border-radius: 0.5rem; font-size: 1.125rem; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <style>
                #${section.id} .contact-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                    width: 100%;
                }
                @media (max-width: 639px) {
                    #${section.id} { padding: 2rem 1rem !important; }
                    #${section.id} h2 { font-size: clamp(1.5rem, 5vw, 2rem) !important; }
                }
                @media (min-width: 768px) {
                    #${section.id} { padding: 4rem 1.5rem; }
                    #${section.id} .contact-grid { grid-template-columns: 1fr 1fr; gap: 3rem; }
                }
                @media (min-width: 1024px) {
                    #${section.id} { padding: 5rem 2rem; }
                }
            </style>
        </section>`;

      default:
        return `<section id="${section.id}" class="section" style="padding: 5rem 1.25rem;">
            <div style="max-width: 72rem; margin: 0 auto;">
                <h2>${escapeHtml(section.title || 'Section')}</h2>
            </div>
        </section>`;
    }
  };

  const updateSectionContent = (sectionId: string, field: string, value: any) => {
    if (!editingTemplate) return;

    const updatedSections = editingTemplate.customizedSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          content: {
            ...section.content,
            [field]: value
          }
        };
      }
      return section;
    });

    const updatedTemplate = {
      ...editingTemplate,
      customizedSections: updatedSections
    };
    
    setEditingTemplate(updatedTemplate);
  };

  if (showEditor && editingTemplate) {
    return <TemplateEditor 
      template={editingTemplate}
      onClose={() => {
        setShowEditor(false);
        setEditingTemplate(null);
      }}
      onSave={() => {
        setTemplateName(editingTemplate.name);
        setShowSaveDialog(true);
      }}
      onUpdate={setEditingTemplate}
      previewMode={previewMode}
      setPreviewMode={setPreviewMode}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      updateSectionContent={updateSectionContent}
      onExport={handleExportHTML}
      onPolicyLinkClick={(type) => {
        const policySection = editingTemplate.customizedSections.find(
          s => s.type === type
        );
        if (policySection) {
          setShowPolicyModal({ type, section: policySection });
        }
      }}
    />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Website Templates
            </h1>
            <p className="text-slate-600">
              Professional landing page templates with Google Ads compliance
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Template Library ({filteredTemplates.length})</TabsTrigger>
          <TabsTrigger value="saved">My Templates ({savedTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <Card className="p-12 text-center">
              <Layout className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No templates found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => {
                // Get template image using improved helper function
                const templateImage = getTemplateImage(template);
                
                return (
                  <TemplateCard 
                    key={template.id}
                    template={template}
                    templateImage={templateImage}
                    onUseTemplate={async (template) => {
                      // Automatically copy template to user's templates before editing
                      try {
                        const completedTemplate = completeTemplateSections(template.sections);
                        const newTemplate: SavedTemplate = {
                          id: `template-${Date.now()}`,
                          name: template.name,
                          originalTemplateId: template.id,
                          customizedSections: completedTemplate,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        };
                        
                        // Save to user's templates
                        await historyService.save('website-template', newTemplate.name, {
                          template: newTemplate
                        });
                        
                        // Load saved templates to refresh list
                        await loadSavedTemplates();
                        
                        // Open editor with the copied template
                        setEditingTemplate(newTemplate);
                        setShowEditor(true);
                        
                        notifications.success('Template copied to your templates and ready to edit!', {
                          title: 'Template Ready'
                        });
                      } catch (error) {
                        console.error('Failed to copy template:', error);
                        notifications.error('Failed to copy template', { title: 'Error' });
                      }
                    }}
                    onExportTemplate={(template) => {
                      const savedTemplate: SavedTemplate = {
                        id: template.id,
                        name: template.name,
                        originalTemplateId: template.id,
                        customizedSections: template.sections,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      handleExportHTML(savedTemplate);
                    }}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {savedTemplates.length === 0 ? (
            <Card className="p-12 text-center">
              <Layout className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No saved templates yet</h3>
              <p className="text-slate-500 mb-6">Create your first template by editing the default template</p>
              <Button onClick={() => handleEditTemplate()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTemplates.map(template => (
                <Card key={template.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{template.name}</h3>
                    <p className="text-xs text-slate-500">
                      Updated: {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-1 mb-3">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-white border-slate-200 text-slate-600 font-normal">
                      {template.customizedSections.length} sections
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewTemplate(template)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleMakeCopy(template)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={async () => {
                        try {
                          await handleEditTemplate(template);
                        } catch (error) {
                          console.error('Error editing template:', error);
                          notifications.error('Failed to edit template. Please try again.', { title: 'Error' });
                        }
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleExportHTML(template)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog !== null} onOpenChange={() => setShowPreviewDialog(null)}>
        <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
            <DialogTitle>
              {showPreviewDialog && ('name' in showPreviewDialog ? showPreviewDialog.name : showPreviewDialog.name)}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {showPreviewDialog && (() => {
              const previewTemplate = ('customizedSections' in showPreviewDialog ? showPreviewDialog : {
                  id: showPreviewDialog.id,
                  name: showPreviewDialog.name,
                  originalTemplateId: showPreviewDialog.id,
                  customizedSections: showPreviewDialog.sections,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
              } as SavedTemplate);
              
              // Filter out privacy and terms from main preview
              const mainSections = previewTemplate.customizedSections.filter(
                s => s.type !== 'privacy' && s.type !== 'terms'
              );
              
              return (
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                  {mainSections.map(section => (
                  <div key={section.id}>
                      {renderSectionPreview(
                        section,
                        false,
                        undefined,
                        undefined,
                        undefined,
                        previewTemplate,
                        (type) => {
                          const policySection = previewTemplate.customizedSections.find(
                            s => s.type === type
                          );
                          if (policySection) {
                            setShowPolicyModal({ type, section: policySection });
                          }
                        }
                      )}
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 flex-shrink-0 border-t">
            <Button variant="outline" onClick={() => setShowPreviewDialog(null)}>
              Close
            </Button>
            {showPreviewDialog && (
              <Button 
                onClick={() => {
                  if (showPreviewDialog) {
                    if ('customizedSections' in showPreviewDialog) {
                      handleEditTemplate(showPreviewDialog);
                    } else {
                      handleEditTemplate(showPreviewDialog, true);
                    }
                    setShowPreviewDialog(null);
                  }
                }}
                className="theme-button-primary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Template Editor Component
const TemplateEditor: React.FC<{
  template: SavedTemplate;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (template: SavedTemplate) => void;
  previewMode: 'desktop' | 'mobile';
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  activeSection: string;
  setActiveSection: (id: string) => void;
  updateSectionContent: (sectionId: string, field: string, value: any) => void;
  onExport?: (template: SavedTemplate) => void;
  onPolicyLinkClick?: (type: 'privacy' | 'terms') => void;
}> = ({ 
  template, 
  onClose, 
  onSave, 
  onUpdate, 
  previewMode, 
  setPreviewMode,
  activeSection,
  setActiveSection,
  updateSectionContent,
  onExport,
  onPolicyLinkClick
}) => {
  const [editMode, setEditMode] = useState<'visual' | 'properties'>('visual');
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const currentSection = template.customizedSections.find(s => s.id === activeSection);

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col">
      {/* Visual Editor Banner */}
      {editMode === 'visual' && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 text-center text-sm font-semibold shadow-lg">
          ✨ Visual Editor Active - Click any text or element on the preview to edit directly! ✨
        </div>
      )}
      {/* Editor Header */}
      <div className="bg-white border-b-2 border-slate-300 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <h2 className="text-lg font-semibold text-slate-800">{template.name}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <Button
              variant={editMode === 'visual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setEditMode('visual')}
              title="Visual Editor - Click to edit directly on preview"
            >
              <Edit className="w-4 h-4 mr-1" />
              Visual
            </Button>
            <Button
              variant={editMode === 'properties' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setEditMode('properties')}
              title="Properties Panel - Edit using form fields"
            >
              <Settings className="w-4 h-4 mr-1" />
              Properties
            </Button>
          </div>
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
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                if (onSave) {
                  onSave();
                }
              }} 
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
            <Button 
              onClick={() => {
                if (onExport) {
                  onExport(template);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sections Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Sections</h3>
            <div className="space-y-1">
              {template.customizedSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Properties Panel - Only show in properties mode */}
        {editMode === 'properties' && (
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Properties</h3>
            {currentSection && (
              <SectionEditor
                section={currentSection}
                onUpdate={(field, value) => updateSectionContent(currentSection.id, field, value)}
              />
            )}
          </div>
        </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-slate-50 p-8">
          <div className={`mx-auto bg-white shadow-xl transition-all duration-300 overflow-x-hidden ${
            previewMode === 'mobile' ? 'max-w-[375px] w-full' : 'max-w-6xl w-full'
          }`} style={previewMode === 'mobile' ? { width: '375px', maxWidth: '100%' } : {}}>
            <div className={`${previewMode === 'mobile' ? 'w-full overflow-x-hidden' : 'w-full'}`}>
              <TemplatePreview 
                template={template} 
                editMode={editMode === 'visual'}
                onUpdate={updateSectionContent}
                editingElement={editingElement}
                setEditingElement={setEditingElement}
                onPolicyLinkClick={onPolicyLinkClick}
              />
          </div>
        </div>
          {editMode === 'visual' && (
            <div className="fixed bottom-6 right-6 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-2 z-50 animate-pulse">
              <Edit className="w-4 h-4" />
              <span>Click on any text or image in the preview to edit</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Section Editor Component
const SectionEditor: React.FC<{
  section: TemplateSection;
  onUpdate: (field: string, value: any) => void;
}> = ({ section, onUpdate }) => {
  const updateNestedField = (path: string, value: any) => {
    const keys = path.split('.');
    const newContent = { ...section.content };
    let current: any = newContent;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onUpdate('content', newContent);
  };

  const updateArrayItem = (arrayName: string, index: number, field: string, value: any) => {
    const newArray = [...(section.content[arrayName] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    onUpdate(arrayName, newArray);
  };

  const renderFieldEditor = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label>Heading</Label>
              <Input
                value={section.content.heading || ''}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Subheading</Label>
              <Textarea
                value={section.content.subheading || ''}
                onChange={(e) => onUpdate('subheading', e.target.value)}
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label>CTA Button Text</Label>
              <Input
                value={section.content.ctaText || ''}
                onChange={(e) => onUpdate('ctaText', e.target.value)}
                className="mt-2"
                placeholder="e.g., Get Started Today"
              />
            </div>
            <div>
              <Label>Call Now Button Display Text</Label>
              <Input
                value={section.content.ctaPhoneDisplay || section.content.ctaPhone || ''}
                onChange={(e) => onUpdate('ctaPhoneDisplay', e.target.value)}
                className="mt-2"
                placeholder="e.g., 1-800-HOT-LINE"
              />
              <p className="text-xs text-slate-500 mt-1">This is what users will see on the button</p>
            </div>
            <div>
              <Label>Actual Phone Number (for dialing)</Label>
              <Input
                value={section.content.ctaPhoneNumber || section.content.ctaPhone || ''}
                onChange={(e) => onUpdate('ctaPhoneNumber', e.target.value)}
                className="mt-2"
                placeholder="e.g., +18004686543"
              />
              <p className="text-xs text-slate-500 mt-1">This is the number that will be dialed when clicked</p>
            </div>
            <div>
              <Label>Background Image URL</Label>
              <Input
                value={section.content.backgroundImage || ''}
                onChange={(e) => onUpdate('backgroundImage', e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      case 'features':
        return (
          <div className="space-y-4">
            <div>
              <Label>Section Heading</Label>
              <Input
                value={section.content.heading || ''}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="mb-2 block">Features</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-4">
                  {(section.content.features || []).map((feature: any, idx: number) => (
                    <div key={idx} className="border-b pb-4 space-y-2">
                      <Input
                        placeholder="Icon (emoji)"
                        value={feature.icon || ''}
                        onChange={(e) => updateArrayItem('features', idx, 'icon', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Title"
                        value={feature.title || ''}
                        onChange={(e) => updateArrayItem('features', idx, 'title', e.target.value)}
                        className="mb-2"
                      />
                      <Textarea
                        placeholder="Description"
                        value={feature.description || ''}
                        onChange={(e) => updateArrayItem('features', idx, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      
      case 'services':
        return (
          <div className="space-y-4">
            <div>
              <Label>Section Heading</Label>
              <Input
                value={section.content.heading || ''}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Subheading</Label>
              <Textarea
                value={section.content.subheading || ''}
                onChange={(e) => onUpdate('subheading', e.target.value)}
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label className="mb-2 block">Services</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-4">
                  {(section.content.services || []).map((service: any, idx: number) => (
                    <div key={idx} className="border-b pb-4 space-y-2">
                      <Input
                        placeholder="Image URL"
                        value={service.image || ''}
                        onChange={(e) => updateArrayItem('services', idx, 'image', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Service Title"
                        value={service.title || ''}
                        onChange={(e) => updateArrayItem('services', idx, 'title', e.target.value)}
                        className="mb-2"
                      />
                      <Textarea
                        placeholder="Description"
                        value={service.description || ''}
                        onChange={(e) => updateArrayItem('services', idx, 'description', e.target.value)}
                        rows={2}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Price (e.g., Starting at $99)"
                        value={service.price || ''}
                        onChange={(e) => updateArrayItem('services', idx, 'price', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      
      case 'testimonials':
        return (
          <div className="space-y-4">
            <div>
              <Label>Section Heading</Label>
              <Input
                value={section.content.heading || ''}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="mb-2 block">Testimonials</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-4">
                  {(section.content.testimonials || []).map((testimonial: any, idx: number) => (
                    <div key={idx} className="border-b pb-4 space-y-2">
                      <Input
                        placeholder="Name"
                        value={testimonial.name || ''}
                        onChange={(e) => updateArrayItem('testimonials', idx, 'name', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Company"
                        value={testimonial.company || ''}
                        onChange={(e) => updateArrayItem('testimonials', idx, 'company', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Avatar URL"
                        value={testimonial.avatar || ''}
                        onChange={(e) => updateArrayItem('testimonials', idx, 'avatar', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Rating (1-5)"
                        type="number"
                        min="1"
                        max="5"
                        value={testimonial.rating || ''}
                        onChange={(e) => updateArrayItem('testimonials', idx, 'rating', parseInt(e.target.value))}
                        className="mb-2"
                      />
                      <Textarea
                        placeholder="Testimonial Text"
                        value={testimonial.text || ''}
                        onChange={(e) => updateArrayItem('testimonials', idx, 'text', e.target.value)}
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      
      case 'cta':
        return (
          <div className="space-y-4">
            <div>
              <Label>Heading</Label>
              <Input
                value={section.content.heading || ''}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Subheading</Label>
              <Textarea
                value={section.content.subheading || ''}
                onChange={(e) => onUpdate('subheading', e.target.value)}
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label>CTA Button Text</Label>
              <Input
                value={section.content.ctaText || ''}
                onChange={(e) => onUpdate('ctaText', e.target.value)}
                className="mt-2"
                placeholder="e.g., Call Now"
              />
            </div>
            <div>
              <Label>Call Now Button Display Text</Label>
              <Input
                value={section.content.phoneDisplay || section.content.phone || ''}
                onChange={(e) => onUpdate('phoneDisplay', e.target.value)}
                className="mt-2"
                placeholder="e.g., 1-800-HOT-LINE"
              />
              <p className="text-xs text-slate-500 mt-1">This is what users will see on the button</p>
            </div>
            <div>
              <Label>Actual Phone Number (for dialing)</Label>
              <Input
                value={section.content.phoneNumber || section.content.phone || ''}
                onChange={(e) => onUpdate('phoneNumber', e.target.value)}
                className="mt-2"
                placeholder="e.g., +18004686543"
              />
              <p className="text-xs text-slate-500 mt-1">This is the number that will be dialed when clicked</p>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={section.content.email || ''}
                onChange={(e) => onUpdate('email', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Hours/Availability</Label>
              <Input
                value={section.content.hours || ''}
                onChange={(e) => onUpdate('hours', e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      case 'footer':
        return (
          <div className="space-y-4">
            {/* Contact us Section */}
            <div className="border-b pb-4">
              <Label className="text-base font-semibold mb-3 block">Contact us</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={section.content.contactTitle || 'Contact us'}
                    onChange={(e) => onUpdate('contactTitle', e.target.value)}
                    className="mt-1"
                    placeholder="Contact us"
                  />
                </div>
                <div>
                  <Label className="text-xs">Address</Label>
                  <Input
                    value={section.content.address || ''}
                    onChange={(e) => onUpdate('address', e.target.value)}
                    className="mt-1"
                    placeholder="1th Avenue, New York - United States"
                  />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={section.content.phone || ''}
                    onChange={(e) => onUpdate('phone', e.target.value)}
                    className="mt-1"
                    placeholder="+22 342 2345 345"
                  />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    value={section.content.email || ''}
                    onChange={(e) => onUpdate('email', e.target.value)}
                    className="mt-1"
                    placeholder="info@example.com"
                  />
                </div>
                <div>
                  <Label className="text-xs">Skype</Label>
                  <Input
                    value={section.content.skype || ''}
                    onChange={(e) => onUpdate('skype', e.target.value)}
                    className="mt-1"
                    placeholder="my-company"
                  />
                </div>
              </div>
            </div>

            {/* Mailing list Section */}
            <div className="border-b pb-4">
              <Label className="text-base font-semibold mb-3 block">Mailing list</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={section.content.mailingListTitle || 'Mailing list'}
                    onChange={(e) => onUpdate('mailingListTitle', e.target.value)}
                    className="mt-1"
                    placeholder="Mailing list"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={section.content.mailingListDescription || ''}
                    onChange={(e) => onUpdate('mailingListDescription', e.target.value)}
                    className="mt-1"
                    placeholder="Lorem ipsum dolor sit amet, ea eum labitur scsstie percipitoleat."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Follow us Section */}
            <div className="border-b pb-4">
              <Label className="text-base font-semibold mb-3 block">Follow us</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={section.content.followUsTitle || 'Follow us'}
                    onChange={(e) => onUpdate('followUsTitle', e.target.value)}
                    className="mt-1"
                    placeholder="Follow us"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Social media icons are automatically displayed</Label>
                </div>
              </div>
            </div>

            {/* Latest News Section */}
            <div className="border-b pb-4">
              <Label className="text-base font-semibold mb-3 block">Latest News</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={section.content.latestNewsTitle || 'Latest News'}
                    onChange={(e) => onUpdate('latestNewsTitle', e.target.value)}
                    className="mt-1"
                    placeholder="Latest News"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={section.content.latestNewsDescription || ''}
                    onChange={(e) => onUpdate('latestNewsDescription', e.target.value)}
                    className="mt-1"
                    placeholder="Lorem ipsum dolor labitur scsstie per sit amet, ea eum labitur scsstie percipitoleat."
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-xs">Button Text</Label>
                  <Input
                    value={section.content.latestNewsButtonText || 'Get Mores!'}
                    onChange={(e) => onUpdate('latestNewsButtonText', e.target.value)}
                    className="mt-1"
                    placeholder="Get Mores!"
                  />
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div>
              <Label>Copyright Text</Label>
              <Input
                value={section.content.copyright || ''}
                onChange={(e) => onUpdate('copyright', e.target.value)}
                className="mt-2"
                placeholder={`© ${new Date().getFullYear()} All rights reserved.`}
              />
            </div>
          </div>
        );
      
      case 'privacy':
      case 'terms':
        return (
          <div className="space-y-4">
            <div>
              <Label>Last Updated Date</Label>
              <Input
                type="date"
                value={section.content.lastUpdated || ''}
                onChange={(e) => onUpdate('lastUpdated', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={section.content.content || ''}
                onChange={(e) => onUpdate('content', e.target.value)}
                className="mt-2"
                rows={15}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-slate-500">
            Select a section to edit its properties
          </div>
        );
    }
  };

  return <div>{renderFieldEditor()}</div>;
};

// Template Preview Component
const TemplatePreview: React.FC<{ 
  template: SavedTemplate;
  editMode?: boolean;
  onUpdate?: (sectionId: string, field: string, value: any) => void;
  editingElement?: string | null;
  setEditingElement?: (id: string | null) => void;
}> = ({ template, editMode = false, onUpdate, editingElement, setEditingElement }) => {
  return (
    <div className="template-preview overflow-x-hidden w-full">
      {template.customizedSections
        .filter(section => section.type !== 'privacy' && section.type !== 'terms') // Don't render privacy/terms as full sections - only accessible via footer links
        .map(section => (
        <div key={section.id} id={section.id} className="section-preview">
            {renderSectionPreview(section, editMode, onUpdate, editingElement, setEditingElement, template, undefined)}
        </div>
      ))}
    </div>
  );
};

const renderSectionPreview = (
  section: TemplateSection, 
  editMode: boolean = false,
  onUpdate?: (sectionId: string, field: string, value: any) => void,
  editingElement?: string | null,
  setEditingElement?: (id: string | null) => void,
  template?: SavedTemplate,
  onPolicyLinkClick?: (type: 'privacy' | 'terms') => void
) => {
  const handleTextEdit = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate(section.id, field, value);
    }
  };

  const handleImageChange = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to data URL for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (onUpdate) {
        onUpdate(section.id, field, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  switch (section.type) {
    case 'hero':
      return (
        <section 
          className="relative min-h-[450px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center text-white overflow-x-hidden"
          style={{
            backgroundImage: `url(${section.content.backgroundImage || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Gradient Overlay - matches template.html */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3))'
            }}
          />
          
          {/* Background Image Editor */}
          {editMode && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
              <label className="bg-white/90 text-slate-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg cursor-pointer hover:bg-white text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shadow-lg">
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Change Image</span>
                <span className="sm:hidden">Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange('backgroundImage', e)}
                />
              </label>
            </div>
          )}
          
          {/* Hero Content - matches template.html structure */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-5 md:px-6 py-6 sm:py-8 md:py-10 text-center">
            {editMode ? (
              <>
                <h1 
                  contentEditable
                  suppressContentEditableWarning
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-3 sm:mb-4 text-white outline-none hover:outline-2 hover:outline-white hover:outline-dashed rounded px-2 py-1 cursor-text leading-tight"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                  onBlur={(e) => handleTextEdit('heading', e.currentTarget.textContent || '')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                >
                  {section.content.heading}
                </h1>
                <p 
                  contentEditable
                  suppressContentEditableWarning
                  className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-white outline-none hover:outline-2 hover:outline-white hover:outline-dashed rounded px-2 py-1 cursor-text leading-relaxed"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                  onBlur={(e) => handleTextEdit('subheading', e.currentTarget.textContent || '')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                >
                  {section.content.subheading}
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
                  <a 
                    href="#contact"
                    contentEditable
                    suppressContentEditableWarning
                    className="px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all hover:shadow-lg hover:-translate-y-0.5 outline-none hover:outline-2 hover:outline-white hover:outline-dashed cursor-text min-h-[44px] flex items-center justify-center"
                    onBlur={(e) => handleTextEdit('ctaText', e.currentTarget.textContent || '')}
                  >
                {section.content.ctaText}
                  </a>
                  <a 
                    href={`tel:${section.content.ctaPhoneNumber || section.content.ctaPhone || ''}`}
                    contentEditable
                    suppressContentEditableWarning
                    className="px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg bg-white hover:bg-slate-100 text-indigo-600 transition-all hover:shadow-lg hover:-translate-y-0.5 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed cursor-text min-h-[44px] flex items-center justify-center"
                    onBlur={(e) => {
                      const text = e.currentTarget.textContent || '';
                      const phone = text.replace('📞', '').trim();
                      handleTextEdit('ctaPhoneDisplay', phone);
                    }}
                  >
                📞 {section.content.ctaPhoneDisplay || section.content.ctaPhone || ''}
                  </a>
            </div>
              </>
            ) : (
              <>
                <h1 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-3 sm:mb-4 text-white leading-tight"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {section.content.heading}
                </h1>
                <p 
                  className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-white leading-relaxed"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {section.content.subheading}
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
                  <a 
                    href="#contact"
                    className="px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all hover:shadow-lg hover:-translate-y-0.5 min-h-[44px] flex items-center justify-center"
                  >
                    {section.content.ctaText}
                  </a>
                  <a 
                    href={`tel:${section.content.ctaPhoneNumber || section.content.ctaPhone || ''}`}
                    className="px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg bg-white hover:bg-slate-100 text-indigo-600 transition-all hover:shadow-lg hover:-translate-y-0.5 min-h-[44px] flex items-center justify-center"
                  >
                    📞 {section.content.ctaPhoneDisplay || section.content.ctaPhone || ''}
                  </a>
          </div>
              </>
            )}
        </div>
        </section>
      );
    
    case 'features':
      return (
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-5 md:px-6 bg-slate-50" id="features">
          <div className="max-w-6xl mx-auto">
            {editMode ? (
              <h2 
                contentEditable
                suppressContentEditableWarning
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-slate-900 outline-none hover:outline-3 hover:outline-indigo-500 hover:outline-dashed rounded px-2 py-1 cursor-text hover:bg-indigo-50/50 transition-all"
                onBlur={(e) => handleTextEdit('heading', e.currentTarget.textContent || '')}
              >
                {section.content.heading}
              </h2>
            ) : (
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-slate-900">
                {section.content.heading}
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {section.content.features?.map((feature: any, idx: number) => (
                <div 
                  key={idx} 
                  className="bg-white p-4 sm:p-6 md:p-8 rounded-xl text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  {editMode ? (
                    <>
                      <div 
                        contentEditable
                        suppressContentEditableWarning
                        className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded cursor-text"
                        onBlur={(e) => {
                          if (onUpdate) {
                            const newFeatures = [...(section.content.features || [])];
                            newFeatures[idx] = { ...newFeatures[idx], icon: e.currentTarget.textContent || '' };
                            onUpdate(section.id, 'features', newFeatures);
                          }
                        }}
                      >
                        {feature.icon}
                      </div>
                      <h3 
                        contentEditable
                        suppressContentEditableWarning
                        className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-indigo-600 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                        onBlur={(e) => {
                          if (onUpdate) {
                            const newFeatures = [...(section.content.features || [])];
                            newFeatures[idx] = { ...newFeatures[idx], title: e.currentTarget.textContent || '' };
                            onUpdate(section.id, 'features', newFeatures);
                          }
                        }}
                      >
                        {feature.title}
                      </h3>
                      <p 
                        contentEditable
                        suppressContentEditableWarning
                        className="text-sm sm:text-base text-slate-600 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                        onBlur={(e) => {
                          if (onUpdate) {
                            const newFeatures = [...(section.content.features || [])];
                            newFeatures[idx] = { ...newFeatures[idx], description: e.currentTarget.textContent || '' };
                            onUpdate(section.id, 'features', newFeatures);
                          }
                        }}
                      >
                        {feature.description}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">{feature.icon}</div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-indigo-600">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600">{feature.description}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    
    case 'services':
      return (
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-5 md:px-6 bg-white overflow-x-hidden" id="services">
          <div className="max-w-6xl mx-auto">
            {editMode ? (
              <>
                <h2 
                  contentEditable
                  suppressContentEditableWarning
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 sm:mb-4 text-slate-900 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text"
                  onBlur={(e) => handleTextEdit('heading', e.currentTarget.textContent || '')}
                >
                  {section.content.heading}
                </h2>
            {section.content.subheading && (
                  <p 
                    contentEditable
                    suppressContentEditableWarning
                    className="text-center text-slate-600 mb-8 sm:mb-10 md:mb-12 text-base sm:text-lg md:text-xl outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text"
                    onBlur={(e) => handleTextEdit('subheading', e.currentTarget.textContent || '')}
                  >
                    {section.content.subheading}
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 sm:mb-4 text-slate-900">
                  {section.content.heading}
                </h2>
                {section.content.subheading && (
                  <p className="text-center text-slate-600 mb-8 sm:mb-10 md:mb-12 text-base sm:text-lg md:text-xl">
                    {section.content.subheading}
                  </p>
                )}
              </>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {section.content.services?.map((service: any, idx: number) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group relative"
                >
                  {editMode && service.image && (
                    <div className="absolute top-2 right-2 z-10">
                      <label className="bg-white/90 text-slate-700 px-2 py-1 rounded text-xs cursor-pointer hover:bg-white shadow-lg flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file || !onUpdate) return;
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              const newServices = [...(section.content.services || [])];
                              newServices[idx] = { ...newServices[idx], image: dataUrl };
                              onUpdate(section.id, 'services', newServices);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  )}
                  {service.image ? (
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-64 md:h-80 object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-64 md:h-80 bg-slate-200 flex items-center justify-center"><span class="text-4xl">📷</span></div>';
                      }}
                    />
                  ) : editMode ? (
                    <label className="w-full h-64 md:h-80 flex items-center justify-center bg-slate-100 hover:bg-slate-200 cursor-pointer">
                      <span className="text-slate-600 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Add Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file || !onUpdate) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string;
                            const newServices = [...(section.content.services || [])];
                            newServices[idx] = { ...newServices[idx], image: dataUrl };
                            onUpdate(section.id, 'services', newServices);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  ) : (
                    <div className="w-full h-64 md:h-80 bg-slate-200 flex items-center justify-center">
                      <span className="text-6xl opacity-50">📷</span>
                    </div>
                  )}
                  <div className="p-6">
                    {editMode ? (
                      <>
                        <h3 
                          contentEditable
                          suppressContentEditableWarning
                          className="text-xl font-semibold mb-2 text-slate-900 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                          onBlur={(e) => {
                            if (onUpdate) {
                              const newServices = [...(section.content.services || [])];
                              newServices[idx] = { ...newServices[idx], title: e.currentTarget.textContent || '' };
                              onUpdate(section.id, 'services', newServices);
                            }
                          }}
                        >
                          {service.title}
                        </h3>
                        <p 
                          contentEditable
                          suppressContentEditableWarning
                          className="text-slate-600 mb-4 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                          onBlur={(e) => {
                            if (onUpdate) {
                              const newServices = [...(section.content.services || [])];
                              newServices[idx] = { ...newServices[idx], description: e.currentTarget.textContent || '' };
                              onUpdate(section.id, 'services', newServices);
                            }
                          }}
                        >
                          {service.description}
                        </p>
                        {service.price && (
                          <p 
                            contentEditable
                            suppressContentEditableWarning
                            className="text-indigo-600 font-bold text-lg outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                            onBlur={(e) => {
                              if (onUpdate) {
                                const newServices = [...(section.content.services || [])];
                                newServices[idx] = { ...newServices[idx], price: e.currentTarget.textContent || '' };
                                onUpdate(section.id, 'services', newServices);
                              }
                            }}
                          >
                            {service.price}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                    <h3 className="text-xl font-semibold mb-2 text-slate-900">{service.title}</h3>
                    <p className="text-slate-600 mb-4">{service.description}</p>
                    {service.price && (
                          <p className="text-indigo-600 font-bold text-lg">{service.price}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    
    case 'testimonials':
      return (
        <section className="py-20 px-5 bg-slate-50" id="testimonials">
          <div className="max-w-6xl mx-auto">
            {editMode ? (
              <h2 
                contentEditable
                suppressContentEditableWarning
                  className="text-4xl md:text-5xl font-bold text-center mb-12 text-slate-900 outline-none hover:outline-3 hover:outline-indigo-500 hover:outline-dashed rounded px-2 py-1 cursor-text hover:bg-indigo-50/50 transition-all"
                onBlur={(e) => handleTextEdit('heading', e.currentTarget.textContent || '')}
              >
                {section.content.heading}
              </h2>
            ) : (
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-slate-900">
                {section.content.heading}
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.content.testimonials?.map((testimonial: any, idx: number) => (
                <div 
                  key={idx} 
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all"
                >
                  <div className="flex items-center mb-4">
                    {testimonial.avatar ? (
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                      />
                    ) : editMode ? (
                      <label className="w-12 h-12 rounded-full mr-4 bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-300">
                        <ImageIcon className="w-4 h-4 text-slate-600" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file || !onUpdate) return;
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              const newTestimonials = [...(section.content.testimonials || [])];
                              newTestimonials[idx] = { ...newTestimonials[idx], avatar: dataUrl };
                              onUpdate(section.id, 'testimonials', newTestimonials);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    ) : (
                      <div className="w-12 h-12 rounded-full mr-4 bg-slate-200" />
                    )}
                    <div className="flex-1">
                      {editMode ? (
                        <>
                          <h4 
                            contentEditable
                            suppressContentEditableWarning
                            className="font-semibold text-slate-900 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                            onBlur={(e) => {
                              if (onUpdate) {
                                const newTestimonials = [...(section.content.testimonials || [])];
                                newTestimonials[idx] = { ...newTestimonials[idx], name: e.currentTarget.textContent || '' };
                                onUpdate(section.id, 'testimonials', newTestimonials);
                              }
                            }}
                          >
                            {testimonial.name}
                          </h4>
                          {testimonial.company && (
                            <p 
                              contentEditable
                              suppressContentEditableWarning
                              className="text-sm text-slate-600 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                              onBlur={(e) => {
                                if (onUpdate) {
                                  const newTestimonials = [...(section.content.testimonials || [])];
                                  newTestimonials[idx] = { ...newTestimonials[idx], company: e.currentTarget.textContent || '' };
                                  onUpdate(section.id, 'testimonials', newTestimonials);
                                }
                              }}
                            >
                              {testimonial.company}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                      <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                      {testimonial.company && (
                        <p className="text-sm text-slate-600">{testimonial.company}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {testimonial.rating && (
                    <div className="flex mb-3 text-yellow-400 text-lg">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < testimonial.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  )}
                  {editMode ? (
                    <p 
                      contentEditable
                      suppressContentEditableWarning
                      className="text-slate-700 italic outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                      onBlur={(e) => {
                        if (onUpdate) {
                          const newTestimonials = [...(section.content.testimonials || [])];
                          newTestimonials[idx] = { ...newTestimonials[idx], text: e.currentTarget.textContent?.replace(/"/g, '') || '' };
                          onUpdate(section.id, 'testimonials', newTestimonials);
                        }
                      }}
                    >
                      "{testimonial.text}"
                    </p>
                  ) : (
                  <p className="text-slate-700 italic">"{testimonial.text}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    
    case 'cta':
      return (
        <section 
          className="py-20 px-5 text-white text-center"
          id="contact"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)'
          }}
        >
          <div className="max-w-4xl mx-auto">
            {editMode ? (
              <>
                <h2 
                  contentEditable
                  suppressContentEditableWarning
                  className="text-4xl md:text-5xl font-bold mb-4 outline-none hover:outline-2 hover:outline-white hover:outline-dashed rounded px-2 py-1 cursor-text"
                  onBlur={(e) => handleTextEdit('heading', e.currentTarget.textContent || '')}
                >
                  {section.content.heading}
                </h2>
            {section.content.subheading && (
                  <p 
                    contentEditable
                    suppressContentEditableWarning
                    className="text-xl md:text-2xl mb-8 opacity-90 outline-none hover:outline-2 hover:outline-white hover:outline-dashed rounded px-2 py-1 cursor-text"
                    onBlur={(e) => handleTextEdit('subheading', e.currentTarget.textContent || '')}
                  >
                    {section.content.subheading}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 justify-center items-center mb-8">
              {(section.content.phoneNumber || section.content.phone) && (
                <a 
                  href={`tel:${section.content.phoneNumber || section.content.phone || ''}`}
                      contentEditable
                      suppressContentEditableWarning
                      className="px-8 py-4 text-lg font-semibold rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed cursor-text"
                      onBlur={(e) => {
                        const text = e.currentTarget.textContent || '';
                        const phone = text.replace('📞', '').replace(section.content.ctaText || 'Call Now', '').trim();
                        handleTextEdit('phoneDisplay', phone);
                      }}
                >
                  📞 {section.content.ctaText || 'Call Now'} {section.content.phoneDisplay || section.content.phone || ''}
                </a>
              )}
              {section.content.email && (
                <a 
                  href={`mailto:${section.content.email}`}
                      contentEditable
                      suppressContentEditableWarning
                      className="px-8 py-4 text-lg font-semibold rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 transition-all hover:shadow-lg hover:-translate-y-0.5 outline-none hover:outline-2 hover:outline-white hover:outline-dashed cursor-text"
                      onBlur={(e) => {
                        const text = e.currentTarget.textContent || '';
                        const email = text.replace('✉️ Email Us', '').trim();
                        handleTextEdit('email', email);
                      }}
                >
                  ✉️ Email Us
                </a>
              )}
            </div>
            {section.content.hours && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <span>🕐</span>
                    <p 
                      contentEditable
                      suppressContentEditableWarning
                      className="opacity-90 outline-none hover:outline-2 hover:outline-white hover:outline-dashed rounded px-2 py-1 cursor-text"
                      onBlur={(e) => handleTextEdit('hours', e.currentTarget.textContent || '')}
                    >
                      {section.content.hours}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {section.content.heading}
                </h2>
                {section.content.subheading && (
                  <p className="text-xl md:text-2xl mb-8 opacity-90">
                    {section.content.subheading}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 justify-center items-center mb-8">
                  {(section.content.phoneNumber || section.content.phone) && (
                    <a 
                      href={`tel:${section.content.phoneNumber || section.content.phone || ''}`}
                      className="px-8 py-4 text-lg font-semibold rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      📞 {section.content.ctaText || 'Call Now'} {section.content.phoneDisplay || section.content.phone || ''}
                    </a>
                  )}
                  {section.content.email && (
                    <a 
                      href={`mailto:${section.content.email}`}
                      className="px-8 py-4 text-lg font-semibold rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      ✉️ Email Us
                    </a>
            )}
          </div>
                {section.content.hours && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <span>🕐</span>
                    <p className="opacity-90">{section.content.hours}</p>
        </div>
                )}
              </>
            )}
          </div>
        </section>
      );
    
    case 'about':
      return (
        <section className="py-20 px-5 bg-gradient-to-b from-white via-slate-50 to-white" id="about">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Content */}
              <div>
                {editMode ? (
                  <>
                    <h2 
                      contentEditable
                      suppressContentEditableWarning
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-slate-900 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text break-words"
                      onBlur={(e) => handleTextEdit('heading', e.currentTarget.textContent || '')}
                    >
                      {section.content.heading || 'About Our Company'}
                    </h2>
                    {section.content.subheading && (
                      <p 
                        contentEditable
                        suppressContentEditableWarning
                        className="text-lg sm:text-xl text-indigo-600 font-semibold mb-4 sm:mb-6 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text break-words"
                        onBlur={(e) => handleTextEdit('subheading', e.currentTarget.textContent || '')}
                      >
                        {section.content.subheading}
                      </p>
                    )}
                    {section.content.description && (
                      <p 
                        contentEditable
                        suppressContentEditableWarning
                        className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text break-words"
                        onBlur={(e) => handleTextEdit('description', e.currentTarget.textContent || '')}
                      >
                        {section.content.description}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-slate-900 break-words">
                      {section.content.heading || 'About Our Company'}
                    </h2>
                    {section.content.subheading && (
                      <p className="text-lg sm:text-xl text-indigo-600 font-semibold mb-4 sm:mb-6 break-words">
                        {section.content.subheading}
                      </p>
                    )}
                    {section.content.description && (
                      <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed break-words">
                        {section.content.description}
                      </p>
                    )}
                  </>
                )}
                
                {/* Stats */}
                {section.content.stats && section.content.stats.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {section.content.stats.map((stat: any, idx: number) => (
                      <div key={idx} className="text-center">
                        {editMode ? (
                          <>
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1 sm:mb-2 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text break-words"
                              onBlur={(e) => {
                                if (onUpdate) {
                                  const newStats = [...(section.content.stats || [])];
                                  newStats[idx] = { ...newStats[idx], number: e.currentTarget.textContent || '' };
                                  onUpdate(section.id, 'stats', newStats);
                                }
                              }}
                            >
                              {stat.number}
                            </div>
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              className="text-sm text-slate-600 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                              onBlur={(e) => {
                                if (onUpdate) {
                                  const newStats = [...(section.content.stats || [])];
                                  newStats[idx] = { ...newStats[idx], label: e.currentTarget.textContent || '' };
                                  onUpdate(section.id, 'stats', newStats);
                                }
                              }}
                            >
                              {stat.label}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1 sm:mb-2 break-words">{stat.number}</div>
                            <div className="text-xs sm:text-sm text-slate-600 break-words">{stat.label}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Values */}
                {section.content.values && section.content.values.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {section.content.values.map((value: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-4">
                        <span className="text-3xl flex-shrink-0">{value.icon || '✓'}</span>
                        <div>
                          {editMode ? (
                            <>
                              <h3
                                contentEditable
                                suppressContentEditableWarning
                                className="font-semibold text-slate-900 mb-1 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                                onBlur={(e) => {
                                  if (onUpdate) {
                                    const newValues = [...(section.content.values || [])];
                                    newValues[idx] = { ...newValues[idx], title: e.currentTarget.textContent || '' };
                                    onUpdate(section.id, 'values', newValues);
                                  }
                                }}
                              >
                                {value.title}
                              </h3>
                              <p
                                contentEditable
                                suppressContentEditableWarning
                                className="text-sm text-slate-600 outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-1 cursor-text"
                                onBlur={(e) => {
                                  if (onUpdate) {
                                    const newValues = [...(section.content.values || [])];
                                    newValues[idx] = { ...newValues[idx], description: e.currentTarget.textContent || '' };
                                    onUpdate(section.id, 'values', newValues);
                                  }
                                }}
                              >
                                {value.description}
                              </p>
                            </>
                          ) : (
                            <>
                              <h3 className="font-semibold text-slate-900 mb-1">{value.title}</h3>
                              <p className="text-sm text-slate-600">{value.description}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Right side - Image */}
              <div>
                {section.content.image ? (
                  <img 
                    src={section.content.image} 
                    alt="About us"
                    className="w-full rounded-xl shadow-2xl object-cover"
                    style={{ minHeight: '400px' }}
                  />
                ) : editMode ? (
                  <div className="w-full bg-slate-200 rounded-xl flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <span className="text-slate-400 text-lg">Add an image</span>
                  </div>
                ) : (
                  <div className="w-full bg-slate-200 rounded-xl flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <span className="text-6xl opacity-50">📷</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    
    case 'footer':
      const socialIcons = [
        { name: 'Facebook', icon: 'f', href: '#' },
        { name: 'Google+', icon: 'g+', href: '#' },
        { name: 'YouTube', icon: '▶', href: '#' },
        { name: 'Dribbble', icon: 'b', href: '#' },
        { name: 'LinkedIn', icon: 'in', href: '#' },
        { name: 'Twitter', icon: '🐦', href: '#' },
        { name: 'RSS', icon: 'S', href: '#' },
        { name: 'Pinterest', icon: 'P', href: '#' }
      ];
      
      return (
        <footer className="bg-slate-900 text-white py-8 sm:py-10 md:py-12 px-4 sm:px-5 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {/* Contact us Column */}
              <div>
                <h4 className="text-white font-bold mb-4 text-lg">
                  {editMode ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      className="outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text block"
                      onBlur={(e) => handleTextEdit('contactTitle', e.currentTarget.textContent || 'Contact us')}
                    >
                      {section.content.contactTitle || 'Contact us'}
                    </span>
                  ) : (
                    section.content.contactTitle || 'Contact us'
                  )}
                </h4>
                <div className="space-y-2 text-slate-300 text-sm">
                  {section.content.address && (
                    <p className="flex items-start gap-2">
                      <span>📍</span>
                      {editMode ? (
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className="outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text flex-1"
                          onBlur={(e) => {
                            const text = e.currentTarget.textContent || '';
                            const address = text.replace('📍', '').trim();
                            handleTextEdit('address', address);
                          }}
                        >
                          {section.content.address}
                        </span>
                      ) : (
                        <span>{section.content.address}</span>
                      )}
                    </p>
                  )}
                  {section.content.phone && (
                    <p className="flex items-center gap-2">
                      <span>📞</span>
                      {editMode ? (
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className="outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text"
                          onBlur={(e) => {
                            const text = e.currentTarget.textContent || '';
                            handleTextEdit('phone', text);
                          }}
                        >
                          {section.content.phone}
                        </span>
                      ) : (
                        <a href={`tel:${section.content.phone}`} className="hover:text-indigo-300 transition-colors">
                          {section.content.phone}
                        </a>
                      )}
                    </p>
                  )}
                  {section.content.email && (
                    <p className="flex items-center gap-2">
                      <span>✉️</span>
                      {editMode ? (
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className="outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text"
                          onBlur={(e) => {
                            const text = e.currentTarget.textContent || '';
                            handleTextEdit('email', text);
                          }}
                        >
                          {section.content.email}
                        </span>
                      ) : (
                        <a href={`mailto:${section.content.email}`} className="hover:text-indigo-300 transition-colors">
                          {section.content.email}
                        </a>
                      )}
                    </p>
                  )}
                  {section.content.skype && (
                    <p className="flex items-center gap-2">
                      <span>💬</span>
                      {editMode ? (
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className="outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text"
                          onBlur={(e) => {
                            const text = e.currentTarget.textContent || '';
                            handleTextEdit('skype', text);
                          }}
                        >
                          {section.content.skype}
                        </span>
                      ) : (
                        <a href={`skype:${section.content.skype}?chat`} className="hover:text-indigo-300 transition-colors">
                          {section.content.skype}
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Mailing list Column */}
              <div>
                <h4 className="text-white font-bold mb-4 text-lg">
                  {editMode ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      className="outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text block"
                      onBlur={(e) => handleTextEdit('mailingListTitle', e.currentTarget.textContent || 'Mailing list')}
                    >
                      {section.content.mailingListTitle || 'Mailing list'}
                    </span>
                  ) : (
                    section.content.mailingListTitle || 'Mailing list'
                  )}
                </h4>
                {section.content.mailingListDescription && (
                  <p className="text-slate-300 text-sm mb-4">
                    {editMode ? (
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        className="outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text block"
                        onBlur={(e) => handleTextEdit('mailingListDescription', e.currentTarget.textContent || '')}
                      >
                        {section.content.mailingListDescription}
                      </span>
                    ) : (
                      section.content.mailingListDescription
                    )}
                  </p>
                )}
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Your email address..."
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 flex-1"
                    value={section.content.mailingListEmail || ''}
                    onChange={(e) => handleTextEdit('mailingListEmail', e.target.value)}
                    disabled={!editMode}
                  />
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4"
                    onClick={() => {
                      if (!editMode && section.content.mailingListEmail) {
                        // Handle mailing list subscription
                        console.log('Subscribe:', section.content.mailingListEmail);
                      }
                    }}
                  >
                    Go!
                  </Button>
                </div>
              </div>
              
              {/* Follow us Column */}
              <div>
                <h4 className="text-white font-bold mb-4 text-lg">
                  {editMode ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      className="outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text block"
                      onBlur={(e) => handleTextEdit('followUsTitle', e.currentTarget.textContent || 'Follow us')}
                    >
                      {section.content.followUsTitle || 'Follow us'}
                    </span>
                  ) : (
                    section.content.followUsTitle || 'Follow us'
                  )}
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {(section.content.socialIcons || socialIcons).map((icon: any, idx: number) => (
                    <a
                      key={idx}
                      href={icon.href || '#'}
                      className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-white hover:bg-indigo-600 hover:border-indigo-500 transition-colors text-sm font-semibold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {icon.icon || icon.name?.[0] || '?'}
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Latest News Column */}
              <div>
                <h4 className="text-white font-bold mb-4 text-lg">
                  {editMode ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      className="outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text block"
                      onBlur={(e) => handleTextEdit('latestNewsTitle', e.currentTarget.textContent || 'Latest News')}
                    >
                      {section.content.latestNewsTitle || 'Latest News'}
                    </span>
                  ) : (
                    section.content.latestNewsTitle || 'Latest News'
                  )}
                </h4>
                {section.content.latestNewsDescription && (
                  <p className="text-slate-300 text-sm mb-4">
                    {editMode ? (
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        className="outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text block"
                        onBlur={(e) => handleTextEdit('latestNewsDescription', e.currentTarget.textContent || '')}
                      >
                        {section.content.latestNewsDescription}
                      </span>
                    ) : (
                      section.content.latestNewsDescription
                    )}
                  </p>
                )}
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                  onClick={() => {
                    if (!editMode) {
                      // Handle latest news action
                      console.log('Get more news');
                    }
                  }}
                >
                  {section.content.latestNewsButtonText || 'Get Mores!'}
                </Button>
              </div>
            </div>
            
            {/* Footer Bottom - Copyright */}
            <div className="pt-8 mt-8 border-t border-slate-700 text-center">
              {editMode ? (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="text-slate-400 text-sm outline-none hover:outline-2 hover:outline-indigo-400 hover:outline-dashed rounded px-2 py-1 cursor-text"
                  onBlur={(e) => handleTextEdit('copyright', e.currentTarget.textContent || '')}
                >
                  {section.content.copyright || `© ${new Date().getFullYear()} All rights reserved.`}
                </p>
              ) : (
                <p className="text-slate-400 text-sm">
                  {section.content.copyright || `© ${new Date().getFullYear()} All rights reserved.`}
                </p>
              )}
            </div>
          </div>
        </footer>
      );
    
    case 'privacy':
      // Parse markdown-like content for better display
      const parsePrivacyContent = (text: string) => {
        if (!text) return '';
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        let inList = false;
        let listItems: string[] = [];
        
        const flushList = () => {
          if (listItems.length > 0) {
            elements.push(
              <ul key={`list-${elements.length}`} className="ml-6 mb-4 list-disc space-y-2">
                {listItems.map((item, itemIdx) => {
                  // Handle bold text in list items
                  const parts = item.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <li key={itemIdx} className="text-slate-700 leading-relaxed">
                      {parts.map((part, partIdx) => 
                        part.startsWith('**') && part.endsWith('**') ? (
                          <strong key={partIdx} className="font-semibold">{part.replace(/\*\*/g, '')}</strong>
                        ) : (
                          <span key={partIdx}>{part}</span>
                        )
                      )}
                    </li>
                  );
                })}
              </ul>
            );
            listItems = [];
            inList = false;
          }
        };
        
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            flushList();
            if (idx < lines.length - 1) elements.push(<br key={`br-${idx}`} />);
            return;
          }
          
          if (trimmed.startsWith('## ')) {
            flushList();
            elements.push(<h2 key={idx} className="text-2xl font-semibold mt-8 mb-4 text-slate-900">{trimmed.replace(/^##\s+/, '')}</h2>);
          } else if (trimmed.startsWith('### ')) {
            flushList();
            elements.push(<h3 key={idx} className="text-xl font-semibold mt-6 mb-3 text-slate-900">{trimmed.replace(/^###\s+/, '')}</h3>);
          } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            if (!inList) flushList();
            inList = true;
            listItems.push(trimmed.replace(/^[*\-]\s+/, ''));
          } else {
            flushList();
            // Handle bold text in paragraphs
            const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
            elements.push(
              <p key={idx} className="mb-4 text-slate-700 leading-relaxed">
                {parts.map((part, partIdx) => 
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={partIdx} className="font-semibold text-slate-900">{part.replace(/\*\*/g, '')}</strong>
                  ) : (
                    <span key={partIdx}>{part}</span>
                  )
                )}
              </p>
            );
          }
        });
        flushList();
        return elements;
      };

      return (
        <div className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-slate-900 leading-tight">Privacy Policy</h1>
            {section.content.lastUpdated && (
              <p className="text-slate-600 mb-8 text-base">Last Updated: {section.content.lastUpdated}</p>
            )}
            <div className="text-slate-700 leading-relaxed">
              {parsePrivacyContent(section.content.content || '')}
            </div>
          </div>
        </div>
      );
    
    case 'terms':
      // Parse markdown-like content for better display
      const parseTermsContent = (text: string) => {
        if (!text) return '';
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        let inList = false;
        let listItems: string[] = [];
        
        const flushList = () => {
          if (listItems.length > 0) {
            elements.push(
              <ul key={`list-${elements.length}`} className="ml-6 mb-4 list-disc space-y-2">
                {listItems.map((item, itemIdx) => {
                  // Handle bold text in list items
                  const parts = item.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <li key={itemIdx} className="text-slate-700 leading-relaxed">
                      {parts.map((part, partIdx) => 
                        part.startsWith('**') && part.endsWith('**') ? (
                          <strong key={partIdx} className="font-semibold">{part.replace(/\*\*/g, '')}</strong>
                        ) : (
                          <span key={partIdx}>{part}</span>
                        )
                      )}
                    </li>
                  );
                })}
              </ul>
            );
            listItems = [];
            inList = false;
          }
        };
        
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            flushList();
            if (idx < lines.length - 1) elements.push(<br key={`br-${idx}`} />);
            return;
          }
          
          if (trimmed.startsWith('## ')) {
            flushList();
            elements.push(<h2 key={idx} className="text-2xl font-semibold mt-8 mb-4 text-slate-900">{trimmed.replace(/^##\s+/, '')}</h2>);
          } else if (trimmed.startsWith('### ')) {
            flushList();
            elements.push(<h3 key={idx} className="text-xl font-semibold mt-6 mb-3 text-slate-900">{trimmed.replace(/^###\s+/, '')}</h3>);
          } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            if (!inList) flushList();
            inList = true;
            listItems.push(trimmed.replace(/^[*\-]\s+/, ''));
          } else {
            flushList();
            // Handle bold text in paragraphs
            const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
            elements.push(
              <p key={idx} className="mb-4 text-slate-700 leading-relaxed">
                {parts.map((part, partIdx) => 
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={partIdx} className="font-semibold text-slate-900">{part.replace(/\*\*/g, '')}</strong>
                  ) : (
                    <span key={partIdx}>{part}</span>
                  )
                )}
              </p>
            );
          }
        });
        flushList();
        return elements;
      };

      return (
        <div className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-slate-900 leading-tight">Terms of Service</h1>
            {section.content.lastUpdated && (
              <p className="text-slate-600 mb-8 text-base">Last Updated: {section.content.lastUpdated}</p>
            )}
            <div className="text-slate-700 leading-relaxed">
              {parseTermsContent(section.content.content || '')}
            </div>
          </div>
        </div>
      );
    
    default:
      return <div className="p-8 text-slate-500">Section preview: {section.title}</div>;
  }
};



