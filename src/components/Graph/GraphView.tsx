import { useRef, useCallback, useState, useEffect, useMemo, type FormEvent } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Panel,
    type Node,
    type Edge,
    type ReactFlowInstance,
    useNodesState,
    useEdgesState
} from 'reactflow';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import download from 'downloadjs';
import { Image, Download, FileImage, Info, Check, Settings2, Search, LocateFixed, ChevronLeft, ChevronRight } from 'lucide-react';
import { tauriApi } from '../../utils/tauri';
import { EditableNode } from './EditableNode';
import { findGraphSearchMatches } from '../../utils/graphSearch';
import 'reactflow/dist/style.css';

interface GraphViewProps {
    initialNodes: Node[];
    initialEdges: Edge[];
    isTruncated?: boolean;
    onNodeSelect?: (node: Node) => void;
}

export const GraphView = ({ initialNodes, initialEdges, isTruncated, onNodeSelect }: GraphViewProps) => {
    const nodeTypes = useMemo(() => ({ editable: EditableNode }), []);

    const preparedNodes = useMemo(() =>
        initialNodes.map(node => ({
            ...node,
            data: {
                ...node.data
            }
        }))
        , [initialNodes]);

    const [nodes, setNodes, onNodesChange] = useNodesState(preparedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [exportQuality, setExportQuality] = useState(2);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMatchIndex, setActiveMatchIndex] = useState(0);
    const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const searchMatches = useMemo(() => findGraphSearchMatches(nodes, searchQuery), [nodes, searchQuery]);
    const activeMatch = searchMatches[activeMatchIndex];

    useEffect(() => {
        setNodes(preparedNodes);
        setEdges(initialEdges);
    }, [preparedNodes, initialEdges, setNodes, setEdges]);

    useEffect(() => {
        setActiveMatchIndex(0);
    }, [searchQuery]);

    useEffect(() => {
        if (activeMatchIndex >= searchMatches.length) {
            setActiveMatchIndex(0);
        }
    }, [activeMatchIndex, searchMatches.length]);

    const exportImage = useCallback((format: 'png' | 'jpeg' | 'svg') => {
        if (ref.current === null) return;

        const filter = (node: HTMLElement) => {
            const exclusionClasses = ['react-flow__controls', 'react-flow__minimap', 'react-flow__panel'];
            return !exclusionClasses.some((classname) => node.classList?.contains(classname));
        }

        const options = {
            backgroundColor: '#1a1b26',
            filter,
            pixelRatio: exportQuality
        };

        let promise;
        switch (format) {
            case 'png': promise = toPng(ref.current, options); break;
            case 'jpeg': promise = toJpeg(ref.current, options); break;
            case 'svg': promise = toSvg(ref.current, options); break;
        }

        promise
            .then(async (dataUrl) => {
                if (window.__TAURI__) {
                    await tauriApi.saveImage(dataUrl, format);
                } else {
                    download(dataUrl, `jsonmap-graph.${format}`);
                }
            })
            .catch((err) => {
                console.error('Export failed', err);
            });
    }, [ref, exportQuality]);

    useEffect(() => {
        const handleExportRequest = () => exportImage('png');
        window.addEventListener('trigger-graph-export', handleExportRequest);
        return () => window.removeEventListener('trigger-graph-export', handleExportRequest);
    }, [exportImage]);

    const focusSearchResult = useCallback((node: Node | undefined = activeMatch) => {
        if (!node) return;

        setNodes(currentNodes => currentNodes.map(currentNode => ({
            ...currentNode,
            selected: currentNode.id === node.id,
        })));
        onNodeSelect?.(node);
        flowInstance?.setCenter(
            node.position.x + (node.width ?? 200) / 2,
            node.position.y + (node.height ?? 50) / 2,
            { zoom: 1.2, duration: 500 }
        );
    }, [activeMatch, flowInstance, onNodeSelect, setNodes]);

    const moveSearchResult = useCallback((direction: 1 | -1) => {
        if (searchMatches.length === 0) return;

        const nextIndex = (activeMatchIndex + direction + searchMatches.length) % searchMatches.length;
        setActiveMatchIndex(nextIndex);
        focusSearchResult(searchMatches[nextIndex]);
    }, [activeMatchIndex, focusSearchResult, searchMatches]);

    const handleSearchSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        focusSearchResult();
    }, [focusSearchResult]);

    const onNodeDoubleClick = useCallback((_: any, node: Node) => {
        const getDescendants = (nodeId: string, visited = new Set<string>()): string[] => {
            if (visited.has(nodeId)) return [];
            visited.add(nodeId);
            const children = edges.filter(e => e.source === nodeId).map(e => e.target);
            let descendants = [...children];
            for (const childId of children) {
                descendants = [...descendants, ...getDescendants(childId, visited)];
            }
            return descendants;
        };

        const descendants = getDescendants(node.id);
        const isCurrentlyExpanded = descendants.some(id => !nodes.find(n => n.id === id)?.hidden);

        setNodes((nds) =>
            nds.map((n) => {
                if (descendants.includes(n.id)) return { ...n, hidden: isCurrentlyExpanded };
                return n;
            })
        );

        setEdges((eds) =>
            eds.map((e) => {
                if (descendants.includes(e.target) || descendants.includes(e.source)) {
                    const targetHidden = descendants.includes(e.target) && isCurrentlyExpanded;
                    const sourceHidden = descendants.includes(e.source) && isCurrentlyExpanded;
                    return { ...e, hidden: targetHidden || sourceHidden };
                }
                return e;
            })
        );
    }, [nodes, edges, setNodes, setEdges]);

    return (
        <div className="h-full w-full bg-[#1a1b26]" ref={ref}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, node) => onNodeSelect?.(node)}
                onNodeDoubleClick={onNodeDoubleClick}
                nodeTypes={nodeTypes}
                onInit={setFlowInstance}
                fitView
                className="text-text"
            >
                <Background color="#414868" gap={16} />
                <Controls className="bg-surface border-border text-text fill-text" />

                <Panel position="top-left" className="flex flex-col gap-2 items-start">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="bg-surface/90 backdrop-blur p-2 rounded-lg border border-border flex items-center gap-2 shadow-sm"
                    >
                        <Search size={15} className="text-muted shrink-0" />
                        <input
                            aria-label="Search graph nodes"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search nodes"
                            className="w-40 bg-background border border-border rounded px-2 py-1.5 text-xs text-text focus:outline-none focus:border-primary"
                        />
                        <span className="w-10 text-center text-[10px] text-muted">
                            {searchQuery.trim() ? `${searchMatches.length ? activeMatchIndex + 1 : 0}/${searchMatches.length}` : '0/0'}
                        </span>
                        <button
                            type="button"
                            onClick={() => moveSearchResult(-1)}
                            disabled={searchMatches.length === 0}
                            aria-label="Previous search result"
                            className="p-1.5 rounded border border-border text-muted hover:text-text hover:bg-muted/10 disabled:opacity-40"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => moveSearchResult(1)}
                            disabled={searchMatches.length === 0}
                            aria-label="Next search result"
                            className="p-1.5 rounded border border-border text-muted hover:text-text hover:bg-muted/10 disabled:opacity-40"
                        >
                            <ChevronRight size={14} />
                        </button>
                        <button
                            type="submit"
                            disabled={!activeMatch}
                            className="px-2 py-1.5 rounded bg-primary text-background text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
                        >
                            <LocateFixed size={13} /> Focus
                        </button>
                    </form>
                </Panel>

                <Panel position="top-right" className="flex flex-col gap-2 items-end">
                    <div className="bg-surface/80 backdrop-blur p-2 rounded-lg border border-border flex gap-2">
                        <button onClick={() => exportImage('png')} className="p-2 hover:bg-muted/10 rounded text-text flex items-center gap-2 text-xs" title="Export PNG"><Image size={16} /> PNG</button>
                        <button onClick={() => exportImage('jpeg')} className="p-2 hover:bg-muted/10 rounded text-text flex items-center gap-2 text-xs" title="Export JPEG"><FileImage size={16} /> JPG</button>
                        <button onClick={() => exportImage('svg')} className="p-2 hover:bg-muted/10 rounded text-text flex items-center gap-2 text-xs" title="Export SVG"><Download size={16} /> SVG</button>
                        <div className="w-[1px] bg-border mx-1" />
                        <button
                            onClick={() => setShowExportOptions(!showExportOptions)}
                            className={`p-2 rounded text-text transition-colors ${showExportOptions ? 'bg-primary text-background' : 'hover:bg-muted/10'}`}
                            title="Export Settings"
                        >
                            <Settings2 size={16} />
                        </button>
                    </div>

                    {showExportOptions && (
                        <div className="bg-surface border border-border rounded-xl p-4 shadow-2xl w-48 animate-in slide-in-from-top-2 duration-200">
                            <h4 className="text-[10px] uppercase font-bold text-muted mb-3 flex items-center gap-2">
                                <Settings2 size={12} /> Quality Settings
                            </h4>
                            <div className="space-y-2">
                                {[1, 2, 4].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => setExportQuality(q)}
                                        className={`w-full flex justify-between items-center p-2 rounded text-xs px-3 ${exportQuality === q ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted/10 text-text/70'}`}
                                    >
                                        <span>{q}x Scale ({q === 1 ? 'Standard' : q === 2 ? 'Retina' : '4K'})</span>
                                        {exportQuality === q && <Check size={12} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-background/50 backdrop-blur border border-border rounded-lg px-3 py-1.5 text-xs text-muted flex items-center gap-2 shadow-sm">
                        <Info size={14} /> Nodes: {nodes.length} | Edges: {edges.length} {isTruncated && <span className="text-amber-500 font-bold ml-2">(Truncated View)</span>}
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
};
