import Link from 'next/link'
import { ArrowRight, Link2, Zap, BarChart3, Palette, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-soft">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Clicky
            </span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-700 hover:text-gray-900 font-semibold transition-colors">Features</a>
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-semibold transition-colors">Pricing</a>
            <a href="#examples" className="text-gray-700 hover:text-gray-900 font-semibold transition-colors">Examples</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 font-semibold transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-all font-semibold shadow-soft hover:shadow-soft-lg hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pastel-sky to-pastel-lavender text-gray-900 border border-gray-200 rounded-full px-6 py-3 mb-8 shadow-soft font-semibold">
            <Sparkles className="w-5 h-5" />
            <span className="text-base">Launch your link page in 60 seconds</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight">
            Your Links,
            <br />
            <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
              Beautifully
            </span>{' '}
            Organized
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create a stunning link-in-bio page in minutes. Share all your important links
            in one beautiful, clickable place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-primary-500 text-white px-8 py-4 rounded-xl hover:bg-primary-600 transition-all shadow-soft-lg hover:shadow-soft-xl hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 text-lg font-semibold"
            >
              <span>Create Your Clicky</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              href="/examples"
              className="bg-white text-gray-700 px-8 py-4 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all shadow-soft hover:shadow-soft-lg hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 text-lg font-semibold"
            >
              <span>View Examples</span>
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="mt-16">
            <div className="bg-white border border-gray-200 rounded-3xl shadow-soft-xl p-8 max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full mb-4 shadow-soft"></div>
                <h3 className="text-2xl font-bold mb-2">@yourname</h3>
                <p className="text-gray-600 text-base mb-6 text-center">
                  Creator, Developer, Dreamer
                </p>
                <div className="space-y-3 w-full">
                  {[
                    { name: 'My Portfolio', color: 'bg-pastel-butter' },
                    { name: 'Latest Project', color: 'bg-pastel-rose' },
                    { name: 'Social Links', color: 'bg-pastel-sky' }
                  ].map((link, i) => (
                    <div
                      key={i}
                      className={`${link.color} border border-gray-200 rounded-2xl p-4 text-center font-semibold shadow-soft hover:shadow-soft-lg transition-all cursor-pointer hover:scale-105 active:scale-95 text-gray-900`}
                    >
                      {link.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gradient-to-br from-pastel-mint to-pastel-sage border-y border-gray-200 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 text-gray-900">Everything you need to stand out</h2>
            <p className="text-xl text-gray-600">
              Powerful features that make your links unforgettable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Optimized for speed. Your page loads instantly, keeping your audience engaged."
              color="bg-pastel-butter"
            />
            <FeatureCard
              icon={<Palette className="w-8 h-8" />}
              title="Beautiful Themes"
              description="Choose from dozens of stunning themes or customize your own unique style."
              color="bg-pastel-rose"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Smart Analytics"
              description="See which links perform best with real-time click tracking and insights."
              color="bg-pastel-sky"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-pastel-lavender to-pastel-lilac border border-gray-200 rounded-3xl p-12 text-center text-gray-900 shadow-soft-xl">
          <h2 className="text-5xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 text-gray-700">
            Join thousands of creators sharing their links with Clicky
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-8 py-4 rounded-xl hover:bg-primary-600 transition-all shadow-soft-lg hover:shadow-soft-xl hover:scale-105 active:scale-95 text-lg font-semibold"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Clicky</span>
            </div>
            <div className="flex space-x-8 text-gray-600 font-semibold">
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-500 text-sm">
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
  color
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <div className="p-6 border border-gray-200 rounded-2xl bg-white transition-all hover:shadow-soft-lg hover:scale-105">
      <div className={`${color} text-gray-900 w-16 h-16 border border-gray-200 rounded-xl flex items-center justify-center mb-4 shadow-soft`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
