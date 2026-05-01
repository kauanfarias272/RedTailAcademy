import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  type EvolutionStage,
  type MascotState,
  getStageInfo,
  getMascotDialogue,
  stageProgress,
  xpToNextStage,
} from './mascot'

/**
 * MascotWidget — Renders the animated Tamagotchi-style mascot.
 * Shows the koi/dragon SVG, evolution progress bar, mood dialogue, and stats.
 */
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
  const [showDialogue, setShowDialogue] = useState(false)
  const [isNaming, setIsNaming] = useState(false)
  const [nameInput, setNameInput] = useState(mascot.name)

  const info = getStageInfo(mascot.stage, mascot.evolutionPath)
  const progress = stageProgress(mascot.evoXp, mascot.stage)
  const toNext = xpToNextStage(mascot.evoXp, mascot.stage)
  const canSwitchPath = !!onSwitchPath && userLevel >= 10 && coins >= switchCost
  const finalStageLabel = mascot.evolutionPath === 'peng' ? '🦅 Gavião Peng Celestial!' : '🐉 Dragão Celestial!'
  const dialogue = useMemo(() => getMascotDialogue(mascot), [mascot])

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
        <div className={`mascot-sprite-compact mascot-${mascot.animation}`}>
          <KoiSvg stage={mascot.stage} mood={mascot.mood} path={mascot.evolutionPath} />
        </div>
        <div className="mascot-compact-info">
          <span className="mascot-compact-name">{mascot.name}</span>
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
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                maxLength={20}
                placeholder="Nome do seu koi..."
                autoFocus
              />
              <button type="button" onClick={handleRename}>✓</button>
            </div>
          ) : (
            <h2 onClick={() => onRename && setIsNaming(true)} title="Clique para renomear">
              {mascot.name} <span className="mascot-stage-badge">{info.emoji} Nv.{mascot.stage}</span>
            </h2>
          )}
        </div>
        <div className="mascot-stage-label">{info.name}</div>
      </div>

      <div className="mascot-stage-area">
        <div className={`mascot-sprite mascot-${mascot.animation}`}>
          <KoiSvg stage={mascot.stage} mood={mascot.mood} path={mascot.evolutionPath} />
        </div>

        {showDialogue && (
          <div className={`mascot-bubble mascot-bubble-${mascot.mood}`}>
            <p>{dialogue}</p>
          </div>
        )}

        <div className="mascot-particles" aria-hidden="true">
          {mascot.animation === 'celebrate' && <CelebrateParticles />}
          {mascot.animation === 'evolve' && <EvolveParticles />}
        </div>
      </div>

      <div className="mascot-info-grid">
        {blockedByMistakes > 0 && (
          <div className="mascot-lock">
            <strong>Evolucao bloqueada</strong>
            <span>Corrija {blockedByMistakes} erro{blockedByMistakes === 1 ? '' : 's'} para o mascote voltar a evoluir.</span>
          </div>
        )}

        <div className="mascot-evo-progress">
          <div className="mascot-evo-labels">
            <span>{info.title}</span>
            {mascot.stage < 7 && <span>{toNext} XP para evoluir</span>}
            {mascot.stage >= 7 && <span>{finalStageLabel}</span>}
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
            <span>Lições</span>
            <strong>{mascot.lessonsCompleted}</strong>
          </div>
          <div className="mascot-stat">
            <span>Evo XP</span>
            <strong>{mascot.evoXp}</strong>
          </div>
          <div className="mascot-stat">
            <span>Inatividade</span>
            <strong>{mascot.inactiveDays}d</strong>
          </div>
        </div>

        {mascot.accessories.length > 0 && (
          <div className="mascot-accessories">
            <span className="eyebrow">Acessórios</span>
            <div className="mascot-acc-chips">
              {mascot.accessories.map((acc) => (
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
              <strong>{mascot.evolutionPath === 'dragon' ? 'Gavião Peng' : 'Dragão'}</strong>
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

function accessoryLabel(id: string): string {
  const labels: Record<string, string> = {
    'tail-glow': '✨ Cauda Brilhante',
    'long-fins': '🌊 Barbatanas Longas',
    'wing-buds': '🌱 Brotos de Asas',
    'dragon-wings': '🐲 Asas de Dragão',
    'golden-whiskers': '✨ Bigodes Dourados',
    'celestial-crown': '👑 Coroa Celestial',
    'cloud-trail': '☁️ Rastro de Nuvens',
    'blue-scales': '🌊 Escamas Azuis',
    'feather-buds': '🪶 Brotos de Penas',
    'peng-wings': '🦅 Asas de Gavião Peng',
    'wind-aura': '🌪️ Aura de Vento',
    'star-crown': '✨ Coroa Estelar',
    'galaxy-trail': '🌌 Rastro Galáctico',
  }
  return labels[id] ?? id
}

/**
 * Animated SVG Koi / Dragon mascot.
 * Rendered with inline SVG for full CSS animation control.
 */
function KoiSvg({ stage, mood, path }: { stage: EvolutionStage; mood: string; path: 'dragon' | 'peng' }) {
  const info = getStageInfo(stage, path)
  
  const isPeng = path === 'peng'
  // Colors adjust based on path
  const bodyColor = isPeng 
    ? (stage <= 2 ? '#3498db' : stage <= 4 ? '#2980b9' : '#16a085')
    : (stage <= 3 ? '#e74c3c' : stage <= 5 ? '#9b59b6' : '#f39c12')
    
  const tailColor = isPeng ? '#2c3e50' : '#c0392b'
  const eyeSize = mood === 'happy' || mood === 'excited' ? 'happy' : mood === 'sad' || mood === 'sleepy' ? 'sad' : 'normal'

  return (
    <svg viewBox="0 0 200 200" className="koi-svg" aria-label={info.name}>
      {/* Water ripples background */}
      <defs>
        <radialGradient id={`glow-${stage}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={info.color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={info.color} stopOpacity="0" />
        </radialGradient>
        <filter id="glow-filter">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Aura glow */}
      <circle cx="100" cy="100" r="90" fill={`url(#glow-${stage})`} className="mascot-aura" />

      {/* Cloud trail for stage 7 */}
      {stage >= 7 && (
        <g className="cloud-trail-group">
          <ellipse cx="60" cy="150" rx="25" ry="12" fill="rgba(255,255,255,0.3)" className="cloud cloud-1" />
          <ellipse cx="140" cy="160" rx="20" ry="10" fill="rgba(255,255,255,0.2)" className="cloud cloud-2" />
          <ellipse cx="100" cy="170" rx="30" ry="14" fill="rgba(255,255,255,0.25)" className="cloud cloud-3" />
        </g>
      )}

      {/* Body */}
      <g className="koi-body-group" filter="url(#glow-filter)">
        {/* Main body — ellipse that gets bigger with stage */}
        <ellipse
          cx="100"
          cy={100 - stage * 2}
          rx={28 + stage * 3}
          ry={18 + stage * 2}
          fill={bodyColor}
          className="koi-body"
        />

        {/* Scales pattern */}
        {stage >= 3 && (
          <g className="koi-scales" opacity="0.3">
            {[...Array(Math.min(stage, 5))].map((_, i) => (
              <circle
                key={i}
                cx={85 + i * 8}
                cy={98 - stage * 2 + (i % 2) * 5}
                r={3}
                fill="rgba(255,255,255,0.5)"
              />
            ))}
          </g>
        )}

        {/* Belly */}
        <ellipse
          cx="96"
          cy={104 - stage * 2}
          rx={20 + stage * 2}
          ry={12 + stage}
          fill="rgba(255,255,255,0.25)"
        />

        {/* Tail */}
        <path
          d={`M${70 - stage * 2} ${100 - stage * 2} Q${55 - stage * 3} ${85 - stage} ${45 - stage * 2} ${70 - stage} Q${55 - stage * 2} ${95 - stage * 2} ${70 - stage * 2} ${100 - stage * 2} Q${55 - stage * 3} ${115 - stage * 3} ${45 - stage * 2} ${130 - stage * 2} Q${55 - stage * 2} ${105 - stage * 2} ${70 - stage * 2} ${100 - stage * 2}`}
          fill={tailColor}
          className="koi-tail"
        />

        {/* Tail glow for stage 2+ */}
        {stage >= 2 && (
          <path
            d={`M${70 - stage * 2} ${100 - stage * 2} Q${55 - stage * 3} ${85 - stage} ${45 - stage * 2} ${70 - stage}`}
            fill="none"
            stroke="#ff6b6b"
            strokeWidth="2"
            className="tail-glow-stroke"
            opacity="0.7"
          />
        )}

        {/* Long fins for stage 3+ */}
        {stage >= 3 && (
          <g className="long-fins">
            <path
              d={`M${90} ${80 - stage * 2} Q${85} ${60 - stage * 2} ${95} ${55 - stage * 3}`}
              fill="none"
              stroke={bodyColor}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d={`M${110} ${82 - stage * 2} Q${115} ${62 - stage * 2} ${105} ${57 - stage * 3}`}
              fill="none"
              stroke={bodyColor}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>
        )}

        {/* Wing buds for stage 4 */}
        {stage === 4 && (
          <g className="wing-buds">
            <ellipse cx="80" cy={80 - stage * 2} rx="8" ry="5" fill={bodyColor} opacity="0.6"
              transform={`rotate(-20 80 ${80 - stage * 2})`} />
            <ellipse cx="120" cy={80 - stage * 2} rx="8" ry="5" fill={bodyColor} opacity="0.6"
              transform={`rotate(20 120 ${80 - stage * 2})`} />
          </g>
        )}

        {/* Dragon/Peng wings for stage 5+ */}
        {stage >= 5 && (
          <g className="dragon-wings">
            <path
              d={`M85 ${88 - stage * 2} Q60 ${55 - stage * 3} 40 ${45 - stage * 2} Q55 ${70 - stage * 2} 80 ${92 - stage * 2}`}
              fill={isPeng ? (stage >= 6 ? '#1abc9c' : '#16a085') : (stage >= 6 ? '#f39c12' : '#9b59b6')}
              opacity="0.7"
              className="wing-left"
            />
            <path
              d={`M115 ${88 - stage * 2} Q140 ${55 - stage * 3} 160 ${45 - stage * 2} Q145 ${70 - stage * 2} 120 ${92 - stage * 2}`}
              fill={isPeng ? (stage >= 6 ? '#1abc9c' : '#16a085') : (stage >= 6 ? '#f39c12' : '#9b59b6')}
              opacity="0.7"
              className="wing-right"
            />
          </g>
        )}

        {/* Whiskers (Dragon) or Wind Aura (Peng) for stage 6+ */}
        {stage >= 6 && (
          isPeng ? (
            <g className="wind-aura">
               <path d={`M70 ${100 - stage * 2} Q50 ${80 - stage * 2} 40 ${90 - stage * 2}`} fill="none" stroke="#1abc9c" strokeWidth="2" strokeDasharray="4 4" className="whisker-1" />
               <path d={`M130 ${100 - stage * 2} Q150 ${80 - stage * 2} 160 ${90 - stage * 2}`} fill="none" stroke="#1abc9c" strokeWidth="2" strokeDasharray="4 4" className="whisker-2" />
            </g>
          ) : (
            <g className="whiskers">
              <line x1="125" y1={95 - stage * 2} x2="155" y2={80 - stage * 2}
                stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" className="whisker-1" />
              <line x1="125" y1={100 - stage * 2} x2="158" y2={95 - stage * 2}
                stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" className="whisker-2" />
              <line x1="125" y1={95 - stage * 2} x2="155" y2={110 - stage * 2}
                stroke="#f1c40f" strokeWidth="1.5" strokeLinecap="round" className="whisker-3" />
            </g>
          )
        )}

        {/* Crown for stage 7 */}
        {stage >= 7 && (
          <g className="celestial-crown">
            <polygon
              points={`90,${68 - stage * 2} 95,${58 - stage * 2} 100,${65 - stage * 2} 105,${55 - stage * 2} 110,${68 - stage * 2}`}
              fill={isPeng ? "#2ecc71" : "#f1c40f"}
              stroke={isPeng ? "#27ae60" : "#e67e22"}
              strokeWidth="1"
            />
            <circle cx="100" cy={60 - stage * 2} r="3" fill={isPeng ? "#f1c40f" : "#e74c3c"} />
          </g>
        )}

        {/* Eye */}
        <g className="koi-eye">
          {eyeSize === 'happy' ? (
            <>
              <path
                d={`M${113} ${95 - stage * 2} Q${117} ${90 - stage * 2} ${121} ${95 - stage * 2}`}
                fill="none"
                stroke="#241f23"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          ) : eyeSize === 'sad' ? (
            <>
              <circle cx="117" cy={94 - stage * 2} r="5" fill="#fff" />
              <circle cx="117" cy={95 - stage * 2} r="3" fill="#241f23" />
              {/* Tear drop */}
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

        {/* Mouth */}
        <path
          d={`M${120} ${100 - stage * 2} Q${123} ${103 - stage * 2} ${120} ${104 - stage * 2}`}
          fill="none"
          stroke="#241f23"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Small pectoral fin */}
        <ellipse
          cx="105"
          cy={110 - stage * 2}
          rx={8 + stage}
          ry="4"
          fill={bodyColor}
          opacity="0.5"
          transform={`rotate(15 105 ${110 - stage * 2})`}
          className="pectoral-fin"
        />
      </g>

      {/* Sleep Zzz for sleepy mood */}
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

function CelebrateParticles() {
  return (
    <div className="particles-celebrate">
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="particle star-particle"
          style={{ '--i': i, '--delay': `${i * 0.15}s` } as CSSProperties}
        >
          ⭐
        </span>
      ))}
    </div>
  )
}

function EvolveParticles() {
  return (
    <div className="particles-evolve">
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="particle evolve-particle"
          style={{ '--i': i, '--delay': `${i * 0.1}s` } as CSSProperties}
        >
          ✨
        </span>
      ))}
    </div>
  )
}

export default MascotWidget
