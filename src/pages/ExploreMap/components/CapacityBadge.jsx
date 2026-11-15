export default function CapacityBadge({ spotsLeft, capacity }) {
  let label = `${spotsLeft} spots left`
  let style = 'border-[#2a2c2f] text-neutral-400'

  if (spotsLeft === 0) {
    label = 'Sold out'
    style = 'border-red-500/40 text-red-400'
  } else if (spotsLeft / capacity <= 0.15) {
    label = 'Filling fast'
    style = 'border-orange-400/40 bg-orange-400/10 text-orange-400'
  }

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${style}`}>
      {label}
    </span>
  )
}
