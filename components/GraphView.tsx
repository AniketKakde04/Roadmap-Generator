import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { SavedRoadmap } from '../types';
import CustomStepNode from './CustomStepNode';
import CustomResourceNode from './CustomResourceNode';

interface GraphViewProps {
  roadmap: SavedRoadmap;
}

const nodeTypes = {
    customStep: CustomStepNode,
    resource: CustomResourceNode, // Register the new resource node
};

// Function to calculate positions for child resource nodes
const getResourceNodePosition = (parentNode: Node, index: number) => {
    const isEven = index % 2 === 0;
    const xOffset = 350; // Horizontal distance from parent
    const yOffset = isEven ? (index / 2) * 100 : ((index - 1) / 2) * 100 + 50;
    const yBase = parentNode.position.y - (parentNode.height || 0) / 2;
    return { x: parentNode.position.x + xOffset, y: yBase + yOffset };
};


const GraphView: React.FC<GraphViewProps> = ({ roadmap }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { fitView } = useReactFlow();

    useEffect(() => {
        const initialNodes: Node[] = [];
        const initialEdges: Edge[] = [];
        const rootNodeWidth = 320;

        initialNodes.push({
            id: 'root',
            data: { label: roadmap.title },
            position: { x: 0, y: 0 },
            type: 'input',
            style: {
                background: '#0284c7', color: 'white', fontSize: '18px',
                fontWeight: 'bold', width: rootNodeWidth, textAlign: 'center',
                padding: '15px', borderRadius: '8px',
            },
            draggable: false, // Keep the root node centered
        });

        const stepsCount = roadmap.steps.length;
        // This is the fix: Calculate a dynamic radius based on the number of steps
        // to give each node enough space and prevent overlapping.
        const radius = 250 + stepsCount * 50;

        roadmap.steps.forEach((step, index) => {
            const angle = (index / stepsCount) * 2 * Math.PI;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            initialNodes.push({
                id: `step-${index}`,
                type: 'customStep',
                position: { x, y },
                data: { step, index },
            });

            initialEdges.push({
                id: `edge-root-step-${index}`,
                source: 'root',
                target: `step-${index}`,
                style: { stroke: '#475569', strokeWidth: 2 },
            });
        });
        
        setNodes(initialNodes);
        setEdges(initialEdges);

        // Fit view after a short delay to ensure nodes are rendered
        setTimeout(() => fitView({ duration: 800 }), 100);
    }, [roadmap, fitView]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (node.type !== 'customStep') return; // Only step nodes are expandable

        const childNodeIds = node.data.step.resources.map((_: any, i: number) => `${node.id}-resource-${i}`);
        const areChildrenVisible = nodes.some(n => n.id === childNodeIds[0]);

        if (areChildrenVisible) {
            // Hide children
            setNodes((nds) => nds.filter(n => !childNodeIds.includes(n.id)));
            setEdges((eds) => eds.filter(e => e.source !== node.id));
        } else {
            // Show children
            const newResourceNodes: Node[] = node.data.step.resources.map((resource: any, index: number) => ({
                id: `${node.id}-resource-${index}`,
                type: 'resource',
                position: getResourceNodePosition(node, index),
                data: { resource },
                draggable: true,
            }));

            const newEdges: Edge[] = node.data.step.resources.map((_: any, index: number) => ({
                id: `edge-${node.id}-resource-${index}`,
                source: node.id,
                target: `${node.id}-resource-${index}`,
                style: { stroke: '#334155', strokeWidth: 1.5 },
            }));

            setNodes((nds) => [...nds, ...newResourceNodes]);
            setEdges((eds) => [...eds, ...newEdges]);
        }
    }, [nodes, setNodes, setEdges]);

    return (
        <div className="w-full h-[700px] bg-slate-900/50 border border-slate-700/50 rounded-xl p-2 animate-fadeIn">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
                proOptions={{ hideAttribution: true }}
                nodesDraggable={true} // Ensure nodes are draggable
            >
                <Controls />
                <MiniMap nodeColor="#0ea5e9" />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};

// We need to wrap GraphView in the ReactFlowProvider to use hooks like useReactFlow
const GraphViewWrapper: React.FC<GraphViewProps> = (props) => (
    <ReactFlowProvider>
        <GraphView {...props} />
    </ReactFlowProvider>
);

export default GraphViewWrapper;

