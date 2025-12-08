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
  const barGroupWidth = 100;
  const width = Math.max(1200, dimensions.length * barGroupWidth + 160);
  const height = 500;
  const padding = { top: 70, right: 120, bottom: 100, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const barWidth = chartWidth / dimensions.length;
  const barPadding = Math.max(20, barWidth * 0.25);
  const actualBarWidth = (barWidth - barPadding) / 2.5;

  const getY = (score: number) => {
    return chartHeight - (score / maxScore) * chartHeight;
  };

  const formatDimensionName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
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
                    <defs>
                      <filter id={`bar-tooltip-shadow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                        <feOffset dx="0" dy="4" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.2"/>
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <rect
                      x={myBarX + actualBarWidth / 2 - 45}
                      y={getY(dimension.myScore) - 48}
                      width={90}
                      height={40}
                      fill="white"
                      rx={8}
                      filter={`url(#bar-tooltip-shadow-${i})`}
                    />
                    <rect
                      x={myBarX + actualBarWidth / 2 - 42}
                      y={getY(dimension.myScore) - 45}
                      width={84}
                      height={34}
                      fill="#eff6ff"
                      rx={6}
                    />
                    <text
                      x={myBarX + actualBarWidth / 2}
                      y={getY(dimension.myScore) - 26}
                      textAnchor="middle"
                      className="text-xl font-bold"
                      fill="#3b82f6"
                    >
                      {dimension.myScore.toFixed(1)}%
                    </text>
                    <polygon
                      points={`${myBarX + actualBarWidth / 2},${getY(dimension.myScore) - 8} ${myBarX + actualBarWidth / 2 - 6},${getY(dimension.myScore) - 14} ${myBarX + actualBarWidth / 2 + 6},${getY(dimension.myScore) - 14}`}
                      fill="white"
                      filter={`url(#bar-tooltip-shadow-${i})`}
                    />
                    <polygon
                      points={`${myBarX + actualBarWidth / 2},${getY(dimension.myScore) - 10} ${myBarX + actualBarWidth / 2 - 4},${getY(dimension.myScore) - 14} ${myBarX + actualBarWidth / 2 + 4},${getY(dimension.myScore) - 14}`}
                      fill="#eff6ff"
                    />
                  </>
                )}

                {isTeamBarHovered && dimension.teamAverage !== null && (
                  <>
                    <defs>
                      <filter id={`team-tooltip-shadow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                        <feOffset dx="0" dy="4" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.2"/>
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <rect
                      x={teamBarX + actualBarWidth / 2 - 45}
                      y={getY(dimension.teamAverage) - 48}
                      width={90}
                      height={40}
                      fill="white"
                      rx={8}
                      filter={`url(#team-tooltip-shadow-${i})`}
                    />
                    <rect
                      x={teamBarX + actualBarWidth / 2 - 42}
                      y={getY(dimension.teamAverage) - 45}
                      width={84}
                      height={34}
                      fill="#f0fdf4"
                      rx={6}
                    />
                    <text
                      x={teamBarX + actualBarWidth / 2}
                      y={getY(dimension.teamAverage) - 26}
                      textAnchor="middle"
                      className="text-xl font-bold"
                      fill="#10b981"
                    >
                      {dimension.teamAverage.toFixed(1)}%
                    </text>
                    <polygon
                      points={`${teamBarX + actualBarWidth / 2},${getY(dimension.teamAverage) - 8} ${teamBarX + actualBarWidth / 2 - 6},${getY(dimension.teamAverage) - 14} ${teamBarX + actualBarWidth / 2 + 6},${getY(dimension.teamAverage) - 14}`}
                      fill="white"
                      filter={`url(#team-tooltip-shadow-${i})`}
                    />
                    <polygon
                      points={`${teamBarX + actualBarWidth / 2},${getY(dimension.teamAverage) - 10} ${teamBarX + actualBarWidth / 2 - 4},${getY(dimension.teamAverage) - 14} ${teamBarX + actualBarWidth / 2 + 4},${getY(dimension.teamAverage) - 14}`}
                      fill="#f0fdf4"
                    />
                  </>
                )}

                <g>
                  <foreignObject
                    x={x}
                    y={chartHeight + 10}
                    width={barWidth}
                    height={70}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#374151',
                          textAlign: 'center',
                          lineHeight: '1.3',
                          wordBreak: 'break-word',
                          maxWidth: `${barWidth - 10}px`,
                        }}
                        title={dimension.name}
                      >
                        {formatDimensionName(dimension.name, 25)}
                      </div>
                    </div>
                  </foreignObject>
                </g>
              </g>
            );
          })}

          <text
            x={chartWidth / 2}
            y={chartHeight + 85}
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
