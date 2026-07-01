import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useDebateStore } from '../store/debateStore'
import { useConclaveStore } from '../store/conclaveStore'
import { getDebate, getBranches } from '../api/endpoints/debates'
import { getMyConclave } from '../api/endpoints/conclaves'
import Layout from '../components/Layout/Layout'
import DebateFeed from '../components/DebateFeed/DebateFeed'
import SwarmBrief from '../components/SwarmBrief/SwarmBrief'
import ScenarioBranches from '../components/ScenarioBranches/ScenarioBranches'
import DossierCard from '../components/DossierCard/DossierCard'
import CouncilSplitDonut from '../components/CouncilSplitDonut/CouncilSplitDonut'

export default function Chamber() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const wsRef = useRef(null)
  const activeSession = useDebateStore((s) => s.activeSession)
  const liveMessages = useDebateStore((s) => s.liveMessages)
  const branches = useDebateStore((s) => s.branches)
  const swarmSummary = useDebateStore((s) => s.swarmSummary)
  const isLive = useDebateStore((s) => s.isLive)
  const currentStage = useDebateStore((s) => s.currentStage)
  const resetDebate = useDebateStore((s) => s.resetDebate)
  const startLiveDebate = useDebateStore((s) => s.startLiveDebate)
  const addMessage = useDebateStore((s) => s.addMessage)
  const setSwarmSummary = useDebateStore((s) => s.setSwarmSummary)
  const setBranches = useDebateStore((s) => s.setBranches)
  const endDebate = useDebateStore((s) => s.endDebate)
  const conclave = useConclaveStore((s) => s.conclave)
  const setConclave = useConclaveStore((s) => s.setConclave)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!sessionId) return

    resetDebate()
    if (!conclave) getMyConclave().then((res) => setConclave(res.data)).catch(() => {})

    let cancelled = false
    let ws = null

    function connectWs() {
      if (!token) return
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      ws = new WebSocket(`${proto}//${window.location.host}/ws/debates/${sessionId}?token=${token}`)
      wsRef.current = ws
      ws.onopen = () => {}
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'message') {
            addMessage(msg)
          } else if (msg.type === 'debate_complete') {
            endDebate(msg.summary)
          }
        } catch {}
      }
      ws.onerror = () => {}
      ws.onclose = () => {
        wsRef.current = null
      }
    }

    getDebate(sessionId).then((res) => {
      if (cancelled) return
      const d = res.data
      startLiveDebate(d)
      if (d.swarm_summary) setSwarmSummary(d.swarm_summary)
      if (d.status === 'completed' || d.status === 'failed') {
        if (d.status === 'completed') endDebate(d.summary)
        return
      }
      connectWs()
    }).catch(() => {})
    getBranches(sessionId).then((res) => setBranches(res.data?.branches ?? [])).catch(() => {})

    return () => {
      cancelled = true
      if (ws) {
        ws.onclose = null
        ws.close()
        wsRef.current = null
      }
    }
  }, [sessionId])

  const messages = liveMessages.length > 0 ? liveMessages : (activeSession?.messages || [])

  if (!sessionId) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#1e1e35] flex items-center justify-center mb-4">
            <span className="text-[#4a4a6a] text-2xl">◉</span>
          </div>
          <h2 className="text-white font-mono text-lg font-semibold mb-2">CHAMBER OFFLINE</h2>
          <p className="text-[#8b8ba7] text-sm font-mono mb-6 max-w-xs">Your council is standing by. No scenario has been injected.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/inject')} className="bg-[#7c6af7] text-white font-mono text-xs px-5 py-2.5 rounded-xl hover:bg-[#6c5ae7] transition-colors">INJECT A SCENARIO →</button>
            <button onClick={() => navigate('/dashboard')} className="border border-[#1e1e35] text-[#8b8ba7] font-mono text-xs px-5 py-2.5 rounded-xl hover:text-white transition-colors">VIEW DASHBOARD →</button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <button onClick={() => navigate(-1)} className="text-[#8b8ba7] font-mono text-xs mb-4 hover:text-white transition-colors">← Back</button>
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-white font-semibold text-lg">{activeSession?.topic || 'Debate'}</h1>
          {isLive && (
            <span className="flex items-center gap-1.5 text-[#22d3a5] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#22d3a5] animate-pulse-dot" />
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

        {currentStage === 'complete' && activeSession?.summary && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <DossierCard
                eyebrow={new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
                classification="COUNCIL VERDICT"
                headline={activeSession.topic}
              >
                <div className="space-y-2 text-sm leading-relaxed">
                  {activeSession.summary.split('•').filter(Boolean).map((line, i) => (
                    <p key={i} className="pl-3 border-l-2 border-[#d8cdb4]">
                      {line.trim()}
                    </p>
                  ))}
                </div>
              </DossierCard>
            </div>
            <div>
              <CouncilSplitDonut split={activeSession.council_split} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
