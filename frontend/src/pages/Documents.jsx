import React, { useEffect, useState } from 'react'
import { useConclaveStore } from '../store/conclaveStore'
import { getDocuments, addDocument } from '../api/endpoints/documents'
import Layout from '../components/Layout/Layout'

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const conclave = useConclaveStore((s) => s.conclave)
  const addDocStore = useConclaveStore((s) => s.addDocument)

  useEffect(() => {
    if (!conclave) return
    getDocuments(conclave.id).then((res) => setDocs(res.data)).catch(() => {})
  }, [conclave])

  const handleAdd = async () => {
    if (!conclave) return
    try {
      const res = await addDocument(conclave.id, { url: url || undefined, text: text || undefined })
      setDocs([res.data, ...docs])
      addDocStore(res.data)
      setShowModal(false)
      setUrl('')
      setText('')
    } catch (e) {
      alert('Failed to add document')
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono font-semibold text-white">Intelligence Documents</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#7c6af7] text-white font-mono text-xs px-4 py-2 rounded-xl hover:bg-[#6c5ae7] transition-colors"
          >
            Add Intelligence
          </button>
        </div>

        {docs.length === 0 && (
          <div className="text-center py-12 text-[#4a4a6a] font-mono text-sm">
            No documents yet. Add intelligence to feed your council.
          </div>
        )}

        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-[#0f0f1a] rounded-2xl p-4 border border-[#1e1e35]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {doc.source_url && (
                    <div className="text-[#7c6af7] font-mono text-xs truncate mb-1">{doc.source_url}</div>
                  )}
                  <p className="text-white text-sm">{doc.content_preview}</p>
                </div>
                <span className="text-[#4a4a6a] font-mono text-xs ml-2">{doc.entity_count} entities</span>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <div className="bg-[#0f0f1a] rounded-2xl p-6 w-full max-w-md border border-[#1e1e35]" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-white font-mono font-semibold mb-4">Add Intelligence</h3>
              <input className="w-full bg-[#14141f] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-sm mb-3 focus:border-[#7c6af7] outline-none" placeholder="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} />
              <textarea className="w-full bg-[#14141f] border border-[#1e1e35] rounded-xl p-3 text-white font-mono text-sm min-h-[100px] focus:border-[#7c6af7] outline-none mb-4" placeholder="Or paste text content..." value={text} onChange={(e) => setText(e.target.value)} />
              <button onClick={handleAdd} className="w-full bg-[#7c6af7] text-white font-mono text-sm py-3 rounded-xl hover:bg-[#6c5ae7] transition-colors">
                Add to Knowledge Base
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
