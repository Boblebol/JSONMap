import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Edge, Node } from 'reactflow';
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
        default: ({ nodes, edges, children, onInit, onNodeClick }: any) => {
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
                            data-hidden={node.hidden ? 'true' : 'false'}
                            onClick={(event) => onNodeClick?.(event, node)}
                        >
                            {String(node.data.label)}
                        </button>
                    ))}
                    {edges.map((edge: Edge) => (
                        <span
                            key={edge.id}
                            data-testid={`edge-${edge.id}`}
                            data-hidden={edge.hidden ? 'true' : 'false'}
                        />
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

const branchNodes = [
    {
        id: 'root',
        data: { label: '{}', type: 'object', path: [], value: {} },
        position: { x: 0, y: 0 },
    },
    {
        id: 'child',
        data: { label: 'profile', type: 'object', path: ['profile'], value: {} },
        position: { x: 100, y: 0 },
    },
    {
        id: 'leaf',
        data: { label: 'email: a@example.com', type: 'string', path: ['profile', 'email'], value: 'a@example.com' },
        position: { x: 200, y: 0 },
    },
] as Node[];

const branchEdges = [
    { id: 'root-child', source: 'root', target: 'child' },
    { id: 'child-leaf', source: 'child', target: 'leaf' },
] as Edge[];

const deferredNodes = [
    {
        id: 'root',
        data: { label: '{}', type: 'object', path: [], value: undefined },
        position: { x: 0, y: 0 },
    },
    {
        id: 'users',
        data: {
            label: 'users []',
            type: 'array',
            path: ['users'],
            value: undefined,
            hasDeferredChildren: true,
        },
        position: { x: 100, y: 0 },
    },
] as Node[];

describe('GraphView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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

    it('collapses and expands the selected branch', () => {
        render(
            <GraphView
                initialNodes={branchNodes}
                initialEdges={branchEdges}
            />
        );

        fireEvent.click(screen.getByTestId('node-root'));
        fireEvent.click(screen.getByLabelText('Collapse selected branch'));

        expect(screen.getByTestId('node-child')).toHaveAttribute('data-hidden', 'true');
        expect(screen.getByTestId('node-leaf')).toHaveAttribute('data-hidden', 'true');
        expect(screen.getByTestId('edge-root-child')).toHaveAttribute('data-hidden', 'true');
        expect(screen.getByTestId('edge-child-leaf')).toHaveAttribute('data-hidden', 'true');

        fireEvent.click(screen.getByLabelText('Expand selected branch'));

        expect(screen.getByTestId('node-child')).toHaveAttribute('data-hidden', 'false');
        expect(screen.getByTestId('node-leaf')).toHaveAttribute('data-hidden', 'false');
        expect(screen.getByTestId('edge-root-child')).toHaveAttribute('data-hidden', 'false');
        expect(screen.getByTestId('edge-child-leaf')).toHaveAttribute('data-hidden', 'false');
    });

    it('loads deferred branches from the selected node', () => {
        const onExpandNode = vi.fn();

        render(
            <GraphView
                initialNodes={deferredNodes}
                initialEdges={[{ id: 'root-users', source: 'root', target: 'users' }]}
                isProcessing
                isLargeFileMode
                deferredCount={1}
                onExpandNode={onExpandNode}
            />
        );

        expect(screen.getByText('Processing')).toBeInTheDocument();
        expect(screen.getByText('Large-file mode')).toBeInTheDocument();
        expect(screen.getByText('Deferred: 1')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('node-users'));
        fireEvent.click(screen.getByLabelText('Load selected branch'));

        expect(onExpandNode).toHaveBeenCalledWith(expect.objectContaining({ id: 'users' }));
    });
});
