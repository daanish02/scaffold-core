import { Mafs, Coordinates, MovablePoint, Vector, Text, Theme, vec } from "mafs";
import "mafs/core.css";
import { useState } from "react";

export interface VectorVizProps {
  initialPoint?: [number, number];
  extent?: number;
}

/** Draggable vector from the origin, with a live length readout. */
export default function VectorViz({ initialPoint = [3, 2], extent = 6 }: VectorVizProps) {
  const [point, setPoint] = useState<[number, number]>(initialPoint);
  const length = vec.mag(point);

  return (
    <div className="demo">
      <div className="demo-header">
        <span>Interactive · Vector</span>
        <span>drag the point</span>
      </div>
      <div className="demo-body">
        <Mafs viewBox={{ x: [-extent, extent], y: [-extent, extent] }}>
          <Coordinates.Cartesian />
          <Vector tip={point} color={Theme.blue} />
          <MovablePoint point={point} color={Theme.blue} onMove={setPoint} />
          <Text x={point[0]} y={point[1]} attach="ne" color={Theme.blue}>
            {`(${point[0].toFixed(1)}, ${point[1].toFixed(1)})`}
          </Text>
        </Mafs>
        <div className="demo-note">
          <code>
            v&#8407; = ({point[0].toFixed(2)}, {point[1].toFixed(2)})
          </code>
          , <code>‖v&#8407;‖ = {length.toFixed(2)}</code>
        </div>
      </div>
    </div>
  );
}
