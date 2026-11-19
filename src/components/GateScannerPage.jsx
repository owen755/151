import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const TICKETS_STORAGE_KEY = 'aftr_my_tickets';

function readTickets() {
  try {
    const raw = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveTickets(list) {
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('aftr:tickets-updated'));
  } catch {
    // Ignore storage errors
  }
}

// Extracts a ticket reference or ticketId from either a raw reference ("AFTR-7K2M-91QX")
// or the JSON string encoded inside the QR code.
function parseScanInput(rawValue) {
  const trimmed = String(rawValue || '').trim();
  if (!trimmed) return { reference: '', ticketId: '' };

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      return {
        reference: String(parsed.reference || '').trim().toUpperCase(),
        ticketId: String(parsed.ticketId || '').trim()
      };
    }
  } catch {
    // Not JSON; treat as a direct reference code
  }

  return { reference: trimmed.toUpperCase(), ticketId: trimmed };
}

export default function GateScannerPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState(readTickets);
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null); // { type: 'valid' | 'used' | 'invalid', title, detail, ticket }

  // Optional live camera QR scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const refresh = () => setTickets(readTickets());
    window.addEventListener('aftr:tickets-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('aftr:tickets-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const stopCamera = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const verifyAndAdmit = (rawValue) => {
    const { reference, ticketId } = parseScanInput(rawValue);
    if (!reference && !ticketId) {
      setScanResult({
        type: 'invalid',
        title: 'Enter a ticket code',
        detail: 'Scan a QR code or type an entry reference like AFTR-7K2M-91QX.'
      });
      return;
    }

    const currentList = readTickets();
    const matchedIndex = currentList.findIndex(
      (t) =>
        (reference && String(t.reference || '').toUpperCase() === reference) ||
        (ticketId && String(t.id || '') === ticketId)
    );

    if (matchedIndex === -1) {
      setScanResult({
        type: 'invalid',
        title: 'Ticket not found',
        detail: `No pass matching "${reference || ticketId}" exists in this session.`
      });
      return;
    }

    const target = currentList[matchedIndex];
    if (String(target.status || '').toLowerCase() === 'attended') {
      setScanResult({
        type: 'used',
        title: 'Already scanned at gate',
        detail: `${target.title} (${target.reference}) was already checked in${
          target.scannedAt ? ` at ${target.scannedAt}` : ''
        }.`,
        ticket: target
      });
      return;
    }

    const scannedTime = new Date().toLocaleTimeString('en-KE', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit'
    });

    const updatedTicket = {
      ...target,
      status: 'Attended',
      scannedAt: `${scannedTime} EAT`
    };

    const nextList = [...currentList];
    nextList[matchedIndex] = updatedTicket;
    saveTickets(nextList);
    setTickets(nextList);
    setScanInput('');

    setScanResult({
      type: 'valid',
      title: 'Valid pass — Admit guest',
      detail: `${updatedTicket.quantity} × ${updatedTicket.ticketType} · ${updatedTicket.attendeeName || 'Guest'}`,
      ticket: updatedTicket
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    verifyAndAdmit(scanInput);
  };

  const startCameraScanner = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof window.BarcodeDetector === 'undefined') {
      setCameraError(
        'Live camera QR detection is not supported in this browser. Paste the QR text or type the AFTR reference below.'
      );
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            stopCamera();
            verifyAndAdmit(barcodes[0].rawValue);
            return;
          }
        } catch {
          // Keep scanning frames
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch {
      stopCamera();
      setCameraError('Could not access camera. Use the reference code input below.');
    }
  };

  const confirmedCount = tickets.filter(
    (t) => String(t.status || '').toLowerCase() !== 'attended'
  ).length;
  const attendedCount = tickets.filter(
    (t) => String(t.status || '').toLowerCase() === 'attended'
  ).length;

  return (
    <Sidebar>
      <main className="mx-auto w-full max-w-[960px] py-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold tracking-[1.6px] text-[#d2ff38]">
              ORGANIZER DOOR CHECK-IN
            </p>
            <h1 className="mt-1 text-[26px] font-bold tracking-tight text-white sm:text-[32px]">
              Gate scanner.
            </h1>
            <p className="mt-1 text-[12px] text-[#8b909a]">
              Scan or verify entry passes at the door. Checked-in tickets are marked Attended and auto-clear after the event.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="rounded-full border border-[#d2ff38]/25 bg-[#d2ff38]/10 px-3 py-1.5 font-bold text-[#d2ff38]">
              {confirmedCount} Awaiting entry
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-bold text-[#aeb0a9]">
              {attendedCount} Checked in
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          {/* Left: Scanner & Lookup */}
          <section className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#131519] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-white">Verify entry pass</h2>
              <button
                type="button"
                onClick={cameraActive ? stopCamera : startCameraScanner}
                className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:border-[#d2ff38]/50 hover:text-[#d2ff38]"
              >
                {cameraActive ? 'Stop camera' : 'Use camera QR'}
              </button>
            </div>

            {cameraActive && (
              <div className="overflow-hidden rounded-xl border border-[#d2ff38]/40 bg-black">
                <video ref={videoRef} className="h-56 w-full object-cover" muted playsInline />
              </div>
            )}

            {cameraError && (
              <p className="rounded-xl border border-white/10 bg-[#0e1013] p-3 text-[11px] text-[#9a9d94]">
                {cameraError}
              </p>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <label className="block text-[10px] font-bold tracking-wider text-[#aeb0a9]">
                ENTRY REFERENCE OR SCANNED QR PAYLOAD
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="e.g. AFTR-7K2M-91QX"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0e1013] px-3.5 py-3 font-mono text-[12px] uppercase text-white outline-none transition focus:border-[#d2ff38]/60"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-full bg-[#d2ff38] px-5 py-3 text-[12px] font-extrabold text-[#11130d] transition hover:brightness-105"
              >
                Scan & check in guest
              </button>
            </form>

            {scanResult && (
              <div
                aria-live="polite"
                className={`rounded-2xl border p-4 ${
                  scanResult.type === 'valid'
                    ? 'border-[#d2ff38]/40 bg-[#1e2418] text-[#d2ff38]'
                    : scanResult.type === 'used'
                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                    : 'border-red-400/35 bg-red-400/10 text-red-300'
                }`}
              >
                <p className="text-[13px] font-extrabold">{scanResult.title}</p>
                <p className="mt-1 text-[11px] opacity-90">{scanResult.detail}</p>
                {scanResult.ticket && (
                  <p className="mt-2 font-mono text-[11px] text-white">
                    {scanResult.ticket.title} · {scanResult.ticket.reference}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Right: Active Guest Passes in Session */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#131519] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-white">Issued passes</h2>
              <button
                type="button"
                onClick={() => navigate('/my-tickets')}
                className="text-[11px] font-semibold text-[#d2ff38] hover:underline"
              >
                View wallet →
              </button>
            </div>

            {tickets.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 bg-[#0e1013] p-6 text-center text-[11px] text-[#8b909a]">
                No tickets issued yet. Complete a booking on Checkout first, then verify it here.
              </p>
            ) : (
              <div className="space-y-2.5">
                {tickets.map((ticket) => {
                  const isAttended = String(ticket.status || '').toLowerCase() === 'attended';
                  return (
                    <div
                      key={ticket.reference || ticket.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#0e1013] p-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold text-white">{ticket.title}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-[#8b909a]">
                          {ticket.reference} · {ticket.quantity} × {ticket.ticketType}
                        </p>
                      </div>

                      {isAttended ? (
                        <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold text-[#a6a8a1]">
                          ATTENDED
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => verifyAndAdmit(ticket.reference)}
                          className="shrink-0 rounded-full bg-[#d2ff38] px-3 py-1.5 text-[10px] font-extrabold text-[#11130d] transition hover:brightness-105"
                        >
                          Check in
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </Sidebar>
  );
}