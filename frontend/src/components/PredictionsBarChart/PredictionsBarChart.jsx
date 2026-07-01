import React from 'react'
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts'

export default function PredictionsBarChart({ predictions = [] }) {
  const buckets = {}
  predictions.forEach((p) => {
    if (!p.outcome || p.outcome === 'pending') return
    const week = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    buckets[week] = buckets[week] || { week, correct: 0, incorrect: 0 }
    buckets[week][p.outcome === 'correct' ? 'correct' : 'incorrect'] += 1
  })
  const data = Object.values(buckets)

  return (
    <div className="bg-[#0f0f1a] border border-[#1e1e35] rounded-2xl p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#4a4a6a] mb-3">PREDICTIONS RESOLVED</p>
      {data.length === 0 ? (
        <p className="text-[#4a4a6a] text-xs font-mono py-8 text-center">No resolved predictions yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data}>
            <XAxis dataKey="week" tick={{ fill: '#4a4a6a', fontSize: 9, fontFamily: 'monospace' }} axisLine={{ stroke: '#1e1e35' }} tickLine={false} />
            <Bar dataKey="correct" fill="#22d3a5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="incorrect" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
