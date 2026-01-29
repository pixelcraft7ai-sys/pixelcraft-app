import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface Node {
  id: number;
  label: string;
  type: string;
  language: string;
  status: string;
}

interface Edge {
  id: number;
  source: number;
  target: number;
  label: string;
  type: string;
}

interface DependencyVisualizationProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId?: number;
  onSelectNode?: (id: number) => void;
}

export function DependencyVisualization({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
}: DependencyVisualizationProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Calculate node positions in a circle
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    const nodePositions = new Map<number, { x: number; y: number }>();
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      nodePositions.set(node.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    // Clear canvas
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    edges.forEach((edge) => {
      const source = nodePositions.get(edge.source);
      const target = nodePositions.get(edge.target);
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        // Draw arrow
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const angle = Math.atan2(dy, dx);
        const arrowSize = 10;

        ctx.fillStyle = "#888";
        ctx.beginPath();
        ctx.moveTo(target.x, target.y);
        ctx.lineTo(
          target.x - arrowSize * Math.cos(angle - Math.PI / 6),
          target.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          target.x - arrowSize * Math.cos(angle + Math.PI / 6),
          target.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const isSelected = selectedNodeId === node.id;
      const radius = isSelected ? 35 : 30;

      // Draw circle
      ctx.fillStyle = isSelected ? "#3b82f6" : "#6366f1";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = isSelected ? "#1e40af" : "#4f46e5";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label.substring(0, 10), pos.x, pos.y);
    });
  }, [nodes, edges, selectedNodeId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onSelectNode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate node positions again
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      const nodeX = centerX + radius * Math.cos(angle);
      const nodeY = centerY + radius * Math.sin(angle);

      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 35) {
        onSelectNode(node.id);
      }
    });
  };

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground text-sm">
          {t("editor.noInterfaces", "No interfaces created yet")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-lg border border-border">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm">
          {t("editor.dependencyGraph", "Dependency Graph")}
        </h3>
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="flex-1 cursor-pointer"
        style={{ background: "rgba(0,0,0,0.02)" }}
      />
      <div className="p-3 border-t border-border text-xs text-muted-foreground">
        {t("editor.clickToSelect", "Click nodes to select")}
      </div>
    </div>
  );
}
