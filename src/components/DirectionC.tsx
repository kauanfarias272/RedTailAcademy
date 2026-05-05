import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export const directionC = {
  bg: '#0e0a08',
  bgElev: '#1a120e',
  surface: '#1f1410',
  surfaceHi: '#2a1a14',
  border: 'rgba(245, 234, 214, 0.10)',
  borderStrong: 'rgba(245, 234, 214, 0.20)',
  ink: '#f5ead6',
  inkDim: 'rgba(245, 234, 214, 0.68)',
  inkMute: 'rgba(245, 234, 214, 0.42)',
  red: '#c1272d',
  redDeep: '#8b1a1f',
  redSoft: 'rgba(193, 39, 45, 0.20)',
  redGlow: 'rgba(193, 39, 45, 0.45)',
  gold: '#d4a04a',
  goldSoft: 'rgba(212, 160, 74, 0.22)',
  jade: '#5a8b6a',
  jadeSoft: 'rgba(90, 139, 106, 0.20)',
  serif: "'Noto Serif SC', 'Songti SC', serif",
  sans: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
  hanzi: "'Noto Serif SC', 'Noto Sans SC', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
}

function HudChip({
  symbol,
  value,
  label,
  accent,
}: {
  symbol: string
  value: number
  label?: string
  accent: string
}) {
  return (
    <div className="c-hud-chip" style={{ borderColor: `${accent}55`, boxShadow: `0 0 10px ${accent}22` }}>
      <span className="c-hud-symbol" style={{ color: accent }}>{symbol}</span>
      <span className="c-hud-value">{value}</span>
      {label ? <span className="c-hud-label">{label}</span> : null}
    </div>
  )
}

export function DirectionCHeader({
  phaseTag,
  title,
  titleAccent,
  sub,
  errors = 0,
  coins,
  streak,
  freeze,
  utilitySlot,
}: {
  phaseTag?: string
  title: string
  titleAccent?: string
  sub?: string
  errors?: number
  coins: number
  streak: number
  freeze: number
  utilitySlot?: ReactNode
}) {
  return (
    <header className="directionc-header">
      {utilitySlot ? <div className="directionc-utility">{utilitySlot}</div> : null}
      <div className="directionc-header-top">
        <div className="directionc-seal-row">
          <div className="directionc-seal">印</div>
          {phaseTag ? <div className="directionc-phase">{phaseTag}</div> : null}
        </div>

        <div className="directionc-hud">
          <HudChip symbol="◎" value={coins} accent={directionC.gold} />
          <HudChip symbol="火" value={streak} accent={directionC.red} />
          <HudChip symbol="❄" value={freeze} accent={directionC.jade} />
        </div>
      </div>

      <h1 className="directionc-title">
        {title} {titleAccent ? <span>{titleAccent}</span> : null}
      </h1>
      {sub ? <p className="directionc-subtitle">{sub}</p> : null}
      {errors > 0 ? (
        <div className="directionc-error-strip">
          <span className="directionc-error-icon">⚠</span>
          <span>
            <strong>{errors} erros</strong> bloqueiam a evolucao do Koi
          </span>
        </div>
      ) : null}
    </header>
  )
}

export function DirectionCNavButton({
  Icon,
  label,
  active,
  badge = 0,
  symbol,
}: {
  Icon: LucideIcon
  label: string
  active: boolean
  badge?: number
  symbol?: string
}) {
  return (
    <div className="directionc-nav-content">
      <div className={active ? 'directionc-nav-icon active' : 'directionc-nav-icon'}>
        {symbol ? <span className="directionc-nav-symbol">{symbol}</span> : <Icon size={16} strokeWidth={2.2} />}
        {badge > 0 ? <span className="directionc-nav-badge">{badge}</span> : null}
      </div>
      <span>{label}</span>
    </div>
  )
}

export function DirectionCPanel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={`c-panel ${className}`.trim()}>{children}</section>
}

export function DirectionCStat({
  label,
  value,
  color = directionC.gold,
  warn = false,
}: {
  label: string
  value: string | number
  color?: string
  warn?: boolean
}) {
  return (
    <div className={warn ? 'c-stat warn' : 'c-stat'} style={{ borderColor: warn ? directionC.red : `${color}44` }}>
      <span style={{ color }}>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
