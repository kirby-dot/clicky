import Link from 'next/link'
import { ArrowRight, Link2, Zap, BarChart3, Palette, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link2 className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Clicky
            </span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#examples" className="text-gray-600 hover:text-gray-900">Examples</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Launch your link page in 60 seconds</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary-600 to-purple-600 bg-clip-text text-transparent animate-slide-up">
            Your Links,
            <br />
            Beautifully Organized
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-slide-up">
            Create a stunning link-in-bio page in minutes. Share all your important links
            in one beautiful, clickable place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-8 py-4 rounded-full hover:bg-primary-700 transition-all hover:scale-105 flex items-center justify-center space-x-2 text-lg font-medium"
            >
              <span>Create Your Clicky</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/examples"
              className="bg-white text-gray-700 px-8 py-4 rounded-full hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center justify-center space-x-2 text-lg font-medium"
            >
              <span>View Examples</span>
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="mt-16 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto border border-gray-200">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full mb-4"></div>
                <h3 className="text-xl font-bold mb-2">@yourname</h3>
                <p className="text-gray-600 text-sm mb-6 text-center">
                  Creator, Developer, Dreamer ✨
                </p>
                <div className="space-y-3 w-full">
                  {['My Portfolio', 'Latest Project', 'Social Links'].map((link, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-200 rounded-xl p-4 text-center font-medium hover:scale-105 transition-transform cursor-pointer"
                    >
                      {link}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to stand out</h2>
            <p className="text-xl text-gray-600">
              Powerful features that make your links unforgettable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Optimized for speed. Your page loads instantly, keeping your audience engaged."
            />
            <FeatureCard
              icon={<Palette className="w-8 h-8" />}
              title="Beautiful Themes"
              description="Choose from dozens of stunning themes or customize your own unique style."
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Smart Analytics"
              description="See which links perform best with real-time click tracking and insights."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators sharing their links with Clicky
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all hover:scale-105 text-lg font-medium"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Link2 className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold">Clicky</span>
            </div>
            <div className="flex space-x-8 text-gray-600">
              <a href="#" className="hover:text-gray-900">Terms</a>
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">Support</a>
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
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl border-2 border-gray-100 hover:border-primary-200 transition-all hover:shadow-lg">
      <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
