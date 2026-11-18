import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterChip from './FilterChip'

describe('FilterChip', () => {
  test('shows its label', () => {
    render(<FilterChip label="All dates" />)
    expect(screen.getByRole('button', { name: 'All dates' })).toBeInTheDocument()
  })

  test('an active chip is lime and an idle one is not', () => {
    const { rerender } = render(<FilterChip label="Chip" active />)
    expect(screen.getByRole('button')).toHaveClass('text-[#d2ff38]')
    rerender(<FilterChip label="Chip" />)
    expect(screen.getByRole('button')).not.toHaveClass('text-[#d2ff38]')
  })

  test('clicking calls the click handler', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(<FilterChip label="Any price" onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: 'Any price' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
