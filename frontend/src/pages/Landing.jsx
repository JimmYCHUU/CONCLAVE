import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Landing() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    useAuthStore.getState().loadFromStorage()
    if (useAuthStore.getState().isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1
          className="text-[6rem] sm:text-[8rem] font-mono font-black text-white leading-none select-none"
          style={{ textShadow: '0 0 60px rgba(124,106,247,0.4)' }}
        >
          CONCLAVE
        </h1>
        <p className="text-[#8b8ba7] font-mono text-sm mt-4 tracking-wide">
          Your private intelligence operation.
        </p>
        <p className="text-[#4a4a6a] font-mono text-xs mt-1">
          Working while you sleep.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/onboarding')}
          className="mt-10 bg-[#7c6af7] text-white font-mono text-sm px-8 py-3 rounded-xl hover:bg-[#6c5ae7] transition-colors duration-200"
        >
          Begin
        </motion.button>
      </motion.div>

      <div className="absolute bottom-8 flex gap-4">
        {['PERSISTENT MEMORY', 'ANTI-HERD ENGINE', 'CALIBRATED PREDICTIONS'].map((pill) => (
          <span
            key={pill}
            className="text-[#4a4a6a] font-mono text-xs px-3 py-1 border border-[#1e1e35] rounded-full"
          >
            {pill}
          </span>
        ))}
      </div>
    </div>
  )
}
