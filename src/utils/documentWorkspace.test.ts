import { describe, expect, it } from 'vitest';
import {
    addDocuments,
    createDocument,
    createActiveDocumentSnapshot,
    createWorkspace,
    getActiveDocumentSnapshot,
    resetActiveDocument,
    restoreActiveDocumentSnapshot,
    setActiveDocument,
    updateActiveDocumentContent,
} from './documentWorkspace';

describe('documentWorkspace', () => {
    it('creates a clean JSON document from imported content', () => {
        const document = createDocument({
            id: 'doc-1',
            name: 'payload.json',
            content: '{"name":"JSONMap"}',
            format: 'json',
            sourcePath: '/tmp/payload.json',
        });

        expect(document).toEqual({
            id: 'doc-1',
            name: 'payload.json',
            format: 'json',
            sourcePath: '/tmp/payload.json',
            originalContent: '{"name":"JSONMap"}',
            currentContent: '{"name":"JSONMap"}',
            dirty: false,
            snapshots: [],
        });
    });

    it('adds documents and selects the first imported document when workspace is empty', () => {
        const workspace = addDocuments(
            createWorkspace(),
            [
                createDocument({ id: 'doc-1', name: 'one.json', content: '{"one":1}', format: 'json' }),
                createDocument({ id: 'doc-2', name: 'two.json', content: '{"two":2}', format: 'json' }),
            ]
        );

        expect(workspace.activeDocumentId).toBe('doc-1');
        expect(workspace.documents).toHaveLength(2);
    });

    it('updates active document content and marks it dirty', () => {
        const workspace = addDocuments(
            createWorkspace(),
            [createDocument({ id: 'doc-1', name: 'payload.json', content: '{"name":"before"}', format: 'json' })]
        );

        const updated = updateActiveDocumentContent(workspace, '{"name":"after"}');

        expect(updated.documents[0].currentContent).toBe('{"name":"after"}');
        expect(updated.documents[0].dirty).toBe(true);
    });

    it('marks a document clean again when current content matches original', () => {
        const workspace = addDocuments(
            createWorkspace(),
            [createDocument({ id: 'doc-1', name: 'payload.json', content: '{"name":"before"}', format: 'json' })]
        );

        const changed = updateActiveDocumentContent(workspace, '{"name":"after"}');
        const restored = updateActiveDocumentContent(changed, '{"name":"before"}');

        expect(restored.documents[0].dirty).toBe(false);
    });

    it('switches and resets the active document without touching others', () => {
        const workspace = addDocuments(
            createWorkspace(),
            [
                createDocument({ id: 'doc-1', name: 'one.json', content: '{"one":1}', format: 'json' }),
                createDocument({ id: 'doc-2', name: 'two.json', content: '{"two":2}', format: 'json' }),
            ]
        );

        const changed = updateActiveDocumentContent(setActiveDocument(workspace, 'doc-2'), '{"two":3}');
        const reset = resetActiveDocument(changed);

        expect(reset.activeDocumentId).toBe('doc-2');
        expect(reset.documents[0].currentContent).toBe('{"one":1}');
        expect(reset.documents[1].currentContent).toBe('{"two":2}');
        expect(reset.documents[1].dirty).toBe(false);
    });

    it('creates a named snapshot from the active document current content', () => {
        const workspace = addDocuments(
            createWorkspace(),
            [createDocument({ id: 'doc-1', name: 'payload.json', content: '{"name":"before"}', format: 'json' })]
        );
        const changed = updateActiveDocumentContent(workspace, '{"name":"after"}');

        const snapshotted = createActiveDocumentSnapshot(changed, {
            id: 'snapshot-1',
            name: 'Edited name',
            createdAt: '2026-04-28T10:30:00.000Z',
        });

        expect(snapshotted.documents[0].snapshots).toEqual([
            {
                id: 'snapshot-1',
                name: 'Edited name',
                content: '{"name":"after"}',
                format: 'json',
                createdAt: '2026-04-28T10:30:00.000Z',
            }
        ]);
    });

    it('restores an active document snapshot and updates dirty state against the original', () => {
        const workspace = addDocuments(
            createWorkspace(),
            [createDocument({ id: 'doc-1', name: 'payload.json', content: '{"name":"before"}', format: 'json' })]
        );
        const snapshotted = createActiveDocumentSnapshot(
            updateActiveDocumentContent(workspace, '{"name":"snapshot"}'),
            {
                id: 'snapshot-1',
                name: 'Snapshot',
                createdAt: '2026-04-28T10:30:00.000Z',
            }
        );
        const changedAgain = updateActiveDocumentContent(snapshotted, '{"name":"after"}');

        const restored = restoreActiveDocumentSnapshot(changedAgain, 'snapshot-1');

        expect(restored.documents[0].currentContent).toBe('{"name":"snapshot"}');
        expect(restored.documents[0].dirty).toBe(true);
    });

    it('returns a snapshot for the active document by id', () => {
        const workspace = addDocuments(
            createWorkspace(),
            [createDocument({ id: 'doc-1', name: 'payload.json', content: '{"name":"before"}', format: 'json' })]
        );
        const snapshotted = createActiveDocumentSnapshot(workspace, {
            id: 'snapshot-1',
            name: 'Original checkpoint',
            createdAt: '2026-04-28T10:30:00.000Z',
        });

        const snapshot = getActiveDocumentSnapshot(snapshotted, 'snapshot-1');

        expect(snapshot?.content).toBe('{"name":"before"}');
    });
});
