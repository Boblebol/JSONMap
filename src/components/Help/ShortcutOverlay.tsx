import { X } from 'lucide-react';

interface ShortcutOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShortcutOverlay = ({ isOpen, onClose }: ShortcutOverlayProps) => {
    if (!isOpen) return null;

    const shortcuts = [
        { keys: ['⌘', 'O'], action: 'Open File' },
        { keys: ['⌘', 'S'], action: 'Save File' },
        { keys: ['⌘', 'E'], action: 'Export Graph' },
        { keys: ['⌘', 'Q'], action: 'Quit' },
        { keys: ['Double Click'], action: 'Collapse Node' },
        { keys: ['?'], action: 'Toggle Shortcuts' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-[400px] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/5">
                    <h3 className="font-bold flex items-center gap-2">
                        Keyboard Shortcuts
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted/20 rounded-full transition-colors text-muted hover:text-text">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {shortcuts.map((s, i) => (
                        <div key={i} className="flex justify-between items-center group">
                            <span className="text-sm text-text/80 group-hover:text-text">{s.action}</span>
                            <div className="flex gap-1.5">
                                {s.keys.map((k, ki) => (
                                    <kbd key={ki} className="px-2.5 py-1 bg-background border border-border rounded-lg text-xs font-mono shadow-sm text-primary">
                                        {k}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-muted/5 border-t border-border text-center">
                    <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Press ESC to dismiss</p>
                </div>
            </div>
        </div>
    );
};
