import math
import json
import os
from typing import Dict, List, Tuple, Optional, Any
import networkx as nx

from app.models import NodeModel, EdgeModel, CampusGraphData, RouteResult, CompareResponse
from app.algorithms.bfs import run_bfs
from app.algorithms.dfs import run_dfs
from app.algorithms.astar import run_astar

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes Great-Circle (straight-line geodesic) distance in meters between two GPS coordinates.
    Since straight-line distance is the absolute lower bound between two points on Earth,
    this heuristic is guaranteed to be strictly ADMISSIBLE (never overestimates) and CONSISTENT.
    """
    R = 6371000.0  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def euclidean_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    """Computes Euclidean 2D distance for custom pixel-based campus maps."""
    return math.hypot(x1 - x2, y1 - y2)

class CampusGraphManager:
    def __init__(self, data_file_path: Optional[str] = None):
        self.data_file_path = data_file_path
        self.nx_graph = nx.Graph()
        self.nodes_dict: Dict[str, NodeModel] = {}
        self.edges_dict: Dict[str, EdgeModel] = {}
        self.adjacency: Dict[str, Dict[str, float]] = {}
        self.metadata: Dict[str, Any] = {
            "mode": "real",
            "campus_name": "Apex Institute of Technology Campus",
            "center": {"lat": 12.9716, "lng": 77.5946},
            "zoom": 17,
            "custom_map_image_url": None,
            "custom_map_bounds": [[0, 0], [800, 1000]],
            "walking_speed_mps": 1.35
        }

        if data_file_path and os.path.exists(data_file_path):
            self.load_from_json(data_file_path)

    def load_from_json(self, file_path: str):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.load_from_dict(data)
        self.data_file_path = file_path

    def load_from_dict(self, data: Dict[str, Any]):
        self.nx_graph.clear()
        self.nodes_dict.clear()
        self.edges_dict.clear()
        self.adjacency.clear()

        self.metadata["mode"] = data.get("mode", "real")
        self.metadata["campus_name"] = data.get("campus_name", "Apex Institute of Technology Campus")
        self.metadata["center"] = data.get("center", {"lat": 12.9716, "lng": 77.5946})
        self.metadata["zoom"] = data.get("zoom", 17)
        self.metadata["custom_map_image_url"] = data.get("custom_map_image_url")
        self.metadata["custom_map_bounds"] = data.get("custom_map_bounds", [[0, 0], [800, 1000]])
        self.metadata["walking_speed_mps"] = data.get("walking_speed_mps", 1.35)

        # Populate nodes
        for node_data in data.get("nodes", []):
            node = NodeModel(**node_data)
            self.nodes_dict[node.id] = node
            self.nx_graph.add_node(
                node.id,
                name=node.name,
                category=node.category,
                lat=node.lat,
                lng=node.lng,
                x=node.x,
                y=node.y
            )
            self.adjacency[node.id] = {}

        # Populate edges
        for edge_data in data.get("edges", []):
            edge = EdgeModel(**edge_data)
            self.edges_dict[edge.id] = edge
            self.nx_graph.add_edge(
                edge.source,
                edge.target,
                weight=edge.distance,
                id=edge.id,
                path_type=edge.path_type,
                waypoints=edge.waypoints
            )
            if edge.source in self.adjacency and edge.target in self.adjacency:
                self.adjacency[edge.source][edge.target] = edge.distance
                if edge.is_bidirectional:
                    self.adjacency[edge.target][edge.source] = edge.distance

    def save_to_json(self, file_path: Optional[str] = None):
        target = file_path or self.data_file_path
        if not target:
            raise ValueError("No file path specified to save campus graph data.")
        
        data = self.to_dict()
        with open(target, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mode": self.metadata.get("mode", "real"),
            "campus_name": self.metadata.get("campus_name", "Apex Institute of Technology Campus"),
            "center": self.metadata.get("center", {"lat": 12.9716, "lng": 77.5946}),
            "zoom": self.metadata.get("zoom", 17),
            "custom_map_image_url": self.metadata.get("custom_map_image_url"),
            "custom_map_bounds": self.metadata.get("custom_map_bounds"),
            "walking_speed_mps": self.metadata.get("walking_speed_mps", 1.35),
            "nodes": [node.model_dump() for node in self.nodes_dict.values()],
            "edges": [edge.model_dump() for edge in self.edges_dict.values()]
        }

    def get_graph_data(self) -> CampusGraphData:
        return CampusGraphData(
            mode=self.metadata.get("mode", "real"),
            campus_name=self.metadata.get("campus_name", "Campus"),
            center=self.metadata.get("center", {"lat": 12.9716, "lng": 77.5946}),
            zoom=self.metadata.get("zoom", 17),
            custom_map_image_url=self.metadata.get("custom_map_image_url"),
            custom_map_bounds=self.metadata.get("custom_map_bounds"),
            walking_speed_mps=self.metadata.get("walking_speed_mps", 1.35),
            nodes=list(self.nodes_dict.values()),
            edges=list(self.edges_dict.values())
        )

    def get_heuristic(self, node_a: str, node_b: str) -> float:
        """
        Calculates admissible straight-line distance heuristic h(n).
        For 'real' GPS mode: Uses Haversine geodesic distance (meters).
        For 'custom' mode: Uses Euclidean pixel distance.
        """
        if node_a not in self.nodes_dict or node_b not in self.nodes_dict:
            return 0.0

        na = self.nodes_dict[node_a]
        nb = self.nodes_dict[node_b]

        if self.metadata.get("mode") == "real":
            return haversine_distance(na.lat, na.lng, nb.lat, nb.lng)
        else:
            return euclidean_distance(na.x or 0.0, na.y or 0.0, nb.x or 0.0, nb.y or 0.0)

    def get_path_coordinates(self, path: List[str]) -> List[List[float]]:
        """
        Builds the polyline coordinates list for rendering on the map.
        Preserves intermediate waypoints on edges so paths bend along sidewalks
        instead of cutting straight through buildings.
        """
        if not path or len(path) == 0:
            return []

        mode = self.metadata.get("mode", "real")
        coords: List[List[float]] = []

        for i in range(len(path)):
            node_id = path[i]
            node = self.nodes_dict.get(node_id)
            if not node:
                continue

            node_pt = [node.lat, node.lng] if mode == "real" else [node.y, node.x]

            if i == 0:
                coords.append(node_pt)

            if i < len(path) - 1:
                next_id = path[i + 1]
                # Look for edge waypoints
                edge_found = None
                is_reversed = False
                for edge in self.edges_dict.values():
                    if edge.source == node_id and edge.target == next_id:
                        edge_found = edge
                        is_reversed = False
                        break
                    elif edge.target == node_id and edge.source == next_id and edge.is_bidirectional:
                        edge_found = edge
                        is_reversed = True
                        break

                if edge_found and edge_found.waypoints:
                    pts = list(edge_found.waypoints)
                    if is_reversed:
                        pts.reverse()
                    for pt in pts:
                        coords.append(pt)

                next_node = self.nodes_dict.get(next_id)
                if next_node:
                    next_pt = [next_node.lat, next_node.lng] if mode == "real" else [next_node.y, next_node.x]
                    coords.append(next_pt)

        return coords

    def find_route(
        self,
        source: str,
        destination: str,
        algorithm: str = "astar",
        walking_speed_mps: float = 1.35
    ) -> RouteResult:
        algo_key = algorithm.lower().strip()
        
        if algo_key == "bfs":
            raw_res = run_bfs(self.adjacency, source, destination)
            display_name = "Breadth-First Search (BFS)"
            heuristic_desc = "None (Unweighted Breadth-first Search)"
        elif algo_key == "dfs":
            raw_res = run_dfs(self.adjacency, source, destination)
            display_name = "Depth-First Search (DFS)"
            heuristic_desc = "None (Uninformed Depth-first Search)"
        elif algo_key in ("astar", "a*"):
            mode = self.metadata.get("mode", "real")
            heuristic_name = "Geodesic Haversine Distance (Admissible h(n))" if mode == "real" else "Euclidean Pixel Distance (Admissible h(n))"
            raw_res = run_astar(
                self.adjacency,
                source,
                destination,
                heuristic_fn=self.get_heuristic,
                heuristic_name=heuristic_name
            )
            display_name = "A* Search"
            heuristic_desc = raw_res.get("heuristic_used", heuristic_name)
        else:
            raise ValueError(f"Unknown algorithm '{algorithm}'. Must be 'bfs', 'dfs', or 'astar'.")

        path = raw_res.get("path", [])
        total_distance = raw_res.get("total_distance", 0.0)
        walking_speed = max(0.5, walking_speed_mps or 1.35)
        time_seconds = total_distance / walking_speed if total_distance > 0 else 0.0
        time_minutes = round(time_seconds / 60.0, 1)

        path_nodes = [self.nodes_dict[nid] for nid in path if nid in self.nodes_dict]
        path_coords = self.get_path_coordinates(path)

        return RouteResult(
            algorithm=algo_key,
            algorithm_display_name=display_name,
            found=raw_res.get("found", False),
            source=source,
            destination=destination,
            path=path,
            path_nodes=path_nodes,
            path_coordinates=path_coords,
            total_distance=total_distance,
            estimated_time_seconds=round(time_seconds, 1),
            estimated_time_minutes=time_minutes,
            edge_count=raw_res.get("edge_count", 0),
            nodes_explored_count=raw_res.get("nodes_explored_count", 0),
            exploration_order=raw_res.get("exploration_order", []),
            search_steps=raw_res.get("search_steps", []),
            execution_time_ms=raw_res.get("execution_time_ms", 0.0),
            guarantees_optimality=raw_res.get("guarantees_optimality", False),
            heuristic_used=heuristic_desc,
            explanation=raw_res.get("explanation", "")
        )

    def compare_all(
        self,
        source: str,
        destination: str,
        walking_speed_mps: float = 1.35
    ) -> CompareResponse:
        bfs_res = self.find_route(source, destination, "bfs", walking_speed_mps)
        dfs_res = self.find_route(source, destination, "dfs", walking_speed_mps)
        astar_res = self.find_route(source, destination, "astar", walking_speed_mps)

        results = {
            "bfs": bfs_res,
            "dfs": dfs_res,
            "astar": astar_res
        }

        # Analyze winners
        valid_results = [r for r in [bfs_res, dfs_res, astar_res] if r.found]

        if not valid_results:
            fastest_exec = "None"
            shortest_dist = "None"
            fewest_nodes = "None"
            min_hops = "None"
            summary_notes = ["No route found by any algorithm between the specified source and destination."]
        else:
            fastest_exec = min(valid_results, key=lambda r: r.execution_time_ms).algorithm_display_name
            shortest_dist = min(valid_results, key=lambda r: r.total_distance).algorithm_display_name
            fewest_nodes = min(valid_results, key=lambda r: r.nodes_explored_count).algorithm_display_name
            min_hops = min(valid_results, key=lambda r: r.edge_count).algorithm_display_name

            summary_notes = [
                f"A* Search guarantees the absolute shortest physical route ({astar_res.total_distance}m) using admissible heuristics.",
                f"BFS found a path with {bfs_res.edge_count} turns/edges (minimum hop path), spanning {bfs_res.total_distance}m.",
                f"DFS explored {dfs_res.nodes_explored_count} nodes and found a path of {dfs_res.total_distance}m.",
                "Comparison insight: BFS guarantees minimal edge count (turns), while A* guarantees minimal physical distance."
            ]

        src_name = self.nodes_dict[source].name if source in self.nodes_dict else source
        dst_name = self.nodes_dict[destination].name if destination in self.nodes_dict else destination

        return CompareResponse(
            source=source,
            source_name=src_name,
            destination=destination,
            destination_name=dst_name,
            results=results,
            fastest_execution=fastest_exec,
            shortest_distance=shortest_dist,
            fewest_explored_nodes=fewest_nodes,
            minimum_hop_count=min_hops,
            summary_notes=summary_notes
        )
