import { createGraphBenchmarkFixture, type GraphBenchmarkFixtureDefinition } from './graphBenchmarkFixtures';
import { processGraphRequest, type GraphProcessingStage } from './graphProcessing';

export interface GraphBenchmarkResult {
    label: string;
    bytes: number;
    durationMs: number;
    stages: GraphProcessingStage[];
    largeFileMode: boolean;
    previewNodes: number;
    completeNodes: number;
    deferredCount: number;
}

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

export const runGraphProcessingBenchmark = (fixture: GraphBenchmarkFixtureDefinition): GraphBenchmarkResult => {
    const content = createGraphBenchmarkFixture(fixture);
    const start = performance.now();
    const messages = processGraphRequest({
        type: 'build',
        requestId: 1,
        content,
        format: 'json',
    });
    const durationMs = performance.now() - start;
    const preview = messages.find(message => message.stage === 'preview');
    const complete = messages.find(message => message.stage === 'complete');

    return {
        label: fixture.label,
        bytes: content.length,
        durationMs,
        stages: messages.map(message => message.stage),
        largeFileMode: messages.some(message => message.largeFileMode),
        previewNodes: preview?.graph?.nodes.length ?? 0,
        completeNodes: complete?.graph?.nodes.length ?? 0,
        deferredCount: complete?.graph?.deferredCount ?? 0,
    };
};

export const formatGraphBenchmarkResults = (results: GraphBenchmarkResult[]) => [
    '| Fixture | Bytes | Duration | Stages | Preview nodes | Complete nodes | Deferred branches | Large-file mode |',
    '| --- | ---: | ---: | --- | ---: | ---: | ---: | --- |',
    ...results.map(result => [
        result.label,
        formatNumber(result.bytes),
        `${result.durationMs.toFixed(1)} ms`,
        result.stages.join(' -> '),
        formatNumber(result.previewNodes),
        formatNumber(result.completeNodes),
        formatNumber(result.deferredCount),
        result.largeFileMode ? 'yes' : 'no',
    ].join(' | ')).map(row => `| ${row} |`),
].join('\n');
