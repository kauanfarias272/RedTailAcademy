import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  type EvolutionStage,
  type KoiVariant,
  type MascotState,
  getKoiVariant,
  getStageInfo,
  getMascotDialogue,
  normalizeMascotState,
  stageProgress,
  xpToNextStage,
} from './mascot'

export function MascotWidget({
  mascot,
  onRename,
  blockedByMistakes = 0,
  compact = false,
}: {
  mascot: MascotState
  onRename?: (name: string) => void
  blockedByMistakes?: number
  compact?: boolean
}) {
  const safeMascot = useMemo(() => normalizeMascotState(mascot), [mascot])
  const [showDialogue, setShowDialogue] = useState(false)
  const [isNaming, setIsNaming] = useState(false)
  const [nameInput, setNameInput] = useState(safeMascot.name)

  const info = getStageInfo(safeMascot.stage)
  const variant = getKoiVariant(safeMascot.koiVariantId)
  const progress = stageProgress(safeMascot.evoXp, safeMascot.stage)
  const toNext = xpToNextStage(safeMascot.evoXp, safeMascot.stage)
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
        <div className={`mascot-sprite-compact mascot-${safeMascot.animation}`}>
          <KoiSvg stage={safeMascot.stage} mood={safeMascot.mood} variant={variant} />
        </div>
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
        <div className={`mascot-sprite mascot-${safeMascot.animation}`}>
          <KoiSvg stage={safeMascot.stage} mood={safeMascot.mood} variant={variant} />
        </div>

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
          <span className="eyebrow">Tipo de koi</span>
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
            {safeMascot.stage < 8 && <span>{toNext} XP para evoluir</span>}
            {safeMascot.stage >= 8 && <span>Dragao completo</span>}
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
      </div>

      <p className="mascot-lore">{info.description}</p>
    </section>
  )
}

function accessoryLabel(id: string): string {
  const labels: Record<string, string> = {
    'tail-glow': 'Cauda brilhante',
    'long-fins': 'Nadadeiras longas',
    'dragon-scales': 'Escamas de dragao',
    'horn-buds': 'Brotos de chifre',
    'dragon-horns': 'Chifres de dragao',
    'golden-whiskers': 'Bigodes dourados',
    'celestial-crown': 'Coroa celestial',
    'cloud-trail': 'Rastro de nuvens',
    'dragon-aura': 'Aura de dragao',
  }
  return labels[id] ?? id
}

function KoiSvg({ stage, mood, variant }: { stage: EvolutionStage; mood: string; variant: KoiVariant }) {
  const info = getStageInfo(stage)
  const bodyColor = variant.color
  const accentColor = variant.accent
  const bellyColor = stage >= 6 ? 'rgba(255, 246, 215, 0.42)' : 'rgba(255, 255, 255, 0.30)'
  const eyeSize = mood === 'happy' || mood === 'excited' ? 'happy' : mood === 'sad' || mood === 'sleepy' ? 'sad' : 'normal'
  const bodyY = 100 - stage * 2

  return (
    <svg viewBox="0 0 200 200" className="koi-svg" aria-label={`${variant.name}, ${info.name}`}>
      <defs>
        <radialGradient id={`glow-${variant.id}-${stage}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={info.color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={info.color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`body-${variant.id}-${stage}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.96" />
          <stop offset="50%" stopColor={bodyColor} />
          <stop offset="100%" stopColor={stage >= 7 ? '#f1c40f' : bodyColor} />
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

      {stage >= 7 && (
        <g className="cloud-trail-group">
          <ellipse cx="58" cy="151" rx="24" ry="12" fill="rgba(255,255,255,0.30)" className="cloud cloud-1" />
          <ellipse cx="140" cy="160" rx="20" ry="10" fill="rgba(255,255,255,0.22)" className="cloud cloud-2" />
          <ellipse cx="100" cy="170" rx="30" ry="14" fill="rgba(255,255,255,0.26)" className="cloud cloud-3" />
        </g>
      )}

      <g className="koi-body-group" filter={`url(#glow-filter-${variant.id}-${stage})`}>
        <path
          d={dragonBodyPath(stage, bodyY)}
          fill={`url(#body-${variant.id}-${stage})`}
          className="koi-body"
        />

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

        <ellipse
          cx="98"
          cy={bodyY + 5}
          rx={20 + stage * 2}
          ry={10 + stage}
          fill={bellyColor}
        />

        <path
          d={`M${70 - stage * 2} ${bodyY} Q${55 - stage * 3} ${85 - stage} ${45 - stage * 2} ${70 - stage} Q${55 - stage * 2} ${95 - stage * 2} ${70 - stage * 2} ${bodyY} Q${55 - stage * 3} ${115 - stage * 3} ${45 - stage * 2} ${130 - stage * 2} Q${55 - stage * 2} ${105 - stage * 2} ${70 - stage * 2} ${bodyY}`}
          fill={accentColor}
          className="koi-tail"
        />

        {stage >= 2 && (
          <path
            d={`M${70 - stage * 2} ${bodyY} Q${55 - stage * 3} ${85 - stage} ${45 - stage * 2} ${70 - stage}`}
            fill="none"
            stroke={info.color}
            strokeWidth="2"
            className="tail-glow-stroke"
            opacity="0.72"
          />
        )}

        {stage >= 3 && (
          <g className="long-fins">
            <path d={`M90 ${80 - stage * 2} Q84 ${60 - stage * 2} 96 ${55 - stage * 3}`} fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" opacity="0.75" />
            <path d={`M110 ${82 - stage * 2} Q116 ${62 - stage * 2} 104 ${57 - stage * 3}`} fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" opacity="0.75" />
          </g>
        )}

        {stage >= 4 && (
          <g className="dragon-buds">
            <path d={`M82 ${83 - stage * 2} Q62 ${62 - stage * 2} 55 ${50 - stage * 2}`} fill="none" stroke={accentColor} strokeWidth={stage >= 6 ? 6 : 4} strokeLinecap="round" opacity="0.68" />
            <path d={`M118 ${83 - stage * 2} Q138 ${62 - stage * 2} 145 ${50 - stage * 2}`} fill="none" stroke={accentColor} strokeWidth={stage >= 6 ? 6 : 4} strokeLinecap="round" opacity="0.68" />
          </g>
        )}

        {stage >= 5 && (
          <g className="horn-buds">
            <path d={`M96 ${77 - stage * 2} L90 ${62 - stage * 2} L101 ${72 - stage * 2}`} fill={info.color} opacity="0.86" />
            <path d={`M108 ${77 - stage * 2} L116 ${62 - stage * 2} L104 ${72 - stage * 2}`} fill={info.color} opacity="0.86" />
          </g>
        )}

        {stage >= 6 && (
          <g className="whiskers">
            <line x1="125" y1={95 - stage * 2} x2="157" y2={78 - stage * 2} stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" className="whisker-1" />
            <line x1="126" y1={100 - stage * 2} x2="160" y2={96 - stage * 2} stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" className="whisker-2" />
            <line x1="125" y1={95 - stage * 2} x2="155" y2={112 - stage * 2} stroke="#f1c40f" strokeWidth="1.5" strokeLinecap="round" className="whisker-3" />
          </g>
        )}

        {stage >= 8 && (
          <g className="celestial-crown">
            <polygon
              points={`88,${66 - stage * 2} 94,${56 - stage * 2} 100,${64 - stage * 2} 106,${54 - stage * 2} 113,${66 - stage * 2}`}
              fill="#f1c40f"
              stroke="#e67e22"
              strokeWidth="1"
            />
            <circle cx="100" cy={58 - stage * 2} r="3" fill="#e74c3c" />
          </g>
        )}

        <g className="koi-eye">
          {eyeSize === 'happy' ? (
            <path d={`M113 ${95 - stage * 2} Q117 ${90 - stage * 2} 121 ${95 - stage * 2}`} fill="none" stroke="#241f23" strokeWidth="2.5" strokeLinecap="round" />
          ) : eyeSize === 'sad' ? (
            <>
              <circle cx="117" cy={94 - stage * 2} r="5" fill="#fff" />
              <circle cx="117" cy={95 - stage * 2} r="3" fill="#241f23" />
              <ellipse cx="119" cy={101 - stage * 2} rx="2" ry="3" fill="rgba(52,152,219,0.5)" className="tear-drop" />
            </>
          ) : (
            <>
              <circle cx="117" cy={94 - stage * 2} r="5" fill="#fff" />
              <circle cx="118" cy={93 - stage * 2} r="3" fill="#241f23" />
              <circle cx="119" cy={92 - stage * 2} r="1" fill="#fff" />
            </>
          )}
        </g>

        <path
          d={`M120 ${100 - stage * 2} Q123 ${103 - stage * 2} 120 ${104 - stage * 2}`}
          fill="none"
          stroke="#241f23"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <ellipse
          cx="105"
          cy={110 - stage * 2}
          rx={8 + stage}
          ry="4"
          fill={accentColor}
          opacity="0.55"
          transform={`rotate(15 105 ${110 - stage * 2})`}
          className="pectoral-fin"
        />
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

function dragonBodyPath(stage: EvolutionStage, bodyY: number) {
  if (stage < 5) {
    return `M${63 - stage} ${bodyY} C${72 - stage} ${70 - stage * 2} ${130 + stage} ${72 - stage * 2} ${140 + stage} ${bodyY} C${132 + stage} ${127 - stage} ${73 - stage} ${128 - stage} ${63 - stage} ${bodyY}Z`
  }

  return `M${58 - stage} ${bodyY + 4} C${66} ${62 - stage * 2} ${125 + stage} ${62 - stage * 2} ${148 + stage} ${bodyY - 8} C${134 + stage} ${126 - stage} ${78 - stage} ${132 - stage} ${58 - stage} ${bodyY + 4}Z`
}

function CelebrateParticles() {
  return (
    <div className="particles-celebrate">
      {[...Array(8)].map((_, index) => (
        <span
          key={index}
          className="particle star-particle"
          style={{ '--i': index, '--delay': `${index * 0.15}s` } as CSSProperties}
        >
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
        <span
          key={index}
          className="particle evolve-particle"
          style={{ '--i': index, '--delay': `${index * 0.1}s` } as CSSProperties}
        >
          +
        </span>
      ))}
    </div>
  )
}

export default MascotWidget
