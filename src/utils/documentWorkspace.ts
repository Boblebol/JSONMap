import type { FileFormat } from './tauri';

export interface WorkspaceDocument {
    id: string;
    name: string;
    format: FileFormat;
    sourcePath?: string;
    originalContent: string;
    currentContent: string;
    dirty: boolean;
    snapshots: DocumentSnapshot[];
}

export interface DocumentSnapshot {
    id: string;
    name: string;
    content: string;
    format: FileFormat;
    createdAt: string;
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

interface CreateSnapshotInput {
    id?: string;
    name?: string;
    createdAt?: string;
}

let documentCounter = 0;
let snapshotCounter = 0;

const nextDocumentId = () => {
    documentCounter += 1;
    return `doc-${Date.now()}-${documentCounter}`;
};

const nextSnapshotId = () => {
    snapshotCounter += 1;
    return `snapshot-${Date.now()}-${snapshotCounter}`;
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
    snapshots: [],
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

export const createActiveDocumentSnapshot = (
    workspace: DocumentWorkspace,
    input: CreateSnapshotInput = {}
): DocumentWorkspace => {
    const activeDocument = getActiveDocument(workspace);
    if (!activeDocument) return workspace;

    const snapshot: DocumentSnapshot = {
        id: input.id ?? nextSnapshotId(),
        name: input.name?.trim() || `Snapshot ${activeDocument.snapshots.length + 1}`,
        content: activeDocument.currentContent,
        format: activeDocument.format,
        createdAt: input.createdAt ?? new Date().toISOString(),
    };

    return {
        ...workspace,
        documents: workspace.documents.map((document) => {
            if (document.id !== activeDocument.id) return document;

            return {
                ...document,
                snapshots: [...document.snapshots, snapshot],
            };
        }),
    };
};

export const getActiveDocumentSnapshot = (
    workspace: DocumentWorkspace,
    snapshotId: string
): DocumentSnapshot | null => {
    const activeDocument = getActiveDocument(workspace);
    if (!activeDocument) return null;

    return activeDocument.snapshots.find((snapshot) => snapshot.id === snapshotId) ?? null;
};

export const restoreActiveDocumentSnapshot = (
    workspace: DocumentWorkspace,
    snapshotId: string
): DocumentWorkspace => {
    const activeDocument = getActiveDocument(workspace);
    if (!activeDocument) return workspace;

    const snapshot = activeDocument.snapshots.find((candidate) => candidate.id === snapshotId);
    if (!snapshot) return workspace;

    return {
        ...workspace,
        documents: workspace.documents.map((document) => {
            if (document.id !== activeDocument.id) return document;

            return {
                ...document,
                currentContent: snapshot.content,
                format: snapshot.format,
                dirty: snapshot.content !== document.originalContent,
            };
        }),
    };
};
