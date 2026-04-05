import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  educationData,
  states,
  readingLevels,
  arithmeticLevels,
  stateColors,
  readingLevelColors,
  arithmeticLevelColors,
} from './data';
import './App.css';

type SubjectType = 'reading' | 'arithmetic';
type ViewType = 'trends' | 'comparison' | 'heatmap';

interface ChartData {
  year: number;
  [key: string]: number | string;
}

function App() {
  const [selectedStates, setSelectedStates] = useState<string[]>(states);
  const [subject, setSubject] = useState<SubjectType>('reading');
  const [view, setView] = useState<ViewType>('trends');
  const [selectedYear, setSelectedYear] = useState<number>(2023);

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state)
        ? prev.filter((s) => s !== state)
        : [...prev, state]
    );
  };

  const trendData = useMemo<ChartData[]>(() => {
    const years = [2019, 2020, 2021, 2022, 2023];
    return years.map((year) => {
      const row: ChartData = { year };
      selectedStates.forEach((state) => {
        const stateData = educationData.filter(
          (d) => d.year === year && d.state === state
        );
        const levels = subject === 'reading' ? readingLevels : arithmeticLevels;
        levels.forEach((level) => {
          const key = `${state}_${level}`;
          const match = stateData.find((d) =>
            subject === 'reading'
              ? d.readingLevel === level
              : d.arithmeticLevel === level
          );
          row[key] = match?.percentage || 0;
        });
      });
      return row;
    });
  }, [selectedStates, subject]);

  const comparisonData = useMemo(() => {
    const levels = subject === 'reading' ? readingLevels : arithmeticLevels;
    return selectedStates.map((state) => {
      const stateData = educationData.filter(
        (d) => d.year === selectedYear && d.state === state
      );
      const row: Record<string, number | string> = { state };
      levels.forEach((level) => {
        const match = stateData.find((d) =>
          subject === 'reading'
            ? d.readingLevel === level
            : d.arithmeticLevel === level
        );
        row[level] = match?.percentage || 0;
      });
      return row;
    });
  }, [selectedStates, subject, selectedYear]);

  const heatmapData = useMemo(() => {
    const levels = subject === 'reading' ? readingLevels : arithmeticLevels;
    return levels.map((level) => {
      const row: Record<string, number | string> = { level };
      selectedStates.forEach((state) => {
        const values = educationData
          .filter((d) => d.state === state &&
            (subject === 'reading' ? d.readingLevel === level : d.arithmeticLevel === level)
          )
          .map((d) => d.percentage);
        row[state] = values.reduce((a, b) => a + b, 0) / values.length;
      });
      return row;
    });
  }, [selectedStates, subject]);

  const getAverageByLevel = (state: string, level: string) => {
    const values = educationData
      .filter((d) => d.state === state &&
        (subject === 'reading' ? d.readingLevel === level : d.arithmeticLevel === level)
      )
      .map((d) => d.percentage);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const getGrowthRate = (state: string, level: string) => {
    const data = educationData
      .filter((d) => d.state === state &&
        (subject === 'reading' ? d.readingLevel === level : d.arithmeticLevel === level)
      )
      .sort((a, b) => a.year - b.year);
    if (data.length < 2) return 0;
    const first = data[0].percentage;
    const last = data[data.length - 1].percentage;
    return (((last - first) / first) * 100).toFixed(1);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Grade 3 Education Performance Dashboard</h1>
        <p>Indian States Learning Outcomes Analysis (2019-2023)</p>
      </header>

      <div className="controls">
        <div className="control-group">
          <label>Subject:</label>
          <div className="button-group">
            <button
              className={subject === 'reading' ? 'active' : ''}
              onClick={() => setSubject('reading')}
            >
              Reading
            </button>
            <button
              className={subject === 'arithmetic' ? 'active' : ''}
              onClick={() => setSubject('arithmetic')}
            >
              Arithmetic
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>View:</label>
          <div className="button-group">
            <button
              className={view === 'trends' ? 'active' : ''}
              onClick={() => setView('trends')}
            >
              Trends
            </button>
            <button
              className={view === 'comparison' ? 'active' : ''}
              onClick={() => setView('comparison')}
            >
              Comparison
            </button>
            <button
              className={view === 'heatmap' ? 'active' : ''}
              onClick={() => setView('heatmap')}
            >
              Averages
            </button>
          </div>
        </div>

        {view === 'comparison' && (
          <div className="control-group">
            <label>Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              <option value={2019}>2019</option>
              <option value={2020}>2020</option>
              <option value={2021}>2021</option>
              <option value={2022}>2022</option>
              <option value={2023}>2023</option>
            </select>
          </div>
        )}

        <div className="control-group">
          <label>States:</label>
          <div className="state-toggles">
            {states.map((state) => (
              <label
                key={state}
                className={`state-checkbox ${selectedStates.includes(state) ? 'active' : ''}`}
                style={{ '--state-color': stateColors[state] } as React.CSSProperties}
              >
                <input
                  type="checkbox"
                  checked={selectedStates.includes(state)}
                  onChange={() => toggleState(state)}
                />
                <span>{state}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="charts-container">
        {view === 'trends' && (
          <div className="chart-section">
            <h2>
              {subject === 'reading' ? 'Reading' : 'Arithmetic'} Performance Trends
              <span className="subtitle">Year-over-year progress by proficiency level</span>
            </h2>
            <div className="charts-grid">
              {(subject === 'reading' ? readingLevels : arithmeticLevels).map((level) => (
                <div key={level} className="chart-card">
                  <h3>{level} Level</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" stroke="#6b7280" />
                      <YAxis domain={[0, 100]} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      {selectedStates.map((state) => (
                        <Line
                          key={`${state}_${level}`}
                          type="monotone"
                          dataKey={`${state}_${level}`}
                          name={state}
                          stroke={stateColors[state]}
                          strokeWidth={3}
                          dot={{ fill: stateColors[state], r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'comparison' && (
          <div className="chart-section">
            <h2>
              State Comparison - {selectedYear}
              <span className="subtitle">Side-by-side performance analysis</span>
            </h2>
            <div className="chart-card large">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                  <YAxis type="category" dataKey="state" stroke="#6b7280" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  {(subject === 'reading' ? readingLevels : arithmeticLevels).map((level) => (
                    <Bar
                      key={level}
                      dataKey={level}
                      name={level}
                      fill={subject === 'reading' ? readingLevelColors[level] : arithmeticLevelColors[level]}
                      radius={[0, 4, 4, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="stats-grid">
              {selectedStates.map((state) => (
                <div key={state} className="stat-card" style={{ borderLeftColor: stateColors[state] }}>
                  <h3>{state}</h3>
                  <div className="stat-levels">
                    {(subject === 'reading' ? readingLevels : arithmeticLevels).map((level) => (
                      <div key={level} className="stat-level">
                        <span className="level-name">{level}</span>
                        <span className="level-value">
                          {educationData.find(
                            (d) => d.year === selectedYear && d.state === state &&
                              (subject === 'reading' ? d.readingLevel === level : d.arithmeticLevel === level)
                          )?.percentage}%
                        </span>
                        <span
                          className={`growth ${Number(getGrowthRate(state, level)) >= 0 ? 'positive' : 'negative'}`}
                        >
                          {Number(getGrowthRate(state, level)) >= 0 ? '↑' : '↓'} {Math.abs(Number(getGrowthRate(state, level)))}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'heatmap' && (
          <div className="chart-section">
            <h2>
              5-Year Average Performance
              <span className="subtitle">Average scores across all years (2019-2023)</span>
            </h2>
            <div className="chart-card large">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={heatmapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="level" stroke="#6b7280" />
                  <YAxis domain={[0, 100]} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  {selectedStates.map((state) => (
                    <Bar
                      key={state}
                      dataKey={state}
                      name={state}
                      fill={stateColors[state]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="insights">
              <h3>Key Insights</h3>
              <div className="insights-grid">
                {selectedStates.map((state) => {
                  const levels = subject === 'reading' ? readingLevels : arithmeticLevels;
                  const bestLevel = levels.reduce((best, level) => {
                    const avg = Number(getAverageByLevel(state, level));
                    const bestAvg = Number(getAverageByLevel(state, best));
                    return avg > bestAvg ? level : best;
                  });
                  const worstLevel = levels.reduce((worst, level) => {
                    const avg = Number(getAverageByLevel(state, level));
                    const worstAvg = Number(getAverageByLevel(state, worst));
                    return avg < worstAvg ? level : worst;
                  }, levels[0]);
                  
                  return (
                    <div key={state} className="insight-card" style={{ borderLeftColor: stateColors[state] }}>
                      <h4>{state}</h4>
                      <p>
                        <strong>Strongest:</strong> {bestLevel} ({getAverageByLevel(state, bestLevel)}%)
                      </p>
                      <p>
                        <strong>Needs Focus:</strong> {worstLevel} ({getAverageByLevel(state, worstLevel)}%)
                      </p>
                      <p>
                        <strong>Overall Avg:</strong> {(
                          levels.reduce((sum, level) => sum + Number(getAverageByLevel(state, level)), 0) / levels.length
                        ).toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="dashboard-footer">
        <p>Data source: ASER Report | Visualization by Flexera Dashboard</p>
      </footer>
    </div>
  );
}

export default App;
