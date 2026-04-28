import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
    it('renders commands buttons', () => {
        render(<ToolsPanel content="{}" setContent={() => { }} setFormat={() => { }} />);
        expect(screen.getByText('JQ Query')).toBeInTheDocument();
        expect(screen.getByText('JWT Decoder')).toBeInTheDocument();
    });

    it('runs jq with the filter and parsed active JSON', async () => {
        vi.mocked(tauriApi.runJq).mockResolvedValue(1);

        render(<ToolsPanel content='{"foo":1}' setContent={() => { }} setFormat={() => { }} />);

        fireEvent.change(screen.getByLabelText('code-editor-jq'), { target: { value: '.foo' } });
        fireEvent.click(screen.getByText('Run'));

        await waitFor(() => {
            expect(tauriApi.runJq).toHaveBeenCalledWith('.foo', { foo: 1 });
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
