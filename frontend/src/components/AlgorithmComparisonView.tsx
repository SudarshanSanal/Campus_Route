import React from 'react';
import { CompareResponse, RouteResult } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  Activity, 
  Scale, 
  HelpCircle,
  Eye,
  Footprints
} from 'lucide-react';

interface AlgorithmComparisonViewProps {
  comparisonData: CompareResponse | null;
  activeAlgo: string | null;
  onSelectAlgoRoute: (algoKey: string) => void;
}

export const AlgorithmComparisonView: React.FC<AlgorithmComparisonViewProps> = ({
  comparisonData,
  activeAlgo,
  onSelectAlgoRoute,
}) => {
  if (!comparisonData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
        <Scale className="h-12 w-12 text-indigo-400 mx-auto opacity-60" />
        <h3 className="text-lg font-bold text-slate-200">No Algorithm Comparison Data Yet</h3>
        <p className="text-sm max-w-md mx-auto">
          Go to the <span className="text-indigo-400 font-semibold">Campus Map</span> page, choose an origin and destination, and select <span className="text-indigo-400 font-semibold">"Compare All"</span> to benchmark BFS, DFS, and A* side by side.
        </p>
      </div>
    );
  }

  const { bfs, dfs, astar } = comparisonData.results;

  // Chart data formatting
  const chartData = [
    {
      name: 'BFS (Breadth-First)',
      distance: bfs.total_distance,
      nodesExplored: bfs.nodes_explored_count,
      timeMs: parseFloat(bfs.execution_time_ms.toFixed(3)),
      hops: bfs.edge_count,
    },
    {
      name: 'DFS (Depth-First)',
      distance: dfs.total_distance,
      nodesExplored: dfs.nodes_explored_count,
      timeMs: parseFloat(dfs.execution_time_ms.toFixed(3)),
      hops: dfs.edge_count,
    },
    {
      name: 'A* Search (Heuristic)',
      distance: astar.total_distance,
      nodesExplored: astar.nodes_explored_count,
      timeMs: parseFloat(astar.execution_time_ms.toFixed(3)),
      hops: astar.edge_count,
    },
  ];

  const algorithmsList: { key: string; data: RouteResult; color: string; badge: string }[] = [
    { key: 'bfs', data: bfs, color: 'border-blue-500/50 bg-blue-500/5', badge: 'bg-blue-500/20 text-blue-300' },
    { key: 'dfs', data: dfs, color: 'border-purple-500/50 bg-purple-500/5', badge: 'bg-purple-500/20 text-purple-300' },
    { key: 'astar', data: astar, color: 'border-indigo-500/50 bg-indigo-500/5', badge: 'bg-indigo-500/20 text-indigo-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              Benchmark Session
            </span>
            <span className="text-xs text-slate-400">
              {comparisonData.source_name} &rarr; {comparisonData.destination_name}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-100 tracking-tight">
            AI Search Algorithm Performance Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quantitative evaluation across path cost, state space exploration, and time complexity.
          </p>
        </div>

        {/* Winner Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Shortest Physical Route</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <Trophy className="h-3.5 w-3.5" />
              {comparisonData.shortest_distance}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Minimal Turns (Hops)</span>
            <span className="font-bold text-blue-400 flex items-center gap-1 mt-0.5">
              <Footprints className="h-3.5 w-3.5" />
              {comparisonData.minimum_hop_count}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Fewest Explored States</span>
            <span className="font-bold text-amber-400 flex items-center gap-1 mt-0.5">
              <Zap className="h-3.5 w-3.5" />
              {comparisonData.fewest_explored_nodes}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Algorithm Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {algorithmsList.map(({ key, data, color, badge }) => {
          const isSelected = activeAlgo === key;
          return (
            <div
              key={key}
              className={`border rounded-2xl p-5 shadow-lg transition-all ${color} ${
                isSelected ? 'ring-2 ring-indigo-400 scale-[1.01]' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${badge}`}>
                  {key.toUpperCase()}
                </span>
                <button
                  onClick={() => onSelectAlgoRoute(key)}
                  className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  {isSelected ? 'Viewing on Map' : 'View Path'}
                </button>
              </div>

              <h3 className="font-bold text-base text-slate-100 mb-1">{data.algorithm_display_name}</h3>
              <p className="text-xs text-slate-400 min-h-[32px] line-clamp-2">{data.explanation}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Distance:</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">{data.total_distance} m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Segments (Hops):</span>
                  <span className="font-mono font-medium text-slate-200">{data.edge_count} turns</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nodes Explored:</span>
                  <span className="font-mono font-bold text-amber-400">{data.nodes_explored_count} states</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Execution Time:</span>
                  <span className="font-mono text-purple-400 font-semibold">{data.execution_time_ms.toFixed(3)} ms</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">Optimality Guarantee:</span>
                  {data.guarantees_optimality ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Guaranteed
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Not Guaranteed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Graphical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distance and Nodes Explored Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Distance vs States Explored</h3>
              <p className="text-xs text-slate-400">Comparing physical path length (m) with search effort</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="distance" name="Total Distance (m)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="nodesExplored" name="States Explored" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Runtime Performance Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Execution Runtime (ms)</h3>
              <p className="text-xs text-slate-400">Measured execution duration on identical input graph</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="ms" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="timeMs" name="Execution Time (ms)" fill="#a855f7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="hops" name="Path Segments (Hops)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Academic Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 overflow-hidden">
        <h3 className="font-bold text-sm text-slate-100">Detailed Evaluation Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Data Structure</th>
                <th className="py-3 px-4">Distance (m)</th>
                <th className="py-3 px-4">Hop Count</th>
                <th className="py-3 px-4">Explored States</th>
                <th className="py-3 px-4">Runtime (ms)</th>
                <th className="py-3 px-4">Optimality</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-400">Breadth-First Search (BFS)</td>
                <td className="py-3 px-4 font-mono text-slate-400">FIFO Queue</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-100">{bfs.total_distance} m</td>
                <td className="py-3 px-4 font-mono text-blue-300 font-bold">{bfs.edge_count}</td>
                <td className="py-3 px-4 font-mono text-amber-400">{bfs.nodes_explored_count}</td>
                <td className="py-3 px-4 font-mono">{bfs.execution_time_ms.toFixed(3)} ms</td>
                <td className="py-3 px-4 text-amber-400 font-medium">Hop-optimal only</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onSelectAlgoRoute('bfs')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition"
                  >
                    Highlight
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-purple-400">Depth-First Search (DFS)</td>
                <td className="py-3 px-4 font-mono text-slate-400">LIFO Stack</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-100">{dfs.total_distance} m</td>
                <td className="py-3 px-4 font-mono text-purple-300">{dfs.edge_count}</td>
                <td className="py-3 px-4 font-mono text-amber-400">{dfs.nodes_explored_count}</td>
                <td className="py-3 px-4 font-mono">{dfs.execution_time_ms.toFixed(3)} ms</td>
                <td className="py-3 px-4 text-rose-400 font-medium">Non-optimal</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onSelectAlgoRoute('dfs')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition"
                  >
                    Highlight
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40 transition-colors bg-indigo-500/5">
                <td className="py-3 px-4 font-bold text-indigo-400 flex items-center gap-1.5">
                  A* Search (Haversine/Euclidean)
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-400">Min-Heap PriorityQueue</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">{astar.total_distance} m</td>
                <td className="py-3 px-4 font-mono text-indigo-300">{astar.edge_count}</td>
                <td className="py-3 px-4 font-mono text-amber-400">{astar.nodes_explored_count}</td>
                <td className="py-3 px-4 font-mono">{astar.execution_time_ms.toFixed(3)} ms</td>
                <td className="py-3 px-4 text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Distance-optimal
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onSelectAlgoRoute('astar')}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition"
                  >
                    Highlight
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Presentation Takeaways & Scientific Findings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          Academic Discussion &amp; Presentation Notes
        </h3>
        <ul className="space-y-2 text-xs text-slate-300">
          {comparisonData.summary_notes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/70">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5"></span>
              <span>{note}</span>
            </li>
          ))}
          <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
            <span>
              <strong>Runtime vs State Space:</strong> On compact graphs (9-20 nodes), Python queue overhead means runtime differences are sub-millisecond. A*'s strength is proven in large-scale city graphs where goal-directed heuristic pruning cuts out 70-90% of irrelevant state space.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
