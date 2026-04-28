import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeveloperToolsDrawer } from './DeveloperToolsDrawer';

describe('DeveloperToolsDrawer', () => {
    it('stays hidden when closed', () => {
        render(<DeveloperToolsDrawer isOpen={false} activeTool="visualizer" onClose={() => { }} onSelectTool={() => { }} />);

        expect(screen.queryByRole('dialog', { name: 'Developer tools' })).not.toBeInTheDocument();
    });

    it('lists advanced tools and routes selections', () => {
        const onClose = vi.fn();
        const onSelectTool = vi.fn();

        render(<DeveloperToolsDrawer isOpen activeTool="visualizer" onClose={onClose} onSelectTool={onSelectTool} />);

        expect(screen.getByRole('dialog', { name: 'Developer tools' })).toBeInTheDocument();
        expect(screen.getByText('JQ / JSONPath')).toBeInTheDocument();
        expect(screen.getByText('Converter')).toBeInTheDocument();
        expect(screen.getByText('Code Generation')).toBeInTheDocument();
        expect(screen.getByText('Schema Tools')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Code Generation'));
        expect(onSelectTool).toHaveBeenCalledWith('codegen');

        fireEvent.click(screen.getByLabelText('Close developer tools'));
        expect(onClose).toHaveBeenCalled();
    });
});
