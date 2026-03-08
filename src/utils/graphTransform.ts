import { Node, Edge, Position } from 'reactflow';
import dagre from 'dagre';

const nodeWidth = 200;
const nodeHeight = 50;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'LR' ? Position.Left : Position.Left;
        node.sourcePosition = direction === 'LR' ? Position.Right : Position.Right;

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
};

let nodeId = 0;
const getNextId = () => `n_${nodeId++}`;
const MAX_NODES = 1000;

export const jsonToGraph = (data: any) => {
    nodeId = 0;
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let truncated = false;

    const traverse = (obj: any, parentId?: string, label?: string) => {
        if (nodeId >= MAX_NODES) {
            truncated = true;
            return;
        }

        const id = getNextId();
        let type: string = typeof obj;
        if (Array.isArray(obj)) type = 'array';
        if (obj === null) type = 'null';

        const nodeLabel = label ? `${label}: ${type}` : type;

        let displayLabel = nodeLabel;
        if (type === 'object') displayLabel = label || '{}';
        if (type === 'array') displayLabel = label ? `${label} []` : '[]';
        if (['string', 'number', 'boolean', 'null'].includes(type)) {
            displayLabel = label ? `${label}: ${String(obj)}` : String(obj);
        }

        nodes.push({
            id,
            data: { label: displayLabel, originalValue: obj },
            position: { x: 0, y: 0 },
            type: 'default',
        });

        if (parentId) {
            edges.push({
                id: `e_${parentId}-${id}`,
                source: parentId,
                target: id,
                animated: true,
            });
        }

        // Recurse
        if (type === 'object' && obj !== null) {
            const entries = Object.entries(obj);
            for (const [key, value] of entries) {
                if (truncated) break;
                traverse(value, id, key);
            }
        } else if (type === 'array') {
            for (let i = 0; i < obj.length; i++) {
                if (truncated) break;
                traverse(obj[i], id, `[${i}]`);
            }
        }
    };

    traverse(data);
    const layout = getLayoutedElements(nodes, edges);
    return { ...layout, truncated };
};
