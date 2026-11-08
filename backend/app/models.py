from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class NodeModel(BaseModel):
    id: str
    name: str
    category: str = "academic"  # entrance, academic, administrative, amenity, facility, parking, lab
    lat: float
    lng: float
    x: Optional[float] = 0.0  # Pixel X coordinate for custom map
    y: Optional[float] = 0.0  # Pixel Y coordinate for custom map
    description: Optional[str] = ""
    floor_info: Optional[str] = "Ground Floor"
    icon: Optional[str] = "building"

class EdgeModel(BaseModel):
    id: str
    source: str
    target: str
    distance: float  # Physical distance in meters (or pixels for custom map)
    is_bidirectional: bool = True
    path_type: str = "paved_walkway"  # paved_walkway, corridor, stairs, road, covered_path
    waypoints: Optional[List[List[float]]] = None  # intermediate [lat, lng] or [y, x] points for realistic pedestrian curvature

class CampusGraphData(BaseModel):
    mode: str = "real"  # "real" or "custom"
    campus_name: str = "Apex Institute of Technology Campus"
    center: Dict[str, float] = Field(default_factory=lambda: {"lat": 12.9716, "lng": 77.5946})
    zoom: int = 17
    custom_map_image_url: Optional[str] = None
    custom_map_bounds: Optional[List[List[float]]] = None  # [[0, 0], [800, 1000]]
    walking_speed_mps: float = 1.35  # Average walking speed ~ 1.35 m/s (~4.8 km/h)
    nodes: List[NodeModel]
    edges: List[EdgeModel]

class RouteRequest(BaseModel):
    source: str
    destination: str
    algorithm: str = "astar"  # "bfs", "dfs", "astar"
    mode: str = "real"
    walking_speed_mps: Optional[float] = 1.35

class CompareRequest(BaseModel):
    source: str
    destination: str
    mode: str = "real"
    walking_speed_mps: Optional[float] = 1.35

class SearchStep(BaseModel):
    step_number: int
    current_node: str
    action: str  # "visit", "inspect_neighbor", "push_neighbor", "goal_reached"
    neighbor: Optional[str] = None
    frontier: List[str] = []
    visited: List[str] = []
    parent_map: Dict[str, Optional[str]] = {}
    path_so_far: List[str] = []
    current_edge: Optional[List[str]] = None  # [u, v]
    edge_cost: Optional[float] = None
    g_score: Optional[float] = None
    h_score: Optional[float] = None
    f_score: Optional[float] = None
    note: str = ""

class RouteResult(BaseModel):
    algorithm: str
    algorithm_display_name: str
    found: bool
    source: str
    destination: str
    path: List[str]
    path_nodes: List[NodeModel]
    path_coordinates: List[List[float]]
    total_distance: float  # In meters
    estimated_time_seconds: float
    estimated_time_minutes: float
    edge_count: int
    nodes_explored_count: int
    exploration_order: List[str]
    search_steps: List[SearchStep] = []  # Detailed step-by-step search traces
    execution_time_ms: float
    guarantees_optimality: bool
    heuristic_used: Optional[str] = None
    explanation: str

class CompareResponse(BaseModel):
    source: str
    source_name: str
    destination: str
    destination_name: str
    results: Dict[str, RouteResult]
    fastest_execution: str
    shortest_distance: str
    fewest_explored_nodes: str
    minimum_hop_count: str
    summary_notes: List[str]
