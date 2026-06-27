import React from 'react'

export default function CalibrationBadge({ score }) {
  if (score == null) return null

  let label, color
  if (score >= 0.8) {
    label = 'Well calibrated'
    color = '#22d3a5'
  } else if (score >= 0.5) {
    label = 'Moderately calibrated'
    color = '#f59e0b'
  } else {
    label = 'Poorly calibrated'
    color = '#ef4444'
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono cursor-help"
      style={{ backgroundColor: `${color}1A`, color }}
      title="Calibration measures how reliable this agent's confidence percentages are"
    >
      {label}
    </span>
  )
}
