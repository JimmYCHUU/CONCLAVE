import React from 'react'
import { motion } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

export default function AgentCard({ agent, color = '#7c6af7', onClick, isActive }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      className={`bg-[#0f0f1a] border rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
        isActive ? 'animate-pulse-border' : 'border-[#1e1e35]'
      } hover:shadow-[0_0_20px_rgba(124,106,247,0.15)]`}
      style={{ borderColor: isActive ? `${color}4D` : undefined }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-lg text-white"
        style={{ backgroundColor: color }}
      >
        {agent.name[0]}
      </div>
      <div className="mt-2 font-mono font-semibold text-white text-sm">{agent.name}</div>
      <div className="text-[#8b8ba7] text-xs mt-0.5">{agent.role}</div>
      <div className="mt-2 w-full h-1.5 bg-[#1e1e35] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(agent.accuracy_score || 0) * 100}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-[#4a4a6a] text-xs mt-1">
        {Math.round((agent.accuracy_score || 0) * 100)}% accurate
      </div>
      {agent.calibration_score != null && (
        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono"
          style={{
            backgroundColor: agent.calibration_score >= 0.8 ? 'rgba(34,211,165,0.1)' : agent.calibration_score >= 0.5 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
            color: agent.calibration_score >= 0.8 ? '#22d3a5' : agent.calibration_score >= 0.5 ? '#f59e0b' : '#ef4444',
          }}
        >
          {agent.calibration_score >= 0.8 ? 'Well calibrated' : agent.calibration_score >= 0.5 ? 'Moderately calibrated' : 'Poorly calibrated'}
        </span>
      )}
    </motion.div>
  )
}
