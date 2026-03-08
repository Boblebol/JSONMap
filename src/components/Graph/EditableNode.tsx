import { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const EditableNode = memo(({ data, selected }: NodeProps) => {
    const [value, setValue] = useState(data.value);
    const label = data.label.split(':')[0];

    useEffect(() => {
        setValue(data.value);
    }, [data.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);

        // Convert type if necessary
        let typedValue: any = newValue;
        if (data.type === 'number') typedValue = Number(newValue);
        if (data.type === 'boolean') typedValue = newValue.toLowerCase() === 'true';

        if (data.onChange) {
            data.onChange(data.path, typedValue);
        }
    };

    return (
        <div className={`px-4 py-2 shadow-md rounded-md bg-surface border-2 transition-all ${selected ? 'border-primary' : 'border-border'} min-w-[200px]`}>
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary" />

            <div className="flex flex-col gap-1">
                <div className="text-[10px] text-muted font-bold uppercase tracking-wider">{label}</div>
                <input
                    value={value}
                    onChange={handleChange}
                    className="bg-background border border-border/50 rounded px-2 py-1 text-sm text-text focus:outline-none focus:border-primary w-full"
                />
            </div>

            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary" />
        </div>
    );
});

EditableNode.displayName = 'EditableNode';
