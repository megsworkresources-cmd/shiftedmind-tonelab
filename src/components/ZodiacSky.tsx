import { SIGNS } from '../zodiac/signs';

/**
 * Decorative constellation layer for the hero.
 *
 * It lives inside the single `.sky` layer, so it inherits the rules that make
 * decoration unable to paint over copy: z-index 0, pointer-events none, capped
 * height, and behind the scrim. Hidden below 640px, where the hero text wraps
 * into the space the stars would occupy.
 */
const PLACEMENT: Record<string, { x: number; y: number; rotate: number; delay: number }> = {
  aries: { x: 104, y: 8, rotate: -12, delay: 0 },
  taurus: { x: 126, y: 6, rotate: 8, delay: 1.4 },
  gemini: { x: 148, y: 12, rotate: -6, delay: 2.8 },
  cancer: { x: 106, y: 22, rotate: 16, delay: 0.7 },
  leo: { x: 130, y: 20, rotate: -14, delay: 2.1 },
  virgo: { x: 152, y: 28, rotate: 6, delay: 3.5 },
  libra: { x: 104, y: 36, rotate: 10, delay: 1.1 },
  scorpio: { x: 128, y: 34, rotate: -8, delay: 2.5 },
  sagittarius: { x: 150, y: 42, rotate: 14, delay: 0.4 },
  capricorn: { x: 108, y: 48, rotate: -16, delay: 1.8 },
  aquarius: { x: 132, y: 47, rotate: 6, delay: 3.2 },
  pisces: { x: 152, y: 54, rotate: -10, delay: 0.9 },
};

const SIZE = 9;

export default function ZodiacSky() {
  return (
    <div className="constellation-field hidden sm:block" aria-hidden="true">
      <svg viewBox="0 0 160 60" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <radialGradient id="star-glow">
            <stop offset="0%" stopColor="#fff6e6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff6e6" stopOpacity="0" />
          </radialGradient>
        </defs>
        {SIGNS.map((sign) => {
          const at = PLACEMENT[sign.id];
          if (!at) return null;
          const edges = sign.edges ?? sign.stars.map((_, index) => [index, index + 1] as [number, number]).slice(0, -1);
          return (
            <g
              key={sign.id}
              className="constellation"
              transform={`translate(${at.x} ${at.y}) rotate(${at.rotate})`}
              style={{ animationDelay: `${at.delay}s` }}
            >
              {edges.map(([from, to], index) => {
                const a = sign.stars[from];
                const b = sign.stars[to];
                if (!a || !b) return null;
                return (
                  <line
                    key={`edge-${index}`}
                    x1={a[0] * SIZE}
                    y1={a[1] * SIZE * 0.62}
                    x2={b[0] * SIZE}
                    y2={b[1] * SIZE * 0.62}
                    stroke="rgba(255, 242, 220, 0.5)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              {sign.stars.map(([x, y], index) => (
                <g key={`star-${index}`} transform={`translate(${x * SIZE} ${y * SIZE * 0.62})`}>
                  <circle r="1.6" fill="url(#star-glow)" opacity="0.55" />
                  <circle r="0.42" fill="#fff8ec" opacity="0.9" />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
