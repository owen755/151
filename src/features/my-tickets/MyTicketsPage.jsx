import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '../../components/Sidebar';

const TICKETS_STORAGE_KEY = 'aftr_my_tickets';
const NAIROBI_TIME_ZONE = 'Africa/Nairobi';

const ticketArtwork = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=85'
];

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

function createExampleTickets() {
  return [
    {
      id: 'AF-24831',
      title: 'Above the city.',
      subtitle: 'Rooftop sessions · 8 PM – late',
      venue: 'The Alchemist Deck',
      neighborhood: 'Westlands, Nairobi',
      date: getNairobiDate(2),
      time: '20:00',
      image: ticketArtwork[0],
      price: 2400,
      quantity: 2,
      ticketType: 'General admission',
      status: 'Confirmed',
      reference: 'AFTR-7K2M-91QX'
    },
    {
      id: 'AF-24832',
      title: 'Disco, not dead.',
      subtitle: '1 ticket · Free RSVP · 9 PM',
      venue: '1824 Secret Courtyard',
      neighborhood: 'Kilimani, Nairobi',
      date: getNairobiDate(5),
      time: '21:00',
      image: ticketArtwork[1],
      price: 0,
      quantity: 1,
      ticketType: 'Free RSVP',
      status: 'Confirmed',
      reference: 'AFTR-4P8N-22LD'
    },
    {
      id: 'AF-24833',
      title: 'Muze after hours.',
      subtitle: 'Tonight · 9 PM – late',
      venue: 'Muze Open Air',
      neighborhood: 'Lavington, Nairobi',
      date: getNairobiDate(0),
      time: '21:00',
      image: ticketArtwork[2],
      price: 1800,
      quantity: 2,
      ticketType: 'Dance floor',
      status: 'Confirmed',
      reference: 'AFTR-6M4C-18TX'
    },
    {
      id: 'AF-24834',
      title: 'Afrohouse afterglow.',
      subtitle: 'Afrohouse · 8 PM – late',
      venue: 'K1 Klubhouse Vault',
      neighborhood: 'Westlands, Nairobi',
      date: getNairobiDate(1),
      time: '20:00',
      image: ticketArtwork[0],
      price: 1200,
      quantity: 1,
      ticketType: 'General admission',
      status: 'Confirmed',
      reference: 'AFTR-3H9D-41PV'
    },
    {
      id: 'AF-24835',
      title: 'Skyline sessions.',
      subtitle: 'Rooftop set · 7 PM – late',
      venue: 'SkyLuxx Panorama Lounge',
      neighborhood: 'Westlands, Nairobi',
      date: getNairobiDate(3),
      time: '19:00',
      image: ticketArtwork[1],
      price: 2500,
      quantity: 2,
      ticketType: 'Rooftop entry',
      status: 'Confirmed',
      reference: 'AFTR-5R2L-73QW'
    },
    {
      id: 'AF-24836',
      title: 'Sunday sundowner.',
      subtitle: 'Garden party · 4 PM – late',
      venue: 'Karen Oasis Villa',
      neighborhood: 'Karen, Nairobi',
      date: getNairobiDate(4),
      time: '16:00',
      image: ticketArtwork[2],
      price: 1000,
      quantity: 1,
      ticketType: 'Garden entry',
      status: 'Confirmed',
      reference: 'AFTR-8J6N-24BK'
    },
    {
      id: 'AF-24837',
      title: 'Bassline archive.',
      subtitle: 'Warehouse set · 10 PM – late',
      venue: 'The Mist, Ngong Road',
      neighborhood: 'Ngong Road, Nairobi',
      date: getNairobiDate(6),
      time: '22:00',
      image: ticketArtwork[0],
      price: 1500,
      quantity: 1,
      ticketType: 'Standard entry',
      status: 'Confirmed',
      reference: 'AFTR-2X7F-65MN'
    },
    {
      id: 'AF-24104',
      title: 'Basement frequencies',
      subtitle: 'Last Saturday · 11 PM – late',
      venue: 'K1 Klubhouse Vault',
      neighborhood: 'Westlands, Nairobi',
      date: getNairobiDate(-7),
      time: '23:00',
      image: ticketArtwork[2],
      price: 1500,
      quantity: 1,
      ticketType: 'Standard entry',
      status: 'Attended',
      reference: 'AFTR-9W3B-61RJ'
    }
  ];
}

function readTickets() {
  try {
    const storedTickets = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || 'null');
    if (!Array.isArray(storedTickets) || !storedTickets.length) return createExampleTickets();

    const exampleTickets = createExampleTickets();
    const exampleIds = new Set(exampleTickets.map((ticket) => ticket.id));
    return [...exampleTickets, ...storedTickets.filter((ticket) => !exampleIds.has(ticket.id))];
  } catch {
    return createExampleTickets();
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

function TicketDetails({ ticket, onClose }) {
  const [shareMessage, setShareMessage] = useState('');

  const handleDownload = () => {
    const contents = [
      'AFTR | EVENT TICKET',
      `Event: ${ticket.title}`,
      `Date: ${formatEventDate(ticket.date, { year: 'numeric' })}`,
      `Time: ${ticket.time} EAT`,
      `Venue: ${ticket.venue}, ${ticket.neighborhood}`,
      `Ticket type: ${ticket.ticketType}`,
      `Quantity: ${ticket.quantity}`,
      `Reference: ${ticket.reference}`
    ].join('\n');
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
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#d2ff38] px-2.5 py-1 text-[9px] font-extrabold tracking-[1.2px] text-[#11130d]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#11130d]" />
              {ticket.status.toUpperCase()}
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
              <p className="text-[12px] text-[#55584c]">{ticket.time} EAT · Nairobi time</p>
            </div>
            <div>
              <p className="text-[9px] font-extrabold tracking-[1.3px] text-[#707366]">TICKET</p>
              <p className="mt-1 text-[13px] font-bold">{ticket.quantity} × {ticket.ticketType}</p>
              <p className="text-[12px] text-[#55584c]">{formatPrice(ticket.price)} per ticket</p>
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
              <p className="mt-1 text-[10px] text-[#707366]">Keep this reference ready at the door.</p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <QRCodeSVG
                aria-label={`Demo entry QR code for ${ticket.reference}`}
                bgColor="#f7f7f0"
                fgColor="#17191a"
                level="M"
                size={76}
                title={`Demo entry QR code for ${ticket.reference}`}
                value={JSON.stringify({ type: 'aftr-demo-ticket', reference: ticket.reference, ticketId: ticket.id })}
              />
              <span className="text-[7px] font-extrabold tracking-[.8px] text-[#707366]">DEMO ENTRY QR</span>
            </div>
          </div>
        </div>

        <div className="ticket-actions grid grid-cols-2 gap-2 p-4 sm:flex sm:flex-wrap sm:p-5">
          <button
            className="rounded-full bg-[#d2ff38] px-3 py-3 text-[11px] font-extrabold text-[#11130d] transition hover:brightness-105 sm:flex-1 sm:px-4 sm:text-[12px]"
            onClick={() => window.print()}
            type="button"
          >
            Print ticket
          </button>
          <button
            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-3 text-[11px] font-semibold text-white transition hover:bg-white/10 sm:px-4"
            onClick={handleAddToCalendar}
            type="button"
          >
            Add to calendar
          </button>
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
            <><span aria-hidden="true">↗</span><span>Share</span></>
          </button>
        </div>
        {shareMessage && <p aria-live="polite" className="ticket-share-feedback px-5 pb-4 text-center text-[10px] text-[#d2ff38]">{shareMessage}</p>}
      </section>
    </div>
  );
}

function TicketCard({ ticket, onShow }) {
  const isUpcoming = ticket.date >= getNairobiDate();

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
            <span className={`rounded-full px-2 py-1 text-[8px] font-extrabold tracking-[.9px] ${isUpcoming ? 'bg-[#273019] text-[#d2ff38]' : 'bg-white/[0.08] text-[#a6a8a1]'}`}>
              {isUpcoming ? 'CONFIRMED' : 'ATTENDED'}
            </span>
            <span className="text-[9px] font-medium text-[#92958d]">{ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'}</span>
          </div>
          <h2 className="truncate text-[19px] font-bold leading-tight text-white sm:text-[20px]">{ticket.title}</h2>
          <p className="mt-1 text-[11px] text-[#a2a49d]">{ticket.subtitle}</p>
          <p className="mt-3 truncate text-[11px] text-[#c5c6bf]">
            <span className="mr-1.5 text-[#d2ff38]">⌖</span>{ticket.venue} <span className="text-[#777a72]">· {ticket.neighborhood}</span>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
          <div>
            <span className="block text-[8px] font-bold tracking-[1px] text-[#777a72]">{isUpcoming ? 'TOTAL PAID' : 'TICKET VALUE'}</span>
            <span className="text-[12px] font-bold text-white">{formatPrice(Number(ticket.price) * Number(ticket.quantity))}</span>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-[#d2ff38] px-4 py-2.5 text-[10px] font-extrabold text-[#11130d] transition hover:brightness-105 active:scale-[.98]"
            onClick={() => onShow(ticket)}
            type="button"
          >
            Show ticket <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [tickets] = useState(readTickets);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [clock, setClock] = useState(getNairobiClock);

  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // Ticket previews remain available when browser storage is disabled.
    }
  }, [tickets]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(getNairobiClock()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedTicket(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const upcomingTickets = useMemo(
    () => tickets.filter((ticket) => ticket.date >= getNairobiDate()).sort((first, second) => first.date.localeCompare(second.date)),
    [tickets]
  );
  const pastTickets = useMemo(
    () => tickets.filter((ticket) => ticket.date < getNairobiDate()).sort((first, second) => second.date.localeCompare(first.date)),
    [tickets]
  );
  const activeTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;
  const dateFilteredTickets = useMemo(
    () => activeTab === 'upcoming' && selectedDate !== 'all'
      ? activeTickets.filter((ticket) => ticket.date === selectedDate)
      : activeTickets,
    [activeTab, activeTickets, selectedDate]
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
            <p className="mt-1 text-[12px] text-[#8b909a]">Your plans are set. We’ll see you out there.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] text-[#b3b5ae]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d2ff38]" />{upcomingTickets.length} upcoming {upcomingTickets.length === 1 ? 'night' : 'nights'}
          </div>
        </section>

        <div className="grid min-w-0 flex-1 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(250px,.95fr)] xl:gap-6">
          <section aria-label="Your tickets" className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button aria-pressed={activeTab === 'upcoming'} className={`rounded-full px-4 py-2 text-[10px] font-bold transition ${activeTab === 'upcoming' ? 'bg-[#d2ff38] text-[#11130d]' : 'bg-white/[0.06] text-[#a1a39c] hover:bg-white/10'}`} onClick={() => setActiveTab('upcoming')} type="button">Upcoming · {upcomingTickets.length}</button>
                <button aria-pressed={activeTab === 'past'} className={`rounded-full px-4 py-2 text-[10px] font-semibold transition ${activeTab === 'past' ? 'bg-[#d2ff38] text-[#11130d]' : 'bg-white/[0.06] text-[#a1a39c] hover:bg-white/10'}`} onClick={() => setActiveTab('past')} type="button">Past · {pastTickets.length}</button>
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
                {searchQuery && <button aria-label="Clear ticket search" className="text-[13px] text-[#999b94] hover:text-white" onClick={() => setSearchQuery('')} type="button">×</button>}
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

            {visibleTickets.length ? (
              <div className="flex flex-col gap-2.5">
                {visibleTickets.map((ticket) => <TicketCard key={ticket.id} onShow={setSelectedTicket} ticket={ticket} />)}
              </div>
            ) : (
              <div className="flex min-h-[230px] flex-col items-center justify-center rounded-[13px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                <span className="mb-3 text-[26px] text-[#d2ff38]">✳</span>
                <h2 className="text-[16px] font-bold">{dateFilteredTickets.length || searchQuery ? 'No matching tickets.' : `No ${activeTab} tickets yet.`}</h2>
                <p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-[#8b909a]">{dateFilteredTickets.length || searchQuery ? 'Try another date, event, venue or ticket reference.' : 'Find a night that feels right and your tickets will be waiting here.'}</p>
                {activeTickets.length ? (
                  <button className="mt-4 rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-white/5" onClick={() => { setSearchQuery(''); setSelectedDate('all'); }} type="button">Clear filters</button>
                ) : (
                  <button className="mt-4 rounded-full bg-[#d2ff38] px-4 py-2.5 text-[10px] font-extrabold text-[#11130d]" onClick={() => navigate('/')} type="button">Explore nights <span aria-hidden="true">→</span></button>
                )}
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-3">
            <section className="rounded-[13px] border border-[#a58be8]/15 bg-[#201b2b] p-4 sm:p-5">
              <span className="text-[8px] font-extrabold tracking-[1.3px] text-[#c3a9ff]">BEFORE YOU HEAD OUT</span>
              <h2 className="mt-2 text-[17px] font-bold leading-tight">Less admin.<br />More dancing.</h2>
              <ol className="mt-4 flex flex-col gap-3">
                {[
                  ['01', 'Keep your ticket handy', 'Open your ticket before you reach the door.'],
                  ['02', 'Bring your ID', 'Some venues check your age at entry.'],
                  ['03', 'Bring your people', 'Send the ticket before they head out.']
                ].map(([number, title, detail]) => (
                  <li className="grid grid-cols-[22px_1fr] gap-2" key={number}>
                    <span className="pt-0.5 font-mono text-[9px] font-bold text-[#c3a9ff]">{number}</span>
                    <div><p className="text-[10px] font-bold text-white">{title}</p><p className="mt-0.5 text-[9px] leading-relaxed text-[#a39aaf]">{detail}</p></div>
                  </li>
                ))}
              </ol>
            </section>

            <button className="group flex items-center justify-between rounded-[12px] border border-white/[0.07] bg-[#17191b] p-4 text-left transition hover:border-[#d2ff38]/20" onClick={() => navigate('/help')} type="button">
              <span><span className="block text-[11px] font-bold text-white">Plans changed?</span><span className="mt-1 block text-[9px] text-[#92958d]">Get help with your booking <span className="text-[#d2ff38]">↗</span></span></span>
              <span aria-hidden="true" className="text-[#777a72] transition group-hover:translate-x-0.5 group-hover:text-[#d2ff38]">→</span>
            </button>

            <section className="rounded-[12px] border border-[#d2ff38]/10 bg-[#151811] p-4">
              <p className="text-[9px] font-bold tracking-[1px] text-[#d2ff38]">TONIGHT IN NAIROBI</p>
              <p className="mt-1.5 text-[11px] font-semibold text-white">Your night is on EAT.</p>
              <p className="mt-1 text-[9px] leading-relaxed text-[#8b909a]">All ticket times are shown in East Africa Time (UTC+3).</p>
              <span className="mt-3 block font-mono text-[19px] font-bold text-white">{clock}<span className="ml-1.5 text-[9px] font-semibold tracking-wider text-[#d2ff38]">EAT</span></span>
            </section>
          </aside>
        </div>

      {selectedTicket && <TicketDetails onClose={() => setSelectedTicket(null)} ticket={selectedTicket} />}
      </div>
    </Sidebar>
  );
}