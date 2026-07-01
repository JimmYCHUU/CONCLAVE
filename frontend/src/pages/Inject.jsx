import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useConclaveStore } from '../store/conclaveStore'
import { useDebateStore } from '../store/debateStore'
import { injectScenario } from '../api/endpoints/conclaves'
import Layout from '../components/Layout/Layout'

export default function Inject() {
  const [scenario, setScenario] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const navigate = useNavigate()
  const conclave = useConclaveStore((s) => s.conclave)
  const startLiveDebate = useDebateStore((s) => s.startLiveDebate)

  const handleSubmit = async () => {
    if (!scenario.trim() || !conclave) return
    setLoading(true)
    try {
      const res = await injectScenario(conclave.id, scenario)
      setSessionId(res.data.session_id)
      navigate(`/chamber/${res.data.session_id}`)
    } catch (e) {
      setLoading(false)
      alert('Failed to inject scenario')
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h2 className="text-[28px] font-mono font-black text-white leading-[1.2] mb-2">
          THROW A SCENARIO
          AT YOUR COUNCIL.
        </h2>
        <p className="text-[#8b8ba7] text-[13px] leading-relaxed mb-4">
          Your council simulates crowd reaction across 20 stakeholder types, then debates three possible futures.
        </p>
        <textarea
          className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl p-4 text-white font-mono text-sm min-h-[130px] resize-y focus:border-[#7c6af7] outline-none placeholder:text-[#4a4a6a]"
          placeholder="e.g. The Fed announces an emergency 50bps rate cut after markets open..."
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
        />

        <div className="flex gap-2 mt-3">
          <span className="text-[#22d3a5] text-[9px] font-mono px-2 py-1 border border-[#22d3a5]/30 rounded-full">BASE CASE</span>
          <span className="text-[#f59e0b] text-[9px] font-mono px-2 py-1 border border-[#f59e0b]/30 rounded-full">DISRUPTION</span>
          <span className="text-[#ef4444] text-[9px] font-mono px-2 py-1 border border-[#ef4444]/30 rounded-full">BLACK SWAN</span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#0f0f1a] rounded-2xl p-4 border border-[#1e1e35] animate-pulse">
                <div className="h-2 bg-[#1e1e35] rounded w-1/2 mb-3" />
                <div className="h-3 bg-[#1e1e35] rounded w-full mb-2" />
                <div className="h-2 bg-[#1e1e35] rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading || !scenario.trim()}
          className="w-full mt-4 bg-[#7c6af7] text-white font-mono text-sm py-3 rounded-xl hover:bg-[#6c5ae7] transition-colors disabled:opacity-50"
          style={!loading && scenario.trim() ? { boxShadow: '0 0 24px rgba(124,106,247,0.4)' } : {}}
        >
          {loading ? 'CONVENING...' : 'CONVENE NOW ──────────→'}
        </motion.button>
      </div>
    </Layout>
  )
}
