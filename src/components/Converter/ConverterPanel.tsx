import { useState } from 'react';
import { ArrowRight, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { tauriApi, FileFormat } from '../../utils/tauri';
import { CodeEditor } from '../Editor/CodeEditor';

export const ConverterPanel = () => {
    const [sourceContent, setSourceContent] = useState('');
    const [targetContent, setTargetContent] = useState('');
    const [sourceFormat, setSourceFormat] = useState<FileFormat>('json');
    const [targetFormat, setTargetFormat] = useState<FileFormat>('yaml');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleConvert = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await tauriApi.convertFormat(sourceContent, sourceFormat, targetFormat);
            setTargetContent(result);
        } catch (e: any) {
            setError(e.toString());
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(targetContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy', e);
        }
    };

    return (
        <div className="flex h-full w-full bg-background text-text">
            {/* Source Panel */}
            <div className="flex-1 flex flex-col border-r border-border min-w-[300px]">
                <div className="bg-surface p-2 border-b border-border flex justify-between items-center">
                    <span className="font-semibold text-sm pl-2">Source</span>
                    <select
                        value={sourceFormat}
                        onChange={(e) => setSourceFormat(e.target.value as FileFormat)}
                        className="bg-background border border-border rounded px-2 py-1 text-xs"
                    >
                        <option value="json">JSON</option>
                        <option value="yaml">YAML</option>
                        <option value="xml">XML</option>
                        <option value="toml">TOML</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>
                <div className="flex-1 relative">
                    <CodeEditor
                        value={sourceContent}
                        language={sourceFormat === 'json' ? 'json' : 'yaml'}
                        onChange={(val) => setSourceContent(val || '')}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="w-16 flex flex-col items-center justify-center bg-surface border-r border-border gap-4">
                <button
                    onClick={handleConvert}
                    disabled={loading || !sourceContent}
                    className="p-3 bg-primary text-background rounded-full hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                    title="Convert"
                >
                    <ArrowRight size={24} />
                </button>
                <div className="text-xs text-muted text-center px-1">
                    {loading ? '...' : ''}
                </div>
            </div>

            {/* Target Panel */}
            <div className="flex-1 flex flex-col min-w-[300px]">
                <div className="bg-surface p-2 border-b border-border flex justify-between items-center">
                    <span className="font-semibold text-sm pl-2">Target</span>
                    <div className="flex gap-2">
                        <select
                            value={targetFormat}
                            onChange={(e) => setTargetFormat(e.target.value as FileFormat)}
                            className="bg-background border border-border rounded px-2 py-1 text-xs"
                        >
                            <option value="json">JSON</option>
                            <option value="yaml">YAML</option>
                            <option value="xml">XML</option>
                            <option value="toml">TOML</option>
                            <option value="csv">CSV</option>
                        </select>
                        <button
                            onClick={copyToClipboard}
                            disabled={!targetContent}
                            className="p-1 hover:bg-muted/10 rounded text-muted hover:text-text transition-colors"
                            title="Copy output"
                        >
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>
                <div className="flex-1 relative bg-[#1e1e2e]">
                    <CodeEditor
                        value={targetContent}
                        language={targetFormat === 'json' ? 'json' : 'yaml'}
                        readOnly={true}
                    />
                    {error && (
                        <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/50 text-red-200 p-2 rounded text-xs backdrop-blur-md">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
