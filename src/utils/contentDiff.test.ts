import { describe, expect, it } from 'vitest';
import { createLineDiffPreview } from './contentDiff';

describe('contentDiff', () => {
    it('returns an unchanged message when content is identical', () => {
        expect(createLineDiffPreview('{"name":"JSONMap"}', '{"name":"JSONMap"}')).toBe('No changes');
    });

    it('formats JSON and shows changed lines with removed and added markers', () => {
        const diff = createLineDiffPreview('{"name":"before"}', '{"name":"after"}');

        expect(diff).toContain('-   "name": "before"');
        expect(diff).toContain('+   "name": "after"');
    });
});
