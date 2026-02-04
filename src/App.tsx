import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CodeEditor } from './components/Editor/CodeEditor';
import { GraphView } from './components/Graph/GraphView';
import { jsonToGraph } from './utils/graphTransform';
import { tauriApi } from './utils/tauri';
import { Node, Edge } from 'reactflow';
import { CodeGenPanel } from './components/Tools/CodeGenPanel';
import { ToolsPanel } from './components/Tools/ToolsPanel';
import { ConverterPanel } from './components/Converter/ConverterPanel';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { HelpPanel } from './components/Help/HelpPanel';
import { ShortcutOverlay } from './components/Help/ShortcutOverlay';
import { SchemaPanel } from './components/Tools/SchemaPanel';

const SAMPLE_JSON = `{
  "name": "JSONMap",
  "version": "1.0.0",
  "features": [
    "Visualization",
    "Editor",
    "Conversion"
  ],
  "settings": {
    "theme": "dark",
    "autoSave": true
  }
}`;

function App() {
  const [activeTab, setActiveTab] = useState('visualizer');
  const [content, setContent] = useState(SAMPLE_JSON);
  const [format, setFormat] = useState('json');
  const [graphData, setGraphData] = useState<{ nodes: Node[], edges: Edge[] }>({ nodes: [], edges: [] });
  const [error, setError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setShowShortcuts(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      if (window.__TAURI__) {
        const savedTheme = await tauriApi.getSetting('theme');
        if (savedTheme === 'light') {
          document.documentElement.classList.add('light');
        }
      }
    };
    loadTheme();
  }, []);

  const handleContentChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
    }
  }, []);

  useEffect(() => {
    const updateGraph = async () => {
      try {
        // Try parsing using Tauri backend for multi-format support
        // Fallback to JSON.parse if running in browser/preview without Tauri
        let parsedData;
        try {
          // Basic heuristic for format if not set
          let currentFormat = format;
          if (content.trim().startsWith('<')) currentFormat = 'xml';

          if (window.__TAURI__) {
            parsedData = await tauriApi.parseContent(content, currentFormat);
          } else {
            // Browser fallback (JSON only)
            parsedData = JSON.parse(content);
          }
        } catch (e: any) {
          setError(e.toString());
          return;
        }

        const { nodes, edges } = jsonToGraph(parsedData);
        setGraphData({ nodes, edges });
        setError(null);
      } catch (err: any) {
        console.error("Graph update error:", err);
        setError(err.message);
      }
    };

    const debounceId = setTimeout(updateGraph, 500);
    return () => clearTimeout(debounceId);
  }, [content, format]);

  const handleOpenFile = async () => {
    try {
      const result = await tauriApi.openFile();
      if (result) {
        setContent(result.content);
        setFormat(result.format);
        if (window.__TAURI__) {
          await tauriApi.addRecentFile(result.path);
        }
      }
    } catch (e: any) {
      console.error(e);
      setError("Failed to open file: " + e.message);
    }
  };

  const handleSaveFile = async () => {
    try {
      const path = await tauriApi.saveFile(content);
      if (path && window.__TAURI__) {
        await tauriApi.showNotification("File Saved", `Successfully saved to ${path}`);
      }
    } catch (e: any) {
      console.error(e);
      setError("Failed to save file: " + e.message);
    }
  };

  const handleMinify = () => {
    try {
      if (format === 'json') {
        const minified = JSON.stringify(JSON.parse(content));
        setContent(minified);
      } else {
        const minified = content.split('\n').map(l => l.trim()).filter(l => l).join(' ');
        setContent(minified);
      }
    } catch (e: any) {
      setError("Minify error: " + e.message);
    }
  };

  const handleLoadFilePath = async (path: string) => {
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const fileContent = await readTextFile(path);
      const ext = path.split('.').pop()?.toLowerCase();
      let newFormat = 'json';
      if (['yaml', 'yml'].includes(ext || '')) newFormat = 'yaml';
      if (ext === 'xml') newFormat = 'xml';
      if (ext === 'toml') newFormat = 'toml';
      if (ext === 'csv') newFormat = 'csv';

      setContent(fileContent);
      setFormat(newFormat);
      if (window.__TAURI__) {
        await tauriApi.addRecentFile(path);
      }
    } catch (e: any) {
      console.error("Failed to load path:", e);
      setError("Failed to load recent file: " + e.message);
    }
  };

  useEffect(() => {
    let unlisten: any;
    let unlistenDrop: any;

    const setupListeners = async () => {
      if (window.__TAURI__) {
        const { listen } = await import('@tauri-apps/api/event');
        unlisten = await Promise.all([
          listen('menu-open', () => handleOpenFile()),
          listen('menu-save', () => handleSaveFile()),
          listen('menu-export', () => {
            window.dispatchEvent(new CustomEvent('trigger-graph-export'));
          }),
          listen('menu-recent-open', (event: any) => {
            handleLoadFilePath(event.payload);
          })
        ]);

        unlistenDrop = await listen('tauri://drag-drop', async (event: any) => {
          const paths = event.payload.paths as string[];
          if (paths && paths.length > 0) {
            const path = paths[0];
            try {
              const { readTextFile } = await import('@tauri-apps/plugin-fs');
              const fileContent = await readTextFile(path);
              const ext = path.split('.').pop()?.toLowerCase();
              let newFormat = 'json';
              if (['yaml', 'yml'].includes(ext || '')) newFormat = 'yaml';
              if (ext === 'xml') newFormat = 'xml';
              if (ext === 'toml') newFormat = 'toml';
              if (ext === 'csv') newFormat = 'csv';

              setContent(fileContent);
              setFormat(newFormat);
              if (window.__TAURI__) {
                await tauriApi.addRecentFile(path);
              }
            } catch (e) {
              console.error("Failed to read dropped file:", e);
            }
          }
        });
      }
    };

    setupListeners();
    return () => {
      if (unlisten) {
        unlisten.then((fns: any[]) => fns.forEach(fn => fn()));
      }
      if (unlistenDrop) {
        unlistenDrop.then((fn: any) => fn());
      }
    };
  }, [content, format]);

  return (
    <div className="flex h-screen w-screen bg-transparent overflow-hidden text-text font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpen={window.__TAURI__ ? handleOpenFile : undefined}
        onSave={window.__TAURI__ ? handleSaveFile : undefined}
        onMinify={handleMinify}
      />

      {content.length > 1024 * 1024 && (
        <div className="fixed bottom-6 left-24 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#eab308]/10 border border-[#eab308]/20 backdrop-blur-xl p-3 rounded-2xl flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#eab308] rounded-xl text-background">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 className="font-bold text-[#eab308] text-sm">Large Dataset Detected</h4>
                <p className="text-[10px] text-text/60">Content size is {(content.length / 1024 / 1024).toFixed(1)}MB. UI performance might be impacted during graph interactions.</p>
              </div>
            </div>
            <button
              onClick={() => handleMinify()}
              className="px-4 py-1.5 bg-[#eab308] text-background rounded-lg font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Minify to Optimize
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'visualizer' && (
          <>
            {/* Editor Panel */}
            <div className="w-1/3 min-w-[300px] flex flex-col border-r border-border">
              <div className="bg-surface p-2 border-b border-border flex justify-between items-center">
                <span className="text-sm font-semibold pl-2">Input</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="bg-background border border-border rounded px-2 py-1 text-xs"
                >
                  <option value="json">JSON</option>
                  <option value="yaml">YAML</option>
                  <option value="xml">XML</option>
                  <option value="toml">TOML</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="flex-1 relative">
                <CodeEditor
                  value={content}
                  language={format === 'json' ? 'json' : 'yaml'}
                  onChange={handleContentChange}
                />
                {error && (
                  <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/50 text-red-200 p-2 rounded text-xs backdrop-blur-md">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Graph Panel */}
            <div className="flex-1 relative bg-surface">
              <GraphView
                initialNodes={graphData.nodes}
                initialEdges={graphData.edges}
              />
            </div>
          </>
        )}

        {activeTab === 'codegen' && (
          <CodeGenPanel content={content} />
        )}

        {activeTab === 'schema' && (
          <SchemaPanel content={content} />
        )}

        {activeTab === 'tools' && (
          <ToolsPanel content={content} setContent={setContent} setFormat={setFormat} />
        )}

        {activeTab === 'converter' && (
          <ConverterPanel />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel />
        )}

        {activeTab === 'help' && (
          <HelpPanel />
        )}

        {['export', 'security'].includes(activeTab) && (
          <div className="flex-1 flex items-center justify-center text-muted flex-col gap-4">
            <div className="p-4 bg-surface rounded-lg border border-border">
              <h2 className="text-xl font-bold mb-2 capitalize">{activeTab} Feature</h2>
              <p>Coming soon in the next update.</p>
            </div>
          </div>
        )}
      </main>

      <ShortcutOverlay isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}

export default App;
