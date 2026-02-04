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

export const jsonToGraph = (data: any) => {
    nodeId = 0;
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const traverse = (obj: any, parentId?: string, label?: string) => {
        const id = getNextId();
        let type: string = typeof obj;
        if (Array.isArray(obj)) type = 'array';
        if (obj === null) type = 'null';

        const nodeLabel = label ? `${label}: ${type}` : type;

        // Add node
        // For objects/arrays, we just show type and count maybe
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
            type: 'default', // Using default node for MVP, custom later
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
            Object.entries(obj).forEach(([key, value]) => {
                traverse(value, id, key);
            });
        } else if (type === 'array') {
            obj.forEach((value: any, index: number) => {
                traverse(value, id, `[${index}]`);
            });
        }
    };

    traverse(data);
    return getLayoutedElements(nodes, edges);
};
