import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '◈' },
  { path: '/chamber', label: 'Chamber', icon: '◉' },
  { path: '/inject', label: 'Inject', icon: '⊕' },
  { path: '/discover', label: 'Discover', icon: '◎' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#080810] pb-20">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f1a] border-t border-[#1e1e35] z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-all duration-200 ${
                  isActive ? 'text-[#7c6af7]' : 'text-[#4a4a6a]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-mono">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
