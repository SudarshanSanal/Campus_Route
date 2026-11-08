import React, { useState } from 'react';
import { NodeModel, EdgeModel, CampusGraphData } from '../types';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Trash2, 
  Upload, 
  Save, 
  RotateCcw, 
  Layers, 
  Footprints,
  Info,
  Check,
  Download,
  Eye,
  X,
  Copy,
  CheckCheck
} from 'lucide-react';

interface GraphManagerViewProps {
  mode: 'real' | 'custom';
  graphData: CampusGraphData;
  onAddNode: (node: NodeModel) => Promise<void>;
  onDeleteNode: (nodeId: string) => Promise<void>;
  onAddEdge: (edge: EdgeModel) => Promise<void>;
  onDeleteEdge: (edgeId: string) => Promise<void>;
  onUploadImage: (file: File) => Promise<void>;
  onSaveGraph: () => Promise<void>;
  onResetGraph: () => Promise<void>;
}

export const GraphManagerView: React.FC<GraphManagerViewProps> = ({
  mode,
  graphData,
  onAddNode,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
  onUploadImage,
  onSaveGraph,
  onResetGraph,
}) => {
  // New Node Form State
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeCategory, setNewNodeCategory] = useState('academic');
  const [newNodeLat, setNewNodeLat] = useState(mode === 'real' ? 12.9720 : 400);
  const [newNodeLng, setNewNodeLng] = useState(mode === 'real' ? 77.5940 : 300);
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [newNodeFloor, setNewNodeFloor] = useState('Ground Floor');

  // New Edge Form State
  const [newEdgeSource, setNewEdgeSource] = useState('');
  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgeDistance, setNewEdgeDistance] = useState(120.0);
  const [newEdgePathType, setNewEdgePathType] = useState('paved_walkway');
  const [newEdgeBidirectional, setNewEdgeBidirectional] = useState(true);

  // Status message
  const [feedback, setFeedback] = useState<string | null>(null);

  // JSON Modal state
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const getJsonString = () =>
    JSON.stringify(
      {
        mode: graphData.mode,
        campus_name: graphData.campus_name,
        center: graphData.center,
        zoom: graphData.zoom,
        custom_map_image_url: graphData.custom_map_image_url ?? null,
        custom_map_bounds: graphData.custom_map_bounds,
        walking_speed_mps: graphData.walking_speed_mps,
        nodes: graphData.nodes,
        edges: graphData.edges,
      },
      null,
      2
    );

  const handleDownloadJson = () => {
    const json = getJsonString();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(graphData.campus_name || 'campus_graph').replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback('JSON file downloaded successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(getJsonString());
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    } catch {
      setFeedback('Could not copy to clipboard.');
    }
  };

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    const id = newNodeId.trim() || newNodeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const node: NodeModel = {
      id,
      name: newNodeName.trim(),
      category: newNodeCategory,
      lat: mode === 'real' ? Number(newNodeLat) : Number(newNodeLat),
      lng: mode === 'real' ? Number(newNodeLng) : Number(newNodeLng),
      x: mode === 'custom' ? Number(newNodeLng) : undefined,
      y: mode === 'custom' ? Number(newNodeLat) : undefined,
      description: newNodeDesc.trim(),
      floor_info: newNodeFloor.trim(),
    };

    try {
      await onAddNode(node);
      setFeedback(`Added node "${node.name}" successfully!`);
      setNewNodeName('');
      setNewNodeId('');
      setNewNodeDesc('');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  const handleCreateEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdgeSource || !newEdgeTarget || newEdgeSource === newEdgeTarget) {
      setFeedback('Select two distinct locations to connect.');
      return;
    }

    const id = `e_${newEdgeSource}_${newEdgeTarget}_${Date.now().toString().slice(-4)}`;
    const edge: EdgeModel = {
      id,
      source: newEdgeSource,
      target: newEdgeTarget,
      distance: Number(newEdgeDistance),
      is_bidirectional: newEdgeBidirectional,
      path_type: newEdgePathType,
    };

    try {
      await onAddEdge(edge);
      setFeedback(`Connected path added (${edge.distance}m)!`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        await onUploadImage(e.target.files[0]);
        setFeedback('Campus map image uploaded successfully!');
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        setFeedback(`Upload failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
              Campus Graph Editor
            </span>
            <span className="text-xs text-slate-400 capitalize">
              Active Environment: {mode === 'real' ? 'Mode A (GPS Map)' : 'Mode B (Custom Blueprint)'}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-100 tracking-tight">
            Manage Campus Nodes, Walkways &amp; Maps
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Add university blocks, configure walking distances, or replace with custom blueprints.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowJsonModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow transition-colors"
          >
            <Eye className="h-4 w-4 text-sky-400" />
            View JSON
          </button>
          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
          >
            <Download className="h-4 w-4" />
            Download JSON
          </button>
          <button
            onClick={onSaveGraph}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
          >
            <Save className="h-4 w-4" />
            Save to Server
          </button>
          <button
            onClick={onResetGraph}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Mode B Custom Map Image Uploader */}
      {mode === 'custom' && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Upload className="h-4 w-4 text-purple-400" />
                Upload Custom Campus Map Image (Mode B)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your college floorplan or campus satellite snapshot in PNG, JPG, or SVG format.
              </p>
            </div>
            {graphData.custom_map_image_url && (
              <span className="text-[11px] px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                Custom Image Active
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp"
              onChange={handleImageFileChange}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
            />
            <span className="text-xs text-slate-500">
              Supported formats: PNG, JPG, SVG (Stored persistently on server)
            </span>
          </div>
        </div>
      )}

      {/* Add Node and Add Edge Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form: Add Campus Location Node */}
        <form onSubmit={handleCreateNode} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-400" />
            Add New Campus Location (Node)
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Location Name
              </label>
              <input
                type="text"
                required
                value={newNodeName}
                onChange={e => setNewNodeName(e.target.value)}
                placeholder="e.g. Science Complex"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Node ID (optional)
              </label>
              <input
                type="text"
                value={newNodeId}
                onChange={e => setNewNodeId(e.target.value)}
                placeholder="e.g. science_complex"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={newNodeCategory}
                onChange={e => setNewNodeCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="academic">Academic Wing</option>
                <option value="administrative">Administration</option>
                <option value="lab">Laboratory</option>
                <option value="entrance">Campus Gate</option>
                <option value="amenity">Amenity / Canteen</option>
                <option value="facility">Sports / Auditorium</option>
                <option value="parking">Parking Area</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Floor Info
              </label>
              <input
                type="text"
                value={newNodeFloor}
                onChange={e => setNewNodeFloor(e.target.value)}
                placeholder="e.g. Floors 1-3"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {mode === 'real' ? 'Latitude (GPS)' : 'Y Coordinate (px)'}
              </label>
              <input
                type="number"
                step="any"
                required
                value={newNodeLat}
                onChange={e => setNewNodeLat(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {mode === 'real' ? 'Longitude (GPS)' : 'X Coordinate (px)'}
              </label>
              <input
                type="number"
                step="any"
                required
                value={newNodeLng}
                onChange={e => setNewNodeLng(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              type="text"
              value={newNodeDesc}
              onChange={e => setNewNodeDesc(e.target.value)}
              placeholder="Facility details, office numbers, or department names"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Node to Graph
          </button>
        </form>

        {/* Form: Add Walkway Edge */}
        <form onSubmit={handleCreateEdge} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Footprints className="h-4 w-4 text-emerald-400" />
            Add Walkway Connection (Edge)
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Origin Building
              </label>
              <select
                required
                value={newEdgeSource}
                onChange={e => setNewEdgeSource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Origin --</option>
                {graphData.nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Target Building
              </label>
              <select
                required
                value={newEdgeTarget}
                onChange={e => setNewEdgeTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Target --</option>
                {graphData.nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Walking Distance (meters)
              </label>
              <input
                type="number"
                step="1"
                min="5"
                required
                value={newEdgeDistance}
                onChange={e => setNewEdgeDistance(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Path Type
              </label>
              <select
                value={newEdgePathType}
                onChange={e => setNewEdgePathType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="paved_walkway">Paved Walkway</option>
                <option value="corridor">Internal Corridor</option>
                <option value="covered_path">Covered Path</option>
                <option value="stairs">Staircase</option>
                <option value="road">Campus Perimeter Road</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="bidirectionalCheck"
              checked={newEdgeBidirectional}
              onChange={e => setNewEdgeBidirectional(e.target.checked)}
              className="accent-indigo-500 h-4 w-4 rounded"
            />
            <label htmlFor="bidirectionalCheck" className="text-xs text-slate-300">
              Two-way Walkway (Both directions passable)
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
          >
            <Plus className="h-4 w-4" />
            Connect Path in Graph
          </button>
        </form>
      </div>

      {/* Nodes & Edges Directory Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nodes List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-400" />
              Campus Locations ({graphData.nodes.length})
            </h3>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80 pr-1">
            {graphData.nodes.map(node => (
              <div key={node.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-lg transition-colors">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200">{node.name}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="capitalize text-indigo-400">{node.category}</span>
                    <span>&bull;</span>
                    <span className="font-mono text-[10px] text-slate-500">ID: {node.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteNode(node.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  title="Delete Location"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Edges List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Footprints className="h-4 w-4 text-emerald-400" />
              Walkway Connections ({graphData.edges.length})
            </h3>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80 pr-1">
            {graphData.edges.map(edge => {
              const srcNode = graphData.nodes.find(n => n.id === edge.source);
              const tgtNode = graphData.nodes.find(n => n.id === edge.target);
              return (
                <div key={edge.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-lg transition-colors">
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-200">
                      {srcNode?.name || edge.source} &harr; {tgtNode?.name || edge.target}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">{edge.distance}m</span>
                      <span>&bull;</span>
                      <span className="capitalize">{edge.path_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteEdge(edge.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                    title="Delete Walkway"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* JSON Viewer Modal */}
      {showJsonModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowJsonModal(false); }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-sky-400" />
                  Campus Graph — JSON Format
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {graphData.nodes.length} nodes &bull; {graphData.edges.length} edges &bull; {mode === 'real' ? 'GPS Mode' : 'Custom Map Mode'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  {jsonCopied
                    ? <><CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
                    : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* JSON Content */}
            <div className="overflow-auto flex-1 p-4">
              <pre className="text-[11px] leading-relaxed font-mono text-slate-300 whitespace-pre">
                {getJsonString()
                  .split('\n')
                  .map((line, i) => {
                    // Simple syntax colouring
                    const keyMatch = line.match(/^(\s*)("[^"]+")(\s*:)(.*)$/);
                    const strVal = line.match(/^(\s*)("[^"]*")(\s*,?\s*)$/);
                    const numBool = line.match(/^(\s*)(\d+\.?\d*|true|false|null)(\s*,?\s*)$/);
                    if (keyMatch) {
                      return (
                        <span key={i} className="block">
                          <span className="text-slate-500">{keyMatch[1]}</span>
                          <span className="text-sky-400">{keyMatch[2]}</span>
                          <span className="text-slate-500">{keyMatch[3]}</span>
                          <span className="text-amber-300">{keyMatch[4]}</span>
                        </span>
                      );
                    }
                    if (strVal) {
                      return (
                        <span key={i} className="block">
                          <span className="text-slate-500">{strVal[1]}</span>
                          <span className="text-emerald-400">{strVal[2]}</span>
                          <span className="text-slate-400">{strVal[3]}</span>
                        </span>
                      );
                    }
                    if (numBool) {
                      return (
                        <span key={i} className="block">
                          <span className="text-slate-500">{numBool[1]}</span>
                          <span className="text-orange-400">{numBool[2]}</span>
                          <span className="text-slate-400">{numBool[3]}</span>
                        </span>
                      );
                    }
                    return <span key={i} className="block text-slate-400">{line}</span>;
                  })}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                File: <span className="text-slate-400 font-mono">{(graphData.campus_name || 'campus_graph').replace(/\s+/g, '_').toLowerCase()}.json</span>
              </span>
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
