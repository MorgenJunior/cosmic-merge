/**
 * COSMIC MERGE - PHYSICS ENGINE
 * Handles tile dropping and collision physics
 */

class PhysicsEngine {
    constructor(grid) {
        this.grid = grid;
        this.gravity = 0.8;
        this.damping = 0.95;
        this.fallingTiles = [];
    }

    /**
     * Drop a tile in a specific column
     */
    dropTile(value, column) {
        const targetRow = this.grid.getNextAvailableRow(column);
        
        if (targetRow === -1) {
            return null; // Column is full
        }

        // Create tile at top of column
        const startPos = this.grid.gridToScreen(column, -1);
        const targetPos = this.grid.gridToScreen(column, targetRow);
        
        const tile = new Tile(value, startPos.x, startPos.y, column, targetRow);
        tile.targetY = targetPos.y;
        tile.velocity.y = 0;
        
        this.fallingTiles.push(tile);
        this.grid.addTile(tile);
        
        return tile;
    }

    /**
     * Apply gravity to falling tiles
     */
    applyGravity(tile) {
        if (tile.y < tile.targetY) {
            tile.velocity.y += this.gravity;
            tile.y += tile.velocity.y;
            
            // Check if reached target
            if (tile.y >= tile.targetY) {
                tile.y = tile.targetY;
                tile.velocity.y = 0;
                tile.isStatic = true;
                
                // Remove from falling tiles
                const index = this.fallingTiles.indexOf(tile);
                if (index > -1) {
                    this.fallingTiles.splice(index, 1);
                }
                
                return true; // Tile has landed
            }
        }
        return false;
    }

    /**
     * Apply gravity to all falling tiles
     */
    applyGravityToAll() {
        const landedTiles = [];
        
        this.fallingTiles.forEach(tile => {
            const hasLanded = this.applyGravity(tile);
            if (hasLanded) {
                landedTiles.push(tile);
            }
        });
        
        return landedTiles;
    }

    /**
     * Make tiles fall down after removal
     */
    applyGravityToColumn(column) {
        const tilesInColumn = this.grid.getTilesInColumn(column);
        const movedTiles = [];
        
        // Sort from bottom to top
        tilesInColumn.sort((a, b) => b.gridY - a.gridY);
        
        // Check each position from bottom to top
        for (let row = this.grid.size - 1; row >= 0; row--) {
            const tile = this.grid.getTileAt(column, row);
            
            if (!tile) {
                // Find tile above this empty space
                const tileAbove = tilesInColumn.find(t => t.gridY < row);
                
                if (tileAbove) {
                    // Move tile down
                    const newRow = this.grid.getNextAvailableRow(column);
                    if (newRow !== -1 && newRow >= row) {
                        tileAbove.gridY = newRow;
                        const targetPos = this.grid.gridToScreen(column, newRow);
                        tileAbove.targetY = targetPos.y;
                        tileAbove.isStatic = false;
                        
                        if (!this.fallingTiles.includes(tileAbove)) {
                            this.fallingTiles.push(tileAbove);
                        }
                        
                        movedTiles.push(tileAbove);
                    }
                }
            }
        }
        
        return movedTiles;
    }

    /**
     * Apply gravity to entire grid
     */
    applyGravityToGrid() {
        for (let col = 0; col < this.grid.size; col++) {
            this.applyGravityToColumn(col);
        }
    }

    /**
     * Check if any tiles are still falling
     */
    hasFallingTiles() {
        return this.fallingTiles.length > 0;
    }

    /**
     * Update physics simulation
     */
    update() {
        return this.applyGravityToAll();
    }

    /**
     * Reset physics engine
     */
    reset() {
        this.fallingTiles = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}
