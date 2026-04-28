import { useMemo, useState } from 'react';
import type { WorkspaceDocument } from '../../utils/documentWorkspace';
import { Download, GitCompare, History, RotateCcw, Save } from 'lucide-react';
import { createLineDiffPreview } from '../../utils/contentDiff';

interface VersionPanelProps {
    document: WorkspaceDocument | null;
    diffPreview: string;
    onCreateSnapshot: (name?: string) => void;
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
    const [snapshotName, setSnapshotName] = useState('');
    const [baseSnapshotId, setBaseSnapshotId] = useState('');
    const [compareSnapshotId, setCompareSnapshotId] = useState('');
    const diffLines = diffPreview.split('\n');
    const baseSnapshot = snapshots.find(snapshot => snapshot.id === baseSnapshotId) ?? snapshots[0];
    const compareSnapshot = snapshots.find(snapshot => snapshot.id === compareSnapshotId) ?? snapshots[1] ?? snapshots[0];
    const snapshotCompareLines = useMemo(() => {
        if (!baseSnapshot || !compareSnapshot) return [];
        return createLineDiffPreview(baseSnapshot.content, compareSnapshot.content).split('\n');
    }, [baseSnapshot, compareSnapshot]);
    const handleCreateSnapshot = () => {
        onCreateSnapshot(snapshotName.trim() || undefined);
        setSnapshotName('');
    };

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
                <label htmlFor="snapshot-name" className="sr-only">Snapshot name</label>
                <input
                    id="snapshot-name"
                    aria-label="Snapshot name"
                    value={snapshotName}
                    onChange={(event) => setSnapshotName(event.target.value)}
                    disabled={!document}
                    placeholder={`Snapshot ${snapshots.length + 1}`}
                    className="mt-3 w-full bg-surface border border-border rounded px-3 py-2 text-xs text-text focus:outline-none focus:border-primary disabled:opacity-40"
                />
                <button
                    onClick={handleCreateSnapshot}
                    disabled={!document}
                    className="mt-2 w-full bg-primary text-background rounded px-3 py-2 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40"
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

            {snapshots.length >= 2 && (
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted mb-3">
                        <GitCompare size={12} /> Snapshot compare
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <label className="min-w-0">
                            <span className="sr-only">Base snapshot</span>
                            <select
                                aria-label="Base snapshot"
                                value={baseSnapshot?.id ?? ''}
                                onChange={(event) => setBaseSnapshotId(event.target.value)}
                                className="w-full min-w-0 bg-surface border border-border rounded px-2 py-1.5 text-xs text-text"
                            >
                                {snapshots.map(snapshot => (
                                    <option key={snapshot.id} value={snapshot.id}>{snapshot.name}</option>
                                ))}
                            </select>
                        </label>
                        <label className="min-w-0">
                            <span className="sr-only">Compare snapshot</span>
                            <select
                                aria-label="Compare snapshot"
                                value={compareSnapshot?.id ?? ''}
                                onChange={(event) => setCompareSnapshotId(event.target.value)}
                                className="w-full min-w-0 bg-surface border border-border rounded px-2 py-1.5 text-xs text-text"
                            >
                                {snapshots.map(snapshot => (
                                    <option key={snapshot.id} value={snapshot.id}>{snapshot.name}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="rounded border border-border bg-surface p-2 max-h-28 overflow-y-auto font-mono text-[11px] leading-relaxed">
                        {snapshotCompareLines.map((line, index) => (
                            <div
                                key={`${line}-${index}`}
                                className={line.startsWith('+') ? 'text-[#9ece6a]' : line.startsWith('-') ? 'text-[#f7768e]' : 'text-muted'}
                            >
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
