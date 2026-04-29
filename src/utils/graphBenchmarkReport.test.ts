import { describe, expect, it } from 'vitest';
import { GRAPH_BENCHMARK_FIXTURES } from './graphBenchmarkFixtures';
import { formatGraphBenchmarkResults, runGraphProcessingBenchmark } from './graphBenchmarkReport';

describe('graphBenchmarkReport', () => {
    it('measures graph processing for a generated large-file fixture', () => {
        const result = runGraphProcessingBenchmark(GRAPH_BENCHMARK_FIXTURES[0]);

        expect(result.label).toBe('1 MiB');
        expect(result.bytes).toBeGreaterThanOrEqual(GRAPH_BENCHMARK_FIXTURES[0].targetBytes);
        expect(result.durationMs).toBeGreaterThan(0);
        expect(result.stages).toEqual(['preview', 'complete']);
        expect(result.largeFileMode).toBe(true);
        expect(result.completeNodes).toBeGreaterThan(0);
        expect(result.completeNodes).toBeLessThanOrEqual(500);
    });

    it('formats benchmark results as a markdown table', () => {
        const markdown = formatGraphBenchmarkResults([
            {
                label: '1 MiB',
                bytes: 1048576,
                durationMs: 12.34,
                stages: ['preview', 'complete'],
                largeFileMode: true,
                previewNodes: 28,
                completeNodes: 500,
                deferredCount: 42,
            },
        ]);

        expect(markdown).toContain('| Fixture | Bytes | Duration | Stages | Preview nodes | Complete nodes | Deferred branches | Large-file mode |');
        expect(markdown).toContain('| 1 MiB | 1,048,576 | 12.3 ms | preview -> complete | 28 | 500 | 42 | yes |');
    });
});
