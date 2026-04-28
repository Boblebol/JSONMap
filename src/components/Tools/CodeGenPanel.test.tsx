import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { quicktype } from 'quicktype-core';
import { CodeGenPanel } from './CodeGenPanel';

// Mock quicktype-core
vi.mock('quicktype-core', () => ({
    quicktype: vi.fn(({ lang, rendererOptions }: { lang: string; rendererOptions: Record<string, string> }) => {
        if (rendererOptions['pydantic-base-model'] === 'true') {
            return Promise.resolve({ lines: ['from pydantic import BaseModel', '', 'class Root(BaseModel):', '    name: str'] });
        }

        if (lang === 'python') {
            return Promise.resolve({ lines: ['from dataclasses import dataclass', '', '@dataclass', 'class Root:', '    name: str'] });
        }

        if (lang === 'go') {
            return Promise.resolve({ lines: ['type Root struct {', '    Name string `json:"name"`', '}'] });
        }

        return Promise.resolve({ lines: ['interface Root {', '  name: string;', '}'] });
    }),
    InputData: class {
        addInput = vi.fn();
    },
    jsonInputForTargetLanguage: vi.fn().mockImplementation(() => ({
        addSource: vi.fn(),
    })),
}));

// Mock CodeEditor to avoid Monaco issues in tests
vi.mock('../Editor/CodeEditor', () => ({
    CodeEditor: ({ value }: { value: string }) => <div data-testid="code-editor">{value}</div>,
}));

describe('CodeGenPanel', () => {
    it('renders target language selector', () => {
        render(<CodeGenPanel content='{"name": "test"}' />);
        expect(screen.getByText('Target Language:')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('generates code when content is provided', async () => {
        render(<CodeGenPanel content='{"name": "test"}' />);

        await waitFor(() => {
            expect(screen.getByTestId('code-editor')).toHaveTextContent('interface Root {');
        });
    });

    it('copies code to clipboard', async () => {
        // Mock clipboard
        const writeText = vi.fn();
        Object.assign(navigator, {
            clipboard: { writeText },
        });

        render(<CodeGenPanel content='{"name": "test"}' />);

        await waitFor(() => {
            expect(screen.getByTestId('code-editor')).toHaveTextContent('interface Root {');
        });

        const copyButton = screen.getByTitle('Copy code');
        fireEvent.click(copyButton);

        expect(writeText).toHaveBeenCalled();
    });

    it('creates a TypeScript workspace document from generated code', async () => {
        const onCreateDocument = vi.fn();

        render(
            <CodeGenPanel
                content='{"items":[{"name":"test"}],"meta":{"count":1}}'
                sourceName="payload.json"
                onCreateDocument={onCreateDocument}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId('code-editor')).toHaveTextContent('interface Root {');
        });

        fireEvent.click(screen.getByText('Create document'));

        expect(onCreateDocument).toHaveBeenCalledWith('interface Root {\n  name: string;\n}', {
            format: 'typescript',
            name: 'payload.ts',
        });
    });

    it('creates a Python dataclass workspace document from generated code', async () => {
        const onCreateDocument = vi.fn();

        render(
            <CodeGenPanel
                content='{"name":"test"}'
                sourceName="payload.json"
                onCreateDocument={onCreateDocument}
            />
        );

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'python' } });

        await waitFor(() => {
            expect(screen.getByTestId('code-editor')).toHaveTextContent('@dataclass');
        });

        expect(quicktype).toHaveBeenLastCalledWith(expect.objectContaining({
            lang: 'python',
            rendererOptions: expect.objectContaining({
                'just-types': 'true',
                'python-version': '3.7',
            }),
        }));

        fireEvent.click(screen.getByText('Create document'));

        expect(onCreateDocument).toHaveBeenCalledWith('from dataclasses import dataclass\n\n@dataclass\nclass Root:\n    name: str', {
            format: 'python',
            name: 'payload.py',
        });
    });

    it('creates a Pydantic v2 workspace document from generated code', async () => {
        const onCreateDocument = vi.fn();

        render(
            <CodeGenPanel
                content='{"name":"test"}'
                sourceName="payload.json"
                onCreateDocument={onCreateDocument}
            />
        );

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pydantic' } });

        await waitFor(() => {
            expect(screen.getByTestId('code-editor')).toHaveTextContent('class Root(BaseModel):');
        });

        expect(quicktype).toHaveBeenLastCalledWith(expect.objectContaining({
            lang: 'python',
            rendererOptions: expect.objectContaining({
                'just-types': 'true',
                'pydantic-base-model': 'true',
                'python-version': '3.7',
            }),
        }));

        fireEvent.click(screen.getByText('Create document'));

        expect(onCreateDocument).toHaveBeenCalledWith('from pydantic import BaseModel\n\nclass Root(BaseModel):\n    name: str', {
            format: 'python',
            name: 'payload.pydantic.py',
        });
    });

    it('creates a Go workspace document from generated structs', async () => {
        const onCreateDocument = vi.fn();

        render(
            <CodeGenPanel
                content='{"name":"test"}'
                sourceName="payload.json"
                onCreateDocument={onCreateDocument}
            />
        );

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'go' } });

        await waitFor(() => {
            expect(screen.getByTestId('code-editor')).toHaveTextContent('type Root struct');
        });

        expect(quicktype).toHaveBeenLastCalledWith(expect.objectContaining({
            lang: 'go',
            rendererOptions: expect.objectContaining({
                'just-types': 'true',
                package: 'json_map',
            }),
        }));

        fireEvent.click(screen.getByText('Create document'));

        expect(onCreateDocument).toHaveBeenCalledWith('type Root struct {\n    Name string `json:"name"`\n}', {
            format: 'go',
            name: 'payload.go',
        });
    });
});
