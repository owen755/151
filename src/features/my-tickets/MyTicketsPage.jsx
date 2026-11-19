import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '../../components/Sidebar';
import { API_URL } from '../../api';

const TICKETS_STORAGE_KEY = 'aftr_my_tickets';
const NAIROBI_TIME_ZONE = 'Africa/Nairobi';
const REFUND_WINDOW_DAYS = 7;
const LEGACY_DUMMY_IDS = new Set([
  'AF-24831',
  'AF-24832',
  'AF-24833',
  'AF-24834',
  'AF-24835',
  'AF-24836',
  'AF-24837',
  'AF-24104'
]);

function getNairobiDate(offsetDays = 0) {
  const dateParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: NAIROBI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]));
  const date = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day) + offsetDays));

  return date.toISOString().slice(0, 10);
}

function addDaysToDateString(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function getTicketExpiryTimestamp(ticket) {
  if (!ticket?.date || !/^\d{4}-\d{2}-\d{2}$/.test(ticket.date)) {
    return 0;
  }

  const startStr = /^\d{2}:\d{2}$/.test(String(ticket.time || '')) ? ticket.time : '20:00';
  const endRaw = String(ticket.endTime || '').trim();

  if (/^\d{2}:\d{2}$/.test(endRaw)) {
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endRaw.split(':').map(Number);
    const rollsOverMidnight = endH * 60 + endM <= startH * 60 + startM;
    const expiryDate = rollsOverMidnight ? addDaysToDateString(ticket.date, 1) : ticket.date;
    return new Date(`${expiryDate}T${endRaw}:00+03:00`).getTime();
  }

  if (endRaw.toLowerCase().includes('dawn')) {
    const nextDay = addDaysToDateString(ticket.date, 1);
    return new Date(`${nextDay}T06:00:00+03:00`).getTime();
  }

  return new Date(`${ticket.date}T23:59:59+03:00`).getTime();
}

function hasEventEnded(ticket, nowMs = Date.now()) {
  return nowMs >= getTicketExpiryTimestamp(ticket);
}

// Only hard-delete legacy dummy tickets, attended tickets after the event ends,
// or expired tickets past the 7-day refund window.
function shouldHardDeleteTicket(ticket, nowMs = Date.now()) {
  if (!ticket || !ticket.title || !ticket.reference) return true;
  if (LEGACY_DUMMY_IDS.has(ticket.id)) return true;

  const ended = hasEventEnded(ticket, nowMs);
  const status = String(ticket.status || '').toLowerCase();
  const isPaid = Number(ticket.price) > 0;

  // Attended tickets delete automatically once the event is over
  if (status === 'attended' && ended) return true;

  // Free RSVPs have nothing to refund, so delete once the event ends
  if (!isPaid && ended) return true;

  // Unattended paid tickets stay in "Past & Refunds" for 7 days after the event ends
  if (ended) {
    const expiryMs = getTicketExpiryTimestamp(ticket);
    const refundDeadlineMs = expiryMs + REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return nowMs > refundDeadlineMs;
  }

  return false;
}

function saveTicketsToStorage(ticketList) {
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketList));
    window.dispatchEvent(new Event('aftr:tickets-updated'));
  } catch {
    // Ignore storage quota errors
  }
}

function readRealTickets() {
  try {
    const raw = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || '[]');
    if (!Array.isArray(raw)) return [];

    const nowMs = Date.now();
    const kept = raw.filter((ticket) => !shouldHardDeleteTicket(ticket, nowMs));

    if (kept.length !== raw.length) {
      saveTicketsToStorage(kept);
    }

    return kept;
  } catch {
    return [];
  }
}

function formatEventDate(date, options = {}) {
  return new Intl.DateTimeFormat('en-KE', {
    timeZone: NAIROBI_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...options
  }).format(new Date(`${date}T12:00:00+03:00`));
}

function formatPrice(amount) {
  return Number(amount) === 0 ? 'Free' : `KSh ${Number(amount).toLocaleString('en-KE')}`;
}

function getNairobiClock() {
  return new Intl.DateTimeFormat('en-KE', {
    timeZone: NAIROBI_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date());
}

function downloadTextFile(contents, filename, mimeType) {
  const file = new Blob([contents], { type: mimeType });
  const fileUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
}

function formatCalendarDate(date) {
  return date.toISOString().replaceAll(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeCalendarText(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n');
}

function TicketDetails({ ticket, onClose, onMarkAttended, onDelete, onRequestRefund }) {
  const [shareMessage, setShareMessage] = useState('');
  const [refundReason, setRefundReason] = useState('Unable to attend');
  const [showRefundForm, setShowRefundForm] = useState(false);

  const ended = hasEventEnded(ticket);
  const isPaid = Number(ticket.price) > 0;
  const refundStatus = ticket.refundStatus || null;
  const canRequestRefund = isPaid && !refundStatus && String(ticket.status || '').toLowerCase() !== 'attended';

  const handleDownload = () => {
    const contents = [
      'AFTR | EVENT TICKET & RECEIPT',
      `Event: ${ticket.title}`,
      `Date: ${formatEventDate(ticket.date, { year: 'numeric' })}`,
      `Time: ${ticket.time}${ticket.endTime ? ` – ${ticket.endTime}` : ''} EAT`,
      `Venue: ${ticket.venue}, ${ticket.neighborhood}`,
      `Ticket type: ${ticket.ticketType}`,
      `Quantity: ${ticket.quantity}`,
      `Total paid: ${formatPrice(Number(ticket.price) * Number(ticket.quantity))}`,
      ticket.mpesaReceipt ? `M-Pesa Receipt: ${ticket.mpesaReceipt}` : null,
      `Reference: ${ticket.reference}`
    ]
      .filter(Boolean)
      .join('\n');
    downloadTextFile(contents, `${ticket.reference}.txt`, 'text/plain;charset=utf-8');
  };

  const handleAddToCalendar = () => {
    const startsAt = new Date(`${ticket.date}T${ticket.time}:00+03:00`);
    const endsAt = new Date(startsAt.getTime() + 3 * 60 * 60 * 1000);
    const calendarEvent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AFTR//My Tickets//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${ticket.reference}@aftr`,
      `DTSTAMP:${formatCalendarDate(new Date())}`,
      `DTSTART:${formatCalendarDate(startsAt)}`,
      `DTEND:${formatCalendarDate(endsAt)}`,
      `SUMMARY:${escapeCalendarText(ticket.title)}`,
      `LOCATION:${escapeCalendarText(`${ticket.venue}, ${ticket.neighborhood}`)}`,
      `DESCRIPTION:${escapeCalendarText(`Ticket ${ticket.reference} · ${ticket.quantity} ${ticket.ticketType}`)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    downloadTextFile(calendarEvent, `${ticket.reference}.ics`, 'text/calendar;charset=utf-8');
  };

  const handleShare = async () => {
    const shareData = {
      title: `Your ticket for ${ticket.title}`,
      text: `${ticket.title} at ${ticket.venue} on ${formatEventDate(ticket.date)}. Ref: ${ticket.reference}`
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${shareData.text} (Ticket ref: ${ticket.reference})`);
      setShareMessage('Ticket details copied.');
    } else {
      setShareMessage('Sharing is not available in this browser.');
    }
  };

  const submitRefund = (e) => {
    e.preventDefault();
    onRequestRefund(ticket, refundReason);
    setShowRefundForm(false);
  };

  return (
    <div
      className="ticket-print-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="ticket-detail-title"
        aria-modal="true"
        className="ticket-print-card relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-[500px] overflow-y-auto rounded-[22px] border border-white/10 bg-[#15171a] shadow-2xl"
        role="dialog"
      >
        <div
          className="relative h-48 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(180deg,rgba(8,10,10,.08),rgba(8,10,10,.88)),url(${ticket.image})` }}
        >
          <button
            aria-label="Close ticket"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-black/70"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <span
              className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-[1.2px] ${
                refundStatus
                  ? 'bg-amber-300 text-[#11130d]'
                  : ended
                  ? 'bg-white/90 text-[#11130d]'
                  : 'bg-[#d2ff38] text-[#11130d]'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#11130d]" />
              {refundStatus
                ? 'REFUND REQUESTED'
                : ended
                ? 'UNATTENDED · EVENT ENDED'
                : (ticket.status || 'CONFIRMED').toUpperCase()}
            </span>
            <h2 className="text-[27px] font-extrabold leading-tight text-white" id="ticket-detail-title">
              {ticket.title}
            </h2>
          </div>
        </div>

        <div className="ticket-paper relative mx-4 -mt-1 rounded-[16px] bg-[#f7f7f0] p-5 text-[#141610] sm:mx-5 sm:p-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <p className="text-[9px] font-extrabold tracking-[1.3px] text-[#707366]">DATE & TIME</p>
              <p className="mt-1 text-[13px] font-bold">{formatEventDate(ticket.date, { year: 'numeric' })}</p>
              <p className="text-[12px] text-[#55584c]">
                {ticket.time}{ticket.endTime ? ` – ${ticket.endTime}` : ''} EAT
              </p>
            </div>
            <div>
              <p className="text-[9px] font-extrabold tracking-[1.3px] text-[#707366]">TICKET</p>
              <p className="mt-1 text-[13px] font-bold">{ticket.quantity} × {ticket.ticketType}</p>
              <p className="text-[12px] text-[#55584c]">
                {formatPrice(Number(ticket.price) * Number(ticket.quantity))} total
              </p>
            </div>
            <div className="col-span-2 border-t border-dashed border-[#c7c9bd] pt-4">
              <p className="text-[9px] font-extrabold tracking-[1.3px] text-[#707366]">VENUE</p>
              <p className="mt-1 text-[13px] font-bold">{ticket.venue}</p>
              <p className="text-[12px] text-[#55584c]">{ticket.neighborhood}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-dashed border-[#c7c9bd] pt-4">
            <div>
              <p className="text-[9px] font-extrabold tracking-[1.3px] text-[#707366]">ENTRY REFERENCE</p>
              <p className="mt-1 font-mono text-[14px] font-bold tracking-[1px]">{ticket.reference}</p>
              {ticket.mpesaReceipt && (
                <p className="mt-0.5 font-mono text-[10px] font-semibold text-[#3f5d10]">
                  M-Pesa: {ticket.mpesaReceipt}
                </p>
              )}
              <p className="mt-1 text-[10px] text-[#707366]">
                {ended
                  ? 'Unused pass retained for 7 days for refund claims.'
                  : 'Clears automatically once scanned at the gate.'}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <QRCodeSVG
                aria-label={`Entry QR code for ${ticket.reference}`}
                bgColor="#f7f7f0"
                fgColor={ended || refundStatus ? '#8c8f83' : '#17191a'}
                level="M"
                size={76}
                title={`Entry QR code for ${ticket.reference}`}
                value={JSON.stringify({ type: 'aftr-ticket', reference: ticket.reference, ticketId: ticket.id })}
              />
              <span className="text-[7px] font-extrabold tracking-[.8px] text-[#707366]">
                {refundStatus ? 'REFUND PENDING' : ended ? 'PASS EXPIRED' : 'ENTRY QR PASS'}
              </span>
            </div>
          </div>
        </div>

        {/* Refund Status Banner or Request Form */}
        {refundStatus && (
          <div className="mx-4 mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-[11px] text-amber-200 sm:mx-5">
            <p className="font-bold">Refund claim submitted ({ticket.refundRef})</p>
            <p className="mt-1 text-[10px] text-amber-200/80">
              Reason: {ticket.refundReason}. Reversal of{' '}
              <strong>{formatPrice(Number(ticket.price) * Number(ticket.quantity))}</strong> via{' '}
              {ticket.paymentMethod || 'M-Pesa'} takes 24–48 hrs.
            </p>
          </div>
        )}

        {showRefundForm && canRequestRefund && (
          <form
            onSubmit={submitRefund}
            className="mx-4 mt-3 space-y-3 rounded-xl border border-white/10 bg-[#0e1013] p-4 sm:mx-5"
          >
            <p className="text-[11px] font-bold text-white">Request refund for unused ticket</p>
            <select
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#15171a] px-3 py-2 text-[11px] text-white outline-none"
            >
              <option value="Unable to attend">Unable to attend</option>
              <option value="Event delayed or rescheduled">Event delayed or rescheduled</option>
              <option value="Accidental duplicate booking">Accidental duplicate booking</option>
              <option value="Venue access issue">Venue access issue</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-full bg-amber-300 px-3 py-2 text-[11px] font-extrabold text-[#11130d] hover:brightness-105"
              >
                Submit refund claim
              </button>
              <button
                type="button"
                onClick={() => setShowRefundForm(false)}
                className="rounded-full border border-white/15 px-3 py-2 text-[11px] text-[#9a9d94] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="ticket-actions grid grid-cols-2 gap-2 p-4 sm:flex sm:flex-wrap sm:p-5">
          <button
            className="rounded-full bg-[#d2ff38] px-3 py-3 text-[11px] font-extrabold text-[#11130d] transition hover:brightness-105 sm:flex-1 sm:px-4 sm:text-[12px]"
            onClick={() => window.print()}
            type="button"
          >
            Print receipt
          </button>
          {!ended && (
            <button
              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-3 text-[11px] font-semibold text-white transition hover:bg-white/10 sm:px-4"
              onClick={handleAddToCalendar}
              type="button"
            >
              Add to calendar
            </button>
          )}
          <button
            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-3 text-[11px] font-semibold text-white transition hover:bg-white/10 sm:px-4 sm:text-[12px]"
            onClick={handleDownload}
            type="button"
          >
            Download
          </button>
          <button
            aria-label="Share ticket"
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 text-[11px] font-semibold text-white transition hover:bg-white/10"
            onClick={handleShare}
            title="Share ticket"
            type="button"
          >
            <span aria-hidden="true">↗</span><span>Share</span>
          </button>
        </div>

        {/* Gate scan, Delete & Refund actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 px-5 pb-4 text-center">
          <button
            className="text-[10px] font-semibold text-[#8b909a] underline-offset-4 transition hover:text-[#d2ff38] hover:underline cursor-pointer"
            onClick={() => onMarkAttended(ticket)}
            type="button"
          >
            Scanned at gate (Attended)
          </button>

          <span className="text-white/20">•</span>

          <button
            className="text-[10px] font-semibold text-red-300 underline-offset-4 transition hover:underline cursor-pointer"
            onClick={() => onDelete(ticket)}
            type="button"
          >
            Delete ticket
          </button>

          {canRequestRefund && !showRefundForm && (
            <>
              <span className="text-white/20">•</span>
              <button
                className="text-[10px] font-semibold text-amber-300 underline-offset-4 transition hover:underline cursor-pointer"
                onClick={() => setShowRefundForm(true)}
                type="button"
              >
                Did not attend? Request refund
              </button>
            </>
          )}
        </div>

        {shareMessage && (
          <p aria-live="polite" className="ticket-share-feedback px-5 pb-4 text-center text-[10px] text-[#d2ff38]">
            {shareMessage}
          </p>
        )}
      </section>
    </div>
  );
}

function TicketCard({ ticket, onShow, onDelete }) {
  const ended = hasEventEnded(ticket);
  const refundStatus = ticket.refundStatus;

  return (
    <article className="group grid overflow-hidden rounded-[13px] border border-white/[0.07] bg-[#17191b] transition duration-200 hover:border-[#d2ff38]/30 hover:bg-[#191c1d] sm:grid-cols-[145px_minmax(0,1fr)]">
      <div className="relative min-h-[150px] overflow-hidden sm:min-h-[178px]">
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          src={ticket.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#17191b]/30" />
        <div className="absolute bottom-3 left-3 rounded-[8px] border border-white/15 bg-black/65 px-2.5 py-1.5 text-center backdrop-blur-sm sm:bottom-auto sm:left-3 sm:top-3">
          <span className="block text-[9px] font-extrabold uppercase tracking-[1px] text-[#d2ff38]">
            {formatEventDate(ticket.date, { weekday: undefined }).split(' ')[1]}
          </span>
          <span className="block text-[19px] font-extrabold leading-tight text-white">
            {new Intl.DateTimeFormat('en-KE', { timeZone: NAIROBI_TIME_ZONE, day: '2-digit' }).format(new Date(`${ticket.date}T12:00:00+03:00`))}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {refundStatus ? (
              <span className="rounded-full bg-amber-400/15 px-2 py-1 text-[8px] font-extrabold tracking-[.9px] text-amber-300">
                REFUND PENDING
              </span>
            ) : ended ? (
              <span className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-extrabold tracking-[.9px] text-amber-200">
                UNATTENDED · REFUND ELIGIBLE
              </span>
            ) : (
              <span className="rounded-full bg-[#273019] px-2 py-1 text-[8px] font-extrabold tracking-[.9px] text-[#d2ff38]">
                CONFIRMED
              </span>
            )}
            <span className="text-[9px] font-medium text-[#92958d]">
              {ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'} · {ticket.ticketType}
            </span>
          </div>
          <h2 className="truncate text-[19px] font-bold leading-tight text-white sm:text-[20px]">{ticket.title}</h2>
          <p className="mt-1 text-[11px] text-[#a2a49d]">{ticket.subtitle}</p>
          <p className="mt-3 truncate text-[11px] text-[#c5c6bf]">
            <span className="mr-1.5 text-[#d2ff38]">⌖</span>{ticket.venue}{' '}
            <span className="text-[#777a72]">· {ticket.neighborhood}</span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
          <div>
            <span className="block text-[8px] font-bold tracking-[1px] text-[#777a72]">TOTAL PAID</span>
            <span className="text-[12px] font-bold text-white">
              {formatPrice(Number(ticket.price) * Number(ticket.quantity))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label={`Delete ticket for ${ticket.title}`}
              className="rounded-full border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[10px] font-bold text-red-300 transition hover:bg-red-500/20 active:scale-[.98] cursor-pointer"
              onClick={() => onDelete(ticket)}
              type="button"
            >
              Delete
            </button>
            <button
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-extrabold transition hover:brightness-105 active:scale-[.98] cursor-pointer ${
                ended && !refundStatus
                  ? 'bg-amber-300 text-[#11130d]'
                  : 'bg-[#d2ff38] text-[#11130d]'
              }`}
              onClick={() => onShow(ticket)}
              type="button"
            >
              {ended && !refundStatus ? 'View / Refund' : 'Show ticket'} <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [clock, setClock] = useState(getNairobiClock);

  useEffect(() => {
    let cancelled = false;

    const syncTickets = async () => {
      const localRealTickets = readRealTickets();

      try {
        if (!API_URL) throw new Error('No ticket API configured');
        const response = await fetch(`${API_URL}/tickets`);
        if (!response.ok) throw new Error('Could not load tickets');
        const serverData = await response.json();
        if (cancelled) return;

        const nowMs = Date.now();
        const serverTickets = Array.isArray(serverData)
          ? serverData.filter((item) => !shouldHardDeleteTicket(item, nowMs))
          : [];

        const combined = [...localRealTickets, ...serverTickets];
        const unique = Array.from(
          new Map(combined.map((item) => [item.reference || item.id, item])).values()
        );
        setTickets(unique);
      } catch {
        if (!cancelled) setTickets(localRealTickets);
      } finally {
        if (!cancelled) setTicketsLoading(false);
      }
    };

    syncTickets();

    const handleCheckoutEvent = () => {
      if (!cancelled) setTickets(readRealTickets());
    };

    window.addEventListener('aftr:tickets-updated', handleCheckoutEvent);
    window.addEventListener('storage', handleCheckoutEvent);

    return () => {
      cancelled = true;
      window.removeEventListener('aftr:tickets-updated', handleCheckoutEvent);
      window.removeEventListener('storage', handleCheckoutEvent);
    };
  }, []);

  // Auto-clean attended/expired tickets every 60 seconds
  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(getNairobiClock());
      setTickets((current) => {
        const nowMs = Date.now();
        const remaining = current.filter((ticket) => !shouldHardDeleteTicket(ticket, nowMs));
        if (remaining.length !== current.length) {
          saveTicketsToStorage(remaining);
        }
        return remaining;
      });
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedTicket(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  // Delete or mark attended handler: removes ticket from state & localStorage
  const handleDeleteTicket = (ticketToRemove) => {
    const targetKey = ticketToRemove.reference || ticketToRemove.id;
    setTickets((current) => {
      const updated = current.filter((item) => (item.reference || item.id) !== targetKey);
      saveTicketsToStorage(updated);
      return updated;
    });
    if (selectedTicket && (selectedTicket.reference || selectedTicket.id) === targetKey) {
      setSelectedTicket(null);
    }
  };

  // Refund claim handler: keeps proof of payment & logs refund request
  const handleRequestRefund = (targetTicket, reason) => {
    const refundRef = `RFD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setTickets((current) => {
      const updated = current.map((item) => {
        if ((item.reference || item.id) !== (targetTicket.reference || targetTicket.id)) return item;
        const nextItem = {
          ...item,
          refundStatus: 'requested',
          refundReason: reason,
          refundRef,
          refundRequestedAt: new Date().toISOString()
        };
        setSelectedTicket(nextItem);
        return nextItem;
      });
      saveTicketsToStorage(updated);
      return updated;
    });
  };

  const nowMs = Date.now();

  const upcomingTickets = useMemo(
    () =>
      tickets
        .filter((ticket) => !hasEventEnded(ticket, nowMs) && !ticket.refundStatus)
        .sort((first, second) => first.date.localeCompare(second.date)),
    [tickets, nowMs]
  );

  // Unattended paid tickets & pending refund claims stay here for 7 days
  const unattendedPastTickets = useMemo(
    () =>
      tickets
        .filter((ticket) => hasEventEnded(ticket, nowMs) || Boolean(ticket.refundStatus))
        .sort((first, second) => second.date.localeCompare(first.date)),
    [tickets, nowMs]
  );

  const activeList = activeTab === 'upcoming' ? upcomingTickets : unattendedPastTickets;

  const dateFilteredTickets = useMemo(
    () =>
      activeTab === 'upcoming' && selectedDate !== 'all'
        ? activeList.filter((ticket) => ticket.date === selectedDate)
        : activeList,
    [activeTab, activeList, selectedDate]
  );

  const visibleTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return dateFilteredTickets;

    return dateFilteredTickets.filter((ticket) =>
      [ticket.title, ticket.venue, ticket.neighborhood, ticket.reference, ticket.ticketType]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [dateFilteredTickets, searchQuery]);

  const selectableDates = Array.from({ length: 7 }, (_, offset) => getNairobiDate(offset));

  return (
    <Sidebar>
      <div className="flex min-w-0 flex-col">
        <section className="my-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[9px] font-extrabold tracking-[1.6px] text-[#d2ff38]">YOUR NIGHTS, ALL IN ONE PLACE</p>
            <h1 className="text-[26px] font-bold leading-tight sm:text-[30px]">Good nights, locked in.</h1>
            <p className="mt-1 text-[12px] text-[#8b909a]">
              Attended passes auto-delete after the event. Unused paid tickets stay for 7 days if you need a refund.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] text-[#b3b5ae]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d2ff38]" />
            {upcomingTickets.length} active {upcomingTickets.length === 1 ? 'ticket' : 'tickets'}
          </div>
        </section>

        <div className="grid min-w-0 flex-1 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(250px,.95fr)] xl:gap-6">
          <section aria-label="Your tickets" className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  aria-pressed={activeTab === 'upcoming'}
                  className={`rounded-full px-4 py-2 text-[10px] font-bold transition ${
                    activeTab === 'upcoming' ? 'bg-[#d2ff38] text-[#11130d]' : 'bg-white/[0.06] text-[#a1a39c] hover:bg-white/10'
                  }`}
                  onClick={() => setActiveTab('upcoming')}
                  type="button"
                >
                  Active · {upcomingTickets.length}
                </button>
                <button
                  aria-pressed={activeTab === 'past'}
                  className={`rounded-full px-4 py-2 text-[10px] font-semibold transition ${
                    activeTab === 'past' ? 'bg-amber-300 text-[#11130d]' : 'bg-white/[0.06] text-[#a1a39c] hover:bg-white/10'
                  }`}
                  onClick={() => setActiveTab('past')}
                  type="button"
                >
                  Unattended / Refunds · {unattendedPastTickets.length}
                </button>
              </div>
              <label className="flex w-full items-center gap-2 rounded-full border border-white/[0.08] bg-[#14171a] px-3 py-2 sm:ml-auto sm:w-[220px]">
                <span aria-hidden="true" className="text-[12px] text-[#858880]">⌕</span>
                <span className="sr-only">Search tickets</span>
                <input
                  className="min-w-0 flex-1 bg-transparent text-[10px] text-white outline-none placeholder:text-[#777a72]"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Event, venue or reference"
                  type="search"
                  value={searchQuery}
                />
                {searchQuery && (
                  <button
                    aria-label="Clear ticket search"
                    className="text-[13px] text-[#999b94] hover:text-white"
                    onClick={() => setSearchQuery('')}
                    type="button"
                  >
                    ×
                  </button>
                )}
              </label>
            </div>

            {activeTab === 'upcoming' && (
              <section aria-label="Choose an upcoming date" className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-[9px] font-extrabold tracking-[1.3px] text-[#8b909a]">UPCOMING DATES</h2>
                  <span className="text-[9px] text-[#777a72]">Nairobi time · next 7 days</span>
                </div>
                <div className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group">
                  <button
                    aria-pressed={selectedDate === 'all'}
                    className={`flex w-[82px] shrink-0 snap-start flex-col items-center justify-center rounded-[11px] border px-2 py-2.5 transition ${selectedDate === 'all' ? 'border-[#d2ff38] bg-[#d2ff38] text-[#11130d]' : 'border-white/[0.08] bg-[#15171a] text-[#aeb0a9] hover:border-white/20'}`}
                    onClick={() => setSelectedDate('all')}
                    type="button"
                  >
                    <span className="text-[8px] font-extrabold tracking-[.8px]">ALL</span>
                    <span className="mt-0.5 text-[12px] font-bold">Dates</span>
                    <span className="mt-1 text-[8px]">{upcomingTickets.length} nights</span>
                  </button>
                  {selectableDates.map((date) => {
                    const isSelected = selectedDate === date;
                    const isToday = date === getNairobiDate();
                    const dateValue = new Date(`${date}T12:00:00+03:00`);
                    const weekday = new Intl.DateTimeFormat('en-KE', { timeZone: NAIROBI_TIME_ZONE, weekday: 'short' }).format(dateValue);
                    const day = new Intl.DateTimeFormat('en-KE', { timeZone: NAIROBI_TIME_ZONE, day: '2-digit' }).format(dateValue);
                    const month = new Intl.DateTimeFormat('en-KE', { timeZone: NAIROBI_TIME_ZONE, month: 'short' }).format(dateValue);
                    const dayCount = upcomingTickets.filter((ticket) => ticket.date === date).length;

                    return (
                      <button
                        aria-pressed={isSelected}
                        className={`flex w-[72px] shrink-0 snap-start flex-col items-center rounded-[11px] border px-2 py-2.5 transition ${isSelected ? 'border-[#d2ff38] bg-[#d2ff38] text-[#11130d]' : 'border-white/[0.08] bg-[#15171a] text-[#aeb0a9] hover:border-white/20'}`}
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        type="button"
                      >
                        <span className="text-[8px] font-extrabold uppercase tracking-[.7px]">{isToday ? 'TODAY' : weekday}</span>
                        <span className="mt-0.5 text-[17px] font-extrabold leading-tight">{day}</span>
                        <span className="text-[8px]">{month} · {dayCount} {dayCount === 1 ? 'night' : 'nights'}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {ticketsLoading ? (
              <div aria-label="Loading tickets" className="h-40 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]" />
            ) : visibleTickets.length ? (
              <div className="flex flex-col gap-2.5">
                {visibleTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.reference || ticket.id}
                    onDelete={handleDeleteTicket}
                    onShow={setSelectedTicket}
                    ticket={ticket}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[230px] flex-col items-center justify-center rounded-[13px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                <span className="mb-3 text-[26px] text-[#d2ff38]">✳</span>
                <h2 className="text-[16px] font-bold">
                  {activeList.length || searchQuery
                    ? 'No matching tickets.'
                    : activeTab === 'upcoming'
                    ? 'No active tickets yet.'
                    : 'No unattended tickets or refund claims.'}
                </h2>
                <p className="mt-1 max-w-[280px] text-[11px] leading-relaxed text-[#8b909a]">
                  {activeList.length || searchQuery
                    ? 'Try another date, event, venue or ticket reference.'
                    : activeTab === 'upcoming'
                    ? 'Check out on an event and your QR pass will appear here automatically.'
                    : 'Used tickets clear after the event. Unused paid passes appear here for 7 days if you need a refund.'}
                </p>
                {activeList.length ? (
                  <button
                    className="mt-4 rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-white/5"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDate('all');
                    }}
                    type="button"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    className="mt-4 rounded-full bg-[#d2ff38] px-4 py-2.5 text-[10px] font-extrabold text-[#11130d]"
                    onClick={() => navigate('/')}
                    type="button"
                  >
                    Explore nights <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-3">
            <section className="rounded-[13px] border border-[#a58be8]/15 bg-[#201b2b] p-4 sm:p-5">
              <span className="text-[8px] font-extrabold tracking-[1.3px] text-[#c3a9ff]">TICKET LIFECYCLE</span>
              <h2 className="mt-2 text-[17px] font-bold leading-tight">Protected<br />by design.</h2>
              <ol className="mt-4 flex flex-col gap-3">
                {[
                  ['01', 'Gate scan clears pass', 'Once scanned at the door, your used ticket auto-deletes after the event.'],
                  ['02', 'Missed the night?', 'Unused paid tickets stay in Unattended / Refunds for 7 days with your M-Pesa receipt.'],
                  ['03', 'Instant refund claim', 'Submit a refund right from your ticket receipt with one tap.']
                ].map(([number, title, detail]) => (
                  <li className="grid grid-cols-[22px_1fr] gap-2" key={number}>
                    <span className="pt-0.5 font-mono text-[9px] font-bold text-[#c3a9ff]">{number}</span>
                    <div>
                      <p className="text-[10px] font-bold text-white">{title}</p>
                      <p className="mt-0.5 text-[9px] leading-relaxed text-[#a39aaf]">{detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-[12px] border border-[#d2ff38]/10 bg-[#151811] p-4">
              <p className="text-[9px] font-bold tracking-[1px] text-[#d2ff38]">TONIGHT IN NAIROBI</p>
              <p className="mt-1.5 text-[11px] font-semibold text-white">Your night is on EAT.</p>
              <p className="mt-1 text-[9px] leading-relaxed text-[#8b909a]">
                Ticket expiry & refund windows run on East Africa Time (UTC+3).
              </p>
              <span className="mt-3 block font-mono text-[19px] font-bold text-white">
                {clock}<span className="ml-1.5 text-[9px] font-semibold tracking-wider text-[#d2ff38]">EAT</span>
              </span>
            </section>
          </aside>
        </div>

        {selectedTicket && (
          <TicketDetails
            onClose={() => setSelectedTicket(null)}
            onDelete={handleDeleteTicket}
            onMarkAttended={handleDeleteTicket}
            onRequestRefund={handleRequestRefund}
            ticket={selectedTicket}
          />
        )}
      </div>
    </Sidebar>
  );
}