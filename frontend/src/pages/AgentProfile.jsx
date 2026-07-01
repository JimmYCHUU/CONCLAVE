import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useConclaveStore } from '../store/conclaveStore'
import { getAgent, messageAgent } from '../api/endpoints/agents'
import Layout from '../components/Layout/Layout'
import CalibrationBadge from '../components/CalibrationBadge/CalibrationBadge'

const AGENT_COLORS = ['#7c6af7', '#22d3a5', '#f59e0b', '#ef4444', '#06b6d4']

export default function AgentProfile() {
  const { agentId } = useParams()
  const [agent, setAgent] = useState(null)
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [typing, setTyping] = useState(false)
  const conclave = useConclaveStore((s) => s.conclave)
  const agentIndex = conclave?.agents?.findIndex((a) => a.id === agentId) || 0
  const color = AGENT_COLORS[agentIndex % AGENT_COLORS.length]

  useEffect(() => {
    if (!conclave) return
    getAgent(conclave.id, agentId).then((res) => setAgent(res.data)).catch(() => {})
  }, [agentId, conclave])

  const handleSend = async () => {
    if (!message.trim() || !conclave) return
    setTyping(true)
    setResponse('')
    try {
      const res = await messageAgent(conclave.id, agentId, message)
      setResponse(res.data.response)
    } catch (e) {
      setResponse('The agent is currently busy. Please try again.')
    }
    setTyping(false)
    setMessage('')
  }

  if (!agent) return <Layout><div className="p-4 text-[#8b8ba7] font-mono text-sm">ENTERING SECURE CHANNEL...</div></Layout>

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center font-mono font-bold text-3xl text-white" style={{ backgroundColor: color }}>
            {agent.name[0]}
          </div>
          <div>
            <h1 className="font-mono text-2xl text-white font-semibold">{agent.name}</h1>
            <p className="text-[#8b8ba7]">{agent.role}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="bg-[#0f0f1a] rounded-2xl p-4 flex-1 border border-[#1e1e35]">
            <div className="text-[#4a4a6a] font-mono text-xs">Accuracy</div>
            <div className="text-white font-mono text-xl font-bold">{Math.round((agent.accuracy_score || 0) * 100)}%</div>
          </div>
          <div className="bg-[#0f0f1a] rounded-2xl p-4 flex-1 border border-[#1e1e35]">
            <div className="text-[#4a4a6a] font-mono text-xs">Calibration</div>
            <div className="mt-1"><CalibrationBadge score={agent.calibration_score} /></div>
          </div>
        </div>

        <div className="bg-[#0f0f1a] rounded-2xl p-4 border border-[#1e1e35]">
          <h3 className="text-[#4a4a6a] font-mono text-xs uppercase mb-3">Message {agent.name}</h3>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-[#14141f] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-sm focus:border-[#7c6af7] outline-none"
              placeholder="Ask a question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-[#7c6af7] text-white px-4 rounded-xl font-mono text-sm hover:bg-[#6c5ae7] transition-colors"
            >
              Send
            </button>
          </div>
          {typing && (
            <div className="flex gap-1 mt-3 items-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#4a4a6a]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
              <span className="text-[#4a4a6a] text-xs ml-2">{agent.name} is thinking...</span>
            </div>
          )}
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-[#14141f] rounded-xl border-l-4"
              style={{ borderLeftColor: color }}
            >
              <div className="font-mono font-semibold text-sm" style={{ color }}>{agent.name}</div>
              <p className="text-[#e2e2f0] text-sm mt-1">{response}</p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  )
}
