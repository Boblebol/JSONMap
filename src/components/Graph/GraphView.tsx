import { useRef, useCallback, useState, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Panel,
    Node,
    Edge,
    useNodesState,
    useEdgesState
} from 'reactflow';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import download from 'downloadjs';
import { Image, Download, FileImage, Info, Check, Settings2 } from 'lucide-react';
import { tauriApi } from '../../utils/tauri';
import 'reactflow/dist/style.css';

interface GraphViewProps {
    initialNodes: Node[];
    initialEdges: Edge[];
}

export const GraphView = ({ initialNodes, initialEdges }: GraphViewProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [exportQuality, setExportQuality] = useState(2);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

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
                onNodeDoubleClick={onNodeDoubleClick}
                fitView
                className="text-text"
            >
                <Background color="#414868" gap={16} />
                <Controls className="bg-surface border-border text-text fill-text" />

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
                        <Info size={14} /> Nodes: {nodes.length} | Edges: {edges.length}
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
};
