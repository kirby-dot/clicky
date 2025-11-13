import Link from 'next/link'
import { ArrowRight, Link2, Zap, BarChart3, Palette, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-neo-yellow sticky top-0 z-50 shadow-brutal">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link2 className="w-8 h-8 text-black" />
            <span className="text-2xl font-black text-black">
              CLICKY
            </span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-black hover:underline font-bold">Features</a>
            <a href="#pricing" className="text-black hover:underline font-bold">Pricing</a>
            <a href="#examples" className="text-black hover:underline font-bold">Examples</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-black hover:underline font-bold"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-black text-white px-6 py-3 border-3 border-black hover:bg-neo-pink hover:text-black transition-colors font-bold shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-neo-blue text-black border-3 border-black px-6 py-3 mb-8 shadow-brutal font-bold">
            <Sparkles className="w-5 h-5" />
            <span className="text-base">Launch your link page in 60 seconds</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 text-black leading-tight">
            Your Links,
            <br />
            <span className="bg-neo-pink inline-block px-4 py-2 border-4 border-black shadow-brutal-lg">
              Beautifully
            </span>{' '}
            Organized
          </h1>

          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto font-medium">
            Create a stunning link-in-bio page in minutes. Share all your important links
            in one beautiful, clickable place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-neo-yellow text-black px-8 py-4 border-4 border-black hover:bg-neo-green transition-all shadow-brutal hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center space-x-2 text-lg font-black"
            >
              <span>Create Your Clicky</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              href="/examples"
              className="bg-white text-black px-8 py-4 border-4 border-black hover:bg-gray-100 transition-all shadow-brutal hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center space-x-2 text-lg font-black"
            >
              <span>View Examples</span>
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="mt-16">
            <div className="bg-white border-4 border-black shadow-brutal-lg p-8 max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-neo-purple border-4 border-black mb-4"></div>
                <h3 className="text-2xl font-black mb-2">@yourname</h3>
                <p className="text-gray-700 text-base mb-6 text-center font-medium">
                  Creator, Developer, Dreamer ✨
                </p>
                <div className="space-y-3 w-full">
                  {[
                    { name: 'My Portfolio', color: 'bg-neo-yellow' },
                    { name: 'Latest Project', color: 'bg-neo-pink' },
                    { name: 'Social Links', color: 'bg-neo-blue' }
                  ].map((link, i) => (
                    <div
                      key={i}
                      className={`${link.color} border-3 border-black p-4 text-center font-bold hover:shadow-brutal transition-all cursor-pointer active:translate-x-1 active:translate-y-1`}
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
      <section id="features" className="bg-neo-green border-y-4 border-black py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4 text-black">Everything you need to stand out</h2>
            <p className="text-xl text-gray-800 font-bold">
              Powerful features that make your links unforgettable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Optimized for speed. Your page loads instantly, keeping your audience engaged."
              color="bg-neo-yellow"
            />
            <FeatureCard
              icon={<Palette className="w-8 h-8" />}
              title="Beautiful Themes"
              description="Choose from dozens of stunning themes or customize your own unique style."
              color="bg-neo-pink"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Smart Analytics"
              description="See which links perform best with real-time click tracking and insights."
              color="bg-neo-blue"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-neo-purple border-4 border-black p-12 text-center text-black shadow-brutal-lg">
          <h2 className="text-5xl font-black mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 font-bold">
            Join thousands of creators sharing their links with Clicky
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center space-x-2 bg-neo-yellow text-black px-8 py-4 border-4 border-black hover:bg-white transition-all shadow-brutal hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none text-lg font-black"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-black py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Link2 className="w-6 h-6 text-black" />
              <span className="text-xl font-black">CLICKY</span>
            </div>
            <div className="flex space-x-8 text-black font-bold">
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Support</a>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-700 text-sm font-medium">
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
    <div className="p-6 border-4 border-black bg-white transition-all hover:shadow-brutal-lg">
      <div className={`${color} text-black w-16 h-16 border-3 border-black flex items-center justify-center mb-4 shadow-brutal-sm`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-2">{title}</h3>
      <p className="text-gray-700 font-medium">{description}</p>
    </div>
  )
}
