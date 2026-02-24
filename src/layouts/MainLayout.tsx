import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-slate-900 to-black">
      <header className="border-b border-slate-800 backdrop-blur-sm bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            DraftAssist 🚀
          </h1>
          <p className="text-slate-400 mt-2">Startup Mode Activated</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-6 py-16 w-full">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-500">
          <p>&copy; 2026 DraftAssist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
