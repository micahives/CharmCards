import React, { useState, useEffect } from 'react';
import rough from 'roughjs';

const DrawingCanvas = () => {
    // state to determine if the user is in 'drawing mode'
    const [isDrawing, setIsDrawing] = useState(false); // default state is that the user is not drawing anything
    const [startX, setStartX] = useState(0); // default coordinate for the starting (x) position
    const [startY, setStartY] = useState(0);
    const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number; } | null>(null);

    useEffect(() => {
        if (rect) {
            const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
            const rc = rough.canvas(canvasElement);
            const ctx = canvasElement.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                rc.rectangle(rect.x, rect.y, rect.width, rect.height)
            }
        }
    }, [rect]);

    const drawRect = (x: number, y: number, width: number, height: number) => {
        const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
        const rc = rough.canvas(canvasElement);
        rc.rectangle(x, y, width, height);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        console.log('Mouse was pressed down', event.clientX, event.clientY);
        setStartX(event.clientX);
        setStartY(event.clientY);
        setIsDrawing(true);
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        console.log('Mouse was released', event.clientX, event.clientY);
        if (isDrawing && rect) {
            const { x, y, width, height } = rect;
            drawRect(x, y, width, height);
            setIsDrawing(false);
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        console.log('Mouse position:', event.clientX, event.clientY);
        if (!isDrawing) return;

        const x = event.clientX;
        const y = event.clientY;
        const width = x - startX;
        const height = y - startY;

        setRect({ x: startX, y: startY, width, height });

    };

    return (
        <canvas 
            id="canvas" 
            style={{backgroundColor: 'white'}} 
            width={1500} 
            height={innerHeight}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            >Drawing canvas
        </canvas>
    )
}

export default DrawingCanvas;