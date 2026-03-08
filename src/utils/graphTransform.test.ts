import { describe, it, expect } from 'vitest';
import { jsonToGraph } from './graphTransform';

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
});
