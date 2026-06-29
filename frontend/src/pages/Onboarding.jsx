import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useConclaveStore } from '../store/conclaveStore'
import { register as registerApi } from '../api/endpoints/auth'
import { createConclave } from '../api/endpoints/conclaves'

const DOMAINS = ['Trading', 'Startup', 'Research', 'General']

const pageVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [domain, setDomain] = useState('')
  const [conclaveName, setConclaveName] = useState('')
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState([])
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const setConclave = useConclaveStore((s) => s.setConclave)

  const handleRegister = async () => {
    setLoading(true)
    try {
      const reg = await registerApi({ email, username, password, domain })
      login({ user_id: reg.data.user_id, username: reg.data.username, email: reg.data.email, domain }, reg.data.access_token)

      const concl = await createConclave({ name: conclaveName || `${domain} Chamber`, domain: domain.toLowerCase() })
      setConclave(concl.data)
      setAgents(concl.data.agents)
      setStep(3)
    } catch (e) {
      alert('Registration failed: ' + (e.response?.data?.detail?.detail || e.message))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={pageVariants} initial="enter" animate="center" exit="exit" className="w-full max-w-md">
            <h2 className="text-2xl font-mono font-bold text-white mb-6">Join CONCLAVE</h2>
            <input className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-sm mb-3 focus:border-[#7c6af7] outline-none" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-sm mb-3 focus:border-[#7c6af7] outline-none" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-sm mb-6 focus:border-[#7c6af7] outline-none" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <p className="text-[#8b8ba7] font-mono text-xs mb-3">Choose your domain</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {DOMAINS.map((d) => (
                <motion.button
                  key={d}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setDomain(d); setStep(2) }}
                  className={`p-4 rounded-xl border text-center font-mono text-sm transition-all ${
                    domain === d ? 'border-[#7c6af7] bg-[#7c6af7]/10 text-white' : 'border-[#1e1e35] text-[#8b8ba7]'
                  }`}
                >
                  {d}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={pageVariants} initial="enter" animate="center" exit="exit" className="w-full max-w-md">
            <h2 className="text-2xl font-mono font-bold text-white mb-6">Name your Conclave</h2>
            <input className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-sm mb-6 focus:border-[#7c6af7] outline-none" placeholder="e.g. Alpha Chamber" value={conclaveName} onChange={(e) => setConclaveName(e.target.value)} />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-[#7c6af7] text-white font-mono text-sm py-3 rounded-xl hover:bg-[#6c5ae7] transition-colors disabled:opacity-50"
            >
              {loading ? 'Convening your council...' : 'Convene'}
            </motion.button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={pageVariants} initial="enter" animate="center" exit="exit" className="w-full max-w-lg">
            <h2 className="text-2xl font-mono font-bold text-white mb-2 text-center">Your Council is Assembled</h2>
            <p className="text-[#8b8ba7] font-mono text-xs mb-6 text-center">First briefing at 06:00</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent, i) => {
                const colors = ['#7c6af7', '#22d3a5', '#f59e0b', '#ef4444', '#06b6d4']
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-[#0f0f1a] border border-[#1e1e35] rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-white" style={{ backgroundColor: colors[i] }}>
                        {agent.name[0]}
                      </div>
                      <div>
                        <div className="font-mono font-semibold text-white text-sm">{agent.name}</div>
                        <div className="text-[#8b8ba7] text-xs">{agent.role}</div>
                      </div>
                    </div>
                    <div className="text-[#4a4a6a] text-xs mt-2">{agent.bias_description}</div>
                  </motion.div>
                )
              })}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="w-full mt-6 bg-[#7c6af7] text-white font-mono text-sm py-3 rounded-xl"
            >
              Enter Dashboard
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
