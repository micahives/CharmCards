import { RoughGenerator } from "roughjs/bin/generator";

export interface Shape {
    id: string;
    type: 'line' | 'rectangle' | 'circle';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    shape: any; // rough.js shape object
}

export const isWithinShape = (x: number, y: number, shape: Shape): boolean => {
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

export const getShapeAtPosition = (x: number, y: number, shapes: Shape[]): Shape | undefined => {
    return shapes.find(shape => isWithinShape(x, y, shape));
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

    const rotateNode = {
        x: (x1 + x2) / 2,
        y: y1 - 20,
        type: 'rotate'
    };

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

    // Draw rotate node
    context.beginPath();
    context.arc(rotateNode.x, rotateNode.y, halfNodeSize, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
};

export const getClickedNode = (x: number, y: number, shape: Shape) => {
    const nodes = [
        { x: shape.x1, y: shape.y1, key: 'x1' },
        { x: shape.x2, y: shape.y1, key: 'x2' },
        { x: shape.x1, y: shape.y2, key: 'x1' },
        { x: shape.x2, y: shape.y2, key: 'x2' }
    ];

    const rotateNode = {
        x: (shape.x1 + shape.x2) / 2,
        y: shape.y1 - 20,
        type: 'rotate'
    };

    for (const node of nodes) {
        if (Math.abs(x - node.x) < 8 && Math.abs(y - node.y) < 8) {
            return node;
        }
    }

    if (Math.abs(x - rotateNode.x) < 8 && Math.abs(y - rotateNode.y) < 8) {
        return rotateNode;
    }

    return null;
};

export const calculateRotationAngle = (startX: number, startY: number, x: number, y: number, shape: Shape) => {
    const centerX = (shape.x1 + shape.x2) / 2;
    const centerY = (shape.y1 + shape.y2) / 2;

    const angle1 = Math.atan2(startY - centerY, startX - centerX);
    const angle2 = Math.atan2(y - centerY, x - centerX);

    return angle2 - angle1;
};

export const applyRotation = (shape: Shape, angle: number, generator: RoughGenerator) => {
    // Calculate new coordinates after rotation
    const centerX = (shape.x1 + shape.x2) / 2;
    const centerY = (shape.y1 + shape.y2) / 2;

    const rotatePoint = (x: number, y: number) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const originalAngle = Math.atan2(dy, dx);
        const newAngle = originalAngle + angle;

        return {
            x: centerX + distance * Math.cos(newAngle),
            y: centerY + distance * Math.sin(newAngle)
        };
    };

    const newCoords1 = rotatePoint(shape.x1, shape.y1);
    const newCoords2 = rotatePoint(shape.x2, shape.y2);

    // Return updated shape object with new coordinates
    return {
        ...shape,
        x1: newCoords1.x,
        y1: newCoords1.y,
        x2: newCoords2.x,
        y2: newCoords2.y,
        shape: regenerateShape(shape.type, newCoords1.x, newCoords1.y, newCoords2.x, newCoords2.y, generator)
    };
};

export const regenerateShape = (type: string, x1: number, y1: number, x2: number, y2: number, generator: RoughGenerator) => {
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