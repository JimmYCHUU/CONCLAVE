import React from 'react'

export default function DossierCard({ eyebrow, classification = 'COUNCIL BRIEFING', headline, children }) {
  return (
    <div className="relative bg-[#f2ead8] rounded-2xl p-5 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5c5240]">
          {eyebrow}
        </span>
        <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-[#b8442f] border border-[#b8442f]/40 rounded-full px-2 py-0.5">
          {classification}
        </span>
      </div>

      {headline && (
        <h2
          className="text-[#241f17] text-[22px] sm:text-[26px] leading-tight mb-4"
          style={{ fontFamily: "'Source Serif 4', Georgia, ui-serif, serif" }}
        >
          {headline}
        </h2>
      )}

      <div className="text-[#3a3226]">{children}</div>

      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{
        backgroundImage: 'repeating-linear-gradient(90deg, #d8cdb4 0 6px, transparent 6px 12px)'
      }} />
    </div>
  )
}
