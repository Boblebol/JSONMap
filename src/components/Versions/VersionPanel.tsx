import type { WorkspaceDocument } from '../../utils/documentWorkspace';
import { Download, GitCompare, History, RotateCcw, Save } from 'lucide-react';

interface VersionPanelProps {
    document: WorkspaceDocument | null;
    diffPreview: string;
    onCreateSnapshot: () => void;
    onRestoreSnapshot: (snapshotId: string) => void;
    onExportSnapshot: (snapshotId: string) => void;
}

export const VersionPanel = ({
    document,
    diffPreview,
    onCreateSnapshot,
    onRestoreSnapshot,
    onExportSnapshot,
}: VersionPanelProps) => {
    const snapshots = document?.snapshots ?? [];
    const diffLines = diffPreview.split('\n');

    return (
        <section className="border-t border-border bg-background flex flex-col min-h-0">
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-primary">
                        <History size={16} />
                        <h3 className="text-sm font-bold">Versions</h3>
                    </div>
                    <span className="text-[10px] text-muted">{snapshots.length}</span>
                </div>
                <button
                    onClick={onCreateSnapshot}
                    disabled={!document}
                    className="mt-3 w-full bg-primary text-background rounded px-3 py-2 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                >
                    <Save size={14} /> Save snapshot
                </button>
            </div>

            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted mb-2">
                    <GitCompare size={12} /> Original vs current
                </div>
                <div className="rounded border border-border bg-surface p-2 max-h-28 overflow-y-auto font-mono text-[11px] leading-relaxed">
                    {diffLines.map((line, index) => (
                        <div
                            key={`${line}-${index}`}
                            className={line.startsWith('+') ? 'text-[#9ece6a]' : line.startsWith('-') ? 'text-[#f7768e]' : 'text-muted'}
                        >
                            {line}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                {snapshots.length === 0 && (
                    <div className="rounded border border-border bg-surface p-3 text-xs text-muted text-center">
                        No snapshots yet
                    </div>
                )}

                {snapshots.map(snapshot => (
                    <div key={snapshot.id} className="rounded border border-border bg-surface p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-xs font-semibold text-text truncate">{snapshot.name}</div>
                                <div className="text-[10px] text-muted mt-1">{new Date(snapshot.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button
                                    onClick={() => onRestoreSnapshot(snapshot.id)}
                                    aria-label={`Restore ${snapshot.name}`}
                                    className="p-1.5 rounded border border-border text-muted hover:text-text hover:bg-muted/10"
                                    title="Restore snapshot"
                                >
                                    <RotateCcw size={12} />
                                </button>
                                <button
                                    onClick={() => onExportSnapshot(snapshot.id)}
                                    aria-label={`Export ${snapshot.name}`}
                                    className="p-1.5 rounded border border-border text-muted hover:text-text hover:bg-muted/10"
                                    title="Export snapshot"
                                >
                                    <Download size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
