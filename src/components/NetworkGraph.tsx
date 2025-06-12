import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'

interface Node {
  id: number
  label: string
  group: string
  x?: number
  y?: number
}

interface Edge {
  from: number
  to: number
  label?: string
}

interface NetworkGraphProps {
  nodes: Node[]
  edges: Edge[]
}

export function NetworkGraph({ nodes, edges }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })
  const [processedNodes, setProcessedNodes] = useState<Node[]>([])

  useEffect(() => {
    // Posicionar nós em círculo
    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    const radius = Math.min(dimensions.width, dimensions.height) * 0.3

    const nodesWithPosition = nodes.map((node, index) => {
      const angle = (index * 2 * Math.PI) / nodes.length
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    })

    setProcessedNodes(nodesWithPosition)
  }, [nodes, dimensions])

  const getNodeColor = (group: string) => {
    const colors: Record<string, string> = {
      current: '#059669',
      strong: '#3b82f6',
      moderate: '#a855f7',
      party: '#f59e0b',
      coalition: '#10b981'
    }
    return colors[group] || '#6b7280'
  }

  const getNodeById = (id: number) => processedNodes.find(n => n.id === id)

  return (
    <div className="w-full h-[400px] relative">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="border rounded-lg bg-gray-50"
      >
        {/* Desenhar arestas */}
        <g className="edges">
          {edges.map((edge, index) => {
            const fromNode = getNodeById(edge.from)
            const toNode = getNodeById(edge.to)
            
            if (!fromNode || !toNode) return null

            const midX = (fromNode.x! + toNode.x!) / 2
            const midY = (fromNode.y! + toNode.y!) / 2

            return (
              <g key={index}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="hover:stroke-blue-500 transition-colors"
                />
                {edge.label && (
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 bg-white"
                    dy="-5"
                  >
                    <tspan className="bg-white px-1">{edge.label}</tspan>
                  </text>
                )}
              </g>
            )
          })}
        </g>

        {/* Desenhar nós */}
        <g className="nodes">
          {processedNodes.map((node) => (
            <g key={node.id} className="cursor-pointer hover:opacity-80 transition-opacity">
              <circle
                cx={node.x}
                cy={node.y}
                r="30"
                fill={getNodeColor(node.group)}
                stroke="#fff"
                strokeWidth="3"
              />
              <text
                x={node.x}
                y={node.y! + 45}
                textAnchor="middle"
                className="text-sm font-medium fill-gray-700"
              >
                {node.label}
              </text>
              {node.id === 1 && (
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                  dy="5"
                >
                  ATUAL
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>

      {/* Legenda */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg">
        <p className="text-xs font-medium mb-2">Legenda:</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#059669]"></div>
            <span className="text-xs">Deputado Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
            <span className="text-xs">Relação Forte</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#a855f7]"></div>
            <span className="text-xs">Relação Moderada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <span className="text-xs">Partido</span>
          </div>
        </div>
      </div>
    </div>
  )
}
