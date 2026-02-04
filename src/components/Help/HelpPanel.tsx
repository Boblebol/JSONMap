import { Keyboard, Info, BookOpen, ExternalLink } from 'lucide-react';

export const HelpPanel = () => {
    const shortcuts = [
        { keys: ['⌘', 'O'], action: 'Open File' },
        { keys: ['⌘', 'S'], action: 'Save File' },
        { keys: ['⌘', 'E'], action: 'Export Graph as Image' },
        { keys: ['⌘', 'Q'], action: 'Quit Application' },
        { keys: ['⌘', '+'], action: 'Zoom In Graph' },
        { keys: ['⌘', '-'], action: 'Zoom Out Graph' },
        { keys: ['Double Click'], action: 'Expand/Collapse Node' },
        { keys: ['Right Click'], action: 'Node Context Menu' },
    ];

    return (
        <div className="flex h-full w-full bg-background overflow-hidden">
            <div className="w-1/4 border-r border-border bg-surface p-4 flex flex-col gap-2">
                <h2 className="text-xl font-bold mb-4">Support</h2>
                <div className="flex flex-col gap-1">
                    <button className="p-2 bg-primary/10 text-primary rounded text-left font-medium">Docs & Help</button>
                    <button className="p-2 hover:bg-muted/10 rounded text-left text-muted">Tutorial</button>
                    <button className="p-2 hover:bg-muted/10 rounded text-left text-muted">API Reference</button>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                        <BookOpen size={24} />
                        <h3 className="text-xl font-semibold">Getting Started</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                        <p className="text-text/80 mb-4 leading-relaxed">
                            Welcome to JSONMap, the native macOS visualizer for JSON, YAML, XML, and more.
                            Drag and drop files to get started, or paste content directly into the editor.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/5 rounded-xl border border-border">
                                <h4 className="font-medium text-text mb-2 flex items-center gap-2">
                                    <Info size={16} /> Data Formats
                                </h4>
                                <p className="text-xs text-muted">Supports JSON, YAML, XML, TOML, and CSV with auto-detection.</p>
                            </div>
                            <div className="p-4 bg-muted/5 rounded-xl border border-border">
                                <h4 className="font-medium text-text mb-2 flex items-center gap-2">
                                    <Keyboard size={16} /> Interactive Graph
                                </h4>
                                <p className="text-xs text-muted">Navigate your data visually. Double-click any node to toggle children visibility.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-6 text-secondary">
                        <Keyboard size={24} />
                        <h3 className="text-xl font-semibold">Keyboard Shortcuts</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {shortcuts.map((s, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm text-text/70">{s.action}</span>
                                <div className="flex gap-1">
                                    {s.keys.map((k, ki) => (
                                        <kbd key={ki} className="px-2 py-0.5 bg-muted/20 border border-border rounded text-[10px] font-mono min-w-[24px] text-center">
                                            {k}
                                        </kbd>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg mb-1">Need more help?</h3>
                            <p className="text-sm text-muted">Check out the full documentation online.</p>
                        </div>
                        <button className="px-6 py-2 bg-primary text-background rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                            Documentation <ExternalLink size={16} />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
