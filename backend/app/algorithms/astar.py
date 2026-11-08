import heapq
import time
from typing import Dict, List, Tuple, Set, Optional, Callable, Any

def run_astar(
    graph: Dict[str, Dict[str, float]],
    source: str,
    destination: str,
    heuristic_fn: Optional[Callable[[str, str], float]] = None,
    heuristic_name: str = "Admissible Straight-line Distance h(n)"
) -> Dict[str, Any]:
    """
    A* Search algorithm with step-by-step state space trace.
    Uses evaluation function f(n) = g(n) + h(n):
      g(n) = Exact accumulated edge weight from source to n
      h(n) = Admissible heuristic estimating remaining distance to destination
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
            "heuristic_used": heuristic_name,
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
            "g_score": 0.0,
            "h_score": 0.0,
            "f_score": 0.0,
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
            "heuristic_used": heuristic_name,
            "explanation": "Source and destination are identical; 0 meters distance."
        }

    def h(n: str) -> float:
        if heuristic_fn is not None:
            val = heuristic_fn(n, destination)
            return max(0.0, val)
        return 0.0

    def get_path_to(target: str, parents: Dict[str, Optional[str]]) -> List[str]:
        p = []
        c = target
        while c is not None:
            p.append(c)
            c = parents.get(c)
        p.reverse()
        return p

    counter = 0
    start_h = round(h(source), 1)
    # open_heap stores: (f_score, g_score, counter, node)
    open_heap = [(start_h, 0.0, counter, source)]
    counter += 1

    g_score: Dict[str, float] = {source: 0.0}
    parent: Dict[str, Optional[str]] = {source: None}
    closed_set: Set[str] = set()
    exploration_order: List[str] = []
    search_steps: List[Dict[str, Any]] = []
    step_num = 1
    found = False

    search_steps.append({
        "step_number": step_num,
        "current_node": source,
        "action": "visit",
        "neighbor": None,
        "frontier": [source],
        "visited": list(closed_set),
        "parent_map": dict(parent),
        "path_so_far": [source],
        "current_edge": None,
        "edge_cost": 0.0,
        "g_score": 0.0,
        "h_score": start_h,
        "f_score": start_h,
        "note": f"Initialized A* Priority Queue with origin '{source}'. g=0, h={start_h}, f={start_h}."
    })
    step_num += 1

    while open_heap:
        f, current_g, _, current = heapq.heappop(open_heap)

        if current in closed_set:
            continue

        closed_set.add(current)
        exploration_order.append(current)
        current_path = get_path_to(current, parent)
        curr_h = round(h(current), 1)

        frontier_nodes = [item[3] for item in open_heap if item[3] not in closed_set]

        if current == destination:
            found = True
            search_steps.append({
                "step_number": step_num,
                "current_node": current,
                "action": "goal_reached",
                "neighbor": None,
                "frontier": frontier_nodes,
                "visited": list(closed_set),
                "parent_map": dict(parent),
                "path_so_far": current_path,
                "current_edge": None,
                "edge_cost": 0.0,
                "g_score": round(current_g, 1),
                "h_score": 0.0,
                "f_score": round(current_g, 1),
                "note": f"Goal '{destination}' popped with lowest f={round(current_g, 1)}m! Optimal path guaranteed."
            })
            step_num += 1
            break

        search_steps.append({
            "step_number": step_num,
            "current_node": current,
            "action": "visit",
            "neighbor": None,
            "frontier": frontier_nodes,
            "visited": list(closed_set),
            "parent_map": dict(parent),
            "path_so_far": current_path,
            "current_edge": None,
            "edge_cost": 0.0,
            "g_score": round(current_g, 1),
            "h_score": curr_h,
            "f_score": round(f, 1),
            "note": f"Popped '{current}' (min f={round(f, 1)}m = g:{round(current_g, 1)} + h:{curr_h}). Evaluating walkways..."
        })
        step_num += 1

        for neighbor, weight in sorted(graph[current].items(), key=lambda x: x[1]):
            if neighbor in closed_set:
                continue

            tentative_g = current_g + weight
            is_better = tentative_g < g_score.get(neighbor, float('inf'))

            if is_better:
                g_score[neighbor] = tentative_g
                parent[neighbor] = current
                neighbor_h = round(h(neighbor), 1)
                f_score = round(tentative_g + neighbor_h, 1)
                heapq.heappush(open_heap, (f_score, tentative_g, counter, neighbor))
                counter += 1

                updated_frontier = [item[3] for item in open_heap if item[3] not in closed_set]

                search_steps.append({
                    "step_number": step_num,
                    "current_node": current,
                    "action": "push_neighbor",
                    "neighbor": neighbor,
                    "frontier": updated_frontier,
                    "visited": list(closed_set),
                    "parent_map": dict(parent),
                    "path_so_far": current_path + [neighbor],
                    "current_edge": [current, neighbor],
                    "edge_cost": weight,
                    "g_score": round(tentative_g, 1),
                    "h_score": neighbor_h,
                    "f_score": f_score,
                    "note": f"Updated '{neighbor}': g={round(tentative_g, 1)}m, h={neighbor_h}m &rarr; f={f_score}m. Added to priority queue."
                })
                step_num += 1

    elapsed_ms = (time.perf_counter() - start_time) * 1000

    if not found:
        return {
            "found": False,
            "path": [],
            "total_distance": 0.0,
            "edge_count": 0,
            "nodes_explored_count": len(closed_set),
            "exploration_order": exploration_order,
            "search_steps": search_steps,
            "execution_time_ms": elapsed_ms,
            "guarantees_optimality": False,
            "heuristic_used": heuristic_name,
            "explanation": f"No accessible path found between '{source}' and '{destination}' using A*."
        }

    path = get_path_to(destination, parent)
    total_distance = g_score[destination]
    edge_count = len(path) - 1

    return {
        "found": True,
        "path": path,
        "total_distance": round(total_distance, 2),
        "edge_count": edge_count,
        "nodes_explored_count": len(closed_set),
        "exploration_order": exploration_order,
        "search_steps": search_steps,
        "execution_time_ms": round(elapsed_ms, 4),
        "guarantees_optimality": True,
        "heuristic_used": heuristic_name,
        "explanation": (
            f"A* explored {len(closed_set)} nodes across {len(search_steps)} steps using f(n)=g(n)+h(n). "
            f"Guaranteed mathematically optimal shortest physical route of {round(total_distance, 1)}m "
            f"across {edge_count} walking segments using {heuristic_name}."
        )
    }
