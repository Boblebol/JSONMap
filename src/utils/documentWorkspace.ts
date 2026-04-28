import type { FileFormat } from './tauri';

export interface WorkspaceDocument {
    id: string;
    name: string;
    format: FileFormat;
    sourcePath?: string;
    originalContent: string;
    currentContent: string;
    dirty: boolean;
}

export interface DocumentWorkspace {
    documents: WorkspaceDocument[];
    activeDocumentId: string | null;
}

interface CreateDocumentInput {
    id?: string;
    name: string;
    content: string;
    format: FileFormat;
    sourcePath?: string;
}

let documentCounter = 0;

const nextDocumentId = () => {
    documentCounter += 1;
    return `doc-${Date.now()}-${documentCounter}`;
};

export const createWorkspace = (): DocumentWorkspace => ({
    documents: [],
    activeDocumentId: null,
});

export const createDocument = ({
    id,
    name,
    content,
    format,
    sourcePath,
}: CreateDocumentInput): WorkspaceDocument => ({
    id: id ?? nextDocumentId(),
    name,
    format,
    sourcePath,
    originalContent: content,
    currentContent: content,
    dirty: false,
});

export const getActiveDocument = (workspace: DocumentWorkspace): WorkspaceDocument | null => {
    return workspace.documents.find((document) => document.id === workspace.activeDocumentId) ?? null;
};

export const addDocuments = (
    workspace: DocumentWorkspace,
    documents: WorkspaceDocument[]
): DocumentWorkspace => {
    if (documents.length === 0) return workspace;

    return {
        documents: [...workspace.documents, ...documents],
        activeDocumentId: workspace.activeDocumentId ?? documents[0].id,
    };
};

export const setActiveDocument = (
    workspace: DocumentWorkspace,
    documentId: string
): DocumentWorkspace => {
    if (!workspace.documents.some((document) => document.id === documentId)) return workspace;

    return {
        ...workspace,
        activeDocumentId: documentId,
    };
};

export const updateActiveDocumentContent = (
    workspace: DocumentWorkspace,
    content: string
): DocumentWorkspace => {
    const activeDocument = getActiveDocument(workspace);
    if (!activeDocument) return workspace;

    return {
        ...workspace,
        documents: workspace.documents.map((document) => {
            if (document.id !== activeDocument.id) return document;

            return {
                ...document,
                currentContent: content,
                dirty: content !== document.originalContent,
            };
        }),
    };
};

export const resetActiveDocument = (workspace: DocumentWorkspace): DocumentWorkspace => {
    const activeDocument = getActiveDocument(workspace);
    if (!activeDocument) return workspace;

    return {
        ...workspace,
        documents: workspace.documents.map((document) => {
            if (document.id !== activeDocument.id) return document;

            return {
                ...document,
                currentContent: document.originalContent,
                dirty: false,
            };
        }),
    };
};
