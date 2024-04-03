import React from 'react';

interface CardCanvasProps {
  width: number;
  height: number;
  cornerRadius: number;
  backgroundColor: string;
}

// FC=functional component, takes CardCanvasProps as args
const CardCanvas: React.FC<CardCanvasProps> = ({
  width,
  height,
  cornerRadius,
  backgroundColor
}) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill={backgroundColor} rx={cornerRadius} ry={cornerRadius} />
    </svg>
  );
}

export default CardCanvas;
