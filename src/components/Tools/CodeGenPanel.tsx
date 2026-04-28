import { useState, useEffect } from 'react';
import { CodeEditor } from '../Editor/CodeEditor';
import { Copy, Check, FilePlus2 } from 'lucide-react';
import type { FileFormat } from '../../utils/tauri';
import {
    CODEGEN_LANGUAGES,
    generateCodeFromJson,
    getEditorLanguage,
    getGeneratedDocumentFormat,
    getGeneratedDocumentName,
    type CodegenLanguage,
} from '../../utils/codegen';

interface CodeGenPanelProps {
    content: string;
    sourceName?: string;
    onCreateDocument?: (content: string, options: { name: string; format: FileFormat }) => void;
}

export const CodeGenPanel = ({ content, sourceName, onCreateDocument }: CodeGenPanelProps) => {
    const [lang, setLang] = useState<CodegenLanguage>('typescript');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const outputFormat = getGeneratedDocumentFormat(lang);

    useEffect(() => {
        const generate = async () => {
            setLoading(true);
            try {
                setOutput(await generateCodeFromJson(content, lang));
            } catch (e) {
                setOutput(`Error generating code: ${e}`);
            } finally {
                setLoading(false);
            }
        };

        if (content) {
            const timeout = setTimeout(generate, 500);
            return () => clearTimeout(timeout);
        }
    }, [content, lang]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const createGeneratedDocument = () => {
        if (!output || !onCreateDocument || !outputFormat) return;

        onCreateDocument(output, {
            format: outputFormat,
            name: getGeneratedDocumentName(sourceName, lang),
        });
    };

    return (
        <div className="flex flex-col h-full bg-surface">
            <div className="flex items-center justify-between p-2 border-b border-border">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Target Language:</span>
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value as CodegenLanguage)}
                        className="bg-background border border-border rounded px-2 py-1 text-sm text-text"
                    >
                        {CODEGEN_LANGUAGES.map(l => (
                            <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    {onCreateDocument && outputFormat && (
                        <button
                            onClick={createGeneratedDocument}
                            disabled={!output}
                            className="rounded bg-primary px-2 py-1.5 text-xs font-bold text-background hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <FilePlus2 size={14} /> Create document
                        </button>
                    )}
                    <button
                        onClick={copyToClipboard}
                        className="p-1.5 rounded hover:bg-muted/20 text-muted hover:text-text transition-colors"
                        title="Copy code"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            <div className="flex-1 relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}
                <CodeEditor
                    value={output}
                    language={getEditorLanguage(lang)}
                    onChange={() => { }} // Read-only
                />
            </div>
        </div>
    );
};
