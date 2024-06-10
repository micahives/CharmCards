import React, { useState, useLayoutEffect, useRef } from 'react';
import rough from 'roughjs';

const DrawingCanvas = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [shapes, setShapes] = useState<any[]>([]);
    const [currentTool, setCurrentTool] = useState<'line' | 'rectangle'>('rectangle');

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const roughCanvasRef = useRef<any>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            roughCanvasRef.current = rough.canvas(canvas);
        }
    }, []);

    const drawRect = (x: number, y: number, width: number, height: number) => {
        const rc = roughCanvasRef.current;
        if (rc) {
            return rc.generator.rectangle(x, y, width, height);
        }
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
        const rc = roughCanvasRef.current;
        if (rc) {
            return rc.generator.line(x1, y1, x2, y2);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const redrawShapes = () => {
        const rc = roughCanvasRef.current;
        if (rc) {
            shapes.forEach(shape => rc.draw(shape));
        }
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        // non-null assertion opperator '!', canvas will always be accessible
        // getBoundingClientRect method gets the size of the canvas relative to viewport for mouse accuracy
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setStartX(x);
        setStartY(y);
        setIsDrawing(true);
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (isDrawing) {
            if (currentTool === 'rectangle') {
                const width = x - startX;
                const height = y - startY;
                const newShape = drawRect(startX, startY, width, height);
                if (newShape) {
                    setShapes([...shapes, newShape]);
                }
            } else if (currentTool === 'line') {
                const newShape = drawLine(startX, startY, x, y);
                if (newShape) {
                    setShapes([...shapes, newShape]);
                }
            }
            setIsDrawing(false);
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        clearCanvas();
        redrawShapes();

        if (currentTool === 'rectangle') {
            const width = x - startX;
            const height = y - startY;
            const previewShape = drawRect(startX, startY, width, height);
            if (roughCanvasRef.current && previewShape) {
                roughCanvasRef.current.draw(previewShape);
            }
        } else if (currentTool === 'line') {
            const previewShape = drawLine(startX, startY, x, y);
            if (roughCanvasRef.current && previewShape) {
                roughCanvasRef.current.draw(previewShape);
            }
        }
    };

    const selectTool = (tool: 'line' | 'rectangle') => {
        setCurrentTool(tool);
    };

    return (
        <div>
            <div>
                <button onClick={() => selectTool('rectangle')}>Rectangle</button>
                <button onClick={() => selectTool('line')}>Line</button>
            </div>
            <canvas
                ref={canvasRef}
                id='canvas'
                style={{ backgroundColor: 'white' }}
                width={1500}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                Drawing canvas
            </canvas>
        </div>
    );
};

export default DrawingCanvas;