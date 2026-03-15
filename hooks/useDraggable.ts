import { useCallback, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  /** Unique key for persisting position to localStorage */
  storageKey?: string;
  /** Where to initially place the element: "top" (15px from top) or "bottom" (15px from bottom). Default: "top" */
  anchor?: "top" | "bottom";
  /** Padding from viewport edges in px */
  edgePadding?: number;
}

const STORAGE_PREFIX = "sketchbase-drag-";

function loadPosition(key?: string): Position | null {
  if (!key || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const pos = JSON.parse(raw) as Position;
    if (typeof pos.x === "number" && typeof pos.y === "number") return pos;
  } catch {
    // ignore corrupt data
  }
  return null;
}

function savePosition(key: string | undefined, pos: Position) {
  if (!key || typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(pos));
  } catch {
    // storage full or unavailable
  }
}

/**
 * Makes an element draggable via a handle.
 * Supports mouse + touch (pointer events). Clamps to viewport.
 * Persists position to localStorage when a storageKey is provided.
 */
export function useDraggable(options: UseDraggableOptions = {}) {
  const { storageKey, anchor = "top", edgePadding = 8 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(() => loadPosition(storageKey));
  const initialized = useRef(!!loadPosition(storageKey));
  const dragging = useRef(false);
  const offset = useRef<Position>({ x: 0, y: 0 });

  const clamp = useCallback(
    (pos: Position): Position => {
      if (!containerRef.current) return pos;
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: Math.max(edgePadding, Math.min(pos.x, window.innerWidth - rect.width - edgePadding)),
        y: Math.max(edgePadding, Math.min(pos.y, window.innerHeight - rect.height - edgePadding)),
      };
    },
    [edgePadding]
  );

  // On first layout: use saved position (clamped) or fall back to centered default
  useEffect(() => {
    if (initialized.current) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const id = requestAnimationFrame(() => {
      const saved = loadPosition(storageKey);
      const pos = saved
        ? clamp(saved)
        : {
            x: Math.round((window.innerWidth - rect.width) / 2),
            y: anchor === "bottom" ? window.innerHeight - rect.height - 15 : 15,
          };
      setPosition(pos);
      initialized.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [anchor, storageKey, clamp]);

  const onPointerDown = useCallback((e: PointerEvent) => {
    if (!containerRef.current) return;
    dragging.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return;
      const raw = { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y };
      setPosition(clamp(raw));
    },
    [clamp]
  );

  const onPointerUp = useCallback(() => {
    if (dragging.current) {
      dragging.current = false;
      // Persist position after drag ends
      setPosition((pos) => {
        if (pos) savePosition(storageKey, pos);
        return pos;
      });
    }
  }, [storageKey]);

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    handle.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      handle.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerDown, onPointerMove, onPointerUp]);

  useEffect(() => {
    function onResize() {
      setPosition((prev) => {
        if (!prev) return prev;
        const clamped = clamp(prev);
        savePosition(storageKey, clamped);
        return clamped;
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp, storageKey]);

  const fallbackY = anchor === "bottom" ? "calc(100vh - 60px)" : "15px";
  const style: React.CSSProperties = position
    ? { position: "fixed", left: position.x, top: position.y, zIndex: 999999 }
    : {
        position: "fixed",
        top: fallbackY,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999999,
      };

  return { containerRef, handleRef, style };
}
