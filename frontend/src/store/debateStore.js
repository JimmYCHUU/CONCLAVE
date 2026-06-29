import { create } from 'zustand'

export const useDebateStore = create((set, get) => ({
  activeSession: null,
  liveMessages: [],
  branches: [],
  swarmSummary: null,
  isLive: false,
  currentStage: 'swarm',

  resetDebate: () =>
    set({
      activeSession: null,
      liveMessages: [],
      branches: [],
      swarmSummary: null,
      isLive: false,
      currentStage: 'swarm',
    }),

  startLiveDebate: (session) =>
    set({
      activeSession: session,
      liveMessages: session?.messages ?? [],
      isLive: session?.status !== 'completed' && session?.status !== 'failed',
      currentStage: 'swarm',
    }),

  addMessage: (msg) =>
    set((s) => {
      if (s.liveMessages.some((m) => m.content === msg.content && m.agent_name === msg.agent_name && m.round_number === msg.round_number)) {
        return s
      }
      return { liveMessages: [...s.liveMessages, msg] }
    }),

  setSwarmSummary: (summary) => set({ swarmSummary: summary, currentStage: 'council' }),

  setBranches: (b) => set({ branches: b }),

  endDebate: (summary) =>
    set((s) => ({
      isLive: false,
      currentStage: 'complete',
      activeSession: s.activeSession ? { ...s.activeSession, status: 'completed', summary } : null,
    })),
}))
