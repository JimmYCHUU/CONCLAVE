import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useConclaveStore } from '../store/conclaveStore'
import { useAuthStore } from '../store/authStore'
import { getMyConclave, getBrief } from '../api/endpoints/conclaves'
import Layout from '../components/Layout/Layout'
import MorningBrief from '../components/MorningBrief/MorningBrief'
import AgentCard from '../components/AgentCard/AgentCard'

const AGENT_COLORS = ['#7c6af7', '#22d3a5', '#f59e0b', '#ef4444', '#06b6d4']

export default function Dashboard() {
  const navigate = useNavigate()
  const conclave = useConclaveStore((s) => s.conclave)
  const brief = useConclaveStore((s) => s.brief)
  const setConclave = useConclaveStore((s) => s.setConclave)
  const setBrief = useConclaveStore((s) => s.setBrief)

  useEffect(() => {
    getMyConclave().then((res) => {
      setConclave(res.data)
      return getBrief(res.data.id)
    }).then((res) => {
      if (res.data?.brief) setBrief(res.data.brief)
    }).catch(() => {
      navigate('/onboarding')
    })
  }, [])

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {brief ? <MorningBrief brief={brief} /> : (
          <div className="bg-[#0f0f1a] rounded-2xl p-6 border border-[#1e1e35] text-center">
            <p className="text-[#8b8ba7] font-mono text-sm">Your Conclave assembles. First briefing at 06:00.</p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-[#4a4a6a] font-mono text-xs uppercase tracking-widest mb-3">YOUR COUNCIL</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {conclave?.agents?.map((agent, i) => (
              <div key={agent.id} className="min-w-[180px]">
                <AgentCard
                  agent={agent}
                  color={AGENT_COLORS[i % AGENT_COLORS.length]}
                  onClick={() => navigate(`/agent/${agent.id}`)}
                />
              </div>
            ))}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/inject')}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 w-14 h-14 rounded-full bg-[#7c6af7] flex items-center justify-center text-white text-2xl shadow-[0_0_30px_rgba(124,106,247,0.3)] hover:bg-[#6c5ae7] transition-colors z-40"
        >
          ⊕
        </motion.button>
      </div>
    </Layout>
  )
}
