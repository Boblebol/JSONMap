import type { Node, Edge, Position } from 'reactflow';
import dagre from 'dagre';

const nodeWidth = 200;
const nodeHeight = 50;
const DEFAULT_MAX_NODES = 500;
const DEFAULT_MAX_CHILDREN = 50;
const DEFAULT_MAX_DEPTH = Number.POSITIVE_INFINITY;
const DEFAULT_MAX_SCALAR_LABEL_LENGTH = 160;

export type JsonPath = (string | number)[];

export interface GraphTransformOptions {
    maxNodes?: number;
    maxChildren?: number;
    maxDepth?: number;
    maxScalarLabelLength?: number;
    includeScalarValues?: boolean;
}

export interface GraphData {
    nodes: Node[];
    edges: Edge[];
    truncated: boolean;
    deferredCount: number;
}

const flowPosition = {
    left: 'left' as Position,
    right: 'right' as Position,
    top: 'top' as Position,
    bottom: 'bottom' as Position,
};

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
        node.targetPosition = direction === 'LR' ? flowPosition.left : flowPosition.top;
        node.sourcePosition = direction === 'LR' ? flowPosition.right : flowPosition.bottom;

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
};

const getResolvedOptions = (options: GraphTransformOptions = {}) => ({
    maxNodes: options.maxNodes ?? DEFAULT_MAX_NODES,
    maxChildren: options.maxChildren ?? DEFAULT_MAX_CHILDREN,
    maxDepth: options.maxDepth ?? DEFAULT_MAX_DEPTH,
    maxScalarLabelLength: options.maxScalarLabelLength ?? DEFAULT_MAX_SCALAR_LABEL_LENGTH,
    includeScalarValues: options.includeScalarValues ?? true,
});

const encodePathSegment = (segment: string | number) => {
    const prefix = typeof segment === 'number' ? 'i' : 'k';
    const value = encodeURIComponent(String(segment))
        .replace(/%/g, 'p')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${prefix}${value || 'empty'}`;
};

const getNodeIdForPath = (path: JsonPath) => (
    path.length === 0 ? 'n_root' : `n_${path.map(encodePathSegment).join('_')}`
);

const getValueType = (value: unknown) => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
};

const isCompositeType = (type: string) => type === 'object' || type === 'array';

const getChildren = (value: unknown): { label: string; pathSegment: string | number; value: unknown }[] => {
    if (Array.isArray(value)) {
        return value.map((item, index) => ({
            label: `[${index}]`,
            pathSegment: index,
            value: item,
        }));
    }

    if (value !== null && typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => ({
            label: key,
            pathSegment: key,
            value: entryValue,
        }));
    }

    return [];
};

const getScalarPreview = (value: unknown, maxLength: number) => {
    const serializedValue = String(value);
    if (serializedValue.length <= maxLength) return serializedValue;
    return `${serializedValue.slice(0, Math.max(0, maxLength - 3))}...`;
};

const getDisplayLabel = (value: unknown, type: string, maxScalarLabelLength: number, label?: string) => {
    if (type === 'object') return label ? `${label}: object` : '{}';
    if (type === 'array') return label ? `${label} []` : '[]';
    const scalarPreview = getScalarPreview(value, maxScalarLabelLength);
    return label ? `${label}: ${scalarPreview}` : scalarPreview;
};

const getGraphValue = (value: unknown, type: string, includeScalarValues: boolean) => (
    isCompositeType(type) || !includeScalarValues ? undefined : value
);

const getValueByGraphPath = (data: unknown, path: JsonPath) => (
    path.reduce<unknown>((currentValue, segment) => {
        if (currentValue === null || currentValue === undefined) return undefined;
        if (typeof segment === 'number' && Array.isArray(currentValue)) {
            return currentValue[segment];
        }
        if (typeof currentValue === 'object') {
            return (currentValue as Record<string, unknown>)[String(segment)];
        }
        return undefined;
    }, data)
);

const buildGraph = (
    data: unknown,
    options: GraphTransformOptions = {},
    expansion?: { parentId: string; path: JsonPath },
): GraphData => {
    const resolvedOptions = getResolvedOptions(options);
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let truncated = false;
    let deferredCount = 0;

    const markDeferred = (nodeId: string) => {
        const node = nodes.find(currentNode => currentNode.id === nodeId);
        if (!node || node.data?.hasDeferredChildren) return;
        node.data = {
            ...node.data,
            hasDeferredChildren: true,
        };
        deferredCount += 1;
    };

    const traverse = (value: unknown, parentId?: string, label?: string, path: JsonPath = [], depth = 0) => {
        if (nodes.length >= resolvedOptions.maxNodes) {
            truncated = true;
            return;
        }

        const id = getNodeIdForPath(path);
        const type = getValueType(value);

        nodes.push({
            id,
            data: {
                label: getDisplayLabel(value, type, resolvedOptions.maxScalarLabelLength, label),
                path,
                type,
                value: getGraphValue(value, type, resolvedOptions.includeScalarValues),
                valuePreview: isCompositeType(type) ? undefined : getScalarPreview(value, resolvedOptions.maxScalarLabelLength),
                valueOmitted: !isCompositeType(type) && !resolvedOptions.includeScalarValues,
            },
            position: { x: 0, y: 0 },
            type: 'editable',
        });

        if (parentId) {
            edges.push({
                id: `e_${parentId}-${id}`,
                source: parentId,
                target: id,
                animated: true,
            });
        }

        if (!isCompositeType(type)) return;

        const children = getChildren(value);
        if (children.length === 0) return;

        if (depth >= resolvedOptions.maxDepth) {
            markDeferred(id);
            return;
        }

        const visibleChildren = children.slice(0, resolvedOptions.maxChildren);
        for (const child of visibleChildren) {
            if (nodes.length >= resolvedOptions.maxNodes) {
                truncated = true;
                markDeferred(id);
                break;
            }

            traverse(
                child.value,
                id,
                child.label,
                [...path, child.pathSegment],
                depth + 1,
            );
        }

        if (children.length > visibleChildren.length) {
            truncated = true;
            markDeferred(id);
        }
    };

    if (expansion) {
        const rootValue = getValueByGraphPath(data, expansion.path);
        const children = getChildren(rootValue);
        const visibleChildren = children.slice(0, resolvedOptions.maxChildren);

        for (const child of visibleChildren) {
            if (nodes.length >= resolvedOptions.maxNodes) {
                truncated = true;
                break;
            }

            traverse(
                child.value,
                expansion.parentId,
                child.label,
                [...expansion.path, child.pathSegment],
                1,
            );
        }

        if (children.length > visibleChildren.length) {
            truncated = true;
            deferredCount += 1;
        }
    } else {
        traverse(data);
    }

    const layout = getLayoutedElements(nodes, edges);
    return { ...layout, truncated, deferredCount };
};

export const jsonToGraph = (data: unknown, options?: GraphTransformOptions): GraphData => (
    buildGraph(data, options)
);

export const expandGraphPath = (
    data: unknown,
    path: JsonPath,
    parentId: string,
    options?: GraphTransformOptions,
): GraphData => (
    buildGraph(data, options, { parentId, path })
);
