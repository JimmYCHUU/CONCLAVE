import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const AGENT_COLORS = ['#7c6af7', '#22d3a5', '#f59e0b', '#ef4444', '#06b6d4']

const messageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

function getInitials(name) {
  if (!name) return '??'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function DebateFeed({ messages = [], agents = [] }) {
  const bottomRef = useRef(null)
  const agentColorMap = {}
  const agentInitials = {}
  agents.forEach((a, i) => {
    agentColorMap[a.id] = AGENT_COLORS[i % AGENT_COLORS.length]
    agentInitials[a.id] = getInitials(a.name)
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4a4a6a] font-mono text-sm">Awaiting intelligence...</p>
      </div>
    )
  }

  const rounds = [...new Set(messages.map((m) => m.round_number))]

  return (
    <div className="space-y-3">
      {rounds.map((round) => {
        const roundMsgs = messages.filter((m) => m.round_number === round)
        const hasContrarian = roundMsgs.some((m) => m.is_contrarian_round)

        return (
          <div key={round}>
            <div className="flex items-center gap-2 mb-3 mt-6">
              <hr className="flex-1 border-[#1e1e35]" />
              <span className="text-[#4a4a6a] font-mono text-xs uppercase">
                {round === 0 ? 'CROWD SIMULATION' : `Round ${round}`}
              </span>
              <hr className="flex-1 border-[#1e1e35]" />
            </div>

            {hasContrarian && (
              <div className="flex justify-center mb-3">
                <div className="px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] text-xs font-mono inline-flex items-center gap-1">
                  CONTRARIAN PROTOCOL ACTIVATED
                </div>
              </div>
            )}

            {roundMsgs.map((msg, idx) => {
              if (msg.is_swarm) {
                return (
                  <motion.div
                    key={idx}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-start mb-2"
                  >
                    <div className="max-w-[85%] bg-[#0f0f1a]/60 border border-[#1e1e35] rounded-2xl rounded-tl-sm px-4 py-3">
                      <span className="text-[#64748b] font-mono text-[10px] tracking-widest uppercase block mb-1">CROWD</span>
                      <p className="text-[#94a3b8] text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                )
              }

              const color = agentColorMap[msg.agent_id] || '#7c6af7'
              const initials = agentInitials[msg.agent_id] || getInitials(msg.agent_name)

              return (
                <motion.div
                  key={idx}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-start gap-3 mb-3"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs text-white"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-mono font-semibold text-sm" style={{ color }}>
                        {msg.agent_name || 'Analyst'}
                      </span>
                      <span className="text-[#4a4a6a] font-mono text-[10px]">
                        {msg.is_contrarian_round ? 'Contrarian' : 'Analyst'}
                      </span>
                    </div>
                    <div
                      className="rounded-2xl rounded-tl-sm px-4 py-3 border"
                      style={{
                        backgroundColor: `${color}08`,
                        borderColor: `${color}20`,
                      }}
                    >
                      <p className="text-[#e2e2f0] text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
