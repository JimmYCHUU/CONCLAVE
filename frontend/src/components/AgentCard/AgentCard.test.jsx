import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import AgentCard from './AgentCard'

test('renders name, role, and accuracy', () => {
  const agent = {
    id: '1', name: 'Yuna', role: 'Macro Flow Strategist',
    accuracy_score: 0.72, calibration_score: 0.85, total_predictions: 10,
  }
  render(<AgentCard agent={agent} color="#7c6af7" onClick={() => {}} />)
  expect(screen.getByText('Yuna')).toBeInTheDocument()
  expect(screen.getByText('Macro Flow Strategist')).toBeInTheDocument()
})
