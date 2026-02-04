import { useState } from 'react';
import { tauriApi } from '../../utils/tauri';
import { CodeEditor } from '../Editor/CodeEditor';
import { Play, Globe, Link, Search, Terminal, Fingerprint, Scissors } from 'lucide-react';

export const ToolsPanel = ({ content, setContent, setFormat }: { content: string, setContent: (c: string) => void, setFormat: (f: string) => void }) => {
    const [tool, setTool] = useState<'jq' | 'jsonpath' | 'jwt' | 'anonymize' | 'url'>('jq');
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleImportUrl = async () => {
        setIsLoading(true);
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
            const res = await tauriApi.runJq(content, input);
            setResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
        } catch (e: any) {
            setResult("JQ Error: " + e.toString());
        }
    };

    const runJsonPath = async () => {
        try {
            const res = await tauriApi.runJsonPath(content, input);
            setResult(JSON.stringify(res, null, 2));
        } catch (e: any) {
            setResult("JSONPath Error: " + e.toString());
        }
    };

    const decodeJwt = () => {
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
        try {
            const res = await tauriApi.anonymizeData(JSON.parse(content));
            setContent(JSON.stringify(res, null, 2));
            setResult("Data anonymized successfully.");
        } catch (e: any) {
            setResult("Anonymize Error: " + e.toString());
        }
    };

    return (
        <div className="flex bg-background h-full w-full overflow-hidden">
            <div className="w-1/4 border-r border-border bg-surface p-4 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-muted uppercase mb-4 px-2">Tools</h3>
                <button
                    onClick={() => setTool('jq')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'jq' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Terminal size={14} /> JQ Query
                </button>
                <button
                    onClick={() => setTool('jsonpath')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'jsonpath' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Search size={14} /> JSONPath
                </button>
                <button
                    onClick={() => setTool('anonymize')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'anonymize' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Scissors size={14} /> Anonymize
                </button>
                <button
                    onClick={() => setTool('jwt')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'jwt' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Fingerprint size={14} /> JWT Decoder
                </button>
                <button
                    onClick={() => setTool('url')}
                    className={`p-2 rounded text-left flex items-center gap-2 ${tool === 'url' ? 'bg-primary text-background font-bold' : 'text-text hover:bg-muted/10'}`}
                >
                    <Globe size={14} /> URL Import
                </button>
            </div>

            <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider">
                        {tool === 'url' ? 'Remote Import' : tool.toUpperCase()}
                    </h3>
                    {tool !== 'url' && tool !== 'jwt' && (
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
                    {tool === 'url' ? (
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
                </div>
            </div>
        </div>
    );
};
