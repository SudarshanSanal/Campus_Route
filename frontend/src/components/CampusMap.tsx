import React, { useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  ImageOverlay, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { NodeModel, EdgeModel, RouteResult, SearchStep } from '../types';
import { 
  Navigation, 
  MapPin, 
  Footprints, 
  Sparkles
} from 'lucide-react';

interface CampusMapProps {
  mode: 'real' | 'custom';
  nodes: NodeModel[];
  edges: EdgeModel[];
  center: { lat: number; lng: number };
  zoom: number;
  customMapImageUrl?: string;
  customMapBounds?: number[][];
  selectedSource: string;
  selectedDestination: string;
  onSelectNode: (nodeId: string, type: 'source' | 'destination') => void;
  activeRoute: RouteResult | null;
  highlightedRouteColor?: string;
  comparisonRoutes?: { [key: string]: RouteResult };
  activeComparisonAlgo?: string | null;
  // Step-by-Step Search Animation props
  activeStep?: SearchStep | null;
  isAnimationActive?: boolean;
}

const CATEGORY_COLORS: { [key: string]: { bg: string; text: string; border: string } } = {
  entrance: { bg: '#2563eb', text: '#ffffff', border: '#60a5fa' },
  academic: { bg: '#8b5cf6', text: '#ffffff', border: '#c4b5fd' },
  administrative: { bg: '#4f46e5', text: '#ffffff', border: '#818cf8' },
  amenity: { bg: '#ea580c', text: '#ffffff', border: '#fdba74' },
  lab: { bg: '#059669', text: '#ffffff', border: '#6ee7b7' },
  parking: { bg: '#475569', text: '#ffffff', border: '#94a3b8' },
  facility: { bg: '#db2777', text: '#ffffff', border: '#f472b6' },
};

function createCustomIcon(
  node: NodeModel, 
  isSource: boolean, 
  isDestination: boolean,
  isCurrentActive: boolean,
  isEvaluatingNeighbor: boolean,
  isFrontier: boolean,
  isExplored: boolean,
  isInFinalPath: boolean
) {
  let badge = '';
  let ringColor = 'border-slate-700';
  let bgColor = CATEGORY_COLORS[node.category]?.bg || '#6366f1';
  let pulseEffect = '';

  if (isCurrentActive) {
    bgColor = '#06b6d4'; // Cyan active
    ringColor = 'border-cyan-300 ring-4 ring-cyan-500/50 scale-125';
    badge = '<span class="absolute -top-7 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-bounce">ACTIVE</span>';
    pulseEffect = '<span class="absolute inset-0 rounded-full bg-cyan-400 opacity-75 animate-ping"></span>';
  } else if (isEvaluatingNeighbor) {
    bgColor = '#f59e0b'; // Amber evaluating
    ringColor = 'border-amber-300 ring-4 ring-amber-500/50';
    badge = '<span class="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap">NEXT</span>';
  } else if (isSource) {
    bgColor = '#10b981';
    ringColor = 'border-emerald-300 ring-4 ring-emerald-500/30';
    badge = '<span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">START</span>';
  } else if (isDestination) {
    bgColor = '#ef4444';
    ringColor = 'border-rose-300 ring-4 ring-rose-500/30';
    badge = '<span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">DEST</span>';
  } else if (isInFinalPath) {
    ringColor = 'border-indigo-300 ring-2 ring-indigo-500/50';
  } else if (isFrontier) {
    bgColor = '#d97706';
    ringColor = 'border-amber-400 ring-2 ring-amber-400/60';
    badge = '<span class="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-600/90 text-white text-[8px] font-semibold px-1 py-0.2 rounded shadow">QUEUE</span>';
  } else if (isExplored) {
    ringColor = 'border-slate-500 opacity-80';
  }

  const html = `
    <div class="relative group cursor-pointer flex items-center justify-center">
      ${pulseEffect}
      ${badge}
      <div style="background-color: ${bgColor}" class="w-8 h-8 rounded-full border-2 ${ringColor} flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110">
        <span class="text-white text-xs font-bold">${node.name.charAt(0)}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-campus-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

function MapRecenter({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    }
  }, [bounds, map]);
  return null;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  mode,
  nodes,
  edges,
  center,
  zoom,
  customMapImageUrl = '/api/map/image/default',
  customMapBounds = [[0, 0], [800, 1000]],
  selectedSource,
  selectedDestination,
  onSelectNode,
  activeRoute,
  highlightedRouteColor = '#6366f1',
  comparisonRoutes,
  activeComparisonAlgo,
  activeStep,
  isAnimationActive,
}) => {
  // Sets from activeStep if in step-by-step mode
  const currentActiveNode = activeStep ? activeStep.current_node : null;
  const evaluatingNeighbor = activeStep?.neighbor || null;

  const frontierSet = useMemo(() => {
    if (activeStep?.frontier) return new Set(activeStep.frontier);
    return new Set<string>();
  }, [activeStep]);

  const visitedSet = useMemo(() => {
    if (activeStep?.visited) return new Set(activeStep.visited);
    if (!activeRoute?.exploration_order) return new Set<string>();
    return new Set(activeRoute.exploration_order);
  }, [activeStep, activeRoute]);

  const isGoalReachedInStep = activeStep?.action === 'goal_reached';
  const showFinalRoute = !isAnimationActive || isGoalReachedInStep;

  // Path nodes set
  const pathNodesSet = useMemo(() => {
    if (showFinalRoute && activeRoute?.path) {
      return new Set(activeRoute.path);
    }
    if (activeStep?.path_so_far) {
      return new Set(activeStep.path_so_far);
    }
    return new Set<string>();
  }, [activeRoute, activeStep, showFinalRoute]);

  // Compute route bounds for auto-fit
  const routeBounds = useMemo(() => {
    if (!activeRoute?.path_coordinates || activeRoute.path_coordinates.length === 0) {
      return null;
    }
    const points = activeRoute.path_coordinates.map(pt => [pt[0], pt[1]] as [number, number]);
    return L.latLngBounds(points);
  }, [activeRoute]);

  const mapCenter: [number, number] = mode === 'real' 
    ? [center.lat, center.lng] 
    : [customMapBounds[1][0] / 2, customMapBounds[1][1] / 2];

  // Polyline coordinates for active search step or final route
  const displayedPolyline = useMemo(() => {
    if (showFinalRoute) {
      if (comparisonRoutes && activeComparisonAlgo && comparisonRoutes[activeComparisonAlgo]) {
        return comparisonRoutes[activeComparisonAlgo].path_coordinates;
      }
      return activeRoute?.path_coordinates || [];
    }

    // Step-by-step partial polyline from activeStep.path_so_far
    if (activeStep?.path_so_far && activeStep.path_so_far.length > 1) {
      const coords: number[][] = [];
      for (const nid of activeStep.path_so_far) {
        const node = nodes.find(n => n.id === nid);
        if (node) {
          coords.push(mode === 'real' ? [node.lat, node.lng] : [node.y || 0, node.x || 0]);
        }
      }
      return coords;
    }

    return [];
  }, [showFinalRoute, activeRoute, comparisonRoutes, activeComparisonAlgo, activeStep, nodes, mode]);

  // Active edge currently being traversed in this step
  const activeEdgePositions = useMemo(() => {
    if (!activeStep?.current_edge || activeStep.current_edge.length !== 2) return null;
    const [uId, vId] = activeStep.current_edge;
    const uNode = nodes.find(n => n.id === uId);
    const vNode = nodes.find(n => n.id === vId);
    if (!uNode || !vNode) return null;

    if (mode === 'real') {
      return [[uNode.lat, uNode.lng], [vNode.lat, vNode.lng]] as [number, number][];
    } else {
      return [[uNode.y || 0, uNode.x || 0], [vNode.y || 0, vNode.x || 0]] as [number, number][];
    }
  }, [activeStep, nodes, mode]);

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Top Legend Bar */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 shadow-lg text-xs text-slate-300 flex flex-wrap items-center gap-3">
        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Footprints className="h-3.5 w-3.5 text-indigo-400" />
          Campus Graph:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>Active Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Frontier Queue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Destination</span>
        </div>
      </div>

      <MapContainer
        key={`${mode}-${center.lat}-${center.lng}`}
        center={mapCenter}
        zoom={zoom}
        crs={mode === 'real' ? L.CRS.EPSG3857 : L.CRS.Simple}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {routeBounds && showFinalRoute && <MapRecenter bounds={routeBounds} />}

        {mode === 'real' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        ) : (
          <ImageOverlay
            url={customMapImageUrl}
            bounds={customMapBounds as L.LatLngBoundsExpression}
          />
        )}

        {/* Render Campus Walkway Edges */}
        {edges.map(edge => {
          const srcNode = nodes.find(n => n.id === edge.source);
          const tgtNode = nodes.find(n => n.id === edge.target);
          if (!srcNode || !tgtNode) return null;

          let positions: [number, number][] = [];
          if (mode === 'real') {
            positions = [
              [srcNode.lat, srcNode.lng],
              ...(edge.waypoints?.map(wp => [wp[0], wp[1]] as [number, number]) || []),
              [tgtNode.lat, tgtNode.lng]
            ];
          } else {
            positions = [
              [srcNode.y || 0, srcNode.x || 0],
              ...(edge.waypoints?.map(wp => [wp[0], wp[1]] as [number, number]) || []),
              [tgtNode.y || 0, tgtNode.x || 0]
            ];
          }

          return (
            <Polyline
              key={edge.id}
              positions={positions}
              pathOptions={{
                color: '#475569',
                weight: 3,
                opacity: 0.45,
                dashArray: edge.path_type === 'corridor' ? '4, 4' : undefined,
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-slate-100">{srcNode.name} &harr; {tgtNode.name}</p>
                  <p className="text-slate-300">Distance: <span className="font-mono text-indigo-400">{edge.distance}m</span></p>
                  <p className="text-slate-400 capitalize">Path Type: {edge.path_type.replace('_', ' ')}</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Active edge during step-by-step traversal */}
        {activeEdgePositions && (
          <Polyline
            positions={activeEdgePositions}
            pathOptions={{
              color: '#f59e0b',
              weight: 7,
              opacity: 0.9,
              dashArray: '8, 8',
              className: 'route-animated',
            }}
          />
        )}

        {/* Render Active Route or Partial Explored Path */}
        {displayedPolyline.length > 1 && (
          <>
            <Polyline
              positions={displayedPolyline.map(pt => [pt[0], pt[1]] as [number, number])}
              pathOptions={{
                color: showFinalRoute ? highlightedRouteColor : '#06b6d4',
                weight: 8,
                opacity: 0.35,
              }}
            />
            <Polyline
              positions={displayedPolyline.map(pt => [pt[0], pt[1]] as [number, number])}
              pathOptions={{
                color: showFinalRoute ? '#38bdf8' : '#22d3ee',
                weight: 4,
                opacity: 0.95,
                className: 'route-animated',
              }}
            />
          </>
        )}

        {/* Render Campus Location Markers */}
        {nodes.map(node => {
          const isSource = node.id === selectedSource;
          const isDest = node.id === selectedDestination;
          const isCurrentActive = node.id === currentActiveNode;
          const isEval = node.id === evaluatingNeighbor;
          const isFrontier = frontierSet.has(node.id);
          const isExplored = visitedSet.has(node.id);
          const isInFinalPath = pathNodesSet.has(node.id);

          const position: [number, number] = mode === 'real'
            ? [node.lat, node.lng]
            : [node.y || 0, node.x || 0];

          return (
            <Marker
              key={node.id}
              position={position}
              icon={createCustomIcon(
                node, 
                isSource, 
                isDest, 
                isCurrentActive, 
                isEval, 
                isFrontier, 
                isExplored, 
                isInFinalPath
              )}
            >
              <Popup>
                <div className="p-1 max-w-xs space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5">
                    <h3 className="font-bold text-sm text-slate-100">{node.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium capitalize">
                      {node.category}
                    </span>
                  </div>

                  {node.description && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {node.description}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Floor: {node.floor_info || 'Ground'}</span>
                    <span className="font-mono text-[10px] text-slate-500">ID: {node.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => onSelectNode(node.id, 'source')}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <MapPin className="h-3 w-3" />
                      Set Source
                    </button>
                    <button
                      onClick={() => onSelectNode(node.id, 'destination')}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Navigation className="h-3 w-3" />
                      Set Dest
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Mode Indicator Badge */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2 shadow-xl">
        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
        <span>{mode === 'real' ? 'Mode A: OpenStreetMap Real Campus' : 'Mode B: Custom Campus Blueprint'}</span>
      </div>
    </div>
  );
};
