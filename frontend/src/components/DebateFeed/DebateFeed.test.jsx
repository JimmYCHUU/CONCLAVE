import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import DebateFeed from './DebateFeed'

test('renders swarm and council messages', () => {
  const messages = [
    { content: 'Market is reacting', round_number: 1, is_swarm: true, agent_id: null },
    { content: 'I agree with the crowd', round_number: 1, is_swarm: false, agent_id: '1', agent_name: 'Yuna' },
  ]
  render(<DebateFeed messages={messages} agents={[{ id: '1', name: 'Yuna' }]} />)
  expect(screen.getByText('CROWD')).toBeInTheDocument()
  expect(screen.getByText('Yuna')).toBeInTheDocument()
})
