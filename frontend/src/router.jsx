import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Chamber from './pages/Chamber'
import AgentProfile from './pages/AgentProfile'
import Inject from './pages/Inject'
import Documents from './pages/Documents'
import Discover from './pages/Discover'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/chamber/:sessionId" element={<ProtectedRoute><Chamber /></ProtectedRoute>} />
      <Route path="/agent/:agentId" element={<ProtectedRoute><AgentProfile /></ProtectedRoute>} />
      <Route path="/inject" element={<ProtectedRoute><Inject /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
    </Routes>
  )
}
