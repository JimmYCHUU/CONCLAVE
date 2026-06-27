import React from 'react'
import { motion } from 'framer-motion'

const AGENT_COLORS = ['#7c6af7', '#22d3a5', '#f59e0b', '#ef4444', '#06b6d4']

const messageVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
}

export default function DebateFeed({ messages = [], agents = [] }) {
  const rounds = [...new Set(messages.map((m) => m.round_number))]
  const agentColorMap = {}
  agents.forEach((a, i) => { agentColorMap[a.id] = AGENT_COLORS[i % AGENT_COLORS.length] })

  return (
    <div className="space-y-4">
      {rounds.map((round) => {
        const roundMsgs = messages.filter((m) => m.round_number === round)
        const hasContrarian = roundMsgs.some((m) => m.is_contrarian_round)

        return (
          <div key={round}>
            {hasContrarian && (
              <div className="mb-2 px-3 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-mono inline-block">
                ⚡ CONTRARIAN PROTOCOL
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#4a4a6a] font-mono text-xs uppercase">Round {round}</span>
              <hr className="flex-1 border-[#1e1e35]" />
            </div>

            {roundMsgs.map((msg, idx) => {
              const agentColor = agentColorMap[msg.agent_id] || '#64748b'
              return (
                <motion.div
                  key={idx}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`mb-2 p-3 rounded-xl border-l-4 ${
                    msg.is_swarm ? 'bg-[#0f0f1a]/50 border-[#64748b]' : 'bg-[#0f0f1a]'
                  }`}
                  style={!msg.is_swarm ? { borderLeftColor: agentColor } : {}}
                >
                  {msg.is_swarm ? (
                    <span className="text-[#64748b] font-mono text-xs tracking-widest uppercase">CROWD</span>
                  ) : (
                    <span className="font-mono font-semibold text-sm" style={{ color: agentColor }}>
                      {msg.agent_name || 'Analyst'}
                    </span>
                  )}
                  <p className="text-[#e2e2f0] text-sm leading-relaxed mt-1">{msg.content}</p>
                </motion.div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
