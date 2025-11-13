import { Database } from './database'

export type User = Database['public']['Tables']['users']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Link = Database['public']['Tables']['links']['Row']
export type Theme = Database['public']['Tables']['themes']['Row']
export type Event = Database['public']['Tables']['events']['Row']

export type ProfileWithLinks = Profile & {
  links: Link[]
  theme?: Theme | null
}

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    linkBackground: string
    linkText: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: 'tight' | 'normal' | 'loose'
  animations: {
    entrance: boolean
    hover: 'scale' | 'lift' | 'glow' | 'none'
  }
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  linkStyle: 'filled' | 'outlined' | 'minimal' | 'shadow'
}

export interface LinkStyle {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderWidth?: number
  icon?: string
}

export interface AnalyticsData {
  totalViews: number
  totalClicks: number
  clickRate: number
  topLinks: Array<{
    link: Link
    clicks: number
  }>
  viewsOverTime: Array<{
    date: string
    views: number
  }>
  deviceBreakdown: {
    mobile: number
    desktop: number
    tablet: number
  }
  topCountries: Array<{
    country: string
    views: number
  }>
}
