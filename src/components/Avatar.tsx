// Consistent placeholder gradient based on user id
const PALETTES = [
  { from: '#C4581A', to: '#F0C4A8' }, // terra
  { from: '#5C7A62', to: '#A8C4AA' }, // sage
  { from: '#7A5C3A', to: '#C4A882' }, // warm brown
  { from: '#3D5442', to: '#8CAA92' }, // sage-dark
]

function palette(userId: string) {
  const sum = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PALETTES[sum % PALETTES.length]
}

type Props = {
  photoUrl: string | null
  name: string
  userId: string
  size?: number
  className?: string
}

export default function Avatar({ photoUrl, name, userId, size = 48, className = '' }: Props) {
  const p = palette(userId)

  return (
    <div
      className={`rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
        >
          <span
            className="font-syne font-bold text-white select-none"
            style={{ fontSize: size * 0.38 }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}
