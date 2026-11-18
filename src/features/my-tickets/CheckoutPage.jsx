import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { API_URL } from '../../api';
import fallbackDatabase from '../../../server/db.json';

const LOCAL_TICKETS_KEY = 'aftr_my_tickets';

function getNairobiDate(offset = 1) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day) + offset))
    .toISOString()
    .slice(0, 10);
}

function getEventDate(startTime) {
  if (!/^\d{2}:\d{2}$/.test(String(startTime || ''))) return getNairobiDate(1);

  const nowParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const nowValues = Object.fromEntries(nowParts.map(({ type, value }) => [type, value]));
  const currentMinutes = Number(nowValues.hour) * 60 + Number(nowValues.minute);
  const [eventHour, eventMinute] = startTime.split(':').map(Number);
  const eventMinutes = eventHour * 60 + eventMinute;

  return getNairobiDate(eventMinutes > currentMinutes ? 0 : 1);
}

function formatPrice(amount) {
  const numericAmount = String(amount).toLowerCase() === 'free' ? 0 : Number(amount) || 0;
  return numericAmount === 0 ? 'Free' : `KSh ${numericAmount.toLocaleString('en-KE')}`;
}

function createReference() {
  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `AFTR-${code.slice(0, 4)}-${code.slice(4)}`;
}

function saveTicketLocally(ticket) {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_TICKETS_KEY) || '[]');
    const tickets = Array.isArray(existing) ? existing : [];
    localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify([ticket, ...tickets]));
  } catch {
    throw new Error('Could not save this demo ticket in this browser.');
  }
}

export default function CheckoutPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(location.state?.event || null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(!location.state?.event);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.event) return undefined;

    let cancelled = false;
    const loadEvent = async () => {
      try {
        if (API_URL) {
          const response = await fetch(`${API_URL}/events/${id}`);
          if (response.ok) {
            const eventData = await response.json();
            if (!cancelled) setEvent(eventData);
            return;
          }
        }
      } catch {
        // Static preview continues with its bundled event data.
      } finally {
        if (!cancelled) setLoading(false);
      }

      const fallbackEvent = fallbackDatabase.events.find((item) => String(item.id) === String(id));
      if (!cancelled) setEvent(fallbackEvent || null);
    };

    loadEvent();
    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  const unitPrice = useMemo(() => {
    if (!event) return 0;
    return String(event.price).toLowerCase() === 'free' ? 0 : Number(event.price) || 0;
  }, [event]);
  const total = unitPrice * quantity;

  const handleCheckout = async (submitEvent) => {
    submitEvent.preventDefault();
    setError('');
    if (!event || !name.trim() || !email.trim()) {
      setError('Enter your name and email to continue.');
      return;
    }

    setSubmitting(true);
    const ticket = {
      title: event.title,
      subtitle: event.description || `${event.category || 'Event'} · ${event.startTime || 'Tonight'}`,
      venue: event.location?.venue || 'Nairobi venue',
      neighborhood: event.location?.address || 'Nairobi, Kenya',
      date: getEventDate(event.startTime),
      time: event.startTime || '20:00',
      image: event.image,
      price: unitPrice,
      currency: event.currency || 'KES',
      quantity,
      ticketType: unitPrice === 0 ? 'Free RSVP' : 'General admission',
      status: 'Confirmed',
      reference: createReference(),
      attendeeName: name.trim(),
      attendeeEmail: email.trim(),
      paymentStatus: 'simulated'
    };

    try {
      if (API_URL) {
        const response = await fetch(`${API_URL}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticket)
        });
        if (!response.ok) throw new Error('Ticket server unavailable');
        const savedTicket = await response.json();
        try {
          const localTickets = JSON.parse(localStorage.getItem(LOCAL_TICKETS_KEY) || '[]');
          localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify([savedTicket, ...(Array.isArray(localTickets) ? localTickets : [])]));
        } catch {
          // The server record remains authoritative when local storage is unavailable.
        }
      } else {
        saveTicketLocally(ticket);
      }
      navigate('/my-tickets', { state: { ticketCreated: true } });
    } catch {
      try {
        saveTicketLocally(ticket);
        navigate('/my-tickets', { state: { ticketCreated: true, offline: true } });
      } catch (saveError) {
        setError(saveError.message || 'Could not complete the demo checkout.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sidebar>
      <main className="mx-auto w-full max-w-[980px] py-6">
        <button
          className="mb-5 text-[11px] font-semibold text-[#9a9d94] transition hover:text-white"
          onClick={() => navigate('/saved-nights')}
          type="button"
        >
          ← Back to saved nights
        </button>

        <div className="mb-6">
          <p className="text-[9px] font-extrabold tracking-[1.5px] text-[#d2ff38]">DEMO CHECKOUT</p>
          <h1 className="mt-1 text-[26px] font-bold text-white sm:text-[30px]">Make it a night.</h1>
          <p className="mt-1 text-[12px] text-[#8b909a]">Review your tickets and confirm this simulated booking.</p>
        </div>

        {loading ? (
          <div className="h-48 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
        ) : !event ? (
          <section className="rounded-xl border border-white/10 bg-[#15171a] p-6">
            <h2 className="text-[16px] font-bold">This event is unavailable.</h2>
            <p className="mt-1 text-[11px] text-[#8b909a]">Return to saved nights and choose another event.</p>
          </section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <form className="rounded-xl border border-white/[0.08] bg-[#131519] p-5 sm:p-6" onSubmit={handleCheckout}>
              <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h2 className="text-[14px] font-bold text-white">Attendee details</h2>
                  <p className="mt-1 text-[10px] text-[#8b909a]">Your demo ticket will be attached to these details.</p>
                </div>
                <span className="rounded-full border border-[#d2ff38]/20 bg-[#d2ff38]/10 px-2.5 py-1 text-[8px] font-bold tracking-wider text-[#d2ff38]">SIMULATED</span>
              </div>

              <label className="mb-4 block text-[10px] font-bold text-[#aeb0a9]">
                FULL NAME
                <input
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0e1013] px-3 py-3 text-[12px] text-white outline-none transition focus:border-[#d2ff38]/60"
                  onChange={(inputEvent) => setName(inputEvent.target.value)}
                  placeholder="e.g. Jamie Miller"
                  required
                  value={name}
                />
              </label>
              <label className="mb-5 block text-[10px] font-bold text-[#aeb0a9]">
                EMAIL ADDRESS
                <input
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0e1013] px-3 py-3 text-[12px] text-white outline-none transition focus:border-[#d2ff38]/60"
                  onChange={(inputEvent) => setEmail(inputEvent.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>

              <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                <div>
                  <p className="text-[10px] font-bold text-white">Tickets</p>
                  <p className="mt-0.5 text-[9px] text-[#8b909a]">{formatPrice(unitPrice)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button aria-label="Remove one ticket" className="h-8 w-8 rounded-full border border-white/10 text-white disabled:opacity-40" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} type="button">−</button>
                  <output aria-label="Ticket quantity" className="w-4 text-center text-[12px] font-bold text-white">{quantity}</output>
                  <button aria-label="Add one ticket" className="h-8 w-8 rounded-full border border-white/10 text-white" onClick={() => setQuantity((current) => Math.min(8, current + 1))} type="button">+</button>
                </div>
              </div>

              {error && <p aria-live="polite" className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-[10px] text-red-300">{error}</p>}
              <button className="mt-5 w-full rounded-full bg-[#d2ff38] px-5 py-3.5 text-[11px] font-extrabold text-[#11130d] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60" disabled={submitting} type="submit">
                {submitting ? 'Creating your ticket…' : unitPrice === 0 ? 'Confirm free RSVP' : `Simulate payment · ${formatPrice(total)}`}
              </button>
              <p className="mt-3 text-center text-[9px] leading-relaxed text-[#777a72]">Demo only. No real payment method is collected and no money is charged.</p>
            </form>

            <aside className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#131519]">
              <img alt="" className="h-48 w-full object-cover" src={event.image} />
              <div className="p-5">
                <p className="text-[9px] font-bold uppercase tracking-[1.2px] text-[#d2ff38]">{event.category || 'Nairobi event'}</p>
                <h2 className="mt-1 text-[19px] font-bold text-white">{event.title}</h2>
                <p className="mt-2 text-[10px] leading-relaxed text-[#9a9d94]">{event.description}</p>
                <div className="mt-4 border-t border-white/[0.08] pt-4 text-[10px] text-[#b8bab3]">
                  <p>{event.location?.venue}</p>
                  <p className="mt-1 text-[#858880]">{event.location?.address}</p>
                  <p className="mt-2">{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''} · EAT</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4 text-[11px]">
                  <span className="text-[#9a9d94]">Total · {quantity} {quantity === 1 ? 'ticket' : 'tickets'}</span>
                  <strong className="text-white">{formatPrice(total)}</strong>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </Sidebar>
  );
}
