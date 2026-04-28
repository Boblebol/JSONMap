import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConverterPanel } from './ConverterPanel';
import { tauriApi } from '../../utils/tauri';

// Mock tauriApi
vi.mock('../../utils/tauri', () => ({
    tauriApi: {
        convertFormat: vi.fn(),
    },
}));

// Mock CodeEditor
vi.mock('../Editor/CodeEditor', () => ({
    CodeEditor: ({ value, onChange }: { value: string, onChange?: (v: string) => void }) => (
        <textarea
            data-testid="code-editor"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
        />
    ),
}));

describe('ConverterPanel', () => {
    it('renders source and target panels', () => {
        render(<ConverterPanel />);
        expect(screen.getByText('Source')).toBeInTheDocument();
        expect(screen.getByText('Target')).toBeInTheDocument();
    });

    it('converts content when convert button is clicked', async () => {
        vi.mocked(tauriApi.convertFormat).mockResolvedValue('name: test');

        render(<ConverterPanel />);

        const editor = screen.getAllByTestId('code-editor')[0];
        fireEvent.change(editor, { target: { value: '{"name": "test"}' } });

        const convertButton = screen.getByTitle('Convert');
        fireEvent.click(convertButton);

        await waitFor(() => {
            expect(tauriApi.convertFormat).toHaveBeenCalledWith(
                '{"name": "test"}',
                'json',
                'yaml'
            );
            expect(screen.getAllByTestId('code-editor')[1]).toHaveDisplayValue('name: test');
        });
    });

    it('creates a workspace document from converted active content', async () => {
        const onCreateDocument = vi.fn();
        vi.mocked(tauriApi.convertFormat).mockResolvedValue('name: test');

        render(
            <ConverterPanel
                content='{"name":"test"}'
                sourceFormat="json"
                sourceName="payload.json"
                onCreateDocument={onCreateDocument}
            />
        );

        fireEvent.click(screen.getByTitle('Convert'));

        expect(await screen.findByText('Create document')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Create document'));

        expect(tauriApi.convertFormat).toHaveBeenCalledWith('{"name":"test"}', 'json', 'yaml');
        expect(onCreateDocument).toHaveBeenCalledWith('name: test', {
            format: 'yaml',
            name: 'payload.yaml',
        });
    });

    it('shows error if conversion fails', async () => {
        vi.mocked(tauriApi.convertFormat).mockRejectedValue(new Error('Invalid JSON'));

        render(<ConverterPanel />);

        const editor = screen.getAllByTestId('code-editor')[0];
        fireEvent.change(editor, { target: { value: 'invalid' } });

        const convertButton = screen.getByTitle('Convert');
        fireEvent.click(convertButton);

        await waitFor(() => {
            expect(screen.getByText(/Error: Invalid JSON/)).toBeInTheDocument();
        });
    });
});
