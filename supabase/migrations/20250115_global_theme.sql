-- Add global theme support to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px"
    },
    "fontWeight": {
      "light": 300,
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    },
    "letterSpacing": {
      "tight": "-0.025em",
      "normal": "0",
      "wide": "0.025em"
    }
  },
  "colors": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "accent": "#ec4899",
    "background": {
      "light": "#ffffff",
      "dark": "#1f2937"
    },
    "text": {
      "heading": "#111827",
      "body": "#374151",
      "muted": "#6b7280",
      "inverse": "#ffffff"
    },
    "border": "#e5e7eb",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  "effects": {
    "borderRadius": {
      "none": "0",
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px",
      "2xl": "24px",
      "full": "9999px"
    },
    "shadow": {
      "none": "none",
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)"
    }
  }
}'::jsonb;
