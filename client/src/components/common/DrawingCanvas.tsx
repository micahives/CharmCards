import React, { useEffect } from 'react';
import rough from 'roughjs';

const DrawingCanvas = () => {

    useEffect(() => {
        const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
        const rc = rough.canvas(canvasElement);
        rc.rectangle(200, 200, 400, 400); // x, y, width, height
    }, []) // empty array: dependency array, the effect runs only once after the initial render vs. no array: effect runs after each render

    const handleMouseDown = () => {
        console.log('Mouse was pressed down');
    };

    const handleMouseUp = () => {
        console.log('Mouse was released');
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        console.log('Mouse position:', event.clientX, event.clientY);
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