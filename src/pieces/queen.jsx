class Queen {
    constructor(color, position, ctx) {
        this.color = color; // 'white' or 'black'
        this.position = position; // { x, y }
        this.ctx = ctx; // Canvas rendering context
    }

    draw(tileSize) {
        const { x, y } = this.position;

        // Calculate the center of the tile
        const centerX = x * tileSize + tileSize / 2;
        const centerY = y * tileSize + tileSize / 2;

        // Radius of the hexagon
        const radius = tileSize * 0.3;

        // Calculate the coordinates of the hexagon
        const angleStep = (2 * Math.PI) / 6; // 360° divided by 6
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = angleStep * i;
            points.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            });
        }

        // Draw the hexagon
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Add a border
        this.ctx.strokeStyle = this.color === 'white' ? '#000000' : '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}

export default Queen