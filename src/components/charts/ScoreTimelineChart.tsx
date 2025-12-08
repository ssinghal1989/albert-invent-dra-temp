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
  const padding = { top: 20, right: 40, bottom: 60, left: 60 };

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
                    <rect
                      x={x - 35}
                      y={y - 40}
                      width={70}
                      height={30}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      rx={6}
                      className="drop-shadow-lg"
                    />
                    <text
                      x={x}
                      y={y - 30}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-gray-900"
                    >
                      Score: {assessment.score.toFixed(1)}
                    </text>
                    <text
                      x={x}
                      y={y - 18}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {assessment.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </text>
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
