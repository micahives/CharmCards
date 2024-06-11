import React, { useState, useLayoutEffect, useRef } from 'react';
import rough from 'roughjs';
 
// need: selection tool (with rotation abilities?), undo/redo, pen tool, text tool, eraser, stroke and color options
const DrawingCanvas = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [shapes, setShapes] = useState<any[]>([]);
    const [currentTool, setCurrentTool] = useState<'line' | 'rectangle' | 'circle'>('rectangle');
    
    const [undoStack, setUndoStack] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);

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

    const drawCircle = (x: number, y: number, diameter: number) => {
        const rc = roughCanvasRef.current;
        if (rc) {
            return rc.generator.circle(x, y, diameter);
        }
    }

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

    const undo = () => {
        if (undoStack.length === 0) return;

        const prevState = undoStack[undoStack.length - 1];
        setRedoStack([...redoStack, shapes]);
        setShapes(prevState);
        setUndoStack(undoStack.slice(0, undoStack.length - 1));
        clearCanvas();
        redrawShapes();
    };

    const redo = () => {
        if (redoStack.length === 0) return;

        const prevRedoState = redoStack[redoStack.length - 1];
        setUndoStack([...undoStack, shapes]);
        setShapes(prevRedoState);
        setRedoStack(redoStack.slice(0, redoStack.length - 1));
        clearCanvas();
        redrawShapes();
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
            let newShape;
            if (currentTool === 'rectangle') {
                const width = x - startX;
                const height = y - startY;
                newShape = drawRect(startX, startY, width, height);

            } else if (currentTool === 'line') {
                newShape = drawLine(startX, startY, x, y);

            } else if (currentTool === 'circle') {
                // diameter from Euclidean distance formula
                const diameter = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2)) * 2;
                newShape = drawCircle(startX, startY, diameter);
            }

            if (newShape) {
                setShapes([...shapes, newShape]);
                setUndoStack([...undoStack, shapes]);
                setRedoStack([]);
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

        } else if (currentTool === 'circle') {
            const diameter = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2)) * 2;
            const previewShape = drawCircle(startX, startY, diameter);
            if (roughCanvasRef.current && previewShape) {
                roughCanvasRef.current.draw(previewShape);
            }
        }
    };

    const selectTool = (tool: 'line' | 'rectangle' | 'circle') => {
        setCurrentTool(tool);
    };

    return (
        <div>
            {/* Radio buttons for canvas tool selection */}
            <input
                type='radio'
                id='line'
                checked={currentTool === "line"}
                onChange={() => selectTool('line')}
            />
            <label htmlFor='line'>Line</label>
            <input
                type='radio'
                id='rectangle'
                checked={currentTool === "rectangle"}
                onChange={() => selectTool('rectangle')}
            />
            <label htmlFor='rectangle'>Rectangle</label>
            <input
                type='radio'
                id='circle'
                checked={currentTool === "circle"}
                onChange={() => selectTool('circle')}
            />
            <label htmlFor='line'>Circle</label>
            <button onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
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