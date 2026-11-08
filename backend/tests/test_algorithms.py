import pytest
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.algorithms.bfs import run_bfs
from app.algorithms.dfs import run_dfs
from app.algorithms.astar import run_astar
from app.graph import CampusGraphManager, haversine_distance

@pytest.fixture
def sample_graph():
    """
    Constructs a weighted graph designed to demonstrate algorithm divergence:
    Nodes: A, B, C, D, E, X (X is disconnected)
    Edges:
      A -> D (weight 500)   [1 edge, 500m]
      A -> B (weight 100)
      B -> C (weight 100)
      C -> D (weight 100)   [3 edges, 300m]
      D -> E (weight 50)
      X (isolated node)
    """
    return {
        "A": {"D": 500.0, "B": 100.0},
        "B": {"A": 100.0, "C": 100.0},
        "C": {"B": 100.0, "D": 100.0},
        "D": {"A": 500.0, "C": 100.0, "E": 50.0},
        "E": {"D": 50.0},
        "X": {}
    }

def test_source_equals_destination(sample_graph):
    for algo_fn in [run_bfs, run_dfs, run_astar]:
        res = algo_fn(sample_graph, "A", "A")
        assert res["found"] is True
        assert res["path"] == ["A"]
        assert res["total_distance"] == 0.0
        assert res["edge_count"] == 0
        assert res["nodes_explored_count"] == 1

def test_invalid_source_or_destination(sample_graph):
    res_bfs = run_bfs(sample_graph, "NON_EXISTENT", "D")
    assert res_bfs["found"] is False
    assert res_bfs["path"] == []

    res_astar = run_astar(sample_graph, "A", "UNKNOWN_NODE")
    assert res_astar["found"] is False
    assert res_astar["path"] == []

def test_unreachable_destination(sample_graph):
    res_bfs = run_bfs(sample_graph, "A", "X")
    assert res_bfs["found"] is False
    assert res_bfs["path"] == []

    res_dfs = run_dfs(sample_graph, "A", "X")
    assert res_dfs["found"] is False

    res_astar = run_astar(sample_graph, "A", "X")
    assert res_astar["found"] is False

def test_bfs_minimum_hops_vs_astar_minimum_distance(sample_graph):
    """
    Critical pedagogical test:
    From A to D:
    BFS finds 1-hop path ['A', 'D'] with distance 500.
    A* finds 3-hop path ['A', 'B', 'C', 'D'] with distance 300.
    """
    bfs_res = run_bfs(sample_graph, "A", "D")
    assert bfs_res["found"] is True
    assert bfs_res["path"] == ["A", "D"]
    assert bfs_res["edge_count"] == 1
    assert bfs_res["total_distance"] == 500.0

    # Heuristic for A* (admissible: 0 or lower bound)
    astar_res = run_astar(sample_graph, "A", "D", heuristic_fn=lambda u, v: 0.0)
    assert astar_res["found"] is True
    assert astar_res["path"] == ["A", "B", "C", "D"]
    assert astar_res["edge_count"] == 3
    assert astar_res["total_distance"] == 300.0
    assert astar_res["total_distance"] < bfs_res["total_distance"]
    assert astar_res["guarantees_optimality"] is True

def test_dfs_finds_valid_path(sample_graph):
    dfs_res = run_dfs(sample_graph, "A", "E")
    assert dfs_res["found"] is True
    assert dfs_res["path"][0] == "A"
    assert dfs_res["path"][-1] == "E"
    assert dfs_res["total_distance"] > 0

def test_distance_matches_edge_weights_sum(sample_graph):
    for algo_fn in [run_bfs, run_dfs, run_astar]:
        res = algo_fn(sample_graph, "A", "E")
        assert res["found"] is True
        path = res["path"]
        calculated_sum = 0.0
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            calculated_sum += sample_graph[u][v]
        assert round(res["total_distance"], 2) == round(calculated_sum, 2)

def test_haversine_admissibility():
    """Geodesic distance between two points must never exceed straight walking paths."""
    lat1, lon1 = 12.9716, 77.5946
    lat2, lon2 = 12.9733, 77.5959
    h_dist = haversine_distance(lat1, lon1, lat2, lon2)
    assert h_dist > 0
    assert h_dist < 500  # realistic college block distance < 500m

def test_campus_manager_default_dataset():
    data_path = os.path.join(os.path.dirname(__file__), "..", "app", "data", "sample_campus.json")
    mgr = CampusGraphManager(data_path)
    assert len(mgr.nodes_dict) >= 9
    assert "main_gate" in mgr.nodes_dict
    assert "auditorium" in mgr.nodes_dict

    # Check routing on demo campus
    route = mgr.find_route("main_gate", "auditorium", "astar")
    assert route.found is True
    assert len(route.path) >= 2
    assert route.total_distance > 0
    assert route.path[0] == "main_gate"
    assert route.path[-1] == "auditorium"

    # Compare all algorithms
    comparison = mgr.compare_all("main_gate", "auditorium")
    assert "bfs" in comparison.results
    assert "dfs" in comparison.results
    assert "astar" in comparison.results
    assert comparison.results["astar"].found is True
