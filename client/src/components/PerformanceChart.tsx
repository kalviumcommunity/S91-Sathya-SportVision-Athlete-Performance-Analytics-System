const weeks = [
  { label: 'Wk 01', score: 62, target: 69 },
  { label: 'Wk 02', score: 68, target: 70 },
  { label: 'Wk 03', score: 66, target: 71 },
  { label: 'Wk 04', score: 74, target: 72 },
  { label: 'Wk 05', score: 77, target: 73 },
  { label: 'Wk 06', score: 82, target: 74 },
  { label: 'Wk 07', score: 79, target: 75 },
  { label: 'Wk 08', score: 87, target: 76 },
]

function coordinates(key: 'score' | 'target') {
  return weeks.map((week, index) => `${48 + index * 75},${166 - (week[key] - 40) * 2.45}`).join(' ')
}

export function PerformanceChart() {
  return (
    <section className="panel chart-panel" aria-labelledby="performance-heading">
      <div className="panel-heading chart-heading"><div><h2 id="performance-heading">Squad performance trend</h2><p>Average assessment score over the last 8 weeks</p></div><div className="chart-legend"><span><i className="legend-dot" /> Performance</span><span><i className="legend-dot legend-target" /> Target</span></div></div>
      <div className="chart-wrap">
        <svg className="performance-chart" viewBox="0 0 610 210" role="img" aria-label="Squad performance is trending upward and currently above target">
          {[40, 60, 80, 100].map((value) => <g key={value}><line className="chart-gridline" x1="42" x2="600" y1={166 - (value - 40) * 2.45} y2={166 - (value - 40) * 2.45} /><text className="chart-axis" x="4" y={170 - (value - 40) * 2.45}>{value}</text></g>)}
          <polyline className="chart-target-line" points={coordinates('target')} />
          <polyline className="chart-score-line" points={coordinates('score')} />
          {weeks.map((week, index) => <circle className="chart-point" key={week.label} cx={48 + index * 75} cy={166 - (week.score - 40) * 2.45} r="4" />)}
          {weeks.filter((_, index) => index % 2 === 0).map((week, index) => <text className="chart-axis chart-week" key={week.label} x={42 + index * 150} y="196">{week.label}</text>)}
        </svg>
      </div>
    </section>
  )
}