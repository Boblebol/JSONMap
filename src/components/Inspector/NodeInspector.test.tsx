import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NodeInspector } from './NodeInspector';

const selectedStringNode = {
    id: 'n_1',
    data: {
        label: 'name: JSONMap',
        path: ['name'],
        type: 'string',
        value: 'JSONMap',
    },
} as any;

describe('NodeInspector', () => {
    it('renders an empty state when no node is selected', () => {
        render(<NodeInspector selectedNode={null} format="json" onValueUpdate={() => { }} />);

        expect(screen.getByText('Select a node')).toBeInTheDocument();
    });

    it('shows selected node details and breadcrumb path', () => {
        render(<NodeInspector selectedNode={selectedStringNode} format="json" onValueUpdate={() => { }} />);

        expect(screen.getAllByText('name')).toHaveLength(2);
        expect(screen.getByText('string')).toBeInTheDocument();
        expect(screen.getByDisplayValue('JSONMap')).toBeInTheDocument();
    });

    it('updates scalar JSON values through the inspector', () => {
        const onValueUpdate = vi.fn();

        render(<NodeInspector selectedNode={selectedStringNode} format="json" onValueUpdate={onValueUpdate} />);

        fireEvent.change(screen.getByLabelText('Node value'), { target: { value: 'Updated' } });
        fireEvent.click(screen.getByText('Apply'));

        expect(onValueUpdate).toHaveBeenCalledWith(['name'], 'Updated');
    });

    it('offers developer actions for the selected JSON path and subtree', () => {
        const onCopyPath = vi.fn();
        const onCopySubtree = vi.fn();
        const onExportSubtree = vi.fn();
        const selectedObjectNode = {
            id: 'n_2',
            data: {
                label: 'settings',
                path: ['settings'],
                type: 'object',
                value: { theme: 'dark' },
            },
        } as any;

        render(
            <NodeInspector
                selectedNode={selectedObjectNode}
                format="json"
                onValueUpdate={() => { }}
                onCopyPath={onCopyPath}
                onCopySubtree={onCopySubtree}
                onExportSubtree={onExportSubtree}
            />
        );

        fireEvent.click(screen.getByText('Copy path'));
        fireEvent.click(screen.getByText('Copy subtree'));
        fireEvent.click(screen.getByText('Export subtree'));

        expect(onCopyPath).toHaveBeenCalledWith(['settings']);
        expect(onCopySubtree).toHaveBeenCalledWith(['settings']);
        expect(onExportSubtree).toHaveBeenCalledWith(['settings']);
    });

    it('does not allow edits for non-JSON formats', () => {
        const onValueUpdate = vi.fn();

        render(<NodeInspector selectedNode={selectedStringNode} format="yaml" onValueUpdate={onValueUpdate} />);

        expect(screen.getByText('Editing is only available for JSON documents.')).toBeInTheDocument();
        expect(screen.queryByText('Apply')).not.toBeInTheDocument();
    });
});
