import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  type EvolutionStage,
  type MascotState,
  type MascotVariant,
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
  blockedByMistakes = 0,
  userLevel = 1,
  coins = 0,
  switchCost = 300,
  compact = false,
}: {
  mascot: MascotState
  onRename?: (name: string) => void
  onSwitchPath?: () => void
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
  const variant = getMascotVariant(safeMascot)
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

  return (
    <section className="mascot-widget">
      <div className="mascot-header">
        <div>
          <p className="eyebrow">Companheiro de estudos</p>
          {isNaming ? (
            <div className="mascot-name-edit">
              <input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleRename()}
                maxLength={20}
                placeholder="Nome do seu koi..."
                autoFocus
              />
              <button type="button" onClick={handleRename}>OK</button>
            </div>
          ) : (
            <h2 onClick={() => onRename && setIsNaming(true)} title="Clique para renomear">
              {safeMascot.name} <span className="mascot-stage-badge">{info.emoji} Nv.{safeMascot.stage}</span>
            </h2>
          )}
        </div>
        <div className="mascot-stage-label">{info.name}</div>
      </div>

      <div className="mascot-stage-area">
        <MascotSprite mascot={safeMascot} className={`mascot-sprite mascot-${safeMascot.animation}`} />

        {showDialogue && (
          <div className={`mascot-bubble mascot-bubble-${safeMascot.mood}`}>
            <p>{dialogue}</p>
          </div>
        )}

        <div className="mascot-particles" aria-hidden="true">
          {safeMascot.animation === 'celebrate' && <CelebrateParticles />}
          {safeMascot.animation === 'evolve' && <EvolveParticles />}
        </div>
      </div>

      <div className="mascot-info-grid">
        <div className="mascot-variant-card">
          <span className="eyebrow">{safeMascot.evolutionPath === 'peng' ? 'Rota Peng' : 'Rota Dragao'}</span>
          <strong>{variant.hanzi} · {variant.name}</strong>
          <small>{variant.trait}</small>
        </div>

        {blockedByMistakes > 0 && (
          <div className="mascot-lock">
            <strong>Evolucao bloqueada</strong>
            <span>Corrija {blockedByMistakes} erro{blockedByMistakes === 1 ? '' : 's'} para o mascote voltar a evoluir.</span>
          </div>
        )}

        <div className="mascot-evo-progress">
          <div className="mascot-evo-labels">
            <span>{info.title}</span>
            {safeMascot.stage < maxStage && <span>{toNext} XP para evoluir</span>}
            {safeMascot.stage >= maxStage && <span>{finalStageLabel}</span>}
          </div>
          <div className="mascot-evo-bar">
            <span
              className="mascot-evo-fill"
              style={{ width: `${progress}%`, '--stage-color': info.color } as CSSProperties}
            ></span>
          </div>
        </div>

        <div className="mascot-stats-row">
          <div className="mascot-stat">
            <span>Licoes</span>
            <strong>{safeMascot.lessonsCompleted}</strong>
          </div>
          <div className="mascot-stat">
            <span>Evo XP</span>
            <strong>{safeMascot.evoXp}</strong>
          </div>
          <div className="mascot-stat">
            <span>Inatividade</span>
            <strong>{safeMascot.inactiveDays}d</strong>
          </div>
        </div>

        {safeMascot.accessories.length > 0 && (
          <div className="mascot-accessories">
            <span className="eyebrow">Evolucoes visuais</span>
            <div className="mascot-acc-chips">
              {safeMascot.accessories.map((acc) => (
                <span key={acc} className="mascot-acc-chip">
                  {accessoryLabel(acc)}
                </span>
              ))}
            </div>
          </div>
        )}

        {onSwitchPath && (
          <div className="mascot-switch">
            <div>
              <span className="eyebrow">Destino alternativo</span>
              <strong>{nextPathLabel}</strong>
              <small>Nivel 10 e {switchCost} moedas para trocar.</small>
            </div>
            <button type="button" disabled={!canSwitchPath} onClick={onSwitchPath}>
              Trocar
            </button>
          </div>
        )}
      </div>

      <p className="mascot-lore">{info.description}</p>
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
