interface DimensionBarChartProps {
  dimensions: Array<{
    name: string;
    myScore: number;
    teamAverage: number | null;
  }>;
}

export function DimensionBarChart({ dimensions }: DimensionBarChartProps) {
  if (dimensions.length === 0) return null;

  const maxScore = 100;
  const width = 1000;
  const height = 400;
  const padding = { top: 20, right: 100, bottom: 120, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const barWidth = chartWidth / dimensions.length;
  const barPadding = barWidth * 0.2;
  const actualBarWidth = (barWidth - barPadding) / 2;

  const getY = (score: number) => {
    return chartHeight - (score / maxScore) * chartHeight;
  };

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height}>
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
            const teamBarX = myBarX + actualBarWidth;

            const myBarHeight = chartHeight - getY(dimension.myScore);
            const teamBarHeight =
              dimension.teamAverage !== null ? chartHeight - getY(dimension.teamAverage) : 0;

            return (
              <g key={i}>
                <rect
                  x={myBarX}
                  y={getY(dimension.myScore)}
                  width={actualBarWidth}
                  height={myBarHeight}
                  fill="#3b82f6"
                  rx={4}
                >
                  <title>My Score: {dimension.myScore.toFixed(1)}%</title>
                </rect>

                {dimension.teamAverage !== null && (
                  <rect
                    x={teamBarX}
                    y={getY(dimension.teamAverage)}
                    width={actualBarWidth}
                    height={teamBarHeight}
                    fill="#10b981"
                    rx={4}
                  >
                    <title>Team Average: {dimension.teamAverage.toFixed(1)}%</title>
                  </rect>
                )}

                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 15}
                  textAnchor="end"
                  className="text-xs fill-gray-600"
                  transform={`rotate(-45, ${x + barWidth / 2}, ${chartHeight + 15})`}
                >
                  {dimension.name.length > 20
                    ? dimension.name.substring(0, 17) + '...'
                    : dimension.name}
                </text>
              </g>
            );
          })}

          <text
            x={chartWidth / 2}
            y={chartHeight + 100}
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
            <rect x={0} y={0} width={15} height={15} fill="#3b82f6" rx={2} />
            <text x={20} y={12} className="text-xs fill-gray-700">
              My Score
            </text>

            <rect x={0} y={25} width={15} height={15} fill="#10b981" rx={2} />
            <text x={20} y={37} className="text-xs fill-gray-700">
              Team Average
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
