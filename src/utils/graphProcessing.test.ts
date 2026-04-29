import { describe, expect, it } from 'vitest';
import { LARGE_FILE_THRESHOLD, processGraphRequest } from './graphProcessing';

describe('graphProcessing', () => {
    it('returns a complete graph for regular JSON content', () => {
        const messages = processGraphRequest({
            type: 'build',
            requestId: 1,
            content: '{"name":"JSONMap"}',
            format: 'json',
        });

        expect(messages).toHaveLength(1);
        expect(messages[0]).toMatchObject({
            requestId: 1,
            stage: 'complete',
            largeFileMode: false,
        });
        expect(messages[0].graph?.nodes.map(node => node.data.label)).toContain('name: JSONMap');
    });

    it('emits preview before the complete graph in large-file mode', () => {
        const items = Array.from({ length: 120 }, (_, index) => ({
            id: index,
            profile: {
                name: `User ${index}`,
            },
        }));
        const content = `${JSON.stringify({ items })}${' '.repeat(LARGE_FILE_THRESHOLD)}`;

        const messages = processGraphRequest({
            type: 'build',
            requestId: 2,
            content,
            format: 'json',
        });

        expect(messages.map(message => message.stage)).toEqual(['preview', 'complete']);
        expect(messages.every(message => message.largeFileMode)).toBe(true);
        expect(messages[0].graph?.nodes.length).toBeLessThan(messages[1].graph?.nodes.length ?? 0);
        expect(messages[1].graph?.deferredCount).toBeGreaterThan(0);
    });

    it('omits oversized scalar values from large-file graph payloads', () => {
        const longValue = 'x'.repeat(5_000);
        const content = `${JSON.stringify({ longValue, nested: { count: 1 } })}${' '.repeat(LARGE_FILE_THRESHOLD)}`;

        const messages = processGraphRequest({
            type: 'build',
            requestId: 22,
            content,
            format: 'json',
        });

        const completeGraph = messages.find(message => message.stage === 'complete')?.graph;
        const longValueNode = completeGraph?.nodes.find(node => String(node.data.label).startsWith('longValue:'));

        expect(String(longValueNode?.data.label).length).toBeLessThan(180);
        expect(longValueNode?.data.value).toBeUndefined();
        expect(longValueNode?.data.valueOmitted).toBe(true);
    });

    it('returns an expansion graph for a selected path', () => {
        const messages = processGraphRequest({
            type: 'expand',
            requestId: 3,
            content: '{"users":[{"profile":{"name":"Ada"}}]}',
            format: 'json',
            path: ['users'],
            parentId: 'n_kusers',
        });

        expect(messages).toHaveLength(1);
        expect(messages[0]).toMatchObject({
            requestId: 3,
            stage: 'expansion',
        });
        expect(messages[0].graph?.nodes.map(node => node.data.label)).toContain('[0]: object');
    });

    it('returns parse errors without throwing', () => {
        const messages = processGraphRequest({
            type: 'build',
            requestId: 4,
            content: '{"broken"',
            format: 'json',
        });

        expect(messages).toHaveLength(1);
        expect(messages[0].stage).toBe('error');
        expect(messages[0].error).toContain('JSON');
    });
});
