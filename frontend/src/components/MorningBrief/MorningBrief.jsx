import React from 'react'
import DossierCard from '../DossierCard/DossierCard'
import SwarmBrief from '../SwarmBrief/SwarmBrief'

export default function MorningBrief({ brief }) {
  if (!brief) return null

  const bullets = brief.council_summary ? brief.council_summary.split('•').filter(Boolean) : []

  return (
    <DossierCard
      eyebrow={`BRIEFING · ${brief.debate_date ? new Date(brief.debate_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase() : ''}`}
      classification="EYES ONLY"
      headline={brief.topic}
    >
      {brief.swarm_summary && (
        <div className="mb-4">
          <SwarmBrief swarm_summary={brief.swarm_summary} />
        </div>
      )}

      {bullets.length > 0 && (
        <div className="space-y-2">
          {bullets.map((b, i) => (
            <p key={i} className="text-sm leading-relaxed pl-3 border-l-2 border-[#d8cdb4]">
              {b.trim()}
            </p>
          ))}
        </div>
      )}

      {brief.key_predictions && brief.key_predictions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#d8cdb4]">
          <div className="text-[#5c5240] font-mono text-xs uppercase">Key Predictions</div>
          {brief.key_predictions.map((p, i) => (
            <div key={i} className="flex items-center gap-2 mt-1 text-sm text-[#3a3226]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b8442f]" />
              {p}
            </div>
          ))}
        </div>
      )}
    </DossierCard>
  )
}
