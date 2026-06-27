import React from 'react'

export default function SwarmBrief({ swarm_summary }) {
  if (!swarm_summary) return null

  return (
    <div className="bg-[#0f0f1a] border-l-4 border-[#64748b] rounded-r-2xl p-4">
      <div className="text-[#64748b] font-mono text-xs tracking-widest uppercase">CROWD INTELLIGENCE</div>
      <div className="text-white text-sm mt-2">{swarm_summary.dominant_view}</div>
      {swarm_summary.minority_view && (
        <div className="text-[#8b8ba7] text-xs mt-1 italic">{swarm_summary.minority_view}</div>
      )}
      {swarm_summary.sentiment_split && (
        <div className="flex gap-2 mt-2">
          {swarm_summary.sentiment_split.split(',').map((part, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1e1e35] text-[#8b8ba7]">
              {part.trim()}
            </span>
          ))}
        </div>
      )}
      {swarm_summary.key_reactions && (
        <div className="mt-2 space-y-1">
          {swarm_summary.key_reactions.map((r, i) => (
            <div key={i} className="text-[#4a4a6a] text-xs italic">"{r}"</div>
          ))}
        </div>
      )}
    </div>
  )
}
