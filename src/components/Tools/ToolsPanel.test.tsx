import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToolsPanel } from './ToolsPanel';

// Mock Tauri API
vi.mock('../../utils/tauri', () => ({
    tauriApi: {
        runJq: vi.fn(),
        decodeJwt: vi.fn(),
    },
}));

describe('ToolsPanel', () => {
    it('renders commands buttons', () => {
        render(<ToolsPanel content="{}" />);
        expect(screen.getByText('JQ Query')).toBeInTheDocument();
        expect(screen.getByText('JWT Decoder')).toBeInTheDocument();
    });
});
