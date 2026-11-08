import React from 'react';
import { 
  Compass, 
  MapPin, 
  BarChart3, 
  Settings2, 
  BookOpen, 
  Layers, 
  RotateCcw,
  Sparkles,
  Radio
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'comparison' | 'manager' | 'theory';
  setActiveTab: (tab: 'map' | 'comparison' | 'manager' | 'theory') => void;
  mode: 'real' | 'custom';
  onModeChange: (mode: 'real' | 'custom') => void;
  onReset: () => void;
  isBackendConnected: boolean;
  campusName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  mode,
  onModeChange,
  onReset,
  isBackendConnected,
  campusName
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Campus Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Compass className="h-5 w-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  AI Campus Route Finder
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                  v1.0 AI Lab
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate max-w-xs">
                {campusName}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Campus Map</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'comparison'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Algorithm Comparison</span>
            </button>

            <button
              onClick={() => setActiveTab('manager')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'manager'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Settings2 className="h-4 w-4" />
              <span>Graph Manager</span>
            </button>

            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'theory'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Theory &amp; AI</span>
            </button>
          </nav>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real vs Custom Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onModeChange('real')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'real'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mode A: Real OpenStreetMap college layout"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Mode A (Real)</span>
              </button>
              <button
                onClick={() => onModeChange('custom')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'custom'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mode B: Custom uploaded campus blueprint / image"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Mode B (Custom)</span>
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              title="Reset current campus data to demo default"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Backend Status indicator */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isBackendConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <Radio className={`h-3 w-3 ${isBackendConnected ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{isBackendConnected ? 'API Online' : 'API Offline'}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-800 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'map' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Map &amp; Route
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'comparison' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Comparison
          </button>
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'manager' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Graph Manager
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'theory' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Theory &amp; Proofs
          </button>
        </div>
      </div>
    </header>
  );
};
