import React from 'react'

const BRANCH_STYLES = {
  base: { border: '#22d3a5', header: 'BASE CASE', color: '#22d3a5' },
  disruption: { border: '#f59e0b', header: 'DISRUPTION', color: '#f59e0b' },
  black_swan: { border: '#ef4444', header: 'BLACK SWAN', color: '#ef4444' },
}

export default function ScenarioBranches({ branches = [] }) {
  if (!branches.length) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {branches.map((branch) => {
        const style = BRANCH_STYLES[branch.type] || BRANCH_STYLES.base
        return (
          <div
            key={branch.type}
            className="bg-[#0f0f1a] rounded-2xl p-4 border"
            style={{ borderColor: `${style.border}4D` }}
          >
            <div className="font-mono text-xs tracking-widest uppercase" style={{ color: style.color }}>
              {style.header}
            </div>
            {branch.disruption_event && (
              <div className="text-[#8b8ba7] text-xs italic mb-2">{branch.disruption_event}</div>
            )}
            <div className="text-white text-sm">{branch.outcome_summary}</div>
            {branch.key_signal && (
              <div className="text-[#4a4a6a] text-xs mt-2">Signal: {branch.key_signal}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
