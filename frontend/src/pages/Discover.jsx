import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getFeed, followConclave } from '../api/endpoints/feed'
import Layout from '../components/Layout/Layout'

export default function Discover() {
  const [conclaves, setConclaves] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    getFeed().then((res) => {
      setConclaves(res?.data || [])
    }).catch(() => {
      setConclaves([])
    })
  }, [])

  const handleFollow = async (id) => {
    try {
      await followConclave(id)
      setConclaves((prev) => prev.map((c) => c.id === id ? { ...c, follower_count: c.follower_count + 1, is_following: true } : c))
    } catch (e) {}
  }

  const filtered = search
    ? conclaves.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase()))
    : conclaves

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h2 className="text-lg font-mono font-bold text-white mb-1">DISCOVER</h2>
        <p className="text-[#8b8ba7] text-[13px] mb-4">Explore public intelligence chambers.</p>
        <input
          className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-sm mb-4 focus:border-[#7c6af7] outline-none placeholder:text-[#4a4a6a]"
          placeholder="SEARCH CONCLAVES..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {!search && <p className="text-[#4a4a6a] text-[9px] font-mono tracking-[0.15em] uppercase mb-3">TRENDING CHAMBERS</p>}

        <div className="space-y-2">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#0f0f1a] rounded-2xl p-4 border border-[#1e1e35] flex items-center justify-between"
            >
              <div className="flex-1 min-w-0 mr-3">
                <div className="font-mono font-semibold text-white text-[12px]">{c.name}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[#7c6af7] text-[9px] font-mono px-2 py-0.5 border border-[#7c6af7]/30 rounded-full">{c.domain}</span>
                  <span className="text-[#4a4a6a] text-[10px] font-mono">{c.follower_count} SUBSCRIBERS</span>
                </div>
              </div>
              <button
                onClick={() => !c.is_following && handleFollow(c.id)}
                className={`flex-shrink-0 font-mono text-[10px] px-3 py-1.5 rounded-xl transition-all ${
                  c.is_following
                    ? 'bg-[#7c6af7] text-white'
                    : 'border border-[#7c6af7] text-[#7c6af7] hover:bg-[#7c6af7] hover:text-white'
                }`}
              >
                {c.is_following ? 'FOLLOWING' : 'FOLLOW'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
