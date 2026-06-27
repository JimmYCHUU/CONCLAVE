import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDebateStore } from '../store/debateStore'
import { getDebate, getBranches } from '../api/endpoints/debates'
import { useConclaveStore } from '../store/conclaveStore'
import Layout from '../components/Layout/Layout'
import DebateFeed from '../components/DebateFeed/DebateFeed'
import SwarmBrief from '../components/SwarmBrief/SwarmBrief'
import ScenarioBranches from '../components/ScenarioBranches/ScenarioBranches'

export default function Chamber() {
  const { sessionId } = useParams()
  const activeSession = useDebateStore((s) => s.activeSession)
  const liveMessages = useDebateStore((s) => s.liveMessages)
  const branches = useDebateStore((s) => s.branches)
  const swarmSummary = useDebateStore((s) => s.swarmSummary)
  const isLive = useDebateStore((s) => s.isLive)
  const startLiveDebate = useDebateStore((s) => s.startLiveDebate)
  const addMessage = useDebateStore((s) => s.addMessage)
  const setSwarmSummary = useDebateStore((s) => s.setSwarmSummary)
  const setBranches = useDebateStore((s) => s.setBranches)
  const endDebate = useDebateStore((s) => s.endDebate)
  const conclave = useConclaveStore((s) => s.conclave)

  useEffect(() => {
    if (!sessionId) return
    getDebate(sessionId).then((res) => {
      startLiveDebate(res.data)
      if (res.data.swarm_summary) setSwarmSummary(res.data.swarm_summary)
      res.data.messages?.forEach(addMessage)
      if (res.data.status === 'completed') endDebate(res.data.summary)
    }).catch(() => {})
    getBranches(sessionId).then((res) => setBranches(res.data.branches)).catch(() => {})
  }, [sessionId])

  const messages = liveMessages.length > 0 ? liveMessages : (activeSession?.messages || [])

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-white font-semibold text-lg">{activeSession?.topic || 'Debate'}</h1>
          {isLive && (
            <span className="flex items-center gap-1.5 text-[#22d3a5] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#22d3a5] animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {activeSession?.is_user_inject && branches.length > 0 && (
          <div className="mb-4">
            <ScenarioBranches branches={branches} />
          </div>
        )}

        {swarmSummary && (
          <div className="mb-4">
            <SwarmBrief swarm_summary={swarmSummary} />
          </div>
        )}

        <DebateFeed messages={messages} agents={conclave?.agents || []} />
      </div>
    </Layout>
  )
}
