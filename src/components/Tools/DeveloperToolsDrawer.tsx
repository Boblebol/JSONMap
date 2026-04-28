import { ComponentType } from 'react';
import { FileCode, Microscope, Search, Wand2, X } from 'lucide-react';

export type DeveloperToolId = 'tools' | 'converter' | 'codegen' | 'schema';

interface DeveloperToolsDrawerProps {
    isOpen: boolean;
    activeTool: string;
    onClose: () => void;
    onSelectTool: (tool: DeveloperToolId) => void;
}

const developerTools: Array<{
    id: DeveloperToolId;
    label: string;
    description: string;
    Icon: ComponentType<{ size?: number; className?: string }>;
}> = [
    {
        id: 'tools',
        label: 'JQ / JSONPath',
        description: 'Query, decode, anonymize, and import remote structured data.',
        Icon: Search,
    },
    {
        id: 'converter',
        label: 'Converter',
        description: 'Transform JSON, YAML, XML, TOML, and CSV payloads.',
        Icon: Wand2,
    },
    {
        id: 'codegen',
        label: 'Code Generation',
        description: 'Generate typed descriptors for developer handoff.',
        Icon: FileCode,
    },
    {
        id: 'schema',
        label: 'Schema Tools',
        description: 'Infer schemas, validate payloads, and generate mock data.',
        Icon: Microscope,
    },
];

export const DeveloperToolsDrawer = ({
    isOpen,
    activeTool,
    onClose,
    onSelectTool,
}: DeveloperToolsDrawerProps) => {
    if (!isOpen) return null;

    return (
        <>
            <button
                aria-label="Close developer tools backdrop"
                className="fixed inset-y-0 left-20 right-0 z-30 bg-background/35 backdrop-blur-[1px]"
                onClick={onClose}
            />
            <aside
                role="dialog"
                aria-label="Developer tools"
                className="fixed left-20 top-0 bottom-0 z-40 w-[360px] border-r border-border bg-background shadow-2xl flex flex-col"
            >
                <div className="h-16 px-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-text">Developer tools</h2>
                        <p className="text-xs text-muted">Advanced actions for the active document.</p>
                    </div>
                    <button
                        aria-label="Close developer tools"
                        onClick={onClose}
                        className="p-2 rounded border border-border text-muted hover:text-text hover:bg-muted/10"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-3 flex flex-col gap-2 overflow-y-auto">
                    {developerTools.map(({ id, label, description, Icon }) => {
                        const isActive = activeTool === id;

                        return (
                            <button
                                key={id}
                                onClick={() => onSelectTool(id)}
                                className={`w-full text-left rounded border px-3 py-3 transition-colors flex gap-3 ${isActive
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-surface text-text hover:bg-muted/10'
                                    }`}
                            >
                                <Icon size={18} className="mt-0.5 shrink-0" />
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold">{label}</span>
                                    <span className="block text-xs text-muted leading-relaxed">{description}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </aside>
        </>
    );
};
