import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useConclaveStore } from '../store/conclaveStore'
import { useAuthStore } from '../store/authStore'
import { getMyConclave, getBrief } from '../api/endpoints/conclaves'
import { getDebates } from '../api/endpoints/debates'
import Layout from '../components/Layout/Layout'
import MorningBrief from '../components/MorningBrief/MorningBrief'
import AgentCard from '../components/AgentCard/AgentCard'
import StatTile from '../components/StatTile/StatTile'
import PredictionsBarChart from '../components/PredictionsBarChart/PredictionsBarChart'
import CouncilSplitDonut from '../components/CouncilSplitDonut/CouncilSplitDonut'

const AGENT_COLORS = ['#7c6af7', '#22d3a5', '#f59e0b', '#ef4444', '#06b6d4']

export default function Dashboard() {
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())
  const [recentDebates, setRecentDebates] = useState([])
  const conclave = useConclaveStore((s) => s.conclave)
  const brief = useConclaveStore((s) => s.brief)
  const setConclave = useConclaveStore((s) => s.setConclave)
  const setBrief = useConclaveStore((s) => s.setBrief)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    getMyConclave().then((res) => {
      setConclave(res.data)
      getDebates(res.data.id).then((r) => setRecentDebates(r?.data || [])).catch(() => {})
      return getBrief(res.data.id)
    }).then((res) => {
      if (res.data?.brief) setBrief(res.data.brief)
    }).catch(() => {
      navigate('/onboarding')
    })
    return () => clearInterval(timer)
  }, [])

  const timeStr = now.toLocaleTimeString('en-US', { hour12: false })
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()

  const councilAccuracy = conclave?.agents?.length
    ? Math.round(conclave.agents.reduce((s, a) => s + (a.accuracy_score || 0), 0) / conclave.agents.length * 100)
    : 0
  const activePredictions = 0
  const debatesThisWeek = recentDebates.filter((d) => {
    const diff = new Date().getTime() - new Date(d.created_at).getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
  }).length
  const contrarianFires = recentDebates.filter((d) => d.contrarian_activated).length

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">

        <div className="bg-[#0f0f1a] border-b border-[#1e1e35] -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 flex justify-between items-center mb-6">
          <div>
            <p className="font-mono text-[11px] text-white font-semibold">{conclave?.name || 'CONCLAVE'}</p>
            <p className="text-[#4a4a6a] text-[9px] font-mono">{conclave?.domain?.toUpperCase() || ''} // {dateStr}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[14px] text-[#7c6af7]">{timeStr}</p>
            <p className="text-[#4a4a6a] text-[8px] font-mono tracking-wider">● SECURE</p>
          </div>
        </div>

        {brief ? <MorningBrief brief={brief} /> : (
          <div className="bg-[#0f0f1a] rounded-2xl p-6 border border-[#1e1e35] text-center">
            <p className="text-[#8b8ba7] font-mono text-sm">Your Conclave assembles. First briefing at 06:00.</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="COUNCIL ACCURACY" value={`${councilAccuracy}%`} hue="purple" />
          <StatTile label="ACTIVE PREDICTIONS" value={activePredictions.toString()} hue="teal" />
          <StatTile label="DEBATES THIS WEEK" value={debatesThisWeek.toString()} hue="amber" />
          <StatTile label="CONTRARIAN FIRES" value={contrarianFires.toString()} hue="red" />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PredictionsBarChart predictions={[]} />
          {recentDebates.length > 0 && <CouncilSplitDonut
            split={{ bullish: [], bearish: [], neutral: [] }}
          />}
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#4a4a6a] font-mono text-[9px] uppercase tracking-[0.15em]">YOUR COUNCIL</span>
            <span className="text-[#22d3a5] text-[9px] font-mono">{conclave?.agents?.length || 0} ACTIVE ●</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {conclave?.agents?.map((agent, i) => (
              <div key={agent.id} style={{ minWidth: '124px' }}>
                <AgentCard
                  agent={agent}
                  color={AGENT_COLORS[i % AGENT_COLORS.length]}
                  onClick={() => navigate(`/agent/${agent.id}`)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <span className="text-[#4a4a6a] font-mono text-[9px] uppercase tracking-[0.15em]">RECENT DEBATES</span>
          {recentDebates.length === 0 ? (
            <div className="mt-2 bg-[#0f0f1a] rounded-2xl border border-[#1e1e35] p-4 text-center">
              <p className="text-[#4a4a6a] text-[11px] font-mono">No debates yet. Inject a scenario to convene the council.</p>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {recentDebates.map((d) => (
                <div
                  key={d.session_id}
                  onClick={() => navigate(`/chamber/${d.session_id}`)}
                  className="bg-[#0f0f1a] rounded-2xl border border-[#1e1e35] p-3 flex items-center justify-between cursor-pointer hover:border-[#7c6af7]/40 transition-colors"
                >
                  <div className="min-w-0 mr-3">
                    <p className="text-white text-[12px] font-mono truncate">{d.topic}</p>
                    <p className="text-[#4a4a6a] text-[10px] font-mono mt-0.5">
                      {d.is_morning_brief ? 'MORNING BRIEF' : 'INJECTED'} · {new Date(d.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 text-[9px] font-mono px-2 py-1 rounded-full uppercase"
                    style={{
                      color: d.status === 'completed' ? '#22d3a5' : d.status === 'failed' ? '#ef4444' : '#f59e0b',
                      backgroundColor: d.status === 'completed' ? 'rgba(34,211,165,0.1)' : d.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    }}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/inject')}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 w-12 h-12 rounded-full bg-[#7c6af7] flex items-center justify-center text-white text-xl shadow-[0_0_30px_rgba(124,106,247,0.3)] hover:bg-[#6c5ae7] transition-colors z-40 animate-pulse-glow"
        >
          +
        </motion.button>
      </div>
    </Layout>
  )
}
