// Competitor data for Wedded Analytics Dashboard
// Source: Market Research January 2025

export type CompetitorLevel = 'enterprise' | 'scaleup' | 'growth' | 'smb' | 'startup';
export type BusinessModelType = 'freemium' | 'subscription' | 'marketplace' | 'hybrid' | 'one-time' | 'transaction';

export interface Competitor {
  id: string;
  name: string;
  url: string;
  country: string;
  countryCode: string;
  categories: string[];
  funding: string;
  employees: string;
  level: CompetitorLevel;
  revenue?: string;
  valuation?: string;
  description: string;
  differentiator: string;
  threat: 'high' | 'medium' | 'low';
}

// Extended interface for competitor detail pages
export interface CompetitorDetail extends Competitor {
  // Business Model
  businessModel: {
    type: BusinessModelType;
    description: string;
    revenueStreams: string[];
    pricing?: string[];
  };

  // Value Proposition
  valueProposition: {
    headline: string;
    points: string[];
    targetAudience: string;
  };

  // Metrics
  metrics: {
    users?: string;
    monthlyVisitors?: string;
    vendors?: string;
    weddingsPerYear?: string;
    appDownloads?: string;
    marketShare?: string;
  };

  // Funding Details
  fundingDetails: {
    totalRaised: string;
    lastRound?: { type: string; amount: string; date: string };
    investors: string[];
    valuation?: string;
  };

  // Features the competitor has (mapped to wedded-features.ts ids)
  featureIds: string[];

  // Known Roadmap
  roadmap?: {
    announced: string[];
    rumored: string[];
  };

  // Competitive Analysis
  analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // Social/External Links
  links: {
    linkedin?: string;
    crunchbase?: string;
    twitter?: string;
    appStore?: string;
    playStore?: string;
  };
}

export interface CategoryInfo {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  weddedStatus: 'live' | 'development' | 'planned';
  marketLeaders: string[];
  opportunity: string;
}

export interface MarketData {
  globalMarket2024: string;
  globalMarket2033: string;
  cagr: string;
  usMarket2024: string;
  spainWeddingsAnnual: string;
  spainAvgSpend: string;
  totalCompanies: number;
  companiesWithFunding: number;
}

// Market Overview Data
export const marketData: MarketData = {
  globalMarket2024: '$1.2B',
  globalMarket2033: '$3.5B',
  cagr: '12.5%',
  usMarket2024: '$63-65B',
  spainWeddingsAnnual: '~150,000',
  spainAvgSpend: '€20,000-25,000',
  totalCompanies: 5588,
  companiesWithFunding: 314,
};

// Categories/Services
export const categories: CategoryInfo[] = [
  {
    id: 'planning',
    name: 'Wedding Planning / Roadmap',
    nameEs: 'Roadmap de Boda',
    description: 'Tools to help couples plan their wedding timeline and tasks',
    weddedStatus: 'live',
    marketLeaders: ['The Knot', 'Zola', 'Joy'],
    opportunity: 'AI-powered personalized planning is underserved',
  },
  {
    id: 'guest-management',
    name: 'Guest Management',
    nameEs: 'Gestión de Invitados',
    description: 'RSVP tracking, guest lists, seating arrangements',
    weddedStatus: 'live',
    marketLeaders: ['Joy', 'Zola', 'The Knot'],
    opportunity: 'Better WhatsApp/messaging integration for Spain/LatAm',
  },
  {
    id: 'invitations',
    name: 'Digital Invitations',
    nameEs: 'Invitaciones Digitales',
    description: 'Digital save-the-dates and wedding invitations',
    weddedStatus: 'live',
    marketLeaders: ['Paperless Post', 'Zola', 'Joy'],
    opportunity: 'Video invitations and cultural customization',
  },
  {
    id: 'websites',
    name: 'Wedding Websites',
    nameEs: 'Páginas Web para Invitados',
    description: 'Custom wedding websites with event info',
    weddedStatus: 'live',
    marketLeaders: ['Zola', 'Joy', 'The Knot'],
    opportunity: 'Better multilingual support and European templates',
  },
  {
    id: 'day-coordination',
    name: 'Day-of Coordination',
    nameEs: 'Coordinación Día D',
    description: 'Real-time timeline management on wedding day',
    weddedStatus: 'development',
    marketLeaders: ['Aisle Planner', 'Timeline Genius'],
    opportunity: 'No Spanish-native solution exists',
  },
  {
    id: 'b2c-planning',
    name: 'Online Wedding Planners (B2C)',
    nameEs: 'Wedding Planners Online',
    description: 'Full-service online planning platforms for couples',
    weddedStatus: 'live',
    marketLeaders: ['The Knot', 'Zola', 'Bodas.net'],
    opportunity: 'Integrated B2C+B2B platform is unique',
  },
  {
    id: 'b2b-tools',
    name: 'B2B Tools for Wedding Planners',
    nameEs: 'Herramientas para Wedding Planners',
    description: 'Professional tools for wedding planners',
    weddedStatus: 'planned',
    marketLeaders: ['HoneyBook', 'Aisle Planner', 'Dubsado'],
    opportunity: 'No native Spanish B2B solution exists',
  },
  {
    id: 'ai-bridal',
    name: 'AI Bridal Styling',
    nameEs: 'IA Vestido de Novia',
    description: 'AI-powered dress try-on and recommendations',
    weddedStatus: 'planned',
    marketLeaders: ["David's Bridal", 'Bridely'],
    opportunity: 'No European competitor - greenfield market',
  },
  {
    id: 'vendor-directory',
    name: 'Vendor Directory',
    nameEs: 'Directorio de Proveedores',
    description: 'Marketplace to find wedding vendors',
    weddedStatus: 'planned',
    marketLeaders: ['The Knot', 'WeddingWire', 'Bodas.net'],
    opportunity: 'Fair pricing model vs 12-month lock-ins',
  },
];

// Competitors Data
export const competitors: Competitor[] = [
  // Enterprise - Global
  {
    id: 'tkww',
    name: 'The Knot Worldwide',
    url: 'theknotww.com',
    country: 'USA (Global)',
    countryCode: 'US',
    categories: ['planning', 'guest-management', 'invitations', 'websites', 'b2c-planning', 'vendor-directory'],
    funding: 'Private',
    employees: '2,000+',
    level: 'enterprise',
    revenue: '$455-500M',
    description: 'Global leader owning The Knot, WeddingWire, Bodas.net, Zankyou, Hitched',
    differentiator: '700K+ vendors, 16+ countries, massive network effects',
    threat: 'high',
  },
  {
    id: 'zola',
    name: 'Zola',
    url: 'zola.com',
    country: 'USA',
    countryCode: 'US',
    categories: ['planning', 'guest-management', 'invitations', 'websites', 'b2c-planning'],
    funding: '$141M',
    employees: '283-287',
    level: 'scaleup',
    revenue: '~$120M',
    valuation: '~$650M',
    description: 'All-in-one wedding platform with registry focus',
    differentiator: 'Registry-first, 500+ brand partners, zero-fee cash funds',
    threat: 'medium',
  },
  {
    id: 'joy',
    name: 'Joy (WithJoy)',
    url: 'withjoy.com',
    country: 'USA',
    countryCode: 'US',
    categories: ['planning', 'guest-management', 'invitations', 'websites', 'b2c-planning'],
    funding: '$108M',
    employees: '169-356',
    level: 'scaleup',
    revenue: '$64.9M',
    description: '100% free wedding planning platform',
    differentiator: 'Completely free core, 601+ design themes, zero-fee cash funds',
    threat: 'high',
  },

  // Spain/Europe
  {
    id: 'bodasnet',
    name: 'Bodas.net',
    url: 'bodas.net',
    country: 'Spain',
    countryCode: 'ES',
    categories: ['planning', 'guest-management', 'websites', 'b2c-planning', 'vendor-directory'],
    funding: 'Part of TKWW',
    employees: '~637',
    level: 'enterprise',
    description: 'Spanish market leader (owned by The Knot Worldwide)',
    differentiator: '50,000+ Spanish vendors, 1.5M+ monthly visitors',
    threat: 'high',
  },
  {
    id: 'zankyou',
    name: 'Zankyou',
    url: 'zankyou.com',
    country: 'Spain',
    countryCode: 'ES',
    categories: ['planning', 'websites', 'b2c-planning', 'vendor-directory'],
    funding: 'Part of TKWW',
    employees: 'Unknown',
    level: 'enterprise',
    description: 'Spanish-origin platform (acquired by TKWW Feb 2023)',
    differentiator: 'Strong cash registry, 9 languages, 20+ countries',
    threat: 'high',
  },
  {
    id: 'wataboda',
    name: 'Wataboda',
    url: 'wataboda.com',
    country: 'Spain',
    countryCode: 'ES',
    categories: ['planning', 'guest-management', 'invitations'],
    funding: 'Bootstrapped',
    employees: 'Startup',
    level: 'smb',
    description: 'Spanish all-in-one wedding app',
    differentiator: '€149 one-time, native Spanish, photo album 6 months',
    threat: 'low',
  },
  {
    id: 'bodalive',
    name: 'BodaLIVE',
    url: 'bodalive.es',
    country: 'Spain',
    countryCode: 'ES',
    categories: ['day-coordination'],
    funding: 'Bootstrapped',
    employees: 'Small',
    level: 'smb',
    description: 'Interactive wedding day experiences',
    differentiator: 'PhotoLive, MusicLive, GameLive from €250',
    threat: 'low',
  },
  {
    id: 'weddie',
    name: 'Weddie.app',
    url: 'weddie.app',
    country: 'Europe',
    countryCode: 'EU',
    categories: ['planning', 'guest-management', 'ai-bridal'],
    funding: 'Unknown',
    employees: 'Startup',
    level: 'growth',
    description: 'AI-powered photo sharing and planning PWA',
    differentiator: 'AI features, PWA (no download), 15+ languages, $249',
    threat: 'medium',
  },

  // B2B Tools
  {
    id: 'honeybook',
    name: 'HoneyBook',
    url: 'honeybook.com',
    country: 'USA/Israel',
    countryCode: 'US',
    categories: ['b2b-tools'],
    funding: '$479M',
    employees: '230-347',
    level: 'enterprise',
    revenue: '~$135M ARR',
    valuation: '$2.4B',
    description: 'CRM for creative entrepreneurs (not wedding-specific)',
    differentiator: 'Full business management: CRM, invoicing, contracts, payments',
    threat: 'medium',
  },
  {
    id: 'aisleplanner',
    name: 'Aisle Planner',
    url: 'aisleplanner.com',
    country: 'USA',
    countryCode: 'US',
    categories: ['b2b-tools', 'day-coordination'],
    funding: 'Unknown',
    employees: '12-21',
    level: 'smb',
    description: 'Best-in-class wedding planner software',
    differentiator: 'CAD floor plans, timelines, seating, vendor collaboration',
    threat: 'low',
  },
  {
    id: 'thatstheone',
    name: "That's The One",
    url: 'thatstheone.com',
    country: 'UK',
    countryCode: 'GB',
    categories: ['b2b-tools', 'day-coordination'],
    funding: 'VC-backed',
    employees: 'Unknown',
    level: 'growth',
    description: 'European B2B wedding planner tool',
    differentiator: '7 languages, 20+ currencies, $55/month flat',
    threat: 'medium',
  },
  {
    id: 'dubsado',
    name: 'Dubsado',
    url: 'dubsado.com',
    country: 'USA',
    countryCode: 'US',
    categories: ['b2b-tools'],
    funding: 'Bootstrapped',
    employees: '23',
    level: 'smb',
    revenue: '~$2.5M',
    description: 'Customizable business management for creatives',
    differentiator: 'Highly customizable, white-label, $20+/month',
    threat: 'low',
  },

  // Invitations
  {
    id: 'paperlesspost',
    name: 'Paperless Post',
    url: 'paperlesspost.com',
    country: 'USA',
    countryCode: 'US',
    categories: ['invitations'],
    funding: '$47-50M',
    employees: '51-175',
    level: 'scaleup',
    description: 'Premium digital invitations',
    differentiator: 'Designer partnerships (Kate Spade, Oscar de la Renta)',
    threat: 'low',
  },
  {
    id: 'partiful',
    name: 'Partiful',
    url: 'partiful.com',
    country: 'USA',
    countryCode: 'US',
    categories: ['invitations', 'guest-management'],
    funding: '$27.4M',
    employees: '25',
    level: 'growth',
    valuation: '$140M',
    description: 'Gen Z event platform (SMS-first)',
    differentiator: '100% free, SMS-first, backed by a16z/GV',
    threat: 'medium',
  },
  {
    id: 'acolores',
    name: 'AColores Design',
    url: 'acoloresdesign.es',
    country: 'Spain',
    countryCode: 'ES',
    categories: ['invitations'],
    funding: 'Bootstrapped',
    employees: 'Small',
    level: 'smb',
    description: 'Video and animated wedding invitations',
    differentiator: '14 interactive sections, 1 year availability',
    threat: 'low',
  },
  {
    id: 'vitte',
    name: 'Vitte Design',
    url: 'vitte.es',
    country: 'Spain',
    countryCode: 'ES',
    categories: ['invitations'],
    funding: 'Bootstrapped',
    employees: '4+',
    level: 'smb',
    description: 'Luxury wedding stationery',
    differentiator: 'Premium segment, calligraphy, artisan',
    threat: 'low',
  },

  // AI Bridal
  {
    id: 'davidsbridal',
    name: "David's Bridal",
    url: 'davidsbridal.com',
    country: 'USA',
    countryCode: 'US',
    categories: ['ai-bridal'],
    funding: 'Public',
    employees: 'Large',
    level: 'enterprise',
    description: 'Largest bridal retailer with AI features',
    differentiator: 'Pearl Planner (GPT-powered), 3D/AR dress visualization',
    threat: 'low',
  },
  {
    id: 'bridely',
    name: 'Bridely',
    url: 'bridely.co',
    country: 'USA',
    countryCode: 'US',
    categories: ['ai-bridal'],
    funding: 'Unknown',
    employees: 'Startup',
    level: 'startup',
    description: 'AI virtual try-on for bridal',
    differentiator: 'Body shape analysis, 500+ dresses, ethnic markets',
    threat: 'low',
  },
  {
    id: 'perfectcorp',
    name: 'Perfect Corp',
    url: 'perfectcorp.com',
    country: 'Taiwan',
    countryCode: 'TW',
    categories: ['ai-bridal'],
    funding: '$75M+',
    employees: 'Unknown',
    level: 'enterprise',
    revenue: '$53.5M',
    valuation: '~$1B',
    description: 'AR/AI beauty and fashion tech (NYSE: PERF)',
    differentiator: 'Enterprise AR platform, beauty/jewelry/fashion',
    threat: 'low',
  },

  // UK/Europe
  {
    id: 'bridebook',
    name: 'Bridebook',
    url: 'bridebook.com',
    country: 'UK',
    countryCode: 'GB',
    categories: ['planning', 'vendor-directory', 'b2c-planning'],
    funding: '$18.9M',
    employees: '138',
    level: 'growth',
    valuation: '$34.4M',
    description: 'UK market leader (independent)',
    differentiator: '71% UK market share, AI-powered planning',
    threat: 'medium',
  },
  {
    id: 'hitched',
    name: 'Hitched',
    url: 'hitched.co.uk',
    country: 'UK',
    countryCode: 'GB',
    categories: ['planning', 'websites', 'vendor-directory'],
    funding: 'Part of TKWW',
    employees: 'Unknown',
    level: 'enterprise',
    description: 'UK wedding platform (owned by TKWW)',
    differentiator: '18,000+ UK vendors, acquired 2020',
    threat: 'medium',
  },

  // India/Other
  {
    id: 'wedmegood',
    name: 'WedMeGood',
    url: 'wedmegood.com',
    country: 'India',
    countryCode: 'IN',
    categories: ['planning', 'vendor-directory', 'b2c-planning'],
    funding: '$3.07M',
    employees: '181-214',
    level: 'scaleup',
    revenue: '~$3.4M',
    description: 'Indian wedding planning leader',
    differentiator: '150,000+ vendors, 2M+ monthly users',
    threat: 'low',
  },
];

// Helper functions
export function getCompetitorsByCategory(categoryId: string): Competitor[] {
  return competitors.filter(c => c.categories.includes(categoryId));
}

export function getCompetitorsByCountry(countryCode: string): Competitor[] {
  return competitors.filter(c => c.countryCode === countryCode);
}

export function getDirectCompetitors(): Competitor[] {
  return competitors.filter(c => c.threat === 'high');
}

export function getCompetitorsByLevel(level: CompetitorLevel): Competitor[] {
  return competitors.filter(c => c.level === level);
}

export function getCategoryById(id: string): CategoryInfo | undefined {
  return categories.find(c => c.id === id);
}

// Opportunities and Gaps
export interface MarketGap {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relatedCategories: string[];
}

export const marketGaps: MarketGap[] = [
  {
    id: 'spanish-b2b',
    title: 'No Native Spanish B2B Platform',
    description: "That's The One (UK) is the closest. Huge opportunity for Spanish-native B2B tools for wedding planners.",
    priority: 'high',
    relatedCategories: ['b2b-tools', 'day-coordination'],
  },
  {
    id: 'european-ai',
    title: 'No European AI Bridal Solution',
    description: "All AI bridal players are USA/Asia. David's Bridal, Bridely, Perfect Corp - none focus on Europe.",
    priority: 'high',
    relatedCategories: ['ai-bridal'],
  },
  {
    id: 'tkww-monopoly',
    title: 'TKWW Monopoly in Spain',
    description: 'Bodas.net + Zankyou = same owner. Independent alternative needed.',
    priority: 'medium',
    relatedCategories: ['planning', 'vendor-directory', 'b2c-planning'],
  },
  {
    id: 'vertical-integration',
    title: 'No Vertical Integration',
    description: 'No competitor combines B2C (couples) + B2B (planners) + AI in one platform.',
    priority: 'high',
    relatedCategories: ['planning', 'b2b-tools', 'ai-bridal'],
  },
  {
    id: 'fair-pricing',
    title: 'Predatory B2B Pricing',
    description: 'WeddingWire/Bodas.net lock vendors in 12-month contracts. Fair pricing model is a differentiator.',
    priority: 'medium',
    relatedCategories: ['vendor-directory'],
  },
];

// Country statistics
export interface CountryStats {
  code: string;
  name: string;
  competitorCount: number;
  marketLeader: string;
  weddedPresence: boolean;
}

export function getCountryStats(): CountryStats[] {
  const countries: Record<string, { name: string; count: number; leader: string }> = {
    US: { name: 'USA', count: 0, leader: 'The Knot Worldwide' },
    ES: { name: 'Spain', count: 0, leader: 'Bodas.net' },
    GB: { name: 'UK', count: 0, leader: 'Bridebook' },
    EU: { name: 'Europe (Other)', count: 0, leader: 'Weddie.app' },
    IN: { name: 'India', count: 0, leader: 'WedMeGood' },
    TW: { name: 'Taiwan', count: 0, leader: 'Perfect Corp' },
  };

  competitors.forEach(c => {
    if (countries[c.countryCode]) {
      countries[c.countryCode].count++;
    }
  });

  return Object.entries(countries).map(([code, data]) => ({
    code,
    name: data.name,
    competitorCount: data.count,
    marketLeader: data.leader,
    weddedPresence: code === 'ES',
  }));
}

// ========================================
// COMPETITOR DETAILS DATA
// ========================================

export const competitorDetails: Record<string, CompetitorDetail> = {
  // The Knot Worldwide (TKWW)
  tkww: {
    ...competitors.find(c => c.id === 'tkww')!,
    businessModel: {
      type: 'marketplace',
      description: 'B2B marketplace with vendor advertising and lead generation. Vendors pay for premium listings and leads.',
      revenueStreams: [
        'Vendor advertising and premium listings',
        'Lead generation fees',
        'Registry commissions (via The Knot)',
        'Acquisition roll-up strategy',
      ],
      pricing: [
        'Vendor listings: $1,000-10,000+/year',
        'Premium placements: variable pricing',
        'Couples: Free (monetized via vendors)',
      ],
    },
    valueProposition: {
      headline: 'The largest wedding marketplace network in the world',
      points: [
        'Access to 700K+ wedding vendors globally',
        'Trusted brand with decades of history',
        'Full suite of planning tools',
        'Multi-country presence (16+ countries)',
      ],
      targetAudience: 'Engaged couples and wedding vendors worldwide',
    },
    metrics: {
      users: '25M+ couples annually',
      monthlyVisitors: '10M+ (combined properties)',
      vendors: '700,000+',
      weddingsPerYear: '2M+ weddings planned',
      marketShare: '40%+ (US market)',
    },
    fundingDetails: {
      totalRaised: 'Private (PE-backed)',
      lastRound: { type: 'Private Equity', amount: 'Undisclosed', date: '2018' },
      investors: ['Permira', 'NBC Universal', 'Comcast Ventures'],
      valuation: '$1B+ (estimated)',
    },
    featureIds: [
      'wedding-management',
      'guest-management',
      'onboarding-wizard',
      'budget-planning',
      'marketplace',
      'digital-invitations',
      'wedding-websites',
    ],
    roadmap: {
      announced: ['AI vendor matching', 'Enhanced mobile apps'],
      rumored: ['Registry expansion', 'Video consultations'],
    },
    analysis: {
      strengths: [
        'Massive vendor network with network effects',
        'Strong brand recognition',
        'Multi-country presence',
        'Full wedding ecosystem',
      ],
      weaknesses: [
        'Legacy technology stack',
        'Predatory vendor pricing (12-month lock-ins)',
        'Fragmented user experience across brands',
        'Slow innovation pace',
      ],
      opportunities: [
        'Spanish market monopoly weakness (Wedded opportunity)',
        'B2B planner tools gap',
        'AI-first approach',
        'Fair vendor pricing model',
      ],
      threats: [
        'Market dominance blocks new entrants',
        'Can acquire competitors quickly',
        'Deep pockets for marketing',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/the-knot-worldwide',
      crunchbase: 'https://crunchbase.com/organization/the-knot-worldwide',
    },
  },

  // Joy (WithJoy)
  joy: {
    ...competitors.find(c => c.id === 'joy')!,
    businessModel: {
      type: 'freemium',
      description: '100% free core product with monetization through registry commissions and optional premium features.',
      revenueStreams: [
        'Registry commissions (affiliate)',
        'Zero-fee cash fund processing fees',
        'Premium design themes',
        'Optional premium features',
      ],
      pricing: [
        'Core planning: Free',
        'Cash funds: 0% fee (processor fees apply)',
        'Premium themes: $50-150',
      ],
    },
    valueProposition: {
      headline: 'The completely free wedding planning platform',
      points: [
        '100% free core features',
        '601+ design themes',
        'Zero-fee cash registry funds',
        'Modern, intuitive interface',
      ],
      targetAudience: 'Budget-conscious millennials and Gen Z couples',
    },
    metrics: {
      users: '5M+ couples',
      monthlyVisitors: '3M+',
      weddingsPerYear: '500K+ weddings planned',
      appDownloads: '1M+ (combined)',
    },
    fundingDetails: {
      totalRaised: '$108M',
      lastRound: { type: 'Series C', amount: '$50M', date: '2022' },
      investors: ['GV (Google Ventures)', 'Ribbit Capital', 'Slow Ventures'],
      valuation: '$400M+ (estimated)',
    },
    featureIds: [
      'wedding-management',
      'guest-management',
      'onboarding-wizard',
      'budget-planning',
      'digital-invitations',
      'wedding-websites',
    ],
    roadmap: {
      announced: ['AI planning assistant', 'Enhanced RSVP features'],
      rumored: ['International expansion', 'Vendor marketplace'],
    },
    analysis: {
      strengths: [
        'Completely free model disrupts market',
        'Modern, user-friendly design',
        'Strong VC backing',
        'Rapid feature development',
      ],
      weaknesses: [
        'No vendor marketplace',
        'US-centric (limited international)',
        'No B2B tools',
        'Limited revenue diversification',
      ],
      opportunities: [
        'Spanish/LatAm market expansion',
        'B2B planner integration',
        'AI features development',
        'Day-of coordination tools',
      ],
      threats: [
        'Direct competitor for free planning',
        'Could expand to Spain',
        'Strong brand among millennials',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/withjoy',
      crunchbase: 'https://crunchbase.com/organization/joy-wedding',
      appStore: 'https://apps.apple.com/app/joy-wedding-app',
      playStore: 'https://play.google.com/store/apps/details?id=com.withjoy.joy',
    },
  },

  // Bodas.net
  bodasnet: {
    ...competitors.find(c => c.id === 'bodasnet')!,
    businessModel: {
      type: 'marketplace',
      description: 'B2B vendor marketplace with premium listings. Part of TKWW network with Spanish market dominance.',
      revenueStreams: [
        'Vendor premium listings',
        'Lead generation fees',
        'Advertising revenue',
        'Featured placements',
      ],
      pricing: [
        'Basic listing: €500-1,500/year',
        'Premium listing: €2,000-5,000/year',
        'Featured placements: variable',
      ],
    },
    valueProposition: {
      headline: 'El portal de bodas líder en España',
      points: [
        '50,000+ proveedores en España',
        'Comunidad activa de novias',
        'Herramientas de planificación completas',
        'Presencia en foros y comunidad',
      ],
      targetAudience: 'Parejas españolas y proveedores de bodas',
    },
    metrics: {
      monthlyVisitors: '1.5M+',
      vendors: '50,000+',
      weddingsPerYear: '100K+ weddings influenced',
      marketShare: '60%+ (Spanish market)',
    },
    fundingDetails: {
      totalRaised: 'Part of TKWW',
      investors: ['The Knot Worldwide (owner)'],
      valuation: 'Consolidated with TKWW',
    },
    featureIds: [
      'wedding-management',
      'guest-management',
      'budget-planning',
      'marketplace',
      'wedding-websites',
    ],
    roadmap: {
      announced: ['Mobile app improvements'],
      rumored: ['AI recommendations'],
    },
    analysis: {
      strengths: [
        'Spanish market leader',
        'Massive vendor database',
        'Strong SEO presence',
        'Community forums',
      ],
      weaknesses: [
        'Dated user interface',
        'Expensive for vendors',
        'TKWW ownership (same as Zankyou)',
        'Limited innovation',
      ],
      opportunities: [
        'Independent alternative needed in Spain',
        'Fair vendor pricing model',
        'Modern mobile-first experience',
        'AI-powered recommendations',
      ],
      threats: [
        'Direct competitor in Spain',
        'Massive existing user base',
        'Strong vendor lock-in',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/bodas-net',
    },
  },

  // Zankyou
  zankyou: {
    ...competitors.find(c => c.id === 'zankyou')!,
    businessModel: {
      type: 'hybrid',
      description: 'Combination of vendor marketplace and cash registry (lista de bodas). Strong in gift registries.',
      revenueStreams: [
        'Cash registry transaction fees',
        'Vendor listings',
        'Premium features',
        'International presence',
      ],
      pricing: [
        'Cash registry: 2-3% transaction fee',
        'Vendor listings: €500-3,000/year',
      ],
    },
    valueProposition: {
      headline: 'Tu lista de bodas online perfecta',
      points: [
        'Lista de bodas con dinero en efectivo',
        'Presencia en 20+ países',
        '9 idiomas disponibles',
        'Origen español, alcance global',
      ],
      targetAudience: 'Parejas internacionales, especialmente hispanas',
    },
    metrics: {
      monthlyVisitors: '2M+ (global)',
      weddingsPerYear: '150K+ globally',
    },
    fundingDetails: {
      totalRaised: 'Acquired by TKWW',
      lastRound: { type: 'Acquisition', amount: 'Undisclosed', date: 'Feb 2023' },
      investors: ['The Knot Worldwide (owner)'],
    },
    featureIds: [
      'wedding-management',
      'budget-planning',
      'marketplace',
      'wedding-websites',
    ],
    analysis: {
      strengths: [
        'Strong cash registry product',
        'International presence (20+ countries)',
        'Spanish-origin brand',
        'Multi-language support',
      ],
      weaknesses: [
        'Now owned by TKWW (same owner as Bodas.net)',
        'Limited planning features',
        'Transaction fees on registry',
      ],
      opportunities: [
        'Independent alternative needed',
        'Zero-fee cash registry opportunity',
        'Better planning integration',
      ],
      threats: [
        'Strong brand in Spanish-speaking markets',
        'TKWW backing',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/zankyou',
      crunchbase: 'https://crunchbase.com/organization/zankyou',
    },
  },

  // Zola
  zola: {
    ...competitors.find(c => c.id === 'zola')!,
    businessModel: {
      type: 'hybrid',
      description: 'Registry-first model with planning tools. Monetizes through registry commissions and brand partnerships.',
      revenueStreams: [
        'Registry commissions (20-30%)',
        'Brand partnerships (500+ brands)',
        'Wedding shop sales',
        'Premium paper goods',
      ],
      pricing: [
        'Planning tools: Free',
        'Registry: Free (commission on purchases)',
        'Paper invitations: $150-500+',
      ],
    },
    valueProposition: {
      headline: 'The wedding company reinventing the registry',
      points: [
        '500+ brand partners',
        'Zero-fee cash funds',
        'Integrated planning + registry',
        'Modern, design-forward aesthetic',
      ],
      targetAudience: 'Design-conscious millennials in the US',
    },
    metrics: {
      users: '3M+ couples',
      monthlyVisitors: '4M+',
      weddingsPerYear: '400K+',
    },
    fundingDetails: {
      totalRaised: '$141M',
      lastRound: { type: 'Series D', amount: '$100M', date: '2018' },
      investors: ['Comcast Ventures', 'Goldman Sachs', 'NBCUniversal', 'Lightspeed'],
      valuation: '~$650M',
    },
    featureIds: [
      'wedding-management',
      'guest-management',
      'onboarding-wizard',
      'budget-planning',
      'digital-invitations',
      'wedding-websites',
    ],
    roadmap: {
      announced: ['AI gift recommendations', 'Enhanced mobile experience'],
      rumored: ['International expansion'],
    },
    analysis: {
      strengths: [
        'Strong registry product',
        'Premium brand partnerships',
        'Design-forward aesthetic',
        'Solid funding',
      ],
      weaknesses: [
        'US-only focus',
        'Registry-centric (less planning depth)',
        'No vendor marketplace',
        'No B2B tools',
      ],
      opportunities: [
        'Focus on Spain/Europe',
        'Deeper planning features',
        'B2B integration',
      ],
      threats: [
        'Could expand internationally',
        'Strong brand recognition',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/zola',
      crunchbase: 'https://crunchbase.com/organization/zola',
      appStore: 'https://apps.apple.com/app/zola-weddings',
      playStore: 'https://play.google.com/store/apps/details?id=com.zola.android',
    },
  },

  // HoneyBook
  honeybook: {
    ...competitors.find(c => c.id === 'honeybook')!,
    businessModel: {
      type: 'subscription',
      description: 'SaaS subscription for creative entrepreneurs. Not wedding-specific but heavily used by wedding vendors.',
      revenueStreams: [
        'Monthly/annual subscriptions',
        'Payment processing fees',
        'Premium features',
      ],
      pricing: [
        'Starter: $19/month',
        'Essentials: $39/month',
        'Premium: $79/month',
      ],
    },
    valueProposition: {
      headline: 'The clientflow platform for independents',
      points: [
        'All-in-one business management',
        'Contracts, invoicing, payments',
        'Client communication hub',
        'Automation workflows',
      ],
      targetAudience: 'Wedding planners, photographers, and creative entrepreneurs',
    },
    metrics: {
      users: '100K+ businesses',
    },
    fundingDetails: {
      totalRaised: '$479M',
      lastRound: { type: 'Series E', amount: '$250M', date: '2021' },
      investors: ['Tiger Global', 'Durable Capital', 'Zeev Ventures', 'Norwest'],
      valuation: '$2.4B',
    },
    featureIds: [
      'b2b-planner-tools',
    ],
    analysis: {
      strengths: [
        'Mature B2B platform',
        'Full business management suite',
        'Strong wedding planner adoption',
        'Well-funded',
      ],
      weaknesses: [
        'Not wedding-specific',
        'No B2C component',
        'No Spanish localization',
        'Expensive for small vendors',
      ],
      opportunities: [
        'Wedding-specific B2B tools gap',
        'Spanish/European market',
        'B2C+B2B integration opportunity',
      ],
      threats: [
        'Could add wedding-specific features',
        'Strong existing user base',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/honeybook',
      crunchbase: 'https://crunchbase.com/organization/honeybook',
    },
  },

  // Bridebook
  bridebook: {
    ...competitors.find(c => c.id === 'bridebook')!,
    businessModel: {
      type: 'freemium',
      description: 'Free planning tools with vendor marketplace monetization. AI-powered recommendations.',
      revenueStreams: [
        'Vendor listings and leads',
        'Premium vendor features',
        'AI-powered matching fees',
      ],
      pricing: [
        'Couples: Free',
        'Vendors: Freemium model',
      ],
    },
    valueProposition: {
      headline: 'The UK\'s #1 wedding planning app',
      points: [
        '71% UK market share',
        'AI-powered vendor matching',
        'Budget tracking tools',
        'Guest list management',
      ],
      targetAudience: 'UK engaged couples',
    },
    metrics: {
      users: '2M+ UK couples',
      monthlyVisitors: '1.5M+',
      marketShare: '71% (UK market)',
    },
    fundingDetails: {
      totalRaised: '$18.9M',
      investors: ['Passion Capital', 'Index Ventures', 'LocalGlobe'],
      valuation: '$34.4M',
    },
    featureIds: [
      'wedding-management',
      'guest-management',
      'budget-planning',
      'marketplace',
    ],
    analysis: {
      strengths: [
        'UK market leader (independent)',
        'AI-powered recommendations',
        'Modern mobile-first design',
        'Not owned by TKWW',
      ],
      weaknesses: [
        'UK-focused only',
        'Smaller than TKWW',
        'Limited international presence',
      ],
      opportunities: [
        'Similar independent approach for Spain',
        'AI-first strategy validation',
        'Potential partnership/learnings',
      ],
      threats: [
        'Could expand to Europe',
        'Proves independent model works',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/bridebook',
      crunchbase: 'https://crunchbase.com/organization/bridebook',
      appStore: 'https://apps.apple.com/app/bridebook-wedding-planner',
    },
  },

  // Paperless Post
  paperlesspost: {
    ...competitors.find(c => c.id === 'paperlesspost')!,
    businessModel: {
      type: 'transaction',
      description: 'Pay-per-use digital invitations with premium designs and designer partnerships.',
      revenueStreams: [
        'Digital invitation sales',
        'Designer collaborations',
        'Premium paper goods',
        'Corporate events',
      ],
      pricing: [
        'Free designs: Limited options',
        'Premium designs: $1-3 per guest',
        'Designer collections: Premium pricing',
      ],
    },
    valueProposition: {
      headline: 'Beautiful invitations for every occasion',
      points: [
        'Designer partnerships (Kate Spade, Oscar de la Renta)',
        'Premium aesthetic',
        'Easy guest management',
        'Paper + digital options',
      ],
      targetAudience: 'Design-conscious hosts for all events',
    },
    metrics: {
      users: '200M+ invitations sent',
    },
    fundingDetails: {
      totalRaised: '$47-50M',
      investors: ['RRE Ventures', 'Battery Ventures'],
    },
    featureIds: [
      'digital-invitations',
      'guest-management',
    ],
    analysis: {
      strengths: [
        'Premium brand positioning',
        'Designer partnerships',
        'Broad event types',
        'Quality design library',
      ],
      weaknesses: [
        'Not wedding-specific',
        'No planning tools',
        'Pay-per-use model',
        'US-focused',
      ],
      opportunities: [
        'Integrated wedding platform advantage',
        'Free/freemium model opportunity',
      ],
      threats: [
        'Invitation feature competition',
        'Premium design benchmark',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/paperless-post',
      crunchbase: 'https://crunchbase.com/organization/paperless-post',
    },
  },

  // Partiful
  partiful: {
    ...competitors.find(c => c.id === 'partiful')!,
    businessModel: {
      type: 'freemium',
      description: '100% free event platform monetized through future premium features. SMS-first approach.',
      revenueStreams: [
        'VC-funded growth stage',
        'Future: Premium features',
        'Future: Brand partnerships',
      ],
      pricing: [
        'All features: Free',
      ],
    },
    valueProposition: {
      headline: 'The event platform for the group chat generation',
      points: [
        '100% free',
        'SMS-first invitations',
        'Gen Z-focused design',
        'Group coordination features',
      ],
      targetAudience: 'Gen Z and young millennials',
    },
    metrics: {
      users: '10M+ events hosted',
    },
    fundingDetails: {
      totalRaised: '$27.4M',
      investors: ['a16z', 'Google Ventures', 'Founders Fund'],
      valuation: '$140M',
    },
    featureIds: [
      'digital-invitations',
      'guest-management',
    ],
    analysis: {
      strengths: [
        'Gen Z native design',
        'SMS-first approach',
        '100% free model',
        'Strong VC backing (a16z)',
      ],
      weaknesses: [
        'Not wedding-specific',
        'US-focused',
        'No planning tools',
        'Early stage',
      ],
      opportunities: [
        'Wedding-specific features advantage',
        'Integrated platform value',
        'Spanish market gap',
      ],
      threats: [
        'Could add wedding features',
        'Gen Z market capture',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/partiful',
      crunchbase: 'https://crunchbase.com/organization/partiful',
    },
  },

  // Weddie.app
  weddie: {
    ...competitors.find(c => c.id === 'weddie')!,
    businessModel: {
      type: 'one-time',
      description: 'One-time purchase for wedding planning PWA with AI photo features.',
      revenueStreams: [
        'One-time purchase ($249)',
        'Premium add-ons',
      ],
      pricing: [
        'Full access: $249 one-time',
      ],
    },
    valueProposition: {
      headline: 'AI-powered wedding planning and photo sharing',
      points: [
        'PWA - no download needed',
        'AI photo organization',
        '15+ languages',
        'One-time payment',
      ],
      targetAudience: 'European tech-savvy couples',
    },
    metrics: {
      users: 'Growing startup',
    },
    fundingDetails: {
      totalRaised: 'Unknown',
      investors: [],
    },
    featureIds: [
      'wedding-management',
      'guest-management',
      'ai-bridal-styling',
    ],
    analysis: {
      strengths: [
        'AI-powered features',
        'PWA approach',
        'Multi-language support',
        'European focus',
      ],
      weaknesses: [
        'Small company',
        'One-time purchase limits revenue',
        'Limited feature set',
      ],
      opportunities: [
        'Validate European market appetite',
        'AI features benchmark',
      ],
      threats: [
        'European competitor',
        'AI photo features',
      ],
    },
    links: {},
  },

  // Wataboda
  wataboda: {
    ...competitors.find(c => c.id === 'wataboda')!,
    businessModel: {
      type: 'one-time',
      description: 'One-time purchase Spanish wedding app with photo album feature.',
      revenueStreams: [
        'One-time purchase (€149)',
        'Photo album service',
      ],
      pricing: [
        'Full access: €149 one-time',
        'Photo album: included for 6 months',
      ],
    },
    valueProposition: {
      headline: 'Tu app de boda todo en uno',
      points: [
        'Nativa en español',
        'Precio único',
        'Album de fotos incluido',
        'Sin suscripciones',
      ],
      targetAudience: 'Parejas españolas',
    },
    metrics: {},
    fundingDetails: {
      totalRaised: 'Bootstrapped',
      investors: [],
    },
    featureIds: [
      'wedding-management',
      'guest-management',
      'digital-invitations',
    ],
    analysis: {
      strengths: [
        'Spanish-native',
        'Simple one-time pricing',
        'Photo album feature',
      ],
      weaknesses: [
        'Small team',
        'Limited features',
        'No vendor marketplace',
      ],
      opportunities: [
        'Spanish market validation',
        'Feature differentiation',
      ],
      threats: [
        'Minor competitor',
        'Same target market',
      ],
    },
    links: {},
  },

  // BodaLIVE
  bodalive: {
    ...competitors.find(c => c.id === 'bodalive')!,
    businessModel: {
      type: 'one-time',
      description: 'Day-of wedding entertainment services.',
      revenueStreams: [
        'Service packages (from €250)',
        'Add-on features',
      ],
      pricing: [
        'PhotoLive: from €250',
        'MusicLive: from €350',
        'GameLive: from €200',
      ],
    },
    valueProposition: {
      headline: 'Experiencias interactivas para tu boda',
      points: [
        'PhotoLive - fotos en tiempo real',
        'MusicLive - votación de canciones',
        'GameLive - juegos interactivos',
      ],
      targetAudience: 'Parejas españolas buscando entretenimiento',
    },
    metrics: {},
    fundingDetails: {
      totalRaised: 'Bootstrapped',
      investors: [],
    },
    featureIds: [
      'day-coordination',
    ],
    analysis: {
      strengths: [
        'Unique day-of features',
        'Spanish market focus',
        'Entertainment niche',
      ],
      weaknesses: [
        'Very niche product',
        'No planning features',
        'Small company',
      ],
      opportunities: [
        'Potential partnership',
        'Day-of feature inspiration',
      ],
      threats: [
        'Minimal - different focus',
      ],
    },
    links: {},
  },

  // Aisle Planner
  aisleplanner: {
    ...competitors.find(c => c.id === 'aisleplanner')!,
    businessModel: {
      type: 'subscription',
      description: 'SaaS for professional wedding planners.',
      revenueStreams: [
        'Monthly subscriptions',
        'Annual plans',
      ],
      pricing: [
        'Basic: $29/month',
        'Pro: $49/month',
        'Enterprise: Custom',
      ],
    },
    valueProposition: {
      headline: 'Professional wedding planner software',
      points: [
        'CAD floor plans',
        'Timeline management',
        'Seating arrangements',
        'Vendor collaboration',
      ],
      targetAudience: 'Professional wedding planners',
    },
    metrics: {
      users: '10K+ planners',
    },
    fundingDetails: {
      totalRaised: 'Unknown',
      investors: [],
    },
    featureIds: [
      'b2b-planner-tools',
      'day-coordination',
    ],
    analysis: {
      strengths: [
        'Best-in-class planner tools',
        'CAD floor planning',
        'Established market presence',
      ],
      weaknesses: [
        'US-focused',
        'No Spanish localization',
        'B2B only',
      ],
      opportunities: [
        'Spanish B2B market gap',
        'B2C+B2B integration',
      ],
      threats: [
        'B2B feature benchmark',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/aisle-planner',
    },
  },

  // That's The One
  thatstheone: {
    ...competitors.find(c => c.id === 'thatstheone')!,
    businessModel: {
      type: 'subscription',
      description: 'European B2B wedding planner platform.',
      revenueStreams: [
        'Flat monthly subscription',
      ],
      pricing: [
        'All features: $55/month',
      ],
    },
    valueProposition: {
      headline: 'Wedding planning software for professionals',
      points: [
        '7 languages',
        '20+ currencies',
        'Simple flat pricing',
        'European focus',
      ],
      targetAudience: 'European wedding planners',
    },
    metrics: {},
    fundingDetails: {
      totalRaised: 'VC-backed',
      investors: [],
    },
    featureIds: [
      'b2b-planner-tools',
      'day-coordination',
    ],
    analysis: {
      strengths: [
        'European focus',
        'Multi-currency support',
        'Simple pricing',
      ],
      weaknesses: [
        'UK-based (post-Brexit)',
        'Limited Spanish presence',
        'B2B only',
      ],
      opportunities: [
        'Closest European B2B competitor',
        'Spanish B2B market still open',
      ],
      threats: [
        'Could expand to Spain',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/thats-the-one',
    },
  },

  // Dubsado
  dubsado: {
    ...competitors.find(c => c.id === 'dubsado')!,
    businessModel: {
      type: 'subscription',
      description: 'Customizable business management for creatives.',
      revenueStreams: [
        'Monthly/annual subscriptions',
      ],
      pricing: [
        'Starter: $20/month',
        'Premier: $40/month',
      ],
    },
    valueProposition: {
      headline: 'Highly customizable business management',
      points: [
        'White-label options',
        'Custom workflows',
        'Affordable pricing',
        'Creative-focused',
      ],
      targetAudience: 'Wedding photographers and small vendors',
    },
    metrics: {},
    fundingDetails: {
      totalRaised: 'Bootstrapped',
      investors: [],
      valuation: '~$2.5M revenue',
    },
    featureIds: [
      'b2b-planner-tools',
    ],
    analysis: {
      strengths: [
        'Highly customizable',
        'Affordable',
        'Bootstrap success story',
      ],
      weaknesses: [
        'Not wedding-specific',
        'US-focused',
        'Small team',
      ],
      opportunities: [
        'Wedding-specific advantage',
        'B2C+B2B integration',
      ],
      threats: [
        'Minimal - different market segment',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/dubsado',
    },
  },

  // David's Bridal
  davidsbridal: {
    ...competitors.find(c => c.id === 'davidsbridal')!,
    businessModel: {
      type: 'transaction',
      description: 'Traditional retail with digital AI features.',
      revenueStreams: [
        'Dress and accessory sales',
        'Alterations services',
        'AI planning tool (Pearl)',
      ],
      pricing: [
        'Dresses: $200-2,000+',
        'Pearl Planner: Free',
      ],
    },
    valueProposition: {
      headline: 'The destination for all things wedding',
      points: [
        'Largest bridal retailer',
        'Pearl Planner (GPT-powered)',
        '3D/AR dress visualization',
        'In-store + online experience',
      ],
      targetAudience: 'Budget to mid-range brides',
    },
    metrics: {
      users: 'Millions of brides annually',
    },
    fundingDetails: {
      totalRaised: 'Public company',
      investors: ['Public market'],
    },
    featureIds: [
      'ai-bridal-styling',
    ],
    analysis: {
      strengths: [
        'Largest bridal retailer',
        'AI/AR innovation',
        'Physical + digital presence',
      ],
      weaknesses: [
        'Retail focus, not planning',
        'US-centric',
        'Financial struggles (bankruptcy history)',
      ],
      opportunities: [
        'AI bridal market is nascent',
        'No European AI bridal player',
      ],
      threats: [
        'AI feature benchmark',
        'Could expand AI tools',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/davids-bridal',
    },
  },

  // Bridely
  bridely: {
    ...competitors.find(c => c.id === 'bridely')!,
    businessModel: {
      type: 'freemium',
      description: 'AI virtual try-on for bridal dresses.',
      revenueStreams: [
        'Freemium model',
        'Premium try-on features',
        'B2B retailer partnerships',
      ],
      pricing: [
        'Basic: Free',
        'Premium: TBD',
      ],
    },
    valueProposition: {
      headline: 'Try on wedding dresses virtually with AI',
      points: [
        'Body shape analysis',
        '500+ dresses',
        'Ethnic market focus',
        'AI-powered recommendations',
      ],
      targetAudience: 'Brides wanting to try dresses virtually',
    },
    metrics: {},
    fundingDetails: {
      totalRaised: 'Unknown',
      investors: [],
    },
    featureIds: [
      'ai-bridal-styling',
    ],
    analysis: {
      strengths: [
        'AI try-on technology',
        'Ethnic market focus',
        'Growing catalog',
      ],
      weaknesses: [
        'Very early stage',
        'US-focused',
        'Single feature product',
      ],
      opportunities: [
        'European AI bridal gap',
        'Platform integration opportunity',
      ],
      threats: [
        'Minimal - early stage',
      ],
    },
    links: {},
  },

  // Perfect Corp
  perfectcorp: {
    ...competitors.find(c => c.id === 'perfectcorp')!,
    businessModel: {
      type: 'subscription',
      description: 'Enterprise AR/AI platform for beauty and fashion.',
      revenueStreams: [
        'Enterprise SaaS subscriptions',
        'Per-use API fees',
        'White-label solutions',
      ],
      pricing: [
        'Enterprise: Custom pricing',
        'API: Per-use',
      ],
    },
    valueProposition: {
      headline: 'The global leader in beauty tech AI',
      points: [
        'Enterprise-grade AR platform',
        'Beauty/jewelry/fashion focus',
        'NYSE listed (PERF)',
        'Global enterprise clients',
      ],
      targetAudience: 'Enterprise beauty and fashion brands',
    },
    metrics: {},
    fundingDetails: {
      totalRaised: '$75M+',
      investors: ['Goldman Sachs', 'Softbank'],
      valuation: '~$1B',
    },
    featureIds: [
      'ai-bridal-styling',
    ],
    analysis: {
      strengths: [
        'Enterprise-grade AR technology',
        'Public company resources',
        'Proven technology',
      ],
      weaknesses: [
        'Not wedding-specific',
        'Enterprise focus (not B2C)',
        'High cost for integration',
      ],
      opportunities: [
        'Technology partnership potential',
        'B2C wedding opportunity gap',
      ],
      threats: [
        'Could power competitor AI features',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/perfect-corp',
      crunchbase: 'https://crunchbase.com/organization/perfect-corp',
    },
  },

  // Hitched
  hitched: {
    ...competitors.find(c => c.id === 'hitched')!,
    businessModel: {
      type: 'marketplace',
      description: 'UK wedding marketplace owned by TKWW.',
      revenueStreams: [
        'Vendor listings',
        'Lead generation',
        'Premium features',
      ],
      pricing: [
        'Vendor listings: Varies',
        'Couples: Free',
      ],
    },
    valueProposition: {
      headline: 'The UK\'s biggest wedding planning website',
      points: [
        '18,000+ UK vendors',
        'Planning tools',
        'Supplier directory',
        'Part of TKWW network',
      ],
      targetAudience: 'UK engaged couples',
    },
    metrics: {
      vendors: '18,000+',
    },
    fundingDetails: {
      totalRaised: 'Part of TKWW',
      lastRound: { type: 'Acquisition', amount: 'Undisclosed', date: '2020' },
      investors: ['The Knot Worldwide'],
    },
    featureIds: [
      'wedding-management',
      'marketplace',
      'wedding-websites',
    ],
    analysis: {
      strengths: [
        'TKWW backing',
        'UK vendor network',
        'Established brand',
      ],
      weaknesses: [
        'UK-only',
        'Part of TKWW monopoly',
        'Competing with Bridebook',
      ],
      opportunities: [
        'Independent UK alternative (like Bridebook)',
      ],
      threats: [
        'TKWW expansion pattern',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/hitched',
    },
  },

  // WedMeGood
  wedmegood: {
    ...competitors.find(c => c.id === 'wedmegood')!,
    businessModel: {
      type: 'marketplace',
      description: 'Indian wedding marketplace and planning platform.',
      revenueStreams: [
        'Vendor listings',
        'Lead generation',
        'Wedding planning services',
      ],
      pricing: [
        'Vendor listings: Varies',
        'Couples: Free',
      ],
    },
    valueProposition: {
      headline: 'India\'s favourite wedding planning platform',
      points: [
        '150,000+ vendors',
        '2M+ monthly users',
        'Indian wedding expertise',
        'Real wedding galleries',
      ],
      targetAudience: 'Indian couples',
    },
    metrics: {
      vendors: '150,000+',
      monthlyVisitors: '2M+',
    },
    fundingDetails: {
      totalRaised: '$3.07M',
      investors: ['Matrimony.com'],
      valuation: '~$3.4M revenue',
    },
    featureIds: [
      'wedding-management',
      'marketplace',
    ],
    analysis: {
      strengths: [
        'Indian market leader',
        'Massive vendor network',
        'Cultural expertise',
      ],
      weaknesses: [
        'India-only focus',
        'Different market dynamics',
      ],
      opportunities: [
        'Learn from their vendor approach',
        'No direct competition',
      ],
      threats: [
        'Minimal - different market',
      ],
    },
    links: {
      linkedin: 'https://linkedin.com/company/wedmegood',
      crunchbase: 'https://crunchbase.com/organization/wedmegood',
    },
  },

  // AColores Design
  acolores: {
    ...competitors.find(c => c.id === 'acolores')!,
    businessModel: {
      type: 'transaction',
      description: 'Video and animated wedding invitations service.',
      revenueStreams: [
        'Invitation design and creation',
        'Custom animations',
      ],
      pricing: [
        'Video invitations: Custom pricing',
        '1 year availability included',
      ],
    },
    valueProposition: {
      headline: 'Invitaciones de boda animadas y en video',
      points: [
        '14 secciones interactivas',
        'Diseño personalizado',
        'Animaciones únicas',
        '1 año de disponibilidad',
      ],
      targetAudience: 'Parejas españolas buscando invitaciones únicas',
    },
    metrics: {},
    fundingDetails: {
      totalRaised: 'Bootstrapped',
      investors: [],
    },
    featureIds: [
      'digital-invitations',
    ],
    analysis: {
      strengths: [
        'Video invitation specialization',
        'Spanish market focus',
        'Unique animations',
      ],
      weaknesses: [
        'Single product',
        'Small operation',
        'No planning features',
      ],
      opportunities: [
        'Invitation feature inspiration',
        'Potential partnership',
      ],
      threats: [
        'Minimal - niche product',
      ],
    },
    links: {},
  },

  // Vitte Design
  vitte: {
    ...competitors.find(c => c.id === 'vitte')!,
    businessModel: {
      type: 'transaction',
      description: 'Luxury wedding stationery and calligraphy.',
      revenueStreams: [
        'Custom stationery design',
        'Calligraphy services',
        'Premium paper goods',
      ],
      pricing: [
        'Premium tier pricing',
        'Custom quotes',
      ],
    },
    valueProposition: {
      headline: 'Papelería de boda de lujo artesanal',
      points: [
        'Caligrafía artesanal',
        'Diseño premium',
        'Materiales de alta calidad',
        'Personalización total',
      ],
      targetAudience: 'Parejas de alto presupuesto',
    },
    metrics: {},
    fundingDetails: {
      totalRaised: 'Bootstrapped',
      investors: [],
    },
    featureIds: [
      'digital-invitations',
    ],
    analysis: {
      strengths: [
        'Premium positioning',
        'Artisan quality',
        'Spanish market expertise',
      ],
      weaknesses: [
        'Very niche (luxury only)',
        'Small scale',
        'Physical focus',
      ],
      opportunities: [
        'Different market segment',
        'No direct competition',
      ],
      threats: [
        'Minimal - luxury niche',
      ],
    },
    links: {},
  },
};

// Helper function to get competitor detail by ID
export function getCompetitorDetail(id: string): CompetitorDetail | undefined {
  return competitorDetails[id];
}

// Helper to get all competitor IDs
export function getAllCompetitorIds(): string[] {
  return competitors.map(c => c.id);
}

// Helper to get competitor by ID
export function getCompetitorById(id: string): Competitor | undefined {
  return competitors.find(c => c.id === id);
}
