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
        <h2 className="text-xl font-mono font-semibold text-white mb-2">Throw a scenario at your council.</h2>
        <textarea
          className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl p-4 text-white font-mono text-sm min-h-[8rem] resize-y focus:border-[#7c6af7] outline-none mt-4"
          placeholder="What if the Fed cuts rates by 100bps tomorrow?"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
        />
        <p className="text-[#4a4a6a] text-xs mt-2">Your council will simulate crowd reaction, then debate 3 futures.</p>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#0f0f1a] rounded-2xl p-4 border border-[#1e1e35] animate-pulse">
                <div className="h-3 bg-[#1e1e35] rounded w-1/2 mb-3" />
                <div className="h-4 bg-[#1e1e35] rounded w-full" />
              </div>
            ))}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading || !scenario.trim()}
          className="w-full mt-4 bg-[#7c6af7] text-white font-mono text-sm py-3 rounded-xl hover:bg-[#6c5ae7] transition-colors disabled:opacity-50"
        >
          {loading ? 'Convening...' : 'Convene Now'}
        </motion.button>
      </div>
    </Layout>
  )
}
