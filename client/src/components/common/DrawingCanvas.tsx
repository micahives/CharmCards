import React, { useState, useLayoutEffect, useRef } from 'react';
import rough from 'roughjs';

// need: selection tool (with rotation abilities?), undo/redo, pen tool, text tool, eraser, stroke and color options

interface Command {
    execute(): void;
    undo(): void;
}

// Draw Command Classes
class DrawRectangleCommand implements Command {
    private rc: any;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private shapes: any[];

    constructor(rc: any, x: number, y: number, width: number, height: number, shapes: any[]) {
        this.rc = rc;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.shapes = shapes;
    }

    execute() {
        const shape = this.rc.generator.rectangle(this.x, this.y, this.width, this.height);
        this.shapes.push(shape);
    }

    undo() {
        this.shapes.pop();
    }
}

class DrawLineCommand implements Command {
    private rc: any;
    private x1: number;
    private y1: number;
    private x2: number;
    private y2: number;
    private shapes: any[];

    constructor(rc: any, x1: number, y1: number, x2: number, y2: number, shapes: any[]) {
        this.rc = rc;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.shapes = shapes;
    }

    execute() {
        const shape = this.rc.generator.line(this.x1, this.y1, this.x2, this.y2);
        this.shapes.push(shape);
    }

    undo() {
        this.shapes.pop();
    }
}

class DrawCircleCommand implements Command {
    private rc: any;
    private x: number;
    private y: number;
    private diameter: number;
    private shapes: any[];

    constructor(rc: any, x: number, y: number, diameter: number, shapes: any[]) {
        this.rc = rc;
        this.x = x;
        this.y = y;
        this.diameter = diameter;
        this.shapes = shapes;
    }

    execute() {
        const shape = this.rc.generator.circle(this.x, this.y, this.diameter);
        this.shapes.push(shape);
    }

    undo() {
        this.shapes.pop();
    }
}

const DrawingCanvas = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [shapes, setShapes] = useState<any[]>([]); // although 'setShapes' value is not directly read, shapes state is used within execute and undo methods within drawing commands
    const [currentTool, setCurrentTool] = useState<'line' | 'rectangle' | 'circle'>('rectangle');
    const [undoStack, setUndoStack] = useState<Command[]>([]);
    const [redoStack, setRedoStack] = useState<Command[]>([]);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const roughCanvasRef = useRef<any>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            roughCanvasRef.current = rough.canvas(canvas);
        }
    }, []);

    const executeCommand = (command: Command) => {
        command.execute();
        setUndoStack(prevUndoStack => [...prevUndoStack, command]);
        setRedoStack([]); // Clear the redo stack on new action
        setTimeout(() => {
            clearCanvas();
            redrawShapes();
        }, 0);
    };

    const undo = () => {
        if (undoStack.length === 0) return;

        const command = undoStack.pop();
        if (command) {
            command.undo();
            setRedoStack(prevRedoStack => [...prevRedoStack, command]);
            setTimeout(() => {
                clearCanvas();
                redrawShapes();
            }, 0);
        }
    };

    const redo = () => {
        if (redoStack.length === 0) return;

        const command = redoStack.pop();
        if (command) {
            command.execute();
            setUndoStack(prevUndoStack => [...prevUndoStack, command]);
            setTimeout(() => {
                clearCanvas();
                redrawShapes();
            }, 0);
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
            let command: Command | null = null;

            if (currentTool === 'rectangle') {
                const width = x - startX;
                const height = y - startY;
                command = new DrawRectangleCommand(roughCanvasRef.current, startX, startY, width, height, shapes);
            } else if (currentTool === 'line') {
                command = new DrawLineCommand(roughCanvasRef.current, startX, startY, x, y, shapes);
            } else if (currentTool === 'circle') {
                // diameter from Euclidean distance formula
                const diameter = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2)) * 2;
                command = new DrawCircleCommand(roughCanvasRef.current, startX, startY, diameter, shapes);
            }

            if (command) {
                executeCommand(command);
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

        let previewShape;
        if (currentTool === 'rectangle') {
            const width = x - startX;
            const height = y - startY;
            previewShape = roughCanvasRef.current.generator.rectangle(startX, startY, width, height);
        } else if (currentTool === 'line') {
            previewShape = roughCanvasRef.current.generator.line(startX, startY, x, y);
        } else if (currentTool === 'circle') {
            const diameter = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2)) * 2;
            previewShape = roughCanvasRef.current.generator.circle(startX, startY, diameter);
        }

        if (roughCanvasRef.current && previewShape) {
            roughCanvasRef.current.draw(previewShape);
        }
    };

    const selectTool = (tool: 'line' | 'rectangle' | 'circle') => {
        setCurrentTool(tool);
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

    return (
        <div>
            {/* Radio buttons for canvas tool selection */}
            <input
                type='radio'
                id='line'
                checked={currentTool === "line"}
                onChange={() => selectTool('line')}
            />
            <label htmlFor='line' className='mr-5'>Line</label>
            <input
                type='radio'
                id='rectangle'
                checked={currentTool === "rectangle"}
                onChange={() => selectTool('rectangle')}
            />
            <label htmlFor='rectangle' className='mr-5'>Rectangle</label>
            <input
                type='radio'
                id='circle'
                checked={currentTool === "circle"}
                onChange={() => selectTool('circle')}
            />
            <label htmlFor='circle' className='mr-5'>Circle</label>
            <button onClick={undo} className='mr-5'>Undo</button>
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