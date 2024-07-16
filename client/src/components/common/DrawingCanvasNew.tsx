import { useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { RoughGenerator } from 'roughjs/bin/generator';
import { v4 as uuidv4 } from 'uuid';
import { getShapeAtPosition, drawHighlight, calculateRotationAngle, applyRotation, getClickedNode } from '../../utils/canvasHelpers';

// need: selection tool with rotation abilities and highlighting the selected shape, pen tool, text tool, eraser, stroke and color options
// make the default tool 'select', but also when you're done drawing a shape (handleMouseUp), the tooling switches back to select so that 
// the hover effects are going.

const DrawingCanvasNew = () => {
    const [tool, setTool] = useState('select');
    const [action, setAction] = useState<'drawing' | 'moving' | 'rotating' | 'resizing' | 'none'>('none');
    const [startX, setStartX] = useState(0); // x and y coordinate states
    const [startY, setStartY] = useState(0);
    const [shapes, setShapes] = useState<any[]>([]);
    const [undoStack, setUndoStack] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);
    const [selectedShape, setSelectedShape] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);

    // useRef creates a mutable reference to the canvas element that persists across renders, to directly reference the DOM
    // getElementById ran into timing issues when the 'canvas' element didn't exist in the DOM when the code ran... useRef ensures the reference is updated once element is rendered
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const roughCanvasRef = useRef<RoughCanvas | null>(null);
    const generatorRef = useRef<RoughGenerator | null>(null);
    const previewShapeRef = useRef<any>(null); // reference to the preview shape drawn on handleMouseMove

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

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (tool === 'select') {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.style.cursor = tool === 'select' ? 'move' : 'move';
            }
            const shape = getShapeAtPosition(x, y, shapes); 
            if (shape) {
                setSelectedShape(shape);
                const clickedNode = getClickedNode(x, y, shape);
                if (clickedNode) {
                    setSelectedNode(clickedNode);
                    if ('type' in clickedNode) { // add type to nodeType in utils?
                        setAction(clickedNode.type === 'rotate' ? 'rotating' : 'resizing');
                    } else {
                        setAction('moving');
                    }
                } else {
                    setAction('moving');
                }
                setStartX(x);
                setStartY(y);
                clearCanvas();
                redrawShapes();
            }
        } else {
            setStartX(x);
            setStartY(y);
            setAction('drawing');
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (tool === 'select') {
            const canvas = event.target as HTMLCanvasElement;
            canvas.style.cursor = getShapeAtPosition(x, y, shapes) ? 'move' : 'default';
    
            const shape = getShapeAtPosition(x, y, shapes);
            if (shape) {
                const clickedNode = getClickedNode(x, y, shape);
                if (clickedNode) {
                    if ('position' in clickedNode) {
                        switch (clickedNode.position) {
                            case 'top-left':
                            case 'bottom-right':
                                canvas.style.cursor = 'nwse-resize';
                                break;
                            case 'top-right':
                            case 'bottom-left':
                                canvas.style.cursor = 'nesw-resize';
                                break;
                        }
                    } 
                }
            }
        }

        if (action === 'drawing') {
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
                previewShape = roughCanvasRef.current!.generator.circle(startX, startY, diameter);
            }
    
            if (roughCanvasRef.current && previewShape) {
                roughCanvasRef.current.draw(previewShape);
                previewShapeRef.current = previewShape;
            }
        } else if (action === 'moving' && selectedShape) {
            const offsetX = x - startX;
            const offsetY = y - startY;
    
            const updatedShape = {
                ...selectedShape,
                x1: selectedShape.x1 + offsetX,
                y1: selectedShape.y1 + offsetY,
                x2: selectedShape.x2 + offsetX,
                y2: selectedShape.y2 + offsetY,
                shape: regenerateShape(selectedShape.type, selectedShape.x1 + offsetX, selectedShape.y1 + offsetY, selectedShape.x2 + offsetX, selectedShape.y2 + offsetY)
            };
    
            setShapes(prevShapes =>
                prevShapes.map(shape => (shape.id === selectedShape.id ? updatedShape : shape))
            );
    
            setSelectedShape(updatedShape);
            setStartX(x);
            setStartY(y);
    
            clearCanvas();
            redrawShapes();
        }  else if (action === 'resizing' && selectedShape) {
            const updatedShape = {
                ...selectedShape,
                [selectedNode.key]: selectedNode.key === 'x1' || selectedNode.key === 'x2' ? x : y,
                shape: regenerateShape(selectedShape.type, 
                    selectedNode.key === 'x1' ? x : selectedShape.x1, 
                    selectedNode.key === 'y1' ? y : selectedShape.y1, 
                    selectedNode.key === 'x2' ? x : selectedShape.x2, 
                    selectedNode.key === 'y2' ? y : selectedShape.y2)
            };
    
            setShapes(prevShapes =>
                prevShapes.map(shape => (shape.id === selectedShape.id ? updatedShape : shape))
            );
    
            setSelectedShape(updatedShape);
            clearCanvas();
            redrawShapes();
        } else if (action === 'rotating' && selectedShape) {
            const angle = calculateRotationAngle(startX, startY, x, y, selectedShape);
            const rotatedShape = applyRotation(selectedShape, angle, roughCanvasRef.current!.generator);
    
            setShapes(prevShapes =>
                prevShapes.map(shape => (shape.id === selectedShape.id ? rotatedShape : shape))
            );
    
            setSelectedShape(rotatedShape);
            clearCanvas();
            redrawShapes();
        }
    };    
    
    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action === 'drawing') {
            setAction('none');
    
            if (previewShapeRef.current) {
                clearCanvas();
                redrawShapes();
                previewShapeRef.current = null;
            }
    
            const rect = canvasRef.current!.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
    
            drawShape(tool, startX, startY, x, y);
        } else if (action === 'moving' || action === 'resizing' || action === 'rotating') {
            setAction('none');
            // setSelectedShape(null); // need this? 
        }
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
        const canvas = canvasRef.current;
        if (rc && canvas) {
            shapes.forEach(shape => {
                rc.draw(shape.shape);
            });
            if (selectedShape && tool === 'select') {
                drawHighlight(canvas, selectedShape);
            }
        }
    };
       
    // creates a new roughjs shape object based on updated coordinates after shape movement
    const regenerateShape = (type: string, x1: number, y1: number, x2: number, y2: number) => {
        const generator = generatorRef.current;
        let shape;

        if (generator) {
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
                    return null;
            }
        }
        return shape;
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