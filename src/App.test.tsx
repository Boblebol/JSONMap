import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import download from 'downloadjs';
import App from './App';

vi.mock('downloadjs', () => ({
    default: vi.fn(),
}));

vi.mock('./components/Editor/CodeEditor', () => ({
    CodeEditor: ({ value, onChange }: { value: string, onChange?: (v: string) => void }) => (
        <textarea
            aria-label="active-document-editor"
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
        />
    ),
}));

vi.mock('./components/Graph/GraphView', () => ({
    GraphView: () => <div data-testid="graph-view" />,
}));

vi.mock('./components/About/AboutModal', () => ({
    AboutModal: () => null,
}));

vi.mock('./components/Help/ShortcutOverlay', () => ({
    ShortcutOverlay: () => null,
}));

vi.mock('./components/Tools/CodeGenPanel', () => ({
    CodeGenPanel: () => <div />,
}));

vi.mock('./components/Tools/SchemaPanel', () => ({
    SchemaPanel: () => <div />,
}));

vi.mock('./components/Tools/ToolsPanel', () => ({
    ToolsPanel: () => <div />,
}));

vi.mock('./components/Converter/ConverterPanel', () => ({
    ConverterPanel: () => <div />,
}));

vi.mock('./components/Settings/SettingsPanel', () => ({
    SettingsPanel: () => <div />,
}));

vi.mock('./components/Help/HelpPanel', () => ({
    HelpPanel: () => <div />,
}));

describe('App workspace', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('imports dropped JSON files into memory and selects the dropped file', async () => {
        const { container } = render(<App />);
        const file = new File(['{"imported":true}'], 'payload.json', { type: 'application/json' });

        fireEvent.drop(container.firstElementChild as Element, {
            dataTransfer: {
                files: [file],
            },
        });

        expect(await screen.findByText('payload.json')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"imported":true}');
        });
    });

    it('marks edited documents as modified and resets them to the original content', async () => {
        const { container } = render(<App />);
        const file = new File(['{"name":"before"}'], 'payload.json', { type: 'application/json' });

        fireEvent.drop(container.firstElementChild as Element, {
            dataTransfer: {
                files: [file],
            },
        });

        expect(await screen.findByText('payload.json')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"name":"before"}');
        });

        const editor = await screen.findByLabelText('active-document-editor');
        fireEvent.change(editor, { target: { value: '{"name":"after"}' } });

        expect(await screen.findByTitle('Modified')).toBeInTheDocument();

        fireEvent.click(screen.getByTitle('Reset active document to original'));

        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"name":"before"}');
        });
        await waitFor(() => {
            expect(screen.queryByTitle('Modified')).not.toBeInTheDocument();
        });
    });

    it('exports the current modified document content from the browser shell', async () => {
        const { container } = render(<App />);
        const file = new File(['{"name":"before"}'], 'payload.json', { type: 'application/json' });

        fireEvent.drop(container.firstElementChild as Element, {
            dataTransfer: {
                files: [file],
            },
        });

        expect(await screen.findByText('payload.json')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"name":"before"}');
        });

        const editor = await screen.findByLabelText('active-document-editor');
        fireEvent.change(editor, { target: { value: '{"name":"after"}' } });
        fireEvent.click(screen.getByTitle('Export active document'));

        expect(download).toHaveBeenCalledWith('{"name":"after"}', 'payload.json', 'application/json');
    });
});
