import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Scale, 
  Zap, 
  Layers, 
  Compass, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const TheoryView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
            AI &amp; Graph Theory Reference
          </span>
          <span className="text-xs text-slate-400">Formal Problem Formulation &amp; Analysis</span>
        </div>
        <h2 className="text-2xl font-black text-slate-100 tracking-tight">
          Campus Navigation as a State-Space Search Problem
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          This system models university campus navigation as an informed heuristic search problem on a weighted graph G = (V, E), comparing uninformed search algorithms (BFS, DFS) against informed heuristic search (A*).
        </p>
      </div>

      {/* 1. Formal Problem Formulation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
          <Layers className="h-5 w-5 text-indigo-400" />
          1. Classical AI State-Space Formulation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-400 text-sm">State Space (S)</span>
            <p className="text-slate-300">
              The discrete set of designated campus buildings, gates, labs, auditoriums, and intersection waypoints: <code className="text-indigo-300 font-mono">V = &#123;v1, v2, ..., vn&#125;</code>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-400 text-sm">Initial State (s0)</span>
            <p className="text-slate-300">
              The user-selected starting location (e.g., <span className="font-mono text-emerald-400">Main Gate</span> or <span className="font-mono text-emerald-400">Parking</span>).
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-400 text-sm">Action Set (A(s))</span>
            <p className="text-slate-300">
              Passable walkways, corridors, or sidewalks incident to state s: <code className="text-indigo-300 font-mono">&#123;WalkTo(v) | (s, v) &isin; E&#125;</code>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-400 text-sm">Goal Test (G(s))</span>
            <p className="text-slate-300">
              Evaluates boolean truth if the agent has reached the chosen destination: <code className="text-indigo-300 font-mono">s == s_goal</code>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 md:col-span-2">
            <span className="font-bold text-indigo-400 text-sm">Path Cost Function (c(s, a, s'))</span>
            <p className="text-slate-300">
              The physical walking distance along the sidewalk in meters (w(e)). The objective is to minimize total path cost across all traversed edges.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Algorithm Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* BFS */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">BFS</span>
            <span className="text-[11px] text-slate-500">FIFO Queue</span>
          </div>
          <h4 className="font-bold text-sm text-slate-100">Breadth-First Search</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Expands the shallowest unexpanded node first, exploring level-by-level away from the origin.
          </p>
          <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <p><strong className="text-slate-200">Completeness:</strong> Yes (if b is finite)</p>
            <p><strong className="text-slate-200">Time Complexity:</strong> O(b^d)</p>
            <p><strong className="text-slate-200">Space Complexity:</strong> O(b^d)</p>
            <p><strong className="text-amber-400">Optimality:</strong> Hop-optimal only (minimizes turns/segments, ignores meter lengths).</p>
          </div>
        </div>

        {/* DFS */}
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">DFS</span>
            <span className="text-[11px] text-slate-500">LIFO Stack</span>
          </div>
          <h4 className="font-bold text-sm text-slate-100">Depth-First Search</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Expands deepest unexpanded node first, plunging down one path branch before backtracking.
          </p>
          <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <p><strong className="text-slate-200">Completeness:</strong> Yes with cycle detection</p>
            <p><strong className="text-slate-200">Time Complexity:</strong> O(b^m)</p>
            <p><strong className="text-slate-200">Space Complexity:</strong> O(bm) (linear space)</p>
            <p><strong className="text-rose-400">Optimality:</strong> Not optimal. Can return circuitous detours.</p>
          </div>
        </div>

        {/* A* Search */}
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">A* SEARCH</span>
            <span className="text-[11px] text-slate-500">Priority Queue</span>
          </div>
          <h4 className="font-bold text-sm text-slate-100">Informed A* Search</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Combines Dijkstra's accumulated path cost g(n) with goal-directed heuristic h(n): f(n) = g(n) + h(n).
          </p>
          <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <p><strong className="text-slate-200">Completeness:</strong> Yes</p>
            <p><strong className="text-slate-200">Time Complexity:</strong> Exponential worst case, O(b^(eps*d)) average</p>
            <p><strong className="text-slate-200">Space Complexity:</strong> O(b^d)</p>
            <p><strong className="text-emerald-400">Optimality:</strong> Guaranteed distance-optimal when h(n) is admissible!</p>
          </div>
        </div>
      </div>

      {/* 3. Mathematical Proof of Heuristic Admissibility */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          3. Proof of Heuristic Admissibility (Geodesic Haversine)
        </h3>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            In order for A* tree/graph search to guarantee optimal shortest paths, the heuristic function h(n) must be <strong className="text-indigo-400">admissible</strong>: it must never overestimate the true cost to reach the goal:
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-center text-sm text-emerald-400">
            0 &le; h(n) &le; h*(n) for all n in S
          </div>
          <p>
            Where h*(n) is the true shortest walking distance from node n to s_goal.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-slate-200 block">Why Haversine Distance is strictly Admissible on Earth:</span>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li>
                <strong>Geodesic Metric:</strong> The Great-Circle (Haversine) distance calculates the shortest arc connecting two geographic coordinates on a spherical Earth of radius R = 6,371,000 meters.
              </li>
              <li>
                <strong>Physical Constraint:</strong> Pedestrian walkways on campus must navigate sidewalks, circumvent buildings, avoid walls, and follow terrain curves.
              </li>
              <li>
                <strong>Triangle Inequality:</strong> By Riemannian geometry, the straight-line geodesic arc is the absolute mathematical lower bound of any curve on the sphere:
                <code className="block mt-1 text-slate-300 font-mono">Length(Walkway Path) &ge; GreatCircleArc(Current, Goal)</code>
              </li>
              <li>
                <strong>Conclusion:</strong> Since <code className="text-slate-300 font-mono">h(n) = GreatCircleArc(n, Goal) &le; h*(n)</code>, h(n) never overestimates and is strictly <strong className="text-emerald-400">admissible and consistent (monotonic)</strong>.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Live Demonstration Case for Presentation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
          <Zap className="h-5 w-5 text-amber-400" />
          4. Textbook Demonstration Case (Presentation Highlight)
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          During your presentation, select <span className="font-mono text-emerald-400">Main Gate</span> as origin and <span className="font-mono text-rose-400">Main Auditorium</span> as destination:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-500/30 space-y-1">
            <span className="font-bold text-blue-400">BFS Outcome:</span>
            <p className="text-slate-300">
              BFS chooses the direct campus perimeter avenue (<span className="font-mono">main_gate &rarr; auditorium</span>).
              It has only <strong>1 edge (hop)</strong>, but spans <strong>490 meters</strong>.
            </p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/30 space-y-1">
            <span className="font-bold text-indigo-400">A* Search Outcome:</span>
            <p className="text-slate-300">
              A* chooses through the quad (<span className="font-mono">main_gate &rarr; block_a &rarr; library &rarr; auditorium</span>).
              It has <strong>3 edges (hops)</strong>, but totals only <strong>435 meters</strong>.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 italic">
          This visibly proves to evaluators that unweighted BFS minimizes turn count while A* minimizes physical meters.
        </p>
      </div>
    </div>
  );
};
