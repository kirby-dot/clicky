'use client'

import Link from 'next/link'
import {
  ArrowRight, Link2, Zap, BarChart3, Palette, Sparkles, Check,
  Layout, Users, Crown, Globe, Code, TrendingUp, Shield, Layers,
  Smartphone, Image as ImageIcon, Type, Video, Music, Mail
} from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function HomePage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'radial-gradient(ellipse at top, #f3e8ff 0%, #fff7f3 50%, #fef3f2 100%)',
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/50 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-sm"
      >
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center shadow-soft"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Link2 className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
              Clicky
            </span>
          </motion.div>
          <nav className="hidden md:flex space-x-8">
            {['Features', 'Pricing', 'Examples'].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1), duration: 0.5 }}
                className="text-slate-700 hover:text-slate-900 font-semibold transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-400 to-accent-600 group-hover:w-full transition-all duration-300"></span>
              </motion.a>
            ))}
          </nav>
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link
              href="/login"
              className="text-slate-700 hover:text-slate-900 font-semibold transition-colors relative group"
            >
              Login
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-400 to-accent-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/signup"
                className="bg-accent-400 text-white px-6 py-3 rounded-xl hover:bg-accent-500 transition-all font-semibold shadow-sm hover:shadow-md"
              >
                Get Started Free
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="container mx-auto px-6 py-20 md:py-32">
        <motion.div
          style={{ opacity, scale }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-xl text-slate-800 border border-white/30 rounded-full px-6 py-3 mb-8 shadow-sm font-semibold group cursor-default"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              <Sparkles className="w-5 h-5 text-accent-500" />
            </motion.div>
            <span className="text-base">The most powerful link-in-bio builder</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 leading-tight"
          >
            One Link,
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
              className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent inline-block"
            >
              Infinite
            </motion.span>{' '}
            Possibilities
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto"
          >
            Build stunning link-in-bio pages with our visual drag-and-drop builder.
            15+ module types, team collaboration, analytics, and more — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/signup"
                className="bg-accent-400 text-white px-8 py-4 rounded-xl hover:bg-accent-500 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-lg font-semibold"
              >
                <span>Start Building Free</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="#features"
                className="bg-white/50 backdrop-blur-xl text-slate-700 px-8 py-4 rounded-xl border border-white/30 hover:bg-white/70 transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 text-lg font-semibold"
              >
                <span>See Features</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16"
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl shadow-lg p-8 max-w-md mx-auto"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full mb-4 shadow-sm"
                ></motion.div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="text-2xl font-bold mb-2 text-slate-800"
                >
                  @yourname
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-slate-600 text-base mb-6 text-center"
                >
                  Creator, Developer, Dreamer
                </motion.p>
                <div className="space-y-3 w-full">
                  {[
                    { name: 'My Portfolio', color: 'from-blue-100 to-blue-200' },
                    { name: 'Latest Project', color: 'from-purple-100 to-purple-200' },
                    { name: 'Social Links', color: 'from-green-100 to-green-200' }
                  ].map((link, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + i * 0.1 }}
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-gradient-to-r ${link.color} backdrop-blur-sm border border-white/30 rounded-2xl p-4 text-center font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer text-slate-800`}
                    >
                      {link.name}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 text-slate-900">Everything you need to stand out</h2>
            <p className="text-xl text-slate-600">
              Powerful features that make your links unforgettable
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {[
              {
                icon: <Layout className="w-8 h-8" />,
                title: "Visual Page Builder",
                description: "Drag-and-drop builder with live preview. Clean interface for effortless customization.",
                color: "from-blue-100 to-blue-200"
              },
              {
                icon: <Layers className="w-8 h-8" />,
                title: "15+ Module Types",
                description: "Links, headers, images, videos, music players, social icons, countdowns, FAQs, and more.",
                color: "from-purple-100 to-purple-200"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Multi-Profile Support",
                description: "Create unlimited profiles on Business plan. Perfect for managing multiple brands or clients.",
                color: "from-green-100 to-green-200"
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Custom Styling",
                description: "Full design control with backgrounds, animations, colors, and fonts. Make it uniquely yours.",
                color: "from-pink-100 to-pink-200"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Advanced Analytics",
                description: "Track clicks, views, and engagement. Understand your audience with real-time insights.",
                color: "from-yellow-100 to-yellow-200"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "15+ Integrations",
                description: "Connect with Stripe, Mailchimp, Google Analytics, Facebook Pixel, Zapier, and more.",
                color: "from-teal-100 to-teal-200"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Team Collaboration",
                description: "Invite team members with role-based permissions. Work together seamlessly.",
                color: "from-indigo-100 to-indigo-200"
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Mobile Optimized",
                description: "Perfect on every device. Preview in mobile, tablet, and desktop modes.",
                color: "from-orange-100 to-orange-200"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure & Fast",
                description: "Enterprise-grade security with lightning-fast page loads. Your data is safe with us.",
                color: "from-red-100 to-red-200"
              }
            ].map((feature, i) => (
              <FeatureCard
                key={i}
                index={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
              />
            ))}
          </div>

          {/* Module Types Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/30 p-8 md:p-12 shadow-lg max-w-5xl mx-auto"
          >
            <h3 className="text-3xl font-bold text-center mb-8 text-slate-900">15+ Powerful Module Types</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { icon: <Link2 className="w-6 h-6" />, label: "Links", color: "from-blue-100 to-blue-200" },
                { icon: <Type className="w-6 h-6" />, label: "Headers", color: "from-purple-100 to-purple-200" },
                { icon: <ImageIcon className="w-6 h-6" />, label: "Images", color: "from-pink-100 to-pink-200" },
                { icon: <Video className="w-6 h-6" />, label: "Videos", color: "from-red-100 to-red-200" },
                { icon: <Music className="w-6 h-6" />, label: "Music", color: "from-green-100 to-green-200" },
                { icon: <Users className="w-6 h-6" />, label: "Social", color: "from-yellow-100 to-yellow-200" },
                { icon: <Mail className="w-6 h-6" />, label: "Email", color: "from-teal-100 to-teal-200" },
                { icon: <Globe className="w-6 h-6" />, label: "Buttons", color: "from-indigo-100 to-indigo-200" },
                { icon: <Type className="w-6 h-6" />, label: "Text", color: "from-orange-100 to-orange-200" },
                { icon: <Layout className="w-6 h-6" />, label: "Dividers", color: "from-cyan-100 to-cyan-200" }
              ].map((module, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`bg-gradient-to-br ${module.color} border border-white/30 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="text-slate-700 mb-2">{module.icon}</div>
                  <span className="text-xs font-semibold text-slate-700">{module.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 text-slate-900">Simple, transparent pricing</h2>
          <p className="text-xl text-slate-600">
            Choose the perfect plan for your needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <PricingCard
            name="Free"
            price="$0"
            period="forever"
            description="Perfect for getting started"
            features={[
              "1 profile",
              "Unlimited links",
              "5 module types",
              "Basic analytics",
              "Clicky branding"
            ]}
            buttonText="Get Started"
            buttonVariant="outline"
            index={0}
          />

          {/* Pro Plan */}
          <PricingCard
            name="Pro"
            price="$9"
            period="per month"
            description="For growing creators"
            features={[
              "3 profiles",
              "All 15+ modules",
              "Remove branding",
              "Advanced analytics",
              "1 team member + $3/mo per extra",
              "Priority support",
              "Custom domains"
            ]}
            buttonText="Upgrade to Pro"
            buttonVariant="primary"
            popular={true}
            index={1}
          />

          {/* Business Plan */}
          <PricingCard
            name="Business"
            price="$29"
            period="per month"
            description="For teams and agencies"
            features={[
              "Unlimited profiles",
              "Everything in Pro",
              "White-label",
              "3 team members + $3/mo per extra",
              "Team collaboration",
              "API access",
              "Dedicated support"
            ]}
            buttonText="Go Business"
            buttonVariant="outline"
            index={2}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-12 text-center text-slate-900 shadow-lg"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl font-bold mb-4"
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl mb-8 text-slate-700"
          >
            Join thousands of creators sharing their links with Clicky
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center space-x-2 bg-accent-400 text-white px-8 py-4 rounded-xl hover:bg-accent-500 transition-all shadow-md hover:shadow-lg text-lg font-semibold"
            >
              <span>Create Your Free Account</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/30 py-12 bg-white/30 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">Clicky</span>
            </div>
            <div className="flex space-x-8 text-slate-600 font-semibold">
              <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
            </div>
          </div>
          <div className="text-center mt-8 text-slate-500 text-sm">
            © {new Date().getFullYear()} Clicky. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  index
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-6 border border-white/30 rounded-2xl bg-white/50 backdrop-blur-xl transition-all hover:shadow-lg group"
    >
      <motion.div
        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className={`bg-gradient-to-br ${color} text-slate-700 w-16 h-16 border border-white/30 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-all`}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold mb-2 text-slate-800">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </motion.div>
  )
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  popular = false,
  index
}: {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  buttonText: string
  buttonVariant: 'primary' | 'outline'
  popular?: boolean
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={`relative p-8 border-2 rounded-3xl bg-white/50 backdrop-blur-xl transition-all hover:shadow-xl ${
        popular ? 'border-accent-400 shadow-lg' : 'border-white/30'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-accent-400 to-accent-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-sm">
          MOST POPULAR
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{name}</h3>
        <div className="mb-2">
          <span className="text-5xl font-bold text-slate-900">{price}</span>
          <span className="text-slate-600 ml-2">/ {period}</span>
        </div>
        <p className="text-slate-600">{description}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={`block text-center px-6 py-3 rounded-xl font-semibold transition-all ${
          buttonVariant === 'primary'
            ? 'bg-accent-400 text-white hover:bg-accent-500 shadow-sm hover:shadow-md'
            : 'bg-white/50 backdrop-blur-sm text-slate-900 border-2 border-white/30 hover:bg-white/70'
        }`}
      >
        {buttonText}
      </Link>
    </motion.div>
  )
}
