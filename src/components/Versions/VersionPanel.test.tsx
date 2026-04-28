import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VersionPanel } from './VersionPanel';
import type { WorkspaceDocument } from '../../utils/documentWorkspace';

const documentWithSnapshot: WorkspaceDocument = {
    id: 'doc-1',
    name: 'payload.json',
    format: 'json',
    originalContent: '{"name":"before"}',
    currentContent: '{"name":"after"}',
    dirty: true,
    snapshots: [
        {
            id: 'snapshot-1',
            name: 'Edited name',
            content: '{"name":"after"}',
            format: 'json',
            createdAt: '2026-04-28T10:30:00.000Z',
        }
    ],
};

const documentWithTwoSnapshots: WorkspaceDocument = {
    ...documentWithSnapshot,
    snapshots: [
        {
            id: 'snapshot-1',
            name: 'First edit',
            content: '{"name":"first"}',
            format: 'json',
            createdAt: '2026-04-28T10:30:00.000Z',
        },
        {
            id: 'snapshot-2',
            name: 'Second edit',
            content: '{"name":"second"}',
            format: 'json',
            createdAt: '2026-04-28T10:40:00.000Z',
        }
    ],
};

describe('VersionPanel', () => {
    it('renders an empty state and create action when there are no snapshots', () => {
        const documentWithoutSnapshots = { ...documentWithSnapshot, snapshots: [] };

        render(
            <VersionPanel
                document={documentWithoutSnapshots}
                diffPreview={"- before\n+ after"}
                onCreateSnapshot={() => { }}
                onRestoreSnapshot={() => { }}
                onExportSnapshot={() => { }}
            />
        );

        expect(screen.getByText('Versions')).toBeInTheDocument();
        expect(screen.getByText('No snapshots yet')).toBeInTheDocument();
        expect(screen.getByText('- before')).toBeInTheDocument();
        expect(screen.getByText('+ after')).toBeInTheDocument();
    });

    it('runs snapshot actions from the version list', () => {
        const onCreateSnapshot = vi.fn();
        const onRestoreSnapshot = vi.fn();
        const onExportSnapshot = vi.fn();

        render(
            <VersionPanel
                document={documentWithSnapshot}
                diffPreview={"- before\n+ after"}
                onCreateSnapshot={onCreateSnapshot}
                onRestoreSnapshot={onRestoreSnapshot}
                onExportSnapshot={onExportSnapshot}
            />
        );

        fireEvent.click(screen.getByText('Save snapshot'));
        fireEvent.click(screen.getByLabelText('Restore Edited name'));
        fireEvent.click(screen.getByLabelText('Export Edited name'));

        expect(onCreateSnapshot).toHaveBeenCalledTimes(1);
        expect(onRestoreSnapshot).toHaveBeenCalledWith('snapshot-1');
        expect(onExportSnapshot).toHaveBeenCalledWith('snapshot-1');
    });

    it('compares two snapshots when at least two versions exist', () => {
        render(
            <VersionPanel
                document={documentWithTwoSnapshots}
                diffPreview={"- before\n+ after"}
                onCreateSnapshot={() => { }}
                onRestoreSnapshot={() => { }}
                onExportSnapshot={() => { }}
            />
        );

        expect(screen.getByText('Snapshot compare')).toBeInTheDocument();
        expect(screen.getByLabelText('Base snapshot')).toHaveDisplayValue('First edit');
        expect(screen.getByLabelText('Compare snapshot')).toHaveDisplayValue('Second edit');
        expect(screen.getByText(/"name": "first"/)).toBeInTheDocument();
        expect(screen.getByText(/"name": "second"/)).toBeInTheDocument();
    });
});
