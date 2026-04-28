import { describe, expect, it } from 'vitest';
import {
    addDocuments,
    createDocument,
    createWorkspace,
    resetActiveDocument,
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
});
