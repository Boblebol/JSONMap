import {
    quicktype,
    InputData,
    jsonInputForTargetLanguage,
} from 'quicktype-core';
import type { FileFormat } from './tauri';

export type CodegenLanguage = 'typescript' | 'rust' | 'go' | 'python' | 'pydantic' | 'csharp' | 'java' | 'swift';

export const CODEGEN_LANGUAGES: Array<{ id: CodegenLanguage; label: string }> = [
    { id: 'typescript', label: 'TypeScript' },
    { id: 'rust', label: 'Rust' },
    { id: 'go', label: 'Go' },
    { id: 'python', label: 'Python' },
    { id: 'pydantic', label: 'Pydantic v2' },
    { id: 'csharp', label: 'C#' },
    { id: 'java', label: 'Java' },
    { id: 'swift', label: 'Swift' },
];

const stripKnownExtension = (name: string) => name.replace(/(\.pydantic)?\.(json|yaml|yml|xml|toml|csv|ts|py|go|rs)$/i, '');

export const getGeneratedDocumentName = (sourceName: string | undefined, lang: CodegenLanguage) => {
    const baseName = sourceName ? stripKnownExtension(sourceName) : 'Generated types';
    const extension = lang === 'typescript' ? 'ts' : lang === 'python' ? 'py' : lang === 'pydantic' ? 'pydantic.py' : lang === 'go' ? 'go' : lang === 'rust' ? 'rs' : 'txt';
    return `${baseName}.${extension}`;
};

export const getGeneratedDocumentFormat = (lang: CodegenLanguage): FileFormat | null => {
    if (lang === 'typescript') return 'typescript';
    if (lang === 'python' || lang === 'pydantic') return 'python';
    if (lang === 'go') return 'go';
    if (lang === 'rust') return 'rust';
    return null;
};

const getQuicktypeLanguage = (lang: CodegenLanguage) => lang === 'pydantic' ? 'python' : lang;

export const getRendererOptions = (lang: CodegenLanguage) => ({
    "just-types": "true",
    "package": "json_map",
    ...(lang === 'python' || lang === 'pydantic' ? { "python-version": "3.7" } : {}),
    ...(lang === 'pydantic' ? { "pydantic-base-model": "true" } : {}),
    ...(lang === 'rust' ? { "derive-debug": "true", visibility: "public" } : {}),
});

export const getEditorLanguage = (lang: CodegenLanguage) => lang === 'pydantic' ? 'python' : lang === 'typescript' ? 'typescript' : lang;

export const generateCodeFromJson = async (content: string, lang: CodegenLanguage) => {
    const quicktypeLanguage = getQuicktypeLanguage(lang);
    const jsonInput = jsonInputForTargetLanguage(quicktypeLanguage as any);
    await jsonInput.addSource({
        name: "Root",
        samples: [content],
    });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const { lines } = await quicktype({
        inputData,
        lang: quicktypeLanguage as any,
        rendererOptions: getRendererOptions(lang),
    });

    return lines.join('\n');
};
