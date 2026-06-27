import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getFeed, followConclave } from '../api/endpoints/feed'
import Layout from '../components/Layout/Layout'

export default function Discover() {
  const [conclaves, setConclaves] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    getFeed().then((res) => setConclaves(res.data)).catch(() => {})
  }, [])

  const handleFollow = async (id) => {
    try {
      await followConclave(id)
      setConclaves((prev) => prev.map((c) => c.id === id ? { ...c, follower_count: c.follower_count + 1 } : c))
    } catch (e) {
      // not authenticated, ignore
    }
  }

  const filtered = search
    ? conclaves.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase()))
    : conclaves

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h2 className="text-lg font-mono font-semibold text-white mb-4">DISCOVER</h2>
        <input
          className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-sm mb-4 focus:border-[#7c6af7] outline-none"
          placeholder="Search conclaves..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-3">
          {filtered.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f0f1a] rounded-2xl p-4 border border-[#1e1e35] flex items-center justify-between"
            >
              <div>
                <div className="font-mono font-semibold text-white text-sm">{c.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#7c6af7] font-mono text-xs">{c.domain}</span>
                  <span className="text-[#4a4a6a] text-xs">{c.follower_count} followers</span>
                </div>
              </div>
              <button
                onClick={() => handleFollow(c.id)}
                className="border border-[#7c6af7] text-[#7c6af7] font-mono text-xs px-3 py-1.5 rounded-xl hover:bg-[#7c6af7] hover:text-white transition-all"
              >
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
