import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import MorningBrief from './MorningBrief'

test('renders topic and summary bullets', () => {
  const brief = {
    topic: 'Federal Reserve Rate Decision',
    council_summary: '• First bullet point\n• Second bullet point',
    debate_date: '2026-06-26T06:00:00Z',
    swarm_summary: null,
  }
  render(<MorningBrief brief={brief} />)
  expect(screen.getByText('Federal Reserve Rate Decision')).toBeInTheDocument()
})
