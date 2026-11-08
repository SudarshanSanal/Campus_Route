import React, { useState, useEffect, useRef } from 'react';
import { 
  CampusGraphData, 
  NodeModel, 
  EdgeModel, 
  RouteResult, 
  CompareResponse,
  SearchStep
} from './types';
import { 
  fetchCampusMap, 
  switchMapMode, 
  resetCampusMap, 
  findRoute, 
  compareAlgorithms,
  addOrUpdateNode,
  deleteNode,
  addOrUpdateEdge,
  deleteEdge,
  uploadCustomMapImage,
  saveCampusMap
} from './services/api';

import { Navbar } from './components/Navbar';
import { CampusMap } from './components/CampusMap';
import { RoutePanel } from './components/RoutePanel';
import { AlgorithmComparisonView } from './components/AlgorithmComparisonView';
import { GraphManagerView } from './components/GraphManagerView';
import { TheoryView } from './components/TheoryView';
import { SearchAnimationControls } from './components/SearchAnimationControls';

export function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'comparison' | 'manager' | 'theory'>('map');
  const [mode, setMode] = useState<'real' | 'custom'>('real');
  const [graphData, setGraphData] = useState<CampusGraphData | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Search & Routing state
  const [selectedSource, setSelectedSource] = useState<string>('main_gate');
  const [selectedDestination, setSelectedDestination] = useState<string>('auditorium');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bfs' | 'dfs' | 'astar' | 'compare'>('astar');
  const [walkingSpeed, setWalkingSpeed] = useState<number>(1.35);

  // Step-by-Step Node-to-Node search animation state
  const [enableStepAnimation, setEnableStepAnimation] = useState<boolean>(true);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(false);
  const [animationSpeedMs, setAnimationSpeedMs] = useState<number>(700);

  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [comparisonData, setComparisonData] = useState<CompareResponse | null>(null);
  const [activeComparisonAlgo, setActiveComparisonAlgo] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  // Load campus graph data on mount or mode change
  const loadData = async (targetMode: 'real' | 'custom') => {
    try {
      setIsLoading(true);
      const data = await fetchCampusMap(targetMode);
      setGraphData(data);
      setMode(data.mode);
      setIsBackendConnected(true);

      if (data.nodes.length >= 2) {
        const hasSrc = data.nodes.some(n => n.id === selectedSource);
        const hasDst = data.nodes.some(n => n.id === selectedDestination);
        if (!hasSrc) setSelectedSource(data.nodes[0].id);
        if (!hasDst) setSelectedDestination(data.nodes[data.nodes.length - 1].id);
      }
    } catch (err: any) {
      console.error('Error fetching campus map:', err);
      setIsBackendConnected(false);
      setErrorMessage('Could not connect to backend server at http://127.0.0.1:8000. Please ensure FastAPI is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(mode);
  }, []);

  // Animation playback interval timer
  useEffect(() => {
    if (isPlayingAnimation && activeRoute?.search_steps && activeRoute.search_steps.length > 0) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= (activeRoute.search_steps?.length || 1) - 1) {
            setIsPlayingAnimation(false);
            return prev;
          }
          return prev + 1;
        });
      }, animationSpeedMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlayingAnimation, activeRoute, animationSpeedMs]);

  const handleModeChange = async (newMode: 'real' | 'custom') => {
    if (newMode === mode) return;
    try {
      setIsLoading(true);
      await switchMapMode(newMode);
      setMode(newMode);
      setActiveRoute(null);
      setComparisonData(null);
      setActiveComparisonAlgo(null);
      setIsPlayingAnimation(false);
      setCurrentStepIndex(0);
      await loadData(newMode);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCampus = async () => {
    if (!window.confirm('Reset this campus map layout to default demo configuration?')) return;
    try {
      setIsLoading(true);
      const res = await resetCampusMap(mode);
      setGraphData(res.graph);
      setActiveRoute(null);
      setComparisonData(null);
      setActiveComparisonAlgo(null);
      setIsPlayingAnimation(false);
      setCurrentStepIndex(0);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindRoute = async () => {
    if (!selectedSource || !selectedDestination) {
      setErrorMessage('Please select both origin and destination.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    setIsPlayingAnimation(false);

    try {
      if (selectedAlgorithm === 'compare') {
        const compRes = await compareAlgorithms(
          selectedSource,
          selectedDestination,
          mode,
          walkingSpeed
        );
        setComparisonData(compRes);
        setActiveRoute(compRes.results.astar);
        setActiveComparisonAlgo('astar');
        setActiveTab('comparison');
      } else {
        const routeRes = await findRoute(
          selectedSource,
          selectedDestination,
          selectedAlgorithm,
          mode,
          walkingSpeed
        );
        setActiveRoute(routeRes);
        setActiveComparisonAlgo(null);

        // If step animation is enabled and steps are available, start animation!
        if (enableStepAnimation && routeRes.search_steps && routeRes.search_steps.length > 0) {
          setCurrentStepIndex(0);
          setIsPlayingAnimation(true);
        } else {
          setCurrentStepIndex((routeRes.search_steps?.length || 1) - 1);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRoute = () => {
    setActiveRoute(null);
    setComparisonData(null);
    setActiveComparisonAlgo(null);
    setIsPlayingAnimation(false);
    setCurrentStepIndex(0);
    setErrorMessage(null);
  };

  const handleSelectNode = (nodeId: string, type: 'source' | 'destination') => {
    if (type === 'source') {
      setSelectedSource(nodeId);
    } else {
      setSelectedDestination(nodeId);
    }
  };

  const handleSelectAlgoRoute = (algoKey: string) => {
    setActiveComparisonAlgo(algoKey);
    if (comparisonData && comparisonData.results[algoKey as 'bfs' | 'dfs' | 'astar']) {
      const r = comparisonData.results[algoKey as 'bfs' | 'dfs' | 'astar'];
      setActiveRoute(r);
      if (enableStepAnimation && r.search_steps && r.search_steps.length > 0) {
        setCurrentStepIndex(0);
        setIsPlayingAnimation(true);
      }
    }
    setActiveTab('map');
  };

  // Node & Edge management handlers
  const handleAddNode = async (node: NodeModel) => {
    const saved = await addOrUpdateNode(node, mode);
    setGraphData(prev => {
      if (!prev) return prev;
      const exists = prev.nodes.some(n => n.id === saved.id);
      return {
        ...prev,
        nodes: exists ? prev.nodes.map(n => n.id === saved.id ? saved : n) : [...prev.nodes, saved]
      };
    });
  };

  const handleDeleteNode = async (nodeId: string) => {
    await deleteNode(nodeId, mode);
    setGraphData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.filter(n => n.id !== nodeId),
        edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
      };
    });
  };

  const handleAddEdge = async (edge: EdgeModel) => {
    const saved = await addOrUpdateEdge(edge, mode);
    setGraphData(prev => {
      if (!prev) return prev;
      const exists = prev.edges.some(e => e.id === saved.id);
      return {
        ...prev,
        edges: exists ? prev.edges.map(e => e.id === saved.id ? saved : e) : [...prev.edges, saved]
      };
    });
  };

  const handleDeleteEdge = async (edgeId: string) => {
    await deleteEdge(edgeId, mode);
    setGraphData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        edges: prev.edges.filter(e => e.id !== edgeId)
      };
    });
  };

  const handleUploadImage = async (file: File) => {
    const res = await uploadCustomMapImage(file);
    setGraphData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        custom_map_image_url: res.image_url
      };
    });
  };

  const handleSaveGraph = async () => {
    await saveCampusMap(mode);
    alert('Campus graph saved successfully to persistent server storage!');
  };

  const currentSearchStep: SearchStep | null = 
    activeRoute?.search_steps && activeRoute.search_steps.length > 0
      ? activeRoute.search_steps[currentStepIndex] || null
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode={mode}
        onModeChange={handleModeChange}
        onReset={handleResetCampus}
        isBackendConnected={isBackendConnected}
        campusName={graphData?.campus_name || 'AI Campus Navigation'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Campus Map & Step Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {graphData ? (
                <>
                  <CampusMap
                    mode={mode}
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    center={graphData.center}
                    zoom={graphData.zoom}
                    customMapImageUrl={graphData.custom_map_image_url}
                    customMapBounds={graphData.custom_map_bounds}
                    selectedSource={selectedSource}
                    selectedDestination={selectedDestination}
                    onSelectNode={handleSelectNode}
                    activeRoute={activeRoute}
                    highlightedRouteColor={
                      activeComparisonAlgo === 'bfs' 
                        ? '#3b82f6' 
                        : activeComparisonAlgo === 'dfs' 
                          ? '#a855f7' 
                          : '#6366f1'
                    }
                    comparisonRoutes={comparisonData?.results}
                    activeComparisonAlgo={activeComparisonAlgo}
                    activeStep={enableStepAnimation ? currentSearchStep : null}
                    isAnimationActive={enableStepAnimation && Boolean(activeRoute?.search_steps?.length)}
                  />

                  {/* Step-by-Step Search Animation Player */}
                  {activeRoute && activeRoute.search_steps && activeRoute.search_steps.length > 0 && enableStepAnimation && (
                    <SearchAnimationControls
                      steps={activeRoute.search_steps}
                      currentStepIndex={currentStepIndex}
                      isPlaying={isPlayingAnimation}
                      onPlayPause={() => {
                        if (currentStepIndex >= activeRoute.search_steps!.length - 1) {
                          setCurrentStepIndex(0);
                        }
                        setIsPlayingAnimation(!isPlayingAnimation);
                      }}
                      onStepForward={() => {
                        setIsPlayingAnimation(false);
                        setCurrentStepIndex(prev => Math.min(prev + 1, activeRoute.search_steps!.length - 1));
                      }}
                      onStepBackward={() => {
                        setIsPlayingAnimation(false);
                        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
                      }}
                      onJumpToStep={(index) => {
                        setIsPlayingAnimation(false);
                        setCurrentStepIndex(index);
                      }}
                      onReset={() => {
                        setCurrentStepIndex(0);
                        setIsPlayingAnimation(true);
                      }}
                      speedMs={animationSpeedMs}
                      onSpeedChange={setAnimationSpeedMs}
                      algorithmName={activeRoute.algorithm_display_name}
                    />
                  )}
                </>
              ) : (
                <div className="h-[600px] w-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm">Connecting to Campus Navigation Graph...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Route Control Panel (5 cols) */}
            <div className="lg:col-span-5">
              <RoutePanel
                nodes={graphData?.nodes || []}
                selectedSource={selectedSource}
                setSelectedSource={setSelectedSource}
                selectedDestination={selectedDestination}
                setSelectedDestination={setSelectedDestination}
                selectedAlgorithm={selectedAlgorithm}
                setSelectedAlgorithm={setSelectedAlgorithm}
                walkingSpeed={walkingSpeed}
                setWalkingSpeed={setWalkingSpeed}
                enableStepAnimation={enableStepAnimation}
                setEnableStepAnimation={setEnableStepAnimation}
                onFindRoute={handleFindRoute}
                onResetRoute={handleResetRoute}
                isLoading={isLoading}
                activeRoute={activeRoute}
                errorMessage={errorMessage}
              />
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <AlgorithmComparisonView
            comparisonData={comparisonData}
            activeAlgo={activeComparisonAlgo}
            onSelectAlgoRoute={handleSelectAlgoRoute}
          />
        )}

        {activeTab === 'manager' && graphData && (
          <GraphManagerView
            mode={mode}
            graphData={graphData}
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onAddEdge={handleAddEdge}
            onDeleteEdge={handleDeleteEdge}
            onUploadImage={handleUploadImage}
            onSaveGraph={handleSaveGraph}
            onResetGraph={handleResetCampus}
          />
        )}

        {activeTab === 'theory' && (
          <TheoryView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>
          AI Campus Route Finder &bull; State-Space Search, Heuristics &amp; Pathfinding Evaluation &bull; Computer Science &amp; AI Group Activity Project
        </p>
      </footer>
    </div>
  );
}

export default App;
