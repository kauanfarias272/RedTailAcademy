
// eslint-disable-next-line react-refresh/only-export-components
export const LOGO_TOKENS = {
  bg: '#0e0a08',
  paper: '#f5ead6',
  paperDim: '#e8dcc0',
  ink: '#1a1410',
  red: '#c1272d',
  redDeep: '#8b1a1f',
  gold: '#d4a04a',
  goldDeep: '#a87a2d',
  jade: '#5a8b6a',
  serif: "'Noto Serif SC', 'Songti SC', serif",
  sans: "'Inter', system-ui, sans-serif",
};

// ─────────────────────────────────────────
// Logo 1 — SELO IMPERIAL
// Composição: hanzi grande estampado em quadrado vermelho (estilo carimbo chinês)
// ─────────────────────────────────────────
export function Logo1({ dark = false }) {
  const T = LOGO_TOKENS;
  return (
    <svg viewBox="0 0 280 100" width="100%" height="100%">
      <defs>
        <pattern id="grain1" patternUnits="userSpaceOnUse" width="3" height="3">
          <rect width="3" height="3" fill={T.red}/>
          <circle cx="0.5" cy="0.5" r="0.3" fill="#0003"/>
          <circle cx="2" cy="2.2" r="0.2" fill="#0002"/>
        </pattern>
      </defs>
      {/* Selo quadrado */}
      <g transform="translate(8, 14)">
        <rect width="72" height="72" rx="3" fill="url(#grain1)" />
        <rect width="72" height="72" rx="3" fill="none" stroke={T.redDeep} strokeWidth="1.5" />
        <rect x="3" y="3" width="66" height="66" rx="1.5" fill="none" stroke="#fff" strokeWidth="0.6" opacity="0.5"/>
        {/* Hanzi 紅 (vermelho) */}
        <text x="36" y="56" textAnchor="middle"
          fontFamily={T.serif} fontSize="56" fontWeight="700" fill="#fff">紅</text>
      </g>
      {/* Wordmark */}
      <g transform="translate(96, 30)">
        <text fontFamily={T.serif} fontSize="26" fontWeight="700"
          fill={dark ? T.paper : T.ink} letterSpacing="-0.5">RedTail</text>
        <text y="24" fontFamily={T.serif} fontSize="14" fontWeight="500"
          fill={T.gold} letterSpacing="2">A C A D E M Y</text>
        <text y="44" fontFamily={T.sans} fontSize="9" fontWeight="500"
          fill={dark ? T.paperDim : '#666'} letterSpacing="1">紅尾學院 · CARPA-DRAGÃO</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────
// Logo 2 — CARPA EM CÍRCULO (mon japonês / brasão circular)
// ─────────────────────────────────────────
export function Logo2({ dark = false }) {
  const T = LOGO_TOKENS;
  return (
    <svg viewBox="0 0 280 100" width="100%" height="100%">
      <g transform="translate(50, 50)">
        {/* círculo externo */}
        <circle r="40" fill={T.red} />
        <circle r="40" fill="none" stroke={T.gold} strokeWidth="1.5" />
        <circle r="35" fill="none" stroke={T.gold} strokeWidth="0.5" opacity="0.6" />

        {/* Carpa estilizada saltando — silhueta minimal */}
        <g transform="rotate(-20)">
          {/* corpo */}
          <path d="M -22 8 Q -10 -16 8 -10 Q 22 -4 24 6 Q 22 16 8 18 Q -8 18 -22 8 Z"
            fill={T.gold} />
          {/* cauda */}
          <path d="M 22 4 L 32 -4 L 30 6 L 32 14 Z" fill={T.gold} />
          {/* olho */}
          <circle cx="14" cy="-2" r="2.2" fill={T.redDeep}/>
          <circle cx="14.6" cy="-2.6" r="0.7" fill="#fff"/>
          {/* escamas (linhas) */}
          <path d="M -8 -2 Q -2 0 -8 4" fill="none" stroke={T.redDeep} strokeWidth="1" opacity="0.7"/>
          <path d="M 0 -4 Q 6 -1 0 4" fill="none" stroke={T.redDeep} strokeWidth="1" opacity="0.7"/>
          <path d="M 8 -6 Q 14 -2 8 4" fill="none" stroke={T.redDeep} strokeWidth="1" opacity="0.7"/>
          {/* nadadeira inferior */}
          <path d="M -4 12 L -8 22 L 2 16 Z" fill={T.goldDeep}/>
        </g>

        {/* ondas decorativas embaixo */}
        <path d="M -34 22 Q -22 18 -10 22 T 14 22 T 34 22"
          fill="none" stroke={T.gold} strokeWidth="1.2" opacity="0.7"/>
      </g>

      {/* Wordmark */}
      <g transform="translate(110, 36)">
        <text fontFamily={T.serif} fontSize="24" fontWeight="700"
          fill={dark ? T.paper : T.ink} letterSpacing="-0.3">RedTail</text>
        <text y="22" fontFamily={T.serif} fontSize="13" fontWeight="500"
          fill={T.gold} letterSpacing="3">ACADEMY</text>
        <text y="40" fontFamily={T.sans} fontSize="9"
          fill={dark ? T.paperDim : '#777'} letterSpacing="0.5">Mandarim para todo mundo</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────
// Logo 3 — RT MONOGRAMA (selo + iniciais latinas)
// ─────────────────────────────────────────
export function Logo3({ dark = false }) {
  const T = LOGO_TOKENS;
  return (
    <svg viewBox="0 0 280 100" width="100%" height="100%">
      <defs>
        <pattern id="grain3" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill={T.red}/>
          <circle cx="1" cy="1" r="0.4" fill="#0003"/>
          <circle cx="3" cy="2.5" r="0.3" fill="#0002"/>
        </pattern>
      </defs>
      <g transform="translate(8, 12)">
        {/* selo */}
        <rect width="76" height="76" rx="2" fill="url(#grain3)" />
        <rect x="3" y="3" width="70" height="70" rx="1" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.6"/>
        {/* RT estilizado em serif tipo carimbo */}
        <text x="38" y="52" textAnchor="middle"
          fontFamily={T.serif} fontSize="42" fontWeight="800"
          fill="#fff" letterSpacing="-2">RT</text>
        {/* mini hanzi no canto */}
        <text x="68" y="69" textAnchor="end"
          fontFamily={T.serif} fontSize="9" fill={T.gold} fontWeight="700">紅</text>
      </g>

      <g transform="translate(100, 32)">
        <text fontFamily={T.serif} fontSize="28" fontWeight="800"
          fill={dark ? T.paper : T.ink} letterSpacing="-0.8">RedTail</text>
        <line x1="0" y1="33" x2="160" y2="33" stroke={T.gold} strokeWidth="1.2"/>
        <text y="50" fontFamily={T.sans} fontSize="11" fontWeight="600"
          fill={T.red} letterSpacing="3">ACADEMY · 學院</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────
// Logo 4 — CARPA + KANJI 鯉 (estilo lockup vertical-horizontal)
// ─────────────────────────────────────────
export function Logo4({ dark = false }) {
  const T = LOGO_TOKENS;
  return (
    <svg viewBox="0 0 280 100" width="100%" height="100%">
      {/* hanzi gigante 鯉 (carpa) à esquerda, com pincelada */}
      <g transform="translate(10, 10)">
        <text x="40" y="68" textAnchor="middle"
          fontFamily={T.serif} fontSize="80" fontWeight="700"
          fill={T.ink} style={{ filter: dark ? 'invert(1)' : 'none' }}>鯉</text>
        {/* selo pequeno embaixo do kanji */}
        <rect x="60" y="56" width="18" height="18" rx="1" fill={T.red}/>
        <text x="69" y="69" textAnchor="middle"
          fontFamily={T.serif} fontSize="13" fontWeight="700" fill="#fff">紅</text>
      </g>

      {/* divisor vertical dourado */}
      <line x1="100" y1="20" x2="100" y2="80" stroke={T.gold} strokeWidth="1.5"/>

      <g transform="translate(112, 30)">
        <text fontFamily={T.serif} fontSize="26" fontWeight="700"
          fill={dark ? T.paper : T.ink} letterSpacing="-0.4">RedTail</text>
        <text y="22" fontFamily={T.serif} fontSize="14" fontWeight="500"
          fill={T.gold} letterSpacing="2.5">ACADEMY</text>
        <text y="42" fontFamily={T.sans} fontSize="9.5" fontWeight="500"
          fill={dark ? T.paperDim : '#888'} letterSpacing="0.6">A escola da carpa que vira dragão</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────
// Logo 5 — APP ICON estilo (carpa estilizada num quadrado roundrect)
// ─────────────────────────────────────────
export function LogoAppIcon({ size = 120, variant = 'red' }) {
  const T = LOGO_TOKENS;
  const bg = variant === 'red'
    ? `linear-gradient(135deg, ${T.red}, ${T.redDeep})`
    : variant === 'paper'
    ? T.paper
    : T.bg;
  const fishColor = variant === 'paper' ? T.red : T.gold;
  const accent = variant === 'paper' ? T.gold : '#fff';
  return (
    <div style={{
      width: size, height: size,
      background: bg,
      borderRadius: size * 0.22,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)`,
    }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {/* ondas de fundo */}
        <path d="M 0 70 Q 12 65 25 70 T 50 70 T 75 70 T 100 70"
          fill="none" stroke={accent} strokeWidth="0.8" opacity={variant === 'paper' ? 0.3 : 0.25}/>
        <path d="M 0 80 Q 12 75 25 80 T 50 80 T 75 80 T 100 80"
          fill="none" stroke={accent} strokeWidth="0.6" opacity={variant === 'paper' ? 0.2 : 0.18}/>

        {/* Carpa saltando */}
        <g transform="translate(50, 48) rotate(-25)">
          <path d="M -24 8 Q -10 -18 10 -12 Q 26 -4 28 6 Q 26 18 8 20 Q -10 20 -24 8 Z"
            fill={fishColor} />
          <path d="M 24 4 L 38 -6 L 35 8 L 38 18 Z" fill={fishColor} />
          <circle cx="16" cy="-4" r="2.5" fill={variant === 'paper' ? T.redDeep : T.redDeep}/>
          <circle cx="16.8" cy="-4.8" r="0.8" fill="#fff"/>
          {/* escamas */}
          <path d="M -10 -3 Q -2 0 -10 5" fill="none" stroke={variant === 'paper' ? T.gold : T.redDeep} strokeWidth="1.2" opacity="0.7"/>
          <path d="M -2 -5 Q 6 -1 -2 6" fill="none" stroke={variant === 'paper' ? T.gold : T.redDeep} strokeWidth="1.2" opacity="0.7"/>
          <path d="M 8 -8 Q 16 -2 8 6" fill="none" stroke={variant === 'paper' ? T.gold : T.redDeep} strokeWidth="1.2" opacity="0.7"/>
          {/* barbatana */}
          <path d="M -2 14 L -8 26 L 4 18 Z" fill={variant === 'paper' ? T.goldDeep : T.redDeep} opacity="0.8"/>
        </g>

        {/* selo no canto */}
        <g transform="translate(76, 12)">
          <rect width="14" height="14" rx="1" fill={variant === 'paper' ? T.red : '#fff2'} stroke={accent} strokeWidth="0.5"/>
          <text x="7" y="11" textAnchor="middle" fontFamily={T.serif} fontSize="10" fontWeight="700"
            fill={variant === 'paper' ? '#fff' : accent}>紅</text>
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────
// Logo 6 — VERTICAL LOCKUP (para abertura de app)
// ─────────────────────────────────────────
export function LogoVertical({ dark = true }) {
  const T = LOGO_TOKENS;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 16px', gap: 14,
    }}>
      {/* Selo grande no topo com 印 */}
      <div style={{
        width: 100, height: 100,
        background: `linear-gradient(135deg, ${T.red}, ${T.redDeep})`,
        borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        boxShadow: `0 8px 24px ${T.red}66, inset 0 0 0 2px ${T.gold}88`,
      }}>
        <div style={{
          position: 'absolute', inset: 8,
          border: `1px solid ${T.gold}88`, borderRadius: 3,
        }} />
        <div style={{
          fontFamily: T.serif, fontSize: 64, fontWeight: 700, color: '#fff',
          textShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}>紅</div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: T.serif, fontSize: 30, fontWeight: 700, color: dark ? T.paper : T.ink, letterSpacing: -0.5, lineHeight: 1 }}>
          RedTail
        </div>
        <div style={{ fontFamily: T.serif, fontSize: 14, color: T.gold, letterSpacing: 4, fontWeight: 500, marginTop: 4 }}>
          A C A D E M Y
        </div>
        <div style={{ fontFamily: T.serif, fontSize: 11, color: dark ? '#9a8' : '#888', marginTop: 8, fontStyle: 'italic' }}>
          紅尾學院
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <div style={{ width: 16, height: 1, background: T.gold }} />
        <div style={{ fontFamily: T.sans, fontSize: 9.5, color: T.gold, letterSpacing: 2, fontWeight: 600 }}>
          MANDARIM SEM MEDO
        </div>
        <div style={{ width: 16, height: 1, background: T.gold }} />
      </div>
    </div>
  );
}
