import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useConclaveStore } from '../store/conclaveStore'
import { register as registerApi } from '../api/endpoints/auth'
import { createConclave } from '../api/endpoints/conclaves'

const TIERS = [
  {
    label: 'MARKET & FINANCE', sub: ['Trading', 'Macro', 'Crypto', 'Quantitative', 'Credit', 'Venture Capital'],
    desc: '6 DOMAINS',
  },
  {
    label: 'BUSINESS & STRATEGY', sub: ['Startup', 'Corporate Strategy', 'Product Intelligence', 'Marketing', 'Supply Chain'],
    desc: '5 DOMAINS',
  },
  {
    label: 'GEOPOLITICS & POLICY', sub: ['Geopolitics', 'Policy & Regulation', 'Election Intelligence', 'Sanctions & Trade', 'Energy & Resources'],
    desc: '5 DOMAINS',
  },
  {
    label: 'SCIENCE & TECHNOLOGY', sub: ['AI & Technology', 'Biotech & Health', 'Climate & ESG', 'Space & Defense', 'Quantum & Deep Tech'],
    desc: '5 DOMAINS',
  },
  {
    label: 'CULTURE & SOCIETY', sub: ['Media & Culture', 'Sports Intelligence', 'Legal & Litigation', 'Real Estate'],
    desc: '4 DOMAINS',
  },
  {
    label: 'CUSTOM', sub: [],
    desc: 'Describe your own',
  },
]

const DOMAIN_MAP = {
  'Trading': 'trading', 'Macro': 'macro', 'Crypto': 'crypto', 'Quantitative': 'quant',
  'Credit': 'credit', 'Venture Capital': 'vc', 'Startup': 'startup', 'Corporate Strategy': 'corporate',
  'Product Intelligence': 'product', 'Marketing': 'marketing', 'Supply Chain': 'supply_chain',
  'Geopolitics': 'geopolitics', 'Policy & Regulation': 'policy', 'Election Intelligence': 'election',
  'Sanctions & Trade': 'sanctions', 'Energy & Resources': 'energy', 'AI & Technology': 'ai_tech',
  'Biotech & Health': 'biotech', 'Climate & ESG': 'climate', 'Space & Defense': 'space',
  'Quantum & Deep Tech': 'quantum', 'Media & Culture': 'media', 'Sports Intelligence': 'sports',
  'Legal & Litigation': 'legal', 'Real Estate': 'real_estate',
}

const LOG_LINES = [
  '> DOMAIN: {domain}',
  '> INITIALIZING CONCLAVE GENERATOR...',
  '> Analyzing domain epistemic landscape...',
  '> Assembling cognitive archetypes...',
  '> Injecting personality matrices...',
  '> Calibrating bias profiles...',
]

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [domainLabel, setDomainLabel] = useState('')
  const [domainId, setDomainId] = useState('')
  const [customContext, setCustomContext] = useState('')
  const [conclaveName, setConclaveName] = useState('')
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState([])
  const [log, setLog] = useState([])
  const [genProgress, setGenProgress] = useState(0)
  const [expandedTier, setExpandedTier] = useState(null)
  const logRef = useRef(null)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const setConclave = useConclaveStore((s) => s.setConclave)

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }) }, [log])

  const handleRegister = async () => {
    setLoading(true)
    setStep(3)
    setLog([])
    setGenProgress(0)

    const lines = LOG_LINES.map(l => l.replace('{domain}', domainLabel || 'CUSTOM'))
    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, 300))
      setLog(prev => [...prev, lines[i]])
      setGenProgress(Math.round(((i + 1) / (lines.length + 5)) * 100))
    }

    try {
      const reg = await registerApi({ email, username, password, domain: domainId || 'custom' })
      login({
        user_id: reg.data.user_id, username: reg.data.username,
        email: reg.data.email, domain: domainId || 'custom',
      }, reg.data.access_token)

      const concl = await createConclave({
        name: conclaveName || `${domainLabel || 'Custom'} Chamber`,
        domain: domainId || 'custom',
      })
      setConclave(concl.data)
      setAgents(concl.data.agents)

      for (const a of concl.data.agents) {
        await new Promise(r => setTimeout(r, 400))
        setLog(prev => [...prev, `> AGENT CONFIRMED: ${a.name} — ${a.role}`])
        setGenProgress(prev => Math.min(prev + 10, 95))
      }

      await new Promise(r => setTimeout(r, 200))
      setLog(prev => [...prev, '> COUNCIL ASSEMBLED. ENTERING SECURE CHANNEL...'])
      setGenProgress(100)

      await new Promise(r => setTimeout(r, 1500))
      navigate('/dashboard')
    } catch (e) {
      setLoading(false)
      setStep(2)
      alert('Registration failed: ' + (e.response?.data?.detail?.detail || e.message))
    }
  }

  return (
    <div className="min-h-screen bg-[#080810] bg-dot-grid bg-dot-grid flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-md"
          >
            <p className="text-[#4a4a6a] text-[9px] font-mono tracking-[0.12em] text-center mb-8">
              ◈ CONCLAVE // SECURE REGISTRATION PORTAL
            </p>

            <div className="text-center mb-8">
              <h1 className="text-[52px] font-mono font-black text-white leading-none" style={{ textShadow: '0 0 50px rgba(124,106,247,0.6)' }}>
                CONCLAVE
              </h1>
              <p className="text-[#4a4a6a] text-[10px] font-mono tracking-[0.12em] mt-2">
                YOUR PRIVATE INTELLIGENCE OPERATION
              </p>
            </div>

            <div className="bg-[#0f0f1a] border border-[#1e1e35] rounded-2xl p-5 space-y-3">
              <p className="text-[#4a4a6a] text-[9px] font-mono tracking-[0.12em] uppercase">REQUEST CLEARANCE</p>

              <input className="w-full bg-[#080810] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-[13px] focus:border-[#7c6af7]/65 focus:shadow-[0_0_0_3px_rgba(124,106,247,0.08)] outline-none transition-all duration-200 placeholder:text-[#4a4a6a]" placeholder="EMAIL ADDRESS" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="w-full bg-[#080810] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-[13px] focus:border-[#7c6af7]/65 focus:shadow-[0_0_0_3px_rgba(124,106,247,0.08)] outline-none transition-all duration-200 placeholder:text-[#4a4a6a]" placeholder="CALLSIGN / USERNAME" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input className="w-full bg-[#080810] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-[13px] focus:border-[#7c6af7]/65 focus:shadow-[0_0_0_3px_rgba(124,106,247,0.08)] outline-none transition-all duration-200 placeholder:text-[#4a4a6a]" placeholder="PASSPHRASE" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

              <div className="pt-2">
                <p className="text-[#4a4a6a] text-[9px] font-mono tracking-[0.12em] uppercase mb-3">INTELLIGENCE DOMAIN</p>

                {TIERS.map((tier, i) => (
                  <div key={i} className="mb-2">
                    <button
                      onClick={() => setExpandedTier(expandedTier === i ? null : i)}
                      className={`w-full flex justify-between items-center p-3 rounded-xl border text-[11px] font-mono text-left transition-all ${
                        expandedTier === i ? 'border-[#7c6af7]/30 bg-[#7c6af7]/5' : 'border-[#1e1e35] hover:border-[#4a4a6a]'
                      }`}
                    >
                      <span className="text-white">{tier.label} {tier.label !== 'CUSTOM' && <span className="text-[#4a4a6a] text-[9px]">// {tier.desc}</span>}</span>
                      <span className="text-[#4a4a6a]">{expandedTier === i ? '▲' : '▼'}</span>
                    </button>

                    {expandedTier === i && (
                      <div className="mt-1 ml-2 space-y-1">
                        {tier.sub.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => { setDomainLabel(sub); setDomainId(DOMAIN_MAP[sub]); setCustomContext(''); }}
                            className={`block w-full text-left p-2 rounded-lg text-[11px] font-mono transition-all ${
                              domainLabel === sub ? 'text-white bg-[#7c6af7]/10' : 'text-[#8b8ba7] hover:text-white'
                            }`}
                          >
                            ◈ {sub}
                          </button>
                        ))}
                        {tier.label === 'CUSTOM' && (
                          <input
                            className="w-full bg-[#080810] border border-[#1e1e35] rounded-lg p-2 text-white font-mono text-[11px] mt-1 focus:border-[#7c6af7] outline-none placeholder:text-[#4a4a6a]"
                            placeholder="Describe your intelligence focus..."
                            value={customContext}
                            onChange={(e) => { setDomainLabel('CUSTOM'); setDomainId('custom'); setCustomContext(e.target.value) }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => domainLabel && setStep(2)}
              disabled={!domainLabel}
              className="w-full mt-4 bg-[#7c6af7] text-white font-mono text-sm py-3 rounded-xl hover:bg-[#6c5ae7] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={domainLabel ? { boxShadow: '0 0 24px rgba(124,106,247,0.4)' } : {}}
            >
              PROCEED ──────────→
            </motion.button>

            <div className="flex justify-center gap-3 mt-6">
              {['PERSISTENT MEMORY', 'ANTI-HERD ENGINE', 'CALIBRATED PREDICTIONS'].map((pill) => (
                <span key={pill} className="text-[#4a4a6a] text-[9px] font-mono px-2 py-1 border border-[#1e1e35] rounded-full">{pill}</span>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-md"
          >
            <p className="text-[#4a4a6a] text-[9px] font-mono tracking-[0.12em] text-center mb-8">
              CONCLAVE // {domainLabel?.toUpperCase() || 'CUSTOM'} // STEP 2 OF 2
            </p>

            <p className="text-[#7c6af7] text-[9px] font-mono mb-2">◈ CHRISTEN YOUR OPERATION</p>
            <h2 className="text-[34px] font-mono font-black text-white leading-[1.1] mb-3">
              WHAT WILL YOUR
              CHAMBER BE CALLED?
            </h2>
            <p className="text-[#8b8ba7] text-[13px] leading-relaxed mb-6">
              This name identifies your private intelligence chamber. Your council will reference it in every briefing and debate.
            </p>

            <div className="bg-[#0f0f1a] border border-[#1e1e35] rounded-2xl p-5">
              <input
                className="w-full bg-[#080810] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-[15px] tracking-[0.06em] uppercase focus:border-[#7c6af7]/65 focus:shadow-[0_0_0_3px_rgba(124,106,247,0.08)] outline-none transition-all duration-200 placeholder:text-[#4a4a6a] placeholder:normal-case"
                placeholder="E.G. ALPHA CHAMBER"
                value={conclaveName}
                onChange={(e) => setConclaveName(e.target.value)}
              />
              <p className="text-[#4a4a6a] text-[9px] font-mono mt-3">
                5 COUNCIL MEMBERS WILL BE SUMMONED FOR YOUR DOMAIN
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRegister}
              disabled={loading}
              className="w-full mt-4 bg-[#7c6af7] text-white font-mono text-sm py-3 rounded-xl hover:bg-[#6c5ae7] transition-colors disabled:opacity-50"
              style={{ boxShadow: '0 0 24px rgba(124,106,247,0.4)' }}
            >
              {loading ? 'CONVENING...' : 'CONVENE NOW ─────────→'}
            </motion.button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-lg"
          >
            <p className="text-[#4a4a6a] text-[9px] font-mono tracking-[0.12em] text-center mb-6">
              ◈ CONCLAVE GENERATOR // ONLINE
            </p>

            <div className="bg-[#0f0f1a] border border-[#1e1e35] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#4a4a6a] text-[9px] font-mono tracking-widest uppercase">ASSEMBLY PROGRESS</span>
                <span className="text-[#7c6af7] text-[11px] font-mono">{genProgress}%</span>
              </div>
              <div className="w-full h-1 bg-[#1a1a2e] rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-[#7c6af7] to-[#22d3a5] rounded-full transition-all duration-500 ease-out" style={{ width: `${genProgress}%`, boxShadow: '0 0 10px rgba(124,106,247,0.5)' }} />
              </div>

              <div ref={logRef} className="h-48 overflow-y-auto font-mono text-[11px] leading-[1.9] space-y-0.5">
                {log.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={line.startsWith('> AGENT CONFIRMED') ? 'text-[#22d3a5]' : line.startsWith('> COUNCIL ASSEMBLED') ? 'text-[#7c6af7]' : 'text-[#8b8ba7]'}
                  >
                    {line}
                  </motion.p>
                ))}
                {genProgress < 100 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-[#4a4a6a]"
                  >
                    _
                  </motion.p>
                )}
              </div>
            </div>

            {agents.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {agents.map((agent, i) => {
                  const colors = ['#7c6af7', '#22d3a5', '#f59e0b', '#ef4444', '#06b6d4']
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                      className="bg-[#0f0f1a] border border-[#1e1e35] rounded-2xl p-3"
                      style={{ borderLeftColor: colors[i], borderLeftWidth: 3 }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs text-white" style={{ backgroundColor: colors[i] }}>
                          {agent.name[0]}
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-white text-[11px]">{agent.name.split(' ')[0]}</div>
                          <div className="text-[#8b8ba7] text-[9px]">{agent.role}</div>
                        </div>
                      </div>
                      <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '50%', backgroundColor: colors[i] }} />
                      </div>
                      <p className="text-[#4a4a6a] text-[9px] mt-0.5">50% ACC</p>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}