import { expandGraphPath, jsonToGraph, type GraphData, type GraphTransformOptions, type JsonPath } from './graphTransform';
import type { FileFormat } from './tauri';

export const LARGE_FILE_THRESHOLD = 1024 * 1024;

export type GraphProcessingStage = 'preview' | 'complete' | 'expansion' | 'error';

interface BaseGraphProcessingRequest {
    requestId: number;
    content: string;
    format: FileFormat;
    parsedData?: unknown;
}

export interface BuildGraphProcessingRequest extends BaseGraphProcessingRequest {
    type?: 'build';
}

export interface ExpandGraphProcessingRequest extends BaseGraphProcessingRequest {
    type: 'expand';
    path: JsonPath;
    parentId: string;
    options?: GraphTransformOptions;
}

export type GraphProcessingRequest = BuildGraphProcessingRequest | ExpandGraphProcessingRequest;

export interface GraphProcessingMessage {
    requestId: number;
    stage: GraphProcessingStage;
    graph?: GraphData;
    error?: string;
    largeFileMode?: boolean;
    parentId?: string;
    path?: JsonPath;
}

const parseRequestData = (request: GraphProcessingRequest) => {
    if (request.parsedData !== undefined) return request.parsedData;
    if (request.format !== 'json') {
        throw new Error(`Graph processing needs parsed data for ${request.format.toUpperCase()} documents.`);
    }

    try {
        return JSON.parse(request.content);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid JSON: ${message}`);
    }
};

const createErrorMessage = (requestId: number, error: unknown): GraphProcessingMessage => ({
    requestId,
    stage: 'error',
    error: error instanceof Error ? error.message : String(error),
});

export const processGraphRequest = (request: GraphProcessingRequest): GraphProcessingMessage[] => {
    try {
        const data = parseRequestData(request);
        const largeFileMode = request.content.length > LARGE_FILE_THRESHOLD;

        if (request.type === 'expand') {
            return [{
                requestId: request.requestId,
                stage: 'expansion',
                graph: expandGraphPath(data, request.path, request.parentId, request.options ?? {
                    maxDepth: 3,
                    maxNodes: 350,
                    maxChildren: 50,
                    maxScalarLabelLength: largeFileMode ? 120 : undefined,
                    includeScalarValues: !largeFileMode,
                }),
                largeFileMode,
                parentId: request.parentId,
                path: request.path,
            }];
        }

        if (largeFileMode) {
            return [
                {
                    requestId: request.requestId,
                    stage: 'preview',
                    graph: jsonToGraph(data, {
                        maxDepth: 1,
                        maxNodes: 200,
                        maxChildren: 25,
                        maxScalarLabelLength: 120,
                        includeScalarValues: false,
                    }),
                    largeFileMode: true,
                },
                {
                    requestId: request.requestId,
                    stage: 'complete',
                    graph: jsonToGraph(data, {
                        maxDepth: 2,
                        maxNodes: 500,
                        maxChildren: 50,
                        maxScalarLabelLength: 120,
                        includeScalarValues: false,
                    }),
                    largeFileMode: true,
                },
            ];
        }

        return [{
            requestId: request.requestId,
            stage: 'complete',
            graph: jsonToGraph(data),
            largeFileMode: false,
        }];
    } catch (error) {
        return [createErrorMessage(request.requestId, error)];
    }
};
