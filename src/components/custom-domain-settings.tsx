'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react'
import type { Profile } from '@/types'

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'clicky.com'

interface CustomDomainSettingsProps {
  profile: Profile
  userPlan: 'free' | 'pro' | 'enterprise'
  onUpdate: () => void
}

export function CustomDomainSettings({ profile, userPlan, onUpdate }: CustomDomainSettingsProps) {
  const [domain, setDomain] = useState(profile.custom_domain || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  const isBusinessPlan = userPlan === 'enterprise'

  const handleVerifyDomain = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/verify-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          domain: domain.trim().toLowerCase()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify domain')
      }

      setSuccess(data.message)
      onUpdate()
    } catch (err: any) {
      setError(err.message || 'Failed to verify domain')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDomain = async () => {
    if (!confirm('Are you sure you want to remove your custom domain?')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const { createBrowserClient } = await import('@/lib/supabase')
      const supabase = createBrowserClient()

      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({
          custom_domain: null,
          domain_verified: false,
          domain_verified_at: null
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setDomain('')
      setSuccess('Custom domain removed')
      onUpdate()
    } catch (err: any) {
      setError(err.message || 'Failed to remove domain')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isBusinessPlan) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-purple-100 rounded-lg p-3">
            <Crown className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Custom Domain</h3>
            <p className="text-gray-600 mb-4">
              Use your own domain (e.g., links.yourbrand.com) instead of {APP_DOMAIN}/{profile.slug}
            </p>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => window.location.href = '/dashboard/settings?tab=billing'}
            >
              Upgrade to Business
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600" />
          Custom Domain
        </h3>
        <p className="text-sm text-gray-600">
          Connect your own domain to this profile. Your profile will be accessible at your custom domain.
        </p>
      </div>

      {/* Current Status */}
      {profile.custom_domain && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          profile.domain_verified
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            {profile.domain_verified ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {profile.domain_verified ? 'Domain Verified' : 'Domain Pending Verification'}
              </p>
              <p className="text-sm text-gray-600">{profile.custom_domain}</p>
            </div>
            <a
              href={`https://${profile.custom_domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Domain Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Domain
          </label>
          <Input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="links.yourdomain.com"
            disabled={loading}
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your subdomain (e.g., links.yourdomain.com or go.yourbrand.com)
          </p>
        </div>

        {/* DNS Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            DNS Configuration Required
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Add this CNAME record in your DNS settings:
          </p>
          <div className="bg-white rounded border border-gray-300 p-3 font-mono text-sm">
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <span className="text-gray-500 text-xs">Type</span>
                <p className="font-semibold">CNAME</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Name</span>
                <p className="font-semibold">{domain ? domain.split('.')[0] : 'links'}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs">Value</span>
                  <p className="font-semibold">{APP_DOMAIN}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(APP_DOMAIN)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Copy"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            DNS changes can take up to 48 hours to propagate worldwide.
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleVerifyDomain}
            disabled={loading || !domain.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? 'Verifying...' : profile.custom_domain ? 'Update Domain' : 'Add Domain'}
          </Button>

          {profile.custom_domain && (
            <Button
              onClick={handleRemoveDomain}
              disabled={loading}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Remove Domain
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Crown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  )
}

function Globe({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  )
}
