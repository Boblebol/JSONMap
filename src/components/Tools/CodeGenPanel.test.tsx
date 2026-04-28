import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CodeGenPanel } from './CodeGenPanel';

// Mock quicktype-core
vi.mock('quicktype-core', () => ({
    quicktype: vi.fn(({ lang }: { lang: string }) => Promise.resolve(lang === 'python'
        ? { lines: ['from dataclasses import dataclass', '', '@dataclass', 'class Root:', '    name: str'] }
        : { lines: ['interface Root {', '  name: string;', '}'] }
    )),
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

        fireEvent.click(screen.getByText('Create document'));

        expect(onCreateDocument).toHaveBeenCalledWith('from dataclasses import dataclass\n\n@dataclass\nclass Root:\n    name: str', {
            format: 'python',
            name: 'payload.py',
        });
    });
});
