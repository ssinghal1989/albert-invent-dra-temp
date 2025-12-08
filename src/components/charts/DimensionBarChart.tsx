import { useState } from 'react';

interface DimensionBarChartProps {
  dimensions: Array<{
    name: string;
    myScore: number;
    teamAverage: number | null;
  }>;
}

export function DimensionBarChart({ dimensions }: DimensionBarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<{ index: number; type: 'my' | 'team' } | null>(null);

  if (dimensions.length === 0) return null;

  const maxScore = 100;
  const barGroupWidth = 60;
  const width = Math.max(1200, dimensions.length * barGroupWidth + 160);
  const height = 500;
  const padding = { top: 20, right: 120, bottom: 180, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const barWidth = chartWidth / dimensions.length;
  const barPadding = Math.max(8, barWidth * 0.15);
  const actualBarWidth = (barWidth - barPadding) / 2;

  const getY = (score: number) => {
    return chartHeight - (score / maxScore) * chartHeight;
  };

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full overflow-x-auto pb-4">
      <svg width={width} height={height}>
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>
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

          {dimensions.map((dimension, i) => {
            const x = i * barWidth;
            const myBarX = x + barPadding / 2;
            const teamBarX = myBarX + actualBarWidth + 2;

            const myBarHeight = chartHeight - getY(dimension.myScore);
            const teamBarHeight =
              dimension.teamAverage !== null ? chartHeight - getY(dimension.teamAverage) : 0;

            const isMyBarHovered = hoveredBar?.index === i && hoveredBar?.type === 'my';
            const isTeamBarHovered = hoveredBar?.index === i && hoveredBar?.type === 'team';

            return (
              <g key={i}>
                <rect
                  x={myBarX}
                  y={getY(dimension.myScore)}
                  width={actualBarWidth}
                  height={Math.max(myBarHeight, 2)}
                  fill={isMyBarHovered ? "#2563eb" : "#3b82f6"}
                  rx={3}
                  className="transition-all cursor-pointer"
                  filter={isMyBarHovered ? "url(#shadow)" : undefined}
                  onMouseEnter={() => setHoveredBar({ index: i, type: 'my' })}
                  onMouseLeave={() => setHoveredBar(null)}
                />

                {dimension.teamAverage !== null && (
                  <rect
                    x={teamBarX}
                    y={getY(dimension.teamAverage)}
                    width={actualBarWidth}
                    height={Math.max(teamBarHeight, 2)}
                    fill={isTeamBarHovered ? "#059669" : "#10b981"}
                    rx={3}
                    className="transition-all cursor-pointer"
                    filter={isTeamBarHovered ? "url(#shadow)" : undefined}
                    onMouseEnter={() => setHoveredBar({ index: i, type: 'team' })}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                )}

                {isMyBarHovered && (
                  <>
                    <rect
                      x={myBarX + actualBarWidth / 2 - 40}
                      y={getY(dimension.myScore) - 32}
                      width={80}
                      height={26}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      rx={6}
                      filter="url(#shadow)"
                    />
                    <text
                      x={myBarX + actualBarWidth / 2}
                      y={getY(dimension.myScore) - 14}
                      textAnchor="middle"
                      className="text-xs font-bold fill-gray-900"
                    >
                      {dimension.myScore.toFixed(1)}%
                    </text>
                  </>
                )}

                {isTeamBarHovered && dimension.teamAverage !== null && (
                  <>
                    <rect
                      x={teamBarX + actualBarWidth / 2 - 40}
                      y={getY(dimension.teamAverage) - 32}
                      width={80}
                      height={26}
                      fill="white"
                      stroke="#10b981"
                      strokeWidth={2}
                      rx={6}
                      filter="url(#shadow)"
                    />
                    <text
                      x={teamBarX + actualBarWidth / 2}
                      y={getY(dimension.teamAverage) - 14}
                      textAnchor="middle"
                      className="text-xs font-bold fill-gray-900"
                    >
                      {dimension.teamAverage.toFixed(1)}%
                    </text>
                  </>
                )}

                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 10}
                  textAnchor="start"
                  className="text-[10px] fill-gray-700"
                  transform={`rotate(-60, ${x + barWidth / 2}, ${chartHeight + 10})`}
                >
                  {dimension.name}
                </text>
              </g>
            );
          })}

          <text
            x={chartWidth / 2}
            y={chartHeight + 165}
            textAnchor="middle"
            className="text-sm font-semibold fill-gray-700"
          >
            Dimensions
          </text>

          <text
            x={-chartHeight / 2}
            y={-45}
            textAnchor="middle"
            transform="rotate(-90)"
            className="text-sm font-semibold fill-gray-700"
          >
            Score (%)
          </text>

          <g transform={`translate(${chartWidth + 20}, 20)`}>
            <rect x={0} y={0} width={18} height={18} fill="#3b82f6" rx={3} />
            <text x={24} y={14} className="text-sm fill-gray-700 font-medium">
              My Score
            </text>

            <rect x={0} y={30} width={18} height={18} fill="#10b981" rx={3} />
            <text x={24} y={44} className="text-sm fill-gray-700 font-medium">
              Team Avg.
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
