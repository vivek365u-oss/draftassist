import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            DraftAssist
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            Transform your assignments into professional drafts with intelligent structuring and clean formatting.
          </p>
          <p className="text-slate-400 max-w-xl mx-auto">
            Get structured feedback from experts. Create polished drafts in minutes. Collaborate with peers.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            to="/signup"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition duration-300 shadow-lg shadow-blue-500/20 text-center"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 border border-slate-600 hover:border-slate-400 rounded-lg font-semibold transition duration-300 text-center"
          >
            Sign In
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🎯',
              title: 'Smart Structuring',
              description: 'Intelligent AI-powered assignment structuring',
            },
            {
              icon: '👥',
              title: 'Expert Review',
              description: 'Get feedback from experienced professionals',
            },
            {
              icon: '⚡',
              title: 'Quick Turnaround',
              description: 'Professional drafts in minutes, not hours',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-blue-500 transition-colors"
            >
              <p className="text-4xl mb-3">{feature.icon}</p>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
