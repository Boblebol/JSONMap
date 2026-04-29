import { describe, expect, it } from 'vitest';
import { GRAPH_BENCHMARK_FIXTURES } from './graphBenchmarkFixtures';
import { formatGraphBenchmarkResults, runGraphProcessingBenchmark } from './graphBenchmarkReport';

describe.runIf(process.env.RUN_GRAPH_BENCHMARKS === '1')('graph processing benchmark', () => {
    it('processes 1 MiB, 5 MiB, and 20 MiB generated JSON fixtures', () => {
        const results = GRAPH_BENCHMARK_FIXTURES.map(runGraphProcessingBenchmark);

        console.info(`\n${formatGraphBenchmarkResults(results)}\n`);

        for (const result of results) {
            expect(result.bytes).toBeGreaterThanOrEqual(
                GRAPH_BENCHMARK_FIXTURES.find(fixture => fixture.label === result.label)?.targetBytes ?? 0,
            );
            expect(result.stages).toEqual(['preview', 'complete']);
            expect(result.largeFileMode).toBe(true);
            expect(result.completeNodes).toBeLessThanOrEqual(500);
            expect(result.deferredCount).toBeGreaterThan(0);
        }
    }, 120_000);
});
