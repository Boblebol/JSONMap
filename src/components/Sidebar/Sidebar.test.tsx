import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
    it('renders all navigation items', () => {
        const setActiveTab = vi.fn();
        render(<Sidebar activeTab="visualizer" setActiveTab={setActiveTab} />);

        expect(screen.getByTitle('Visualizer')).toBeInTheDocument();
        expect(screen.getByTitle('Developer Tools')).toBeInTheDocument();
        expect(screen.getByTitle('Settings')).toBeInTheDocument();

        expect(screen.queryByTitle('Code Generation')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Converter')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Schema Tools')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Tools (jq, JWT)')).not.toBeInTheDocument();
    });

    it('calls setActiveTab when a navigation item is clicked', () => {
        const setActiveTab = vi.fn();
        render(<Sidebar activeTab="visualizer" setActiveTab={setActiveTab} />);

        const helpButton = screen.getByTitle('Help & Shortcuts');
        fireEvent.click(helpButton);

        expect(setActiveTab).toHaveBeenCalledWith('help');
    });

    it('calls onDeveloperToolsToggle when developer tools is clicked', () => {
        const onDeveloperToolsToggle = vi.fn();
        render(<Sidebar activeTab="visualizer" setActiveTab={() => { }} onDeveloperToolsToggle={onDeveloperToolsToggle} />);

        fireEvent.click(screen.getByTitle('Developer Tools'));

        expect(onDeveloperToolsToggle).toHaveBeenCalled();
    });

    it('calls onOpen when open button is clicked', () => {
        const onOpen = vi.fn();
        render(<Sidebar activeTab="visualizer" setActiveTab={() => { }} onOpen={onOpen} />);

        const openButton = screen.getByTitle('Open File');
        fireEvent.click(openButton);

        expect(onOpen).toHaveBeenCalled();
    });

    it('highlights the active tab', () => {
        render(<Sidebar activeTab="help" setActiveTab={() => { }} />);

        const helpButton = screen.getByTitle('Help & Shortcuts');
        expect(helpButton.className).toContain('bg-primary');

        const visualizerButton = screen.getByTitle('Visualizer');
        expect(visualizerButton.className).not.toContain('bg-primary');
    });
});
