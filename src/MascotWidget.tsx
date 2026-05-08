import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  PENG_VARIANTS,
  STAGE_THRESHOLDS,
  type EvolutionStage,
  type MascotState,
  type MascotVariant,
  type PengVariantId,
  getMascotDialogue,
  getMascotVariant,
  getStageInfo,
  maxStageForPath,
  normalizeMascotState,
  stageProgress,
  xpToNextStage,
} from './mascot'

export function MascotWidget({
  mascot,
  onRename,
  onSwitchPath,
  onSwitchVariant,
  blockedByMistakes = 0,
  userLevel = 1,
  coins = 0,
  switchCost = 300,
  compact = false,
}: {
  mascot: MascotState
  onRename?: (name: string) => void
  onSwitchPath?: () => void
  onSwitchVariant?: (variantId: PengVariantId) => void
  blockedByMistakes?: number
  userLevel?: number
  coins?: number
  switchCost?: number
  compact?: boolean
}) {
  const safeMascot = useMemo(() => normalizeMascotState(mascot), [mascot])
  const [showDialogue, setShowDialogue] = useState(false)
  const [isNaming, setIsNaming] = useState(false)
  const [nameInput, setNameInput] = useState(safeMascot.name)

  const info = getStageInfo(safeMascot.stage, safeMascot.evolutionPath)
  const maxStage = maxStageForPath(safeMascot.evolutionPath)
  const progress = stageProgress(safeMascot.evoXp, safeMascot.stage, safeMascot.evolutionPath)
  const toNext = xpToNextStage(safeMascot.evoXp, safeMascot.stage, safeMascot.evolutionPath)
  const canSwitchPath = !!onSwitchPath && userLevel >= 10 && coins >= switchCost
  const nextPathLabel = safeMascot.evolutionPath === 'dragon' ? 'Peng' : 'Dragao'
  const finalStageLabel = safeMascot.evolutionPath === 'peng' ? 'Peng final' : 'Dragao completo'
  const dialogue = useMemo(() => getMascotDialogue(safeMascot), [safeMascot])

  useEffect(() => {
    setNameInput(safeMascot.name)
  }, [safeMascot.name])

  useEffect(() => {
    const openTimer = window.setTimeout(() => setShowDialogue(true), 0)
    const closeTimer = window.setTimeout(() => setShowDialogue(false), 6000)
    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(closeTimer)
    }
  }, [dialogue])

  function handleRename() {
    if (onRename && nameInput.trim()) {
      onRename(nameInput.trim())
    }
    setIsNaming(false)
  }

  if (compact) {
    return (
      <div className="mascot-compact" onClick={() => { setShowDialogue(true); setTimeout(() => setShowDialogue(false), 4000) }}>
        <MascotSprite mascot={safeMascot} className={`mascot-sprite-compact mascot-${safeMascot.animation}`} />
        <div className="mascot-compact-info">
          <span className="mascot-compact-name">{safeMascot.name}</span>
          <div className="mascot-evo-bar-compact">
            <span style={{ width: `${progress}%`, '--stage-color': info.color } as CSSProperties}></span>
          </div>
          {blockedByMistakes > 0 && <small className="mascot-lock-compact">{blockedByMistakes} erros</small>}
        </div>
        {showDialogue && (
          <div className="mascot-bubble-compact">
            <p>{dialogue}</p>
          </div>
        )}
      </div>
    )
  }

  const currentVariant = getMascotVariant(safeMascot)
  const nextStage = Math.min(safeMascot.stage + 1, maxStage) as EvolutionStage
  const stageXpStart = STAGE_THRESHOLDS[safeMascot.stage]
  const stageXpEnd = safeMascot.stage < maxStage ? STAGE_THRESHOLDS[nextStage] : stageXpStart
  const xpInStage = Math.max(0, safeMascot.evoXp - stageXpStart)
  const xpForStage = Math.max(1, stageXpEnd - stageXpStart)

  const MILESTONES = [
    { xp: 0,   lessons: 1,  icon: '🐣', label: 'Primeira lição',   sub: 'Começou a jornada' },
    { xp: 30,  lessons: 5,  icon: '🌊', label: 'Entrando no rio',  sub: 'Nível 2 atingido' },
    { xp: 80,  lessons: 10, icon: '⚡', label: 'Dez lições',       sub: 'Ritmo consolidado' },
    { xp: 160, lessons: 20, icon: '🔥', label: 'Koi desperto',     sub: 'Nível 4 atingido' },
    { xp: 280, lessons: 30, icon: '🏅', label: 'Ascendendo',       sub: 'Nível 5 atingido' },
    { xp: 440, lessons: 50, icon: '🐉', label: 'Essência desperta',sub: 'Nível 6 atingido' },
    { xp: 650, lessons: 75, icon: '🏆', label: 'Mestre do rio',    sub: 'Nível 7 atingido' },
  ]
  const earnedMilestones = MILESTONES.filter(
    (m) => safeMascot.evoXp >= m.xp && safeMascot.lessonsCompleted >= m.lessons
  )

  return (
    <section className="koi-widget">

      {/* ── Hero ── */}
      <div className="koi-hero">
        <div className="koi-hero-eyebrow">
          <span>Nível {safeMascot.stage}</span>
          <span className="koi-hero-dot">·</span>
          <span>{info.name}</span>
        </div>

        {isNaming ? (
          <div className="mascot-name-edit koi-hero-rename">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              maxLength={20}
              placeholder="Nome do seu koi..."
              autoFocus
            />
            <button type="button" onClick={handleRename}>OK</button>
          </div>
        ) : (
          <h2
            className="koi-hero-name"
            onClick={() => onRename && setIsNaming(true)}
            title={onRename ? 'Clique para renomear' : undefined}
          >
            {safeMascot.name}
          </h2>
        )}

        <p className="koi-hero-sub">
          <span style={{ color: currentVariant.color }}>{currentVariant.hanzi}</span>
          {' · '}{currentVariant.trait}
        </p>

        {/* Fish stage display */}
        <div className="koi-hero-stage">
          <div className="koi-hero-glow" style={{ '--hero-color': info.color } as CSSProperties} />
          <svg className="koi-hero-ring" viewBox="0 0 280 280" aria-hidden="true">
            <circle cx="140" cy="140" r="135" fill="none" stroke="rgba(212,168,85,.18)" strokeWidth="1" />
            <circle cx="140" cy="140" r="112" fill="none" stroke="rgba(212,168,85,.10)" strokeWidth=".5" strokeDasharray="2 6" />
          </svg>
          <button
            className="koi-hero-fish-btn"
            type="button"
            aria-label="Ver diálogo"
            onClick={() => { setShowDialogue(true); setTimeout(() => setShowDialogue(false), 5000) }}
          >
            <KoiSvg stage={safeMascot.stage} mood={safeMascot.mood} variant={currentVariant} path={safeMascot.evolutionPath} />
          </button>
          <div className="mascot-particles" aria-hidden="true">
            {safeMascot.animation === 'celebrate' && <CelebrateParticles />}
            {safeMascot.animation === 'evolve' && <EvolveParticles />}
          </div>
        </div>

        {/* Dialogue */}
        <div className={`koi-dialogue${showDialogue ? ' visible' : ''}`}>
          <p>{dialogue}</p>
        </div>

        {/* XP card */}
        <div className="koi-xp-card">
          <div className="koi-xp-card-top">
            <span className="koi-xp-label">Evolução</span>
            <span className="koi-xp-value" style={{ color: info.color }}>
              {safeMascot.stage < maxStage ? `${xpInStage} / ${xpForStage} XP` : `${safeMascot.evoXp} XP total`}
            </span>
          </div>
          <div className="koi-xp-bar-wrap">
            <div
              className="koi-xp-bar-fill"
              style={{ width: `${progress}%`, '--stage-color': info.color } as CSSProperties}
            />
          </div>
          <p className="koi-xp-hint">
            {safeMascot.stage < maxStage
              ? `${toNext} XP até Nível ${safeMascot.stage + 1}`
              : finalStageLabel}
          </p>
        </div>
      </div>

      {/* ── Stat grid ── */}
      <div className="koi-stat-grid">
        <div className="koi-stat-card">
          <span className="koi-stat-icon">📖</span>
          <div><span className="koi-stat-label">Lições</span><strong>{safeMascot.lessonsCompleted}</strong></div>
        </div>
        <div className="koi-stat-card">
          <span className="koi-stat-icon">⚡</span>
          <div><span className="koi-stat-label">Evo XP</span><strong>{safeMascot.evoXp}</strong></div>
        </div>
        <div className="koi-stat-card">
          <span className="koi-stat-icon">⏰</span>
          <div><span className="koi-stat-label">Inatividade</span><strong>{safeMascot.inactiveDays}d</strong></div>
        </div>
        <div className={`koi-stat-card${blockedByMistakes > 0 ? ' warn' : ''}`}>
          <span className="koi-stat-icon">⚠️</span>
          <div><span className="koi-stat-label">Erros</span><strong>{blockedByMistakes}</strong></div>
        </div>
      </div>

      {/* ── Evo lock ── */}
      {blockedByMistakes > 0 && (
        <div className="koi-evo-lock">
          <div className="koi-evo-lock-icon">🔒</div>
          <div className="koi-evo-lock-copy">
            <strong>Evolução bloqueada</strong>
            <span>Corrija {blockedByMistakes} erro{blockedByMistakes === 1 ? '' : 's'} para o Koi evoluir</span>
          </div>
          <div className="koi-evo-lock-chains">
            {Array.from({ length: Math.min(blockedByMistakes, 5) }).map((_, i) => (
              <div key={i} className="koi-chain-link" />
            ))}
          </div>
        </div>
      )}

      {/* ── Selector de linhagem ── */}
      <div>
        <h3 className="koi-section-heading">5 Linhagens</h3>
        <div className="koi-type-scroll">
          {PENG_VARIANTS.map((v) => {
            const isActive = safeMascot.pengVariantId === v.id
            return (
              <button
                key={v.id}
                type="button"
                className={`koi-type-btn${isActive ? ' active' : ''}`}
                style={{ '--fish-color': v.color, '--fish-accent': v.accent } as CSSProperties}
                onClick={() => onSwitchVariant?.(v.id as PengVariantId)}
              >
                <div className="koi-type-preview">
                  <KoiSvg stage={safeMascot.stage} mood="neutral" variant={v} path="peng" />
                </div>
                <span className="koi-type-name">{v.name}</span>
                <span className="koi-type-trait">{v.trait}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Linha de evolução · N níveis ── */}
      <div>
        <div className="koi-section-heading-row">
          <h3 className="koi-section-heading">Linha de evolução</h3>
          <span className="koi-section-tag">{maxStage} níveis</span>
        </div>
        <div className="koi-timeline-grid">
          {Array.from({ length: maxStage }, (_, i) => {
            const n = (i + 1) as EvolutionStage
            const unlocked = n <= safeMascot.stage
            const isCurrent = n === safeMascot.stage
            const stageInfo = getStageInfo(n, safeMascot.evolutionPath)
            return (
              <div
                key={n}
                className={`koi-timeline-cell${unlocked ? ' unlocked' : ''}${isCurrent ? ' current' : ''}`}
                style={{ '--cell-color': stageInfo.color } as CSSProperties}
                title={stageInfo.name}
              >
                {unlocked ? (
                  <div className="koi-timeline-fish">
                    <KoiSvg stage={n} mood="neutral" variant={currentVariant} path={safeMascot.evolutionPath} />
                  </div>
                ) : (
                  <span className="koi-timeline-lock">🔒</span>
                )}
                <span className="koi-timeline-label">N{n}</span>
                {isCurrent && <div className="koi-timeline-dot" style={{ background: stageInfo.color }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Conquistas ── */}
      <div>
        <div className="koi-section-heading-row">
          <h3 className="koi-section-heading">Conquistas</h3>
          <span className="koi-section-tag">{earnedMilestones.length}/{MILESTONES.length}</span>
        </div>
        {earnedMilestones.length === 0 ? (
          <p className="koi-empty-hint">Complete lições para desbloquear conquistas.</p>
        ) : (
          <div className="koi-milestones">
            {earnedMilestones.map((m) => (
              <div key={m.label} className="koi-milestone-chip">
                <span className="koi-milestone-icon">{m.icon}</span>
                <div>
                  <span className="koi-milestone-label">{m.label}</span>
                  <span className="koi-milestone-sub">{m.sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Accessories ── */}
      {safeMascot.accessories.length > 0 && (
        <div className="mascot-accessories">
          <span className="eyebrow">Evoluções visuais</span>
          <div className="mascot-acc-chips">
            {safeMascot.accessories.map((acc) => (
              <span key={acc} className="mascot-acc-chip">{accessoryLabel(acc)}</span>
            ))}
          </div>
        </div>
      )}

      <p className="mascot-lore">{info.description}</p>

      {/* ── Alt path ── */}
      {onSwitchPath && (
        <div className="koi-alt-path">
          <div>
            <span className="eyebrow">Destino Alternativo</span>
            <strong>{nextPathLabel}</strong>
            <small>Nível 10 e {switchCost} moedas para trocar.</small>
          </div>
          <button type="button" disabled={!canSwitchPath} onClick={onSwitchPath}>
            Trocar
          </button>
        </div>
      )}
    </section>
  )
}

export function MascotSprite({ mascot, className = 'mascot-sprite' }: { mascot: MascotState; className?: string }) {
  const safeMascot = normalizeMascotState(mascot)
  const variant = getMascotVariant(safeMascot)
  return (
    <div className={className}>
      <KoiSvg
        stage={safeMascot.stage}
        mood={safeMascot.mood}
        variant={variant}
        path={safeMascot.evolutionPath}
      />
    </div>
  )
}

function accessoryLabel(id: string): string {
  const labels: Record<string, string> = {
    'tail-glow': 'Cauda brilhante',
    'long-fins': 'Nadadeiras longas',
    'wide-fins': 'Nadadeiras amplas',
    'dragon-scales': 'Escamas de dragao',
    'horn-buds': 'Brotos de chifre',
    'dragon-horns': 'Chifres de dragao',
    'golden-whiskers': 'Bigodes dourados',
    'wing-buds': 'Brotos de asas',
    'peng-wings': 'Asas Peng',
    'wind-aura': 'Aura de vento',
    'wind-scales': 'Escamas de vento',
    'spiral-body': 'Corpo espiral',
    'sky-call': 'Chamado do ceu',
    'celestial-crown': 'Coroa celestial',
    'cloud-trail': 'Rastro de nuvens',
    'galaxy-trail': 'Rastro galactico',
    'dragon-aura': 'Aura de dragao',
  }
  return labels[id] ?? id
}

function KoiSvg({
  stage,
  mood,
  variant,
  path,
}: {
  stage: EvolutionStage
  mood: string
  variant: MascotVariant
  path: 'dragon' | 'peng'
}) {
  const info = getStageInfo(stage, path)
  const bodyColor = variant.color
  const accentColor = variant.accent
  const eyeSize = mood === 'happy' || mood === 'excited' ? 'happy' : mood === 'sad' || mood === 'sleepy' ? 'sad' : 'normal'
  const bodyY = 100 - Math.min(stage, 8) * 2
  const isPeng = path === 'peng'
  const isBird = isPeng && stage >= 8
  const bodyFill = `url(#body-${variant.id}-${stage})`

  return (
    <svg viewBox="0 0 200 200" className="koi-svg" aria-label={`${variant.name}, ${info.name}`}>
      <defs>
        <radialGradient id={`glow-${variant.id}-${stage}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={info.color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={info.color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`body-${variant.id}-${stage}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.95" />
          <stop offset="48%" stopColor={bodyColor} />
          <stop offset="100%" stopColor={isBird && stage >= 10 ? '#f1c40f' : bodyColor} />
        </linearGradient>
        <filter id={`glow-filter-${variant.id}-${stage}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <circle cx="100" cy="100" r="90" fill={`url(#glow-${variant.id}-${stage})`} className="mascot-aura" />

      {(stage >= 7 || isBird) && (
        <g className="cloud-trail-group">
          <ellipse cx="58" cy="151" rx="24" ry="12" fill="rgba(255,255,255,0.30)" className="cloud cloud-1" />
          <ellipse cx="140" cy="160" rx="20" ry="10" fill="rgba(255,255,255,0.22)" className="cloud cloud-2" />
          <ellipse cx="100" cy="170" rx="30" ry="14" fill="rgba(255,255,255,0.26)" className="cloud cloud-3" />
        </g>
      )}

      <g className="koi-body-group" filter={`url(#glow-filter-${variant.id}-${stage})`}>
        {isBird ? (
          <PengBird stage={stage} bodyColor={bodyColor} accentColor={accentColor} bodyFill={bodyFill} />
        ) : (
          <FishBody stage={stage} bodyY={bodyY} bodyColor={bodyColor} accentColor={accentColor} bodyFill={bodyFill} />
        )}

        {stage >= 8 && (
          <g className="celestial-crown">
            <polygon
              points={`88,${66 - Math.min(stage, 8) * 2} 94,${56 - Math.min(stage, 8) * 2} 100,${64 - Math.min(stage, 8) * 2} 106,${54 - Math.min(stage, 8) * 2} 113,${66 - Math.min(stage, 8) * 2}`}
              fill="#f1c40f"
              stroke="#e67e22"
              strokeWidth="1"
              opacity={stage >= 10 || path === 'dragon' ? 1 : 0.55}
            />
            <circle cx="100" cy={58 - Math.min(stage, 8) * 2} r="3" fill="#e74c3c" />
          </g>
        )}

        <Eye stage={stage} mood={eyeSize} isBird={isBird} />

        {isBird ? (
          <path d="M132 84 Q139 89 132 94" fill="none" stroke="#241f23" strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          <path
            d={`M120 ${100 - Math.min(stage, 8) * 2} Q123 ${103 - Math.min(stage, 8) * 2} 120 ${104 - Math.min(stage, 8) * 2}`}
            fill="none"
            stroke="#241f23"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )}
      </g>

      {mood === 'sleepy' && (
        <g className="sleep-zzz">
          <text x="130" y="65" fill="#796f66" fontSize="16" fontWeight="bold" className="zzz-1">Z</text>
          <text x="140" y="50" fill="#796f66" fontSize="12" fontWeight="bold" className="zzz-2">z</text>
          <text x="148" y="38" fill="#796f66" fontSize="9" fontWeight="bold" className="zzz-3">z</text>
        </g>
      )}
    </svg>
  )
}

function FishBody({
  stage,
  bodyY,
  bodyColor,
  accentColor,
  bodyFill,
}: {
  stage: EvolutionStage
  bodyY: number
  bodyColor: string
  accentColor: string
  bodyFill: string
}) {
  const displayStage = Math.min(stage, 8)
  return (
    <>
      <path
        d={fishBodyPath(displayStage, bodyY)}
        fill={bodyFill}
        className="koi-body"
      />
      <ellipse cx="98" cy={bodyY + 5} rx={20 + displayStage * 2} ry={10 + displayStage} fill="rgba(255, 255, 255, 0.30)" />
      <path
        d={`M${70 - displayStage * 2} ${bodyY} Q${55 - displayStage * 3} ${85 - displayStage} ${45 - displayStage * 2} ${70 - displayStage} Q${55 - displayStage * 2} ${95 - displayStage * 2} ${70 - displayStage * 2} ${bodyY} Q${55 - displayStage * 3} ${115 - displayStage * 3} ${45 - displayStage * 2} ${130 - displayStage * 2} Q${55 - displayStage * 2} ${105 - displayStage * 2} ${70 - displayStage * 2} ${bodyY}`}
        fill={accentColor}
        className="koi-tail"
      />
      {stage >= 2 && (
        <path
          d={`M${70 - displayStage * 2} ${bodyY} Q${55 - displayStage * 3} ${85 - displayStage} ${45 - displayStage * 2} ${70 - displayStage}`}
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
          className="tail-glow-stroke"
          opacity="0.72"
        />
      )}
      {stage >= 3 && (
        <g className="koi-scales" opacity={stage >= 7 ? 0.55 : 0.34}>
          {[...Array(Math.min(stage + 1, 8))].map((_, index) => (
            <circle
              key={index}
              cx={78 + index * 8}
              cy={bodyY - 3 + (index % 2) * 7}
              r={stage >= 7 ? 3.5 : 3}
              fill={index % 2 === 0 ? 'rgba(255,255,255,0.58)' : accentColor}
            />
          ))}
        </g>
      )}
      {stage >= 4 && (
        <g className="dragon-buds">
          <path d={`M82 ${83 - displayStage * 2} Q62 ${62 - displayStage * 2} 55 ${50 - displayStage * 2}`} fill="none" stroke={accentColor} strokeWidth={stage >= 6 ? 6 : 4} strokeLinecap="round" opacity="0.68" />
          <path d={`M118 ${83 - displayStage * 2} Q138 ${62 - displayStage * 2} 145 ${50 - displayStage * 2}`} fill="none" stroke={accentColor} strokeWidth={stage >= 6 ? 6 : 4} strokeLinecap="round" opacity="0.68" />
        </g>
      )}
      {stage >= 5 && (
        <g className="horn-buds">
          <path d={`M96 ${77 - displayStage * 2} L90 ${62 - displayStage * 2} L101 ${72 - displayStage * 2}`} fill={accentColor} opacity="0.86" />
          <path d={`M108 ${77 - displayStage * 2} L116 ${62 - displayStage * 2} L104 ${72 - displayStage * 2}`} fill={accentColor} opacity="0.86" />
        </g>
      )}
      {stage >= 6 && (
        <g className="whiskers">
          <line x1="125" y1={95 - displayStage * 2} x2="157" y2={78 - displayStage * 2} stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" className="whisker-1" />
          <line x1="126" y1={100 - displayStage * 2} x2="160" y2={96 - displayStage * 2} stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" className="whisker-2" />
          <line x1="125" y1={95 - displayStage * 2} x2="155" y2={112 - displayStage * 2} stroke="#f1c40f" strokeWidth="1.5" strokeLinecap="round" className="whisker-3" />
        </g>
      )}
      <ellipse
        cx="105"
        cy={110 - displayStage * 2}
        rx={8 + displayStage}
        ry="4"
        fill={bodyColor}
        opacity="0.55"
        transform={`rotate(15 105 ${110 - displayStage * 2})`}
        className="pectoral-fin"
      />
    </>
  )
}

function PengBird({ stage, bodyColor, accentColor, bodyFill }: { stage: EvolutionStage; bodyColor: string; accentColor: string; bodyFill: string }) {
  const big = stage >= 10
  return (
    <>
      <path
        d="M58 100 C74 62 122 58 145 87 C129 122 80 130 58 100Z"
        fill={bodyFill}
        className="koi-body"
      />
      <path
        d={big ? 'M85 92 C40 36 22 38 36 106 C50 90 65 86 85 92Z' : 'M83 95 C45 55 31 58 42 111 C54 98 66 92 83 95Z'}
        fill={accentColor}
        opacity="0.82"
        className="wing-left"
      />
      <path
        d={big ? 'M111 92 C157 34 177 39 163 108 C149 90 132 86 111 92Z' : 'M113 95 C151 55 166 58 154 111 C142 98 130 92 113 95Z'}
        fill={accentColor}
        opacity="0.82"
        className="wing-right"
      />
      <path d="M134 82 L158 88 L136 96" fill={stage >= 10 ? '#f1c40f' : bodyColor} />
      <path d="M63 103 C48 117 40 126 30 145 C54 135 70 125 79 111Z" fill={bodyColor} opacity="0.88" />
      <path d="M87 114 C77 138 75 151 76 170 C91 152 99 136 100 119Z" fill={accentColor} opacity="0.70" />
      {stage >= 9 && (
        <g className="wind-aura">
          <path d="M38 140 C62 158 96 160 122 145" fill="none" stroke={accentColor} strokeWidth="2" strokeDasharray="4 4" />
          <path d="M54 154 C86 176 125 172 151 149" fill="none" stroke="#f1c40f" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.7" />
        </g>
      )}
    </>
  )
}

function Eye({ stage, mood, isBird }: { stage: EvolutionStage; mood: string; isBird: boolean }) {
  const y = isBird ? 82 : 94 - Math.min(stage, 8) * 2
  const x = isBird ? 126 : 117
  if (mood === 'happy') {
    return <path d={`M${x - 4} ${y + 1} Q${x} ${y - 4} ${x + 4} ${y + 1}`} fill="none" stroke="#241f23" strokeWidth="2.5" strokeLinecap="round" />
  }
  return (
    <g className="koi-eye">
      <circle cx={x} cy={y} r="5" fill="#fff" />
      <circle cx={x + 1} cy={y - 1} r="3" fill="#241f23" />
      <circle cx={x + 2} cy={y - 2} r="1" fill="#fff" />
      {mood === 'sad' && <ellipse cx={x + 2} cy={y + 7} rx="2" ry="3" fill="rgba(52,152,219,0.5)" className="tear-drop" />}
    </g>
  )
}

function fishBodyPath(stage: number, bodyY: number) {
  if (stage < 5) {
    return `M${63 - stage} ${bodyY} C${72 - stage} ${70 - stage * 2} ${130 + stage} ${72 - stage * 2} ${140 + stage} ${bodyY} C${132 + stage} ${127 - stage} ${73 - stage} ${128 - stage} ${63 - stage} ${bodyY}Z`
  }
  return `M${58 - stage} ${bodyY + 4} C${66} ${62 - stage * 2} ${125 + stage} ${62 - stage * 2} ${148 + stage} ${bodyY - 8} C${134 + stage} ${126 - stage} ${78 - stage} ${132 - stage} ${58 - stage} ${bodyY + 4}Z`
}

function CelebrateParticles() {
  return (
    <div className="particles-celebrate">
      {[...Array(8)].map((_, index) => (
        <span key={index} className="particle star-particle" style={{ '--i': index, '--delay': `${index * 0.15}s` } as CSSProperties}>
          *
        </span>
      ))}
    </div>
  )
}

function EvolveParticles() {
  return (
    <div className="particles-evolve">
      {[...Array(12)].map((_, index) => (
        <span key={index} className="particle evolve-particle" style={{ '--i': index, '--delay': `${index * 0.1}s` } as CSSProperties}>
          +
        </span>
      ))}
    </div>
  )
}

export default MascotWidget
