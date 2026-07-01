import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useConclaveStore } from '../../store/conclaveStore'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '◈' },
  { path: '/chamber', label: 'Chamber', icon: '◉' },
  { path: '/inject', label: 'Inject', icon: '⊕' },
  { path: '/discover', label: 'Discover', icon: '◎' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const conclave = useConclaveStore((s) => s.conclave)

  return (
    <div className="min-h-screen bg-[#080810] bg-dot-grid bg-dot-grid pb-20 lg:pb-0">
      <aside className="hidden lg:flex flex-col items-center w-16 fixed left-4 top-4 bottom-4 bg-[#0f0f1a] border border-[#1e1e35] rounded-2xl py-4 z-50">
        <div className="flex flex-col gap-2 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                  isActive ? 'bg-[#7c6af7] text-white shadow-[0_0_16px_rgba(124,106,247,0.4)]' : 'text-[#4a4a6a] hover:text-[#8b8ba7] hover:bg-[#1a1a2e]'
                }`}
              >
                {item.icon}
              </button>
            )
          })}
        </div>
        <div className="w-9 h-9 rounded-full bg-[#1a1a2e] border border-[#1e1e35] flex items-center justify-center text-[#8b8ba7] font-mono text-xs">
          {(conclave?.name || 'C')[0]}
        </div>
      </aside>

      <div className="lg:pl-24">
        <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-[#0f0f1a]/95 backdrop-blur-sm border border-[#1e1e35] rounded-full px-2 py-1.5">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#8b8ba7] hover:text-white hover:bg-[#1a1a2e] transition-colors">⌕</button>
          <button className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#8b8ba7] hover:text-white hover:bg-[#1a1a2e] transition-colors">
            🔔
          </button>
        </div>

        {children}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f1a]/95 backdrop-blur-sm border-t border-[#1e1e35] z-50 lg:hidden">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-all duration-200 ${
                  isActive ? 'text-[#7c6af7]' : 'text-[#4a4a6a] hover:text-[#8b8ba7]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-[9px] font-mono tracking-widest uppercase">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
