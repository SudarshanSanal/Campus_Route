# AI Campus Route Finder 🧭🎓

An intelligent, interactive AI-powered campus navigation and pathfinding evaluation system built for college projects, laboratory demonstrations, and academic presentations.

The application demonstrates **state-space search formulation**, **graph modeling**, **Breadth-First Search (BFS)**, **Depth-First Search (DFS)**, and **Informed A\* Search** using **admissible geodesic (Haversine) heuristics** with side-by-side performance benchmarks.

---

## 🌟 Key Features

### 1. Dual Campus Map Modes
- **Mode A — Real Campus Map**:
  - Interactive Leaflet map powered by **OpenStreetMap** tiles centered on **Shri Dharmasthala Manjunatheshwara College of Engineering and Technology (SDMCET), Dharwad** (`lat: 15.4306419, lng: 75.0146384`).
  - Contains all 17 college campus locations:
    1. Main Gate
    2. Parking Area
    3. Administrative Block
    4. SDMCET Alumni Building
    5. SDMCET College Library
    6. Department Of Computer Science And Engineering (CSE)
    7. Computer Science Laboratory
    8. Department of Electronics & Communication Engineering (ECE)
    9. Electronics Laboratory
    10. Department of Mechanical Engineering
    11. Civil Department
    12. SDMCET College Fast Food (Cafeteria)
    13. SDMCET Auditorium
    14. Seminar Hall
    15. Department of Physical Education & Sports Science
    16. Sports Ground
    17. Hostel
  - Realistic pedestrian sidewalks and corridors connecting all blocks.
  - Visual differentiation for **Source (Green)**, **Destination (Red)**, **Active Route (Glowing Blue/Indigo)**, and **Explored States (Amber pulse)**.
- **Mode B — Custom Campus Blueprint**:
  - Upload college blueprint images (PNG, JPG, SVG).
  - Renders using Leaflet's flat coordinate space (`L.CRS.Simple`).
  - Interactive clickable placement for university buildings, walkway connections, and persistent JSON storage.

### 2. Search Algorithms Implementation
- **Breadth-First Search (BFS)**:
  - Explores level-by-level using a FIFO queue.
  - **Guarantees hop-optimality** (minimum number of turns/edges), which is distinct from minimum physical walking distance.
- **Depth-First Search (DFS)**:
  - Explores deeply using a LIFO stack before backtracking.
  - Demonstrates unguided exploration which can lead to circuitous detours.
- **A\* Search (Informed Heuristic Search)**:
  - Uses evaluation function: $f(n) = g(n) + h(n)$.
  - $g(n)$: Exact accumulated walking distance along traversed paths.
  - $h(n)$: Admissible geodesic straight-line distance (Great-Circle Haversine metric for GPS; Euclidean 2D distance for blueprints).
  - **Guarantees mathematically optimal shortest physical walking distance** ($0 \le h(n) \le h^*(n)$).

### 3. Quantitative Algorithm Benchmarking
- Interactive comparison table and **Recharts bar charts**:
  - **Walking Distance (meters)**
  - **Estimated Walking Time (minutes)** with configurable walking speed slider (0.8 m/s to 1.8 m/s)
  - **Nodes Explored** (State-space pruning evaluation)
  - **Execution Time (milliseconds)** measured from live Python engine runs
  - **Optimality Verdict** (Hop-optimal vs Distance-optimal vs Non-optimal)
- One-click route highlighting to view and trace any algorithm's selected path directly on the map.

### 4. Graph & Locations Manager
- Add, edit, or delete campus buildings with categories, floor info, and descriptions.
- Connect locations with custom walkway distances and path types (Paved Walkway, Corridor, Covered Walkway, Stairs, Perimeter Road).
- Upload custom campus floor plans.
- One-click "Reset to Default Dataset" and "Save to JSON" persistence.

### 5. Educational Theory & Academic Presentation Section
- Dedicated **Theory & AI** tab providing state-space problem formulation:
  - State Space $S$, Initial State $s_0$, Action Set $A(s)$, Transition Model, Goal Test, and Path Cost $c(s, a, s')$.
  - Time & Space Complexities ($O(b^d)$, $O(b^m)$, $O(b^{\epsilon d})$).
  - Mathematical Proof of Heuristic Admissibility on Earth's surface.

---

## 🏛️ Project Architecture

```
CampusRoute/
├── backend/
│   ├── app/
│   │   ├── algorithms/
│   │   │   ├── bfs.py           # Breadth-First Search implementation
│   │   │   ├── dfs.py           # Depth-First Search implementation
│   │   │   └── astar.py         # A* Search with priority queue & heuristics
│   │   ├── data/
│   │   │   ├── sample_campus.json           # Default GPS campus dataset
│   │   │   ├── custom_map_data.json         # Default custom blueprint dataset
│   │   │   ├── default_campus_blueprint.svg # Built-in campus illustration
│   │   │   └── uploads/                     # Uploaded custom maps
│   │   ├── graph.py             # NetworkX graph manager & Haversine distance
│   │   ├── models.py            # Pydantic data schemas
│   │   └── main.py              # FastAPI REST API endpoints
│   ├── tests/
│   │   └── test_algorithms.py   # Pytest suite (8 test cases)
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx                   # Top navigation & mode toggles
│   │   │   ├── CampusMap.tsx                # Leaflet interactive map (Mode A & B)
│   │   │   ├── RoutePanel.tsx               # Source/Dest picker & speed slider
│   │   │   ├── AlgorithmComparisonView.tsx  # Recharts comparison & metrics table
│   │   │   ├── GraphManagerView.tsx         # Node & Walkway CRUD + Uploader
│   │   │   └── TheoryView.tsx               # AI state-space & proof documentation
│   │   ├── services/
│   │   │   └── api.ts                       # Frontend API client
│   │   ├── types/
│   │   │   └── index.ts                     # TypeScript interfaces
│   │   ├── App.tsx                          # Main app controller
│   │   ├── index.css                        # Modern Tailwind v4 & Leaflet styling
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js v18+** and **npm**

---

### Step 1: Start the Backend (FastAPI)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server using Uvicorn:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
4. The backend is now live at:
   - **API Server:** `http://127.0.0.1:8000`
   - **Interactive API Docs (Swagger UI):** `http://127.0.0.1:8000/docs`

---

### Step 2: Start the Frontend (React + Vite)

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at:
   - **Web App:** `http://localhost:5173/`

---

## 🧪 Running Automated Unit Tests

A comprehensive `pytest` suite tests algorithm correctness, edge cases, and heuristic guarantees:

```bash
pytest backend/tests/test_algorithms.py
```

### Verified Test Cases:
1. `test_source_equals_destination`: Identical origin and target yields 0 meters distance.
2. `test_invalid_source_or_destination`: Graceful handling of nonexistent nodes.
3. `test_unreachable_destination`: Disconnected subgraph returns clear unreachable feedback.
4. `test_bfs_minimum_hops_vs_astar_minimum_distance`: Validates the classic pedagogical case where BFS chooses a 1-hop path (500m) while A\* chooses a 3-hop path (300m).
5. `test_dfs_finds_valid_path`: Valid path discovery using depth-first branch exploration.
6. `test_distance_matches_edge_weights_sum`: Sum of edge weights strictly matches reported distance.
7. `test_haversine_admissibility`: Geodesic lower-bound admissibility verification.
8. `test_campus_manager_default_dataset`: End-to-end graph manager integrity check.

---

## 🎤 College Presentation Walkthrough

Follow these steps for an impressive college presentation:

1. **Introduction**:
   - Open `http://localhost:5173/` on the projector.
   - Explain that university campus navigation is a classic **AI State-Space Search** problem where buildings are states and footpaths are weighted transitions.
2. **Textbook BFS vs. A* Demonstration at SDMCET**:
   - Select Origin: `Main Gate`
   - Select Destination: `SDMCET Auditorium`
   - Run **A* Search**: Finds the path through the central academic quad (`Main Gate` &rarr; `Administrative Block` &rarr; `SDMCET College Library` &rarr; `Seminar Hall` &rarr; `SDMCET Auditorium`) spanning **355 meters**.
   - Run **BFS**: Selects the perimeter bypass road (`Main Gate` &rarr; `SDMCET Auditorium`) with only **1 hop**, but spanning **360 meters**!
   - Run **DFS**: Dives deep along the back perimeter (`Main Gate` &rarr; `Parking Area` &rarr; `Civil Department` &rarr; `Department of Mechanical Engineering` &rarr; `Hostel` &rarr; `Sports Ground` &rarr; ... &rarr; `SDMCET Auditorium`) spanning **1,195 meters**!
   - *Key takeaway for professors*: BFS minimizes turns/hops, A* finds the true distance-optimal path, and DFS plunges deeply into branches before backtracking.
3. **Algorithm Comparison Tab**:
   - Click **"Compare All"** to trigger the benchmark.
   - Walk through the **Recharts Bar Charts** displaying total physical distance vs. states explored.
   - Review the **Detailed Evaluation Matrix** and explain why A\* is distance-optimal while DFS yields unguided branches.
4. **Mode B (Custom Campus Blueprint)**:
   - Click the **"Mode B (Custom)"** button in the top navigation.
   - Show the interactive custom campus blueprint canvas and demonstrate how university floorplans or satellite images can be uploaded and configured.
5. **Academic Proofs**:
   - Switch to the **Theory & AI** tab to show the mathematical formulation and proof of Haversine heuristic admissibility.
#   C a m p u s _ R o u t e  
 