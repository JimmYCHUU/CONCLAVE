import React from 'react'
import { PieChart, Pie, Cell } from 'recharts'

const SPLIT_COLORS = { bullish: '#22d3a5', bearish: '#ef4444', neutral: '#8b8ba7' }

export default function CouncilSplitDonut({ split }) {
  if (!split) return null
  const data = Object.entries(split)
    .filter(([, ids]) => ids.length > 0)
    .map(([direction, ids]) => ({ name: direction, value: ids.length }))
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-[#0f0f1a] border border-[#1e1e35] rounded-2xl p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#4a4a6a] mb-2">COUNCIL SPLIT</p>
      <div className="flex items-center gap-4">
        <PieChart width={100} height={100}>
          <Pie data={data} dataKey="value" innerRadius={32} outerRadius={48} startAngle={90} endAngle={-270}>
            {data.map((d, i) => <Cell key={i} fill={SPLIT_COLORS[d.name]} stroke="none" />)}
          </Pie>
        </PieChart>
        <div className="space-y-1.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SPLIT_COLORS[d.name] }} />
              <span className="text-[#8b8ba7] uppercase">{d.name}</span>
              <span className="text-white">{d.value}/{total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
