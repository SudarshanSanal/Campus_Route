import time
from collections import deque
from typing import Dict, List, Tuple, Set, Optional, Any

def run_bfs(
    graph: Dict[str, Dict[str, float]],
    source: str,
    destination: str
) -> Dict[str, Any]:
    """
    Breadth-First Search (BFS) algorithm with step-by-step state space trace.
    Explores state-space level by level using a FIFO queue.
    """
    start_time = time.perf_counter()

    if source not in graph or destination not in graph:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return {
            "found": False,
            "path": [],
            "total_distance": 0.0,
            "edge_count": 0,
            "nodes_explored_count": 0,
            "exploration_order": [],
            "search_steps": [],
            "execution_time_ms": elapsed_ms,
            "guarantees_optimality": False,
            "explanation": f"Source '{source}' or destination '{destination}' does not exist in graph."
        }

    if source == destination:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        step = {
            "step_number": 1,
            "current_node": source,
            "action": "goal_reached",
            "neighbor": None,
            "frontier": [],
            "visited": [source],
            "parent_map": {source: None},
            "path_so_far": [source],
            "current_edge": None,
            "edge_cost": 0.0,
            "note": "Source is the destination; 0m distance."
        }
        return {
            "found": True,
            "path": [source],
            "total_distance": 0.0,
            "edge_count": 0,
            "nodes_explored_count": 1,
            "exploration_order": [source],
            "search_steps": [step],
            "execution_time_ms": elapsed_ms,
            "guarantees_optimality": True,
            "explanation": "Source and destination are identical; 0 meters distance."
        }

    def get_path_to(target: str, parents: Dict[str, Optional[str]]) -> List[str]:
        p = []
        c = target
        while c is not None:
            p.append(c)
            c = parents.get(c)
        p.reverse()
        return p

    queue = deque([source])
    visited: Set[str] = {source}
    parent: Dict[str, Optional[str]] = {source: None}
    exploration_order: List[str] = []
    search_steps: List[Dict[str, Any]] = []
    step_num = 1
    found = False

    # Initial start step
    search_steps.append({
        "step_number": step_num,
        "current_node": source,
        "action": "visit",
        "neighbor": None,
        "frontier": list(queue),
        "visited": list(visited),
        "parent_map": dict(parent),
        "path_so_far": [source],
        "current_edge": None,
        "edge_cost": 0.0,
        "note": f"Starting BFS at origin '{source}'. Initialized FIFO queue."
    })
    step_num += 1

    while queue:
        current = queue.popleft()
        exploration_order.append(current)

        current_path = get_path_to(current, parent)

        if current == destination:
            found = True
            search_steps.append({
                "step_number": step_num,
                "current_node": current,
                "action": "goal_reached",
                "neighbor": None,
                "frontier": list(queue),
                "visited": list(visited),
                "parent_map": dict(parent),
                "path_so_far": current_path,
                "current_edge": None,
                "edge_cost": 0.0,
                "note": f"Destination '{destination}' reached from '{parent.get(current)}'!"
            })
            step_num += 1
            break

        # Record pop / node visit
        search_steps.append({
            "step_number": step_num,
            "current_node": current,
            "action": "visit",
            "neighbor": None,
            "frontier": list(queue),
            "visited": list(visited),
            "parent_map": dict(parent),
            "path_so_far": current_path,
            "current_edge": None,
            "edge_cost": 0.0,
            "note": f"Dequeued '{current}'. Exploring incident walkways..."
        })
        step_num += 1

        for neighbor in sorted(graph[current].keys()):
            edge_dist = graph[current][neighbor]
            if neighbor not in visited:
                visited.add(neighbor)
                parent[neighbor] = current
                queue.append(neighbor)

                search_steps.append({
                    "step_number": step_num,
                    "current_node": current,
                    "action": "push_neighbor",
                    "neighbor": neighbor,
                    "frontier": list(queue),
                    "visited": list(visited),
                    "parent_map": dict(parent),
                    "path_so_far": current_path + [neighbor],
                    "current_edge": [current, neighbor],
                    "edge_cost": edge_dist,
                    "note": f"Traversed walkway ({edge_dist}m) to unvisited '{neighbor}'. Added to queue rear."
                })
                step_num += 1

                if neighbor == destination:
                    found = True
                    search_steps.append({
                        "step_number": step_num,
                        "current_node": neighbor,
                        "action": "goal_reached",
                        "neighbor": None,
                        "frontier": list(queue),
                        "visited": list(visited),
                        "parent_map": dict(parent),
                        "path_so_far": get_path_to(neighbor, parent),
                        "current_edge": [current, neighbor],
                        "edge_cost": edge_dist,
                        "note": f"Target destination '{destination}' discovered via '{current}' ({edge_dist}m)!"
                    })
                    step_num += 1
                    break
        if found:
            break

    elapsed_ms = (time.perf_counter() - start_time) * 1000

    if not found:
        return {
            "found": False,
            "path": [],
            "total_distance": 0.0,
            "edge_count": 0,
            "nodes_explored_count": len(exploration_order),
            "exploration_order": exploration_order,
            "search_steps": search_steps,
            "execution_time_ms": elapsed_ms,
            "guarantees_optimality": False,
            "explanation": f"No accessible walkway exists between '{source}' and '{destination}'."
        }

    # Reconstruct path
    path = get_path_to(destination, parent)

    # Calculate actual weighted physical distance along BFS path
    total_distance = 0.0
    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        total_distance += graph[u].get(v, 0.0)

    edge_count = len(path) - 1

    return {
        "found": True,
        "path": path,
        "total_distance": round(total_distance, 2),
        "edge_count": edge_count,
        "nodes_explored_count": len(exploration_order),
        "exploration_order": exploration_order,
        "search_steps": search_steps,
        "execution_time_ms": round(elapsed_ms, 4),
        "guarantees_optimality": True,
        "explanation": (
            f"BFS explored {len(exploration_order)} nodes level-by-level across {len(search_steps)} search steps. "
            f"Found the HOP-OPTIMAL path with {edge_count} walking segments ({round(total_distance, 1)}m). "
            "BFS guarantees the fewest number of edges (turns/hops) but NOT the shortest physical distance — use A* for minimum meters."
        )
    }
