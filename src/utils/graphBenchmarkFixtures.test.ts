import { describe, expect, it } from 'vitest';
import { GRAPH_BENCHMARK_FIXTURES, createGraphBenchmarkFixture } from './graphBenchmarkFixtures';

describe('graphBenchmarkFixtures', () => {
    it('defines the required large-file benchmark fixture sizes', () => {
        expect(GRAPH_BENCHMARK_FIXTURES.map(fixture => fixture.label)).toEqual([
            '1 MiB',
            '5 MiB',
            '20 MiB',
        ]);
    });

    it('generates valid JSON fixtures close to their target sizes', () => {
        for (const fixture of GRAPH_BENCHMARK_FIXTURES) {
            const content = createGraphBenchmarkFixture(fixture);
            const parsed = JSON.parse(content);

            expect(content.length).toBeGreaterThanOrEqual(fixture.targetBytes);
            expect(content.length).toBeLessThan(fixture.targetBytes * 1.05);
            expect(parsed.meta.fixture).toBe(fixture.label);
            expect(parsed.records.length).toBeGreaterThan(0);
        }
    });
});
