import { CampusGraphData, NodeModel, EdgeModel, RouteResult, CompareResponse } from '../types';

const API_BASE = '/api';

export async function fetchCampusMap(mode?: 'real' | 'custom'): Promise<CampusGraphData> {
  const query = mode ? `?mode=${mode}` : '';
  const res = await fetch(`${API_BASE}/map${query}`);
  if (!res.ok) throw new Error(`Failed to load campus map data: ${res.statusText}`);
  return res.json();
}

export async function fetchLocations(mode?: 'real' | 'custom'): Promise<NodeModel[]> {
  const query = mode ? `?mode=${mode}` : '';
  const res = await fetch(`${API_BASE}/locations${query}`);
  if (!res.ok) throw new Error(`Failed to load locations: ${res.statusText}`);
  return res.json();
}

export async function switchMapMode(mode: 'real' | 'custom'): Promise<{ message: string; active_mode: string }> {
  const res = await fetch(`${API_BASE}/map/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new Error(`Failed to switch map mode: ${res.statusText}`);
  return res.json();
}

export async function resetCampusMap(mode?: 'real' | 'custom'): Promise<{ message: string; graph: CampusGraphData }> {
  const query = mode ? `?mode=${mode}` : '';
  const res = await fetch(`${API_BASE}/map/reset${query}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to reset campus data: ${res.statusText}`);
  return res.json();
}

export async function findRoute(
  source: string,
  destination: string,
  algorithm: 'bfs' | 'dfs' | 'astar',
  mode: 'real' | 'custom',
  walkingSpeedMps: number = 1.35
): Promise<RouteResult> {
  const res = await fetch(`${API_BASE}/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source,
      destination,
      algorithm,
      mode,
      walking_speed_mps: walkingSpeedMps,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Routing request failed: ${res.statusText}`);
  }
  return res.json();
}

export async function compareAlgorithms(
  source: string,
  destination: string,
  mode: 'real' | 'custom',
  walkingSpeedMps: number = 1.35
): Promise<CompareResponse> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source,
      destination,
      mode,
      walking_speed_mps: walkingSpeedMps,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Comparison request failed: ${res.statusText}`);
  }
  return res.json();
}

export async function addOrUpdateNode(node: NodeModel, mode: 'real' | 'custom'): Promise<NodeModel> {
  const res = await fetch(`${API_BASE}/nodes?mode=${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(node),
  });
  if (!res.ok) throw new Error(`Failed to save node: ${res.statusText}`);
  return res.json();
}

export async function deleteNode(nodeId: string, mode: 'real' | 'custom'): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/nodes/${nodeId}?mode=${mode}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete node: ${res.statusText}`);
  return res.json();
}

export async function addOrUpdateEdge(edge: EdgeModel, mode: 'real' | 'custom'): Promise<EdgeModel> {
  const res = await fetch(`${API_BASE}/edges?mode=${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(edge),
  });
  if (!res.ok) throw new Error(`Failed to save edge: ${res.statusText}`);
  return res.json();
}

export async function deleteEdge(edgeId: string, mode: 'real' | 'custom'): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/edges/${edgeId}?mode=${mode}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete edge: ${res.statusText}`);
  return res.json();
}

export async function uploadCustomMapImage(file: File): Promise<{ message: string; image_url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/map/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Image upload failed.');
  }
  return res.json();
}

export async function saveCampusMap(mode: 'real' | 'custom'): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/map/save?mode=${mode}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to persist campus data.');
  return res.json();
}
