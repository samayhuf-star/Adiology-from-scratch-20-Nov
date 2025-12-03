// Complete library of professional website templates for local services
// All templates include Google Ads compliance (Privacy Policy, Terms of Service)

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  color: string;
  sections: TemplateSection[];
}

export interface TemplateSection {
  id: string;
  type: 'hero' | 'features' | 'services' | 'testimonials' | 'cta' | 'footer' | 'privacy' | 'terms';
  title: string;
  content: any;
}

const currentDate = new Date().toISOString().split('T')[0];

// Base Privacy Policy (same for all)
const basePrivacyPolicy = {
  lastUpdated: currentDate,
  content: `
# Privacy Policy

Last Updated: ${currentDate}

## Introduction
We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.

## Information We Collect
- **Contact Information**: Name, email address, phone number, service address
- **Usage Data**: How you interact with our website and services
- **Technical Data**: IP address, browser type, device information
- **Communication Data**: Records of your communications with us
- **Service Data**: Details about services requested and provided

## How We Use Your Information
- To provide and improve our services
- To respond to your inquiries and service requests
- To schedule appointments and send reminders
- To send important updates and notifications
- To process payments securely
- To comply with legal obligations
- To detect and prevent fraud

## Data Security
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment information is encrypted and processed through secure payment gateways.

## Third-Party Services
We may use third-party services for:
- Google Analytics for website analytics
- Google Ads for advertising
- Payment processors for secure transactions
- Scheduling systems for appointments
- Email services for communications

## Your Rights
You have the right to:
- Access your personal data
- Request correction of inaccurate data
- Request deletion of your data
- Opt-out of marketing communications
- Lodge a complaint with supervisory authorities

## Cookies
We use cookies to enhance your browsing experience. You can control cookie preferences through your browser settings.

## Data Retention
We retain your personal information only as long as necessary for the purposes outlined in this policy or as required by law.

## Children's Privacy
Our services are not directed to children under 13. We do not knowingly collect information from children.

## Changes to This Policy
We may update this Privacy Policy periodically. We will notify you of significant changes via email or website notice.

## Contact Us
If you have questions about this Privacy Policy, please contact us:
- Email: privacy@yourcompany.com
- Phone: 1-800-123-4567
- Address: 123 Business St, City, State 12345
  `
};

// Base Terms of Service (same for all)
const baseTermsOfService = {
  lastUpdated: currentDate,
  content: `
# Terms of Service

Last Updated: ${currentDate}

## Agreement to Terms
By accessing or using our services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.

## Service Description
We provide professional services as described on our website. Service details, pricing, and availability are subject to change without notice. All services are subject to availability and scheduling.

## User Obligations
You agree to:
- Provide accurate and complete information
- Maintain the confidentiality of your account
- Use our services in compliance with applicable laws
- Not engage in fraudulent or harmful activities
- Allow safe access to service locations
- Be present during scheduled appointments

## Payment Terms
- All prices are in USD unless otherwise stated
- Payment is due upon completion of services or as agreed
- We accept major credit cards, debit cards, and other payment methods
- Service quotes are estimates and may vary based on actual work required
- Refunds are handled on a case-by-case basis per our refund policy

## Service Guarantee
We stand behind our services with a satisfaction guarantee. If you're not satisfied, contact us within 30 days for resolution. Warranty details vary by service type.

## Cancellation Policy
- Cancellations must be made at least 24 hours in advance
- Late cancellations may be subject to a cancellation fee
- Emergency cancellations will be evaluated case-by-case

## Limitation of Liability
To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.

## Intellectual Property
All content on this website, including text, graphics, logos, and software, is our property and protected by copyright and trademark laws.

## Insurance and Licensing
We maintain appropriate insurance coverage and all required licenses for the services we provide. Proof of insurance available upon request.

## Disclaimer of Warranties
Our services are provided "as is" without warranties of any kind, either express or implied. We do not warrant that services will be uninterrupted or error-free.

## Indemnification
You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of our services or violation of these terms.

## Termination
We reserve the right to terminate or suspend access to our services immediately, without prior notice, for any violation of these Terms.

## Governing Law
These Terms are governed by the laws of [Your State/Country], without regard to conflict of law principles.

## Dispute Resolution
Any disputes arising from these Terms will be resolved through binding arbitration in accordance with applicable arbitration rules.

## Severability
If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.

## Entire Agreement
These Terms constitute the entire agreement between you and us regarding our services.

## Contact Information
For questions about these Terms, contact us:
- Email: legal@yourcompany.com
- Phone: 1-800-123-4567
- Address: 123 Business St, City, State 12345
  `
};

// Template Library
export const templateLibrary: Template[] = [
  // 1. PLUMBING SERVICES
  {
    id: 'plumbing-1',
    name: 'Professional Plumbing Services',
    description: '24/7 Emergency plumbing services for residential and commercial',
    category: 'Plumbing',
    thumbnail: '🔧',
    color: 'from-blue-500 to-cyan-600',
    sections: [
      {
        id: 'hero-plumb-1',
        type: 'hero',
        title: 'Hero Section',
        content: {
          heading: '24/7 Emergency Plumbing Services',
          subheading: 'Licensed & Insured Plumbers - Fast Response - Upfront Pricing',
          ctaText: 'Get Instant Quote',
          ctaPhone: '1-800-PLUMBER',
          backgroundImage: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1200&h=600&fit=crop',
        }
      },
      {
        id: 'features-plumb-1',
        type: 'features',
        title: 'Features',
        content: {
          heading: 'Why Choose Our Plumbing Services',
          features: [
            { icon: '⚡', title: '24/7 Emergency Service', description: 'Available round the clock for urgent plumbing needs' },
            { icon: '💰', title: 'Upfront Pricing', description: 'No hidden fees - you know the cost before we start' },
            { icon: '🎓', title: 'Licensed & Certified', description: 'Fully licensed, bonded, and insured plumbers' },
            { icon: '✅', title: 'Satisfaction Guaranteed', description: '100% satisfaction guarantee on all work' }
          ]
        }
      },
      {
        id: 'services-plumb-1',
        type: 'services',
        title: 'Services',
        content: {
          heading: 'Our Plumbing Services',
          subheading: 'Complete plumbing solutions for your home or business',
          services: [
            {
              image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
              title: 'Emergency Repairs',
              description: 'Burst pipes, leaks, clogs - we handle all plumbing emergencies',
              price: 'From $89'
            },
            {
              image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop',
              title: 'Drain Cleaning',
              description: 'Professional drain cleaning and sewer line services',
              price: 'From $129'
            },
            {
              image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
              title: 'Water Heater Service',
              description: 'Installation, repair, and maintenance of water heaters',
              price: 'From $199'
            }
          ]
        }
      },
      {
        id: 'testimonials-plumb-1',
        type: 'testimonials',
        title: 'Testimonials',
        content: {
          heading: 'What Our Customers Say',
          testimonials: [
            {
              name: 'Robert Martinez',
              company: 'Homeowner',
              rating: 5,
              text: 'Fast response to our emergency! Fixed our burst pipe in under an hour.',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
            },
            {
              name: 'Lisa Chen',
              company: 'Property Manager',
              rating: 5,
              text: 'Professional service and fair pricing. Our go-to plumbing company.',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
            },
            {
              name: 'James Wilson',
              company: 'Business Owner',
              rating: 5,
              text: 'Excellent work on our commercial plumbing system. Highly recommend!',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
            }
          ]
        }
      },
      {
        id: 'cta-plumb-1',
        type: 'cta',
        title: 'Call to Action',
        content: {
          heading: 'Need a Plumber Right Now?',
          subheading: 'Call us for immediate assistance or schedule an appointment',
          ctaText: 'Call Now',
          phone: '1-800-PLUMBER',
          email: 'service@plumbingpro.com',
          hours: 'Available 24/7 - Even Holidays!'
        }
      },
      { id: 'privacy-plumb-1', type: 'privacy', title: 'Privacy Policy', content: basePrivacyPolicy },
      { id: 'terms-plumb-1', type: 'terms', title: 'Terms of Service', content: baseTermsOfService },
      {
        id: 'footer-plumb-1',
        type: 'footer',
        title: 'Footer',
        content: {
          companyName: 'Professional Plumbing Services',
          tagline: 'Your Trusted Local Plumber',
          address: '123 Main Street, Your City, ST 12345',
          phone: '1-800-PLUMBER',
          email: 'service@plumbingpro.com',
          socialLinks: { facebook: '#', twitter: '#', instagram: '#' },
          links: [
            { text: 'Privacy Policy', href: '#privacy' },
            { text: 'Terms of Service', href: '#terms' },
            { text: 'Service Areas', href: '#areas' }
          ],
          copyright: `© ${new Date().getFullYear()} Professional Plumbing Services. All rights reserved.`
        }
      }
    ]
  },

  // 2. HVAC SERVICES
  {
    id: 'hvac-1',
    name: 'HVAC Heating & Cooling',
    description: 'Expert heating, ventilation, and air conditioning services',
    category: 'HVAC',
    thumbnail: '❄️',
    color: 'from-cyan-500 to-blue-600',
    sections: [
      {
        id: 'hero-hvac-1',
        type: 'hero',
        title: 'Hero Section',
        content: {
          heading: 'Expert HVAC Services Year-Round',
          subheading: 'Heating, Cooling & Air Quality Solutions - Licensed & Certified',
          ctaText: 'Schedule Service',
          ctaPhone: '1-800-COOL-HOT',
          backgroundImage: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1200&h=600&fit=crop',
        }
      },
      {
        id: 'features-hvac-1',
        type: 'features',
        title: 'Features',
        content: {
          heading: 'Why Choose Our HVAC Services',
          features: [
            { icon: '🌡️', title: 'Temperature Experts', description: 'Certified technicians for all HVAC systems' },
            { icon: '⚡', title: 'Energy Efficient', description: 'Save money with energy-efficient solutions' },
            { icon: '🔧', title: 'Same-Day Service', description: 'Fast response for urgent heating/cooling needs' },
            { icon: '💯', title: 'Quality Guarantee', description: 'Satisfaction guaranteed on all installations' }
          ]
        }
      },
      {
        id: 'services-hvac-1',
        type: 'services',
        title: 'Services',
        content: {
          heading: 'Complete HVAC Solutions',
          subheading: 'From installation to maintenance and repair',
          services: [
            {
              image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop',
              title: 'AC Installation & Repair',
              description: 'Expert air conditioning installation and repair services',
              price: 'From $199'
            },
            {
              image: 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=400&h=300&fit=crop',
              title: 'Heating System Service',
              description: 'Furnace and heating system installation and maintenance',
              price: 'From $179'
            },
            {
              image: 'https://images.unsplash.com/photo-1635274531802-5a6193d7b1d9?w=400&h=300&fit=crop',
              title: 'Air Quality Solutions',
              description: 'Indoor air quality testing and improvement systems',
              price: 'From $149'
            }
          ]
        }
      },
      {
        id: 'testimonials-hvac-1',
        type: 'testimonials',
        title: 'Testimonials',
        content: {
          heading: 'Customer Reviews',
          testimonials: [
            {
              name: 'Michael Thompson',
              company: 'Homeowner',
              rating: 5,
              text: 'Best HVAC company! Installed our new AC and it works perfectly.',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
            },
            {
              name: 'Jennifer Davis',
              company: 'Business Owner',
              rating: 5,
              text: 'Professional and efficient. Fixed our heating system quickly.',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
            },
            {
              name: 'David Lee',
              company: 'Property Manager',
              rating: 5,
              text: 'Excellent maintenance service. Our buildings are always comfortable.',
              avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
            }
          ]
        }
      },
      {
        id: 'cta-hvac-1',
        type: 'cta',
        title: 'Call to Action',
        content: {
          heading: 'Stay Comfortable Year-Round',
          subheading: 'Schedule your HVAC service today',
          ctaText: 'Book Now',
          phone: '1-800-COOL-HOT',
          email: 'info@hvacpros.com',
          hours: 'Mon-Sat: 7AM-7PM, Sun: 8AM-5PM'
        }
      },
      { id: 'privacy-hvac-1', type: 'privacy', title: 'Privacy Policy', content: basePrivacyPolicy },
      { id: 'terms-hvac-1', type: 'terms', title: 'Terms of Service', content: baseTermsOfService },
      {
        id: 'footer-hvac-1',
        type: 'footer',
        title: 'Footer',
        content: {
          companyName: 'HVAC Heating & Cooling',
          tagline: 'Comfort All Year Long',
          address: '456 Service Ave, Your City, ST 12345',
          phone: '1-800-COOL-HOT',
          email: 'info@hvacpros.com',
          socialLinks: { facebook: '#', linkedin: '#', instagram: '#' },
          links: [
            { text: 'Privacy Policy', href: '#privacy' },
            { text: 'Terms of Service', href: '#terms' },
            { text: 'Financing Options', href: '#financing' }
          ],
          copyright: `© ${new Date().getFullYear()} HVAC Heating & Cooling. All rights reserved.`
        }
      }
    ]
  },

  // 3. ELECTRICAL SERVICES
  {
    id: 'electrical-1',
    name: 'Licensed Electrician Services',
    description: 'Professional electrical services for home and business',
    category: 'Electrical',
    thumbnail: '⚡',
    color: 'from-yellow-500 to-orange-600',
    sections: [
      {
        id: 'hero-elec-1',
        type: 'hero',
        title: 'Hero Section',
        content: {
          heading: 'Licensed Electrician Services',
          subheading: 'Safe, Reliable Electrical Solutions - Residential & Commercial',
          ctaText: 'Get Free Estimate',
          ctaPhone: '1-800-WATT-NOW',
          backgroundImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&h=600&fit=crop',
        }
      },
      {
        id: 'features-elec-1',
        type: 'features',
        title: 'Features',
        content: {
          heading: 'Why Choose Our Electricians',
          features: [
            { icon: '🔌', title: 'Licensed & Bonded', description: 'Fully licensed and insured electricians' },
            { icon: '🚨', title: 'Emergency Service', description: '24/7 emergency electrical services' },
            { icon: '✅', title: 'Code Compliant', description: 'All work meets electrical code requirements' },
            { icon: '🛡️', title: 'Safety First', description: 'Your safety is our top priority' }
          ]
        }
      },
      {
        id: 'services-elec-1',
        type: 'services',
        title: 'Services',
        content: {
          heading: 'Electrical Services',
          subheading: 'Complete electrical solutions for any need',
          services: [
            {
              image: 'https://images.unsplash.com/photo-1621905252472-178366d6d5af?w=400&h=300&fit=crop',
              title: 'Electrical Repairs',
              description: 'Expert troubleshooting and repair of electrical issues',
              price: 'From $99'
            },
            {
              image: 'https://images.unsplash.com/photo-1581092160607-ee67e7d937be?w=400&h=300&fit=crop',
              title: 'Panel Upgrades',
              description: 'Electrical panel upgrades and circuit breaker services',
              price: 'From $399'
            },
            {
              image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
              title: 'Lighting Installation',
              description: 'Indoor and outdoor lighting design and installation',
              price: 'From $149'
            }
          ]
        }
      },
      {
        id: 'testimonials-elec-1',
        type: 'testimonials',
        title: 'Testimonials',
        content: {
          heading: 'Client Testimonials',
          testimonials: [
            {
              name: 'Sarah Johnson',
              company: 'Homeowner',
              rating: 5,
              text: 'Quick, professional, and affordable. Fixed our electrical problem safely.',
              avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop'
            },
            {
              name: 'Tom Anderson',
              company: 'Contractor',
              rating: 5,
              text: 'Reliable electricians who always deliver quality work on time.',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
            },
            {
              name: 'Maria Garcia',
              company: 'Business Owner',
              rating: 5,
              text: 'Upgraded our entire electrical system. Excellent service!',
              avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop'
            }
          ]
        }
      },
      {
        id: 'about-elec-1',
        type: 'about',
        title: 'About Us',
        content: {
          heading: 'About Licensed Electrician Services',
          subheading: 'Powering Your Home & Business Safely',
          description: 'With over 30 years of experience, we are your trusted electrical service professionals. Our licensed and bonded electricians provide safe, reliable electrical solutions for residential and commercial properties. We prioritize safety, code compliance, and customer satisfaction on every project.',
          image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
          stats: [
            { number: '30+', label: 'Years Experience' },
            { number: '12,000+', label: 'Projects Completed' },
            { number: '100%', label: 'Licensed & Bonded' },
            { number: '24/7', label: 'Emergency Service' }
          ],
          values: [
            { icon: '🛡️', title: 'Safety First', description: 'Your safety is our top priority' },
            { icon: '✅', title: 'Code Compliant', description: 'All work meets electrical code standards' },
            { icon: '⚡', title: 'Expert Service', description: 'Licensed electricians with years of experience' },
            { icon: '🔌', title: 'Reliability', description: 'Dependable service you can trust' }
          ]
        }
      },
      {
        id: 'how-it-works-elec-1',
        type: 'how-it-works',
        title: 'How It Works',
        content: {
          heading: 'Simple Process, Professional Results',
          subheading: 'Getting your electrical work done is easy with our streamlined process',
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
              description: 'Our licensed electrician will assess your needs and provide upfront pricing.',
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
              title: 'Professional Installation',
              description: 'We complete the work safely, test everything, and clean up thoroughly.',
              image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
              icon: '✅'
            }
          ]
        }
      },
      {
        id: 'contact-elec-1',
        type: 'contact',
        title: 'Contact Us',
        content: {
          heading: 'Get In Touch',
          subheading: 'We\'re here to help with all your electrical needs',
          description: 'Have a question or need immediate service? Contact us today and our team will be happy to assist you.',
          formFields: [
            { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
            { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
            { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '(555) 123-4567' },
            { name: 'service', label: 'Service Needed', type: 'select', required: true, options: ['Electrical Repair', 'Panel Upgrade', 'Lighting Installation', 'Emergency Service', 'Inspection', 'Other'] },
            { name: 'message', label: 'Message', type: 'textarea', required: false, placeholder: 'Tell us about your electrical needs...' }
          ],
          contactInfo: {
            phone: '1-800-WATT-NOW',
            email: 'service@electricpro.com',
            address: '789 Electric Blvd, Your City, ST 12345',
            hours: 'Available 24/7 for Emergencies'
          },
          mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184132576684!2d-73.98811768459398!3d40.75889597932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus'
        }
      },
      {
        id: 'cta-elec-1',
        type: 'cta',
        title: 'Call to Action',
        content: {
          heading: 'Need an Electrician?',
          subheading: 'Contact us for a free estimate today',
          ctaText: 'Call Now',
          phone: '1-800-WATT-NOW',
          email: 'service@electricpro.com',
          hours: 'Available 24/7 for Emergencies'
        }
      },
      { id: 'privacy-elec-1', type: 'privacy', title: 'Privacy Policy', content: basePrivacyPolicy },
      { id: 'terms-elec-1', type: 'terms', title: 'Terms of Service', content: baseTermsOfService },
      {
        id: 'footer-elec-1',
        type: 'footer',
        title: 'Footer',
        content: {
          companyName: 'Licensed Electrician Services',
          tagline: 'Powering Your Home & Business',
          address: '789 Electric Blvd, Your City, ST 12345',
          phone: '1-800-WATT-NOW',
          email: 'service@electricpro.com',
          socialLinks: { facebook: '#', twitter: '#', linkedin: '#' },
          links: [
            { text: 'Privacy Policy', href: '#privacy' },
            { text: 'Terms of Service', href: '#terms' },
            { text: 'Electrical Safety Tips', href: '#safety' }
          ],
          copyright: `© ${new Date().getFullYear()} Licensed Electrician Services. All rights reserved.`
        }
      }
    ]
  },

  // 4. ROOFING SERVICES
  {
    id: 'roofing-1',
    name: 'Professional Roofing Company',
    description: 'Expert roofing installation, repair, and replacement services',
    category: 'Roofing',
    thumbnail: '🏠',
    color: 'from-slate-600 to-gray-700',
    sections: [
      {
        id: 'hero-roof-1',
        type: 'hero',
        title: 'Hero Section',
        content: {
          heading: 'Professional Roofing Services',
          subheading: 'Expert Installation, Repair & Replacement - Free Inspections',
          ctaText: 'Free Roof Inspection',
          ctaPhone: '1-800-NEW-ROOF',
          backgroundImage: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=1200&h=600&fit=crop',
        }
      },
      {
        id: 'features-roof-1',
        type: 'features',
        title: 'Features',
        content: {
          heading: 'Why Choose Our Roofing Services',
          features: [
            { icon: '🏆', title: '30+ Years Experience', description: 'Decades of roofing expertise' },
            { icon: '✅', title: 'Warranty Protected', description: 'Comprehensive warranty on all work' },
            { icon: '👷', title: 'Licensed & Insured', description: 'Fully licensed roofing contractors' },
            { icon: '💪', title: 'Quality Materials', description: 'Top-brand roofing materials' }
          ]
        }
      },
      {
        id: 'services-roof-1',
        type: 'services',
        title: 'Services',
        content: {
          heading: 'Roofing Services',
          subheading: 'Complete roofing solutions for residential and commercial',
          services: [
            {
              image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
              title: 'Roof Installation',
              description: 'New roof installation with premium materials',
              price: 'Free Quote'
            },
            {
              image: 'https://images.unsplash.com/photo-1604357209793-fca5dca89f97?w=400&h=300&fit=crop',
              title: 'Roof Repair',
              description: 'Emergency and scheduled roof repair services',
              price: 'From $299'
            },
            {
              image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&h=300&fit=crop',
              title: 'Roof Replacement',
              description: 'Complete roof replacement and removal',
              price: 'Free Estimate'
            }
          ]
        }
      },
      {
        id: 'testimonials-roof-1',
        type: 'testimonials',
        title: 'Testimonials',
        content: {
          heading: 'Customer Reviews',
          testimonials: [
            {
              name: 'John Williams',
              company: 'Homeowner',
              rating: 5,
              text: 'Excellent roofing job! Professional team and fair pricing.',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
            },
            {
              name: 'Emily Brown',
              company: 'Property Owner',
              rating: 5,
              text: 'Fast, reliable service. Our new roof looks amazing!',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
            },
            {
              name: 'Mark Taylor',
              company: 'Commercial Property',
              rating: 5,
              text: 'Best roofing company in the area. Highly professional.',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
            }
          ]
        }
      },
      {
        id: 'about-roof-1',
        type: 'about',
        title: 'About Us',
        content: {
          heading: 'About Professional Roofing Company',
          subheading: 'Protecting Your Home From Above',
          description: 'With over 30 years of roofing experience, we are your trusted local roofing professionals. We specialize in roof installation, repair, and replacement using premium materials and expert craftsmanship. Our licensed and insured team is committed to protecting your home with quality roofing solutions.',
          image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop',
          stats: [
            { number: '30+', label: 'Years Experience' },
            { number: '8,000+', label: 'Roofs Installed' },
            { number: '100%', label: 'Licensed & Insured' },
            { number: '10 Year', label: 'Warranty' }
          ],
          values: [
            { icon: '🏆', title: 'Experience', description: 'Decades of roofing expertise' },
            { icon: '✅', title: 'Warranty', description: 'Comprehensive warranty on all work' },
            { icon: '👷', title: 'Professional', description: 'Licensed roofing contractors' },
            { icon: '💪', title: 'Quality', description: 'Top-brand roofing materials' }
          ]
        }
      },
      {
        id: 'how-it-works-roof-1',
        type: 'how-it-works',
        title: 'How It Works',
        content: {
          heading: 'Simple Process, Professional Results',
          subheading: 'Getting your roof fixed or replaced is easy with our streamlined process',
          steps: [
            {
              number: '1',
              title: 'Free Inspection',
              description: 'Schedule a free roof inspection. Our expert will assess your roof\'s condition.',
              image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
              icon: '🔍'
            },
            {
              number: '2',
              title: 'Detailed Estimate',
              description: 'We provide a detailed written estimate with no hidden costs.',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
              icon: '💰'
            },
            {
              number: '3',
              title: 'Schedule Installation',
              description: 'We\'ll schedule your roof work at a time that works for you.',
              image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
              icon: '📅'
            },
            {
              number: '4',
              title: 'Professional Installation',
              description: 'Our team completes the work efficiently and cleans up thoroughly.',
              image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop',
              icon: '✅'
            }
          ]
        }
      },
      {
        id: 'contact-roof-1',
        type: 'contact',
        title: 'Contact Us',
        content: {
          heading: 'Get In Touch',
          subheading: 'We\'re here to help with all your roofing needs',
          description: 'Have a question or need a free roof inspection? Contact us today and our team will be happy to assist you.',
          formFields: [
            { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
            { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
            { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '(555) 123-4567' },
            { name: 'service', label: 'Service Needed', type: 'select', required: true, options: ['Roof Inspection', 'Roof Repair', 'Roof Replacement', 'Emergency Repair', 'Other'] },
            { name: 'message', label: 'Message', type: 'textarea', required: false, placeholder: 'Tell us about your roofing needs...' }
          ],
          contactInfo: {
            phone: '1-800-NEW-ROOF',
            email: 'info@roofingpro.com',
            address: '321 Roofing Way, Your City, ST 12345',
            hours: 'Mon-Sat: 7AM-6PM'
          },
          mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184132576684!2d-73.98811768459398!3d40.75889597932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus'
        }
      },
      {
        id: 'cta-roof-1',
        type: 'cta',
        title: 'Call to Action',
        content: {
          heading: 'Need a New Roof?',
          subheading: 'Get a free inspection and estimate today',
          ctaText: 'Schedule Inspection',
          phone: '1-800-NEW-ROOF',
          email: 'info@roofingpro.com',
          hours: 'Mon-Sat: 7AM-6PM'
        }
      },
      { id: 'privacy-roof-1', type: 'privacy', title: 'Privacy Policy', content: basePrivacyPolicy },
      { id: 'terms-roof-1', type: 'terms', title: 'Terms of Service', content: baseTermsOfService },
      {
        id: 'footer-roof-1',
        type: 'footer',
        title: 'Footer',
        content: {
          companyName: 'Professional Roofing Company',
          tagline: 'Protecting Your Home From Above',
          address: '321 Roofing Way, Your City, ST 12345',
          phone: '1-800-NEW-ROOF',
          email: 'info@roofingpro.com',
          socialLinks: { facebook: '#', instagram: '#', linkedin: '#' },
          links: [
            { text: 'Privacy Policy', href: '#privacy' },
            { text: 'Terms of Service', href: '#terms' },
            { text: 'Financing', href: '#financing' }
          ],
          copyright: `© ${new Date().getFullYear()} Professional Roofing Company. All rights reserved.`
        }
      }
    ]
  },

  // 5. LANDSCAPING SERVICES
  {
    id: 'landscaping-1',
    name: 'Professional Landscaping',
    description: 'Complete landscaping design, installation, and maintenance',
    category: 'Landscaping',
    thumbnail: '🌳',
    color: 'from-green-500 to-emerald-600',
    sections: [
      {
        id: 'hero-land-1',
        type: 'hero',
        title: 'Hero Section',
        content: {
          heading: 'Transform Your Outdoor Space',
          subheading: 'Professional Landscaping Design & Maintenance Services',
          ctaText: 'Get Free Consultation',
          ctaPhone: '1-800-GREEN-GO',
          backgroundImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1200&h=600&fit=crop',
        }
      },
      {
        id: 'features-land-1',
        type: 'features',
        title: 'Features',
        content: {
          heading: 'Why Choose Our Landscaping',
          features: [
            { icon: '🎨', title: 'Custom Designs', description: 'Unique landscape designs for your property' },
            { icon: '🌱', title: 'Eco-Friendly', description: 'Sustainable landscaping practices' },
            { icon: '🔧', title: 'Full Service', description: 'Design, installation, and maintenance' },
            { icon: '💯', title: 'Quality Guaranteed', description: 'Satisfaction guaranteed on all projects' }
          ]
        }
      },
      {
        id: 'services-land-1',
        type: 'services',
        title: 'Services',
        content: {
          heading: 'Landscaping Services',
          subheading: 'From design to ongoing maintenance',
          services: [
            {
              image: 'https://images.unsplash.com/photo-1599629954294-2f46e0b87b02?w=400&h=300&fit=crop',
              title: 'Landscape Design',
              description: 'Custom landscape design and planning services',
              price: 'From $499'
            },
            {
              image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
              title: 'Lawn Care & Maintenance',
              description: 'Regular lawn mowing, trimming, and maintenance',
              price: 'From $59/visit'
            },
            {
              image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop',
              title: 'Hardscaping',
              description: 'Patios, walkways, retaining walls, and more',
              price: 'Custom Quote'
            }
          ]
        }
      },
      {
        id: 'testimonials-land-1',
        type: 'testimonials',
        title: 'Testimonials',
        content: {
          heading: 'Happy Customers',
          testimonials: [
            {
              name: 'Patricia Moore',
              company: 'Homeowner',
              rating: 5,
              text: 'Beautiful landscaping work! Our yard has never looked better.',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
            },
            {
              name: 'Richard Clark',
              company: 'Business Owner',
              rating: 5,
              text: 'Professional service and great attention to detail.',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
            },
            {
              name: 'Nancy Rodriguez',
              company: 'Property Manager',
              rating: 5,
              text: 'Reliable and affordable landscaping for all our properties.',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
            }
          ]
        }
      },
      {
        id: 'about-land-1',
        type: 'about',
        title: 'About Us',
        content: {
          heading: 'About Professional Landscaping',
          subheading: 'Creating Beautiful Outdoor Spaces',
          description: 'For over 20 years, we\'ve been transforming outdoor spaces into beautiful, functional landscapes. Our team of experienced landscapers combines creative design with sustainable practices to create stunning yards that enhance your property value and quality of life.',
          image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&h=400&fit=crop',
          stats: [
            { number: '20+', label: 'Years Experience' },
            { number: '5,000+', label: 'Projects Completed' },
            { number: '100%', label: 'Satisfaction Rate' },
            { number: 'Eco-Friendly', label: 'Sustainable Practices' }
          ],
          values: [
            { icon: '🎨', title: 'Custom Design', description: 'Unique landscape designs for your property' },
            { icon: '🌱', title: 'Eco-Friendly', description: 'Sustainable landscaping practices' },
            { icon: '🔧', title: 'Full Service', description: 'Design, installation, and maintenance' },
            { icon: '💯', title: 'Quality', description: 'Satisfaction guaranteed on all projects' }
          ]
        }
      },
      {
        id: 'how-it-works-land-1',
        type: 'how-it-works',
        title: 'How It Works',
        content: {
          heading: 'Simple Process, Beautiful Results',
          subheading: 'Getting your landscape designed and installed is easy with our streamlined process',
          steps: [
            {
              number: '1',
              title: 'Free Consultation',
              description: 'Schedule a free consultation. We\'ll assess your space and discuss your vision.',
              image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
              icon: '📞'
            },
            {
              number: '2',
              title: 'Custom Design',
              description: 'We create a custom landscape design tailored to your needs and budget.',
              image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
              icon: '🎨'
            },
            {
              number: '3',
              title: 'Approval & Quote',
              description: 'Review the design and approve the quote. We\'ll schedule installation.',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
              icon: '✅'
            },
            {
              number: '4',
              title: 'Installation & Maintenance',
              description: 'We install your landscape and offer ongoing maintenance services.',
              image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&h=300&fit=crop',
              icon: '🌳'
            }
          ]
        }
      },
      {
        id: 'contact-land-1',
        type: 'contact',
        title: 'Contact Us',
        content: {
          heading: 'Get In Touch',
          subheading: 'We\'re here to help with all your landscaping needs',
          description: 'Have a question or ready to transform your outdoor space? Contact us today and our team will be happy to assist you.',
          formFields: [
            { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
            { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
            { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '(555) 123-4567' },
            { name: 'service', label: 'Service Needed', type: 'select', required: true, options: ['Landscape Design', 'Installation', 'Maintenance', 'Hardscaping', 'Consultation', 'Other'] },
            { name: 'message', label: 'Message', type: 'textarea', required: false, placeholder: 'Tell us about your landscaping needs...' }
          ],
          contactInfo: {
            phone: '1-800-GREEN-GO',
            email: 'info@landscapepro.com',
            address: '555 Garden Lane, Your City, ST 12345',
            hours: 'Mon-Sat: 7AM-6PM'
          },
          mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184132576684!2d-73.98811768459398!3d40.75889597932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus'
        }
      },
      {
        id: 'cta-land-1',
        type: 'cta',
        title: 'Call to Action',
        content: {
          heading: 'Ready for a Beautiful Yard?',
          subheading: 'Schedule your free landscape consultation',
          ctaText: 'Get Started',
          phone: '1-800-GREEN-GO',
          email: 'info@landscapepro.com',
          hours: 'Mon-Sat: 7AM-6PM'
        }
      },
      { id: 'privacy-land-1', type: 'privacy', title: 'Privacy Policy', content: basePrivacyPolicy },
      { id: 'terms-land-1', type: 'terms', title: 'Terms of Service', content: baseTermsOfService },
      {
        id: 'footer-land-1',
        type: 'footer',
        title: 'Footer',
        content: {
          companyName: 'Professional Landscaping',
          tagline: 'Creating Beautiful Outdoor Spaces',
          address: '555 Garden Lane, Your City, ST 12345',
          phone: '1-800-GREEN-GO',
          email: 'info@landscapepro.com',
          socialLinks: { facebook: '#', instagram: '#', pinterest: '#' },
          links: [
            { text: 'Privacy Policy', href: '#privacy' },
            { text: 'Terms of Service', href: '#terms' },
            { text: 'Gallery', href: '#gallery' }
          ],
          copyright: `© ${new Date().getFullYear()} Professional Landscaping. All rights reserved.`
        }
      }
    ]
  }
];

// Due to size limitations, I'll create a helper function to generate more templates programmatically
export const generateAdditionalTemplates = (): Template[] => {
  const additionalServices = [
    {
      category: 'Cleaning',
      name: 'Professional House Cleaning',
      icon: '🧹',
      color: 'from-pink-500 to-rose-600',
      phone: '1-800-CLEAN-ME',
      heading: 'Professional House Cleaning Services',
      subheading: 'Residential & Commercial Cleaning - Satisfaction Guaranteed',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=600&fit=crop'
    },
    {
      category: 'Pest Control',
      name: 'Pest Control Services',
      icon: '🐛',
      color: 'from-red-500 to-orange-600',
      phone: '1-800-NO-PESTS',
      heading: 'Professional Pest Control',
      subheading: 'Safe & Effective Pest Elimination - Licensed & Certified',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop'
    },
    {
      category: 'Locksmith',
      name: '24/7 Locksmith Services',
      icon: '🔐',
      color: 'from-indigo-500 to-blue-600',
      phone: '1-800-LOCK-KEY',
      heading: '24/7 Emergency Locksmith',
      subheading: 'Fast Response - Licensed Locksmiths - All Lock Types',
      image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=1200&h=600&fit=crop'
    },
    {
      category: 'Garage Door',
      name: 'Garage Door Services',
      icon: '🚪',
      color: 'from-gray-600 to-slate-700',
      phone: '1-800-DOOR-FIX',
      heading: 'Garage Door Installation & Repair',
      subheading: 'Expert Service - Same Day Repairs - Free Estimates',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop'
    },
    {
      category: 'Painting',
      name: 'Professional Painting Services',
      icon: '🎨',
      color: 'from-purple-500 to-pink-600',
      phone: '1-800-PAINTERS',
      heading: 'Interior & Exterior Painting',
      subheading: 'Professional Painters - Quality Finishes - Free Quotes',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&h=600&fit=crop'
    },
    {
      category: 'Carpet Cleaning',
      name: 'Carpet Cleaning Experts',
      icon: '🧼',
      color: 'from-blue-400 to-cyan-500',
      phone: '1-800-CARPETS',
      heading: 'Professional Carpet Cleaning',
      subheading: 'Deep Clean - Stain Removal - Fast Drying',
      image: 'https://images.unsplash.com/photo-1600428964546-988ac40e86f1?w=1200&h=600&fit=crop'
    },
    {
      category: 'Window Cleaning',
      name: 'Window Cleaning Services',
      icon: '🪟',
      color: 'from-sky-400 to-blue-500',
      phone: '1-800-WINDOWS',
      heading: 'Crystal Clear Window Cleaning',
      subheading: 'Residential & Commercial - Streak-Free Shine',
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1200&h=600&fit=crop'
    },
    {
      category: 'Handyman',
      name: 'Handyman Services',
      icon: '🔨',
      color: 'from-orange-500 to-amber-600',
      phone: '1-800-FIX-STUFF',
      heading: 'Professional Handyman Services',
      subheading: 'Home Repairs & Improvements - Licensed & Insured',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=600&fit=crop'
    },
    {
      category: 'Moving',
      name: 'Professional Moving Company',
      icon: '🚚',
      color: 'from-teal-500 to-green-600',
      phone: '1-800-MOVERS1',
      heading: 'Reliable Moving Services',
      subheading: 'Local & Long Distance - Full Service Movers',
      image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1200&h=600&fit=crop'
    },
    {
      category: 'Pool Service',
      name: 'Pool Cleaning & Maintenance',
      icon: '🏊',
      color: 'from-blue-500 to-cyan-600',
      phone: '1-800-POOL-PRO',
      heading: 'Professional Pool Services',
      subheading: 'Cleaning, Maintenance & Repair - Weekly Service Available',
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&h=600&fit=crop'
    },
    {
      category: 'Tree Service',
      name: 'Tree Removal & Trimming',
      icon: '🌲',
      color: 'from-green-600 to-emerald-700',
      phone: '1-800-TREE-CUT',
      heading: 'Professional Tree Services',
      subheading: 'Tree Removal, Trimming & Stump Grinding',
      image: 'https://images.unsplash.com/photo-1616680214084-22670de1bc82?w=1200&h=600&fit=crop'
    },
    {
      category: 'Appliance Repair',
      name: 'Appliance Repair Services',
      icon: '🔧',
      color: 'from-slate-500 to-gray-600',
      phone: '1-800-FIX-IT',
      heading: 'Appliance Repair Experts',
      subheading: 'All Major Brands - Same Day Service - Warranty Protected',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=600&fit=crop'
    },
    {
      category: 'Flooring',
      name: 'Flooring Installation',
      icon: '🪵',
      color: 'from-amber-600 to-yellow-700',
      phone: '1-800-FLOORS1',
      heading: 'Professional Flooring Services',
      subheading: 'Hardwood, Tile, Carpet & More - Expert Installation',
      image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&h=600&fit=crop'
    },
    {
      category: 'Home Security',
      name: 'Home Security Systems',
      icon: '🔒',
      color: 'from-red-600 to-rose-700',
      phone: '1-800-SECURE1',
      heading: 'Professional Home Security',
      subheading: '24/7 Monitoring - Smart Home Integration - Free Installation',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&h=600&fit=crop'
    },
    {
      category: 'Solar',
      name: 'Solar Panel Installation',
      icon: '☀️',
      color: 'from-yellow-500 to-orange-600',
      phone: '1-800-SOLAR-GO',
      heading: 'Solar Energy Solutions',
      subheading: 'Save Money - Go Green - Tax Credits Available',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=600&fit=crop'
    },
    {
      category: 'Gutter Cleaning',
      name: 'Gutter Cleaning Services',
      icon: '🏘️',
      color: 'from-blue-600 to-indigo-700',
      phone: '1-800-GUTTERS',
      heading: 'Professional Gutter Services',
      subheading: 'Cleaning, Repair & Installation - Protect Your Home',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=600&fit=crop'
    },
    {
      category: 'Concrete',
      name: 'Concrete & Masonry',
      icon: '🧱',
      color: 'from-gray-500 to-slate-600',
      phone: '1-800-CONCRETE',
      heading: 'Concrete & Masonry Services',
      subheading: 'Driveways, Patios, Foundations - Quality Workmanship',
      image: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=600&fit=crop'
    },
    {
      category: 'Fencing',
      name: 'Fence Installation & Repair',
      icon: '🚧',
      color: 'from-brown-600 to-orange-700',
      phone: '1-800-FENCING',
      heading: 'Professional Fence Services',
      subheading: 'All Fence Types - Installation & Repair - Free Quotes',
      image: 'https://images.unsplash.com/photo-1587502537815-0c8b5c9ba39a?w=1200&h=600&fit=crop'
    },
    {
      category: 'Siding',
      name: 'Siding Installation',
      icon: '🏗️',
      color: 'from-slate-600 to-gray-700',
      phone: '1-800-SIDING1',
      heading: 'Siding Installation & Repair',
      subheading: 'Vinyl, Wood, Fiber Cement - Professional Installation',
      image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=1200&h=600&fit=crop'
    },
    {
      category: 'Pressure Washing',
      name: 'Pressure Washing Services',
      icon: '💦',
      color: 'from-blue-400 to-cyan-500',
      phone: '1-800-WASH-IT',
      heading: 'Professional Pressure Washing',
      subheading: 'House, Driveway, Deck & More - Restore Like New',
      image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=1200&h=600&fit=crop'
    },
    {
      category: 'Junk Removal',
      name: 'Junk Removal Services',
      icon: '🗑️',
      color: 'from-green-500 to-teal-600',
      phone: '1-800-JUNK-OUT',
      heading: 'Fast Junk Removal',
      subheading: 'Residential & Commercial - Same Day Service - Eco-Friendly',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&h=600&fit=crop'
    },
    {
      category: 'Septic Service',
      name: 'Septic Tank Services',
      icon: '🚽',
      color: 'from-brown-500 to-amber-600',
      phone: '1-800-SEPTIC1',
      heading: 'Septic Tank Services',
      subheading: 'Pumping, Inspection & Repair - Emergency Service Available',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=600&fit=crop'
    },
    {
      category: 'Insulation',
      name: 'Insulation Services',
      icon: '🏠',
      color: 'from-orange-500 to-red-600',
      phone: '1-800-INSULATE',
      heading: 'Professional Insulation',
      subheading: 'Save Energy - Lower Bills - Expert Installation',
      image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=1200&h=600&fit=crop'
    },
    {
      category: 'Chimney Service',
      name: 'Chimney Sweep & Repair',
      icon: '🏚️',
      color: 'from-red-600 to-orange-700',
      phone: '1-800-CHIMNEY',
      heading: 'Chimney Cleaning & Repair',
      subheading: 'Inspections, Cleaning & Repairs - Safety First',
      image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&h=600&fit=crop'
    },
    {
      category: 'Waterproofing',
      name: 'Basement Waterproofing',
      icon: '💧',
      color: 'from-blue-600 to-cyan-700',
      phone: '1-800-DRY-BASE',
      heading: 'Basement Waterproofing',
      subheading: 'Protect Your Home - Lifetime Warranty - Free Inspection',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=600&fit=crop'
    }
  ];

  return additionalServices.map((service, index) => ({
    id: `${service.category.toLowerCase().replace(/\s+/g, '-')}-${index + 6}`,
    name: service.name,
    description: `Professional ${service.category.toLowerCase()} services for residential and commercial clients`,
    category: service.category,
    thumbnail: service.icon,
    color: service.color,
    sections: [
      {
        id: `hero-${index + 6}`,
        type: 'hero',
        title: 'Hero Section',
        content: {
          heading: service.heading,
          subheading: service.subheading,
          ctaText: 'Get Free Quote',
          ctaPhone: service.phone,
          backgroundImage: service.image,
        }
      },
      {
        id: `features-${index + 6}`,
        type: 'features',
        title: 'Features',
        content: {
          heading: `Why Choose Our ${service.category} Services`,
          features: [
            { icon: '⚡', title: 'Fast Service', description: 'Quick response and completion times' },
            { icon: '💰', title: 'Fair Pricing', description: 'Competitive rates with no hidden fees' },
            { icon: '🎓', title: 'Expert Team', description: 'Trained and certified professionals' },
            { icon: '✅', title: 'Guaranteed Work', description: 'Satisfaction guaranteed on all services' }
          ]
        }
      },
      {
        id: `services-${index + 6}`,
        type: 'services',
        title: 'Services',
        content: {
          heading: `Our ${service.category} Services`,
          subheading: 'Complete solutions for all your needs',
          services: [
            {
              image: service.image,
              title: `${service.category} Service 1`,
              description: 'Professional service with quality results',
              price: 'From $99'
            },
            {
              image: service.image,
              title: `${service.category} Service 2`,
              description: 'Expert solutions for your needs',
              price: 'From $149'
            },
            {
              image: service.image,
              title: `${service.category} Service 3`,
              description: 'Complete service packages available',
              price: 'Custom Quote'
            }
          ]
        }
      },
      {
        id: `testimonials-${index + 6}`,
        type: 'testimonials',
        title: 'Testimonials',
        content: {
          heading: 'Customer Testimonials',
          testimonials: [
            {
              name: 'Customer Name',
              company: 'Satisfied Customer',
              rating: 5,
              text: 'Excellent service! Professional, reliable, and affordable.',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
            },
            {
              name: 'Happy Client',
              company: 'Homeowner',
              rating: 5,
              text: 'Best decision we made! Highly recommend their services.',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
            },
            {
              name: 'Business Owner',
              company: 'Commercial Client',
              rating: 5,
              text: 'Outstanding work and great customer service!',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
            }
          ]
        }
      },
      {
        id: `about-${index + 6}`,
        type: 'about',
        title: 'About Us',
        content: {
          heading: `About ${service.name}`,
          subheading: `Professional ${service.category} You Can Trust`,
          description: `With years of experience, we are your trusted ${service.category.toLowerCase()} professionals. We provide comprehensive ${service.category.toLowerCase()} services for residential and commercial properties, delivering quality workmanship and exceptional customer service on every project.`,
          image: service.image,
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
      },
      {
        id: `how-it-works-${index + 6}`,
        type: 'how-it-works',
        title: 'How It Works',
        content: {
          heading: 'Simple Process, Professional Results',
          subheading: `Getting your ${service.category.toLowerCase()} service is easy with our streamlined process`,
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
              image: service.image,
              icon: '✅'
            }
          ]
        }
      },
      {
        id: `contact-${index + 6}`,
        type: 'contact',
        title: 'Contact Us',
        content: {
          heading: 'Get In Touch',
          subheading: `We're here to help with all your ${service.category.toLowerCase()} needs`,
          description: 'Have a question or need immediate service? Contact us today and our team will be happy to assist you.',
          formFields: [
            { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
            { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
            { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '(555) 123-4567' },
            { name: 'service', label: 'Service Needed', type: 'select', required: true, options: ['Service Request', 'Estimate', 'Emergency Service', 'Maintenance', 'Other'] },
            { name: 'message', label: 'Message', type: 'textarea', required: false, placeholder: `Tell us about your ${service.category.toLowerCase()} needs...` }
          ],
          contactInfo: {
            phone: service.phone,
            email: `info@${service.category.toLowerCase().replace(/\s+/g, '')}pro.com`,
            address: '123 Service Street, Your City, ST 12345',
            hours: 'Mon-Sat: 7AM-7PM'
          },
          mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184132576684!2d-73.98811768459398!3d40.75889597932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus'
        }
      },
      {
        id: `cta-${index + 6}`,
        type: 'cta',
        title: 'Call to Action',
        content: {
          heading: `Need ${service.category} Services?`,
          subheading: 'Contact us today for a free estimate',
          ctaText: 'Call Now',
          phone: service.phone,
          email: `info@${service.category.toLowerCase().replace(/\s+/g, '')}pro.com`,
          hours: 'Mon-Sat: 7AM-7PM'
        }
      },
      { id: `privacy-${index + 6}`, type: 'privacy', title: 'Privacy Policy', content: basePrivacyPolicy },
      { id: `terms-${index + 6}`, type: 'terms', title: 'Terms of Service', content: baseTermsOfService },
      {
        id: `footer-${index + 6}`,
        type: 'footer',
        title: 'Footer',
        content: {
          companyName: service.name,
          tagline: `Professional ${service.category} You Can Trust`,
          address: '123 Service Street, Your City, ST 12345',
          phone: service.phone,
          email: `info@${service.category.toLowerCase().replace(/\s+/g, '')}pro.com`,
          socialLinks: { facebook: '#', instagram: '#', twitter: '#' },
          links: [
            { text: 'Privacy Policy', href: '#privacy' },
            { text: 'Terms of Service', href: '#terms' },
            { text: 'Service Areas', href: '#areas' }
          ],
          copyright: `© ${new Date().getFullYear()} ${service.name}. All rights reserved.`
        }
      }
    ]
  }));
};

// Combine base templates with generated ones
export const allTemplates = [...templateLibrary, ...generateAdditionalTemplates()];

// Export categories for filtering
export const serviceCategories = [
  'Plumbing',
  'HVAC',
  'Electrical',
  'Roofing',
  'Landscaping',
  'Cleaning',
  'Pest Control',
  'Locksmith',
  'Garage Door',
  'Painting',
  'Carpet Cleaning',
  'Window Cleaning',
  'Handyman',
  'Moving',
  'Pool Service',
  'Tree Service',
  'Appliance Repair',
  'Flooring',
  'Home Security',
  'Solar',
  'Gutter Cleaning',
  'Concrete',
  'Fencing',
  'Siding',
  'Pressure Washing',
  'Junk Removal',
  'Septic Service',
  'Insulation',
  'Chimney Service',
  'Waterproofing'
];

