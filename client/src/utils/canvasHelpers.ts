export interface Shape {
    id: string;
    type: 'line' | 'rectangle' | 'circle';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    shape: any; // rough.js shape object
}

export const positionWithinShape = (x: number, y: number, shape: Shape): boolean => {
    const { type, x1, y1, x2, y2 } = shape;
    switch (type) {
        case 'rectangle':
            return x >= x1 && x <= x2 && y >= y1 && y <= y2;
        case 'line':
            // Check if point is near the line segment
            const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) /
                             Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
            return distance <= 5;
        case 'circle':
            // Check if point is within the circle radius
            const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const dist = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
            return dist <= radius;
        default:
            return false;
    }
};

export const getShapeAtPosition = (x: number, y: number, shapes: Shape[]): Shape | null => {
    return shapes.find(shape => positionWithinShape(x, y, shape)) || null;
};

export const resizedCoordinates = (x: number, y: number, position: string, shape: Shape) => {
    let { x1, y1, x2, y2 } = shape;

    switch (position) {
        case 'top-left':
            x1 = x;
            y1 = y;
            break;
        case 'top-right':
            x2 = x;
            y1 = y;
            break;
        case 'bottom-left':
            x1 = x;
            y2 = y;
            break;
        case 'bottom-right':
            x2 = x;
            y2 = y;
            break;
    }

    return { x1, y1, x2, y2 };
};

export const drawHighlight = (canvas: HTMLCanvasElement, shape: Shape) => {
    const context = canvas.getContext('2d');
    if (!context) return;

    context.save();
    context.strokeStyle = '#b7b5ed';
    context.lineWidth = 2;

    const offset = 4; // slight offset for the highlight

    if (shape.type === 'rectangle') {
        context.strokeRect(shape.x1 - offset, shape.y1 - offset, (shape.x2 - shape.x1) + 2 * offset, (shape.y2 - shape.y1) + 2 * offset);
        drawNodes(context, shape.x1 - offset, shape.y1 - offset, shape.x2 + offset, shape.y2 + offset);
    } else if (shape.type === 'circle') {
        const radius = Math.sqrt(Math.pow(shape.x2 - shape.x1, 2) + Math.pow(shape.y2 - shape.y1, 2));
        context.beginPath();
        context.arc(shape.x1, shape.y1, radius + offset, 0, 2 * Math.PI);
        context.stroke();
        drawNodes(context, shape.x1 - radius - offset, shape.y1 - radius - offset, shape.x1 + radius + offset, shape.y1 + radius + offset);
    } else if (shape.type === 'line') {
        context.beginPath();
        context.moveTo(shape.x1, shape.y1);
        context.lineTo(shape.x2, shape.y2);
        context.stroke();
        drawNodes(context, shape.x1, shape.y1, shape.x2, shape.y2);
    }

    context.restore();
};

export const drawNodes = (context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const nodeSize = 8;
    const halfNodeSize = nodeSize / 2;
    const radius = 2;
    
    const nodes = [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x1, y: y2 },
        { x: x2, y: y2 }
    ];

    context.strokeStyle = '#b7b5ed';
    context.fillStyle = 'white';
    context.lineWidth = 2;

    nodes.forEach(node => {
        context.beginPath();
        context.moveTo(node.x - halfNodeSize + radius, node.y - halfNodeSize);
        context.arcTo(node.x + halfNodeSize, node.y - halfNodeSize, node.x + halfNodeSize, node.y + halfNodeSize, radius);
        context.arcTo(node.x + halfNodeSize, node.y + halfNodeSize, node.x - halfNodeSize, node.y + halfNodeSize, radius);
        context.arcTo(node.x - halfNodeSize, node.y + halfNodeSize, node.x - halfNodeSize, node.y - halfNodeSize, radius);
        context.arcTo(node.x - halfNodeSize, node.y - halfNodeSize, node.x + halfNodeSize, node.y - halfNodeSize, radius);
        context.closePath();
        context.fill();
        context.stroke();
    });
};

export const getClickedNode = (x: number, y: number, shape: Shape) => {
    const nodes = [
        { x: shape.x1 - 4, y: shape.y1 - 4, key: 'x1', position: 'top-left' },
        { x: shape.x2 + 4, y: shape.y1 - 4, key: 'x2', position: 'top-right' },
        { x: shape.x1 - 4, y: shape.y2 + 4, key: 'x1', position: 'bottom-left' },
        { x: shape.x2 + 4, y: shape.y2 + 4, key: 'x2', position: 'bottom-right' }
    ];

    const hitRadius = 15;

    for (const node of nodes) {
        if (Math.abs(x - node.x) < hitRadius && Math.abs(y - node.y) < hitRadius) {
            return node;
        }
    }

    return null;
};