'use client'

import { EmailCaptureModule } from '@/components/modules/email-capture-module'
import { ContactFormModule } from '@/components/modules/contact-form-module'

export default function TestModalPage() {
  // Mock module data for testing
  const emailCaptureModule = {
    id: 'test-email-1',
    type: 'email-capture' as const,
    content: {
      title: 'Join my mailing list',
      description: 'Get exclusive updates delivered straight to your inbox.',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
      successMessage: 'Thanks for subscribing! Check your inbox.',
    },
    profile_id: 'test-profile',
    section_id: null,
    position: 0,
    visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const contactFormModule = {
    id: 'test-contact-1',
    type: 'contact-form' as const,
    content: {
      title: 'Get in Touch',
      description: "Send me a message and I'll get back to you soon.",
      namePlaceholder: 'Your name',
      emailPlaceholder: 'Your email',
      messagePlaceholder: 'Your message',
      buttonText: 'Send Message',
      successMessage: "Message sent! I'll get back to you soon.",
      requireName: true,
      requireEmail: true,
    },
    profile_id: 'test-profile',
    section_id: null,
    position: 1,
    visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Modal Form Demo
          </h1>
          <p className="text-gray-600">
            Click the buttons below to see the professional modal forms in action
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email Capture Module
            </h2>
            <p className="text-gray-600 mb-4">
              Click to see the newsletter subscription modal
            </p>
            <EmailCaptureModule
              module={emailCaptureModule}
              profileId="test-profile"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Contact Form Module
            </h2>
            <p className="text-gray-600 mb-4">
              Click to see the contact form modal
            </p>
            <ContactFormModule
              module={contactFormModule}
              profileId="test-profile"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-bold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>✓ Buttons trigger smooth modal animations</li>
            <li>✓ Forms open in professional modals with backdrop blur</li>
            <li>✓ Clean white backgrounds with gradient icon headers</li>
            <li>✓ Form validation and error handling included</li>
            <li>✓ Success states with green checkmarks</li>
            <li>✓ ESC key to close, click backdrop to close</li>
          </ul>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Note: Form submissions won&apos;t work on this demo page (no Supabase connection)</p>
          <p>But you can see the full modal UI and interactions!</p>
        </div>
      </div>
    </div>
  )
}
