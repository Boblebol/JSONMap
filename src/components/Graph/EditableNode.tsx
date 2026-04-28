import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const EditableNode = memo(({ data, selected }: NodeProps) => {
    const label = String(data.label ?? '');
    const type = String(data.type ?? 'unknown');
    const isScalar = ['string', 'number', 'boolean', 'null'].includes(type);
    const value = data.value === null ? 'null' : String(data.value ?? '');
    const title = isScalar ? label.split(':')[0] : label;

    const typeClasses: Record<string, string> = {
        object: 'border-[#7aa2f7]/50 bg-[#7aa2f7]/10 text-[#7aa2f7]',
        array: 'border-[#bb9af7]/50 bg-[#bb9af7]/10 text-[#bb9af7]',
        string: 'border-[#9ece6a]/50 bg-[#9ece6a]/10 text-[#9ece6a]',
        number: 'border-[#e0af68]/50 bg-[#e0af68]/10 text-[#e0af68]',
        boolean: 'border-[#f7768e]/50 bg-[#f7768e]/10 text-[#f7768e]',
        null: 'border-border bg-muted/10 text-muted',
    };

    return (
        <div className={`px-4 py-3 shadow-md rounded-md bg-surface border-2 transition-all ${selected ? 'border-primary' : 'border-border'} min-w-[200px] max-w-[260px]`}>
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary" />

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-text font-semibold truncate">{title}</div>
                    <div className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold ${typeClasses[type] ?? 'border-border bg-muted/10 text-muted'}`}>
                        {type}
                    </div>
                </div>
                {isScalar && (
                    <div className="rounded bg-background/70 border border-border/50 px-2 py-1 text-xs text-text/80 truncate">
                        {value}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary" />
        </div>
    );
});

EditableNode.displayName = 'EditableNode';
