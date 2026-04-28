import { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect, type DragEvent } from 'react';
import { AlertTriangle, Download, FileJson, RotateCcw } from 'lucide-react';
import download from 'downloadjs';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CodeEditor } from './components/Editor/CodeEditor';
import { GraphView } from './components/Graph/GraphView';
import { NodeInspector } from './components/Inspector/NodeInspector';
import { VersionPanel } from './components/Versions/VersionPanel';
import { jsonToGraph } from './utils/graphTransform';
import { FileFormat, tauriApi } from './utils/tauri';
import type { Node, Edge } from 'reactflow';
import { CodeGenPanel } from './components/Tools/CodeGenPanel';
import { ToolsPanel } from './components/Tools/ToolsPanel';
import { ConverterPanel } from './components/Converter/ConverterPanel';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { HelpPanel } from './components/Help/HelpPanel';
import { ShortcutOverlay } from './components/Help/ShortcutOverlay';
import { SchemaPanel } from './components/Tools/SchemaPanel';
import { AboutModal } from './components/About/AboutModal';
import { formatJsonPath, getValueByPath, updateValueByPath } from './utils/jsonUtils';
import { createLineDiffPreview } from './utils/contentDiff';
import {
  addDocuments,
  createDocument,
  createActiveDocumentSnapshot,
  createWorkspace,
  getActiveDocument,
  getActiveDocumentSnapshot,
  resetActiveDocument,
  restoreActiveDocumentSnapshot,
  setActiveDocument,
  updateActiveDocumentContent,
  WorkspaceDocument,
} from './utils/documentWorkspace';

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

const inferFormatFromName = (name: string): FileFormat => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['yaml', 'yml'].includes(ext || '')) return 'yaml';
  if (ext === 'xml') return 'xml';
  if (ext === 'toml') return 'toml';
  if (ext === 'csv') return 'csv';
  return 'json';
};

const getFileName = (path: string) => path.split(/[\\/]/).pop() || path;

const stripKnownExtension = (name: string) => name.replace(/\.(json|yaml|yml|xml|toml|csv)$/i, '');

const sanitizeFileSegment = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'snapshot';

const getSnapshotExtension = (format: FileFormat) => format === 'yaml' ? 'yaml' : format;

const getPathFileSegment = (path: (string | number)[]) => (
  path.length === 0
    ? 'root'
    : path.map(segment => String(segment).replace(/^\[(\d+)\]$/, '$1')).join('-')
);

const readDroppedFileContent = (file: File): Promise<string> => {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
};

const createInitialWorkspace = () => addDocuments(
  createWorkspace(),
  [
    createDocument({
      id: 'sample-json',
      name: 'Sample JSON',
      content: SAMPLE_JSON,
      format: 'json',
    })
  ]
);

function App() {
  const [activeTab, setActiveTab] = useState('visualizer');
  const [workspace, setWorkspace] = useState(createInitialWorkspace);
  const [graphData, setGraphData] = useState<{ nodes: Node[], edges: Edge[], truncated?: boolean }>({ nodes: [], edges: [] });
  const [error, setError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isGraphStale, setIsGraphStale] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const activeDocument = useMemo(() => getActiveDocument(workspace), [workspace]);
  const content = activeDocument?.currentContent ?? '';
  const format = activeDocument?.format ?? 'json';
  const isDirty = activeDocument?.dirty ?? false;
  const diffPreview = useMemo(() => {
    if (!activeDocument) return 'No changes';
    return createLineDiffPreview(activeDocument.originalContent, activeDocument.currentContent);
  }, [activeDocument]);

  // Use refs for handlers that need latest state without re-triggering effects
  const contentRef = useRef(content);
  const formatRef = useRef(format);
  const activeDocumentRef = useRef(activeDocument);

  useLayoutEffect(() => {
    contentRef.current = content;
    formatRef.current = format;
    activeDocumentRef.current = activeDocument;
  }, [activeDocument, content, format]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setShowShortcuts(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
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
      setWorkspace(currentWorkspace => updateActiveDocumentContent(currentWorkspace, value));
    }
  }, []);

  const handleFormatChange = useCallback((value: string) => {
    const nextFormat = value as FileFormat;
    setWorkspace(currentWorkspace => ({
      ...currentWorkspace,
      documents: currentWorkspace.documents.map(document => {
        if (document.id !== currentWorkspace.activeDocumentId) return document;
        return { ...document, format: nextFormat };
      })
    }));
  }, []);

  const addImportedDocuments = useCallback((documents: WorkspaceDocument[]) => {
    if (documents.length === 0) return;

    setWorkspace(currentWorkspace => {
      const updatedWorkspace = addDocuments(currentWorkspace, documents);
      return setActiveDocument(updatedWorkspace, documents[0].id);
    });
    setActiveTab('visualizer');
    setError(null);
  }, []);

  useEffect(() => {
    setIsGraphStale(true);
  }, [content, format]);

  useEffect(() => {
    setSelectedNode(null);
  }, [activeDocument?.id, format]);

  useEffect(() => {
    const updateGraph = async () => {
      if (activeTab !== 'visualizer' || !isGraphStale) return;

      try {
        let parsedData;
        try {
          let currentFormat = format;
          if (content.trim().startsWith('<')) currentFormat = 'xml';

          if (window.__TAURI__) {
            parsedData = await tauriApi.parseContent(content, currentFormat);
          } else {
            parsedData = JSON.parse(content);
          }
        } catch (e: any) {
          setError(e.toString());
          return;
        }

        const result = jsonToGraph(parsedData);
        setGraphData(result);
        setIsGraphStale(false);
        setError(null);
      } catch (err: any) {
        console.error("Graph update error:", err);
        setError(err.message);
      }
    };

    const debounceId = setTimeout(updateGraph, 300);
    return () => clearTimeout(debounceId);
  }, [content, format, activeTab, isGraphStale]);

  const handleOpenFile = useCallback(async () => {
    try {
      const result = await tauriApi.openFile();
      if (result) {
        addImportedDocuments([
          createDocument({
            name: getFileName(result.path),
            content: result.content,
            format: result.format,
            sourcePath: result.path,
          })
        ]);
        if (window.__TAURI__) {
          await tauriApi.addRecentFile(result.path);
        }
      }
    } catch (e: any) {
      console.error(e);
      setError("Failed to open file: " + e.message);
    }
  }, [addImportedDocuments]);

  const handleSaveFile = useCallback(async () => {
    try {
      const currentContent = contentRef.current;
      const currentDocument = activeDocumentRef.current;
      const filename = currentDocument?.name.endsWith('.json')
        ? currentDocument.name
        : `${currentDocument?.name || 'document'}.json`;

      if (!window.__TAURI__) {
        download(currentContent, filename, 'application/json');
        return;
      }

      const path = await tauriApi.saveFile(currentContent, filename);
      if (path && window.__TAURI__) {
        await tauriApi.showNotification("File Saved", `Successfully saved to ${path}`);
      }
    } catch (e: any) {
      console.error(e);
      setError("Failed to save file: " + e.message);
    }
  }, []);

  const handleCreateSnapshot = useCallback((name?: string) => {
    setWorkspace(currentWorkspace => createActiveDocumentSnapshot(currentWorkspace, { name }));
  }, []);

  const handleRestoreSnapshot = useCallback((snapshotId: string) => {
    setWorkspace(currentWorkspace => restoreActiveDocumentSnapshot(currentWorkspace, snapshotId));
    setError(null);
  }, []);

  const handleExportSnapshot = useCallback(async (snapshotId: string) => {
    try {
      const snapshot = getActiveDocumentSnapshot(workspace, snapshotId);
      const currentDocument = activeDocumentRef.current;
      if (!snapshot || !currentDocument) return;

      const baseName = stripKnownExtension(currentDocument.name);
      const filename = `${baseName}-${sanitizeFileSegment(snapshot.name)}.${getSnapshotExtension(snapshot.format)}`;
      const mimeType = snapshot.format === 'json' ? 'application/json' : 'text/plain';

      if (!window.__TAURI__) {
        download(snapshot.content, filename, mimeType);
        return;
      }

      const path = await tauriApi.saveFile(snapshot.content, filename);
      if (path && window.__TAURI__) {
        await tauriApi.showNotification("Snapshot Exported", `Successfully saved to ${path}`);
      }
    } catch (e: any) {
      console.error(e);
      setError("Failed to export snapshot: " + e.message);
    }
  }, [workspace]);

  const handleNodeUpdate = useCallback((path: (string | number)[], newValue: any) => {
    try {
      if (format !== 'json') {
        setError("Graph editing is currently only supported for JSON format.");
        return;
      }
      const data = JSON.parse(contentRef.current);
      const updatedData = updateValueByPath(data, path, newValue);
      setWorkspace(currentWorkspace => updateActiveDocumentContent(currentWorkspace, JSON.stringify(updatedData, null, 2)));
      setSelectedNode(currentNode => {
        if (!currentNode) return currentNode;
        return {
          ...currentNode,
          data: {
            ...currentNode.data,
            value: newValue,
          },
        };
      });
    } catch (e: any) {
      console.error("Node update error:", e);
      setError("Failed to update JSON from graph: " + e.message);
    }
  }, [format]);

  const getSelectedJsonSubtree = useCallback((path: (string | number)[]) => {
    if (formatRef.current !== 'json') {
      throw new Error('Subtree actions are currently only supported for JSON documents.');
    }

    const data = JSON.parse(contentRef.current);
    return getValueByPath(data, path);
  }, []);

  const handleCopyNodePath = useCallback(async (path: (string | number)[]) => {
    try {
      await navigator.clipboard.writeText(formatJsonPath(path));
      setError(null);
    } catch (e: any) {
      console.error("Path copy error:", e);
      setError("Failed to copy JSON path: " + e.message);
    }
  }, []);

  const handleCopyNodeSubtree = useCallback(async (path: (string | number)[]) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(getSelectedJsonSubtree(path), null, 2));
      setError(null);
    } catch (e: any) {
      console.error("Subtree copy error:", e);
      setError("Failed to copy subtree: " + e.message);
    }
  }, [getSelectedJsonSubtree]);

  const handleExportNodeSubtree = useCallback(async (path: (string | number)[]) => {
    try {
      const currentDocument = activeDocumentRef.current;
      if (!currentDocument) return;

      const subtreeContent = JSON.stringify(getSelectedJsonSubtree(path), null, 2);
      const filename = `${stripKnownExtension(currentDocument.name)}-${sanitizeFileSegment(getPathFileSegment(path))}.json`;

      if (!window.__TAURI__) {
        download(subtreeContent, filename, 'application/json');
        return;
      }

      const savedPath = await tauriApi.saveFile(subtreeContent, filename);
      if (savedPath && window.__TAURI__) {
        await tauriApi.showNotification("Subtree Exported", `Successfully saved to ${savedPath}`);
      }
    } catch (e: any) {
      console.error("Subtree export error:", e);
      setError("Failed to export subtree: " + e.message);
    }
  }, [getSelectedJsonSubtree]);

  const handleMinify = () => {
    try {
      if (format === 'json') {
        const minified = JSON.stringify(JSON.parse(content));
        setWorkspace(currentWorkspace => updateActiveDocumentContent(currentWorkspace, minified));
      } else {
        const minified = content.split('\n').map(l => l.trim()).filter(l => l).join(' ');
        setWorkspace(currentWorkspace => updateActiveDocumentContent(currentWorkspace, minified));
      }
    } catch (e: any) {
      setError("Minify error: " + e.message);
    }
  };

  const handleLoadFilePaths = useCallback(async (paths: string[]) => {
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const documents: WorkspaceDocument[] = [];

      for (const path of paths) {
        const fileContent = await readTextFile(path);
        documents.push(createDocument({
          name: getFileName(path),
          content: fileContent,
          format: inferFormatFromName(path),
          sourcePath: path,
        }));
        if (window.__TAURI__) {
          await tauriApi.addRecentFile(path);
        }
      }

      addImportedDocuments(documents);
    } catch (e: any) {
      console.error("Failed to load path:", e);
      setError("Failed to load recent file: " + e.message);
    }
  }, [addImportedDocuments]);

  const handleLoadFilePath = useCallback(async (path: string) => {
    await handleLoadFilePaths([path]);
  }, [handleLoadFilePaths]);

  const handleDropFiles = useCallback(async (files: FileList) => {
    try {
      const documents = await Promise.all(
        Array.from(files).map(async file => createDocument({
          name: file.name,
          content: await readDroppedFileContent(file),
          format: inferFormatFromName(file.name),
        }))
      );

      addImportedDocuments(documents);
    } catch (e: any) {
      console.error("Failed to import dropped files:", e);
      setError("Failed to import dropped files: " + e.message);
    }
  }, [addImportedDocuments]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);

    if (event.dataTransfer.files.length > 0) {
      handleDropFiles(event.dataTransfer.files);
    }
  }, [handleDropFiles]);

  const handleResetActiveDocument = useCallback(() => {
    setWorkspace(currentWorkspace => resetActiveDocument(currentWorkspace));
    setError(null);
  }, []);

  useEffect(() => {
    let unlisten: Promise<any[]>;
    let unlistenDrop: Promise<any>;

    const setupListeners = async () => {
      if (window.__TAURI__) {
        const { listen } = await import('@tauri-apps/api/event');
        unlisten = Promise.all([
          listen('menu-open', () => handleOpenFile()),
          listen('menu-save', () => handleSaveFile()),
          listen('menu-export', () => {
            window.dispatchEvent(new CustomEvent('trigger-graph-export'));
          }),
          listen('menu-recent-open', (event: any) => {
            handleLoadFilePath(event.payload);
          })
        ]);

        unlistenDrop = listen('tauri://drag-drop', async (event: any) => {
          const paths = event.payload.paths as string[];
          if (paths && paths.length > 0) {
            handleLoadFilePaths(paths);
          }
        });
      }
    };

    setupListeners();
    return () => {
      if (unlisten) unlisten.then((fns: any[]) => fns.forEach(fn => fn()));
      if (unlistenDrop) unlistenDrop.then((fn: any) => fn());
    };
  }, [handleOpenFile, handleSaveFile, handleLoadFilePath, handleLoadFilePaths]);

  return (
    <div
      className="flex h-screen w-screen bg-transparent overflow-hidden text-text font-sans relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 z-[90] bg-primary/10 border-2 border-primary/60 border-dashed backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
          <div className="bg-background/95 border border-primary/40 rounded-lg px-5 py-4 shadow-2xl flex items-center gap-3">
            <FileJson size={22} className="text-primary" />
            <div>
              <div className="text-sm font-semibold text-text">Drop files to import</div>
              <div className="text-xs text-muted">JSON files stay in memory until exported.</div>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpen={window.__TAURI__ ? handleOpenFile : undefined}
        onSave={handleSaveFile}
        onMinify={handleMinify}
        onLogoClick={() => setShowAbout(true)}
        hasUnsavedChanges={isDirty}
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
              <div className="bg-background border-b border-border">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Files in memory</span>
                  <span className="text-[10px] text-muted">{workspace.documents.length}</span>
                </div>
                <div className="max-h-32 overflow-y-auto px-2 pb-2 space-y-1">
                  {workspace.documents.map(document => (
                    <button
                      key={document.id}
                      onClick={() => setWorkspace(currentWorkspace => setActiveDocument(currentWorkspace, document.id))}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${document.id === activeDocument?.id ? 'bg-primary/15 text-primary' : 'text-text/70 hover:bg-muted/10 hover:text-text'}`}
                      title={document.sourcePath || document.name}
                    >
                      <FileJson size={14} className="shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-xs">{document.name}</span>
                      {document.dirty && <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] shrink-0" title="Modified" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-surface p-2 border-b border-border flex justify-between items-center">
                <span className="text-sm font-semibold pl-2">Input</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleResetActiveDocument}
                    disabled={!isDirty}
                    className="p-1.5 rounded border border-border text-muted hover:text-text hover:bg-muted/10 disabled:opacity-40 disabled:hover:bg-transparent"
                    title="Reset active document to original"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={handleSaveFile}
                    disabled={!activeDocument}
                    className="p-1.5 rounded border border-border text-muted hover:text-text hover:bg-muted/10 disabled:opacity-40"
                    title="Export active document"
                  >
                    <Download size={14} />
                  </button>
                  <select
                    value={format}
                    onChange={(e) => handleFormatChange(e.target.value)}
                    className="bg-background border border-border rounded px-2 py-1 text-xs"
                  >
                    <option value="json">JSON</option>
                    <option value="yaml">YAML</option>
                    <option value="xml">XML</option>
                    <option value="toml">TOML</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
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
            <div className="flex-1 min-w-0 flex bg-surface">
              <div className="flex-1 min-w-0 relative">
                <GraphView
                  initialNodes={graphData.nodes}
                  initialEdges={graphData.edges}
                  isTruncated={graphData.truncated}
                  onNodeSelect={setSelectedNode}
                />
              </div>
              <div className="w-80 shrink-0 border-l border-border bg-background flex flex-col min-h-0">
                <div className="h-[42%] min-h-[240px] min-w-0">
                  <NodeInspector
                    selectedNode={selectedNode}
                    format={format}
                    onValueUpdate={handleNodeUpdate}
                    onCopyPath={handleCopyNodePath}
                    onCopySubtree={handleCopyNodeSubtree}
                    onExportSubtree={handleExportNodeSubtree}
                  />
                </div>
                <div className="flex-1 min-h-0">
                  <VersionPanel
                    document={activeDocument}
                    diffPreview={diffPreview}
                    onCreateSnapshot={handleCreateSnapshot}
                    onRestoreSnapshot={handleRestoreSnapshot}
                    onExportSnapshot={handleExportSnapshot}
                  />
                </div>
              </div>
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
          <ToolsPanel
            content={content}
            setContent={(nextContent) => setWorkspace(currentWorkspace => updateActiveDocumentContent(currentWorkspace, nextContent))}
            setFormat={handleFormatChange}
          />
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
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}

export default App;
