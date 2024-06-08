import { useEffect } from 'react';
import rough from 'roughjs';

const DrawingCanvas = () => {
    useEffect(() => {
        const rc = rough.canvas(document.getElementById('canvas') as HTMLCanvasElement);
        rc.rectangle(10, 10, 200, 200); // x, y, width, height
    })

    return (
        <canvas id="canvas" style={{backgroundColor: 'white'}} width={1500} height={innerHeight}>

        </canvas>
    )
}

export default DrawingCanvas;