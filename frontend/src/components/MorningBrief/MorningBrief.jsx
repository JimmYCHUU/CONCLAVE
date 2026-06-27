import React from 'react'
import SwarmBrief from '../SwarmBrief/SwarmBrief'

export default function MorningBrief({ brief }) {
  if (!brief) return null

  const bullets = brief.council_summary ? brief.council_summary.split('•').filter(Boolean) : []

  return (
    <div className="bg-[#0f0f1a] rounded-2xl p-4 border border-[#1e1e35]">
      <div className="text-[#4a4a6a] font-mono text-xs uppercase tracking-widest">
        MORNING BRIEF {brief.debate_date ? new Date(brief.debate_date).toLocaleDateString() : ''}
      </div>
      <div className="text-white text-xl sm:text-2xl font-semibold mt-2">{brief.topic}</div>

      {brief.swarm_summary && (
        <div className="mt-3">
          <SwarmBrief swarm_summary={brief.swarm_summary} />
        </div>
      )}

      {bullets.length > 0 && (
        <div className="mt-3 space-y-2">
          {bullets.map((b, i) => (
            <p key={i} className="text-[#c4c4d8] text-sm leading-relaxed pl-3 border-l-2 border-[#7c6af7]/30">
              {b.trim()}
            </p>
          ))}
        </div>
      )}

      {brief.key_predictions && brief.key_predictions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#1e1e35]">
          <div className="text-[#4a4a6a] font-mono text-xs uppercase">Key Predictions</div>
          {brief.key_predictions.map((p, i) => (
            <div key={i} className="flex items-center gap-2 mt-1 text-sm text-[#c4c4d8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]" />
              {p}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
