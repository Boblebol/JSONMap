import { useState, useEffect } from 'react';
import { tauriApi } from '../../utils/tauri';
import { Trash2, Monitor, Moon, Sun, Clock } from 'lucide-react';

export const SettingsPanel = () => {
    const [recentFiles, setRecentFiles] = useState<string[]>([]);
    const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

    useEffect(() => {
        const loadRecentFiles = async () => {
            if (window.__TAURI__) {
                const files = await tauriApi.getRecentFiles();
                setRecentFiles(files);
                const savedTheme = await tauriApi.getSetting('theme');
                if (savedTheme) setTheme(savedTheme as any);
            }
        };
        loadRecentFiles();
    }, []);

    const handleThemeChange = async (newTheme: 'dark' | 'light' | 'system') => {
        setTheme(newTheme);
        if (window.__TAURI__) {
            await tauriApi.setSetting('theme', newTheme);
        }
        // Apply theme to document
        if (newTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    };

    const clearRecent = async () => {
        setRecentFiles([]);
        if (window.__TAURI__) {
            await tauriApi.setSetting('recent_files', []);
        }
    };

    return (
        <div className="flex h-full w-full bg-background overflow-hidden">
            <div className="w-1/4 border-r border-border bg-surface p-4 flex flex-col gap-2">
                <h2 className="text-xl font-bold mb-4">Settings</h2>
                <div className="flex flex-col gap-1">
                    <button className="p-2 bg-primary/10 text-primary rounded text-left font-medium">General</button>
                    <button className="p-2 hover:bg-muted/10 rounded text-left text-muted">Advanced</button>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                <section className="mb-10">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Appearance</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'dark', icon: Moon, label: 'Dark' },
                            { id: 'light', icon: Sun, label: 'Light' },
                            { id: 'system', icon: Monitor, label: 'System' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => handleThemeChange(t.id as any)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                                    ${theme === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-text/20'}
                                `}
                            >
                                <t.icon size={24} className={theme === t.id ? 'text-primary' : 'text-muted'} />
                                <span className={`text-xs font-medium ${theme === t.id ? 'text-primary' : ''}`}>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Recent Files</h3>
                        <button
                            onClick={clearRecent}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                            <Trash2 size={12} /> Clear History
                        </button>
                    </div>

                    <div className="space-y-2">
                        {recentFiles.length > 0 ? (
                            recentFiles.map((path, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 bg-surface border border-border rounded-lg flex items-center gap-3 group hover:border-primary/50 transition-colors"
                                >
                                    <Clock size={16} className="text-muted" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{path.split('/').pop()}</div>
                                        <div className="text-[10px] text-muted truncate">{path}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-border rounded-xl text-muted text-sm">
                                No recent files yet.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};
