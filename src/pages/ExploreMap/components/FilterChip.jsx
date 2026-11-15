export default function FilterChip({ label, active = false, onClick }) {
  const base =
    'h-[38px] rounded-full border px-4 text-[13px] transition-colors cursor-pointer'
  const activeStyle =
    'border-[#c8f56a]/40 bg-[#c8f56a]/10 text-[#c8f56a]'
  const idleStyle =
    'border-[#2a2c2f] bg-[#1b1c1f] text-neutral-300 hover:border-neutral-500'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? activeStyle : idleStyle}`}
    >
      {label}
    </button>
  )
}
