import React, { useState, useLayoutEffect, useRef } from 'react';
import rough from 'roughjs';

const DrawingCanvas = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [shapes, setShapes] = useState<any[]>([]);

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

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    // redraws all the shapes from the shapes array when canvas is redrawn, clearing canvas, or adding new shape
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
            const width = x - startX;
            const height = y - startY;
            const newShape = drawRect(startX, startY, width, height);

            // Add each shape to the setShapes array displayed on the canvas
            setShapes([...shapes, newShape]);
            setIsDrawing(false);
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const width = x - startX;
        const height = y - startY;

        clearCanvas();
        redrawShapes();

        // prepares the drawable object, but does not render
        const previewShape = drawRect(startX, startY, width, height);
        // preview shape is shown while the mouse is moving to provide user feedback on their drawing
        if (roughCanvasRef.current && previewShape) {
            roughCanvasRef.current.draw(previewShape);
        }
    };

    return (
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
    );
};

export default DrawingCanvas;