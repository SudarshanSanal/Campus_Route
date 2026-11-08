import React from 'react';
import { SearchStep } from '../types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  FastForward, 
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';

interface SearchAnimationControlsProps {
  steps: SearchStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onJumpToStep: (index: number) => void;
  onReset: () => void;
  speedMs: number;
  onSpeedChange: (speedMs: number) => void;
  algorithmName: string;
}

export const SearchAnimationControls: React.FC<SearchAnimationControlsProps> = ({
  steps,
  currentStepIndex,
  isPlaying,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onJumpToStep,
  onReset,
  speedMs,
  onSpeedChange,
  algorithmName,
}) => {
  if (!steps || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex] || steps[0];
  const isFinished = currentStepIndex >= steps.length - 1;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4 shadow-2xl space-y-3">
      {/* Top Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Activity className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                Live State-Space Exploration
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                {algorithmName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Observing node expansion, frontier queues, and transition costs step-by-step
            </p>
          </div>
        </div>

        {/* Step Counter Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-indigo-300">
            Step {currentStepIndex + 1} / {steps.length}
          </span>
          {isFinished && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Goal Reached
            </span>
          )}
        </div>
      </div>

      {/* Progress Slider */}
      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max={steps.length - 1}
          value={currentStepIndex}
          onChange={e => onJumpToStep(parseInt(e.target.value, 10))}
          className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>Start ({steps[0]?.current_node})</span>
          <span>In Progress</span>
          <span>Goal ({steps[steps.length - 1]?.current_node})</span>
        </div>
      </div>

      {/* Playback Controls & Speed Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Buttons: Prev, Play/Pause, Next, Reset */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Restart Search Animation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={onStepBackward}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-700"
            title="Previous Step"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={onPlayPause}
            className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-lg transition-all ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>{isFinished ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            disabled={isFinished}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-700"
            title="Next Step"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 px-1 font-semibold">Speed:</span>
          {[
            { label: '0.5x', ms: 1200 },
            { label: '1x', ms: 700 },
            { label: '2x', ms: 350 },
            { label: '4x', ms: 150 },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={() => onSpeedChange(opt.ms)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors ${
                speedMs === opt.ms
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live State Inspector Box */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 space-y-2 text-xs">
        {/* Step Note / Explanation */}
        <div className="text-slate-200 font-medium flex items-start gap-2 leading-relaxed">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{currentStep.note}</span>
        </div>

        {/* Mathematical Evaluation Values (especially for A*) */}
        {(currentStep.g_score !== null && currentStep.g_score !== undefined) && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">Path Cost g(n)</span>
              <span className="font-mono font-bold text-indigo-400">{currentStep.g_score}m</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">Heuristic h(n)</span>
              <span className="font-mono font-bold text-amber-400">{currentStep.h_score ?? 0}m</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">Total f(n) = g + h</span>
              <span className="font-mono font-bold text-emerald-400">{currentStep.f_score ?? currentStep.g_score}m</span>
            </div>
          </div>
        )}

        {/* State Collections: Frontier & Visited */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-amber-400 font-semibold block mb-0.5">
              Frontier Queue ({currentStep.frontier?.length || 0}):
            </span>
            <div className="font-mono text-slate-300 truncate max-w-full bg-slate-900 px-2 py-1 rounded border border-slate-800">
              {currentStep.frontier?.length > 0 ? currentStep.frontier.join(', ') : '(Empty)'}
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5">
              Visited Set ({currentStep.visited?.length || 0}):
            </span>
            <div className="font-mono text-slate-300 truncate max-w-full bg-slate-900 px-2 py-1 rounded border border-slate-800">
              {currentStep.visited?.length > 0 ? currentStep.visited.join(', ') : '(None)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
