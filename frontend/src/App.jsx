import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Router from './router'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Router />
        </AnimatePresence>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
