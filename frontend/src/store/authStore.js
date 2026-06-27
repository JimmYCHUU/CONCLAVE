import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (userData, token) => {
    localStorage.setItem('conclave_token', token)
    localStorage.setItem('conclave_user', JSON.stringify(userData))
    set({ user: userData, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('conclave_token')
    localStorage.removeItem('conclave_user')
    set({ user: null, token: null, isAuthenticated: false })
  },
  loadFromStorage: () => {
    const token = localStorage.getItem('conclave_token')
    const user = localStorage.getItem('conclave_user')
    if (token && user) {
      set({ user: JSON.parse(user), token, isAuthenticated: true })
    }
  },
}))
