class Knight {
    constructor(color, position, ctx) {
        this.color = color; 
        this.position = position;
        this.ctx = ctx; 
    }

    draw(tileSize) {
        const { x, y } = this.position;
        // Calculate the center of the tile
        const centerX = x * tileSize + tileSize / 2;
        const centerY = y * tileSize + tileSize / 2;

        // Trapezoid dimensions (adjust these for desired shape)
        const topWidth = tileSize / 2.5;
        const bottomWidth = tileSize / 1.5;
        const height = tileSize / 2;

        // Calculate trapezoid points
        const topX1 = centerX - topWidth / 2;
        const topY = centerY - height / 2;
        const topX2 = centerX + topWidth / 2;

        const bottomX1 = centerX - bottomWidth / 2;
        const bottomY = centerY + height / 2;
        const bottomX2 = centerX + bottomWidth / 2;


        // Draw the trapezoid (fill)
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.moveTo(topX1, topY);      // Top-left
        this.ctx.lineTo(topX2, topY);      // Top-right
        this.ctx.lineTo(bottomX2, bottomY);   // Bottom-right
        this.ctx.lineTo(bottomX1, bottomY);   // Bottom-left
        this.ctx.closePath();
        this.ctx.fill();

        // Add a border to the trapezoid
        this.ctx.strokeStyle = this.color === 'white' ? '#000000' : '#FFFFFF';
        this.ctx.lineWidth = 2; // Border thickness
        this.ctx.stroke();
    }
}

export default Knight;