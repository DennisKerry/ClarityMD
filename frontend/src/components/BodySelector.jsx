import React, { useState } from 'react';

const REGIONS = [
  {
    name: 'Shoulder (Left)',
    joint: 'Shoulder',
    shape: { type: 'ellipse', cx: 93, cy: 140, rx: 16, ry: 13 },
    label: { x: 52, y: 132, anchor: 'end' },
    leader: { x1: 56, y1: 132, x2: 77, y2: 138 },
  },
  {
    name: 'Shoulder (Right)',
    joint: 'Shoulder',
    shape: { type: 'ellipse', cx: 207, cy: 140, rx: 16, ry: 13 },
    label: { x: 248, y: 132, anchor: 'start' },
    leader: { x1: 244, y1: 132, x2: 223, y2: 138 },
  },
  {
    name: 'Elbow (Left)',
    joint: 'Elbow',
    shape: { type: 'ellipse', cx: 68, cy: 240, rx: 13, ry: 11 },
    label: { x: 40, y: 230, anchor: 'end' },
    leader: { x1: 44, y1: 230, x2: 56, y2: 236 },
  },
  {
    name: 'Elbow (Right)',
    joint: 'Elbow',
    shape: { type: 'ellipse', cx: 232, cy: 240, rx: 13, ry: 11 },
    label: { x: 260, y: 230, anchor: 'start' },
    leader: { x1: 256, y1: 230, x2: 244, y2: 236 },
  },
  {
    name: 'Wrist (Left)',
    joint: 'Wrist',
    shape: { type: 'ellipse', cx: 61, cy: 328, rx: 11, ry: 9 },
    label: { x: 34, y: 324, anchor: 'end' },
    leader: { x1: 38, y1: 324, x2: 51, y2: 326 },
  },
  {
    name: 'Wrist (Right)',
    joint: 'Wrist',
    shape: { type: 'ellipse', cx: 239, cy: 328, rx: 11, ry: 9 },
    label: { x: 266, y: 324, anchor: 'start' },
    leader: { x1: 262, y1: 324, x2: 249, y2: 326 },
  },
  {
    name: 'Hip (Left)',
    joint: 'Hip',
    shape: { type: 'ellipse', cx: 125, cy: 315, rx: 14, ry: 12 },
    label: { x: 90, y: 308, anchor: 'end' },
    leader: { x1: 94, y1: 308, x2: 112, y2: 312 },
  },
  {
    name: 'Hip (Right)',
    joint: 'Hip',
    shape: { type: 'ellipse', cx: 175, cy: 315, rx: 14, ry: 12 },
    label: { x: 210, y: 308, anchor: 'start' },
    leader: { x1: 206, y1: 308, x2: 188, y2: 312 },
  },
  {
    name: 'Knee (Left)',
    joint: 'Knee',
    shape: { type: 'ellipse', cx: 124, cy: 415, rx: 13, ry: 11 },
    label: { x: 92, y: 410, anchor: 'end' },
    leader: { x1: 96, y1: 410, x2: 111, y2: 414 },
  },
  {
    name: 'Knee (Right)',
    joint: 'Knee',
    shape: { type: 'ellipse', cx: 176, cy: 415, rx: 13, ry: 11 },
    label: { x: 208, y: 410, anchor: 'start' },
    leader: { x1: 204, y1: 410, x2: 189, y2: 414 },
  },
  {
    name: 'Ankle (Left)',
    joint: 'Ankle',
    shape: { type: 'ellipse', cx: 124, cy: 525, rx: 11, ry: 9 },
    label: { x: 90, y: 522, anchor: 'end' },
    leader: { x1: 94, y1: 522, x2: 113, y2: 524 },
  },
  {
    name: 'Ankle (Right)',
    joint: 'Ankle',
    shape: { type: 'ellipse', cx: 176, cy: 525, rx: 11, ry: 9 },
    leader: { x1: 210, y1: 522, x2: 187, y2: 524 },
    label: { x: 214, y: 522, anchor: 'start' },
  },
  {
    name: 'Spine / Back',
    joint: 'Spine',
    shape: { type: 'rect', x: 144, y: 116, width: 12, height: 215, rx: 6, ry: 6 },
    label: { x: 212, y: 182, anchor: 'start' },
    leader: { x1: 208, y1: 182, x2: 156, y2: 210 },
  },
  {
    name: 'Neck',
    joint: 'Neck',
    shape: { type: 'ellipse', cx: 150, cy: 95, rx: 10, ry: 8 },
    label: { x: 212, y: 92, anchor: 'start' },
    leader: { x1: 208, y1: 92, x2: 160, y2: 96 },
  },
];

function RegionShape({ region, isSelected, isHovered, onClick, onHover }) {
  const fill = isSelected ? '#003087' : isHovered ? '#E8EFF8' : 'transparent';
  const stroke = isSelected ? '#003087' : isHovered ? '#0066CC' : 'none';
  const strokeWidth = isSelected ? 2 : isHovered ? 1.5 : 0;
  const opacity = isSelected ? 0.85 : isHovered ? 0.7 : 1;

  const commonProps = {
    fill,
    stroke,
    strokeWidth,
    opacity,
    style: { cursor: 'pointer', transition: 'fill 0.15s ease, stroke 0.15s ease' },
    onMouseEnter: () => onHover(region.name),
    onMouseLeave: () => onHover(''),
    onClick: () => onClick(region),
  };

  if (region.shape.type === 'rect') {
    return <rect {...commonProps} {...region.shape} />;
  }

  return <ellipse {...commonProps} {...region.shape} />;
}

export default function BodySelector({ selectedRegion, onRegionSelect }) {
  const [hoveredRegion, setHoveredRegion] = useState('');

  const handleRegionClick = (region) => {
    if (selectedRegion === region.name) {
      onRegionSelect('', '');
      return;
    }

    onRegionSelect(region.joint, region.name);
  };

  return (
    <div className="body-sel-wrap">
      <div className="body-sel-label">Select Affected Area</div>

      <svg viewBox="-30 0 360 600" style={{ width: '100%', maxWidth: '300px', display: 'block', margin: '0 auto' }}>
        <g>
          {/* Legs — drawn first so torso renders on top */}
          <path d="M 114 338 C 112 398 111 458 113 534 L 133 534 C 135 458 134 398 132 340 Z"
            fill="#C4D5EB" stroke="#5788BD" strokeWidth="1.4"/>
          <path d="M 186 338 C 188 398 189 458 187 534 L 167 534 C 165 458 166 398 168 340 Z"
            fill="#C4D5EB" stroke="#5788BD" strokeWidth="1.4"/>
          {/* Arms */}
          <path d="M 97 127 C 81 154 68 198 63 242 C 59 278 56 308 54 328 L 68 333 C 69 312 72 282 76 246 C 81 203 92 160 113 131 Z"
            fill="#C4D5EB" stroke="#5788BD" strokeWidth="1.4"/>
          <path d="M 203 127 C 219 154 232 198 237 242 C 241 278 244 308 246 328 L 232 333 C 231 312 228 282 224 246 C 219 203 208 160 187 131 Z"
            fill="#C4D5EB" stroke="#5788BD" strokeWidth="1.4"/>
          {/* Torso + pelvis */}
          <path d="M 104 108 Q 90 158 92 232 Q 93 298 112 338 L 188 338 Q 207 298 208 232 Q 210 158 196 108 Q 174 100 150 98 Q 126 100 104 108 Z"
            fill="#C4D5EB" stroke="#5788BD" strokeWidth="1.5"/>
          {/* Neck */}
          <rect x="142" y="78" width="16" height="24" rx="5" fill="#C4D5EB" stroke="#5788BD" strokeWidth="1.5"/>
          {/* Head */}
          <circle cx="150" cy="54" r="27" fill="#C4D5EB" stroke="#5788BD" strokeWidth="1.5"/>
        </g>

        {REGIONS.map((region) => {
          const isSelected = selectedRegion === region.name;
          const isHovered = hoveredRegion === region.name;

          return (
            <g key={region.name}>
              <RegionShape
                region={region}
                isSelected={isSelected}
                isHovered={isHovered}
                onClick={handleRegionClick}
                onHover={setHoveredRegion}
              />
              <line
                x1={region.leader.x1}
                y1={region.leader.y1}
                x2={region.leader.x2}
                y2={region.leader.y2}
                stroke={isSelected ? '#003087' : '#8F96A3'}
                strokeWidth="1"
              />
              <text
                x={region.label.x}
                y={region.label.y}
                textAnchor={region.label.anchor}
                fontSize="9"
                fill={isSelected ? '#003087' : '#444'}
                fontFamily="sans-serif"
                fontWeight={isSelected ? '700' : '400'}
                dominantBaseline="middle"
              >
                {region.name}
              </text>
            </g>
          );
        })}
      </svg>

    </div>
  );
}
