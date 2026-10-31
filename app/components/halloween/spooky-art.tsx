interface ArtProps {
  className?: string;
}

export function Pumpkin({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M46 22 C45 14 42 9 37 6 L47 3 C52 8 55 14 55 22 Z"
        fill="#4d7c0f"
      />
      <ellipse cx="22" cy="58" rx="19" ry="33" fill="#c2410c" />
      <ellipse cx="78" cy="58" rx="19" ry="33" fill="#c2410c" />
      <ellipse cx="35" cy="58" rx="21" ry="36" fill="#ea580c" />
      <ellipse cx="65" cy="58" rx="21" ry="36" fill="#ea580c" />
      <ellipse cx="50" cy="58" rx="17" ry="37" fill="#ff7a18" />
      <g fill="#ffe066" className="animate-flicker">
        <path d="M24 46 L38 46 L31 32 Z" />
        <path d="M62 46 L76 46 L69 32 Z" />
        <path d="M45 58 L55 58 L50 49 Z" />
        <path d="M19 62 L27 68 L33 62 L39 69 L46 63 L50 69 L54 63 L61 69 L67 62 L73 68 L81 62 C79 76 66 84 50 84 C34 84 21 76 19 62 Z" />
      </g>
      <g fill="#ea580c">
        <rect x="34" y="72" width="6" height="7" />
        <rect x="58" y="72" width="6" height="7" />
      </g>
    </svg>
  );
}

export function Bat({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden="true">
      <path
        d="M28 4 L30 9 C31 8.6 33 8.6 34 9 L36 4 L37.5 12 C41 7 50 3 63 6 C59 9 57 13 57.5 19 C54 15.5 50 15.5 47 19 C44.5 16 41 16 38 21 C36.5 24 34 28 32 30 C30 28 27.5 24 26 21 C23 16 19.5 16 17 19 C14 15.5 10 15.5 6.5 19 C7 13 5 9 1 6 C14 3 23 7 26.5 12 Z"
        fill="#05020a"
      />
      <circle cx="29.8" cy="12.5" r="1" fill="#ffb454" />
      <circle cx="34.2" cy="12.5" r="1" fill="#ffb454" />
    </svg>
  );
}

export function Ghost({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 80" className={className} aria-hidden="true">
      <path
        d="M8 36 C8 14 20 4 32 4 C44 4 56 14 56 36 V72 L48 64 L40 72 L32 64 L24 72 L16 64 L8 72 Z"
        fill="#f5eddc"
      />
      <ellipse cx="24" cy="32" rx="5" ry="7" fill="#0b0612" />
      <ellipse cx="40" cy="32" rx="5" ry="7" fill="#0b0612" />
      <ellipse cx="32" cy="47" rx="6" ry="8" fill="#0b0612" />
    </svg>
  );
}

export function Spider({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 48 40" className={className} aria-hidden="true">
      <g fill="none" stroke="#05020a" strokeWidth="2" strokeLinecap="round">
        <path d="M20 18 L10 10 L3 16" />
        <path d="M19 21 L8 19 L1 27" />
        <path d="M20 24 L10 27 L5 37" />
        <path d="M22 26 L16 33 L14 39" />
        <path d="M28 18 L38 10 L45 16" />
        <path d="M29 21 L40 19 L47 27" />
        <path d="M28 24 L38 27 L43 37" />
        <path d="M26 26 L32 33 L34 39" />
      </g>
      <ellipse cx="24" cy="23" rx="8" ry="9" fill="#05020a" />
      <circle cx="24" cy="12" r="5" fill="#05020a" />
      <circle cx="22" cy="11" r="1.2" fill="#d3122a" />
      <circle cx="26" cy="11" r="1.2" fill="#d3122a" />
    </svg>
  );
}

const WEB_RADIALS = [0, 18, 36, 54, 72, 90].map((degrees) => {
  const radians = (degrees * Math.PI) / 180;
  return { x: Math.cos(radians), y: Math.sin(radians) };
});

const WEB_RINGS = [40, 75, 112, 150, 190];

const point = (value: number) => value.toFixed(1);

// A corner web: spokes fan out from (0,0), rings sag back towards the corner
export function SpiderWeb({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="#b9adc9"
      strokeWidth="0.8"
      aria-hidden="true"
    >
      {WEB_RADIALS.map(({ x, y }) => (
        <path
          key={`${x}-${y}`}
          d={`M0 0 L${point(x * 200)} ${point(y * 200)}`}
        />
      ))}
      {WEB_RINGS.flatMap((radius) =>
        WEB_RADIALS.slice(1).map((end, index) => {
          const start = WEB_RADIALS[index];
          const sagX = ((start.x + end.x) / 2) * radius * 0.82;
          const sagY = ((start.y + end.y) / 2) * radius * 0.82;
          return (
            <path
              key={`${radius}-${index}`}
              d={`M${point(start.x * radius)} ${point(start.y * radius)} Q${point(sagX)} ${point(sagY)} ${point(end.x * radius)} ${point(end.y * radius)}`}
            />
          );
        }),
      )}
    </svg>
  );
}

export function Moon({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="moon-surface" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#fff4d6" />
          <stop offset="65%" stopColor="#ffd98a" />
          <stop offset="100%" stopColor="#f29f4b" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#moon-surface)" />
      <g fill="#e39a4a" opacity="0.4">
        <circle cx="66" cy="62" r="17" />
        <circle cx="132" cy="48" r="9" />
        <circle cx="142" cy="108" r="21" />
        <circle cx="52" cy="124" r="11" />
        <circle cx="98" cy="154" r="14" />
      </g>
    </svg>
  );
}

/** Drawn in the moon's 200x200 box so it sits on the moon at rest. */
export function Witch({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {/* Witch on a broomstick */}
      <g
        transform="translate(36 72) scale(1.08) rotate(-7 60 40)"
        fill="#05020a"
      >
        <path
          d="M2 50 L112 38"
          stroke="#05020a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M22 48 L-10 40 L-4 49 L-14 53 L-4 56 L-9 65 Z" />
        <path d="M48 46 C45 32 50 24 57 21 C65 24 72 32 75 41 Z" />
        <path d="M54 30 L30 20 L37 31 L25 36 L37 39 L30 47 L52 44 Z" />
        <path d="M62 45 L72 58 L80 58 L80 55 L74 54 L68 42 Z" />
        <path d="M63 27 L80 34 L80 37 L60 33 Z" />
        <circle cx="60" cy="16" r="6.5" />
        <path d="M65 13 L72 17 L65 19 Z" />
        <path d="M46 13 L72 9 L72 12 L46 16 Z" />
        <path d="M51 12 L66 10 L55 -8 Z" />
      </g>
    </svg>
  );
}

/** Shambling zombie facing right, arms out. */
export function Zombie({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 100" className={className} aria-hidden="true">
      <g
        fill="#2f4f24"
        stroke="#0b0612"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        {/* Back arm */}
        <path d="M30 31 L52 27 L55 30 L33 36 Z" />
        {/* Legs: one dragging behind */}
        <path d="M24 60 L17 95 L25 96 L30 62 Z" />
        <path d="M33 60 L40 79 L37 96 L45 96 L47 78 L40 58 Z" />
        {/* Torn shirt */}
        <path
          d="M22 28 C26 25 34 25 39 28 L41 61 L37 58 L34 63 L30 58 L26 63 L22 59 Z"
          fill="#5b3f7d"
        />
        {/* Head, lolling forward */}
        <ellipse cx="33" cy="17" rx="9" ry="10" transform="rotate(12 33 17)" />
        {/* Front arm */}
        <path d="M33 33 L58 35 L60 39 L57 41 L34 39 Z" />
      </g>
      <circle cx="36" cy="15" r="1.8" fill="#9dff3c" />
      <circle cx="40.5" cy="16.5" r="1.5" fill="#9dff3c" />
    </svg>
  );
}

/** A rough wooden grave cross, charred at the base. */
export function WoodenCross({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 40 80" className={className} aria-hidden="true">
      <g stroke="#0b0612" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M17 2 L23 1 L24 80 L16 80 Z" fill="#4a2e1a" />
        <path d="M4 17 L36 15 L36 22 L4 23 Z" fill="#5a3820" />
      </g>
      <path d="M16 60 L24 58 L24 80 L16 80 Z" fill="#1a0e08" opacity="0.8" />
    </svg>
  );
}

export function Flame({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 40 60" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="flame-fill" cx="50%" cy="78%" r="70%">
          <stop offset="0%" stopColor="#fff2b0" />
          <stop offset="35%" stopColor="#ffb454" />
          <stop offset="75%" stopColor="#ff5a18" />
          <stop offset="100%" stopColor="#d3122a" />
        </radialGradient>
      </defs>
      <path
        d="M20 0 C25 13 37 21 37 38 C37 51 29 60 20 60 C11 60 3 51 3 38 C3 27 11 22 13 12 C16 18 18 20 20 0 Z"
        fill="url(#flame-fill)"
      />
    </svg>
  );
}

export function Graveyard({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 1600 300" className={className} aria-hidden="true">
      {/* Far hill with the haunted house */}
      <path
        d="M0 240 C200 190 420 215 640 205 C860 195 1000 150 1210 150 C1380 150 1500 185 1600 200 V300 H0 Z"
        fill="#1a0e2b"
      />
      <g fill="#1a0e2b">
        <rect x="1120" y="90" width="170" height="80" />
        <rect x="1170" y="55" width="70" height="50" />
        <rect x="1100" y="60" width="34" height="110" />
        <rect x="1276" y="70" width="30" height="100" />
        <path d="M1092 62 L1117 8 L1142 62 Z" />
        <path d="M1269 72 L1291 26 L1313 72 Z" />
        <path d="M1160 58 L1205 14 L1250 58 Z" />
        <path d="M1110 94 L1205 50 L1300 94 Z" />
        <rect x="1216" y="20" width="10" height="26" />
      </g>
      <g fill="#ffb454" className="animate-flicker">
        <path d="M1110 82 Q1117 68 1124 82 V100 H1110 Z" />
        <rect x="1148" y="112" width="20" height="26" />
        <rect x="1242" y="112" width="20" height="26" />
        <path d="M1195 74 Q1205 60 1215 74 V92 H1195 Z" />
        <rect x="1284" y="94" width="14" height="20" />
      </g>
      <path d="M1192 170 V134 Q1205 118 1218 134 V170 Z" fill="#05020a" />

      {/* Near hill */}
      <path
        d="M0 262 C180 232 360 250 560 246 C780 241 920 218 1130 226 C1300 232 1460 248 1600 236 V300 H0 Z"
        fill="#05020a"
      />

      {/* Dead tree */}
      <path
        d="M226 250 C232 200 228 170 214 136 L196 104 L208 112 L205 74 L218 116 C222 124 226 130 230 136 L240 96 L262 58 L250 100 L272 82 L244 128 C242 150 246 170 252 190 L290 148 L326 134 L296 158 L256 212 C254 226 256 238 262 250 Z"
        fill="#05020a"
      />

      {/* Gravestones and crosses */}
      <g fill="#05020a">
        <path d="M60 268 V226 Q60 204 84 204 Q108 204 108 226 V268 Z" />
        <path d="M150 262 V232 H136 V220 H150 V204 H164 V220 H178 V232 H164 V262 Z" />
        <path d="M360 262 V222 Q360 202 382 202 Q404 202 404 222 V262 Z" />
        <rect x="462" y="210" width="46" height="52" rx="3" />
        <path d="M586 258 V226 H572 V214 H586 V198 H600 V214 H614 V226 H600 V258 Z" />
        <path d="M690 258 V216 Q690 192 716 192 Q742 192 742 216 V258 Z" />
        <path d="M852 250 V218 H838 V206 H852 V190 H866 V206 H880 V218 H866 V250 Z" />
        <path d="M950 246 V206 Q950 184 974 184 Q998 184 998 206 V246 Z" />
        <rect x="1440" y="196" width="44" height="60" rx="3" />
      </g>

      {/* Iron fence */}
      <g fill="#05020a">
        <rect x="1040" y="192" width="360" height="5" />
        <rect x="1040" y="220" width="360" height="5" />
        <path d="M1050 240 V180 L1054 170 L1058 180 V240 Z M1080 240 V180 L1084 170 L1088 180 V240 Z M1110 240 V180 L1114 170 L1118 180 V240 Z M1140 240 V180 L1144 170 L1148 180 V240 Z M1260 240 V180 L1264 170 L1268 180 V240 Z M1290 240 V180 L1294 170 L1298 180 V240 Z M1320 240 V180 L1324 170 L1328 180 V240 Z M1350 240 V180 L1354 170 L1358 180 V240 Z M1380 240 V180 L1384 170 L1388 180 V240 Z" />
      </g>

      {/* Glowing pumpkin patch */}
      <g fill="#ea580c">
        <ellipse cx="290" cy="274" rx="24" ry="19" />
        <ellipse cx="1000" cy="262" rx="20" ry="16" />
        <ellipse cx="1520" cy="262" rx="26" ry="20" />
      </g>
      <g fill="#ffe066" className="animate-flicker">
        <path d="M278 270 L286 270 L282 262 Z M294 270 L302 270 L298 262 Z M278 278 Q290 288 302 278 Q290 282 278 278 Z" />
        <path d="M990 259 L997 259 L993.5 252 Z M1003 259 L1010 259 L1006.5 252 Z M990 266 Q1000 275 1010 266 Q1000 270 990 266 Z" />
        <path d="M1507 258 L1516 258 L1511.5 249 Z M1524 258 L1533 258 L1528.5 249 Z M1507 267 Q1520 278 1533 267 Q1520 272 1507 267 Z" />
      </g>
    </svg>
  );
}

export function BloodDrips({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 1600 80"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 0 H1600 V14 C1580 14 1574 18 1570 30 C1566 44 1552 44 1549 30 C1546 18 1530 12 1500 14 C1470 16 1462 18 1458 44 C1455 72 1436 72 1434 44 C1432 20 1412 12 1370 14 C1330 16 1322 18 1318 26 C1314 36 1300 36 1298 26 C1295 16 1270 12 1230 14 C1190 16 1180 20 1177 52 C1175 76 1158 76 1156 52 C1154 22 1130 12 1080 14 C1040 16 1030 18 1027 28 C1024 40 1010 40 1008 28 C1006 16 980 12 930 14 C890 16 880 20 877 38 C874 58 858 58 856 38 C854 20 830 12 780 14 C740 16 730 20 727 60 C725 78 708 78 706 60 C704 22 680 12 630 14 C590 16 580 18 577 26 C574 36 560 36 558 26 C556 16 530 12 480 14 C440 16 430 20 427 42 C424 64 408 64 406 42 C404 20 380 12 330 14 C290 16 280 20 277 30 C274 42 260 42 258 30 C256 18 230 12 190 14 C150 16 140 20 137 54 C135 76 118 76 116 54 C114 22 90 12 50 14 C30 15 10 14 0 14 Z"
        fill="#8f0b1c"
      />
    </svg>
  );
}

// Slime oozing down from the top edge of a panel; the parent must be `relative`
export function SlimeDrips({ className = "" }: ArtProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 w-full h-6 xl:h-8"
      >
        <path
          d="M0 0 H400 V6 C390 6 386 8 384 16 C382 24 374 24 372 16 C370 8 350 5 330 6 C312 7 308 10 306 26 C304 38 294 38 292 26 C290 10 270 5 240 6 C222 7 218 9 216 14 C214 20 206 20 204 14 C202 8 180 5 150 6 C130 7 126 10 124 30 C122 40 112 40 110 30 C108 10 90 5 64 6 C50 7 46 9 44 18 C42 26 34 26 32 18 C30 9 16 6 0 6 Z"
          fill="#9dff3c"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}
