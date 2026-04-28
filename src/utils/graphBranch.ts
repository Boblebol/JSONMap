import type { Edge, Node } from 'reactflow';

export const getDescendantNodeIds = (edges: Edge[], nodeId: string, visited = new Set<string>()): string[] => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);

    const childIds = edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target);

    return childIds.flatMap(childId => [childId, ...getDescendantNodeIds(edges, childId, visited)]);
};

export const setGraphBranchVisibility = (
    nodes: Node[],
    edges: Edge[],
    nodeId: string,
    hidden: boolean
) => {
    const descendantIds = new Set(getDescendantNodeIds(edges, nodeId));

    return {
        nodes: nodes.map(node => {
            if (!descendantIds.has(node.id)) return node;
            return { ...node, hidden };
        }),
        edges: edges.map(edge => {
            if (!descendantIds.has(edge.target)) return edge;
            return { ...edge, hidden };
        }),
    };
};
