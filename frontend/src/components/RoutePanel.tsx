import React, { useState } from 'react';
import { NodeModel, RouteResult } from '../types';
import { 
  Navigation, 
  MapPin, 
  ArrowRightLeft, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Route, 
  Layers, 
  Zap, 
  HelpCircle,
  Footprints,
  Sparkles
} from 'lucide-react';

interface RoutePanelProps {
  nodes: NodeModel[];
  selectedSource: string;
  setSelectedSource: (id: string) => void;
  selectedDestination: string;
  setSelectedDestination: (id: string) => void;
  selectedAlgorithm: 'bfs' | 'dfs' | 'astar' | 'compare';
  setSelectedAlgorithm: (algo: 'bfs' | 'dfs' | 'astar' | 'compare') => void;
  walkingSpeed: number;
  setWalkingSpeed: (speed: number) => void;
  enableStepAnimation: boolean;
  setEnableStepAnimation: (enable: boolean) => void;
  onFindRoute: () => void;
  onResetRoute: () => void;
  isLoading: boolean;
  activeRoute: RouteResult | null;
  errorMessage: string | null;
}

export const RoutePanel: React.FC<RoutePanelProps> = ({
  nodes,
  selectedSource,
  setSelectedSource,
  selectedDestination,
  setSelectedDestination,
  selectedAlgorithm,
  setSelectedAlgorithm,
  walkingSpeed,
  setWalkingSpeed,
  enableStepAnimation,
  setEnableStepAnimation,
  onFindRoute,
  onResetRoute,
  isLoading,
  activeRoute,
  errorMessage,
}) => {
  const [sourceSearch, setSourceSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  const filteredSourceNodes = nodes.filter(n =>
    n.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
    n.category.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredDestNodes = nodes.filter(n =>
    n.name.toLowerCase().includes(destSearch.toLowerCase()) ||
    n.category.toLowerCase().includes(destSearch.toLowerCase())
  );

  const handleSwap = () => {
    const temp = selectedSource;
    setSelectedSource(selectedDestination);
    setSelectedDestination(temp);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
            <Route className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Campus Route Finder</h2>
            <p className="text-xs text-slate-400">Select origin, destination and AI search strategy</p>
          </div>
        </div>
      </div>

      {/* Origin & Destination Selectors */}
      <div className="space-y-3.5">
        {/* Source Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            Origin / Source Node
          </label>
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={sourceSearch}
                onChange={e => setSourceSearch(e.target.value)}
                placeholder="Search starting building..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">-- Choose Origin Point --</option>
              {filteredSourceNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.name} ({node.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            type="button"
            onClick={handleSwap}
            disabled={!selectedSource || !selectedDestination}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:rotate-180 duration-300 shadow"
            title="Swap Source and Destination"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Destination Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-rose-400" />
            Target Destination
          </label>
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={destSearch}
                onChange={e => setDestSearch(e.target.value)}
                placeholder="Search target location..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={selectedDestination}
              onChange={e => setSelectedDestination(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">-- Choose Target Point --</option>
              {filteredDestNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.name} ({node.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Algorithm Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            AI Search Algorithm
          </span>
          <span className="text-[11px] text-slate-500">Compare &amp; Benchmark</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedAlgorithm('astar')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              selectedAlgorithm === 'astar'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs text-slate-200 flex items-center justify-between">
              <span>A* Search</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300">Optimal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">f(n) = g(n) + h(n)</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedAlgorithm('bfs')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              selectedAlgorithm === 'bfs'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs text-slate-200 flex items-center justify-between">
              <span>BFS</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300">Min Hops</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">FIFO Level-by-level</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedAlgorithm('dfs')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              selectedAlgorithm === 'dfs'
                ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs text-slate-200 flex items-center justify-between">
              <span>DFS</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300">Deep</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">LIFO Stack Search</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedAlgorithm('compare')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              selectedAlgorithm === 'compare'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs text-slate-200 flex items-center justify-between">
              <span>Compare All</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300">Benchmark</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Run BFS, DFS &amp; A*</p>
          </button>
        </div>
      </div>

      {/* Step-by-Step Node Search Animation Toggle */}
      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              Node-to-Node Search Animation
            </span>
            <span className="text-[10px] text-slate-400">
              Watch state space expand step-by-step
            </span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enableStepAnimation}
            onChange={e => setEnableStepAnimation(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
      </div>

      {/* Walking Speed Config */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <Footprints className="h-3.5 w-3.5 text-indigo-400" />
            Walking Speed Pace
          </span>
          <span className="font-mono text-indigo-400 font-bold">
            {walkingSpeed.toFixed(2)} m/s ({(walkingSpeed * 3.6).toFixed(1)} km/h)
          </span>
        </div>
        <input
          type="range"
          min="0.8"
          max="1.8"
          step="0.05"
          value={walkingSpeed}
          onChange={e => setWalkingSpeed(parseFloat(e.target.value))}
          className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Stroll (0.8 m/s)</span>
          <span>Normal (1.35 m/s)</span>
          <span>Brisk (1.8 m/s)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onFindRoute}
          disabled={isLoading || !selectedSource || !selectedDestination}
          className="col-span-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          <span>
            {selectedAlgorithm === 'compare' 
              ? 'Compare Algorithms' 
              : enableStepAnimation 
                ? 'Search Node-to-Node' 
                : 'Find Route'}
          </span>
        </button>

        <button
          type="button"
          onClick={onResetRoute}
          className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
        >
          Reset
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Single Algorithm Route Result Card */}
      {activeRoute && activeRoute.found && selectedAlgorithm !== 'compare' && (
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              {activeRoute.algorithm_display_name} Results
            </span>
            {activeRoute.guarantees_optimality ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Optimal Path
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Sub-optimal / Unweighted
              </span>
            )}
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">Walking Distance</span>
              <span className="text-base font-bold text-indigo-400 font-mono">
                {activeRoute.total_distance} m
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">Estimated Time</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {activeRoute.estimated_time_minutes} min
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">Nodes Explored</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {activeRoute.nodes_explored_count}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">Execution Time</span>
              <span className="text-base font-bold text-purple-400 font-mono">
                {activeRoute.execution_time_ms.toFixed(2)} ms
              </span>
            </div>
          </div>

          {/* Turn-by-Turn Route Path */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              Route Walkway Sequence ({activeRoute.edge_count} segments)
            </span>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 max-h-36 overflow-y-auto space-y-1">
              {activeRoute.path_nodes.map((node, idx) => (
                <div key={node.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    idx === 0 
                      ? 'bg-emerald-500 text-white' 
                      : idx === activeRoute.path_nodes.length - 1 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-slate-800 text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-slate-200 font-medium truncate">{node.name}</span>
                  <span className="text-[10px] text-slate-500 ml-auto capitalize">{node.category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Pedagogical Insight */}
          <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-200 leading-relaxed">
            <span className="font-semibold block text-indigo-300 mb-1">Algorithm Note:</span>
            {activeRoute.explanation}
          </div>
        </div>
      )}
    </div>
  );
};
