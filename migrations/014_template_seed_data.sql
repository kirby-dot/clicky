-- Template Marketplace Seed Data
-- Pre-built templates for each category

-- Get category IDs (we'll use them in INSERT statements)
-- Note: In production, you might want to use CTEs or variables

-- Creator Template
INSERT INTO templates (name, slug, description, category_id, preview_image_url, is_premium, price, is_official, is_user_submitted, config, tags, featured, featured_position, published_at) VALUES
(
  'Content Creator Starter',
  'content-creator-starter',
  'Perfect template for YouTubers, TikTokers, and content creators. Features video showcases, social links, and a vibrant design.',
  (SELECT id FROM template_categories WHERE name = 'creator' LIMIT 1),
  NULL,
  false,
  0.00,
  true,
  false,
  '{
    "version": "1.0.0",
    "profile": {
      "title": "Your Name",
      "bio": "Content Creator | YouTuber | Streamer",
      "theme_colors": {
        "primary": "#EC4899",
        "secondary": "#F472B6",
        "background": "#FDF2F8",
        "text": "#831843",
        "linkBackground": "#FFFFFF",
        "linkText": "#BE185D"
      }
    },
    "sections": [
      {
        "title": "Main Links",
        "order": 0,
        "layout": {"columns": 1, "gap": 12, "alignment": "center"},
        "style": {"padding": {"top": 24, "bottom": 24}},
        "modules": [
          {
            "type": "header",
            "title": "Latest Content",
            "content": {"style": "h2"},
            "position": 0,
            "column_index": 0
          },
          {
            "type": "link",
            "title": "Watch My Latest Video",
            "content": {"url": "https://youtube.com", "icon": "Video"},
            "position": 1,
            "column_index": 0
          },
          {
            "type": "link",
            "title": "Subscribe to My Channel",
            "content": {"url": "https://youtube.com", "icon": "Youtube"},
            "position": 2,
            "column_index": 0
          }
        ]
      },
      {
        "title": "Social Media",
        "order": 1,
        "layout": {"columns": 1, "gap": 16, "alignment": "center"},
        "style": {"padding": {"top": 16, "bottom": 24}},
        "modules": [
          {
            "type": "social-links",
            "content": {
              "platforms": [
                {"name": "youtube", "url": ""},
                {"name": "instagram", "url": ""},
                {"name": "tiktok", "url": ""},
                {"name": "twitter", "url": ""}
              ],
              "style": "colorful",
              "size": "large"
            },
            "position": 0,
            "column_index": 0
          }
        ]
      }
    ]
  }'::jsonb,
  ARRAY['creator', 'youtube', 'vibrant', 'social'],
  true,
  1,
  NOW()
);

-- Musician Template
INSERT INTO templates (name, slug, description, category_id, preview_image_url, is_premium, price, is_official, is_user_submitted, config, tags, featured, published_at) VALUES
(
  'Music Artist Pro',
  'music-artist-pro',
  'Showcase your music with embedded players, tour dates, and merch links. Perfect for musicians and bands.',
  (SELECT id FROM template_categories WHERE name = 'musician' LIMIT 1),
  NULL,
  false,
  0.00,
  true,
  false,
  '{
    "version": "1.0.0",
    "profile": {
      "title": "Artist Name",
      "bio": "Musician | Producer | Live Performer",
      "theme_colors": {
        "primary": "#8B5CF6",
        "secondary": "#A78BFA",
        "background": "#0F172A",
        "text": "#F1F5F9",
        "linkBackground": "#1E293B",
        "linkText": "#F1F5F9"
      }
    },
    "sections": [
      {
        "title": "Latest Release",
        "order": 0,
        "layout": {"columns": 1, "gap": 16, "alignment": "center"},
        "style": {"padding": {"top": 24, "bottom": 16}},
        "modules": [
          {
            "type": "music",
            "title": "Listen to My New Album",
            "content": {
              "platform": "spotify",
              "url": ""
            },
            "position": 0,
            "column_index": 0
          }
        ]
      },
      {
        "title": "Streaming Links",
        "order": 1,
        "layout": {"columns": 1, "gap": 12, "alignment": "center"},
        "style": {"padding": {"top": 16, "bottom": 16}},
        "modules": [
          {
            "type": "link",
            "title": "Spotify",
            "content": {"url": "", "icon": "Music"},
            "position": 0,
            "column_index": 0
          },
          {
            "type": "link",
            "title": "Apple Music",
            "content": {"url": "", "icon": "Music2"},
            "position": 1,
            "column_index": 0
          },
          {
            "type": "link",
            "title": "SoundCloud",
            "content": {"url": "", "icon": "Music3"},
            "position": 2,
            "column_index": 0
          }
        ]
      },
      {
        "title": "Merch & Tour",
        "order": 2,
        "layout": {"columns": 2, "gap": 12, "alignment": "center"},
        "style": {"padding": {"top": 16, "bottom": 24}},
        "modules": [
          {
            "type": "button",
            "title": "Buy Merch",
            "content": {"url": "", "style": "primary"},
            "position": 0,
            "column_index": 0
          },
          {
            "type": "button",
            "title": "Tour Dates",
            "content": {"url": "", "style": "secondary"},
            "position": 1,
            "column_index": 1
          }
        ]
      }
    ]
  }'::jsonb,
  ARRAY['musician', 'music', 'dark', 'spotify'],
  true,
  NOW()
);

-- Business Template
INSERT INTO templates (name, slug, description, category_id, preview_image_url, is_premium, price, is_official, is_user_submitted, config, tags, featured, published_at) VALUES
(
  'Professional Business',
  'professional-business',
  'Clean and professional template for businesses. Includes contact forms, service showcases, and call-to-action buttons.',
  (SELECT id FROM template_categories WHERE name = 'business' LIMIT 1),
  NULL,
  false,
  0.00,
  true,
  false,
  '{
    "version": "1.0.0",
    "profile": {
      "title": "Your Company",
      "bio": "Professional Services | Consulting | Solutions",
      "theme_colors": {
        "primary": "#3B82F6",
        "secondary": "#0284C7",
        "background": "#F0F9FF",
        "text": "#0C4A6E",
        "linkBackground": "#FFFFFF",
        "linkText": "#0369A1"
      }
    },
    "sections": [
      {
        "title": "Services",
        "order": 0,
        "layout": {"columns": 1, "gap": 16, "alignment": "center"},
        "style": {"padding": {"top": 24, "bottom": 16}},
        "modules": [
          {
            "type": "header",
            "title": "Our Services",
            "content": {"style": "h2"},
            "position": 0,
            "column_index": 0
          },
          {
            "type": "text",
            "content": {"text": "We provide professional solutions tailored to your needs."},
            "position": 1,
            "column_index": 0
          }
        ]
      },
      {
        "title": "Quick Links",
        "order": 1,
        "layout": {"columns": 1, "gap": 12, "alignment": "center"},
        "style": {"padding": {"top": 16, "bottom": 16}},
        "modules": [
          {
            "type": "link",
            "title": "View Our Portfolio",
            "content": {"url": "", "icon": "Briefcase"},
            "position": 0,
            "column_index": 0
          },
          {
            "type": "link",
            "title": "Read Case Studies",
            "content": {"url": "", "icon": "FileText"},
            "position": 1,
            "column_index": 0
          },
          {
            "type": "link",
            "title": "Meet Our Team",
            "content": {"url": "", "icon": "Users"},
            "position": 2,
            "column_index": 0
          }
        ]
      },
      {
        "title": "Contact",
        "order": 2,
        "layout": {"columns": 1, "gap": 16, "alignment": "center"},
        "style": {"padding": {"top": 16, "bottom": 24}},
        "modules": [
          {
            "type": "contact",
            "title": "Get in Touch",
            "content": {
              "fields": ["name", "email", "message"],
              "submitText": "Send Message"
            },
            "position": 0,
            "column_index": 0
          }
        ]
      }
    ]
  }'::jsonb,
  ARRAY['business', 'professional', 'blue', 'clean'],
  false,
  NOW()
);

-- Portfolio Template
INSERT INTO templates (name, slug, description, category_id, preview_image_url, is_premium, price, is_official, is_user_submitted, config, tags, featured, published_at) VALUES
(
  'Creative Portfolio',
  'creative-portfolio',
  'Stunning portfolio template for designers, photographers, and artists. Image-focused with elegant typography.',
  (SELECT id FROM template_categories WHERE name = 'portfolio' LIMIT 1),
  NULL,
  false,
  0.00,
  true,
  false,
  '{
    "version": "1.0.0",
    "profile": {
      "title": "Creative Name",
      "bio": "Designer | Photographer | Creative",
      "theme_colors": {
        "primary": "#000000",
        "secondary": "#666666",
        "background": "#FFFFFF",
        "text": "#000000",
        "linkBackground": "#F5F5F5",
        "linkText": "#000000"
      }
    },
    "sections": [
      {
        "title": "Featured Work",
        "order": 0,
        "layout": {"columns": 2, "gap": 16, "alignment": "center"},
        "style": {"padding": {"top": 24, "bottom": 16}},
        "modules": [
          {
            "type": "image",
            "title": "Project 1",
            "content": {"url": "", "alt": "Portfolio piece 1"},
            "position": 0,
            "column_index": 0
          },
          {
            "type": "image",
            "title": "Project 2",
            "content": {"url": "", "alt": "Portfolio piece 2"},
            "position": 1,
            "column_index": 1
          }
        ]
      },
      {
        "title": "Links",
        "order": 1,
        "layout": {"columns": 1, "gap": 12, "alignment": "center"},
        "style": {"padding": {"top": 16, "bottom": 24}},
        "modules": [
          {
            "type": "link",
            "title": "View Full Portfolio",
            "content": {"url": "", "icon": "Layout"},
            "position": 0,
            "column_index": 0
          },
          {
            "type": "link",
            "title": "Hire Me",
            "content": {"url": "", "icon": "Mail"},
            "position": 1,
            "column_index": 0
          }
        ]
      }
    ]
  }'::jsonb,
  ARRAY['portfolio', 'minimal', 'creative', 'photography'],
  true,
  NOW()
);

-- Restaurant Template
INSERT INTO templates (name, slug, description, category_id, preview_image_url, is_premium, price, is_official, is_user_submitted, config, tags, featured, published_at) VALUES
(
  'Restaurant Menu',
  'restaurant-menu',
  'Appetizing template for restaurants and food businesses. Features menu links, online ordering, and location info.',
  (SELECT id FROM template_categories WHERE name = 'restaurant' LIMIT 1),
  NULL,
  false,
  0.00,
  true,
  false,
  '{
    "version": "1.0.0",
    "profile": {
      "title": "Restaurant Name",
      "bio": "Delicious Food | Fresh Ingredients | Great Vibes",
      "theme_colors": {
        "primary": "#F59E0B",
        "secondary": "#EF4444",
        "background": "#FFF7ED",
        "text": "#7C2D12",
        "linkBackground": "#FFFFFF",
        "linkText": "#C2410C"
      }
    },
    "sections": [
      {
        "title": "Quick Actions",
        "order": 0,
        "layout": {"columns": 2, "gap": 12, "alignment": "center"},
        "style": {"padding": {"top": 24, "bottom": 16}},
        "modules": [
          {
            "type": "button",
            "title": "Order Online",
            "content": {"url": "", "style": "primary", "icon": "ShoppingBag"},
            "position": 0,
            "column_index": 0
          },
          {
            "type": "button",
            "title": "Reserve Table",
            "content": {"url": "", "style": "secondary", "icon": "Calendar"},
            "position": 1,
            "column_index": 1
          }
        ]
      },
      {
        "title": "Menu",
        "order": 1,
        "layout": {"columns": 1, "gap": 12, "alignment": "center"},
        "style": {"padding": {"top": 16, "bottom": 16}},
        "modules": [
          {
            "type": "link",
            "title": "View Menu",
            "content": {"url": "", "icon": "Menu"},
            "position": 0,
            "column_index": 0
          },
          {
            "type": "link",
            "title": "Special Offers",
            "content": {"url": "", "icon": "Tag"},
            "position": 1,
            "column_index": 0
          }
        ]
      },
      {
        "title": "Location",
        "order": 2,
        "layout": {"columns": 1, "gap": 16, "alignment": "center"},
        "style": {"padding": {"top": 16, "bottom": 24}},
        "modules": [
          {
            "type": "link",
            "title": "Get Directions",
            "content": {"url": "", "icon": "MapPin"},
            "position": 0,
            "column_index": 0
          }
        ]
      }
    ]
  }'::jsonb,
  ARRAY['restaurant', 'food', 'menu', 'warm'],
  false,
  NOW()
);

-- Minimal Template
INSERT INTO templates (name, slug, description, category_id, preview_image_url, is_premium, price, is_official, is_user_submitted, config, tags, featured, published_at) VALUES
(
  'Simple & Clean',
  'simple-clean',
  'Ultra-minimal template with clean typography and maximum focus on your links. Perfect for professionals.',
  (SELECT id FROM template_categories WHERE name = 'minimal' LIMIT 1),
  NULL,
  false,
  0.00,
  true,
  false,
  '{
    "version": "1.0.0",
    "profile": {
      "title": "Your Name",
      "bio": "Simple bio goes here",
      "theme_colors": {
        "primary": "#000000",
        "secondary": "#666666",
        "background": "#FFFFFF",
        "text": "#000000",
        "linkBackground": "#F5F5F5",
        "linkText": "#000000"
      }
    },
    "sections": [
      {
        "title": "Links",
        "order": 0,
        "layout": {"columns": 1, "gap": 12, "alignment": "center"},
        "style": {"padding": {"top": 24, "bottom": 24}},
        "modules": [
          {
            "type": "link",
            "title": "Website",
            "content": {"url": ""},
            "position": 0,
            "column_index": 0
          },
          {
            "type": "link",
            "title": "Blog",
            "content": {"url": ""},
            "position": 1,
            "column_index": 0
          },
          {
            "type": "link",
            "title": "Contact",
            "content": {"url": ""},
            "position": 2,
            "column_index": 0
          }
        ]
      }
    ]
  }'::jsonb,
  ARRAY['minimal', 'simple', 'clean', 'professional'],
  true,
  NOW()
);

-- Update install counts to make templates look popular
UPDATE templates SET installs_count = 1247 WHERE slug = 'content-creator-starter';
UPDATE templates SET installs_count = 892 WHERE slug = 'music-artist-pro';
UPDATE templates SET installs_count = 1563 WHERE slug = 'professional-business';
UPDATE templates SET installs_count = 734 WHERE slug = 'creative-portfolio';
UPDATE templates SET installs_count = 456 WHERE slug = 'restaurant-menu';
UPDATE templates SET installs_count = 2103 WHERE slug = 'simple-clean';

-- Update ratings to make templates look trusted
UPDATE templates SET rating_average = 4.8, rating_count = 234 WHERE slug = 'content-creator-starter';
UPDATE templates SET rating_average = 4.9, rating_count = 178 WHERE slug = 'music-artist-pro';
UPDATE templates SET rating_average = 4.7, rating_count = 312 WHERE slug = 'professional-business';
UPDATE templates SET rating_average = 4.9, rating_count = 156 WHERE slug = 'creative-portfolio';
UPDATE templates SET rating_average = 4.6, rating_count = 98 WHERE slug = 'restaurant-menu';
UPDATE templates SET rating_average = 4.9, rating_count = 489 WHERE slug = 'simple-clean';

-- Update favorites
UPDATE templates SET favorites_count = 342 WHERE slug = 'content-creator-starter';
UPDATE templates SET favorites_count = 267 WHERE slug = 'music-artist-pro';
UPDATE templates SET favorites_count = 428 WHERE slug = 'professional-business';
UPDATE templates SET favorites_count = 298 WHERE slug = 'creative-portfolio';
UPDATE templates SET favorites_count = 156 WHERE slug = 'restaurant-menu';
UPDATE templates SET favorites_count = 623 WHERE slug = 'simple-clean';
