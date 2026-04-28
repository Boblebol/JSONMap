import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Node } from 'reactflow';
import { GraphView } from './GraphView';

const setCenter = vi.fn();

vi.mock('html-to-image', () => ({
    toPng: vi.fn(),
    toJpeg: vi.fn(),
    toSvg: vi.fn(),
}));

vi.mock('downloadjs', () => ({
    default: vi.fn(),
}));

vi.mock('reactflow', async () => {
    const React = await vi.importActual<typeof import('react')>('react');

    return {
        default: ({ nodes, children, onInit, onNodeClick }: any) => {
            React.useEffect(() => {
                onInit?.({ setCenter });
            }, [onInit]);

            return (
                <div>
                    {nodes.map((node: Node) => (
                        <button
                            key={node.id}
                            data-testid={`node-${node.id}`}
                            data-selected={node.selected ? 'true' : 'false'}
                            onClick={(event) => onNodeClick?.(event, node)}
                        >
                            {String(node.data.label)}
                        </button>
                    ))}
                    {children}
                </div>
            );
        },
        Background: () => <div />,
        Controls: () => <div />,
        Panel: ({ children }: any) => <div>{children}</div>,
        Handle: () => <div />,
        Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
        useNodesState: (initialNodes: Node[]) => {
            const [nodes, setNodes] = React.useState(initialNodes);
            return [nodes, setNodes, vi.fn()];
        },
        useEdgesState: (initialEdges: any[]) => {
            const [edges, setEdges] = React.useState(initialEdges);
            return [edges, setEdges, vi.fn()];
        },
    };
});

const graphNodes = [
    {
        id: 'root',
        data: { label: '{}', type: 'object', path: [], value: {} },
        position: { x: 0, y: 0 },
    },
    {
        id: 'email',
        data: { label: 'email: a@example.com', type: 'string', path: ['user', 'email'], value: 'a@example.com' },
        position: { x: 120, y: 40 },
    },
] as Node[];

describe('GraphView', () => {
    it('searches graph nodes and focuses the active result', () => {
        const onNodeSelect = vi.fn();

        render(
            <GraphView
                initialNodes={graphNodes}
                initialEdges={[]}
                onNodeSelect={onNodeSelect}
            />
        );

        fireEvent.change(screen.getByLabelText('Search graph nodes'), { target: { value: 'email' } });

        expect(screen.getByText('1/1')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Focus'));

        expect(onNodeSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'email' }));
        expect(setCenter).toHaveBeenCalledWith(220, 65, { zoom: 1.2, duration: 500 });
        expect(screen.getByTestId('node-email')).toHaveAttribute('data-selected', 'true');
    });
});
