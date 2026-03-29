import React, { useState } from 'react';

const REGIONS = [
  {
    name: 'Shoulder (Left)',
    joint: 'Shoulder',
    shape: { type: 'ellipse', cx: 98, cy: 140, rx: 16, ry: 13 },
    label: { x: 52, y: 132, anchor: 'end' },
    leader: { x1: 56, y1: 132, x2: 82, y2: 138 },
  },
  {
    name: 'Shoulder (Right)',
    joint: 'Shoulder',
    shape: { type: 'ellipse', cx: 202, cy: 140, rx: 16, ry: 13 },
    label: { x: 248, y: 132, anchor: 'start' },
    leader: { x1: 244, y1: 132, x2: 218, y2: 138 },
  },
  {
    name: 'Elbow (Left)',
    joint: 'Elbow',
    shape: { type: 'ellipse', cx: 70, cy: 240, rx: 13, ry: 11 },
    label: { x: 40, y: 230, anchor: 'end' },
    leader: { x1: 44, y1: 230, x2: 58, y2: 236 },
  },
  {
    name: 'Elbow (Right)',
    joint: 'Elbow',
    shape: { type: 'ellipse', cx: 230, cy: 240, rx: 13, ry: 11 },
    label: { x: 260, y: 230, anchor: 'start' },
    leader: { x1: 256, y1: 230, x2: 242, y2: 236 },
  },
  {
    name: 'Wrist (Left)',
    joint: 'Wrist',
    shape: { type: 'ellipse', cx: 58, cy: 328, rx: 11, ry: 9 },
    label: { x: 34, y: 324, anchor: 'end' },
    leader: { x1: 38, y1: 324, x2: 48, y2: 326 },
  },
  {
    name: 'Wrist (Right)',
    joint: 'Wrist',
    shape: { type: 'ellipse', cx: 242, cy: 328, rx: 11, ry: 9 },
    label: { x: 266, y: 324, anchor: 'start' },
    leader: { x1: 262, y1: 324, x2: 252, y2: 326 },
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
    shape: { type: 'ellipse', cx: 126, cy: 415, rx: 13, ry: 11 },
    label: { x: 92, y: 410, anchor: 'end' },
    leader: { x1: 96, y1: 410, x2: 112, y2: 414 },
  },
  {
    name: 'Knee (Right)',
    joint: 'Knee',
    shape: { type: 'ellipse', cx: 174, cy: 415, rx: 13, ry: 11 },
    label: { x: 208, y: 410, anchor: 'start' },
    leader: { x1: 204, y1: 410, x2: 188, y2: 414 },
  },
  {
    name: 'Ankle (Left)',
    joint: 'Ankle',
    shape: { type: 'ellipse', cx: 128, cy: 525, rx: 11, ry: 9 },
    label: { x: 94, y: 522, anchor: 'end' },
    leader: { x1: 98, y1: 522, x2: 116, y2: 524 },
  },
  {
    name: 'Ankle (Right)',
    joint: 'Ankle',
    shape: { type: 'ellipse', cx: 172, cy: 525, rx: 11, ry: 9 },
    label: { x: 206, y: 522, anchor: 'start' },
    leader: { x1: 202, y1: 522, x2: 184, y2: 524 },
  },
  {
    name: 'Spine / Back',
    joint: 'Spine',
    shape: { type: 'rect', x: 144, y: 180, width: 12, height: 170, rx: 6, ry: 6 },
    label: { x: 212, y: 214, anchor: 'start' },
    leader: { x1: 208, y1: 214, x2: 156, y2: 226 },
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

      <svg viewBox="0 0 300 600" style={{ width: '100%', maxWidth: '280px', display: 'block', margin: '0 auto' }}>
        <g>
          <circle cx="150" cy="56" r="28" fill="#f0ebe3" stroke="#c9b99a" strokeWidth="1.6" />
          <rect x="140" y="84" width="20" height="24" rx="8" fill="#f0ebe3" stroke="#c9b99a" strokeWidth="1.6" />
          <path
            d="M100 112 Q83 162 96 236 Q108 304 122 338 L178 338 Q192 304 204 236 Q217 162 200 112 Z"
            fill="#f0ebe3"
            stroke="#c9b99a"
            strokeWidth="1.6"
          />
          <path d="M100 128 Q68 182 68 252 Q68 300 58 342" fill="none" stroke="#c9b99a" strokeWidth="18" strokeLinecap="round" />
          <path d="M200 128 Q232 182 232 252 Q232 300 242 342" fill="none" stroke="#c9b99a" strokeWidth="18" strokeLinecap="round" />
          <path d="M124 338 L124 540" fill="none" stroke="#c9b99a" strokeWidth="24" strokeLinecap="round" />
          <path d="M176 338 L176 540" fill="none" stroke="#c9b99a" strokeWidth="24" strokeLinecap="round" />
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
