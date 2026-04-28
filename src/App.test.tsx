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
    GraphView: ({ onNodeSelect }: { onNodeSelect?: (node: any) => void }) => (
        <div>
            <button
                data-testid="graph-view"
                onClick={() => onNodeSelect?.({
                    id: 'n_1',
                    data: {
                        label: 'name: before',
                        path: ['name'],
                        type: 'string',
                        value: 'before',
                    },
                })}
            >
                Graph
            </button>
            <button
                data-testid="graph-view-settings"
                onClick={() => onNodeSelect?.({
                    id: 'n_2',
                    data: {
                        label: 'settings',
                        path: ['settings'],
                        type: 'object',
                        value: { theme: 'dark', flags: [true] },
                    },
                })}
            >
                Settings
            </button>
        </div>
    ),
}));

vi.mock('./components/About/AboutModal', () => ({
    AboutModal: () => null,
}));

vi.mock('./components/Help/ShortcutOverlay', () => ({
    ShortcutOverlay: () => null,
}));

vi.mock('./components/Tools/CodeGenPanel', () => ({
    CodeGenPanel: () => <div>Code generation panel</div>,
}));

vi.mock('./components/Tools/SchemaPanel', () => ({
    SchemaPanel: () => <div>Schema panel</div>,
}));

vi.mock('./components/Tools/ToolsPanel', () => ({
    ToolsPanel: () => <div>Tools panel</div>,
}));

vi.mock('./components/Converter/ConverterPanel', () => ({
    ConverterPanel: () => <div>Converter panel</div>,
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
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });
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

    it('edits selected graph scalar values from the inspector', async () => {
        const { container } = render(<App />);
        const file = new File(['{"name":"before"}'], 'payload.json', { type: 'application/json' });

        fireEvent.drop(container.firstElementChild as Element, {
            dataTransfer: {
                files: [file],
            },
        });

        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"name":"before"}');
        });

        fireEvent.click(screen.getByTestId('graph-view'));
        fireEvent.change(screen.getByLabelText('Node value'), { target: { value: 'after' } });
        fireEvent.click(screen.getByText('Apply'));

        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{\n  "name": "after"\n}');
        });
    });

    it('copies the selected graph path and subtree from the inspector', async () => {
        const { container } = render(<App />);
        const file = new File(['{"settings":{"theme":"dark","flags":[true]}}'], 'payload.json', { type: 'application/json' });

        fireEvent.drop(container.firstElementChild as Element, {
            dataTransfer: {
                files: [file],
            },
        });

        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"settings":{"theme":"dark","flags":[true]}}');
        });

        fireEvent.click(screen.getByTestId('graph-view-settings'));
        fireEvent.click(screen.getByText('Copy path'));
        fireEvent.click(screen.getByText('Copy subtree'));

        expect(navigator.clipboard.writeText).toHaveBeenNthCalledWith(1, '$.settings');
        expect(navigator.clipboard.writeText).toHaveBeenNthCalledWith(
            2,
            '{\n  "theme": "dark",\n  "flags": [\n    true\n  ]\n}'
        );
    });

    it('exports the selected graph subtree from the inspector', async () => {
        const { container } = render(<App />);
        const file = new File(['{"settings":{"theme":"dark","flags":[true]}}'], 'payload.json', { type: 'application/json' });

        fireEvent.drop(container.firstElementChild as Element, {
            dataTransfer: {
                files: [file],
            },
        });

        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"settings":{"theme":"dark","flags":[true]}}');
        });

        fireEvent.click(screen.getByTestId('graph-view-settings'));
        fireEvent.click(screen.getByText('Export subtree'));

        expect(download).toHaveBeenCalledWith(
            '{\n  "theme": "dark",\n  "flags": [\n    true\n  ]\n}',
            'payload-settings.json',
            'application/json'
        );
    });

    it('opens developer tools from the drawer and routes to the selected panel', () => {
        render(<App />);

        fireEvent.click(screen.getByTitle('Developer Tools'));

        expect(screen.getByRole('dialog', { name: 'Developer tools' })).toBeInTheDocument();

        fireEvent.click(screen.getByText('JQ / JSONPath'));

        expect(screen.getByText('Tools panel')).toBeInTheDocument();
        expect(screen.queryByRole('dialog', { name: 'Developer tools' })).not.toBeInTheDocument();
    });

    it('creates, restores, and exports document snapshots from the version panel', async () => {
        const { container } = render(<App />);
        const file = new File(['{"name":"before"}'], 'payload.json', { type: 'application/json' });

        fireEvent.drop(container.firstElementChild as Element, {
            dataTransfer: {
                files: [file],
            },
        });

        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"name":"before"}');
        });

        fireEvent.change(screen.getByLabelText('active-document-editor'), { target: { value: '{"name":"snapshot"}' } });
        fireEvent.click(screen.getByText('Save snapshot'));

        expect(await screen.findByText('Snapshot 1')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('active-document-editor'), { target: { value: '{"name":"after"}' } });
        fireEvent.click(screen.getByLabelText('Restore Snapshot 1'));

        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"name":"snapshot"}');
        });

        fireEvent.click(screen.getByLabelText('Export Snapshot 1'));

        expect(download).toHaveBeenCalledWith('{"name":"snapshot"}', 'payload-snapshot-1.json', 'application/json');
    });

    it('creates snapshots with a manual name and uses it for export filenames', async () => {
        const { container } = render(<App />);
        const file = new File(['{"name":"before"}'], 'payload.json', { type: 'application/json' });

        fireEvent.drop(container.firstElementChild as Element, {
            dataTransfer: {
                files: [file],
            },
        });

        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"name":"before"}');
        });

        fireEvent.change(screen.getByLabelText('active-document-editor'), { target: { value: '{"name":"named"}' } });
        fireEvent.change(screen.getByLabelText('Snapshot name'), { target: { value: 'Release Candidate' } });
        fireEvent.click(screen.getByText('Save snapshot'));

        expect(await screen.findByText('Release Candidate')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Export Release Candidate'));

        expect(download).toHaveBeenCalledWith('{"name":"named"}', 'payload-release-candidate.json', 'application/json');
    });

    it('compares two snapshots created from the active document', async () => {
        const { container } = render(<App />);
        const file = new File(['{"name":"before"}'], 'payload.json', { type: 'application/json' });

        fireEvent.drop(container.firstElementChild as Element, {
            dataTransfer: {
                files: [file],
            },
        });

        await waitFor(() => {
            expect(screen.getByLabelText('active-document-editor')).toHaveDisplayValue('{"name":"before"}');
        });

        fireEvent.change(screen.getByLabelText('active-document-editor'), { target: { value: '{"name":"first"}' } });
        fireEvent.click(screen.getByText('Save snapshot'));
        expect(await screen.findByText('Snapshot 1')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('active-document-editor'), { target: { value: '{"name":"second"}' } });
        fireEvent.click(screen.getByText('Save snapshot'));

        expect(await screen.findAllByText('Snapshot 2')).not.toHaveLength(0);
        expect(screen.getByText('Snapshot compare')).toBeInTheDocument();
        expect(screen.getByLabelText('Base snapshot')).toHaveDisplayValue('Snapshot 1');
        expect(screen.getByLabelText('Compare snapshot')).toHaveDisplayValue('Snapshot 2');
        expect(screen.getAllByText(/"name": "first"/)).not.toHaveLength(0);
        expect(screen.getAllByText(/"name": "second"/)).not.toHaveLength(0);
    });
});
