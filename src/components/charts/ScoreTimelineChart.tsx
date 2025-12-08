import { useState } from 'react';

interface ScoreTimelineChartProps {
  assessments: Array<{
    date: Date;
    score: number;
  }>;
}

export function ScoreTimelineChart({ assessments }: ScoreTimelineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  if (assessments.length === 0) return null;

  const sortedAssessments = [...assessments].sort((a, b) => a.date.getTime() - b.date.getTime());

  const maxScore = 100;
  const minScore = 0;
  const width = 800;
  const height = 300;
  const padding = { top: 80, right: 40, bottom: 60, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xStep = chartWidth / (sortedAssessments.length - 1 || 1);

  const getY = (score: number) => {
    const normalized = (score - minScore) / (maxScore - minScore);
    return chartHeight - normalized * chartHeight;
  };

  const pathData = sortedAssessments
    .map((assessment, i) => {
      const x = i * xStep;
      const y = getY(assessment.score);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={0}
                y1={getY(tick)}
                x2={chartWidth}
                y2={getY(tick)}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={-10}
                y={getY(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-gray-600"
              >
                {tick}
              </text>
            </g>
          ))}

          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {sortedAssessments.map((assessment, i) => {
            const x = i * xStep;
            const y = getY(assessment.score);
            const isHovered = hoveredPoint === i;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 8 : 5}
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth={2}
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {isHovered && (
                  <>
                    <defs>
                      <filter id={`tooltip-shadow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                        <feOffset dx="0" dy="6" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.25"/>
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <g style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                      <rect
                        x={x - 60}
                        y={y - 80}
                        width={120}
                        height={68}
                        fill="white"
                        rx={12}
                        filter={`url(#tooltip-shadow-${i})`}
                      />
                      <rect
                        x={x - 56}
                        y={y - 76}
                        width={112}
                        height={60}
                        fill="#f8fafc"
                        rx={10}
                      />
                      <circle
                        cx={x}
                        cy={y - 56}
                        r={20}
                        fill="#3b82f6"
                        opacity={0.1}
                      />
                      <text
                        x={x}
                        y={y - 48}
                        textAnchor="middle"
                        className="text-3xl font-bold fill-blue-600"
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      >
                        {assessment.score.toFixed(0)}
                      </text>
                      <rect
                        x={x - 40}
                        y={y - 35}
                        width={80}
                        height={1}
                        fill="#e2e8f0"
                      />
                      <text
                        x={x}
                        y={y - 22}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-gray-700"
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      >
                        {assessment.date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </text>
                      <polygon
                        points={`${x},${y - 12} ${x - 8},${y - 20} ${x + 8},${y - 20}`}
                        fill="white"
                        filter={`url(#tooltip-shadow-${i})`}
                      />
                      <polygon
                        points={`${x},${y - 14} ${x - 6},${y - 20} ${x + 6},${y - 20}`}
                        fill="#f8fafc"
                      />
                    </g>
                  </>
                )}
                <text
                  x={x}
                  y={chartHeight + 30}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                  transform={`rotate(-45, ${x}, ${chartHeight + 30})`}
                >
                  {assessment.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </text>
              </g>
            );
          })}

          <text
            x={chartWidth / 2}
            y={chartHeight + 50}
            textAnchor="middle"
            className="text-sm font-semibold fill-gray-700"
          >
            Assessment Date
          </text>

          <text
            x={-chartHeight / 2}
            y={-45}
            textAnchor="middle"
            transform="rotate(-90)"
            className="text-sm font-semibold fill-gray-700"
          >
            Score
          </text>
        </g>
      </svg>
    </div>
  );
}
