import { describe, expect, it } from 'vitest';
import { formatJsonPath, getValueByPath, updateValueByPath } from './jsonUtils';

describe('jsonUtils', () => {
    it('formats paths as JSONPath selectors', () => {
        expect(formatJsonPath([])).toBe('$');
        expect(formatJsonPath(['settings', 'theme'])).toBe('$.settings.theme');
        expect(formatJsonPath(['items', 0, 'display-name'])).toBe('$.items[0]["display-name"]');
    });

    it('reads a nested value by path without mutating the source', () => {
        const source = {
            settings: {
                theme: 'dark',
                flags: [true, false],
            },
        };

        expect(getValueByPath(source, ['settings', 'flags', 1])).toBe(false);
        expect(source.settings.flags).toEqual([true, false]);
    });

    it('updates a nested value by path without mutating the source', () => {
        const source = {
            settings: {
                theme: 'dark',
            },
        };

        const updated = updateValueByPath(source, ['settings', 'theme'], 'light');

        expect(updated).toEqual({ settings: { theme: 'light' } });
        expect(source).toEqual({ settings: { theme: 'dark' } });
    });
});
