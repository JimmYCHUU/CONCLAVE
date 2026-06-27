import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import CalibrationBadge from './CalibrationBadge'

test('renders null if score is null', () => {
  const { container } = render(<CalibrationBadge score={null} />)
  expect(container.firstChild).toBeNull()
})

test('renders well calibrated for high score', () => {
  render(<CalibrationBadge score={0.9} />)
  expect(screen.getByText('Well calibrated')).toBeInTheDocument()
})

test('renders poorly calibrated for low score', () => {
  render(<CalibrationBadge score={0.3} />)
  expect(screen.getByText('Poorly calibrated')).toBeInTheDocument()
})
