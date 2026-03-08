import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
    it('renders all navigation items', () => {
        const setActiveTab = vi.fn();
        render(<Sidebar activeTab="visualizer" setActiveTab={setActiveTab} />);

        expect(screen.getByTitle('Visualizer')).toBeInTheDocument();
        expect(screen.getByTitle('Code Generation')).toBeInTheDocument();
        expect(screen.getByTitle('Converter')).toBeInTheDocument();
        expect(screen.getByTitle('Schema Tools')).toBeInTheDocument();
        expect(screen.getByTitle('Settings')).toBeInTheDocument();
    });

    it('calls setActiveTab when a navigation item is clicked', () => {
        const setActiveTab = vi.fn();
        render(<Sidebar activeTab="visualizer" setActiveTab={setActiveTab} />);

        const codegenButton = screen.getByTitle('Code Generation');
        fireEvent.click(codegenButton);

        expect(setActiveTab).toHaveBeenCalledWith('codegen');
    });

    it('calls onOpen when open button is clicked', () => {
        const onOpen = vi.fn();
        render(<Sidebar activeTab="visualizer" setActiveTab={() => { }} onOpen={onOpen} />);

        const openButton = screen.getByTitle('Open File');
        fireEvent.click(openButton);

        expect(onOpen).toHaveBeenCalled();
    });

    it('highlights the active tab', () => {
        render(<Sidebar activeTab="codegen" setActiveTab={() => { }} />);

        const codegenButton = screen.getByTitle('Code Generation');
        expect(codegenButton.className).toContain('bg-primary');

        const visualizerButton = screen.getByTitle('Visualizer');
        expect(visualizerButton.className).not.toContain('bg-primary');
    });
});
