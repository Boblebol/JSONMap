import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SchemaPanel } from './SchemaPanel';
import { tauriApi } from '../../utils/tauri';

vi.mock('../../utils/tauri', () => ({
    tauriApi: {
        generateSchema: vi.fn(),
        generateMockData: vi.fn(),
        validateJsonSchema: vi.fn(),
    },
}));

vi.mock('../Editor/CodeEditor', () => ({
    CodeEditor: ({ value, onChange }: { value: string; onChange?: (value: string) => void }) => (
        <textarea
            aria-label="schema-editor"
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
        />
    ),
}));

describe('SchemaPanel', () => {
    const inferredSchema = {
        type: 'object',
        properties: {
            name: { type: 'string' },
        },
        required: ['name'],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(tauriApi.generateSchema).mockResolvedValue(inferredSchema);
        vi.mocked(tauriApi.validateJsonSchema).mockResolvedValue([]);
    });

    it('infers a JSON schema and validates the source content with it', async () => {
        render(<SchemaPanel content='{"name":"JSONMap"}' />);

        fireEvent.click(screen.getByText('Infer'));

        await waitFor(() => {
            expect(screen.getByLabelText('schema-editor')).toHaveDisplayValue(JSON.stringify(inferredSchema, null, 2));
        });

        fireEvent.click(screen.getByText('Validate'));

        await waitFor(() => {
            expect(tauriApi.validateJsonSchema).toHaveBeenCalledWith({ name: 'JSONMap' }, inferredSchema);
        });
    });

    it('creates a JSON Schema workspace document from the inferred schema', async () => {
        const onCreateDocument = vi.fn();

        render(
            <SchemaPanel
                content='{"name":"JSONMap"}'
                sourceName="payload.json"
                onCreateDocument={onCreateDocument}
            />
        );

        fireEvent.click(screen.getByText('Infer'));

        await waitFor(() => {
            expect(screen.getByLabelText('schema-editor')).toHaveDisplayValue(JSON.stringify(inferredSchema, null, 2));
        });

        fireEvent.click(screen.getByText('Create document'));

        expect(onCreateDocument).toHaveBeenCalledWith(JSON.stringify(inferredSchema, null, 2), {
            format: 'json',
            name: 'payload.schema.json',
        });
    });
});
