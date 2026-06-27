import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import ScenarioBranches from './ScenarioBranches'

test('renders 3 cards with correct branch type labels', () => {
  const branches = [
    { type: 'base', outcome_summary: 'Steady growth continues', key_signal: 'Stable' },
    { type: 'disruption', disruption_event: 'Regulatory shock', outcome_summary: 'Market volatility', key_signal: 'Uncertain' },
    { type: 'black_swan', disruption_event: 'Systemic crisis', outcome_summary: 'Major correction', key_signal: 'Risk' },
  ]
  render(<ScenarioBranches branches={branches} />)
  expect(screen.getByText('BASE CASE')).toBeInTheDocument()
  expect(screen.getByText('DISRUPTION')).toBeInTheDocument()
  expect(screen.getByText('BLACK SWAN')).toBeInTheDocument()
})
