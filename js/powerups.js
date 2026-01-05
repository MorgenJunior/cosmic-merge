/**
 * COSMIC MERGE - POWER-UPS MANAGER
 * Handles power-up functionality
 */

class PowerupManager {
    constructor(game) {
        this.game = game;
        this.powerups = {
            supernova: 3,
            blackhole: 2,
            timewarp: 1
        };
        
        this.activePowerup = null;
        this.moveHistory = [];
        
        this.setupPowerupButtons();
        this.updateUI();
    }

    /**
     * Setup power-up button listeners
     */
    setupPowerupButtons() {
        document.getElementById('supernovaPowerup').addEventListener('click', () => {
            this.activatePowerup('supernova');
        });
        
        document.getElementById('blackholePowerup').addEventListener('click', () => {
            this.activatePowerup('blackhole');
        });
        
        document.getElementById('timewarpPowerup').addEventListener('click', () => {
            this.activatePowerup('timewarp');
        });
    }

    /**
     * Activate a power-up
     */
    activatePowerup(type) {
        if (this.powerups[type] <= 0) {
            console.log(`No ${type} power-ups remaining`);
            return;
        }
        
        if (this.activePowerup) {
            console.log('Power-up already active');
            return;
        }
        
        this.activePowerup = type;
        
        switch (type) {
            case 'supernova':
                this.activateSupernova();
                break;
            case 'blackhole':
                this.activateBlackhole();
                break;
            case 'timewarp':
                this.activateTimewarp();
                break;
        }
    }

    /**
     * Supernova Blast - Destroys 3x3 area
     */
    activateSupernova() {
        console.log('Supernova activated! Click a cell to destroy 3x3 area');
        
        const canvas = this.game.canvas;
        const clickHandler = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const { gridX, gridY } = this.game.grid.screenToGrid(x, y);
            
            // Remove tiles in 3x3 area
            const removed = this.game.grid.removeTilesInArea(gridX, gridY, 1);
            
            // Award points for destroyed tiles
            let totalScore = 0;
            removed.forEach(tile => {
                totalScore += tile.value;
            });
            
            this.game.scoreManager.addScore(totalScore);
            
            // Create explosion effect
            this.createExplosionEffect(gridX, gridY);
            
            // Play sound
            this.game.audioManager.play('powerup');
            
            // Apply gravity
            this.game.physics.applyGravityToGrid();
            
            // Deactivate power-up
            this.powerups.supernova--;
            this.updateUI();
            this.activePowerup = null;
            
            // Remove event listener
            canvas.removeEventListener('click', clickHandler);
        };
        
        canvas.addEventListener('click', clickHandler);
    }

    /**
     * Black Hole - Removes all tiles of one value
     */
    activateBlackhole() {
        console.log('Black Hole activated! Click a tile to remove all matching tiles');
        
        const canvas = this.game.canvas;
        const clickHandler = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const { gridX, gridY } = this.game.grid.screenToGrid(x, y);
            const tile = this.game.grid.getTileAt(gridX, gridY);
            
            if (tile) {
                const value = tile.value;
                const removed = this.game.grid.removeTilesWithValue(value);
                
                // Award points
                this.game.scoreManager.addScore(value * removed);
                
                // Create blackhole effect
                this.createBlackholeEffect();
                
                // Play sound
                this.game.audioManager.play('powerup');
                
                // Apply gravity
                this.game.physics.applyGravityToGrid();
                
                // Deactivate power-up
                this.powerups.blackhole--;
                this.updateUI();
                this.activePowerup = null;
                
                // Remove event listener
                canvas.removeEventListener('click', clickHandler);
            }
        };
        
        canvas.addEventListener('click', clickHandler);
    }

    /**
     * Time Warp - Undo last 3 moves
     */
    activateTimewarp() {
        if (this.moveHistory.length === 0) {
            console.log('No moves to undo');
            this.activePowerup = null;
            return;
        }
        
        console.log('Time Warp activated! Rewinding last moves...');
        
        // Restore previous state (simplified - would need full state tracking)
        const movesToUndo = Math.min(3, this.moveHistory.length);
        
        for (let i = 0; i < movesToUndo; i++) {
            this.moveHistory.pop();
        }
        
        // Create time warp effect
        this.createTimewarpEffect();
        
        // Play sound
        this.game.audioManager.play('powerup');
        
        // Deactivate power-up
        this.powerups.timewarp--;
        this.updateUI();
        this.activePowerup = null;
    }

    /**
     * Record a move for time warp
     */
    recordMove(state) {
        this.moveHistory.push(state);
        
        // Keep only last 10 moves
        if (this.moveHistory.length > 10) {
            this.moveHistory.shift();
        }
    }

    /**
     * Create explosion effect
     */
    createExplosionEffect(gridX, gridY) {
        const pos = this.game.grid.gridToScreen(gridX, gridY);
        const container = document.getElementById('particleContainer');
        
        // Create explosion particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-star';
            particle.style.left = pos.x + 'px';
            particle.style.top = pos.y + 'px';
            particle.style.width = '10px';
            particle.style.height = '10px';
            particle.style.background = '#ff9800';
            particle.style.borderRadius = '50%';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1500);
        }
    }

    /**
     * Create blackhole effect
     */
    createBlackholeEffect() {
        const overlay = document.createElement('div');
        overlay.className = 'powerup-effect-overlay';
        overlay.style.background = 'radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, transparent 70%)';
        document.body.appendChild(overlay);
        
        setTimeout(() => overlay.remove(), 500);
    }

    /**
     * Create time warp effect
     */
    createTimewarpEffect() {
        const overlay = document.createElement('div');
        overlay.className = 'powerup-effect-overlay';
        overlay.style.background = 'radial-gradient(circle, rgba(0, 217, 255, 0.5) 0%, transparent 70%)';
        document.body.appendChild(overlay);
        
        setTimeout(() => overlay.remove(), 500);
    }

    /**
     * Update power-up UI
     */
    updateUI() {
        document.getElementById('supernovaCount').textContent = this.powerups.supernova;
        document.getElementById('blackholeCount').textContent = this.powerups.blackhole;
        document.getElementById('timewarpCount').textContent = this.powerups.timewarp;
        
        // Disable buttons if no power-ups left
        document.getElementById('supernovaPowerup').disabled = this.powerups.supernova <= 0;
        document.getElementById('blackholePowerup').disabled = this.powerups.blackhole <= 0;
        document.getElementById('timewarpPowerup').disabled = this.powerups.timewarp <= 0;
    }

    /**
     * Reset power-ups (for new game)
     */
    reset() {
        this.powerups = {
            supernova: 3,
            blackhole: 2,
            timewarp: 1
        };
        this.moveHistory = [];
        this.activePowerup = null;
        this.updateUI();
    }

    /**
     * Add power-up (reward from ads)
     */
    addPowerup(type) {
        if (this.powerups.hasOwnProperty(type)) {
            this.powerups[type]++;
            this.updateUI();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PowerupManager;
}
