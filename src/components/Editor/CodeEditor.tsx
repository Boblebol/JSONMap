import Editor from '@monaco-editor/react';

interface CodeEditorProps {
    value: string;
    language?: string;
    onChange?: (value: string | undefined) => void;
    readOnly?: boolean;
}

export const CodeEditor = ({ value, language = 'json', onChange, readOnly = false }: CodeEditorProps) => {
    return (
        <div className="h-full w-full border-r border-border bg-background">
            <Editor
                height="100%"
                defaultLanguage="json"
                language={language}
                value={value}
                theme="vs-dark"
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    fontFamily: "'JetBrains Mono', monospace",
                    readOnly: readOnly,
                }}
            />
        </div>
    );
};
