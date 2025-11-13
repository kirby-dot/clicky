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

// Module System Types
export type ModuleType =
  | 'link'
  | 'social-links'
  | 'header'
  | 'text'
  | 'image'
  | 'divider'
  | 'video'
  | 'music'
  | 'contact-form'
  | 'email-signup'
  | 'testimonial'
  | 'faq'
  | 'payment-button'
  | 'product-showcase'
  | 'booking'
  | 'donation'
  | 'countdown'
  | 'location'
  | 'file-download'
  | 'custom-code'
  | 'button-grid'
  | 'two-column'
  | 'spacer'
  | 'button'
  | 'accordion'
  | 'email'

export interface BaseModule {
  id: string
  profile_id: string
  type: ModuleType
  title?: string
  position: number
  active: boolean
  clicks: number
  created_at: string
  updated_at: string
}

// Module Content Types
export interface LinkModuleContent {
  url: string
  icon?: string
  style?: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
  }
}

export interface SocialLinksContent {
  links: Array<{
    platform: 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'linkedin' | 'facebook' | 'github' | 'discord' | 'twitch' | 'spotify'
    url: string
    username?: string
  }>
  layout?: 'horizontal' | 'grid'
}

export interface HeaderContent {
  text: string
  level?: 'h1' | 'h2' | 'h3'
  align?: 'left' | 'center' | 'right'
}

export interface TextContent {
  text: string
  align?: 'left' | 'center' | 'right'
  markdown?: boolean
}

export interface ImageContent {
  url: string
  alt?: string
  caption?: string
  link?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'
}

export interface DividerContent {
  style?: 'solid' | 'dashed' | 'dotted' | 'double'
  color?: string
}

export interface VideoContent {
  url: string
  platform?: 'youtube' | 'vimeo' | 'tiktok' | 'loom'
  thumbnail?: string
}

export interface MusicContent {
  url: string
  platform?: 'spotify' | 'apple-music' | 'soundcloud'
}

export interface ContactFormContent {
  fields: Array<{
    name: string
    type: 'text' | 'email' | 'tel' | 'textarea'
    label: string
    required: boolean
  }>
  submitText?: string
  emailTo: string
}

export interface EmailSignupContent {
  provider?: 'mailchimp' | 'convertkit' | 'custom'
  placeholder?: string
  buttonText?: string
  apiEndpoint?: string
}

export interface TestimonialContent {
  quote: string
  author: string
  role?: string
  avatar?: string
  rating?: number
}

export interface FAQContent {
  items: Array<{
    question: string
    answer: string
  }>
}

export interface PaymentButtonContent {
  provider: 'stripe' | 'paypal' | 'venmo' | 'cashapp'
  url: string
  amount?: number
  currency?: string
}

export interface ProductContent {
  name: string
  description?: string
  price?: number
  currency?: string
  image?: string
  url: string
}

export interface BookingContent {
  provider?: 'calendly' | 'cal' | 'custom'
  url: string
}

export interface CountdownContent {
  targetDate: string
  title?: string
  expiredText?: string
}

export interface LocationContent {
  address?: string
  mapUrl?: string
  embedUrl?: string
}

export interface FileDownloadContent {
  url: string
  fileName: string
  fileSize?: string
  fileType?: string
}

export interface CustomCodeContent {
  html?: string
  css?: string
  javascript?: string
}

export interface ButtonGridContent {
  buttons: Array<{
    title: string
    url: string
    icon?: string
  }>
  columns?: 2 | 3 | 4
}

export interface TwoColumnContent {
  leftModuleId?: string | null
  rightModuleId?: string | null
  ratio: '50-50' | '60-40' | '40-60'
}

export interface SpacerContent {
  height?: number
}

// Union type for all module contents
export type ModuleContent =
  | LinkModuleContent
  | SocialLinksContent
  | HeaderContent
  | TextContent
  | ImageContent
  | DividerContent
  | VideoContent
  | MusicContent
  | ContactFormContent
  | EmailSignupContent
  | TestimonialContent
  | FAQContent
  | PaymentButtonContent
  | ProductContent
  | BookingContent
  | CountdownContent
  | LocationContent
  | FileDownloadContent
  | CustomCodeContent
  | ButtonGridContent
  | TwoColumnContent
  | SpacerContent

export interface Module extends BaseModule {
  content: ModuleContent
}

export type ProfileWithModules = Profile & {
  modules: Module[]
  theme?: Theme | null
}
