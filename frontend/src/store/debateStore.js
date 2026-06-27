import { create } from 'zustand'

export const useDebateStore = create((set) => ({
  activeSession: null,
  liveMessages: [],
  branches: [],
  swarmSummary: null,
  isLive: false,
  currentStage: 'swarm',
  startLiveDebate: (session) =>
    set({ activeSession: session, liveMessages: [], isLive: true, currentStage: 'swarm' }),
  addMessage: (msg) =>
    set((s) => ({ liveMessages: [...s.liveMessages, msg] })),
  setSwarmSummary: (s) => set({ swarmSummary: s, currentStage: 'council' }),
  setBranches: (b) => set({ branches: b }),
  endDebate: (summary) =>
    set({ isLive: false, currentStage: 'complete' }),
}))
