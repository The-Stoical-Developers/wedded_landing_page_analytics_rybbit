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

export interface CategoryDetail extends CategoryInfo {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  detailedOpportunities: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    marketEvidence?: string;
  }>;
  weddedAdvantages: Array<{
    title: string;
    description: string;
  }>;
  competitiveStrategies: Array<{
    competitorId: string;
    competitorName: string;
    theirWeakness: string;
    howWeWin: string[];
  }>;
  blueOcean?: {
    eliminate: string[];
    reduce: string[];
    raise: string[];
    create: string[];
  };
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

// ========================================
// CATEGORY DETAILS DATA
// ========================================

export const categoryDetails: Record<string, CategoryDetail> = {
  planning: {
    ...categories.find(c => c.id === 'planning')!,
    swot: {
      strengths: [
        'AI-powered personalized timelines adapt to each couple\'s unique needs',
        'Spanish-native UX with cultural context (religious ceremonies, legal requirements)',
        'Open-source transparency builds trust vs black-box competitors',
        '39 proprietary wedding KPIs for data-driven planning',
      ],
      weaknesses: [
        'Smaller user base vs established players (The Knot: 25M couples)',
        'Less brand recognition in international markets',
        'Fewer vendor partnerships for budget estimates',
      ],
      opportunities: [
        'No competitor offers AI-personalized planning in Spanish market',
        'Couples want privacy-first tools — 67% concerned about data selling',
        'B2C+B2B integration lets planners and couples share a single timeline',
        'Self-hostable option appeals to privacy-conscious European market',
      ],
      threats: [
        'The Knot/Bodas.net could copy AI planning features with bigger budgets',
        'Joy\'s free model removes price as differentiator',
        'Zola expanding internationally could enter Spanish market',
      ],
    },
    detailedOpportunities: [
      {
        title: 'AI-Powered Cultural Planning',
        description: 'Build the first wedding planner that understands Spanish cultural nuances: civil vs religious ceremonies, regional traditions, seasonal preferences.',
        priority: 'high',
        marketEvidence: '150K+ annual weddings in Spain with no AI-native planning solution',
      },
      {
        title: 'Privacy-First Planning Dashboard',
        description: 'Offer cookieless analytics and self-hostable planning tools — unique selling point in post-GDPR Europe.',
        priority: 'high',
        marketEvidence: '67% of couples express concerns about wedding data being sold to vendors',
      },
      {
        title: 'Integrated B2C+B2B Timeline',
        description: 'Single shared timeline between couple and their planner — eliminates dual-tool friction.',
        priority: 'medium',
        marketEvidence: 'No competitor combines B2C and B2B planning in one platform',
      },
    ],
    weddedAdvantages: [
      {
        title: 'AI Personalization',
        description: 'Machine learning adapts timelines, budgets, and task lists to each couple\'s priorities, culture, and budget.',
      },
      {
        title: 'Spanish-Native Experience',
        description: 'Built for Spanish market from day one — not a translated US product. Understands local vendors, traditions, and legal requirements.',
      },
      {
        title: 'Open Source & Transparent',
        description: 'AGPL-3.0 license means couples can inspect, audit, and self-host. No black boxes, no hidden data selling.',
      },
      {
        title: '39 Wedding KPIs',
        description: 'Proprietary analytics dashboard tracks engagement, budget, tasks, and vendor performance with metrics no competitor offers.',
      },
    ],
    competitiveStrategies: [
      {
        competitorId: 'tkww',
        competitorName: 'The Knot Worldwide',
        theirWeakness: 'Legacy technology stack, fragmented UX across brands, vendor-first approach over couple experience',
        howWeWin: [
          'Modern AI-first architecture vs their legacy systems',
          'Unified experience vs their 5+ fragmented brands',
          'Couple-first approach vs their vendor-revenue focus',
          'Fair pricing vs their predatory 12-month vendor lock-ins',
        ],
      },
      {
        competitorId: 'joy',
        competitorName: 'Joy (WithJoy)',
        theirWeakness: 'US-centric with no Spanish localization, no B2B tools, limited revenue diversification',
        howWeWin: [
          'Spanish-native vs their English-only approach',
          'B2C+B2B integration they lack entirely',
          'Wedding analytics (39 KPIs) vs their basic tracking',
          'Self-hostable option for privacy-conscious European couples',
        ],
      },
      {
        competitorId: 'bodasnet',
        competitorName: 'Bodas.net',
        theirWeakness: 'Dated UI, owned by TKWW (monopoly), expensive for vendors, limited innovation',
        howWeWin: [
          'Modern mobile-first UX vs their dated interface',
          'Independent alternative to TKWW monopoly',
          'AI-powered personalization vs static checklists',
          'Open-source builds community trust',
        ],
      },
    ],
    blueOcean: {
      eliminate: ['Provider-first approach', 'Corporate tone and "magazine-perfect" content', '12-month vendor lock-ins'],
      reduce: ['Feature bloat (focus on what couples actually need)', 'Vendor > couple hierarchy'],
      raise: ['AI personalization for every planning step', 'Spanish cultural authenticity', 'Privacy and data transparency'],
      create: ['Wedding analytics dashboard (39 KPIs)', 'Self-hostable planning platform', 'B2C+B2B unified experience', 'Rebel community (#antibride)'],
    },
  },

  'guest-management': {
    ...categories.find(c => c.id === 'guest-management')!,
    swot: {
      strengths: [
        'WhatsApp-native RSVP — the channel Spanish guests actually use',
        'Integrated seating with drag-and-drop floor plans',
        'Real-time guest analytics dashboard',
        'Multi-language guest communication (Spanish, Catalan, Basque, English)',
      ],
      weaknesses: [
        'Smaller guest database for AI recommendations',
        'No built-in physical invitation printing service',
        'Less RSVP template variety than Joy (601+ themes)',
      ],
      opportunities: [
        'WhatsApp integration is massively underserved — 95% of Spanish adults use it',
        'Seating AI using guest relationship data is unexplored',
        'Dietary restrictions tracking integrated with caterer communication',
        'Group accommodation coordination for destination weddings',
      ],
      threats: [
        'Joy could add WhatsApp support with their engineering resources',
        'Zola\'s guest management is polished and well-funded',
        'Wataboda targets same Spanish market segment',
      ],
    },
    detailedOpportunities: [
      {
        title: 'WhatsApp-Native RSVP System',
        description: 'Build RSVP that works entirely within WhatsApp — send invites, collect responses, dietary preferences, and plus-one confirmations via the messaging app Spanish guests already live in.',
        priority: 'high',
        marketEvidence: '95% of Spanish adults use WhatsApp daily; no wedding platform offers native WhatsApp RSVP',
      },
      {
        title: 'AI Seating Arrangement',
        description: 'Use guest relationship data, dietary needs, and language preferences to suggest optimal seating arrangements.',
        priority: 'medium',
        marketEvidence: 'Seating is the #1 stress point cited by 73% of couples',
      },
      {
        title: 'Group Accommodation Coordinator',
        description: 'Help manage hotel blocks, transportation, and group bookings for out-of-town guests.',
        priority: 'medium',
      },
    ],
    weddedAdvantages: [
      {
        title: 'WhatsApp Integration',
        description: 'Native WhatsApp RSVP and guest communication. Not email-first like US competitors — built for how Spanish couples actually communicate.',
      },
      {
        title: 'Real-Time Guest Analytics',
        description: 'Live dashboard showing RSVP rates, dietary breakdown, accommodation needs, and response trends over time.',
      },
      {
        title: 'Multi-Language Guest Pages',
        description: 'Guest-facing pages automatically adapt language based on guest preference — Spanish, Catalan, Basque, English, French.',
      },
    ],
    competitiveStrategies: [
      {
        competitorId: 'joy',
        competitorName: 'Joy (WithJoy)',
        theirWeakness: 'Email-centric RSVP, US-only focus, no WhatsApp integration, no Spanish localization',
        howWeWin: [
          'WhatsApp-first vs their email-first approach',
          'Spanish-native UX and multi-regional language support',
          'Integrated with B2B planner tools for seating coordination',
        ],
      },
      {
        competitorId: 'zola',
        competitorName: 'Zola',
        theirWeakness: 'US-only, registry-focused with guest management as secondary, no European presence',
        howWeWin: [
          'Guest management as core feature vs their registry afterthought',
          'WhatsApp integration for European market',
          'Privacy-first approach to guest data',
        ],
      },
      {
        competitorId: 'wataboda',
        competitorName: 'Wataboda',
        theirWeakness: 'Limited features, small team, basic RSVP without analytics',
        howWeWin: [
          'Full analytics dashboard vs their basic tracking',
          'AI-powered seating vs manual arrangement',
          'Scalable platform vs their €149 one-time app',
        ],
      },
    ],
  },

  invitations: {
    ...categories.find(c => c.id === 'invitations')!,
    swot: {
      strengths: [
        'Video invitation support — the growing format Spanish couples love',
        'Cultural template library (religious, civil, destination)',
        'Integrated RSVP tracking within invitation flow',
        'No per-guest pricing — flat or free model',
      ],
      weaknesses: [
        'Fewer designer partnerships than Paperless Post',
        'Less template variety than Zola or Joy initially',
        'No physical/paper invitation option',
      ],
      opportunities: [
        'Video invitations market growing 40%+ YoY and no platform owns it',
        'Spanish cultural customization is completely unaddressed',
        'Interactive invitations with embedded maps, timelines, and RSVP',
        'WhatsApp-shareable invitation format',
      ],
      threats: [
        'Paperless Post\'s designer partnerships set quality expectations high',
        'Joy offers 601+ free designs — hard to beat on volume',
        'AColores and Vitte own Spanish artisan invitation niche',
      ],
    },
    detailedOpportunities: [
      {
        title: 'Video Invitation Platform',
        description: 'Build a video invitation creator with templates, music, and photo montage — the format that gets 3x engagement vs static cards.',
        priority: 'high',
        marketEvidence: 'Video invitations growing 40%+ YoY; no major platform offers easy video creation',
      },
      {
        title: 'WhatsApp-Shareable Invitations',
        description: 'Invitations optimized for WhatsApp sharing — proper preview cards, instant loading, embedded RSVP.',
        priority: 'high',
        marketEvidence: 'Most Spanish couples share wedding info through WhatsApp groups, not email',
      },
      {
        title: 'Interactive Cultural Templates',
        description: 'Templates that adapt to ceremony type — Catholic, civil, mixed, destination — with appropriate imagery and language.',
        priority: 'medium',
      },
    ],
    weddedAdvantages: [
      {
        title: 'Video-First Invitations',
        description: 'Built-in video invitation creator with templates, music library, and photo montage. Not just digital cards — cinematic wedding invitations.',
      },
      {
        title: 'Cultural Customization',
        description: 'Templates designed for Spanish wedding culture: religious vs civil, regional traditions, bilingual options for international guests.',
      },
      {
        title: 'No Per-Guest Pricing',
        description: 'Send to unlimited guests without Paperless Post\'s $1-3/guest model. Flat pricing or included in platform.',
      },
      {
        title: 'Integrated RSVP Flow',
        description: 'RSVP is embedded in the invitation itself — guests respond without leaving the experience.',
      },
    ],
    competitiveStrategies: [
      {
        competitorId: 'paperlesspost',
        competitorName: 'Paperless Post',
        theirWeakness: 'Pay-per-guest model ($1-3/guest), not wedding-specific, US-focused, no video support',
        howWeWin: [
          'Flat/free pricing vs their per-guest model',
          'Video invitations they don\'t offer',
          'Wedding-specific features vs their general event focus',
          'Spanish cultural templates vs their US-centric designs',
        ],
      },
      {
        competitorId: 'joy',
        competitorName: 'Joy (WithJoy)',
        theirWeakness: 'Static designs only, no video invitations, US-focused templates',
        howWeWin: [
          'Video invitation creator vs their static-only approach',
          'Spanish cultural templates vs English-only designs',
          'WhatsApp-optimized sharing vs email-centric delivery',
        ],
      },
    ],
    blueOcean: {
      eliminate: ['Per-guest pricing model', 'Email-only delivery'],
      reduce: ['Static template dependency', 'Designer brand markup'],
      raise: ['Video and animation quality', 'Cultural customization depth', 'Mobile-first sharing experience'],
      create: ['Video invitation creator with templates', 'WhatsApp-native invitation format', 'Embedded RSVP + guest analytics'],
    },
  },

  websites: {
    ...categories.find(c => c.id === 'websites')!,
    swot: {
      strengths: [
        'True multilingual support (not just translated UI)',
        'European-aesthetic templates designed for Mediterranean weddings',
        'Privacy-first — no tracking scripts on guest-facing pages',
        'Self-hostable option for tech-savvy couples',
      ],
      weaknesses: [
        'Fewer templates than Zola or Joy at launch',
        'No custom domain support initially',
        'Less integration with US registry services',
      ],
      opportunities: [
        'Multilingual wedding websites for international couples in Europe',
        'Privacy-compliant websites (GDPR) as differentiator',
        'Real wedding analytics on guest website engagement',
        'Progressive Web App wedding websites for offline access at venue',
      ],
      threats: [
        'Zola and Joy have polished, battle-tested website builders',
        'Riley & Grey dominates luxury wedding website niche',
        'Squarespace/Wix offer generic website builders couples sometimes use',
      ],
    },
    detailedOpportunities: [
      {
        title: 'True Multilingual Wedding Websites',
        description: 'Automatic content adaptation per guest language — not just UI translation. Schedule in local time, currency in local format, directions from guest\'s country.',
        priority: 'high',
        marketEvidence: '35% of weddings in Spain involve at least one international partner',
      },
      {
        title: 'GDPR-Native Guest Websites',
        description: 'Wedding websites that are privacy-compliant by default — no cookie banners needed, no tracking, no data selling.',
        priority: 'medium',
        marketEvidence: 'European couples increasingly wary of US platforms\' data practices',
      },
      {
        title: 'PWA Wedding Website',
        description: 'Guest-facing website works offline — critical for venue areas with poor connectivity. Cached schedule, maps, and contact info.',
        priority: 'medium',
      },
    ],
    weddedAdvantages: [
      {
        title: 'True Multilingual',
        description: 'Not just translated menus — full content localization including dates, times, currencies, and directions adapted per guest\'s language and location.',
      },
      {
        title: 'Privacy-First Design',
        description: 'No tracking scripts, no cookie banners, no third-party analytics on guest-facing pages. GDPR-compliant by architecture, not by policy.',
      },
      {
        title: 'European Aesthetics',
        description: 'Templates designed for Mediterranean venues, European photography styles, and local wedding cultures — not adapted from US templates.',
      },
    ],
    competitiveStrategies: [
      {
        competitorId: 'zola',
        competitorName: 'Zola',
        theirWeakness: 'US-only, English-only, registry-focused, no European presence',
        howWeWin: [
          'True multilingual support vs their English-only sites',
          'European templates vs their US aesthetic',
          'Privacy-first vs their data-monetization model',
        ],
      },
      {
        competitorId: 'joy',
        competitorName: 'Joy (WithJoy)',
        theirWeakness: 'English-centric, limited international features, no GDPR focus',
        howWeWin: [
          'Multilingual content adaptation per guest',
          'GDPR-native architecture',
          'European venue and aesthetic focus',
        ],
      },
    ],
  },

  'day-coordination': {
    ...categories.find(c => c.id === 'day-coordination')!,
    swot: {
      strengths: [
        'Real-time timeline management integrated with planning data',
        'Vendor coordination dashboard for day-of logistics',
        'Guest communication broadcast for day-of updates',
        'Built on the same platform couples already used for planning',
      ],
      weaknesses: [
        'Feature still in development — not yet battle-tested',
        'No CAD floor planning like Aisle Planner',
        'Less experience in day-of logistics than dedicated tools',
      ],
      opportunities: [
        'Zero Spanish-native day-of coordination solutions exist',
        'Combining planning data with day-of execution is unexplored',
        'Live guest tracking and engagement during the event',
        'Vendor real-time check-in and task management',
      ],
      threats: [
        'Aisle Planner has mature day-of features for planners',
        'Timeline Genius specifically built for wedding timelines',
        'BodaLIVE owns Spanish entertainment niche',
      ],
    },
    detailedOpportunities: [
      {
        title: 'Spanish-Native Day-Of Coordination',
        description: 'First day-of coordination tool built for Spanish wedding culture — ceremony + reception flow, timing norms, vendor communication in Spanish.',
        priority: 'high',
        marketEvidence: 'No Spanish-language day-of coordination tool exists in the market',
      },
      {
        title: 'Planning-to-Execution Continuity',
        description: 'Automatically convert the planning timeline into a day-of execution timeline — no re-entering data in a separate tool.',
        priority: 'high',
        marketEvidence: '89% of planners report using different tools for planning vs day-of execution',
      },
      {
        title: 'Live Guest Engagement Dashboard',
        description: 'Real-time metrics during the wedding: check-in rate, photo uploads, song requests, guest satisfaction.',
        priority: 'low',
      },
    ],
    weddedAdvantages: [
      {
        title: 'Seamless Planning-to-Day Transition',
        description: 'No data re-entry. Your planning timeline becomes your day-of execution timeline automatically.',
      },
      {
        title: 'Spanish Wedding Culture Built-In',
        description: 'Understands Spanish ceremony + banquet flow, typical timing, vendor coordination norms.',
      },
      {
        title: 'Vendor Real-Time Dashboard',
        description: 'Vendors get their own view with tasks, timeline, and communication — no more WhatsApp chaos.',
      },
    ],
    competitiveStrategies: [
      {
        competitorId: 'aisleplanner',
        competitorName: 'Aisle Planner',
        theirWeakness: 'US-focused, no Spanish localization, B2B only, expensive for small planners',
        howWeWin: [
          'Spanish-native vs their English-only tool',
          'B2C+B2B means couples AND planners on one platform',
          'Integrated with planning data vs their standalone tool',
        ],
      },
      {
        competitorId: 'bodalive',
        competitorName: 'BodaLIVE',
        theirWeakness: 'Entertainment-only niche, no planning or coordination features, per-service pricing',
        howWeWin: [
          'Full coordination vs their entertainment-only focus',
          'Integrated platform vs their standalone services',
          'Timeline management + guest coordination + entertainment in one',
        ],
      },
    ],
  },

  'b2c-planning': {
    ...categories.find(c => c.id === 'b2c-planning')!,
    swot: {
      strengths: [
        'Rebel brand voice resonates with modern couples (#antibride 96M TikTok views)',
        'All-in-one platform vs competitor fragmentation',
        'AI-powered personalization not just checklists',
        'Privacy-first approach in post-GDPR Europe',
      ],
      weaknesses: [
        'Smaller vendor network than Bodas.net (50K+ vendors)',
        'Less brand awareness in Spain than Bodas.net/Zankyou',
        'Newer platform with less social proof',
      ],
      opportunities: [
        'TKWW monopoly in Spain (Bodas.net + Zankyou = same owner) creates demand for independent alternative',
        'B2C+B2B integration nobody else offers',
        'Wedding analytics dashboard unique in market',
        'Community-driven platform vs corporate competitors',
      ],
      threats: [
        'Bodas.net has 60%+ Spanish market share',
        'Zankyou strong in cash registries',
        'The Knot/Zola could expand to Spain',
      ],
    },
    detailedOpportunities: [
      {
        title: 'Independent Alternative to TKWW Monopoly',
        description: 'Bodas.net + Zankyou are both TKWW-owned. Spanish couples need an independent, modern alternative that puts their interests first.',
        priority: 'high',
        marketEvidence: 'TKWW owns both #1 and #2 Spanish wedding platforms — monopoly concern',
      },
      {
        title: 'Rebel Brand Community',
        description: 'Build a community around the #antibride movement — couples who reject traditional wedding industry norms. 96M TikTok views prove demand.',
        priority: 'high',
        marketEvidence: '#antibride has 96M TikTok views; no wedding platform captures this audience',
      },
      {
        title: 'B2C+B2B Integrated Platform',
        description: 'Couples find planners, planners manage clients — one platform, zero friction. No competitor does this.',
        priority: 'medium',
        marketEvidence: 'Market split between B2C platforms (Bodas.net) and B2B tools (HoneyBook) with no bridge',
      },
    ],
    weddedAdvantages: [
      {
        title: 'Rebel Brand Identity',
        description: '#antibride movement with 96M TikTok views. Not your grandmother\'s wedding platform — built for modern couples who do things their way.',
      },
      {
        title: 'Independent & Open Source',
        description: 'Not owned by a PE fund. AGPL-3.0 open source. Transparent, community-driven, and couple-first.',
      },
      {
        title: 'Wedding Analytics Dashboard',
        description: '39 proprietary KPIs tracking everything from budget variance to vendor performance to guest engagement. Data-driven wedding planning.',
      },
      {
        title: 'Fair Vendor Pricing',
        description: 'No 12-month lock-ins, no predatory lead fees. Fair, transparent pricing for vendors who want to reach couples.',
      },
    ],
    competitiveStrategies: [
      {
        competitorId: 'bodasnet',
        competitorName: 'Bodas.net',
        theirWeakness: 'Dated UI, TKWW-owned monopoly, expensive for vendors, forums-era UX, limited innovation',
        howWeWin: [
          'Modern AI-first UX vs their dated forum-based interface',
          'Independent alternative to their TKWW monopoly',
          'Fair vendor pricing vs their expensive lock-in contracts',
          'Rebel brand appeals to young couples vs their corporate tone',
        ],
      },
      {
        competitorId: 'zankyou',
        competitorName: 'Zankyou',
        theirWeakness: 'Also TKWW-owned (same monopoly), transaction fees on registry, limited planning features',
        howWeWin: [
          'Zero-fee cash registry option',
          'Full planning suite vs their registry focus',
          'Independent brand vs TKWW ownership',
          'AI-powered recommendations vs static listings',
        ],
      },
      {
        competitorId: 'zola',
        competitorName: 'Zola',
        theirWeakness: 'US-only, no Spanish presence, registry-centric, no B2B tools',
        howWeWin: [
          'Spanish-native vs potential future English localization',
          'Full B2C+B2B platform vs their B2C-only approach',
          'Cultural understanding vs adapted US product',
        ],
      },
    ],
    blueOcean: {
      eliminate: ['Provider-first business model', 'Corporate "perfect wedding" content', '12-month vendor lock-in contracts'],
      reduce: ['Feature bloat', 'Vendor > couple hierarchy', 'Generic checklist approach'],
      raise: ['AI personalization', 'Spanish cultural authenticity', 'Privacy and transparency', 'Community engagement'],
      create: ['Wedding analytics (39 KPIs)', 'Session replay for wedding websites', 'Self-hostable platform', 'Fair vendor marketplace', 'Rebel community (#antibride)'],
    },
  },

  'b2b-tools': {
    ...categories.find(c => c.id === 'b2b-tools')!,
    swot: {
      strengths: [
        'Wedding-specific B2B tools (vs generic CRM like HoneyBook)',
        'B2C+B2B integration — planners see same data as couples',
        'Spanish-native for Iberian market planners',
        'Fair pricing vs HoneyBook\'s $79/mo premium tier',
      ],
      weaknesses: [
        'Feature still planned — not yet built',
        'Less mature than HoneyBook\'s full business suite',
        'No payment processing built-in yet',
      ],
      opportunities: [
        'Zero native Spanish B2B wedding planner tools exist',
        'Bridge between B2C couples and B2B planners is uncharted territory',
        'European wedding planner market growing as destination weddings increase',
        'AI-powered client matching for planners',
      ],
      threats: [
        'HoneyBook ($2.4B valuation) could localize to Spain',
        'That\'s The One (UK) is closest European competitor',
        'Dubsado appeals to price-sensitive vendors',
      ],
    },
    detailedOpportunities: [
      {
        title: 'First Spanish-Native B2B Platform',
        description: 'No wedding planner tool exists in Spanish. HoneyBook, Aisle Planner, Dubsado are all English-only and US-centric.',
        priority: 'high',
        marketEvidence: 'Spanish wedding planning industry: €3B+ annually with zero dedicated B2B tools',
      },
      {
        title: 'B2C+B2B Bridge',
        description: 'Planners acquire clients through the same platform couples use. No more manual data transfer between client-facing and planner tools.',
        priority: 'high',
        marketEvidence: 'No competitor bridges B2C and B2B — they\'re separate markets today',
      },
      {
        title: 'Destination Wedding Management',
        description: 'Tools for managing international clients, multi-currency invoicing, and multi-language communication for Spain\'s growing destination wedding market.',
        priority: 'medium',
        marketEvidence: 'Spain is #3 destination wedding market in Europe',
      },
    ],
    weddedAdvantages: [
      {
        title: 'Wedding-Specific, Not Generic',
        description: 'Built for wedding planners, not adapted from generic CRM. Understands timelines, vendor coordination, seating, and wedding workflows.',
      },
      {
        title: 'B2C+B2B Unity',
        description: 'Planners and couples share the same platform — one source of truth for timelines, budgets, guest lists, and vendor communications.',
      },
      {
        title: 'Spanish-Native',
        description: 'Built for the Iberian market. Spanish UI, Spanish vendor database, Spanish legal/tax compliance for wedding businesses.',
      },
      {
        title: 'Fair Pricing',
        description: 'Simple, transparent pricing without HoneyBook\'s tiered complexity or vendor lock-in contracts.',
      },
    ],
    competitiveStrategies: [
      {
        competitorId: 'honeybook',
        competitorName: 'HoneyBook',
        theirWeakness: 'Not wedding-specific, no Spanish localization, no B2C component, expensive premium tier ($79/mo)',
        howWeWin: [
          'Wedding-specific features vs their generic CRM',
          'Spanish-native vs English-only',
          'B2C+B2B integration they can\'t offer',
          'Simpler pricing vs their $19/$39/$79 tiers',
        ],
      },
      {
        competitorId: 'aisleplanner',
        competitorName: 'Aisle Planner',
        theirWeakness: 'US-focused, no Spanish localization, B2B only, no couple-facing features',
        howWeWin: [
          'Spanish-native for Iberian market',
          'B2C integration means planners get clients from the platform',
          'Modern AI features vs their traditional toolset',
        ],
      },
      {
        competitorId: 'thatstheone',
        competitorName: "That's The One",
        theirWeakness: 'UK-based (post-Brexit), limited Spanish presence, B2B only',
        howWeWin: [
          'Spanish market focus vs their UK-centric approach',
          'B2C+B2B bridge vs their B2B-only model',
          'Integrated platform vs standalone planner tool',
        ],
      },
    ],
  },

  'ai-bridal': {
    ...categories.find(c => c.id === 'ai-bridal')!,
    swot: {
      strengths: [
        'Greenfield European market — no AI bridal competitor exists here',
        'Can integrate AI try-on with full wedding platform (no standalone app)',
        'European fashion aesthetics and body diversity built-in',
        'Privacy-first AI processing (GDPR-compliant by design)',
      ],
      weaknesses: [
        'AI fashion technology is capital-intensive to build',
        'Feature still planned — requires significant R&D',
        'No existing partnerships with European dress designers',
      ],
      opportunities: [
        'Zero European AI bridal styling solutions — complete greenfield',
        'Can partner with European designers vs US-dominated market',
        'Virtual try-on reduces dress shopping friction — 67% of brides visit 3+ stores',
        'AI recommendations based on body type, style, and budget are underserved',
      ],
      threats: [
        'David\'s Bridal has Pearl Planner (GPT-powered) and AR features',
        'Perfect Corp ($1B) could power competitor AI features',
        'Bridely targeting ethnic markets with AI try-on',
      ],
    },
    detailedOpportunities: [
      {
        title: 'European AI Bridal — Greenfield Market',
        description: 'Every AI bridal player is US or Asia-based. First-mover advantage in European market with local fashion partnerships.',
        priority: 'high',
        marketEvidence: 'David\'s Bridal, Bridely, Perfect Corp — all US/Asia. Zero European presence.',
      },
      {
        title: 'European Designer Partnerships',
        description: 'Partner with Pronovias, Rosa Clará, and other European houses for AI try-on — they lack digital innovation.',
        priority: 'high',
        marketEvidence: 'Pronovias ($400M+ revenue) has no AI try-on; Rosa Clará similarly lacks digital innovation',
      },
      {
        title: 'Privacy-First AI Processing',
        description: 'GDPR-compliant body scanning and AI styling — process locally, don\'t store body data. Major differentiator vs US competitors.',
        priority: 'medium',
        marketEvidence: 'European consumers 3x more likely to reject apps that store biometric data',
      },
    ],
    weddedAdvantages: [
      {
        title: 'European Market First-Mover',
        description: 'First AI bridal styling solution built for European market — local designers, European body diversity, Mediterranean fashion aesthetics.',
      },
      {
        title: 'Integrated Platform',
        description: 'AI styling isn\'t a standalone app — it\'s part of the wedding planning platform. Style suggestions connect to budget, venue, and theme.',
      },
      {
        title: 'Privacy-First AI',
        description: 'GDPR-compliant body scanning. Local processing, no biometric data storage. European privacy standards by design.',
      },
    ],
    competitiveStrategies: [
      {
        competitorId: 'davidsbridal',
        competitorName: "David's Bridal",
        theirWeakness: 'US retail focus, bankruptcy history, no European presence, retail-first not tech-first',
        howWeWin: [
          'European market they don\'t serve',
          'Tech-first platform vs their retail-with-tech approach',
          'Privacy-first AI vs their data collection model',
          'Integrated with full wedding platform vs standalone feature',
        ],
      },
      {
        competitorId: 'bridely',
        competitorName: 'Bridely',
        theirWeakness: 'Very early stage, US-focused, single-feature product, limited dress catalog',
        howWeWin: [
          'European designer partnerships they lack',
          'Full platform integration vs standalone try-on app',
          'Broader wedding context (budget, venue, theme) informs styling',
        ],
      },
    ],
    blueOcean: {
      eliminate: ['US-centric size standards', 'Biometric data storage', 'Retail-dependent model'],
      reduce: ['Dependency on single designer catalogs', 'Standalone app friction'],
      raise: ['European body diversity representation', 'Privacy and data control', 'Cultural fashion context'],
      create: ['European designer AI partnerships', 'Platform-integrated styling (budget+venue+theme)', 'GDPR-native body AI processing'],
    },
  },

  'vendor-directory': {
    ...categories.find(c => c.id === 'vendor-directory')!,
    swot: {
      strengths: [
        'Fair pricing model — no 12-month lock-ins or predatory lead fees',
        'Transparent reviews without pay-to-suppress',
        'AI-powered matching based on couple preferences, not vendor ad spend',
        'Open-source marketplace code builds vendor trust',
      ],
      weaknesses: [
        'Feature still planned — no existing vendor database',
        'Bodas.net has 50K+ vendors — massive head start',
        'Network effects favor incumbents',
      ],
      opportunities: [
        'Spanish vendors frustrated with Bodas.net pricing and 12-month lock-ins',
        'Fair marketplace model attracts quality vendors priced out of TKWW platforms',
        'AI matching superior to pay-to-rank results',
        'Community reviews without pay-to-suppress manipulation',
      ],
      threats: [
        'Bodas.net/WeddingWire have 700K+ combined vendors globally',
        'Network effects: couples go where vendors are, and vice versa',
        'TKWW could undercut pricing to prevent competitor entry',
      ],
    },
    detailedOpportunities: [
      {
        title: 'Fair Vendor Marketplace',
        description: 'No 12-month lock-ins, no predatory lead generation fees. Performance-based pricing that rewards quality vendors.',
        priority: 'high',
        marketEvidence: 'Spanish wedding vendors report 40%+ dissatisfaction with Bodas.net pricing',
      },
      {
        title: 'AI-Powered Vendor Matching',
        description: 'Match couples with vendors based on style, budget, availability, and reviews — not which vendor paid the most for placement.',
        priority: 'high',
        marketEvidence: 'Current directory rankings are pay-to-rank, not quality-based',
      },
      {
        title: 'Transparent Review System',
        description: 'Reviews couples can trust — no pay-to-suppress, no fake review manipulation, verified booking reviews only.',
        priority: 'medium',
        marketEvidence: '78% of couples report distrust of vendor directory reviews',
      },
    ],
    weddedAdvantages: [
      {
        title: 'Fair Pricing for Vendors',
        description: 'No 12-month lock-ins. No predatory lead fees. Transparent, fair pricing so quality vendors can afford to participate.',
      },
      {
        title: 'AI Matching > Pay-to-Rank',
        description: 'Couples get vendor recommendations based on actual fit — style, budget, availability, reviews — not ad spend.',
      },
      {
        title: 'Transparent Reviews',
        description: 'Verified booking reviews only. No pay-to-suppress. Couples trust the reviews because vendors can\'t buy their way to 5 stars.',
      },
      {
        title: 'Open Source Trust',
        description: 'Vendors can inspect the matching algorithm. No black-box rankings. Transparency builds marketplace trust.',
      },
    ],
    competitiveStrategies: [
      {
        competitorId: 'tkww',
        competitorName: 'The Knot / WeddingWire',
        theirWeakness: 'Predatory 12-month vendor lock-ins, pay-to-rank results, vendor-first not couple-first',
        howWeWin: [
          'Fair pricing without lock-ins',
          'AI matching based on fit, not ad spend',
          'Transparent algorithm vendors can inspect',
          'Community-first approach builds trust',
        ],
      },
      {
        competitorId: 'bodasnet',
        competitorName: 'Bodas.net',
        theirWeakness: 'Expensive for vendors, TKWW-owned monopoly, pay-to-suppress reviews, dated UX',
        howWeWin: [
          'Fair pricing attracts vendors priced out of Bodas.net',
          'Independent alternative to TKWW monopoly',
          'Verified reviews they can\'t manipulate',
          'Modern UX vs their legacy platform',
        ],
      },
    ],
    blueOcean: {
      eliminate: ['12-month vendor lock-in contracts', 'Pay-to-suppress review systems', 'Pay-to-rank search results'],
      reduce: ['Vendor listing costs', 'Lead generation fee complexity'],
      raise: ['Review transparency and trust', 'Vendor-couple matching quality', 'Fair marketplace economics'],
      create: ['Open-source marketplace algorithm', 'AI matching based on couple fit', 'Verified booking reviews', 'Community-driven vendor ratings'],
    },
  },
};

// Helper function to get category detail by ID
export function getCategoryDetail(id: string): CategoryDetail | undefined {
  return categoryDetails[id];
}

// Helper to get all competitor IDs
export function getAllCompetitorIds(): string[] {
  return competitors.map(c => c.id);
}

// Helper to get competitor by ID
export function getCompetitorById(id: string): Competitor | undefined {
  return competitors.find(c => c.id === id);
}
