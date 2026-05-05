// Tiny synthesized SFX via Web Audio API — no asset files, no Capacitor plugin.
// All sounds bail silently if AudioContext isn't available (SSR, locked iOS, etc).

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (audioCtx) return audioCtx
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try {
    audioCtx = new Ctor()
    return audioCtx
  } catch {
    return null
  }
}

function tone(freq: number, durationMs: number, opts: { type?: OscillatorType; gain?: number; slideTo?: number; delayMs?: number } = {}) {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})

  const start = ctx.currentTime + (opts.delayMs ?? 0) / 1000
  const end = start + durationMs / 1000

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = opts.type ?? 'sine'
  osc.frequency.setValueAtTime(freq, start)
  if (opts.slideTo) osc.frequency.linearRampToValueAtTime(opts.slideTo, end)

  const peak = opts.gain ?? 0.18
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(peak, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)

  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(end + 0.02)
}

export function playCorrect() {
  // Bright two-note chime (C5 -> G5)
  tone(523.25, 130, { type: 'triangle', gain: 0.22 })
  tone(783.99, 220, { type: 'triangle', gain: 0.22, delayMs: 110 })
}

export function playWrong() {
  // Soft descending buzz
  tone(220, 230, { type: 'square', gain: 0.13, slideTo: 130 })
}

export function playClick() {
  tone(660, 60, { type: 'sine', gain: 0.10 })
}

export function playLevelUp() {
  // Triumphant arpeggio C5 -> E5 -> G5 -> C6
  tone(523.25, 130, { type: 'triangle', gain: 0.22 })
  tone(659.25, 130, { type: 'triangle', gain: 0.22, delayMs: 120 })
  tone(783.99, 130, { type: 'triangle', gain: 0.22, delayMs: 240 })
  tone(1046.5, 260, { type: 'triangle', gain: 0.24, delayMs: 360 })
}

export function unlockAudioOnFirstGesture() {
  if (typeof window === 'undefined') return
  const handler = () => {
    const ctx = getCtx()
    if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
    window.removeEventListener('pointerdown', handler)
    window.removeEventListener('keydown', handler)
  }
  window.addEventListener('pointerdown', handler, { once: true })
  window.addEventListener('keydown', handler, { once: true })
}
