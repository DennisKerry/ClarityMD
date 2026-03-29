import React, { useState, useEffect } from 'react';

// ── Zoomed joint diagrams ──────────────────────────────────────────────────
const JOINT_DIAGRAMS = {
  Knee: {
    label: 'Knee Joint',
    viewBox: '0 0 200 240',
    render: (highlight) => (
      <g>
        {/* Femur shaft */}
        <rect x="82" y="0" width="36" height="80" rx="10" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Femur condyles */}
        <ellipse cx="88" cy="88" rx="18" ry="14" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        <ellipse cx="112" cy="88" rx="18" ry="14" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Meniscus */}
        <ellipse cx="88" cy="104" rx="16" ry="6" fill={highlight === 'Meniscus' ? '#0066CC' : '#b8d4e8'} stroke="#5a9bbf" strokeWidth="1" opacity="0.85" />
        <ellipse cx="112" cy="104" rx="16" ry="6" fill={highlight === 'Meniscus' ? '#0066CC' : '#b8d4e8'} stroke="#5a9bbf" strokeWidth="1" opacity="0.85" />
        {/* ACL */}
        <line x1="93" y1="100" x2="107" y2="118" stroke={highlight === 'ACL' ? '#003087' : '#8ab4cc'} strokeWidth={highlight === 'ACL' ? 4 : 2.5} strokeLinecap="round" />
        {/* PCL */}
        <line x1="107" y1="100" x2="93" y2="118" stroke={highlight === 'PCL' ? '#003087' : '#a0c0d8'} strokeWidth={highlight === 'PCL' ? 4 : 2} strokeLinecap="round" opacity="0.7" />
        {/* Tibia */}
        <rect x="80" y="118" width="40" height="90" rx="10" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Patella */}
        <ellipse cx="100" cy="96" rx="13" ry="15" fill="#f5efe8" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Cartilage highlight */}
        <ellipse cx="100" cy="112" rx="20" ry="5" fill={highlight === 'Cartilage' ? '#0066CC' : '#d4eaf5'} stroke="#8ab4cc" strokeWidth="0.8" opacity="0.7" />
        {/* Labels */}
        <text x="134" y="90" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Femur</text>
        <line x1="130" y1="88" x2="124" y2="88" stroke="#5A6B7A" strokeWidth="0.8" />
        <text x="134" y="108" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Meniscus</text>
        <line x1="130" y1="106" x2="108" y2="106" stroke="#5A6B7A" strokeWidth="0.8" />
        <text x="134" y="126" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Tibia</text>
        <line x1="130" y1="124" x2="124" y2="130" stroke="#5A6B7A" strokeWidth="0.8" />
        <text x="32" y="100" fontSize="8" fill="#003087" fontFamily="sans-serif" fontWeight="600">ACL</text>
        <line x1="52" y1="99" x2="96" y2="108" stroke="#003087" strokeWidth="0.8" />
        <text x="20" y="78" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Patella</text>
        <line x1="48" y1="78" x2="88" y2="88" stroke="#5A6B7A" strokeWidth="0.8" />
      </g>
    ),
  },
  Shoulder: {
    label: 'Shoulder Joint',
    viewBox: '0 0 200 200',
    render: (highlight) => (
      <g>
        {/* Clavicle */}
        <path d="M20 60 Q70 50 100 62" fill="none" stroke="#c9b99a" strokeWidth="10" strokeLinecap="round" />
        {/* Scapula */}
        <path d="M80 62 Q110 80 105 140 Q95 155 75 150 Q55 145 60 120 Q65 90 80 62Z" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Glenoid */}
        <ellipse cx="88" cy="80" rx="10" ry="14" fill="#d4eaf5" stroke="#8ab4cc" strokeWidth="1.2" />
        {/* Humerus head */}
        <circle cx="120" cy="78" r="32" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Rotator cuff */}
        <path d="M96 62 Q108 52 130 58 Q145 62 148 78" fill="none"
          stroke={highlight === 'Rotator Cuff' ? '#003087' : '#8ab4cc'}
          strokeWidth={highlight === 'Rotator Cuff' ? 5 : 3}
          strokeLinecap="round" opacity="0.85" />
        {/* Labrum */}
        <path d="M88 66 Q82 78 88 92" fill="none"
          stroke={highlight === 'Labrum' ? '#0066CC' : '#b8d4e8'}
          strokeWidth={highlight === 'Labrum' ? 5 : 3}
          strokeLinecap="round" />
        {/* Humerus shaft */}
        <rect x="136" y="108" width="28" height="80" rx="12" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Acromion */}
        <path d="M70 50 Q85 44 100 52 Q95 60 80 62Z" fill="#ddd0c0" stroke="#c9b99a" strokeWidth="1.2" />
        {/* Labels */}
        <text x="8" y="48" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Clavicle</text>
        <text x="56" y="170" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Scapula</text>
        <text x="130" y="195" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Humerus</text>
        <text x="8" y="68" fontSize="8" fill="#003087" fontFamily="sans-serif" fontWeight="600">Rotator</text>
        <text x="8" y="78" fontSize="8" fill="#003087" fontFamily="sans-serif" fontWeight="600">Cuff</text>
        <line x1="48" y1="72" x2="96" y2="66" stroke="#003087" strokeWidth="0.8" />
        <text x="8" y="92" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Labrum</text>
        <line x1="40" y1="91" x2="84" y2="84" stroke="#5A6B7A" strokeWidth="0.8" />
      </g>
    ),
  },
  Hip: {
    label: 'Hip Joint',
    viewBox: '0 0 200 200',
    render: (highlight) => (
      <g>
        {/* Pelvis */}
        <path d="M20 60 Q30 20 100 18 Q170 20 180 60 Q185 90 160 100 Q130 108 100 106 Q70 108 40 100 Q15 90 20 60Z"
          fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Acetabulum */}
        <circle cx="100" cy="100" r="28" fill="#d4eaf5" stroke="#8ab4cc" strokeWidth="1.5" />
        {/* Labrum */}
        <circle cx="100" cy="100" r="30" fill="none"
          stroke={highlight === 'Labrum' ? '#0066CC' : '#b8d4e8'}
          strokeWidth={highlight === 'Labrum' ? 5 : 3} opacity="0.8" />
        {/* Femoral head */}
        <circle cx="100" cy="100" r="22" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Femoral neck */}
        <path d="M112 118 Q124 136 126 160" fill="none" stroke="#c9b99a" strokeWidth="18" strokeLinecap="round" />
        {/* Femur shaft */}
        <rect x="116" y="155" width="22" height="50" rx="8" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Cartilage */}
        <circle cx="100" cy="100" r="20" fill="none"
          stroke={highlight === 'Cartilage' ? '#0066CC' : '#c8e0ef'}
          strokeWidth={highlight === 'Cartilage' ? 4 : 2} opacity="0.6" />
        {/* Labels */}
        <text x="8" y="40" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Pelvis</text>
        <text x="8" y="100" fontSize="8" fill="#003087" fontFamily="sans-serif" fontWeight="600">Acetabulum</text>
        <line x1="60" y1="99" x2="72" y2="99" stroke="#003087" strokeWidth="0.8" />
        <text x="8" y="115" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Labrum</text>
        <line x1="40" y1="114" x2="70" y2="112" stroke="#5A6B7A" strokeWidth="0.8" />
        <text x="140" y="195" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Femur</text>
      </g>
    ),
  },
  Ankle: {
    label: 'Ankle Joint',
    viewBox: '0 0 200 200',
    render: (highlight) => (
      <g>
        {/* Tibia */}
        <rect x="74" y="0" width="36" height="90" rx="10" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Fibula */}
        <rect x="116" y="10" width="20" height="85" rx="8" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Talus */}
        <ellipse cx="92" cy="108" rx="28" ry="18" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Ligaments */}
        <path d="M68 100 Q56 118 60 138"
          stroke={highlight === 'Ligament' ? '#003087' : '#8ab4cc'}
          strokeWidth={highlight === 'Ligament' ? 4 : 2.5}
          fill="none" strokeLinecap="round" />
        <path d="M118 100 Q130 118 126 138"
          stroke={highlight === 'Ligament' ? '#003087' : '#8ab4cc'}
          strokeWidth={highlight === 'Ligament' ? 4 : 2.5}
          fill="none" strokeLinecap="round" />
        {/* Calcaneus */}
        <ellipse cx="80" cy="160" rx="34" ry="22" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Cartilage */}
        <ellipse cx="92" cy="122" rx="26" ry="7"
          fill={highlight === 'Cartilage' ? '#0066CC' : '#d4eaf5'}
          stroke="#8ab4cc" strokeWidth="0.8" opacity="0.7" />
        {/* Labels */}
        <text x="30" y="45" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Tibia</text>
        <line x1="58" y1="44" x2="74" y2="44" stroke="#5A6B7A" strokeWidth="0.8" />
        <text x="142" y="55" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Fibula</text>
        <line x1="140" y1="54" x2="136" y2="54" stroke="#5A6B7A" strokeWidth="0.8" />
        <text x="8" y="120" fontSize="8" fill="#003087" fontFamily="sans-serif" fontWeight="600">Ligament</text>
        <line x1="52" y1="119" x2="62" y2="116" stroke="#003087" strokeWidth="0.8" />
        <text x="50" y="192" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Calcaneus</text>
        <text x="108" y="112" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Talus</text>
      </g>
    ),
  },
  Elbow: {
    label: 'Elbow Joint',
    viewBox: '0 0 200 220',
    render: (highlight) => (
      <g>
        {/* Humerus */}
        <rect x="80" y="0" width="36" height="80" rx="10" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Humerus condyles */}
        <ellipse cx="88" cy="90" rx="18" ry="12" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        <ellipse cx="112" cy="90" rx="18" ry="12" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* UCL */}
        <path d="M72 92 Q76 110 80 124"
          stroke={highlight === 'UCL' ? '#003087' : '#8ab4cc'}
          strokeWidth={highlight === 'UCL' ? 4 : 2.5}
          fill="none" strokeLinecap="round" />
        {/* Cartilage */}
        <ellipse cx="100" cy="104" rx="22" ry="6"
          fill={highlight === 'Cartilage' ? '#0066CC' : '#d4eaf5'}
          stroke="#8ab4cc" strokeWidth="0.8" opacity="0.7" />
        {/* Radius */}
        <rect x="108" y="114" width="22" height="90" rx="8" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Ulna */}
        <rect x="74" y="114" width="22" height="90" rx="8" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Olecranon */}
        <ellipse cx="85" cy="110" rx="14" ry="10" fill="#ddd0c0" stroke="#c9b99a" strokeWidth="1.2" />
        {/* Labels */}
        <text x="126" y="50" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Humerus</text>
        <line x1="124" y1="49" x2="116" y2="49" stroke="#5A6B7A" strokeWidth="0.8" />
        <text x="136" y="125" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Radius</text>
        <text x="38" y="125" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Ulna</text>
        <text x="8" y="94" fontSize="8" fill="#003087" fontFamily="sans-serif" fontWeight="600">UCL</text>
        <line x1="26" y1="93" x2="54" y2="96" stroke="#003087" strokeWidth="0.8" />
        <text x="8" y="112" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Olecranon</text>
        <line x1="56" y1="111" x2="72" y2="111" stroke="#5A6B7A" strokeWidth="0.8" />
      </g>
    ),
  },
  Wrist: {
    label: 'Wrist Joint',
    viewBox: '0 0 200 200',
    render: () => (
      <g>
        {/* Radius */}
        <rect x="60" y="0" width="30" height="80" rx="8" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Ulna */}
        <rect x="96" y="0" width="24" height="76" rx="8" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        {/* Carpal bones */}
        {[
          [58, 90, 26, 18], [88, 88, 24, 18], [116, 90, 26, 18],
          [62, 112, 22, 18], [88, 110, 24, 18], [116, 112, 22, 18],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill="#e0d4c4" stroke="#c9b99a" strokeWidth="1.2" />
        ))}
        {/* TFCC */}
        <ellipse cx="116" cy="82" rx="14" ry="8" fill="#b8d4e8" stroke="#5a9bbf" strokeWidth="1.2" opacity="0.85" />
        {/* Metacarpals */}
        {[58, 80, 102, 122, 142].map((x, i) => (
          <rect key={i} x={x} y={134} width="16" height="60" rx="6" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.2" />
        ))}
        {/* Labels */}
        <text x="14" y="40" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Radius</text>
        <line x1="42" y1="39" x2="60" y2="39" stroke="#5A6B7A" strokeWidth="0.8" />
        <text x="126" y="40" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Ulna</text>
        <text x="126" y="84" fontSize="8" fill="#003087" fontFamily="sans-serif" fontWeight="600">TFCC</text>
        <text x="14" y="102" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Carpals</text>
        <line x1="44" y1="101" x2="58" y2="101" stroke="#5A6B7A" strokeWidth="0.8" />
      </g>
    ),
  },
  Spine: {
    label: 'Spinal Column',
    viewBox: '0 0 200 300',
    render: (highlight) => (
      <g>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const y = 20 + i * 33;
          const isDisc = i % 2 === 1;
          return isDisc ? (
            <ellipse key={i} cx="100" cy={y + 10} rx="28" ry="8"
              fill={highlight === 'Disc' ? '#0066CC' : '#b8d4e8'}
              stroke="#5a9bbf" strokeWidth="1" opacity="0.85" />
          ) : (
            <rect key={i} x="72" y={y} width="56" height="20" rx="6"
              fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
          );
        })}
        {/* Spinal canal */}
        <rect x="96" y="20" width="8" height="244" rx="4" fill="#d4eaf5" stroke="#8ab4cc" strokeWidth="0.8" opacity="0.6" />
        {/* Labels */}
        <text x="138" y="35" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Vertebra</text>
        <line x1="136" y1="34" x2="128" y2="34" stroke="#5A6B7A" strokeWidth="0.8" />
        <text x="138" y="58" fontSize="8" fill="#003087" fontFamily="sans-serif" fontWeight="600">Disc</text>
        <line x1="136" y1="57" x2="128" y2="57" stroke="#003087" strokeWidth="0.8" />
        <text x="138" y="78" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Canal</text>
        <line x1="136" y1="77" x2="104" y2="77" stroke="#5A6B7A" strokeWidth="0.8" />
      </g>
    ),
  },
  Neck: {
    label: 'Cervical Spine',
    viewBox: '0 0 200 220',
    render: (highlight) => (
      <g>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const y = 10 + i * 28;
          const isDisc = i % 2 === 1;
          return isDisc ? (
            <ellipse key={i} cx="100" cy={y + 8} rx="30" ry="7"
              fill={highlight === 'Disc' ? '#0066CC' : '#b8d4e8'}
              stroke="#5a9bbf" strokeWidth="1" opacity="0.85" />
          ) : (
            <rect key={i} x="70" y={y} width="60" height="18" rx="5"
              fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
          );
        })}
        <rect x="94" y="10" width="12" height="182" rx="5" fill="#d4eaf5" stroke="#8ab4cc" strokeWidth="0.8" opacity="0.6" />
        <text x="140" y="25" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">C-Vertebra</text>
        <line x1="138" y1="24" x2="130" y2="24" stroke="#5A6B7A" strokeWidth="0.8" />
        <text x="140" y="46" fontSize="8" fill="#003087" fontFamily="sans-serif" fontWeight="600">Disc</text>
        <line x1="138" y1="45" x2="130" y2="45" stroke="#003087" strokeWidth="0.8" />
      </g>
    ),
  },
  Hand: {
    label: 'Hand',
    viewBox: '0 0 200 240',
    render: () => (
      <g>
        {/* Metacarpals */}
        {[30, 58, 84, 108, 130].map((x, i) => (
          <rect key={i} x={x} y={100} width="18" height="60" rx="6" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.2" />
        ))}
        {/* Proximal phalanges */}
        {[30, 58, 84, 108, 130].map((x, i) => (
          <rect key={i} x={x} y={168} width="18" height="32" rx="5" fill="#e0d4c4" stroke="#c9b99a" strokeWidth="1.2" />
        ))}
        {/* Distal phalanges */}
        {[30, 58, 84, 108, 130].map((x, i) => (
          <rect key={i} x={x} y={204} width="18" height="24" rx="5" fill="#d8cbb8" stroke="#c9b99a" strokeWidth="1.2" />
        ))}
        {/* Carpal row */}
        {[26, 52, 78, 104, 130, 150].map((x, i) => (
          <rect key={i} x={x} y={76} width="20" height="18" rx="5" fill="#e0d4c4" stroke="#c9b99a" strokeWidth="1.2" />
        ))}
        {/* Wrist */}
        <rect x="26" y="50" width="144" height="22" rx="8" fill="#e8ddd0" stroke="#c9b99a" strokeWidth="1.5" />
        <text x="8" y="64" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Wrist</text>
        <text x="8" y="92" fontSize="8" fill="#5A6B7A" fontFamily="sans-serif">Carpals</text>
        <text x="8" y="136" fontSize="8" fill="#003087" fontFamily="sans-serif" fontWeight="600">MCP</text>
        <line x1="28" y1="135" x2="30" y2="130" stroke="#003087" strokeWidth="0.8" />
      </g>
    ),
  },
};

// ── Full body silhouette with glow ─────────────────────────────────────────
const JOINT_GLOW_POSITIONS = {
  Knee:     [{ cx: 126, cy: 415, r: 18 }, { cx: 174, cy: 415, r: 18 }],
  Shoulder: [{ cx: 98,  cy: 140, r: 18 }, { cx: 202, cy: 140, r: 18 }],
  Hip:      [{ cx: 125, cy: 315, r: 18 }, { cx: 175, cy: 315, r: 18 }],
  Ankle:    [{ cx: 128, cy: 525, r: 16 }, { cx: 172, cy: 525, r: 16 }],
  Elbow:    [{ cx: 70,  cy: 240, r: 16 }, { cx: 230, cy: 240, r: 16 }],
  Wrist:    [{ cx: 58,  cy: 328, r: 14 }, { cx: 242, cy: 328, r: 14 }],
  Spine:    [{ cx: 150, cy: 265, r: 22 }],
  Neck:     [{ cx: 150, cy: 95,  r: 14 }],
  Hand:     [{ cx: 58,  cy: 342, r: 14 }, { cx: 242, cy: 342, r: 14 }],
};

function BodySilhouette({ joint }) {
  const glows = JOINT_GLOW_POSITIONS[joint] || [];

  return (
    <svg viewBox="0 0 300 600" style={{ width: '100%', maxWidth: '130px', display: 'block', margin: '0 auto' }}>
      <defs>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0066CC" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0066CC" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Body */}
      <g opacity="0.55">
        <circle cx="150" cy="56" r="28" fill="#c9b99a" />
        <rect x="140" y="84" width="20" height="24" rx="8" fill="#c9b99a" />
        <path d="M100 112 Q83 162 96 236 Q108 304 122 338 L178 338 Q192 304 204 236 Q217 162 200 112 Z" fill="#c9b99a" />
        <path d="M100 128 Q68 182 68 252 Q68 300 58 342" fill="none" stroke="#c9b99a" strokeWidth="18" strokeLinecap="round" />
        <path d="M200 128 Q232 182 232 252 Q232 300 242 342" fill="none" stroke="#c9b99a" strokeWidth="18" strokeLinecap="round" />
        <path d="M124 338 L124 540" fill="none" stroke="#c9b99a" strokeWidth="24" strokeLinecap="round" />
        <path d="M176 338 L176 540" fill="none" stroke="#c9b99a" strokeWidth="24" strokeLinecap="round" />
      </g>

      {/* Glow spots */}
      {glows.map((g, i) => (
        <g key={i}>
          <circle cx={g.cx} cy={g.cy} r={g.r * 2.2} fill="url(#glowGrad)" />
          <circle cx={g.cx} cy={g.cy} r={g.r} fill="#0066CC" opacity="0.9" filter="url(#glow)" />
          <circle cx={g.cx} cy={g.cy} r={g.r * 0.5} fill="white" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────
export default function AnatomyPanel({ procedures }) {
  const [activeTab, setActiveTab] = useState('diagram');
  const [pulse, setPulse] = useState(true);

  const joint = procedures?.[0]?.procedure
    ? (() => {
        const p = procedures[0];
        // Try to infer joint from procedure name or product category
        const text = `${p.procedure} ${p.product_category || ''}`.toLowerCase();
        if (text.includes('knee') || text.includes('acl') || text.includes('pcl') || text.includes('menisk') || text.includes('menisc')) return 'Knee';
        if (text.includes('shoulder') || text.includes('rotator') || text.includes('labr') || text.includes('bankart')) return 'Shoulder';
        if (text.includes('hip')) return 'Hip';
        if (text.includes('ankle') || text.includes('achilles')) return 'Ankle';
        if (text.includes('elbow') || text.includes('ucl') || text.includes('tennis') || text.includes('golfer')) return 'Elbow';
        if (text.includes('wrist') || text.includes('tfcc') || text.includes('carpal')) return 'Wrist';
        if (text.includes('spine') || text.includes('lumbar') || text.includes('disc') || text.includes('vertebr')) return 'Spine';
        if (text.includes('neck') || text.includes('cervical')) return 'Neck';
        if (text.includes('hand') || text.includes('finger') || text.includes('thumb')) return 'Hand';
        return null;
      })()
    : null;

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 3000);
    return () => clearTimeout(t);
  }, [joint]);

  useEffect(() => { setPulse(true); const t = setTimeout(() => setPulse(false), 3000); return () => clearTimeout(t); }, [joint]);

  const diagram = joint ? JOINT_DIAGRAMS[joint] : null;

  const topProc = procedures?.[0];

  return (
    <div className="card anat-panel">
      <div className="anat-header">
        <div className="anat-title">
          <div className="anat-title-icon">
            <svg viewBox="0 0 24 24"><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
          </div>
          Anatomy
        </div>
        <div className="anat-subtitle">Affected region &amp; procedure target</div>
      </div>

      {topProc && (
        <div className="anat-proc-chip">{topProc.procedure}</div>
      )}

      <div className="anat-tabs">
        <button className={`anat-tab${activeTab === 'diagram' ? ' active' : ''}`} onClick={() => setActiveTab('diagram')}>
          Joint Detail
        </button>
        <button className={`anat-tab${activeTab === 'body' ? ' active' : ''}`} onClick={() => setActiveTab('body')}>
          Body Overview
        </button>
      </div>

      {!joint ? (
        <div className="anat-no-joint">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="4" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="20"/><line x1="4" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="20" y2="12"/></svg>
          <span>Anatomy diagram will appear after procedure recommendation</span>
        </div>
      ) : activeTab === 'diagram' ? (
        <div className="anat-diagram-row">
          <div className="anat-body-col">
            <div className={pulse ? 'anat-pulse-ring' : ''}>
              <BodySilhouette joint={joint} />
            </div>
            <div className="anat-body-label">{joint}</div>
          </div>

          <div className="anat-zoom-col">
            <div className="anat-zoom-label">{diagram?.label || joint}</div>
            {diagram ? (
              <svg viewBox={diagram.viewBox} style={{ width: '100%', maxWidth: '160px', display: 'block' }}>
                {diagram.render(null)}
              </svg>
            ) : (
              <div className="anat-no-diagram">Diagram not available</div>
            )}
            <div className="anat-legend-row">
              <div className="anat-legend-item"><div className="anat-legend-dot" style={{ background: '#e8ddd0' }} />Bone</div>
              <div className="anat-legend-item"><div className="anat-legend-dot" style={{ background: '#b8d4e8' }} />Cartilage</div>
              <div className="anat-legend-item"><div className="anat-legend-dot" style={{ background: '#003087' }} />Key structure</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="anat-body-overview">
          <BodySilhouette joint={joint} />
          <div className="anat-body-overview-label">
            Highlighted area indicates the <strong>{joint}</strong> region targeted by the top procedure
          </div>
        </div>
      )}

      {topProc?.recovery_weeks && (
        <div className="anat-recovery-note">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Expected recovery for <strong>{topProc.procedure}</strong>: ~{topProc.recovery_weeks} weeks</span>
        </div>
      )}
    </div>
  );
}
