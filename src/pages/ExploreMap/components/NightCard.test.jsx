import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import NightCard from './NightCard'
import { normalizeEvent } from '../normalizeEvent'
import { dbEvents } from '../testEvents'

function renderCard(event, props = {}) {
  return render(
    <MemoryRouter initialEntries={['/explore']}>
      <Routes>
        <Route path="/explore" element={<NightCard event={event} {...props} />} />
        <Route path="/events/:id" element={<p>Event page</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('NightCard', () => {
  test('shows the title, distance and price', () => {
    renderCard(normalizeEvent(dbEvents[0]))
    expect(screen.getByText('Detty Dezemba')).toBeInTheDocument()
    expect(screen.getByText(/2.6 mi/)).toBeInTheDocument()
    expect(screen.getByText(/KES 4,500/)).toBeInTheDocument()
  })

  test('shows Free for a free night', () => {
    renderCard(normalizeEvent(dbEvents[1]))
    expect(screen.getByText(/Free/)).toBeInTheDocument()
  })

  test('clicking the card selects it', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    renderCard(normalizeEvent(dbEvents[0]), { onSelect })
    await user.click(screen.getByText('Detty Dezemba'))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  test('the selected card has the lime border', () => {
    const { container } = renderCard(normalizeEvent(dbEvents[0]), { selected: true })
    expect(container.firstChild).toHaveClass('border-[#d2ff38]')
  })

  test('View night opens the event page without selecting the card', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    renderCard(normalizeEvent(dbEvents[0]), { onSelect })
    await user.click(screen.getByRole('button', { name: /view night/i }))
    expect(screen.getByText('Event page')).toBeInTheDocument()
    expect(onSelect).not.toHaveBeenCalled()
  })
})
