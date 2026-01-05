/**
 * COSMIC MERGE - MAIN GAME
 * Main game controller and loop
 */

class CosmicMerge {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.state = 'loading'; // loading, playing, paused, gameover
        this.grid = null;
        this.physics = null;
        this.mergeDetector = null;
        this.scoreManager = null;
        this.powerupManager = null;
        this.audioManager = null;
        this.leaderboardManager = null;
        
        // Current tile
        this.currentTile = null;
        this.nextTileValue = 2;
        this.previewTileValue = 2;
        
        // Input state
        this.isDragging = false;
        this.dragColumn = -1;
        this.tapMode = false;
        
        // Game settings
        this.gridSize = 8;
        
        // Animation frame
        this.animationId = null;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the game
     */
    async init() {
        try {
            // Setup canvas
            this.setupCanvas();
            
            // Initialize managers
            this.grid = new Grid(this.canvas, this.gridSize);
            this.physics = new PhysicsEngine(this.grid);
            this.mergeDetector = new MergeDetector(this.grid, this.onMerge.bind(this));
            this.scoreManager = new ScoreManager();
            this.powerupManager = new PowerupManager(this);
            this.audioManager = new AudioManager();
            this.leaderboardManager = new LeaderboardManager();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load saved game
            this.loadGame();
            
            // Initialize audio
            await this.audioManager.init();
            
            // Generate first tiles
            this.generateNextTile();
            this.updateNextTilePreview();
            
            // Hide loading screen
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                this.state = 'playing';
                this.startGameLoop();
                
                // Show audio status
                console.log('🔊 Audio System Status:');
                console.log('- SFX Enabled:', !this.audioManager.sfxMuted);
                console.log('- Music Enabled:', !this.audioManager.musicMuted);
                console.log('- Click anywhere to start music');
            }, 1000);
            
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    }

    /**
     * Setup canvas dimensions
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, 800);
        this.canvas.width = size;
        this.canvas.height = size;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Start music on first user interaction
        const startAudio = () => {
            this.audioManager.playMusic();
            document.removeEventListener('click', startAudio);
            document.removeEventListener('touchstart', startAudio);
        };
        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('touchstart', startAudio, { once: true });
        
        // Canvas events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // UI buttons
        document.getElementById('soundBtn').addEventListener('click', () => {
            this.audioManager.play('click');
            this.audioManager.toggleMute();
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.audioManager.play('click');
            this.showSettings();
        });
        
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.audioManager.play('click');
            this.showLeaderboard();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.audioManager.play('click');
            this.restartGame();
        });
        
        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.hideSettings();
        });
        
        document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
            this.hideLeaderboard();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.grid.calculateDimensions();
            this.grid.repositionTiles();
        });
        
        // Settings
        document.getElementById('gridSizeSelect').addEventListener('change', (e) => {
            this.changeGridSize(parseInt(e.target.value));
        });
        
        document.getElementById('tapModeToggle').addEventListener('change', (e) => {
            this.tapMode = e.target.checked;
        });
    }

    /**
     * Mouse down handler
     */
    onMouseDown(e) {
        if (this.state !== 'playing' || this.physics.hasFallingTiles()) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.tapMode) {
            this.dropTileAt(x, y);
        } else {
            this.isDragging = true;
            this.updateDragColumn(x);
        }
    }

    /**
     * Mouse move handler
     */
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        this.updateDragColumn(x);
    }

    /**
     * Mouse up handler
     */
    onMouseUp(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        if (this.dragColumn >= 0) {
            this.dropTileInColumn(this.dragColumn);
        }
        
        this.dragColumn = -1;
    }

    /**
     * Touch start handler
     */
    onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.onMouseDown(mouseEvent);
    }

    /**
     * Touch move handler
     */
    onTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.onMouseMove(mouseEvent);
    }

    /**
     * Touch end handler
     */
    onTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        this.onMouseUp(mouseEvent);
    }

    /**
     * Update drag column
     */
    updateDragColumn(x) {
        const { gridX } = this.grid.screenToGrid(x, 0);
        this.dragColumn = gridX;
    }

    /**
     * Drop tile at position
     */
    dropTileAt(x, y) {
        const { gridX } = this.grid.screenToGrid(x, y);
        this.dropTileInColumn(gridX);
    }

    /**
     * Drop tile in column
     */
    dropTileInColumn(column) {
        if (this.grid.isColumnFull(column)) {
            console.log('Column full - playing error sound');
            this.audioManager.play('error');
            return;
        }
        
        const tile = this.physics.dropTile(this.nextTileValue, column);
        
        if (tile) {
            console.log('Tile dropped - playing drop sound');
            this.audioManager.play('drop');
            this.currentTile = tile;
            
            // Generate next tile
            this.nextTileValue = this.previewTileValue;
            this.generateNextTile();
            this.updateNextTilePreview();
        }
    }

    /**
     * Generate next tile value
     */
    generateNextTile() {
        const rand = Math.random();
        
        // Spawn rates based on game progress
        const score = this.scoreManager.getScore();
        
        if (score < 5000) {
            // Early game: 70% 2s, 25% 4s, 5% 8s
            if (rand < 0.70) this.previewTileValue = 2;
            else if (rand < 0.95) this.previewTileValue = 4;
            else this.previewTileValue = 8;
        } else if (score < 20000) {
            // Mid game: 60% 2s, 30% 4s, 10% 8s
            if (rand < 0.60) this.previewTileValue = 2;
            else if (rand < 0.90) this.previewTileValue = 4;
            else this.previewTileValue = 8;
        } else {
            // Late game: 50% 2s, 35% 4s, 15% 8s
            if (rand < 0.50) this.previewTileValue = 2;
            else if (rand < 0.85) this.previewTileValue = 4;
            else this.previewTileValue = 8;
        }
    }

    /**
     * Update next tile preview UI
     */
    updateNextTilePreview() {
        const preview = document.querySelector('.preview-tile');
        const tile = new Tile(this.nextTileValue, 0, 0, 0, 0);
        preview.textContent = tile.emoji;
    }

    /**
     * Merge callback
     */
    onMerge(mergeData) {
        // Update score
        this.scoreManager.addScore(mergeData.score);
        
        // Play merge sound based on tile value
        this.audioManager.playMerge(mergeData.value);
        
        // Play combo sound for high combos
        if (mergeData.combo >= 2) {
            setTimeout(() => this.audioManager.play('combo'), 100);
        }
        
        // Show score popup
        this.showScorePopup(mergeData.score, mergeData.position);
        
        // Show combo indicator
        if (mergeData.combo > 1) {
            this.showComboIndicator(mergeData.combo);
        }
        
        // Create particle effect
        this.createParticleEffect(mergeData.position);
    }

    /**
     * Show score popup
     */
    showScorePopup(score, position) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${score}`;
        popup.style.left = position.x + 'px';
        popup.style.top = position.y + 'px';
        
        document.getElementById('particleContainer').appendChild(popup);
        
        setTimeout(() => popup.remove(), 1000);
    }

    /**
     * Show combo indicator
     */
    showComboIndicator(combo) {
        const indicator = document.createElement('div');
        indicator.className = 'combo-indicator';
        indicator.textContent = `${combo}x COMBO!`;
        
        document.getElementById('particleContainer').appendChild(indicator);
        
        setTimeout(() => indicator.remove(), 800);
    }

    /**
     * Create particle effect
     */
    createParticleEffect(position) {
        const container = document.getElementById('particleContainer');
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = position.x + 'px';
            particle.style.top = position.y + 'px';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.background = '#00d9ff';
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 50 + Math.random() * 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }

    /**
     * Start game loop
     */
    startGameLoop() {
        const gameLoop = () => {
            if (this.state === 'playing') {
                this.update();
                this.render();
            }
            this.animationId = requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    /**
     * Update game state
     */
    update() {
        // Update physics
        const landedTiles = this.physics.update();
        
        // Check for merges when tiles land
        if (landedTiles.length > 0) {
            setTimeout(() => {
                this.mergeDetector.performAllMerges();
                this.physics.applyGravityToGrid();
                
                // Check game over
                if (this.grid.isGameOver()) {
                    this.gameOver();
                }
            }, 200);
        }
        
        // Update UI
        this.updateUI();
    }

    /**
     * Render game
     */
    render() {
        this.grid.render();
        
        // Draw drag indicator
        if (this.isDragging && this.dragColumn >= 0) {
            this.drawDragIndicator(this.dragColumn);
        }
    }

    /**
     * Draw drag indicator
     */
    drawDragIndicator(column) {
        const pos = this.grid.gridToScreen(column, 0);
        
        this.ctx.save();
        this.ctx.strokeStyle = '#00d9ff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, this.grid.offsetY);
        this.ctx.lineTo(pos.x, this.grid.offsetY + this.grid.gridHeight);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    /**
     * Update UI elements
     */
    updateUI() {
        document.getElementById('currentScore').textContent = 
            this.scoreManager.getScore().toLocaleString();
        document.getElementById('highScore').textContent = 
            this.scoreManager.getHighScore().toLocaleString();
    }

    /**
     * Change grid size
     */
    changeGridSize(newSize) {
        this.gridSize = newSize;
        this.grid.resize(newSize);
        this.saveGame();
    }

    /**
     * Show settings modal
     */
    showSettings() {
        document.getElementById('settingsModal').classList.remove('hidden');
        this.state = 'paused';
    }

    /**
     * Hide settings modal
     */
    hideSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
        this.state = 'playing';
    }

    /**
     * Show leaderboard
     */
    async showLeaderboard() {
        document.getElementById('leaderboardModal').classList.remove('hidden');
        this.state = 'paused';
        await this.leaderboardManager.loadLeaderboard();
    }

    /**
     * Hide leaderboard
     */
    hideLeaderboard() {
        document.getElementById('leaderboardModal').classList.add('hidden');
        this.state = 'playing';
    }

    /**
     * Game over
     */
    gameOver() {
        this.state = 'gameover';
        this.audioManager.play('gameover');
        
        const modal = document.getElementById('gameOverModal');
        const finalScore = this.scoreManager.getScore();
        const highScore = this.scoreManager.getHighScore();
        
        document.getElementById('finalScore').textContent = finalScore.toLocaleString();
        
        if (finalScore >= highScore) {
            document.getElementById('highScoreMessage').textContent = '🎉 NEW HIGH SCORE!';
            this.scoreManager.setHighScore(finalScore);
            this.leaderboardManager.submitScore(finalScore);
        }
        
        modal.classList.remove('hidden');
        this.saveGame();
    }

    /**
     * Restart game
     */
    restartGame() {
        document.getElementById('gameOverModal').classList.add('hidden');
        
        this.grid.clear();
        this.physics.reset();
        this.mergeDetector.reset();
        this.scoreManager.reset();
        this.powerupManager.reset();
        
        this.generateNextTile();
        this.updateNextTilePreview();
        
        this.state = 'playing';
        this.saveGame();
    }

    /**
     * Save game state
     */
    saveGame() {
        const state = {
            grid: this.grid.getState(),
            score: this.scoreManager.getScore(),
            highScore: this.scoreManager.getHighScore(),
            gridSize: this.gridSize
        };
        
        localStorage.setItem('cosmicMergeState', JSON.stringify(state));
    }

    /**
     * Load game state
     */
    loadGame() {
        const saved = localStorage.getItem('cosmicMergeState');
        
        if (saved) {
            try {
                const state = JSON.parse(saved);
                
                if (state.grid) {
                    this.grid.setState(state.grid);
                }
                
                if (state.score) {
                    this.scoreManager.setScore(state.score);
                }
                
                if (state.highScore) {
                    this.scoreManager.setHighScore(state.highScore);
                }
                
                if (state.gridSize) {
                    this.gridSize = state.gridSize;
                    this.grid.resize(this.gridSize);
                }
            } catch (error) {
                console.error('Error loading game:', error);
            }
        }
    }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new CosmicMerge();
});
