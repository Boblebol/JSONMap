import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ToolsPanel } from './ToolsPanel';
import { tauriApi } from '../../utils/tauri';

// Mock Tauri API
vi.mock('../../utils/tauri', () => ({
    tauriApi: {
        runJq: vi.fn(),
        runJsonPath: vi.fn(),
        decodeJwt: vi.fn(),
        anonymizeData: vi.fn(),
        fetchUrl: vi.fn(),
    },
}));

vi.mock('../Editor/CodeEditor', () => ({
    CodeEditor: ({ value, onChange, language }: { value: string, onChange?: (v: string) => void, language?: string }) => (
        <textarea
            aria-label={`code-editor-${language || 'text'}`}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
        />
    ),
}));

describe('ToolsPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });
    });

    it('renders commands buttons', () => {
        render(<ToolsPanel content="{}" setContent={() => { }} setFormat={() => { }} />);
        expect(screen.getAllByText('Format & Validate')).not.toHaveLength(0);
        expect(screen.getByText('JQ Query')).toBeInTheDocument();
        expect(screen.getByText('JWT Decoder')).toBeInTheDocument();
    });

    it('validates active JSON and reports invalid content', () => {
        const { rerender } = render(<ToolsPanel content='{"foo":1}' setContent={() => { }} setFormat={() => { }} />);

        fireEvent.click(screen.getByText('Validate JSON'));

        expect(screen.getByDisplayValue('Valid JSON.')).toBeInTheDocument();

        rerender(<ToolsPanel content='{"foo":' setContent={() => { }} setFormat={() => { }} />);
        fireEvent.click(screen.getByText('Validate JSON'));

        expect(screen.getByDisplayValue(/Invalid JSON:/)).toBeInTheDocument();
    });

    it('formats, beautifies, and minifies the active JSON document', () => {
        const setContent = vi.fn();

        render(<ToolsPanel content='{"foo":1,"bar":[true]}' setContent={setContent} setFormat={() => { }} />);

        fireEvent.click(screen.getByText('Format JSON'));
        fireEvent.click(screen.getByText('Beautify JSON'));
        fireEvent.click(screen.getByText('Minify JSON'));

        expect(setContent).toHaveBeenNthCalledWith(1, '{\n  "foo": 1,\n  "bar": [\n    true\n  ]\n}');
        expect(setContent).toHaveBeenNthCalledWith(2, '{\n  "foo": 1,\n  "bar": [\n    true\n  ]\n}');
        expect(setContent).toHaveBeenNthCalledWith(3, '{"foo":1,"bar":[true]}');
    });

    it('runs jq with the filter and parsed active JSON', async () => {
        vi.mocked(tauriApi.runJq).mockResolvedValue(1);

        render(<ToolsPanel content='{"foo":1}' setContent={() => { }} setFormat={() => { }} />);

        fireEvent.click(screen.getByText('JQ Query'));
        fireEvent.change(screen.getByLabelText('code-editor-jq'), { target: { value: '.foo' } });
        fireEvent.click(screen.getByText('Run'));

        await waitFor(() => {
            expect(tauriApi.runJq).toHaveBeenCalledWith('.foo', { foo: 1 });
        });
    });

    it('copies a jq result and exposes it as a new document', async () => {
        const onCreateDocument = vi.fn();
        vi.mocked(tauriApi.runJq).mockResolvedValue({ foo: 1 });

        render(<ToolsPanel content='{"foo":1}' setContent={() => { }} setFormat={() => { }} onCreateDocument={onCreateDocument} />);

        fireEvent.click(screen.getByText('JQ Query'));
        fireEvent.change(screen.getByLabelText('code-editor-jq'), { target: { value: '{foo: .foo}' } });
        fireEvent.click(screen.getByText('Run'));

        expect(await screen.findByText('Copy result')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Copy result'));
        fireEvent.click(screen.getByText('Create document'));

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('{\n  "foo": 1\n}');
        expect(onCreateDocument).toHaveBeenCalledWith('{\n  "foo": 1\n}', {
            format: 'json',
            name: 'JQ Result.json',
        });
    });

    it('runs JSONPath with the path and parsed active JSON', async () => {
        vi.mocked(tauriApi.runJsonPath).mockResolvedValue(1);

        render(<ToolsPanel content='{"foo":1}' setContent={() => { }} setFormat={() => { }} />);

        fireEvent.click(screen.getByText('JSONPath'));
        fireEvent.change(screen.getByLabelText('code-editor-text'), { target: { value: '$.foo' } });
        fireEvent.click(screen.getByText('Run'));

        await waitFor(() => {
            expect(tauriApi.runJsonPath).toHaveBeenCalledWith('$.foo', { foo: 1 });
        });
    });
});
