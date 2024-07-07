import { useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { RoughGenerator } from 'roughjs/bin/generator';
// need: selection tool (with rotation abilities?), pen tool, text tool, eraser, stroke and color options

const DrawingCanvasNew = () => {
    const [tool, setTool] = useState('rectangle');
    const [action, setAction] = useState<'drawing' | 'moving' | 'none'>('none');
    // x and y coordinate states
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    // keep track of shapes on the canvas
    const [shapes, setShapes] = useState<any[]>([]);

    // useRef creates a mutable reference to the canvas element that persists across renders, to directly reference the DOM
    // getElementById ran into timing issues when the 'canvas' element didn't exist in the DOM when the code ran... useRef ensures the reference is updated once element is rendered
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const roughCanvasRef = useRef<RoughCanvas | null>(null);
    const generatorRef = useRef<RoughGenerator | null>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            roughCanvasRef.current = rough.canvas(canvas);
            generatorRef.current = roughCanvasRef.current.generator;
        }
    }, []);

    // draws line from (x1, y1) to (x2, y2)
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
        const rc = roughCanvasRef.current;
        const generator = generatorRef.current;

        if (rc && generator) {
            const line = generator?.line(x1, y1, x2, y2);
            rc.draw(line);
            setShapes(prevShapes => [...prevShapes, line]);
        }
    };

    const drawRectangle = (x: number, y: number, width: number, height: number) => {
        const rc = roughCanvasRef.current;
        const generator = generatorRef.current;

        if (rc && generator) {
            const rect = generator?.rectangle(x, y, width, height);
            rc.draw(rect);
            setShapes(prevShapes => [...prevShapes, rect]);
        }
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        setAction('drawing');

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.cursor = tool === 'select' ? 'move' : 'crosshair';
        }

        // account for canvas offset, set x and y coordinates for starting point of drawable object (rect/line/circle)
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setStartX(x);
        setStartY(y);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action !== 'drawing') return;
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
        }

        if (roughCanvasRef.current && previewShape) {
            roughCanvasRef.current.draw(previewShape);
        }
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        setAction('none');

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (tool === 'rectangle') {
            const width = x - startX;
            const height = y - startY;
            drawRectangle(startX, startY, width, height);
        } else if (tool === 'line') {
            drawLine(startX, startY, x, y);
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
        if (rc) {
            shapes.forEach(shape => rc.draw(shape));
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