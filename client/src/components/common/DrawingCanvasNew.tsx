import { useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { RoughGenerator } from 'roughjs/bin/generator';
import { v4 as uuidv4 } from 'uuid';

// need: selection tool (with rotation abilities?), pen tool, text tool, eraser, stroke and color options, undo/redo

interface Shape {
    id: string;
    type: 'line' | 'rectangle' | 'circle';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    shape: any; // rough.js shape object
}

const DrawingCanvasNew = () => {
    const [tool, setTool] = useState('rectangle');
    const [action, setAction] = useState<'drawing' | 'moving' | 'none'>('none');
    // x and y coordinate states
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [shapes, setShapes] = useState<any[]>([]);
    const [undoStack, setUndoStack] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);

    // useRef creates a mutable reference to the canvas element that persists across renders, to directly reference the DOM
    // getElementById ran into timing issues when the 'canvas' element didn't exist in the DOM when the code ran... useRef ensures the reference is updated once element is rendered
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const roughCanvasRef = useRef<RoughCanvas | null>(null);
    const generatorRef = useRef<RoughGenerator | null>(null);

    // reference to the preview shape drawn on handleMouseMove
    const previewShapeRef = useRef<any>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            roughCanvasRef.current = rough.canvas(canvas);
            generatorRef.current = roughCanvasRef.current.generator;
        }
    }, []);

    const drawShape = (type: string, x1: number, y1: number, x2: number, y2: number) => {
        const rc = roughCanvasRef.current;
        const generator = generatorRef.current;
        const id = uuidv4();
        let shape;

        if (rc && generator) {
            switch (type) {
                case 'line':
                    shape = generator.line(x1, y1, x2, y2);
                    break;
                case 'rectangle':
                    shape = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
                    break;
                case 'circle':
                    const diameter = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 2;
                    shape = generator.circle(x1, y1, diameter);
                    break;
                default:
                    return;
            }

            rc.draw(shape);
            const newShape = { id, type, x1, y1, x2, y2, shape };
            setShapes(prevShapes => [...prevShapes, newShape]);
            setUndoStack(prevUndoStack => [...prevUndoStack, newShape]);
            setRedoStack([]);
        }
    };

    const isWithinShape = (x: number, y: number, shape: Shape): boolean => {
        const { type, x1, y1, x2, y2 } = shape;
        switch (type) {
            case 'rectangle':
                return x >= x1 && x <= x2 && y >= y1 && y <= y2;
            case 'line':
                // check if point is near the line segment
                const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) /
                                 Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
                return distance <= 5; // may be adjusted
            case 'circle':
                // check if point is near the circle radius
                const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const dist = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
                return dist <= radius;
            default:
                return false;
        }
    };

    const getShapeAtPosition = (x: number, y: number, shapes: Shape[]): Shape | undefined => {
        return shapes.find(shape => isWithinShape(x, y, shape));
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (tool === 'select') {
            const shape = getShapeAtPosition(x, y, shapes); 
            if (shape) {
                setAction('moving');
            }
        } else {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.style.cursor = tool === 'select' ? 'move' : 'crosshair';
            }
    
            // account for canvas offset, set x and y coordinates for starting point of drawable object (rect/line/circle)
            setStartX(x);
            setStartY(y);
            setAction('drawing');
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action === 'drawing') {
            const rect = canvasRef.current!.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
    
            clearCanvas();
            redrawShapes();
    
            let previewShape;
            if (tool === 'rectangle') {
                const width = x - startX;
                const height = y - startY;
                previewShape = roughCanvasRef.current!.generator.rectangle(startX, startY, width, height);
            } else if (tool === 'line') {
                previewShape = roughCanvasRef.current!.generator.line(startX, startY, x, y);
            } else if (tool === 'circle') {
                const diameter = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2)) * 2;
                previewShape = roughCanvasRef.current!.generator.circle(startX, startY, diameter)
            }
    
            if (roughCanvasRef.current && previewShape) {
                roughCanvasRef.current.draw(previewShape);
                previewShapeRef.current = previewShape; // establish reference to the preview shape to be cleared on handleMouseUp
            }
        }
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        setAction('none');

        if (previewShapeRef.current) {
            clearCanvas();
            redrawShapes();
            previewShapeRef.current = null;
        };

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        drawShape(tool, startX, startY, x, y);
    };

    const selectTool = (tool: 'line' | 'rectangle' | 'circle' | 'select') => {
        setTool(tool);
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
            // shape property within the generated Rough.js shape object
            shapes.forEach(shape => rc.draw(shape.shape));
        }
    };

    const undo = () => {
       const lastShape = shapes.pop();
       if (lastShape) {
        setRedoStack(prevRedoStack => [...prevRedoStack, lastShape]);
        setShapes([...shapes]);
        clearCanvas();
        redrawShapes();
       }
    };

    const redo = () => {
        const lastUndoneShape = redoStack.pop();
        if (lastUndoneShape) {
            setShapes(prevShapes => [...prevShapes, lastUndoneShape]);
            setUndoStack(prevUndoStack => [...prevUndoStack, lastUndoneShape]);
            clearCanvas();
            redrawShapes();
        }
    };

    return (
        <div>
            <input
                type='radio'
                id='select'
                checked={tool === "select"}
                onChange={() => selectTool('select')}
            />
            <label htmlFor='select' className='mr-5'>Select</label>
            <input
                type='radio'
                id='line'
                checked={tool === "line"}
                onChange={() => selectTool('line')}
            />
            <label htmlFor='line' className='mr-5'>Line</label>
            <input
                type='radio'
                id='rectangle'
                checked={tool === "rectangle"}
                onChange={() => selectTool('rectangle')}
            />
            <label htmlFor='rectangle' className='mr-5'>Rectangle</label>
            <input
                type='radio'
                id='circle'
                checked={tool === "circle"}
                onChange={() => selectTool('circle')}
            />
            <label htmlFor='circle' className='mr-5'>Circle</label>
            <button className='mr-5' onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>

            <canvas
                id='canvas'
                ref={canvasRef}
                style={{ backgroundColor: 'white' }}
                width={1500}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
};

export default DrawingCanvasNew;