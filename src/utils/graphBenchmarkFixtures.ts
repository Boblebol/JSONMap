export interface GraphBenchmarkFixtureDefinition {
    label: string;
    targetBytes: number;
}

const MIB = 1024 * 1024;

export const GRAPH_BENCHMARK_FIXTURES: GraphBenchmarkFixtureDefinition[] = [
    { label: '1 MiB', targetBytes: MIB },
    { label: '5 MiB', targetBytes: 5 * MIB },
    { label: '20 MiB', targetBytes: 20 * MIB },
];

const createRecord = (index: number) => ({
    id: index,
    kind: index % 3 === 0 ? 'account' : index % 3 === 1 ? 'event' : 'asset',
    profile: {
        name: `Benchmark User ${index}`,
        email: `user-${index}@example.test`,
        active: index % 2 === 0,
    },
    metrics: {
        score: index % 1000,
        latencyMs: 20 + (index % 180),
        ratios: [index % 7, index % 11, index % 13],
    },
    flags: {
        beta: index % 5 === 0,
        internal: index % 17 === 0,
        reviewed: index % 9 === 0,
    },
    tags: [`team-${index % 12}`, `region-${index % 5}`, `segment-${index % 8}`],
    payload: `payload-${index}-`.padEnd(512, 'x'),
});

export const createGraphBenchmarkFixture = (fixture: GraphBenchmarkFixtureDefinition) => {
    const sampleRecordBytes = JSON.stringify(createRecord(0)).length + 1;
    const baseDocument = {
        meta: {
            fixture: fixture.label,
            targetBytes: fixture.targetBytes,
            schemaVersion: 1,
        },
        records: [] as ReturnType<typeof createRecord>[],
        padding: '',
    };
    const baseBytes = JSON.stringify(baseDocument).length;
    const recordCount = Math.max(1, Math.floor((fixture.targetBytes - baseBytes) / sampleRecordBytes));
    const records = Array.from({ length: recordCount }, (_, index) => createRecord(index));

    let document = {
        ...baseDocument,
        records,
    };
    let content = JSON.stringify(document);

    if (content.length < fixture.targetBytes) {
        document = {
            ...document,
            padding: 'x'.repeat(fixture.targetBytes - content.length),
        };
        content = JSON.stringify(document);
    }

    if (content.length < fixture.targetBytes) {
        document = {
            ...document,
            padding: `${document.padding}${'x'.repeat(fixture.targetBytes - content.length)}`,
        };
        content = JSON.stringify(document);
    }

    return content;
};
