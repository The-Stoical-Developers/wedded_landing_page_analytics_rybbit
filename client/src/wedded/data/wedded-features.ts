// Wedded Features for Competitor Comparison
// Source: Internal Product Roadmap - January 2025

export type FeatureStatus = 'live' | 'in_progress' | 'planned';

export interface WeddedFeature {
  id: string;
  name: string;
  category: string;
  status: FeatureStatus;
  description: string;
  launchDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface FeatureCategory {
  id: string;
  name: string;
  nameEs: string;
}

// Feature Categories
export const featureCategories: FeatureCategory[] = [
  { id: 'core', name: 'Core', nameEs: 'Core' },
  { id: 'guest-management', name: 'Guest Management', nameEs: 'Gestión de Invitados' },
  { id: 'planning', name: 'Planning', nameEs: 'Planificación' },
  { id: 'vendor-directory', name: 'Vendor Directory', nameEs: 'Directorio de Proveedores' },
  { id: 'collaboration', name: 'Collaboration', nameEs: 'Colaboración' },
  { id: 'automation', name: 'Automation', nameEs: 'Automatización' },
  { id: 'ux', name: 'User Experience', nameEs: 'Experiencia de Usuario' },
  { id: 'communication', name: 'Communication', nameEs: 'Comunicación' },
  { id: 'auth', name: 'Authentication', nameEs: 'Autenticación' },
  { id: 'infrastructure', name: 'Infrastructure', nameEs: 'Infraestructura' },
  { id: 'invitations', name: 'Invitations', nameEs: 'Invitaciones' },
  { id: 'websites', name: 'Websites', nameEs: 'Páginas Web' },
  { id: 'day-coordination', name: 'Day-of Coordination', nameEs: 'Coordinación Día D' },
  { id: 'b2b', name: 'B2B Tools', nameEs: 'Herramientas B2B' },
  { id: 'ai', name: 'AI Features', nameEs: 'Funciones IA' },
];

// All Wedded Features
export const weddedFeatures: WeddedFeature[] = [
  // Live Features
  {
    id: 'wedding-management',
    name: 'Wedding Management',
    category: 'core',
    status: 'live',
    description: 'Create and manage wedding events with all details',
  },
  {
    id: 'guest-management',
    name: 'Guest Management (Wedders)',
    category: 'guest-management',
    status: 'live',
    description: 'Manage guest lists, RSVPs, and guest information',
  },
  {
    id: 'onboarding-wizard',
    name: 'Wedding Onboarding Wizard',
    category: 'planning',
    status: 'live',
    description: 'Guided setup process for new weddings',
  },
  {
    id: 'categories-subcategories',
    name: 'Categories & Subcategories',
    category: 'planning',
    status: 'live',
    description: 'Organize wedding tasks into categories',
  },
  {
    id: 'budget-planning',
    name: 'Budget Planning & Tracking',
    category: 'planning',
    status: 'live',
    description: 'Set budgets, track expenses, and manage finances',
  },
  {
    id: 'marketplace',
    name: 'Marketplace (Vendor Discovery)',
    category: 'vendor-directory',
    status: 'live',
    description: 'Browse and discover wedding vendors',
  },
  {
    id: 'partner-invitation',
    name: 'Partner Invitation',
    category: 'collaboration',
    status: 'live',
    description: 'Invite partner to collaborate on wedding planning',
  },
  {
    id: 'mission-roadmap',
    name: 'Mission Roadmap (Timeline/Agenda)',
    category: 'planning',
    status: 'live',
    description: 'Visual timeline and task management',
  },
  {
    id: 'mission-triggers',
    name: 'Mission Triggers System',
    category: 'automation',
    status: 'live',
    description: 'Automated task creation based on wedding date',
  },
  {
    id: 'swipe-discovery',
    name: 'Swipe Discovery Component',
    category: 'ux',
    status: 'live',
    description: 'Tinder-like swiping for vendor discovery',
  },
  {
    id: 'whatsapp-feedback',
    name: 'WhatsApp Feedback',
    category: 'communication',
    status: 'live',
    description: 'Collect feedback via WhatsApp integration',
  },
  {
    id: 'apple-signin',
    name: 'Apple Sign In',
    category: 'auth',
    status: 'live',
    description: 'Authentication with Apple ID',
  },
  {
    id: 'feature-flags',
    name: 'Feature Flags System',
    category: 'infrastructure',
    status: 'live',
    description: 'Toggle features on/off for testing and rollouts',
  },

  // In Development
  {
    id: 'push-notifications',
    name: 'Push Notifications',
    category: 'communication',
    status: 'in_progress',
    description: 'Real-time push notifications for updates and reminders',
  },
  {
    id: 'accelerated-plan',
    name: 'Accelerated Plan',
    category: 'planning',
    status: 'in_progress',
    description: 'Fast-track planning for short engagement periods',
  },
  {
    id: 'seo-geo',
    name: 'SEO/GEO Optimization',
    category: 'infrastructure',
    status: 'in_progress',
    description: 'Geographic and search optimization for marketplace',
  },

  // Planned Features
  {
    id: 'digital-invitations',
    name: 'Digital Invitations',
    category: 'invitations',
    status: 'planned',
    description: 'Create and send digital wedding invitations',
    priority: 'high',
  },
  {
    id: 'wedding-websites',
    name: 'Wedding Websites',
    category: 'websites',
    status: 'planned',
    description: 'Custom wedding websites for guests',
    priority: 'high',
  },
  {
    id: 'day-coordination',
    name: 'Day-of Coordination',
    category: 'day-coordination',
    status: 'planned',
    description: 'Real-time coordination tools for wedding day',
    priority: 'medium',
  },
  {
    id: 'b2b-planner-tools',
    name: 'B2B Planner Tools',
    category: 'b2b',
    status: 'planned',
    description: 'Professional tools for wedding planners',
    priority: 'high',
  },
  {
    id: 'ai-bridal-styling',
    name: 'AI Bridal Styling',
    category: 'ai',
    status: 'planned',
    description: 'AI-powered dress recommendations and virtual try-on',
    priority: 'medium',
  },
];

// Helper functions
export function getFeaturesByStatus(status: FeatureStatus): WeddedFeature[] {
  return weddedFeatures.filter((f) => f.status === status);
}

export function getFeaturesByCategory(categoryId: string): WeddedFeature[] {
  return weddedFeatures.filter((f) => f.category === categoryId);
}

export function getLiveFeatures(): WeddedFeature[] {
  return getFeaturesByStatus('live');
}

export function getInProgressFeatures(): WeddedFeature[] {
  return getFeaturesByStatus('in_progress');
}

export function getPlannedFeatures(): WeddedFeature[] {
  return getFeaturesByStatus('planned');
}

export function getFeatureById(id: string): WeddedFeature | undefined {
  return weddedFeatures.find((f) => f.id === id);
}

// Feature comparison helper for competitors
export interface FeatureComparisonItem {
  feature: WeddedFeature;
  weddedHas: boolean;
  weddedStatus: FeatureStatus;
  competitorHas: boolean;
}

export function compareFeatures(competitorFeatureIds: string[]): FeatureComparisonItem[] {
  return weddedFeatures.map((feature) => ({
    feature,
    weddedHas: true,
    weddedStatus: feature.status,
    competitorHas: competitorFeatureIds.includes(feature.id),
  }));
}
