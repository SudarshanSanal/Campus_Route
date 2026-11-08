import os
import shutil
import uuid
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.models import (
    NodeModel,
    EdgeModel,
    CampusGraphData,
    RouteRequest,
    CompareRequest,
    RouteResult,
    CompareResponse
)
from app.graph import CampusGraphManager

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

REAL_CAMPUS_FILE = os.path.join(DATA_DIR, "sample_campus.json")
CUSTOM_CAMPUS_FILE = os.path.join(DATA_DIR, "custom_map_data.json")
DEFAULT_SVG_FILE = os.path.join(DATA_DIR, "default_campus_blueprint.svg")

# Managers for both modes
real_manager = CampusGraphManager(REAL_CAMPUS_FILE)
custom_manager = CampusGraphManager(CUSTOM_CAMPUS_FILE)

# Current active mode: "real" or "custom"
active_mode = "real"

def get_active_manager(mode: Optional[str] = None) -> CampusGraphManager:
    m = (mode or active_mode).lower().strip()
    if m == "custom":
        return custom_manager
    return real_manager

app = FastAPI(
    title="AI Campus Route Finder API",
    description="Backend graph search algorithms and interactive campus navigation service.",
    version="1.0.0"
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "project": "AI Campus Route Finder",
        "status": "operational",
        "active_mode": active_mode,
        "docs": "/docs",
        "algorithms": ["bfs", "dfs", "astar"]
    }

@app.get("/api/map", response_model=CampusGraphData)
def get_map(mode: Optional[str] = Query(None, description="Mode: 'real' or 'custom'")):
    mgr = get_active_manager(mode)
    return mgr.get_graph_data()

@app.get("/api/locations", response_model=List[NodeModel])
def get_locations(mode: Optional[str] = Query(None, description="Mode: 'real' or 'custom'")):
    mgr = get_active_manager(mode)
    return list(mgr.nodes_dict.values())

@app.post("/api/map/mode")
def set_mode(payload: Dict[str, str]):
    global active_mode
    mode = payload.get("mode", "real").lower()
    if mode not in ("real", "custom"):
        raise HTTPException(status_code=400, detail="Mode must be 'real' or 'custom'.")
    active_mode = mode
    return {"message": f"Active campus map mode switched to '{active_mode}'.", "active_mode": active_mode}

@app.post("/api/map/reset")
def reset_map(mode: Optional[str] = Query(None)):
    m = (mode or active_mode).lower()
    if m == "custom":
        custom_manager.load_from_json(CUSTOM_CAMPUS_FILE)
        return {"message": "Custom map reset to default blueprint.", "graph": custom_manager.get_graph_data()}
    else:
        real_manager.load_from_json(REAL_CAMPUS_FILE)
        return {"message": "Real campus map reset to default demo dataset.", "graph": real_manager.get_graph_data()}

@app.post("/api/route", response_model=RouteResult)
def calculate_route(request: RouteRequest):
    mgr = get_active_manager(request.mode)
    if not request.source or not request.destination:
        raise HTTPException(status_code=400, detail="Source and destination are required.")
    
    try:
        result = mgr.find_route(
            source=request.source,
            destination=request.destination,
            algorithm=request.algorithm,
            walking_speed_mps=request.walking_speed_mps or 1.35
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing error: {str(e)}")

@app.post("/api/compare", response_model=CompareResponse)
def compare_algorithms(request: CompareRequest):
    mgr = get_active_manager(request.mode)
    if not request.source or not request.destination:
        raise HTTPException(status_code=400, detail="Source and destination are required.")
    
    try:
        comparison = mgr.compare_all(
            source=request.source,
            destination=request.destination,
            walking_speed_mps=request.walking_speed_mps or 1.35
        )
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison calculation error: {str(e)}")

@app.post("/api/nodes", response_model=NodeModel)
def add_or_update_node(node: NodeModel, mode: Optional[str] = Query(None)):
    mgr = get_active_manager(mode)
    mgr.nodes_dict[node.id] = node
    mgr.nx_graph.add_node(
        node.id,
        name=node.name,
        category=node.category,
        lat=node.lat,
        lng=node.lng,
        x=node.x,
        y=node.y
    )
    if node.id not in mgr.adjacency:
        mgr.adjacency[node.id] = {}
    return node

@app.delete("/api/nodes/{node_id}")
def delete_node(node_id: str, mode: Optional[str] = Query(None)):
    mgr = get_active_manager(mode)
    if node_id not in mgr.nodes_dict:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    
    del mgr.nodes_dict[node_id]
    if mgr.nx_graph.has_node(node_id):
        mgr.nx_graph.remove_node(node_id)
    if node_id in mgr.adjacency:
        del mgr.adjacency[node_id]

    # Clean up connected edges
    edges_to_delete = [
        eid for eid, edge in mgr.edges_dict.items()
        if edge.source == node_id or edge.target == node_id
    ]
    for eid in edges_to_delete:
        del mgr.edges_dict[eid]

    for u in mgr.adjacency:
        mgr.adjacency[u].pop(node_id, None)

    return {"message": f"Node '{node_id}' and {len(edges_to_delete)} incident edges removed."}

@app.post("/api/edges", response_model=EdgeModel)
def add_or_update_edge(edge: EdgeModel, mode: Optional[str] = Query(None)):
    mgr = get_active_manager(mode)
    if edge.source not in mgr.nodes_dict:
        raise HTTPException(status_code=400, detail=f"Source node '{edge.source}' does not exist.")
    if edge.target not in mgr.nodes_dict:
        raise HTTPException(status_code=400, detail=f"Target node '{edge.target}' does not exist.")

    mgr.edges_dict[edge.id] = edge
    mgr.nx_graph.add_edge(
        edge.source,
        edge.target,
        weight=edge.distance,
        id=edge.id,
        path_type=edge.path_type,
        waypoints=edge.waypoints
    )
    mgr.adjacency[edge.source][edge.target] = edge.distance
    if edge.is_bidirectional:
        mgr.adjacency[edge.target][edge.source] = edge.distance

    return edge

@app.delete("/api/edges/{edge_id}")
def delete_edge(edge_id: str, mode: Optional[str] = Query(None)):
    mgr = get_active_manager(mode)
    if edge_id not in mgr.edges_dict:
        raise HTTPException(status_code=404, detail=f"Edge '{edge_id}' not found.")

    edge = mgr.edges_dict.pop(edge_id)
    if mgr.nx_graph.has_edge(edge.source, edge.target):
        mgr.nx_graph.remove_edge(edge.source, edge.target)

    mgr.adjacency.get(edge.source, {}).pop(edge.target, None)
    if edge.is_bidirectional:
        mgr.adjacency.get(edge.target, {}).pop(edge.source, None)

    return {"message": f"Edge '{edge_id}' successfully removed."}

@app.post("/api/map/upload")
async def upload_custom_map_image(file: UploadFile = File(...)):
    extension = os.path.splitext(file.filename or "")[1].lower()
    if extension not in [".png", ".jpg", ".jpeg", ".svg", ".webp"]:
        raise HTTPException(status_code=400, detail="Allowed image formats: PNG, JPG, JPEG, SVG, WEBP.")

    unique_filename = f"custom_map_{uuid.uuid4().hex[:8]}{extension}"
    target_path = os.path.join(UPLOADS_DIR, unique_filename)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/api/map/image/{unique_filename}"
    custom_manager.metadata["custom_map_image_url"] = image_url

    return {
        "message": "Campus map image uploaded successfully.",
        "image_url": image_url,
        "filename": unique_filename
    }

@app.get("/api/map/image/default")
def get_default_map_image():
    if os.path.exists(DEFAULT_SVG_FILE):
        return FileResponse(DEFAULT_SVG_FILE, media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="Default map image not found.")

@app.get("/api/map/image/{filename}")
def get_uploaded_image(filename: str):
    file_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image file not found.")

    ext = os.path.splitext(filename)[1].lower()
    media_types = {
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp"
    }
    media_type = media_types.get(ext, "application/octet-stream")
    return FileResponse(file_path, media_type=media_type)

@app.post("/api/map/save")
def persist_map(mode: Optional[str] = Query(None)):
    mgr = get_active_manager(mode)
    mgr.save_to_json()
    return {"message": "Campus graph data persisted successfully."}
