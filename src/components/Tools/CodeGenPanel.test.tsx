import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CodeGenPanel } from './CodeGenPanel';

// Mock quicktype-core
vi.mock('quicktype-core', () => ({
    quicktype: vi.fn(() => Promise.resolve({ lines: ['interface Root {', '  name: string;', '}'] })),
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
});
