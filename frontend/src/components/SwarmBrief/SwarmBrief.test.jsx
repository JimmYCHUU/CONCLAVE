import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import SwarmBrief from './SwarmBrief'

test('renders dominant view and sentiment split', () => {
  const summary = {
    dominant_view: 'Most are concerned about inflation',
    minority_view: 'Some see it as transitory',
    sentiment_split: '65% concerned, 25% optimistic, 10% neutral',
    key_reactions: ['Too much uncertainty', 'Markets will adjust'],
  }
  render(<SwarmBrief swarm_summary={summary} />)
  expect(screen.getByText('Most are concerned about inflation')).toBeInTheDocument()
  expect(screen.getByText('65% concerned')).toBeInTheDocument()
})
