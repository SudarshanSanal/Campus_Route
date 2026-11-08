import time
from typing import Dict, List, Tuple, Set, Optional, Any

def run_dfs(
    graph: Dict[str, Dict[str, float]],
    source: str,
    destination: str
) -> Dict[str, Any]:
    """
    Depth-First Search (DFS) algorithm with true single-branch exploration and backtracking.
    Plunges deep into one branch at a time before backtracking.

    Characteristics:
    - Does NOT push all sibling neighbors onto a queue at once (which is BFS behavior).
    - Uses an active depth call-stack: explores ONE neighbor deeply to the end of its branch.
    - If a branch hits a dead end, it backtracks and tries the next sibling branch.
    - The frontier represents ONLY the active branch stack currently being traversed.
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
            "frontier": [source],
            "visited": [source],
            "parent_map": {source: None},
            "path_so_far": [source],
            "current_edge": None,
            "edge_cost": 0.0,
            "g_score": 0.0,
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
            "guarantees_optimality": False,
            "explanation": "Source and destination are identical; 0 meters distance."
        }

    # True Depth-First Search with active call-frame stack:
    # At each node, DFS picks ONE unvisited neighbor and immediately dives into it.
    # It does NOT push all neighbors onto a queue at once.
    # The frontier represents ONLY the active branch stack currently being traversed.
    visited: Set[str] = {source}
    exploration_order: List[str] = [source]
    search_steps: List[Dict[str, Any]] = []
    step_num = 1
    found = False
    final_path: List[str] = []
    final_cost: float = 0.0

    current_path: List[str] = [source]
    parent_map: Dict[str, Optional[str]] = {source: None}

    # Frame: [current_node, remaining_neighbors_list, cost_so_far]
    initial_neighbors = sorted(graph[source].keys())
    call_stack = [[source, initial_neighbors, 0.0]]

    search_steps.append({
        "step_number": step_num,
        "current_node": source,
        "action": "visit",
        "neighbor": None,
        "frontier": list(current_path),
        "visited": list(visited),
        "parent_map": dict(parent_map),
        "path_so_far": list(current_path),
        "current_edge": None,
        "edge_cost": 0.0,
        "g_score": 0.0,
        "note": f"Starting DFS at '{source}'. Active DFS stack: [{source}]."
    })
    step_num += 1

    while call_stack:
        frame = call_stack[-1]
        current, remaining_neighbors, cost_so_far = frame[0], frame[1], frame[2]

        # Find the NEXT unvisited neighbor
        next_neighbor = None
        while remaining_neighbors:
            cand = remaining_neighbors.pop(0)
            if cand not in visited:
                next_neighbor = cand
                break

        if next_neighbor is not None:
            # Found next branch: DIVE DEEP IMMEDIATELY!
            edge_dist = graph[current][next_neighbor]
            new_cost = cost_so_far + edge_dist

            visited.add(next_neighbor)
            exploration_order.append(next_neighbor)
            current_path.append(next_neighbor)
            parent_map[next_neighbor] = current

            # Check if this neighbor is destination
            if next_neighbor == destination:
                found = True
                final_path = list(current_path)
                final_cost = new_cost
                search_steps.append({
                    "step_number": step_num,
                    "current_node": next_neighbor,
                    "action": "goal_reached",
                    "neighbor": None,
                    "frontier": list(current_path),
                    "visited": list(visited),
                    "parent_map": dict(parent_map),
                    "path_so_far": list(current_path),
                    "current_edge": [current, next_neighbor],
                    "edge_cost": edge_dist,
                    "g_score": round(new_cost, 1),
                    "note": f"Target '{destination}' reached! DFS found route: {' -> '.join(current_path)} ({round(new_cost, 1)}m)."
                })
                step_num += 1
                break

            # Step: record diving into the single neighbor
            search_steps.append({
                "step_number": step_num,
                "current_node": current,
                "action": "visit",
                "neighbor": next_neighbor,
                "frontier": list(current_path),
                "visited": list(visited),
                "parent_map": dict(parent_map),
                "path_so_far": list(current_path),
                "current_edge": [current, next_neighbor],
                "edge_cost": edge_dist,
                "g_score": round(new_cost, 1),
                "note": f"Diving deep from '{current}' into '{next_neighbor}' ({edge_dist}m). DFS branch: {' -> '.join(current_path)}."
            })
            step_num += 1

            # Push new frame to continue diving from next_neighbor
            next_neighbors = sorted(graph[next_neighbor].keys())
            call_stack.append([next_neighbor, next_neighbors, new_cost])

        else:
            # No more unvisited neighbors for current node: BACKTRACK!
            call_stack.pop()
            backtracked_node = current_path.pop()
            if backtracked_node in parent_map:
                del parent_map[backtracked_node]

            if call_stack:
                parent_node = call_stack[-1][0]
                parent_cost = call_stack[-1][2]
                search_steps.append({
                    "step_number": step_num,
                    "current_node": parent_node,
                    "action": "visit",
                    "neighbor": backtracked_node,
                    "frontier": list(current_path),
                    "visited": list(visited),
                    "parent_map": dict(parent_map),
                    "path_so_far": list(current_path),
                    "current_edge": [parent_node, backtracked_node],
                    "edge_cost": graph[parent_node][backtracked_node],
                    "g_score": round(parent_cost, 1),
                    "note": f"Dead end reached via '{backtracked_node}'. Backtracking to '{parent_node}'. Active stack: {' -> '.join(current_path)}."
                })
                step_num += 1

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
            "explanation": f"No accessible path found between '{source}' and '{destination}' using DFS."
        }

    edge_count = len(final_path) - 1
    return {
        "found": True,
        "path": final_path,
        "total_distance": round(final_cost, 2),
        "edge_count": edge_count,
        "nodes_explored_count": len(exploration_order),
        "exploration_order": exploration_order,
        "search_steps": search_steps,
        "execution_time_ms": round(elapsed_ms, 4),
        "guarantees_optimality": False,
        "explanation": (
            f"DFS explored {len(exploration_order)} nodes across {len(search_steps)} steps. "
            f"Resulting route has {edge_count} walking segments ({round(final_cost, 1)}m). "
            "DFS plunges deeply into one branch before backtracking, so it is neither distance-optimal nor hop-optimal."
        )
    }
