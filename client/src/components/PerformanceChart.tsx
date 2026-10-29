export interface PerformancePoint {
  weekStart: string
  averageScore: number | null
  assessmentCount: number
}

function xPosition(index: number) {
  return 48 + index * 75
}

function yPosition(score: number) {
  return 166 - score * 1.47
}

export function PerformanceChart({ points }: { points: PerformancePoint[] }) {
  const scoredPoints = points.flatMap((point, index) => {
    const score = point.averageScore
    return score === null ? [] : [{ point, index, score }]
  })
  const scoreLines = scoredPoints.slice(1).flatMap(({ index, score }, position) => {
    const previous = scoredPoints[position]
    if (previous.index !== index - 1) {
      return []
    }
    return [`${xPosition(previous.index)},${yPosition(previous.score)} ${xPosition(index)},${yPosition(score)}`]
  })

  return (
    <section className="panel chart-panel" aria-labelledby="performance-heading">
      <div className="panel-heading chart-heading"><div><h2 id="performance-heading">Squad performance trend</h2><p>Average stored assessment score by week</p></div><div className="chart-legend"><span><i className="legend-dot" /> Performance</span></div></div>
      <div className="chart-wrap">
        <svg className="performance-chart" viewBox="0 0 610 210" role="img" aria-label="Weekly average assessment scores for the last eight weeks">
          {[0, 20, 40, 60, 80, 100].map((value) => <g key={value}><line className="chart-gridline" x1="42" x2="600" y1={yPosition(value)} y2={yPosition(value)} /><text className="chart-axis" x="4" y={yPosition(value) + 4}>{value}</text></g>)}
          {scoreLines.map((line, index) => <polyline className="chart-score-line" key={index} points={line} />)}
          {scoredPoints.map(({ point, index, score }) => <circle className="chart-point" key={point.weekStart} cx={xPosition(index)} cy={yPosition(score)} r="4"><title>{`${score.toFixed(1)} average from ${point.assessmentCount} assessments`}</title></circle>)}
          {points.map((point, index) => index % 2 === 0 && <text className="chart-axis chart-week" key={point.weekStart} x={xPosition(index)} y="196">{new Date(point.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}</text>)}
        </svg>
        {scoredPoints.length === 0 && <p className="chart-empty">No assessments recorded in the last eight weeks.</p>}
      </div>
    </section>
  )
}