export interface NodeModel {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  x?: number;
  y?: number;
  description?: string;
  floor_info?: string;
  icon?: string;
}

export interface EdgeModel {
  id: string;
  source: string;
  target: string;
  distance: number;
  is_bidirectional: boolean;
  path_type: string;
  waypoints?: number[][];
}

export interface CampusGraphData {
  mode: 'real' | 'custom';
  campus_name: string;
  center: { lat: number; lng: number };
  zoom: number;
  custom_map_image_url?: string;
  custom_map_bounds?: number[][];
  walking_speed_mps: number;
  nodes: NodeModel[];
  edges: EdgeModel[];
}

export interface SearchStep {
  step_number: number;
  current_node: string;
  action: string;
  neighbor?: string | null;
  frontier: string[];
  visited: string[];
  parent_map: Record<string, string | null>;
  path_so_far: string[];
  current_edge?: string[] | null;
  edge_cost?: number | null;
  g_score?: number | null;
  h_score?: number | null;
  f_score?: number | null;
  note: string;
}

export interface RouteResult {
  algorithm: 'bfs' | 'dfs' | 'astar';
  algorithm_display_name: string;
  found: boolean;
  source: string;
  destination: string;
  path: string[];
  path_nodes: NodeModel[];
  path_coordinates: number[][];
  total_distance: number;
  estimated_time_seconds: number;
  estimated_time_minutes: number;
  edge_count: number;
  nodes_explored_count: number;
  exploration_order: string[];
  search_steps?: SearchStep[];
  execution_time_ms: number;
  guarantees_optimality: boolean;
  heuristic_used?: string;
  explanation: string;
}

export interface CompareResponse {
  source: string;
  source_name: string;
  destination: string;
  destination_name: string;
  results: {
    bfs: RouteResult;
    dfs: RouteResult;
    astar: RouteResult;
  };
  fastest_execution: string;
  shortest_distance: string;
  fewest_explored_nodes: string;
  minimum_hop_count: string;
  summary_notes: string[];
}
