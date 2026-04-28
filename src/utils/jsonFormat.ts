export interface JsonValidationResult {
    valid: boolean;
    message: string;
}

const parseJson = (content: string): unknown => {
    try {
        return JSON.parse(content);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid JSON: ${message}`);
    }
};

export const validateJsonContent = (content: string): JsonValidationResult => {
    try {
        parseJson(content);
        return {
            valid: true,
            message: 'Valid JSON.',
        };
    } catch (error) {
        return {
            valid: false,
            message: error instanceof Error ? error.message : String(error),
        };
    }
};

export const formatJsonContent = (content: string): string => (
    JSON.stringify(parseJson(content), null, 2)
);

export const beautifyJsonContent = (content: string): string => formatJsonContent(content);

export const minifyJsonContent = (content: string): string => (
    JSON.stringify(parseJson(content))
);
