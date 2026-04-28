import { useEffect, useMemo, useState } from 'react';
import { Box, Check, Info } from 'lucide-react';
import type { Node } from 'reactflow';
import type { FileFormat } from '../../utils/tauri';

interface NodeInspectorProps {
    selectedNode: Node | null;
    format: FileFormat;
    onValueUpdate: (path: (string | number)[], value: unknown) => void;
}

const isEditableType = (type: string) => ['string', 'number', 'boolean', 'null'].includes(type);

const formatPath = (path: (string | number)[]) => {
    if (path.length === 0) return 'root';
    return path.map(segment => String(segment)).join(' > ');
};

const coerceValue = (rawValue: string, type: string) => {
    if (type === 'number') return Number(rawValue);
    if (type === 'boolean') return rawValue === 'true';
    if (type === 'null') return rawValue === '' ? null : rawValue;
    return rawValue;
};

export const NodeInspector = ({ selectedNode, format, onValueUpdate }: NodeInspectorProps) => {
    const data = selectedNode?.data;
    const type = String(data?.type ?? '');
    const path = useMemo(() => (Array.isArray(data?.path) ? data.path : []), [data?.path]);
    const [value, setValue] = useState('');

    useEffect(() => {
        if (!data) {
            setValue('');
            return;
        }
        setValue(data.value === null ? '' : String(data.value));
    }, [data]);

    if (!selectedNode || !data) {
        return (
            <aside className="w-72 border-l border-border bg-background flex flex-col items-center justify-center p-6 text-center">
                <Box size={28} className="text-muted mb-3" />
                <h3 className="text-sm font-semibold text-text mb-1">Select a node</h3>
                <p className="text-xs text-muted leading-relaxed">Click any graph node to inspect its path, type, and value.</p>
            </aside>
        );
    }

    const label = String(data.label ?? '').split(':')[0];
    const editable = format === 'json' && isEditableType(type);

    const handleApply = () => {
        onValueUpdate(path, coerceValue(value, type));
    };

    return (
        <aside className="w-72 border-l border-border bg-background flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <Info size={16} />
                    <h3 className="text-sm font-bold">Node details</h3>
                </div>
                <div className="text-xs text-muted break-words">{formatPath(path)}</div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
                <div>
                    <div className="text-[10px] uppercase font-bold text-muted mb-1">Key</div>
                    <div className="text-sm text-text break-words">{label}</div>
                </div>

                <div>
                    <div className="text-[10px] uppercase font-bold text-muted mb-1">Type</div>
                    <div className="inline-flex rounded border border-border px-2 py-1 text-xs text-text bg-surface">
                        {type}
                    </div>
                </div>

                {format !== 'json' && (
                    <div className="rounded border border-border bg-surface p-3 text-xs text-muted">
                        Editing is only available for JSON documents.
                    </div>
                )}

                {format === 'json' && !isEditableType(type) && (
                    <div className="rounded border border-border bg-surface p-3 text-xs text-muted">
                        Select a scalar value to edit. Objects and arrays can be explored from the graph.
                    </div>
                )}

                {editable && (
                    <div className="space-y-2">
                        <label htmlFor="node-inspector-value" className="text-[10px] uppercase font-bold text-muted">
                            Value
                        </label>
                        {type === 'boolean' ? (
                            <select
                                id="node-inspector-value"
                                aria-label="Node value"
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                                className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text"
                            >
                                <option value="true">true</option>
                                <option value="false">false</option>
                            </select>
                        ) : (
                            <input
                                id="node-inspector-value"
                                aria-label="Node value"
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                                className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
                            />
                        )}
                        <button
                            onClick={handleApply}
                            className="w-full bg-primary text-background rounded px-3 py-2 text-sm font-bold flex items-center justify-center gap-2"
                        >
                            <Check size={14} /> Apply
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};
