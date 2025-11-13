export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
          settings: Json | null
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
          settings?: Json | null
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
          settings?: Json | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          slug: string
          title: string
          bio: string | null
          theme_id: string | null
          avatar_url: string | null
          custom_css: string | null
          meta_tags: Json | null
          style: Json | null
          analytics_enabled: boolean
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          title: string
          bio?: string | null
          theme_id?: string | null
          avatar_url?: string | null
          custom_css?: string | null
          meta_tags?: Json | null
          style?: Json | null
          analytics_enabled?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          title?: string
          bio?: string | null
          theme_id?: string | null
          avatar_url?: string | null
          custom_css?: string | null
          meta_tags?: Json | null
          style?: Json | null
          analytics_enabled?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      links: {
        Row: {
          id: string
          profile_id: string
          type: 'link' | 'header' | 'social'
          title: string
          url: string | null
          thumbnail_url: string | null
          position: number
          clicks: number
          active: boolean
          scheduled_start: string | null
          scheduled_end: string | null
          style: Json | null
          analytics_tag: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          type?: 'link' | 'header' | 'social'
          title: string
          url?: string | null
          thumbnail_url?: string | null
          position: number
          clicks?: number
          active?: boolean
          scheduled_start?: string | null
          scheduled_end?: string | null
          style?: Json | null
          analytics_tag?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          type?: 'link' | 'header' | 'social'
          title?: string
          url?: string | null
          thumbnail_url?: string | null
          position?: number
          clicks?: number
          active?: boolean
          scheduled_start?: string | null
          scheduled_end?: string | null
          style?: Json | null
          analytics_tag?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      themes: {
        Row: {
          id: string
          name: string
          config: Json
          is_premium: boolean
          creator_id: string | null
          installs_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          config: Json
          is_premium?: boolean
          creator_id?: string | null
          installs_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          config?: Json
          is_premium?: boolean
          creator_id?: string | null
          installs_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          profile_id: string
          link_id: string | null
          event_type: 'view' | 'click'
          visitor_id: string | null
          ip_hash: string | null
          country: string | null
          device_type: string | null
          referrer: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          profile_id: string
          link_id?: string | null
          event_type: 'view' | 'click'
          visitor_id?: string | null
          ip_hash?: string | null
          country?: string | null
          device_type?: string | null
          referrer?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          profile_id?: string
          link_id?: string | null
          event_type?: 'view' | 'click'
          visitor_id?: string | null
          ip_hash?: string | null
          country?: string | null
          device_type?: string | null
          referrer?: string | null
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
