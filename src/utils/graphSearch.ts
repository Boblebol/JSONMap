import type { Node } from 'reactflow';

const toSearchText = (value: unknown) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return '';
    return String(value);
};

export const findGraphSearchMatches = (nodes: Node[], query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return nodes.filter(node => {
        if (node.hidden) return false;

        const path = Array.isArray(node.data?.path) ? node.data.path.join('.') : '';
        const searchable = [
            node.data?.label,
            node.data?.type,
            path,
            toSearchText(node.data?.value),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchable.includes(normalizedQuery);
    });
};
