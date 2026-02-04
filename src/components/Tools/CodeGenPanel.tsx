import { useState, useEffect } from 'react';
import {
    quicktype,
    InputData,
    jsonInputForTargetLanguage
} from 'quicktype-core';
import { CodeEditor } from '../Editor/CodeEditor';
import { Copy, Check } from 'lucide-react';

interface CodeGenPanelProps {
    content: string;
}

const LANGUAGES = [
    { id: 'typescript', label: 'TypeScript' },
    { id: 'rust', label: 'Rust' },
    { id: 'go', label: 'Go' },
    { id: 'python', label: 'Python' },
    { id: 'csharp', label: 'C#' },
    { id: 'java', label: 'Java' },
    { id: 'swift', label: 'Swift' },
];

export const CodeGenPanel = ({ content }: CodeGenPanelProps) => {
    const [lang, setLang] = useState('typescript');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const generate = async () => {
            setLoading(true);
            try {
                const jsonInput = jsonInputForTargetLanguage(lang as any);
                await jsonInput.addSource({
                    name: "Root",
                    samples: [content],
                });

                const inputData = new InputData();
                inputData.addInput(jsonInput);

                const { lines } = await quicktype({
                    inputData,
                    lang: lang as any,
                    rendererOptions: {
                        "just-types": "true", // for TS
                        "package": "json_map", // for Go/Java
                    }
                });

                setOutput(lines.join('\n'));
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

    return (
        <div className="flex flex-col h-full bg-surface">
            <div className="flex items-center justify-between p-2 border-b border-border">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Target Language:</span>
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="bg-background border border-border rounded px-2 py-1 text-sm text-text"
                    >
                        {LANGUAGES.map(l => (
                            <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="p-1.5 rounded hover:bg-muted/20 text-muted hover:text-text transition-colors"
                    title="Copy code"
                >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
            </div>

            <div className="flex-1 relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}
                <CodeEditor
                    value={output}
                    language={lang === 'typescript' ? 'typescript' : lang}
                    onChange={() => { }} // Read-only
                />
            </div>
        </div>
    );
};
