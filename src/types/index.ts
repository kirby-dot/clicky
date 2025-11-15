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
  gradient?: {
    enabled: boolean
    type: 'linear' | 'radial'
    direction?: string // e.g., 'to-br', '135deg'
    colors: string[] // array of colors for gradient
  }
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
    borderWidth?: number
    borderRadius?: number
    shadow?: 'none' | 'sm' | 'md' | 'lg'
    fontSize?: number
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
    align?: 'left' | 'center' | 'right'
    fullWidth?: boolean
  }
}

export interface SocialLinksContent {
  links: Array<{
    platform: 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'linkedin' | 'facebook' | 'github' | 'discord' | 'twitch' | 'spotify'
    url: string
    username?: string
  }>
  layout?: 'horizontal' | 'grid'
  iconSize?: number // 24-64px
  iconColor?: string
  backgroundColor?: string
  borderRadius?: number
}

export interface HeaderContent {
  text: string
  level?: 'h1' | 'h2' | 'h3'
  align?: 'left' | 'center' | 'right'
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
}

export interface TextContent {
  text: string
  align?: 'left' | 'center' | 'right'
  markdown?: boolean
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
}

export interface ImageContent {
  url: string
  alt?: string
  caption?: string
  link?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'
  width?: number // percentage 1-100
  borderRadius?: number // pixels 0-50
  align?: 'left' | 'center' | 'right'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

export interface DividerContent {
  style?: 'solid' | 'dashed' | 'dotted' | 'double'
  color?: string
}

export interface VideoContent {
  url: string
  platform?: 'youtube' | 'vimeo' | 'tiktok' | 'loom'
  thumbnail?: string
  width?: number
  borderRadius?: number
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

export interface MusicContent {
  url: string
  platform?: 'spotify' | 'apple-music' | 'soundcloud'
  width?: number
  borderRadius?: number
  shadow?: 'none' | 'sm' | 'md' | 'lg'
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
  section_id?: string | null
  column_index?: number
}

// Section System Types
export interface SectionLayout {
  columns: 1 | 2 | 3 | 4
  gap: number // spacing between columns in pixels
  mobileColumns: 1 | 2
  alignment: 'left' | 'center' | 'right'
}

export interface SectionStyle {
  backgroundColor?: string | null
  backgroundImage?: string | null
  backgroundGradient?: {
    enabled: boolean
    type: 'linear' | 'radial'
    direction?: string
    colors: string[]
  } | null
  padding: {
    top: number
    bottom: number
    left: number
    right: number
  }
  margin: {
    top: number
    bottom: number
  }
  borderRadius: number
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth: boolean
}

export interface Section {
  id: string
  profile_id: string
  title?: string | null
  order: number
  layout: SectionLayout
  style: SectionStyle
  active: boolean
  created_at: string
  updated_at: string
}

export interface SectionWithModules extends Section {
  modules: Module[]
}

export interface ProfileLayoutStyle {
  layout?: 'stack' | 'grid' | 'masonry' | 'centered'
  maxWidth?: number // pixels, default 680
  gap?: number // spacing between modules in pixels
  padding?: number // horizontal padding in pixels
  backgroundColor?: string
  backgroundImage?: string
  backgroundGradient?: string
}

// Unified Profile Style System
export interface ProfileStyle {
  // Typography
  fontFamily: string
  headingSize: 'small' | 'medium' | 'large' | 'xl'
  bodySize: 'small' | 'medium' | 'large'

  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string

  // Layout
  buttonRoundness: 'square' | 'slightly-rounded' | 'rounded' | 'pill'
  sectionSpacing: 'tight' | 'normal' | 'loose'
  moduleSpacing: 'tight' | 'normal' | 'loose'

  // Page Background
  backgroundImage?: string
  backgroundGradient?: string

  // Animation
  animation: 'none' | 'fade-in' | 'fade-up' | 'scale-in'
}

export type ProfileWithModules = Profile & {
  modules: Module[]
  theme?: Theme | null
}

// A/B Testing Types
export type ABTestStatus = 'draft' | 'running' | 'paused' | 'completed'

export interface ABTest {
  id: string
  profile_id: string
  module_id: string
  name: string
  description?: string
  status: ABTestStatus
  winner_variant_id?: string
  started_at?: string
  ended_at?: string
  created_at: string
  updated_at: string
}

export interface ABTestVariant {
  id: string
  test_id: string
  name: string
  is_control: boolean
  traffic_percentage: number
  content: ModuleContent
  views: number
  clicks: number
  created_at: string
  updated_at: string
}

export interface ABTestResults {
  variant_id: string
  variant_name: string
  views: number
  clicks: number
  ctr: number
  is_winner: boolean
  confidence: number
}

export type ABTestWithVariants = ABTest & {
  variants: ABTestVariant[]
}

// Integrations Types
export type IntegrationProvider =
  | 'mailchimp'
  | 'convertkit'
  | 'klaviyo'
  | 'zapier'
  | 'make'
  | 'google_analytics'
  | 'facebook_pixel'
  | 'tiktok_pixel'
  | 'stripe'
  | 'paypal'
  | 'calendly'
  | 'cal_com'
  | 'discord'
  | 'slack'
  | 'twitter_api'
  | 'instagram_api'
  | 'custom_webhook'

export type IntegrationSyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export interface Integration {
  id: string
  profile_id: string
  provider: IntegrationProvider
  name: string
  is_active: boolean
  config: Record<string, any>
  credentials?: Record<string, any>
  last_sync_at?: string
  sync_status: IntegrationSyncStatus
  error_message?: string
  created_at: string
  updated_at: string
}

export interface IntegrationEvent {
  id: string
  integration_id: string
  event_type: string
  payload?: Record<string, any>
  response?: Record<string, any>
  status: 'pending' | 'success' | 'failed'
  error_message?: string
  created_at: string
}

export interface IntegrationConfig {
  provider: IntegrationProvider
  displayName: string
  description: string
  icon: string
  category: 'email' | 'automation' | 'analytics' | 'payment' | 'calendar' | 'social' | 'other'
  requiresAuth: boolean
  configFields: Array<{
    key: string
    label: string
    type: 'text' | 'password' | 'url' | 'select' | 'boolean'
    placeholder?: string
    required?: boolean
    options?: Array<{ label: string; value: string }>
  }>
  features: string[]
}

// Badge Types
export type BadgeType = 'verification' | 'tier' | 'industry' | 'custom'

export interface Badge {
  id: string
  name: string
  display_name: string
  description?: string
  icon: string // lucide-react icon name or emoji
  color: string // hex color
  type: BadgeType
  required_tier?: 'free' | 'pro' | 'enterprise'
  is_active: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface ProfileWithBadge extends Profile {
  badge?: Badge | null
}
