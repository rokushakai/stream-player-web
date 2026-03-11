import { useCallback, useEffect, useRef } from "react";

interface ResizeSashProps {
  readonly onResize: (deltaY: number) => void;
}

export function ResizeSash({ onResize }: ResizeSashProps) {
  const dragging = useRef(false);
  const lastY = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientY - lastY.current;
      lastY.current = e.clientY;
      onResize(delta);
    },
    [onResize],
  );

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    lastY.current = e.clientY;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div
      className="h-1.5 bg-bg-panel cursor-row-resize hover:bg-accent/50 transition-colors flex-shrink-0"
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize video and panels"
      tabIndex={0}
      data-testid="resize-sash"
    />
  );
}
