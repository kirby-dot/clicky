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
          badge_id: string | null
          avatar_url: string | null
          custom_css: string | null
          meta_tags: Json | null
          style: Json | null
          analytics_enabled: boolean
          published: boolean
          custom_domain: string | null
          domain_verified: boolean
          domain_verified_at: string | null
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
          badge_id?: string | null
          avatar_url?: string | null
          custom_css?: string | null
          meta_tags?: Json | null
          style?: Json | null
          analytics_enabled?: boolean
          published?: boolean
          custom_domain?: string | null
          domain_verified?: boolean
          domain_verified_at?: string | null
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
          badge_id?: string | null
          avatar_url?: string | null
          custom_css?: string | null
          meta_tags?: Json | null
          style?: Json | null
          analytics_enabled?: boolean
          published?: boolean
          custom_domain?: string | null
          domain_verified?: boolean
          domain_verified_at?: string | null
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
      badges: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          icon: string
          color: string
          type: 'verification' | 'tier' | 'industry' | 'custom'
          required_tier: 'free' | 'pro' | 'enterprise' | null
          is_active: boolean
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          icon: string
          color: string
          type: 'verification' | 'tier' | 'industry' | 'custom'
          required_tier?: 'free' | 'pro' | 'enterprise' | null
          is_active?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          icon?: string
          color?: string
          type?: 'verification' | 'tier' | 'industry' | 'custom'
          required_tier?: 'free' | 'pro' | 'enterprise' | null
          is_active?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          profile_id: string
          section_id: string | null
          type: string
          title: string | null
          content: Json
          position: number
          visible: boolean
          active: boolean
          clicks: number
          order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          section_id?: string | null
          type: string
          title?: string | null
          content: Json
          position: number
          visible?: boolean
          active?: boolean
          clicks?: number
          order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          section_id?: string | null
          type?: string
          title?: string | null
          content?: Json
          position?: number
          visible?: boolean
          active?: boolean
          clicks?: number
          order?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          profile_id: string
          name: string
          layout: string
          order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          layout: string
          order: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          layout?: string
          order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      email_captures: {
        Row: {
          id: string
          profile_id: string
          module_id: string | null
          email: string
          subscribed: boolean
          source: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          module_id?: string | null
          email: string
          subscribed?: boolean
          source?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          module_id?: string | null
          email?: string
          subscribed?: boolean
          source?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          profile_id: string
          module_id: string | null
          name: string
          email: string
          message: string
          read: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          module_id?: string | null
          name: string
          email: string
          message: string
          read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          module_id?: string | null
          name?: string
          email?: string
          message?: string
          read?: boolean
          metadata?: Json | null
          created_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          profile_id: string
          provider: string
          config: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          provider: string
          config: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          provider?: string
          config?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          profile_id: string
          email: string
          role: string
          status: string
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          email: string
          role: string
          status: string
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          email?: string
          role?: string
          status?: string
          invited_at?: string
          joined_at?: string | null
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
