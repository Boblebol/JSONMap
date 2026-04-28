import { describe, expect, it } from 'vitest';
import type { Edge, Node } from 'reactflow';
import { getDescendantNodeIds, setGraphBranchVisibility } from './graphBranch';

const nodes = [
    { id: 'root', data: {}, position: { x: 0, y: 0 } },
    { id: 'child', data: {}, position: { x: 100, y: 0 } },
    { id: 'leaf', data: {}, position: { x: 200, y: 0 } },
    { id: 'sibling', data: {}, position: { x: 100, y: 80 } },
] as Node[];

const edges = [
    { id: 'root-child', source: 'root', target: 'child' },
    { id: 'child-leaf', source: 'child', target: 'leaf' },
    { id: 'root-sibling', source: 'root', target: 'sibling' },
] as Edge[];

describe('graphBranch', () => {
    it('returns all descendants for a node', () => {
        expect(getDescendantNodeIds(edges, 'root')).toEqual(['child', 'leaf', 'sibling']);
        expect(getDescendantNodeIds(edges, 'child')).toEqual(['leaf']);
    });

    it('updates descendant nodes and descendant edges visibility', () => {
        const collapsed = setGraphBranchVisibility(nodes, edges, 'child', true);

        expect(collapsed.nodes.find(node => node.id === 'child')?.hidden).toBeUndefined();
        expect(collapsed.nodes.find(node => node.id === 'leaf')?.hidden).toBe(true);
        expect(collapsed.nodes.find(node => node.id === 'sibling')?.hidden).toBeUndefined();
        expect(collapsed.edges.find(edge => edge.id === 'child-leaf')?.hidden).toBe(true);
        expect(collapsed.edges.find(edge => edge.id === 'root-child')?.hidden).toBeUndefined();

        const expanded = setGraphBranchVisibility(collapsed.nodes, collapsed.edges, 'child', false);

        expect(expanded.nodes.find(node => node.id === 'leaf')?.hidden).toBe(false);
        expect(expanded.edges.find(edge => edge.id === 'child-leaf')?.hidden).toBe(false);
    });
});
