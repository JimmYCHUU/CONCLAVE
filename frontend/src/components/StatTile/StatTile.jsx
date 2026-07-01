import React from 'react'

export default function StatTile({ label, value, hue = 'purple', icon }) {
  const colors = {
    purple: { fill: 'rgba(124,106,247,0.14)', border: 'rgba(124,106,247,0.4)', text: '#a89bfb' },
    teal:   { fill: 'rgba(34,211,165,0.14)',  border: 'rgba(34,211,165,0.4)',  text: '#6ee8c5' },
    amber:  { fill: 'rgba(245,158,11,0.14)',  border: 'rgba(245,158,11,0.4)',  text: '#fbbf4a' },
    red:    { fill: 'rgba(239,68,68,0.14)',   border: 'rgba(239,68,68,0.4)',   text: '#f59999' },
    cyan:   { fill: 'rgba(6,182,212,0.14)',   border: 'rgba(6,182,212,0.4)',   text: '#5fd4e8' },
  }[hue]

  return (
    <div
      className="rounded-2xl p-4 relative"
      style={{ backgroundColor: colors.fill, border: `1px solid ${colors.border}` }}
    >
      {icon && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#080810]/40 flex items-center justify-center text-xs">
          {icon}
        </div>
      )}
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#8b8ba7]">{label}</p>
      <p className="font-mono text-2xl font-bold mt-1" style={{ color: colors.text, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  )
}
