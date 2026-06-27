import { create } from 'zustand'

export const useConclaveStore = create((set) => ({
  conclave: null,
  brief: null,
  documents: [],
  setConclave: (c) => set({ conclave: c }),
  setBrief: (b) => set({ brief: b }),
  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  updateAgentAccuracy: (agentId, accuracy, calibration) =>
    set((s) => ({
      conclave: s.conclave ? {
        ...s.conclave,
        agents: s.conclave.agents.map((a) =>
          a.id === agentId ? { ...a, accuracy_score: accuracy, calibration_score: calibration } : a
        ),
      } : null,
    })),
}))
