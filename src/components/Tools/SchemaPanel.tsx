import { useState } from 'react';
import { tauriApi } from '../../utils/tauri';
import { CodeEditor } from '../Editor/CodeEditor';
import { FileSearch, CheckCircle2, AlertCircle, Play, Sparkles } from 'lucide-react';

export const SchemaPanel = ({ content }: { content: string }) => {
    const [schema, setSchema] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isValidating, setIsValidating] = useState(false);

    const generateSchema = async () => {
        try {
            const parsed = JSON.parse(content);
            const generated = await tauriApi.generateSchema(parsed);
            setSchema(JSON.stringify(generated, null, 2));
            setValidationErrors([]);
        } catch (e: any) {
            setValidationErrors(["Error generating schema: " + e.toString()]);
        }
    };

    const generateMockData = async () => {
        try {
            const parsedSchema = JSON.parse(schema);
            const mock = await tauriApi.generateMockData(parsedSchema);
            setValidationErrors(["Mock data generated successfully (logged to console)."]);
            console.log("Mock data generated from schema:", mock);
            alert("Mock data generated from schema:\n\n" + JSON.stringify(mock, null, 2));
        } catch (e: any) {
            setValidationErrors(["Mock generation failed: " + e.toString()]);
        }
    };

    const validateContent = async () => {
        setIsValidating(true);
        try {
            const parsedContent = JSON.parse(content);
            const parsedSchema = JSON.parse(schema);
            const errors = await tauriApi.validateJsonSchema(parsedContent, parsedSchema);
            setValidationErrors(errors);
        } catch (e: any) {
            setValidationErrors(["Validation setup failed: " + e.toString()]);
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="flex bg-background h-full w-full overflow-hidden">
            <div className="w-1/2 flex flex-col border-r border-border p-4 gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider">JSON Schema</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={generateSchema}
                            className="text-xs bg-muted/10 hover:bg-muted/20 text-text px-3 py-1.5 rounded-lg border border-border flex items-center gap-2 transition-colors"
                        >
                            <FileSearch size={14} /> Infer
                        </button>
                        <button
                            onClick={generateMockData}
                            disabled={!schema}
                            className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Sparkles size={14} /> Mock Data
                        </button>
                    </div>
                </div>
                <div className="flex-1 border border-border rounded-xl overflow-hidden bg-surface">
                    <CodeEditor
                        value={schema}
                        onChange={(val) => setSchema(val || '')}
                        language="json"
                    />
                </div>
            </div>

            <div className="w-1/2 flex flex-col p-4 gap-4 bg-surface/30">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Validation Results</h3>
                    <button
                        onClick={validateContent}
                        disabled={!schema || isValidating}
                        className="bg-primary text-background px-4 py-1.5 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                        <Play size={14} /> Validate
                    </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                    {schema === '' && (
                        <div className="h-full flex flex-col items-center justify-center text-muted gap-2">
                            <Info size={32} className="opacity-20" />
                            <p className="text-sm">Generate or paste a schema to begin validation.</p>
                        </div>
                    )}

                    {schema !== '' && validationErrors.length === 0 && !isValidating && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                            <CheckCircle2 className="text-green-500 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-green-500">Valid JSON</h4>
                                <p className="text-xs text-text/60">The current content matches the provided schema perfectly.</p>
                            </div>
                        </div>
                    )}

                    {validationErrors.map((err, i) => (
                        <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-500 mt-1 shrink-0" size={16} />
                            <span className="text-xs text-text/80">{err}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Info = ({ size, className }: { size: number, className: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
);
