import { Template, TemplateConfig } from './serializer'

const now = new Date().toISOString()

const creatorSpotlightConfig: TemplateConfig = {
  version: '1.0.0',
  profile: {
    title: 'Creator Spotlight',
    bio: 'Share your latest drops, collabs, and content in one place.',
    avatar_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    style: {
      layout: 'centered',
      background: 'gradient',
    },
    theme_colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      background: '#0f172a',
      text: '#f8fafc',
      linkBackground: '#1e293b',
      linkText: '#f8fafc',
    },
    badge_name: 'Creator',
  },
  theme: {
    name: 'Neon Nights',
    config: {
      colors: {
        primary: '#8b5cf6',
        secondary: '#ec4899',
        background: '#0f172a',
        text: '#e2e8f0',
        linkBackground: '#1e293b',
        linkText: '#f8fafc',
      },
      fonts: {
        heading: 'Space Grotesk',
        body: 'Inter',
      },
      spacing: 'normal',
      animations: {
        entrance: true,
        hover: 'glow',
      },
      borderRadius: 'lg',
      linkStyle: 'shadow',
    },
  },
  sections: [
    {
      title: 'Hero',
      order: 1,
      layout: { columns: 1 },
      style: { align: 'center' },
      modules: [
        {
          type: 'header',
          title: 'Creator Spotlight',
          content: {
            text: 'Link up with everything I am creating right now',
            level: 'h1',
            align: 'center',
          },
          position: 1,
          column_index: 0,
        },
        {
          type: 'text',
          title: 'Description',
          content: {
            text: 'Stream my new video, grab the preset pack, or book me for your next collab.',
            align: 'center',
          },
          position: 2,
          column_index: 0,
        },
        {
          type: 'button-grid',
          title: 'Key Actions',
          content: {
            buttons: [
              { title: 'Watch the Latest', url: 'https://youtube.com' },
              { title: 'Shop Presets', url: 'https://gumroad.com' },
              { title: 'Book a Shoot', url: 'https://cal.com' },
            ],
            columns: 3,
          },
          position: 3,
          column_index: 0,
        },
      ],
    },
    {
      title: 'Socials',
      order: 2,
      layout: { columns: 1 },
      style: {},
      modules: [
        {
          type: 'social-links',
          title: 'Socials',
          content: {
            links: [
              { platform: 'instagram', url: 'https://instagram.com/creator' },
              { platform: 'tiktok', url: 'https://tiktok.com/@creator' },
              { platform: 'youtube', url: 'https://youtube.com/@creator' },
            ],
            layout: 'grid',
            iconSize: 28,
          },
          position: 1,
          column_index: 0,
        },
        {
          type: 'email-signup',
          title: 'Newsletter',
          content: {
            provider: 'custom',
            placeholder: 'Enter your email',
            buttonText: 'Get drops first',
            apiEndpoint: '/api/email-signup',
          },
          position: 2,
          column_index: 0,
        },
      ],
    },
  ],
  links: [],
}

const ecommerceLaunchConfig: TemplateConfig = {
  version: '1.0.0',
  profile: {
    title: 'Ecommerce Launchpad',
    bio: 'Convert shoppers with product highlights, bundles, and social proof.',
    avatar_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    style: {
      layout: 'centered',
      background: 'image',
    },
    theme_colors: {
      primary: '#06b6d4',
      secondary: '#0ea5e9',
      background: '#0b1120',
      text: '#e2e8f0',
      linkBackground: '#0ea5e9',
      linkText: '#0b1120',
    },
  },
  theme: {
    name: 'Coastal Commerce',
    config: {
      colors: {
        primary: '#06b6d4',
        secondary: '#0ea5e9',
        background: '#0b1120',
        text: '#e2e8f0',
        linkBackground: '#0ea5e9',
        linkText: '#0b1120',
      },
      fonts: {
        heading: 'Sora',
        body: 'Inter',
      },
      spacing: 'normal',
      animations: {
        entrance: true,
        hover: 'lift',
      },
      borderRadius: 'lg',
      linkStyle: 'filled',
    },
  },
  sections: [
    {
      title: 'Launch',
      order: 1,
      layout: { columns: 1 },
      style: { align: 'center' },
      modules: [
        {
          type: 'header',
          title: 'Launch Headline',
          content: {
            text: 'Spring collection is live — limited inventory',
            level: 'h1',
            align: 'center',
          },
          position: 1,
          column_index: 0,
        },
        {
          type: 'text',
          title: 'Value Prop',
          content: {
            text: 'Curated essentials with fast shipping and flexible returns.',
            align: 'center',
          },
          position: 2,
          column_index: 0,
        },
        {
          type: 'button-grid',
          title: 'Shop Actions',
          content: {
            buttons: [
              { title: 'Shop New Arrivals', url: 'https://yourstore.com/new' },
              { title: 'Best Sellers', url: 'https://yourstore.com/best' },
              { title: 'Bundles & Kits', url: 'https://yourstore.com/bundles' },
            ],
            columns: 3,
          },
          position: 3,
          column_index: 0,
        },
      ],
    },
    {
      title: 'Trust & Social',
      order: 2,
      layout: { columns: 1 },
      style: {},
      modules: [
        {
          type: 'testimonial',
          title: 'Customer Love',
          content: {
            quote: 'Beautiful quality and the unboxing felt premium. Shipping was fast too!',
            author: 'Jordan M.',
            role: 'Verified buyer',
            rating: 5,
          },
          position: 1,
          column_index: 0,
        },
        {
          type: 'social-links',
          title: 'Follow Us',
          content: {
            links: [
              { platform: 'instagram', url: 'https://instagram.com/yourstore' },
              { platform: 'tiktok', url: 'https://tiktok.com/@yourstore' },
              { platform: 'twitter', url: 'https://twitter.com/yourstore' },
            ],
            layout: 'horizontal',
            iconSize: 26,
          },
          position: 2,
          column_index: 0,
        },
      ],
    },
  ],
  links: [],
}

const restaurantShowcaseConfig: TemplateConfig = {
  version: '1.0.0',
  profile: {
    title: 'Restaurant Showcase',
    bio: 'Book a table, browse our seasonal menu, and find us IRL.',
    avatar_url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=600&q=80',
    style: {
      layout: 'centered',
      background: 'texture',
    },
    theme_colors: {
      primary: '#f97316',
      secondary: '#f59e0b',
      background: '#0f172a',
      text: '#f8fafc',
      linkBackground: '#f97316',
      linkText: '#0f172a',
    },
  },
  theme: {
    name: 'Warm Bistro',
    config: {
      colors: {
        primary: '#f97316',
        secondary: '#f59e0b',
        background: '#0f172a',
        text: '#f8fafc',
        linkBackground: '#f97316',
        linkText: '#0f172a',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Inter',
      },
      spacing: 'normal',
      animations: {
        entrance: true,
        hover: 'lift',
      },
      borderRadius: 'md',
      linkStyle: 'filled',
    },
  },
  sections: [
    {
      title: 'Welcome',
      order: 1,
      layout: { columns: 1 },
      style: { align: 'center' },
      modules: [
        {
          type: 'header',
          title: 'Restaurant Header',
          content: {
            text: 'Seasonal tasting menu, reservations open now',
            level: 'h1',
            align: 'center',
          },
          position: 1,
          column_index: 0,
        },
        {
          type: 'text',
          title: 'Chef Note',
          content: {
            text: 'Locally sourced ingredients with a focus on wood-fired flavors and natural wines.',
            align: 'center',
          },
          position: 2,
          column_index: 0,
        },
        {
          type: 'button',
          title: 'Reserve',
          content: {
            url: 'https://resy.com',
            style: {
              backgroundColor: '#f97316',
              textColor: '#0f172a',
            },
          },
          position: 3,
          column_index: 0,
        },
      ],
    },
    {
      title: 'Visit',
      order: 2,
      layout: { columns: 1 },
      style: {},
      modules: [
        {
          type: 'location',
          title: 'Find Us',
          content: {
            address: '123 Market Street, San Francisco, CA',
            mapUrl: 'https://maps.google.com',
          },
          position: 1,
          column_index: 0,
        },
        {
          type: 'faq',
          title: 'FAQ',
          content: {
            items: [
              {
                question: 'Do you take walk-ins?',
                answer: 'Yes, we keep a portion of the dining room for walk-ins each night.',
              },
              {
                question: 'Any dietary accommodations?',
                answer: 'We can adjust for vegetarian, gluten-free, and nut-free preferences.',
              },
            ],
          },
          position: 2,
          column_index: 0,
        },
      ],
    },
  ],
  links: [],
}

export const DEFAULT_TEMPLATE_CATEGORIES = [
  {
    id: 'industry-creator',
    name: 'creator',
    display_name: 'Creators',
    description: 'Profiles for creators, streamers, and online educators.',
    icon: 'Sparkles',
    color: '#8b5cf6',
  },
  {
    id: 'industry-ecommerce',
    name: 'ecommerce',
    display_name: 'Ecommerce',
    description: 'Templates optimized for product drops and online stores.',
    icon: 'ShoppingBag',
    color: '#06b6d4',
  },
  {
    id: 'industry-restaurant',
    name: 'restaurant',
    display_name: 'Restaurants',
    description: 'Hospitality-friendly layouts for reservations and menus.',
    icon: 'Utensils',
    color: '#f97316',
  },
] as const

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'builtin-creator-spotlight',
    name: 'Creator Spotlight',
    slug: 'creator-spotlight',
    description: 'A punchy creator hub with social grid, newsletter capture, and hero CTAs.',
    category_id: 'industry-creator',
    preview_image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    preview_images: [
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    ],
    is_premium: false,
    price: 0,
    required_tier: undefined,
    creator_id: undefined,
    is_official: true,
    is_user_submitted: false,
    config: creatorSpotlightConfig,
    tags: ['creator', 'media', 'social'],
    installs_count: 1240,
    favorites_count: 420,
    rating_average: 4.8,
    rating_count: 87,
    is_active: true,
    featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'builtin-ecommerce-launchpad',
    name: 'Ecommerce Launchpad',
    slug: 'ecommerce-launchpad',
    description: 'Merch-ready layout for product drops with trust indicators and social proof.',
    category_id: 'industry-ecommerce',
    preview_image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    preview_images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    ],
    is_premium: false,
    price: 0,
    required_tier: undefined,
    creator_id: undefined,
    is_official: true,
    is_user_submitted: false,
    config: ecommerceLaunchConfig,
    tags: ['ecommerce', 'shop', 'product'],
    installs_count: 980,
    favorites_count: 256,
    rating_average: 4.7,
    rating_count: 54,
    is_active: true,
    featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'builtin-restaurant-showcase',
    name: 'Restaurant Showcase',
    slug: 'restaurant-showcase',
    description: 'Hospitality-friendly layout with reservations, FAQs, and a map.',
    category_id: 'industry-restaurant',
    preview_image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    preview_images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    ],
    is_premium: false,
    price: 0,
    required_tier: undefined,
    creator_id: undefined,
    is_official: true,
    is_user_submitted: false,
    config: restaurantShowcaseConfig,
    tags: ['restaurant', 'local', 'hospitality'],
    installs_count: 720,
    favorites_count: 190,
    rating_average: 4.6,
    rating_count: 43,
    is_active: true,
    featured: false,
    created_at: now,
    updated_at: now,
  },
]
