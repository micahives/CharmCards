import { useLayoutEffect, useRef, useState } from 'react';
// need: selection tool (with rotation abilities?), pen tool, text tool, eraser, stroke and color options

const DrawingCanvasNew = () => {
    const [tool, setTool] = useState('rectangle');
    const [action, setAction] = useState<'drawing' | 'none'>('none');
    // useRef creates a mutable reference to the canvas element that persists across renders, to directly reference the DOM
    // getElementById ran into timing issues when the 'canvas' element didn't exist in the DOM when the code ran... useRef ensures the reference is updated once element is rendered
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        const ctx = canvas?.getContext('2d');

        if (ctx) {
            ctx.fillStyle = "green";
            ctx.fillRect(10, 10, 150, 100);   
        }
    }, []);

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {

    }

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action === 'none') return;
    }

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {

    }

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