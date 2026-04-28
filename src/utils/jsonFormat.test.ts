import { describe, expect, it } from 'vitest';
import { beautifyJsonContent, formatJsonContent, minifyJsonContent, validateJsonContent } from './jsonFormat';

describe('jsonFormat', () => {
    it('validates JSON content', () => {
        expect(validateJsonContent('{"name":"JSONMap"}')).toEqual({
            valid: true,
            message: 'Valid JSON.',
        });
    });

    it('returns readable validation errors for invalid JSON', () => {
        const result = validateJsonContent('{"name":');

        expect(result.valid).toBe(false);
        expect(result.message).toContain('Invalid JSON:');
    });

    it('formats and beautifies JSON content', () => {
        expect(formatJsonContent('{"name":"JSONMap"}')).toBe('{\n  "name": "JSONMap"\n}');
        expect(beautifyJsonContent('{"features":["Graph","Edit"]}')).toBe('{\n  "features": [\n    "Graph",\n    "Edit"\n  ]\n}');
    });

    it('minifies JSON content', () => {
        expect(minifyJsonContent('{\n  "name": "JSONMap"\n}')).toBe('{"name":"JSONMap"}');
    });
});
