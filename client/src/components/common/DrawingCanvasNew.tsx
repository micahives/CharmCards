import { useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { RoughGenerator } from 'roughjs/bin/generator';
// need: selection tool (with rotation abilities?), pen tool, text tool, eraser, stroke and color options

const DrawingCanvasNew = () => {
    const [tool, setTool] = useState('rectangle');
    const [action, setAction] = useState<'drawing' | 'none'>('none');
    // useRef creates a mutable reference to the canvas element that persists across renders, to directly reference the DOM
    // getElementById ran into timing issues when the 'canvas' element didn't exist in the DOM when the code ran... useRef ensures the reference is updated once element is rendered
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const roughCanvasRef = useRef<RoughCanvas | null>(null);
    const generatorRef = useRef<RoughGenerator | null>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        // '?' is the optional chaining operator, to access potentially null values
        /**
         const obj = {
            nested: {
                value: 42
            }
        };
        console.log(obj?.nested?.value); // 42
        console.log(obj?.nonExistent?.value); // undefined (no error)
         */
        if (canvas) {
            roughCanvasRef.current = rough.canvas(canvas);
            generatorRef.current = roughCanvasRef.current.generator;
        }
    }, []);

    const drawRectangle = () => {
        const rc = roughCanvasRef.current;
        const generator = generatorRef.current;

        if (rc && generator) {
            const rect = generator?.rectangle(100, 100, 200, 200);
            rc.draw(rect);
        }
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {

    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action === 'none') return;
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {

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