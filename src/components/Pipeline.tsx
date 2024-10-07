import { MutableRefObject, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  MarkerType,
  NodeDragHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { WebsocketClient } from '../utils/websocket';

export type PipelineProps = {
  webSocket: MutableRefObject<WebsocketClient | null>;
};

const Pipeline = ({ webSocket: ws }: PipelineProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [dashOffset, setDashOffset] = useState(0);

  const onConnect = async (params: Edge | Connection) => {
    const newEdge = {
      ...params,
      markerEnd: { type: MarkerType.Arrow },
      style: { stroke: 'black', strokeWidth: 2, strokeDasharray: '5,5', strokeDashoffset: dashOffset },
    };
    setEdges((eds) => addEdge(newEdge, eds));

    await createOrUpdatePipelineWithEdges(newEdge);
  };

  const onEdgeSelect = (event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation(); // Prevent other click events from triggering
    setSelectedEdge(edge); // Set the selected edge
  };

  const createOrUpdatePipelineWithEdges = async (newEdge: Edge) => {
    try {
      await axios.post('http://localhost:4000/api/pipelines', {
        name: `Pipeline ${newEdge.target}`,
        sourceNodeId: newEdge.source,
        targetNodeId: newEdge.target,
      });
    } catch (err) {
      console.error('Error updating pipeline with new edge', err);
    }
  };

  const updatePipelineAfterEdgeDeletion = async () => {
    if (ws.current && ws.current.websocketInstance!.readyState === WebSocket.OPEN) {
      ws.current.send({ type: 'DELETE_EDGE', edgeId: selectedEdge!.id });
    }
  };
  const deleteSelectedEdge = async () => {
    if (!selectedEdge) return;

    await updatePipelineAfterEdgeDeletion();
  };

  const fetchNodeAndPipelineData = async () => {
    try {
      const pipelines = await axios.get('http://localhost:4000/api/pipelines');
      const nodesRes = await axios.get('http://localhost:4000/api/nodes');

      if (nodesRes.data) {
        const nodes = nodesRes.data; // Assuming res.data is an array of nodes
        if (nodes.length > 0) {
          const newNodes = nodes.map((node: any) => ({
            ...node,
            id: node._id,
            data: {
              label: node.deviceId.name,
            },
          }));
          setNodes(newNodes); // Update nodes state
        }
      }

      if (pipelines.data) {
        pipelines.data.map((pipeline: any) => {
          const newEdges = pipeline.connections.map((connection: any) => ({
            id: `${connection._id}`,
            source: connection.from,
            target: connection.to,
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: 'black',
              strokeWidth: 2,
              strokeDasharray: '5,5',
              strokeDashoffset: dashOffset,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed, // Add arrow to indicate direction
            },
          }));
          setEdges(newEdges); // Update edges state
        });
      }
    } catch (err) {
      console.error('Error fetching pipeline data', err);
    }
  };

  useEffect(() => {
    fetchNodeAndPipelineData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDashOffset((prevOffset) => (prevOffset - 5) % 100);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const onPaneClick = () => {
    setSelectedEdge(null);
  };

  const addNode = () => {
    const newNode = {
      deviceName: `Device ${nodes.length + 1}`,
      label: `Node ${nodes.length}`,
      position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random position
    };
    if (ws.current && ws.current.websocketInstance!.readyState === WebSocket.OPEN) {
      ws.current.send({ type: 'CREATE_NODE', node: newNode });
    }
  };

  useEffect(() => {
    ws.current?.onMessage((data: any) => {
      if (data.type === 'NODE_CREATED') {
        const { node } = data;
        setNodes((prevNodes) => [
          ...prevNodes,
          {
            ...node,
            id: node._id,
            data: {
              label: node.deviceId.name,
            },
          },
        ]);
      } else if (data.type === 'EDGE_DELETED') {
        const { edgeId } = data;
        console.log('Edge deleted:', edgeId);
        setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== edgeId));
      }
    });
  }, [ws.current]);
  const onNodeClick = (event: React.MouseEvent, node: any) => {
    setSelectedEdge(null);
  };

  const onNodeDragStop: NodeDragHandler = async (event, node, nodes) => {
    try {
      await axios.put(`http://localhost:4000/api/nodes/${node.id}`, {
        position: {
          x: node.position.x,
          y: node.position.y,
        },
      });
    } catch (err) {
      console.error('Error updating node position', err);
    }
  };

  return (
    <>
      <button
        onClick={addNode}
        className="box-content border-[1px] border-black hover:outline hover:outline-2 hover:outline-black active:outline active:outline-2 active:outline-black hover:bg-gray-200 active:bg-gray-400 my-3 bg-gray-300 text-black p-2 rounded"
      >
        Add new device
      </button>
      {selectedEdge && (
        <button
          onClick={deleteSelectedEdge}
          style={{
            background: 'red',
            color: 'white',
          }}
          className="ml-2 box-content border-[1px] border-black hover:outline hover:outline-2 hover:outline-black active:outline active:outline-2 active:outline-black hover:bg-gray-200 active:bg-gray-400 my-3 text-black p-2 rounded"
        >
          Delete Selected Edge
        </button>
      )}

      <div className="mt-4 bg-white rounded-2xl h-[400px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeSelect}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
          onPaneClick={onPaneClick}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </>
  );
};

export default Pipeline;
