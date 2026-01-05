/**
 * COSMIC MERGE - GRID CLASS
 * Manages the game grid and tile placement
 */

class Grid {
    constructor(canvas, size = 8) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.size = size;
        this.tiles = [];
        this.cellSize = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.gridWidth = 0;
        this.gridHeight = 0;
        
        this.calculateDimensions();
        this.initializeGrid();
    }

    /**
     * Calculate grid dimensions based on canvas size
     */
    calculateDimensions() {
        const canvasSize = Math.min(this.canvas.width, this.canvas.height);
        const padding = 40;
        this.gridWidth = canvasSize - padding * 2;
        this.gridHeight = this.gridWidth;
        this.cellSize = this.gridWidth / this.size;
        this.offsetX = (this.canvas.width - this.gridWidth) / 2;
        this.offsetY = (this.canvas.height - this.gridHeight) / 2;
    }

    /**
     * Initialize empty grid
     */
    initializeGrid() {
        this.tiles = [];
    }

    /**
     * Resize grid
     */
    resize(newSize) {
        this.size = newSize;
        this.calculateDimensions();
        this.repositionTiles();
    }

    /**
     * Reposition existing tiles after resize
     */
    repositionTiles() {
        this.tiles.forEach(tile => {
            tile.x = this.offsetX + tile.gridX * this.cellSize + this.cellSize / 2;
            tile.y = this.offsetY + tile.gridY * this.cellSize + this.cellSize / 2;
        });
    }

    /**
     * Add a new tile to the grid
     */
    addTile(tile) {
        this.tiles.push(tile);
    }

    /**
     * Remove a tile from the grid
     */
    removeTile(tile) {
        const index = this.tiles.indexOf(tile);
        if (index > -1) {
            this.tiles.splice(index, 1);
        }
    }

    /**
     * Get tile at grid position
     */
    getTileAt(gridX, gridY) {
        return this.tiles.find(tile => 
            tile.gridX === gridX && tile.gridY === gridY
        );
    }

    /**
     * Get all tiles in a column
     */
    getTilesInColumn(column) {
        return this.tiles.filter(tile => tile.gridX === column)
                        .sort((a, b) => a.gridY - b.gridY);
    }

    /**
     * Get all tiles in a row
     */
    getTilesInRow(row) {
        return this.tiles.filter(tile => tile.gridY === row)
                        .sort((a, b) => a.gridX - b.gridX);
    }

    /**
     * Check if grid position is occupied
     */
    isOccupied(gridX, gridY) {
        return this.tiles.some(tile => 
            tile.gridX === gridX && tile.gridY === gridY
        );
    }

    /**
     * Check if column is full
     */
    isColumnFull(column) {
        const tilesInColumn = this.getTilesInColumn(column);
        return tilesInColumn.length >= this.size;
    }

    /**
     * Get the highest occupied row in a column (-1 if empty)
     */
    getHighestOccupiedRow(column) {
        const tilesInColumn = this.getTilesInColumn(column);
        if (tilesInColumn.length === 0) return -1;
        return Math.min(...tilesInColumn.map(tile => tile.gridY));
    }

    /**
     * Get the next available position in a column
     */
    getNextAvailableRow(column) {
        for (let row = this.size - 1; row >= 0; row--) {
            if (!this.isOccupied(column, row)) {
                return row;
            }
        }
        return -1;
    }

    /**
     * Convert screen coordinates to grid coordinates
     */
    screenToGrid(screenX, screenY) {
        const gridX = Math.floor((screenX - this.offsetX) / this.cellSize);
        const gridY = Math.floor((screenY - this.offsetY) / this.cellSize);
        return {
            gridX: Math.max(0, Math.min(this.size - 1, gridX)),
            gridY: Math.max(0, Math.min(this.size - 1, gridY))
        };
    }

    /**
     * Convert grid coordinates to screen coordinates
     */
    gridToScreen(gridX, gridY) {
        return {
            x: this.offsetX + gridX * this.cellSize + this.cellSize / 2,
            y: this.offsetY + gridY * this.cellSize + this.cellSize / 2
        };
    }

    /**
     * Check if game is over
     */
    isGameOver() {
        // Check if any column is full at the top
        for (let col = 0; col < this.size; col++) {
            if (this.isOccupied(col, 0)) {
                // Check if there are any possible merges
                if (!this.hasPossibleMerges()) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if there are any possible merges
     */
    hasPossibleMerges() {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = i + 1; j < this.tiles.length; j++) {
                const tile1 = this.tiles[i];
                const tile2 = this.tiles[j];
                
                // Check adjacent tiles with same value
                if (tile1.value === tile2.value) {
                    const isAdjacent = (
                        (Math.abs(tile1.gridX - tile2.gridX) === 1 && tile1.gridY === tile2.gridY) ||
                        (Math.abs(tile1.gridY - tile2.gridY) === 1 && tile1.gridX === tile2.gridX)
                    );
                    if (isAdjacent) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Clear entire grid
     */
    clear() {
        this.tiles = [];
    }

    /**
     * Render the grid
     */
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(this.offsetX, this.offsetY, this.gridWidth, this.gridHeight);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(61, 90, 241, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.size; i++) {
            // Vertical lines
            const x = this.offsetX + i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.offsetY);
            this.ctx.lineTo(x, this.offsetY + this.gridHeight);
            this.ctx.stroke();
            
            // Horizontal lines
            const y = this.offsetY + i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX, y);
            this.ctx.lineTo(this.offsetX + this.gridWidth, y);
            this.ctx.stroke();
        }
        
        // Draw border with glow
        this.ctx.strokeStyle = '#3d5af1';
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#3d5af1';
        this.ctx.strokeRect(this.offsetX, this.offsetY, this.gridWidth, this.gridHeight);
        this.ctx.shadowBlur = 0;
        
        // Render all tiles
        this.tiles.forEach(tile => tile.render(this.ctx));
    }

    /**
     * Get grid state for serialization
     */
    getState() {
        return {
            size: this.size,
            tiles: this.tiles.map(tile => tile.toJSON())
        };
    }

    /**
     * Restore grid from state
     */
    setState(state) {
        this.size = state.size;
        this.calculateDimensions();
        this.tiles = state.tiles.map(tileData => 
            Tile.fromJSON(tileData, this.cellSize, this.offsetX, this.offsetY)
        );
    }

    /**
     * Get cells in area (for power-ups)
     */
    getCellsInArea(centerGridX, centerGridY, radius) {
        const cells = [];
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const gridX = centerGridX + dx;
                const gridY = centerGridY + dy;
                if (gridX >= 0 && gridX < this.size && gridY >= 0 && gridY < this.size) {
                    cells.push({ gridX, gridY });
                }
            }
        }
        return cells;
    }

    /**
     * Remove all tiles with specific value
     */
    removeTilesWithValue(value) {
        const tilesToRemove = this.tiles.filter(tile => tile.value === value);
        tilesToRemove.forEach(tile => this.removeTile(tile));
        return tilesToRemove.length;
    }

    /**
     * Remove tiles in area
     */
    removeTilesInArea(centerGridX, centerGridY, radius = 1) {
        const cells = this.getCellsInArea(centerGridX, centerGridY, radius);
        const removed = [];
        
        cells.forEach(cell => {
            const tile = this.getTileAt(cell.gridX, cell.gridY);
            if (tile) {
                removed.push(tile);
                this.removeTile(tile);
            }
        });
        
        return removed;
    }

    /**
     * Update all tiles
     */
    update() {
        this.tiles.forEach(tile => tile.update());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Grid;
}
