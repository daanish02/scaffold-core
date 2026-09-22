import { Mafs, Coordinates, MovablePoint, Theme } from "mafs";
import "mafs/core.css";
import { useState } from "react";

export interface DraggableGeometryProps {
  /** Initial draggable point positions. */
  initialPoints?: [number, number][];
  /** Viewport half-extent in each direction, e.g. 8 shows [-8, 8]. */
  extent?: number;
}

/**
 * A thin Mafs wrapper for draggable-point geometry demos — the shared
 * primitive that concept-specific interactives (e.g. vector addition,
 * conic sections) build on.
 */
export default function DraggableGeometry({
  initialPoints = [
    [1, 1],
    [-2, 1],
  ],
  extent = 6,
}: DraggableGeometryProps) {
  const [points, setPoints] = useState(initialPoints);

  return (
    <Mafs viewBox={{ x: [-extent, extent], y: [-extent, extent] }}>
      <Coordinates.Cartesian />
      {points.map(([x, y], i) => (
        <MovablePoint
          key={i}
          point={[x, y]}
          color={Theme.blue}
          onMove={([nx, ny]: [number, number]) => {
            setPoints((prev) => prev.map((p, j) => (j === i ? [nx, ny] : p)));
          }}
        />
      ))}
    </Mafs>
  );
}
