/**
 * COSMIC MERGE - TILE CLASS
 * Represents a single tile/planet in the game
 */

class Tile {
    constructor(value, x, y, gridX, gridY) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.gridX = gridX;
        this.gridY = gridY;
        this.size = this.getSize();
        this.color = this.getColor();
        this.emoji = this.getEmoji();
        this.velocity = { x: 0, y: 0 };
        this.isStatic = false;
        this.markedForMerge = false;
        this.id = Date.now() + Math.random();
    }

    /**
     * Get tile size based on value
     */
    getSize() {
        const baseSizes = {
            2: 40,
            4: 44,
            8: 48,
            16: 52,
            32: 56,
            64: 60,
            128: 64,
            256: 68,
            512: 72
        };
        return baseSizes[this.value] || 40;
    }

    /**
     * Get tile color based on value
     */
    getColor() {
        const colors = {
            2: '#4a4a4a',      // Gray
            4: '#2196f3',      // Blue
            8: '#ff9800',      // Orange
            16: '#ffeb3b',     // Yellow
            32: '#ffd700',     // Gold
            64: '#ff1493',     // Pink
            128: '#9c27b0',    // Purple
            256: '#673ab7',    // Violet
            512: '#00bcd4'     // Cosmic
        };
        return colors[this.value] || '#4a4a4a';
    }

    /**
     * Get emoji representation based on value
     */
    getEmoji() {
        const emojis = {
            2: '🌑',
            4: '🌍',
            8: '🪐',
            16: '⭐',
            32: '🌟',
            64: '💫',
            128: '🌌',
            256: '🌠',
            512: '🌊'
        };
        return emojis[this.value] || '🌑';
    }

    /**
     * Update tile position
     */
    update() {
        if (!this.isStatic) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }
    }

    /**
     * Render tile on canvas
     */
    render(ctx) {
        ctx.save();
        
        // Draw tile background with glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.8;
        
        const radius = this.size / 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner circle
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 0.85, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Draw emoji
        ctx.font = `${this.size * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
        
        // Draw value text (optional, for debugging)
        // ctx.font = `${this.size * 0.3}px Orbitron`;
        // ctx.fillStyle = 'white';
        // ctx.fillText(this.value, this.x, this.y + this.size * 0.4);
        
        ctx.restore();
    }

    /**
     * Check collision with another tile
     */
    collidesWith(other) {
        if (!other) return false;
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (this.size + other.size) / 2;
        return distance < minDistance;
    }

    /**
     * Check if tile can merge with another
     */
    canMergeWith(other) {
        return this.value === other.value && 
               !this.markedForMerge && 
               !other.markedForMerge;
    }

    /**
     * Merge with another tile
     */
    merge(other) {
        this.value *= 2;
        this.size = this.getSize();
        this.color = this.getColor();
        this.emoji = this.getEmoji();
        this.markedForMerge = false;
        return this.value;
    }

    /**
     * Clone tile
     */
    clone() {
        const cloned = new Tile(this.value, this.x, this.y, this.gridX, this.gridY);
        cloned.velocity = { ...this.velocity };
        cloned.isStatic = this.isStatic;
        return cloned;
    }

    /**
     * Serialize tile for storage
     */
    toJSON() {
        return {
            value: this.value,
            gridX: this.gridX,
            gridY: this.gridY,
            isStatic: this.isStatic
        };
    }

    /**
     * Deserialize tile from JSON
     */
    static fromJSON(data, cellSize, offsetX, offsetY) {
        const x = offsetX + data.gridX * cellSize + cellSize / 2;
        const y = offsetY + data.gridY * cellSize + cellSize / 2;
        const tile = new Tile(data.value, x, y, data.gridX, data.gridY);
        tile.isStatic = data.isStatic;
        return tile;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tile;
}
