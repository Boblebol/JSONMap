import { useState } from 'react';
import { tauriApi, type FileFormat } from '../../utils/tauri';
import { CodeEditor } from '../Editor/CodeEditor';
import { beautifyJsonContent, formatJsonContent, minifyJsonContent, validateJsonContent } from '../../utils/jsonFormat';
import { Play, Globe, Link, Search, Terminal, Fingerprint, Scissors, CheckCircle2, Braces, Minimize2, Copy, FilePlus2 } from 'lucide-react';

interface ToolsPanelProps {
    content: string;
    setContent: (content: string) => void;
    setFormat: (format: string) => void;
    onCreateDocument?: (content: string, options: { name: string; format: FileFormat }) => void;
}

const serializeJsonResult = (value: unknown) => {
    const serialized = JSON.stringify(value, null, 2);
    return serialized === undefined ? String(value) : serialized;
};

export const ToolsPanel = ({ content, setContent, setFormat, onCreateDocument }: ToolsPanelProps) => {
    const [tool, setTool] = useState<'format' | 'jq' | 'jsonpath' | 'jwt' | 'anonymize' | 'url'>('format');
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [jqResultContent, setJqResultContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const selectTool = (nextTool: typeof tool) => {
        setTool(nextTool);
        setJqResultContent(null);
    };

    const handleImportUrl = async () => {
        setIsLoading(true);
        setJqResultContent(null);
        try {
            const data = await tauriApi.fetchUrl(input);
            setContent(data);
            setResult('Successfully imported from ' + input);

            const ext = input.split('.').pop()?.toLowerCase();
            if (['yaml', 'yml'].includes(ext || '')) setFormat('yaml');
            else if (ext === 'xml') setFormat('xml');
            else if (ext === 'toml') setFormat('toml');
            else if (ext === 'csv') setFormat('csv');
            else if (data.trim().startsWith('<')) setFormat('xml');
            else if (data.trim().startsWith('{') || data.trim().startsWith('[')) setFormat('json');
        } catch (e: any) {
            setResult('Error: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const runJq = async () => {
        try {
            const parsedContent = JSON.parse(content);
            const res = await tauriApi.runJq(input, parsedContent);
            const serialized = serializeJsonResult(res);
            setResult(serialized);
            setJqResultContent(serialized);
        } catch (e: any) {
            setJqResultContent(null);
            setResult("JQ Error: " + e.toString());
        }
    };

    const runJsonPath = async () => {
        setJqResultContent(null);
        try {
            const parsedContent = JSON.parse(content);
            const res = await tauriApi.runJsonPath(input, parsedContent);
            setResult(serializeJsonResult(res));
        } catch (e: any) {
            setResult("JSONPath Error: " + e.toString());
        }
    };

    const decodeJwt = () => {
        setJqResultContent(null);
        try {
            const parts = content.split('.');
            if (parts.length !== 3) throw new Error("Invalid JWT format");
            const payload = JSON.parse(atob(parts[1]));
            const header = JSON.parse(atob(parts[0]));
            setResult(JSON.stringify({ header, payload }, null, 2));
        } catch (e: any) {
            setResult("JWT Error: " + e.toString());
        }
    };

    const anonymize = async () => {
        setJqResultContent(null);
        try {
            const res = await tauriApi.anonymizeData(JSON.parse(content));
            setContent(JSON.stringify(res, null, 2));
            setResult("Data anonymized successfully.");
        } catch (e: any) {
            setResult("Anonymize Error: " + e.toString());
        }
    };

    const validateJson = () => {
        setJqResultContent(null);
        setResult(validateJsonContent(content).message);
    };

    const applyJsonTransform = (action: 'format' | 'beautify' | 'minify') => {
        setJqResultContent(null);
        try {
            const nextContent = action === 'minify'
                ? minifyJsonContent(content)
                : action === 'beautify'
                    ? beautifyJsonContent(content)
                    : formatJsonContent(content);

            setContent(nextContent);
            setFormat('json');
            setResult(action === 'minify' ? 'JSON minified.' : 'JSON formatted.');
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setResult(`${action === 'minify' ? 'Minify' : 'Format'} error: ${message}`);
        }
    };

    const copyJqResult = async () => {
        if (!jqResultContent) return;

        try {
            await navigator.clipboard.writeText(jqResultContent);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setResult(`Copy error: ${message}`);
        }
    };

    const createJqResultDocument = () => {
        if (!jqResultContent || !onCreateDocument) return;

        onCreateDocument(jqResultContent, {
            format: 'json',
            name: 'JQ Result.json',
        });
    };

    return (
        <div className="flex bg-background h-full w-full overflow-hidden">
            <div className="w-1/4 border-r border-border bg-surface p-4 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-muted uppercase mb-4 px-2">Tools</h3>
                <button
                    onClick={() => selectTool('format')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'format' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Braces size={14} /> Format & Validate
                </button>
                <button
                    onClick={() => selectTool('jq')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'jq' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Terminal size={14} /> JQ Query
                </button>
                <button
                    onClick={() => selectTool('jsonpath')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'jsonpath' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Search size={14} /> JSONPath
                </button>
                <button
                    onClick={() => selectTool('anonymize')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'anonymize' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Scissors size={14} /> Anonymize
                </button>
                <button
                    onClick={() => selectTool('jwt')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'jwt' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Fingerprint size={14} /> JWT Decoder
                </button>
                <button
                    onClick={() => selectTool('url')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'url' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Globe size={14} /> URL Import
                </button>
            </div>

            <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider">
                        {tool === 'url' ? 'Remote Import' : tool === 'format' ? 'Format & Validate' : tool.toUpperCase()}
                    </h3>
                    {tool !== 'url' && tool !== 'jwt' && tool !== 'format' && (
                        <button
                            onClick={tool === 'jq' ? runJq : tool === 'jsonpath' ? runJsonPath : anonymize}
                            className="bg-primary text-background px-4 py-1.5 rounded-lg font-bold flex items-center gap-2"
                        >
                            <Play size={14} /> Run
                        </button>
                    )}
                    {tool === 'jwt' && (
                        <button
                            onClick={decodeJwt}
                            className="bg-primary text-background px-4 py-1.5 rounded-lg font-bold flex items-center gap-2"
                        >
                            <Fingerprint size={14} /> Decode
                        </button>
                    )}
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {tool === 'format' ? (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={validateJson}
                                className="rounded border border-border bg-surface p-4 text-left text-text hover:bg-muted/10 flex items-start gap-3"
                            >
                                <CheckCircle2 size={18} className="text-primary mt-0.5" />
                                <span>
                                    <span className="block text-sm font-bold">Validate JSON</span>
                                    <span className="block text-xs text-muted">Check whether the active document can be parsed.</span>
                                </span>
                            </button>
                            <button
                                onClick={() => applyJsonTransform('format')}
                                className="rounded border border-border bg-surface p-4 text-left text-text hover:bg-muted/10 flex items-start gap-3"
                            >
                                <Braces size={18} className="text-primary mt-0.5" />
                                <span>
                                    <span className="block text-sm font-bold">Format JSON</span>
                                    <span className="block text-xs text-muted">Normalize indentation with stable two-space JSON.</span>
                                </span>
                            </button>
                            <button
                                onClick={() => applyJsonTransform('beautify')}
                                className="rounded border border-border bg-surface p-4 text-left text-text hover:bg-muted/10 flex items-start gap-3"
                            >
                                <Braces size={18} className="text-primary mt-0.5" />
                                <span>
                                    <span className="block text-sm font-bold">Beautify JSON</span>
                                    <span className="block text-xs text-muted">Make compact payloads easier to scan and edit.</span>
                                </span>
                            </button>
                            <button
                                onClick={() => applyJsonTransform('minify')}
                                className="rounded border border-border bg-surface p-4 text-left text-text hover:bg-muted/10 flex items-start gap-3"
                            >
                                <Minimize2 size={18} className="text-primary mt-0.5" />
                                <span>
                                    <span className="block text-sm font-bold">Minify JSON</span>
                                    <span className="block text-xs text-muted">Compact JSON before copying or exporting.</span>
                                </span>
                            </button>
                        </div>
                    ) : tool === 'url' ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/5 rounded-xl border border-border">
                                <h4 className="text-xs font-bold text-muted uppercase mb-3 flex items-center gap-2 text-primary">
                                    <Link size={14} /> Fetch Remote Data
                                </h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="https://api.example.com/data.json"
                                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <button
                                        onClick={handleImportUrl}
                                        disabled={isLoading || !input}
                                        className="bg-primary text-background px-4 py-2 rounded-lg font-bold text-sm"
                                    >
                                        {isLoading ? '...' : 'Fetch'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-24 border border-border rounded-xl overflow-hidden bg-surface">
                            <CodeEditor
                                value={input}
                                onChange={(val) => setInput(val || '')}
                                language={tool === 'jq' ? 'jq' : 'text'}
                            />
                        </div>
                    )}

                    <div className="flex-1 border border-border rounded-xl overflow-hidden bg-surface">
                        <CodeEditor value={result} onChange={() => { }} language="json" />
                    </div>

                    {tool === 'jq' && jqResultContent && (
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={copyJqResult}
                                className="rounded border border-border bg-surface px-3 py-2 text-xs font-bold text-text hover:bg-muted/10 flex items-center gap-2"
                            >
                                <Copy size={14} /> Copy result
                            </button>
                            <button
                                onClick={createJqResultDocument}
                                disabled={!onCreateDocument}
                                className="rounded bg-primary px-3 py-2 text-xs font-bold text-background hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                            >
                                <FilePlus2 size={14} /> Create document
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
