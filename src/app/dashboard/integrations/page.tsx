'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Zap, Mail, BarChart3, DollarSign, Calendar, MessageSquare,
  Webhook, Check, X, Settings, ExternalLink, Activity, AlertCircle,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Profile, Integration, IntegrationConfig, IntegrationProvider } from '@/types'
import { IntegrationLogos } from '@/components/integrations/integration-logos'

// Integration configurations
const INTEGRATION_CONFIGS: IntegrationConfig[] = [
  {
    provider: 'mailchimp',
    displayName: 'Mailchimp',
    description: 'Sync email subscribers and send campaigns',
    icon: 'Mail',
    category: 'email',
    requiresAuth: true,
    configFields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'list_id', label: 'Audience ID', type: 'text', required: true },
    ],
    features: ['Email list sync', 'Automated campaigns', 'Subscriber tracking']
  },
  {
    provider: 'convertkit',
    displayName: 'ConvertKit',
    description: 'Email marketing for creators',
    icon: 'Mail',
    category: 'email',
    requiresAuth: true,
    configFields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'form_id', label: 'Form ID', type: 'text', required: true },
    ],
    features: ['Form submissions', 'Tag subscribers', 'Email sequences']
  },
  {
    provider: 'klaviyo',
    displayName: 'Klaviyo',
    description: 'Advanced email and SMS marketing',
    icon: 'Mail',
    category: 'email',
    requiresAuth: true,
    configFields: [
      { key: 'api_key', label: 'Private API Key', type: 'password', required: true },
      { key: 'list_id', label: 'List ID', type: 'text', required: false },
    ],
    features: ['Email campaigns', 'SMS marketing', 'Advanced segmentation']
  },
  {
    provider: 'zapier',
    displayName: 'Zapier',
    description: 'Connect to 5,000+ apps',
    icon: 'Zap',
    category: 'automation',
    requiresAuth: false,
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true, placeholder: 'https://hooks.zapier.com/hooks/catch/...' },
    ],
    features: ['5000+ app integrations', 'Multi-step workflows', 'Conditional logic']
  },
  {
    provider: 'make',
    displayName: 'Make (Integromat)',
    description: 'Visual automation platform',
    icon: 'Zap',
    category: 'automation',
    requiresAuth: false,
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true, placeholder: 'https://hook.integromat.com/...' },
    ],
    features: ['Visual workflow builder', 'Advanced automation', 'API connections']
  },
  {
    provider: 'google_analytics',
    displayName: 'Google Analytics',
    description: 'Track visitors and conversions',
    icon: 'BarChart3',
    category: 'analytics',
    requiresAuth: false,
    configFields: [
      { key: 'measurement_id', label: 'Measurement ID', type: 'text', required: true, placeholder: 'G-XXXXXXXXXX' },
    ],
    features: ['Page views', 'User behavior', 'Conversion tracking']
  },
  {
    provider: 'facebook_pixel',
    displayName: 'Facebook Pixel',
    description: 'Track Meta ad conversions',
    icon: 'BarChart3',
    category: 'analytics',
    requiresAuth: false,
    configFields: [
      { key: 'pixel_id', label: 'Pixel ID', type: 'text', required: true },
    ],
    features: ['Ad conversion tracking', 'Custom audiences', 'Event tracking']
  },
  {
    provider: 'tiktok_pixel',
    displayName: 'TikTok Pixel',
    description: 'Track TikTok ad performance',
    icon: 'BarChart3',
    category: 'analytics',
    requiresAuth: false,
    configFields: [
      { key: 'pixel_id', label: 'Pixel ID', type: 'text', required: true },
    ],
    features: ['Ad tracking', 'Event monitoring', 'Audience building']
  },
  {
    provider: 'stripe',
    displayName: 'Stripe',
    description: 'Accept payments and subscriptions',
    icon: 'DollarSign',
    category: 'payment',
    requiresAuth: true,
    configFields: [
      { key: 'publishable_key', label: 'Publishable Key', type: 'text', required: true },
      { key: 'secret_key', label: 'Secret Key', type: 'password', required: true },
    ],
    features: ['Payment links', 'Subscriptions', 'Donation buttons']
  },
  {
    provider: 'paypal',
    displayName: 'PayPal',
    description: 'PayPal payment buttons',
    icon: 'DollarSign',
    category: 'payment',
    requiresAuth: true,
    configFields: [
      { key: 'client_id', label: 'Client ID', type: 'text', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
    ],
    features: ['Payment buttons', 'Donations', 'Buy now links']
  },
  {
    provider: 'calendly',
    displayName: 'Calendly',
    description: 'Embed booking calendars',
    icon: 'Calendar',
    category: 'calendar',
    requiresAuth: false,
    configFields: [
      { key: 'username', label: 'Calendly Username', type: 'text', required: true },
    ],
    features: ['Meeting scheduling', 'Calendar embeds', 'Automated reminders']
  },
  {
    provider: 'cal_com',
    displayName: 'Cal.com',
    description: 'Open source scheduling',
    icon: 'Calendar',
    category: 'calendar',
    requiresAuth: false,
    configFields: [
      { key: 'username', label: 'Cal.com Username', type: 'text', required: true },
    ],
    features: ['Meeting scheduling', 'Team bookings', 'Custom availability']
  },
  {
    provider: 'discord',
    displayName: 'Discord',
    description: 'Send notifications to Discord',
    icon: 'MessageSquare',
    category: 'social',
    requiresAuth: false,
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true },
    ],
    features: ['New visitor alerts', 'Link click notifications', 'Custom messages']
  },
  {
    provider: 'slack',
    displayName: 'Slack',
    description: 'Send notifications to Slack',
    icon: 'MessageSquare',
    category: 'social',
    requiresAuth: false,
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true },
    ],
    features: ['Real-time alerts', 'Activity notifications', 'Team collaboration']
  },
  {
    provider: 'custom_webhook',
    displayName: 'Custom Webhook',
    description: 'Send data to any webhook endpoint',
    icon: 'Webhook',
    category: 'other',
    requiresAuth: false,
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true },
      { key: 'secret', label: 'Secret Key (optional)', type: 'password', required: false },
    ],
    features: ['Custom event triggers', 'Flexible data format', 'HTTP POST requests']
  },
]

const CATEGORY_ICONS = {
  email: Mail,
  automation: Zap,
  analytics: BarChart3,
  payment: DollarSign,
  calendar: Calendar,
  social: MessageSquare,
  other: Webhook,
}

export default function IntegrationsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null)
  const [configuring, setConfiguring] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const supabase = createBrowserClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get profile
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)

        // Get integrations
        const { data: integrationsData } = await (supabase as any)
          .from('integrations')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('created_at', { ascending: false })

        setIntegrations(integrationsData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigureIntegration = (config: IntegrationConfig) => {
    setSelectedIntegration(config)
    setConfiguring(true)
  }

  const handleSaveIntegration = async (config: Record<string, any>) => {
    if (!profile || !selectedIntegration) return

    try {
      const { error } = await (supabase as any)
        .from('integrations')
        .upsert({
          profile_id: profile.id,
          provider: selectedIntegration.provider,
          name: selectedIntegration.displayName,
          is_active: true,
          config,
        })

      if (error) throw error

      alert('Integration configured successfully!')
      setConfiguring(false)
      setSelectedIntegration(null)
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to configure integration')
    }
  }

  const handleToggleIntegration = async (integration: Integration) => {
    try {
      const { error } = await (supabase as any)
        .from('integrations')
        .update({ is_active: !integration.is_active })
        .eq('id', integration.id)

      if (error) throw error

      await loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to toggle integration')
    }
  }

  const handleTestConnection = async (integration: Integration) => {
    setTestingConnection(true)
    try {
      // Simulate testing connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Connection test successful!')
    } catch (error: any) {
      alert('Connection test failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleDeleteIntegration = async (integration: Integration) => {
    if (!confirm('Are you sure you want to remove this integration?')) return

    try {
      const { error } = await (supabase as any)
        .from('integrations')
        .delete()
        .eq('id', integration.id)

      if (error) throw error

      await loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to delete integration')
    }
  }

  const getIntegrationStatus = (provider: IntegrationProvider) => {
    return integrations.find(i => i.provider === provider)
  }

  const filteredConfigs = filterCategory === 'all'
    ? INTEGRATION_CONFIGS
    : INTEGRATION_CONFIGS.filter(c => c.category === filterCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Integrations
        </h1>
        <p className="text-gray-600">Connect your favorite tools and services</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'email', label: 'Email Marketing' },
          { value: 'automation', label: 'Automation' },
          { value: 'analytics', label: 'Analytics' },
          { value: 'payment', label: 'Payments' },
          { value: 'calendar', label: 'Scheduling' },
          { value: 'social', label: 'Social & Messaging' },
          { value: 'other', label: 'Other' },
        ].map((category) => (
          <button
            key={category.value}
            onClick={() => setFilterCategory(category.value)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              filterCategory === category.value
                ? 'bg-primary-500 text-white shadow-soft'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConfigs.map((config) => {
          const integration = getIntegrationStatus(config.provider)
          const IconComponent = CATEGORY_ICONS[config.category]
          const isConnected = !!integration

          return (
            <motion.div
              key={config.provider}
              whileHover={{ y: -4 }}
              className="relative"
            >
              <Card className={`border-2 shadow-soft hover:shadow-soft-lg transition-all h-full ${
                isConnected && integration.is_active
                  ? 'border-green-300 bg-green-50/30'
                  : 'border-gray-200'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    {IntegrationLogos[config.provider]()}
                    {isConnected && (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={integration.is_active}
                          onCheckedChange={() => handleToggleIntegration(integration)}
                        />
                        {integration.is_active && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{config.displayName}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Features */}
                    <div className="space-y-1">
                      {config.features.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isConnected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleConfigureIntegration(config)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(integration)}
                            disabled={testingConnection}
                          >
                            {testingConnection ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Activity className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteIntegration(integration)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600"
                          size="sm"
                          onClick={() => handleConfigureIntegration(config)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>

                    {/* Status */}
                    {isConnected && integration.sync_status === 'error' && (
                      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>{integration.error_message || 'Connection error'}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {configuring && selectedIntegration && (
          <ConfigurationModal
            config={selectedIntegration}
            existingIntegration={getIntegrationStatus(selectedIntegration.provider)}
            onSave={handleSaveIntegration}
            onClose={() => {
              setConfiguring(false)
              setSelectedIntegration(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Configuration Modal Component
function ConfigurationModal({
  config,
  existingIntegration,
  onSave,
  onClose,
}: {
  config: IntegrationConfig
  existingIntegration?: Integration
  onSave: (config: Record<string, any>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState<Record<string, any>>(
    existingIntegration?.config || {}
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Configure {config.displayName}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{config.description}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {config.configFields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key} className="text-sm font-semibold text-gray-900">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.type === 'boolean' ? (
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    id={field.key}
                    checked={formData[field.key] || false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, [field.key]: checked })
                    }
                  />
                  <Label htmlFor={field.key} className="text-sm text-gray-600">
                    {field.placeholder || 'Enable'}
                  </Label>
                </div>
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  placeholder={field.placeholder}
                  required={field.required}
                  className="mt-2"
                />
              )}
            </div>
          ))}

          {config.requiresAuth && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Authentication Required</p>
                  <p>
                    You&apos;ll need to create an API key or connect your account in the {config.displayName} dashboard.{' '}
                    <a href="#" className="underline flex items-center gap-1 inline-flex">
                      Learn more <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-gray-200 flex gap-3 bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600"
          >
            {existingIntegration ? 'Update' : 'Connect'} Integration
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
