import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { API_URL } from '../../api';
import fallbackDatabase from '../../../server/db.json';

const LOCAL_TICKETS_KEY = 'aftr_my_tickets';
const PROMO_CODES = {
  AFTR10: 0.1,
  NAIROBI: 0.1,
  VIP20: 0.2
};

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

function createMpesaReceipt() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'SL';
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function formatTimer(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

// Accepts 712345678, 0712345678, 0112345678, or 254712345678
function formatKenyanPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (/^(7|1)\d{8}$/.test(digits)) {
    return `+254 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  if (/^(07|01)\d{8}$/.test(digits)) {
    return `+254 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (/^254(7|1)\d{8}$/.test(digits)) {
    return `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return null;
}

function formatCardInput(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiryInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function saveTicketLocally(ticket) {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_TICKETS_KEY) || '[]');
    const tickets = Array.isArray(existing) ? existing : [];
    localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify([ticket, ...tickets]));
    window.dispatchEvent(new Event('aftr:tickets-updated'));
  } catch {
    throw new Error('Could not save your ticket in this browser.');
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function CheckoutPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(!location.state?.event);

  // Ticket selection
  const [tier, setTier] = useState('regular');
  const [quantity, setQuantity] = useState(1);

  // Attendee details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');

  // Hold timer (10 mins)
  const [secondsLeft, setSecondsLeft] = useState(600);

  // Checkout processing state
  const [submitting, setSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [receiptCode, setReceiptCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.state?.event) return undefined;

    let cancelled = false;
    const loadEvent = async () => {
      try {
        const hosted = JSON.parse(sessionStorage.getItem('aftr_hosted_events') || '[]');
        if (Array.isArray(hosted)) {
          const hostedMatch = hosted.find((item) => String(item.id) === String(id));
          if (hostedMatch) {
            if (!cancelled) {
              setEvent(hostedMatch);
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        // Ignore session storage errors
      }

      try {
        if (API_URL) {
          const response = await fetch(`${API_URL}/events/${id}`);
          if (response.ok) {
            const eventData = await response.json();
            if (eventData?.title && !cancelled) {
              setEvent(eventData);
              setLoading(false);
              return;
            }
          }
        }
      } catch {
        // Static preview continues with its bundled event data.
      }

      const fallbackEvent = fallbackDatabase.events.find((item) => String(item.id) === String(id));
      if (!cancelled) {
        setEvent(fallbackEvent || null);
        setLoading(false);
      }
    };

    loadEvent();
    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  const basePrice = useMemo(() => {
    if (!event) return 0;
    return String(event.price).toLowerCase() === 'free' ? 0 : Number(event.price) || 0;
  }, [event]);

  const isFreeEvent = basePrice === 0;
  const vipPrice = isFreeEvent ? 0 : Math.round((basePrice * 1.6) / 100) * 100;
  const unitPrice = tier === 'vip' && !isFreeEvent ? vipPrice : basePrice;
  const subtotal = unitPrice * quantity;
  const discountAmount = appliedPromo ? Math.round(subtotal * appliedPromo.rate) : 0;
  const serviceFee = isFreeEvent ? 0 : 100 * quantity;
  const total = Math.max(0, subtotal - discountAmount + serviceFee);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedPromo({ code, rate: PROMO_CODES[code] });
      setPromoMessage(`${Math.round(PROMO_CODES[code] * 100)}% discount applied (${code})`);
    } else {
      setAppliedPromo(null);
      setPromoMessage('Code not recognized. Try AFTR10.');
    }
  };

  const handleCheckout = async (submitEvent) => {
    submitEvent.preventDefault();
    setError('');

    if (!event || !name.trim() || !email.trim()) {
      setError('Enter your full name and email address to continue.');
      return;
    }

    let formattedPhone = '';
    if (!isFreeEvent) {
      if (paymentMethod === 'mpesa') {
        formattedPhone = formatKenyanPhone(mpesaPhone);
        if (!formattedPhone) {
          setError('Enter a valid Kenyan M-Pesa number (e.g. 0712 345 678).');
          return;
        }
      } else {
        const cleanCard = cardNumber.replace(/\s/g, '');
        if (cleanCard.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
          setError('Enter valid card details (16-digit number, MM/YY, and CVV).');
          return;
        }
      }
    }

    setSubmitting(true);
    setReceiptCode('');

    try {
      let generatedReceipt = '';
      if (isFreeEvent) {
        setProcessingStep('Confirming your RSVP & generating QR pass…');
        await sleep(900);
      } else if (paymentMethod === 'mpesa') {
        setProcessingStep(`Sending M-Pesa STK push to ${formattedPhone}…`);
        await sleep(1100);
        setProcessingStep('Waiting for M-Pesa PIN confirmation…');
        await sleep(1100);
        generatedReceipt = createMpesaReceipt();
        setReceiptCode(generatedReceipt);
        setProcessingStep(`Payment confirmed (${generatedReceipt}). Issuing QR pass…`);
        await sleep(800);
      } else {
        setProcessingStep('Verifying card details…');
        await sleep(1000);
        setProcessingStep('Payment approved! Issuing your QR pass…');
        await sleep(800);
      }

      const effectiveUnitPrice = isFreeEvent ? 0 : Math.round((subtotal - discountAmount) / quantity);
      const ticket = {
        id: `aftr-${Date.now()}`,
        title: event.title,
        subtitle: event.description || `${event.category || 'Event'} · ${event.startTime || 'Tonight'}`,
        venue: event.location?.venue || 'Nairobi venue',
        neighborhood: event.location?.address || 'Nairobi, Kenya',
        date: getEventDate(event.startTime),
        time: event.startTime || '20:00',
        endTime: event.endTime || '',
        image: event.image,
        price: effectiveUnitPrice,
        currency: event.currency || 'KES',
        quantity,
        ticketType: isFreeEvent ? 'Free RSVP' : tier === 'vip' ? 'VIP Lounge' : 'General admission',
        status: 'Confirmed',
        reference: createReference(),
        attendeeName: name.trim(),
        attendeeEmail: email.trim(),
        paymentMethod: isFreeEvent ? 'RSVP' : paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card',
        mpesaReceipt: generatedReceipt || undefined,
        paymentStatus: 'confirmed'
      };

      if (API_URL) {
        try {
          const response = await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket)
          });
          if (response.ok) {
            const savedTicket = await response.json();
            saveTicketLocally({
              ...ticket,
              id: savedTicket?.id || ticket.id
            });
          } else {
            saveTicketLocally(ticket);
          }
        } catch {
          saveTicketLocally(ticket);
        }
      } else {
        saveTicketLocally(ticket);
      }

      navigate('/my-tickets', { state: { ticketCreated: true } });
    } catch (saveError) {
      setError(saveError.message || 'Could not complete checkout. Please try again.');
    } finally {
      setSubmitting(false);
      setProcessingStep('');
    }
  };

  return (
    <Sidebar>
      <main className="mx-auto w-full max-w-[1020px] py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            className="text-[11px] font-semibold text-[#9a9d94] transition hover:text-white"
            onClick={() => navigate('/saved-nights')}
            type="button"
          >
            ← Back to saved nights
          </button>

          <div className="flex items-center gap-2 rounded-full border border-[#d2ff38]/25 bg-[#d2ff38]/10 px-3 py-1 text-[10px] font-semibold text-[#d2ff38]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d2ff38]" />
            Seats held for {formatTimer(secondsLeft)}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-extrabold tracking-[1.6px] text-[#d2ff38]">SECURE CHECKOUT</p>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-white sm:text-[32px]">
            Lock in your night.
          </h1>
          <p className="mt-1 text-[12px] text-[#8b909a]">
            Your QR entry pass will be added to My Tickets immediately after confirmation.
          </p>
        </div>

        {loading ? (
          <div className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
        ) : !event ? (
          <section className="rounded-2xl border border-white/10 bg-[#15171a] p-6">
            <h2 className="text-[16px] font-bold text-white">This event is unavailable.</h2>
            <p className="mt-1 text-[12px] text-[#8b909a]">Return to saved nights and choose another event.</p>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <form
              className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#131519] p-5 sm:p-6"
              onSubmit={handleCheckout}
            >
              {/* 1. Ticket Tier & Quantity */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[14px] font-bold text-white">1. Select tickets</h2>
                  <span className="text-[10px] text-[#8b909a]">Max 8 per booking</span>
                </div>

                {!isFreeEvent && (
                  <div className="mb-3.5 grid gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setTier('regular')}
                      className={`rounded-xl border p-3.5 text-left transition ${
                        tier === 'regular'
                          ? 'border-[#d2ff38] bg-[#d2ff38]/[0.08]'
                          : 'border-white/10 bg-[#0e1013] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-bold text-white">General Admission</span>
                        <span className="text-[11px] font-bold text-[#d2ff38]">{formatPrice(basePrice)}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-[#8b909a]">Standard entry & main floor access</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTier('vip')}
                      className={`rounded-xl border p-3.5 text-left transition ${
                        tier === 'vip'
                          ? 'border-[#d2ff38] bg-[#d2ff38]/[0.08]'
                          : 'border-white/10 bg-[#0e1013] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-bold text-white">VIP Lounge</span>
                        <span className="text-[11px] font-bold text-[#d2ff38]">{formatPrice(vipPrice)}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-[#8b909a]">Express gate lane, VIP deck & priority bar</p>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0e1013] px-4 py-3">
                  <div>
                    <p className="text-[12px] font-bold text-white">
                      {isFreeEvent ? 'Free RSVP Pass' : tier === 'vip' ? 'VIP Lounge Pass' : 'General Admission'}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#8b909a]">{formatPrice(unitPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      aria-label="Remove one ticket"
                      className="h-8 w-8 rounded-full border border-white/15 bg-white/[0.03] text-white transition hover:border-white/35 disabled:opacity-30"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      type="button"
                    >
                      −
                    </button>
                    <output aria-label="Ticket quantity" className="w-5 text-center text-[13px] font-bold text-white">
                      {quantity}
                    </output>
                    <button
                      aria-label="Add one ticket"
                      className="h-8 w-8 rounded-full border border-white/15 bg-white/[0.03] text-white transition hover:border-white/35 disabled:opacity-30"
                      disabled={quantity >= 8}
                      onClick={() => setQuantity((current) => Math.min(8, current + 1))}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Attendee Details */}
              <div className="border-t border-white/[0.08] pt-5">
                <h2 className="mb-3 text-[14px] font-bold text-white">2. Attendee details</h2>
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className="block text-[10px] font-bold tracking-wider text-[#aeb0a9]">
                    FULL NAME
                    <input
                      autoComplete="name"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0e1013] px-3.5 py-3 text-[12px] text-white outline-none transition focus:border-[#d2ff38]/60"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Brian Ochieng"
                      required
                      value={name}
                    />
                  </label>
                  <label className="block text-[10px] font-bold tracking-wider text-[#aeb0a9]">
                    EMAIL FOR RECEIPT
                    <input
                      autoComplete="email"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0e1013] px-3.5 py-3 text-[12px] text-white outline-none transition focus:border-[#d2ff38]/60"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={email}
                    />
                  </label>
                </div>
              </div>

              {/* 3. Payment Method */}
              {!isFreeEvent && (
                <div className="border-t border-white/[0.08] pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-[14px] font-bold text-white">3. Payment method</h2>
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <rect height="11" rx="2" width="18" x="3" y="11" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Encrypted checkout
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-[12px] font-bold transition ${
                        paymentMethod === 'mpesa'
                          ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-300'
                          : 'border-white/10 bg-[#0e1013] text-[#9a9d94] hover:border-white/25'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      M-Pesa Express
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-[12px] font-bold transition ${
                        paymentMethod === 'card'
                          ? 'border-[#d2ff38]/70 bg-[#d2ff38]/10 text-[#d2ff38]'
                          : 'border-white/10 bg-[#0e1013] text-[#9a9d94] hover:border-white/25'
                      }`}
                    >
                      Visa / Mastercard
                    </button>
                  </div>

                  {paymentMethod === 'mpesa' ? (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                      <label className="block text-[10px] font-bold tracking-wider text-emerald-300">
                        M-PESA PHONE NUMBER
                        <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border border-white/10 bg-[#0e1013] focus-within:border-emerald-400/70">
                          <span className="border-r border-white/10 px-3 py-3 text-[12px] font-semibold text-[#8b909a]">
                            +254
                          </span>
                          <input
                            className="w-full bg-transparent px-3 py-3 text-[12px] text-white outline-none"
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            placeholder="712 345 678"
                            type="tel"
                            value={mpesaPhone}
                          />
                        </div>
                      </label>
                      <p className="mt-2.5 text-[10px] leading-relaxed text-[#9a9d94]">
                        Keep your phone unlocked. An M-Pesa STK prompt for{' '}
                        <strong className="text-white">{formatPrice(total)}</strong> will appear for your PIN.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-xl border border-white/10 bg-[#0e1013] p-4">
                      <label className="block text-[10px] font-bold tracking-wider text-[#aeb0a9]">
                        CARD NUMBER
                        <input
                          className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#131519] px-3.5 py-2.5 font-mono text-[12px] text-white outline-none focus:border-[#d2ff38]/60"
                          inputMode="numeric"
                          onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block text-[10px] font-bold tracking-wider text-[#aeb0a9]">
                          EXPIRY
                          <input
                            className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#131519] px-3.5 py-2.5 font-mono text-[12px] text-white outline-none focus:border-[#d2ff38]/60"
                            inputMode="numeric"
                            onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                            placeholder="08/28"
                            value={cardExpiry}
                          />
                        </label>
                        <label className="block text-[10px] font-bold tracking-wider text-[#aeb0a9]">
                          CVV
                          <input
                            className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#131519] px-3.5 py-2.5 font-mono text-[12px] text-white outline-none focus:border-[#d2ff38]/60"
                            inputMode="numeric"
                            maxLength={4}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="123"
                            type="password"
                            value={cardCvv}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p aria-live="polite" className="rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-[11px] text-red-300">
                  {error}
                </p>
              )}

              <button
                className="w-full rounded-full bg-[#d2ff38] px-5 py-3.5 text-[12px] font-extrabold text-[#11130d] shadow-[0_8px_28px_rgba(210,255,56,0.22)] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                {submitting
                  ? processingStep || 'Processing…'
                  : isFreeEvent
                  ? `Confirm Free RSVP (${quantity})`
                  : paymentMethod === 'mpesa'
                  ? `Pay ${formatPrice(total)} via M-Pesa`
                  : `Pay ${formatPrice(total)} with Card`}
              </button>

              <p className="text-center text-[10px] text-[#6d7069]">
                Sandbox checkout — no real money is debited. QR pass is issued instantly.
              </p>
            </form>

            {/* Right column: Order Summary */}
            <aside className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131519]">
              <div className="relative h-48 w-full">
                <img alt={event.title} className="h-full w-full object-cover" src={event.image} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131519] via-[#131519]/30 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d2ff38] backdrop-blur">
                  {event.category || 'Nairobi Event'}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-[20px] font-bold leading-snug text-white">{event.title}</h2>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#9a9d94]">{event.description}</p>

                <div className="mt-4 space-y-1 rounded-xl border border-white/[0.06] bg-[#0e1013] p-3.5 text-[11px] text-[#c5c7c0]">
                  <p className="font-semibold text-white">{event.location?.venue}</p>
                  <p className="text-[#858880]">{event.location?.address}</p>
                  <p className="pt-1 text-[#d2ff38]">
                    {event.startTime}
                    {event.endTime ? ` – ${event.endTime}` : ''} · EAT
                  </p>
                </div>

                {!isFreeEvent && (
                  <div className="mt-4">
                    <div className="flex gap-2">
                      <input
                        className="w-full rounded-xl border border-white/10 bg-[#0e1013] px-3 py-2 text-[11px] uppercase text-white placeholder:normal-case placeholder:text-[#666963] outline-none focus:border-[#d2ff38]/50"
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code (e.g. AFTR10)"
                        type="text"
                        value={promoInput}
                      />
                      <button
                        className="shrink-0 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2 text-[11px] font-bold text-white transition hover:border-[#d2ff38]/50 hover:text-[#d2ff38]"
                        onClick={handleApplyPromo}
                        type="button"
                      >
                        Apply
                      </button>
                    </div>
                    {promoMessage && (
                      <p className={`mt-1.5 text-[10px] ${appliedPromo ? 'text-emerald-400' : 'text-amber-300'}`}>
                        {promoMessage}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-5 space-y-2 border-t border-white/[0.08] pt-4 text-[11px]">
                  <div className="flex justify-between text-[#9a9d94]">
                    <span>
                      {quantity} × {isFreeEvent ? 'Free RSVP' : tier === 'vip' ? 'VIP Lounge' : 'General Admission'}
                    </span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>

                  {!isFreeEvent && (
                    <div className="flex justify-between text-[#9a9d94]">
                      <span>Booking & QR fee</span>
                      <span className="text-white">{formatPrice(serviceFee)}</span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({appliedPromo.code})</span>
                      <span>− {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-white/[0.08] pt-3 text-[14px]">
                    <span className="font-bold text-white">Total due</span>
                    <strong className="text-[17px] font-extrabold text-[#d2ff38]">{formatPrice(total)}</strong>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Payment Processing Modal */}
        {submitting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#131519] p-7 text-center shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#d2ff38]/30 bg-[#d2ff38]/10">
                {receiptCode ? (
                  <svg className="h-7 w-7 text-[#d2ff38]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#d2ff38] border-t-transparent" />
                )}
              </div>
              <p className="text-[10px] font-extrabold tracking-[1.5px] text-[#d2ff38]">
                {isFreeEvent ? 'CONFIRMING RSVP' : paymentMethod === 'mpesa' ? 'M-PESA EXPRESS' : 'CARD GATEWAY'}
              </p>
              <h3 className="mt-2 text-[16px] font-bold text-white">{processingStep}</h3>
              <p className="mt-2 text-[11px] text-[#8b909a]">
                Please keep this window open while we issue your QR entry pass.
              </p>
            </div>
          </div>
        )}
      </main>
    </Sidebar>
  );
}