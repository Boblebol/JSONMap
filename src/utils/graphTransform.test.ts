import { describe, it, expect } from 'vitest';
import { expandGraphPath, jsonToGraph } from './graphTransform';

describe('graphTransform', () => {
    it('transforms a simple object into nodes and edges', () => {
        const data = { name: 'test', value: 123 };
        const { nodes, edges } = jsonToGraph(data);

        // Root object node + 2 property nodes
        expect(nodes).toHaveLength(3);
        expect(edges).toHaveLength(2);

        const rootNode = nodes.find(n => n.data.label === '{}');
        expect(rootNode).toBeDefined();

        const nameNode = nodes.find(n => n.data.label === 'name: test');
        expect(nameNode).toBeDefined();

        const valueNode = nodes.find(n => n.data.label === 'value: 123');
        expect(valueNode).toBeDefined();
    });

    it('handles nested objects', () => {
        const data = {
            user: { id: 1 }
        };
        const { nodes, edges } = jsonToGraph(data);

        // Root ({}) -> user (object) -> id (number)
        expect(nodes).toHaveLength(3);
        expect(edges).toHaveLength(2);
    });

    it('handles arrays', () => {
        const data = {
            tags: ['a', 'b']
        };
        const { nodes, edges } = jsonToGraph(data);

        // Root ({}) -> tags (array) -> [0] (string) & [1] (string)
        expect(nodes).toHaveLength(4);
        expect(edges).toHaveLength(3);
    });

    it('handles null values', () => {
        const data = { empty: null };
        const { nodes } = jsonToGraph(data);

        expect(nodes).toHaveLength(2);
        const nullNode = nodes.find(n => n.data.label === 'empty: null');
        expect(nullNode).toBeDefined();
    });

    it('marks branches as deferred when max depth is reached', () => {
        const data = {
            users: [
                { profile: { name: 'Ada' } },
            ],
        };

        const { nodes, edges, deferredCount } = jsonToGraph(data, { maxDepth: 1 });

        expect(nodes.map(node => node.data.label)).toEqual(['{}', 'users []']);
        expect(edges).toHaveLength(1);
        expect(deferredCount).toBe(1);
        expect(nodes.find(node => node.data.label === 'users []')?.data.hasDeferredChildren).toBe(true);
    });

    it('expands a deferred branch from a selected graph path', () => {
        const data = {
            users: [
                { profile: { name: 'Ada' } },
            ],
        };

        const expansion = expandGraphPath(data, ['users'], 'n_kusers', { maxDepth: 2 });

        expect(expansion.nodes.map(node => node.data.label)).toContain('[0]: object');
        expect(expansion.nodes.map(node => node.data.label)).toContain('profile: object');
        expect(expansion.nodes.some(node => node.data.label === 'name: Ada')).toBe(false);
        expect(expansion.edges.find(edge => edge.source === 'n_kusers')).toBeDefined();
        expect(expansion.deferredCount).toBe(1);
    });
});
