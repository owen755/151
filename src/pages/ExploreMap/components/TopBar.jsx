export default function TopBar() {
  return (
    <div className="flex h-[60px] items-center justify-between border-b border-[#2a2c2f] px-4 sm:px-11">
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2 text-[13px] text-white"
      >
        <svg className="h-4 w-4 text-[#d2ff38]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        Nairobi, Kenya
        <svg className="h-3 w-3 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <p className="hidden text-[11px] text-neutral-400 md:block">
        A little spontaneous looks good on you.
      </p>

      <button type="button" aria-label="Notifications" className="cursor-pointer text-neutral-300">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
        </svg>
      </button>
    </div>
  )
}
