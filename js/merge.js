/**
 * COSMIC MERGE - MERGE DETECTION
 * Handles tile merging logic and detection
 */

class MergeDetector {
    constructor(grid, onMerge) {
        this.grid = grid;
        this.onMerge = onMerge; // Callback for when merge happens
        this.mergeChain = [];
        this.comboMultiplier = 1.0;
        this.lastMergeTime = 0;
        this.comboResetDelay = 1000; // Reset combo after 1 second
    }

    /**
     * Check for possible merges in the grid
     */
    checkForMerges() {
        const merges = [];
        const checked = new Set();

        this.grid.tiles.forEach(tile => {
            if (checked.has(tile.id)) return;

            // Check adjacent tiles (up, down, left, right)
            const adjacent = this.getAdjacentTiles(tile);

            adjacent.forEach(other => {
                if (checked.has(other.id)) return;
                
                if (tile.canMergeWith(other)) {
                    merges.push({ tile1: tile, tile2: other });
                    checked.add(tile.id);
                    checked.add(other.id);
                }
            });
        });

        return merges;
    }

    /**
     * Get adjacent tiles (up, down, left, right)
     */
    getAdjacentTiles(tile) {
        const adjacent = [];
        const directions = [
            { dx: 0, dy: -1 }, // Up
            { dx: 0, dy: 1 },  // Down
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 }   // Right
        ];

        directions.forEach(dir => {
            const gridX = tile.gridX + dir.dx;
            const gridY = tile.gridY + dir.dy;
            const adjacentTile = this.grid.getTileAt(gridX, gridY);
            
            if (adjacentTile) {
                adjacent.push(adjacentTile);
            }
        });

        return adjacent;
    }

    /**
     * Perform a merge between two tiles
     */
    performMerge(tile1, tile2) {
        // Mark tiles for merge
        tile1.markedForMerge = true;
        tile2.markedForMerge = true;

        // Calculate merge position (average of both tiles)
        const mergeX = (tile1.x + tile2.x) / 2;
        const mergeY = (tile1.y + tile2.y) / 2;
        const mergeGridX = Math.round((tile1.gridX + tile2.gridX) / 2);
        const mergeGridY = Math.round((tile1.gridY + tile2.gridY) / 2);

        // Create new merged tile
        const newValue = tile1.value * 2;
        const newTile = new Tile(newValue, mergeX, mergeY, mergeGridX, mergeGridY);
        newTile.isStatic = true;

        // Remove old tiles
        this.grid.removeTile(tile1);
        this.grid.removeTile(tile2);

        // Add new tile
        this.grid.addTile(newTile);

        // Update combo
        this.updateCombo();

        // Calculate score
        const score = this.calculateMergeScore(newValue);

        // Trigger merge callback
        if (this.onMerge) {
            this.onMerge({
                tile: newTile,
                value: newValue,
                score: score,
                combo: this.comboMultiplier,
                position: { x: mergeX, y: mergeY }
            });
        }

        return {
            newTile,
            score,
            combo: this.comboMultiplier
        };
    }

    /**
     * Perform all detected merges
     */
    performAllMerges() {
        const merges = this.checkForMerges();
        const results = [];

        merges.forEach(merge => {
            const result = this.performMerge(merge.tile1, merge.tile2);
            results.push(result);
        });

        // Check for chain reactions
        if (results.length > 0) {
            setTimeout(() => {
                const chainMerges = this.performAllMerges();
                if (chainMerges.length === 0) {
                    // No more merges, schedule combo reset
                    this.scheduleComboReset();
                }
            }, 300);
        }

        return results;
    }

    /**
     * Calculate score for a merge
     */
    calculateMergeScore(value) {
        return Math.floor(value * this.comboMultiplier);
    }

    /**
     * Update combo multiplier
     */
    updateCombo() {
        this.lastMergeTime = Date.now();
        
        if (this.comboMultiplier === 1.0) {
            this.comboMultiplier = 1.0;
        } else if (this.comboMultiplier === 1.0) {
            this.comboMultiplier = 1.5;
        } else if (this.comboMultiplier === 1.5) {
            this.comboMultiplier = 2.0;
        } else {
            this.comboMultiplier = 2.5;
        }
    }

    /**
     * Schedule combo reset after delay
     */
    scheduleComboReset() {
        setTimeout(() => {
            const timeSinceLastMerge = Date.now() - this.lastMergeTime;
            if (timeSinceLastMerge >= this.comboResetDelay) {
                this.resetCombo();
            }
        }, this.comboResetDelay);
    }

    /**
     * Reset combo multiplier
     */
    resetCombo() {
        this.comboMultiplier = 1.0;
        this.mergeChain = [];
    }

    /**
     * Check if row/column is cleared
     */
    checkRowColumnClear() {
        const clearedRows = [];
        const clearedColumns = [];

        // Check rows
        for (let row = 0; row < this.grid.size; row++) {
            const tilesInRow = this.grid.getTilesInRow(row);
            if (tilesInRow.length === this.grid.size) {
                // Check if all tiles have same value
                const allSame = tilesInRow.every(tile => tile.value === tilesInRow[0].value);
                if (allSame) {
                    clearedRows.push(row);
                }
            }
        }

        // Check columns
        for (let col = 0; col < this.grid.size; col++) {
            const tilesInColumn = this.grid.getTilesInColumn(col);
            if (tilesInColumn.length === this.grid.size) {
                const allSame = tilesInColumn.every(tile => tile.value === tilesInColumn[0].value);
                if (allSame) {
                    clearedColumns.push(col);
                }
            }
        }

        return { rows: clearedRows, columns: clearedColumns };
    }

    /**
     * Get merge animations data
     */
    getMergeAnimationData(tile1, tile2) {
        return {
            startPositions: [
                { x: tile1.x, y: tile1.y },
                { x: tile2.x, y: tile2.y }
            ],
            endPosition: {
                x: (tile1.x + tile2.x) / 2,
                y: (tile1.y + tile2.y) / 2
            },
            value: tile1.value * 2
        };
    }

    /**
     * Check for matches (3 or more in a row)
     */
    checkForMatches() {
        const matches = [];

        // Check horizontal matches
        for (let row = 0; row < this.grid.size; row++) {
            const tilesInRow = this.grid.getTilesInRow(row);
            const rowMatches = this.findConsecutiveMatches(tilesInRow);
            matches.push(...rowMatches);
        }

        // Check vertical matches
        for (let col = 0; col < this.grid.size; col++) {
            const tilesInColumn = this.grid.getTilesInColumn(col);
            const colMatches = this.findConsecutiveMatches(tilesInColumn);
            matches.push(...colMatches);
        }

        return matches;
    }

    /**
     * Find consecutive matching tiles
     */
    findConsecutiveMatches(tiles) {
        const matches = [];
        let currentMatch = [tiles[0]];

        for (let i = 1; i < tiles.length; i++) {
            if (tiles[i].value === currentMatch[0].value) {
                currentMatch.push(tiles[i]);
            } else {
                if (currentMatch.length >= 3) {
                    matches.push([...currentMatch]);
                }
                currentMatch = [tiles[i]];
            }
        }

        if (currentMatch.length >= 3) {
            matches.push(currentMatch);
        }

        return matches;
    }

    /**
     * Reset merge detector
     */
    reset() {
        this.mergeChain = [];
        this.comboMultiplier = 1.0;
        this.lastMergeTime = 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MergeDetector;
}
