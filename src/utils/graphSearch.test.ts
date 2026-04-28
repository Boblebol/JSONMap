import { describe, expect, it } from 'vitest';
import type { Node } from 'reactflow';
import { findGraphSearchMatches } from './graphSearch';

const nodes = [
    {
        id: 'root',
        data: { label: '{}', type: 'object', path: [], value: { user: { email: 'a@example.com' } } },
        position: { x: 0, y: 0 },
    },
    {
        id: 'email',
        data: { label: 'email: a@example.com', type: 'string', path: ['user', 'email'], value: 'a@example.com' },
        position: { x: 100, y: 0 },
    },
    {
        id: 'hidden',
        data: { label: 'secret: hidden', type: 'string', path: ['secret'], value: 'hidden' },
        position: { x: 200, y: 0 },
        hidden: true,
    },
] as Node[];

describe('graphSearch', () => {
    it('returns no matches for blank queries', () => {
        expect(findGraphSearchMatches(nodes, '   ')).toEqual([]);
    });

    it('matches visible nodes by label, scalar value, and path case-insensitively', () => {
        expect(findGraphSearchMatches(nodes, 'EMAIL').map(node => node.id)).toEqual(['email']);
        expect(findGraphSearchMatches(nodes, 'example.com').map(node => node.id)).toEqual(['email']);
        expect(findGraphSearchMatches(nodes, 'user.email').map(node => node.id)).toEqual(['email']);
    });

    it('does not return hidden nodes', () => {
        expect(findGraphSearchMatches(nodes, 'secret')).toEqual([]);
    });
});
