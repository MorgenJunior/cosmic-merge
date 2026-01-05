/**
 * COSMIC MERGE - SCORE MANAGER
 * Handles scoring, high scores, and statistics
 */

class ScoreManager {
    constructor() {
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.totalScore = this.loadTotalScore();
        this.gamesPlayed = this.loadGamesPlayed();
    }

    /**
     * Add points to current score
     */
    addScore(points) {
        this.score += points;
        this.totalScore += points;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        this.saveTotalScore();
    }

    /**
     * Get current score
     */
    getScore() {
        return this.score;
    }

    /**
     * Get high score
     */
    getHighScore() {
        return this.highScore;
    }

    /**
     * Set score
     */
    setScore(score) {
        this.score = score;
    }

    /**
     * Set high score
     */
    setHighScore(score) {
        this.highScore = score;
        this.saveHighScore();
    }

    /**
     * Reset current score
     */
    reset() {
        this.score = 0;
        this.gamesPlayed++;
        this.saveGamesPlayed();
    }

    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        const saved = localStorage.getItem('cosmicMergeHighScore');
        return saved ? parseInt(saved) : 0;
    }

    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        localStorage.setItem('cosmicMergeHighScore', this.highScore.toString());
    }

    /**
     * Load total score from localStorage
     */
    loadTotalScore() {
        const saved = localStorage.getItem('cosmicMergeTotalScore');
        return saved ? parseInt(saved) : 0;
    }

    /**
     * Save total score to localStorage
     */
    saveTotalScore() {
        localStorage.setItem('cosmicMergeTotalScore', this.totalScore.toString());
    }

    /**
     * Load games played from localStorage
     */
    loadGamesPlayed() {
        const saved = localStorage.getItem('cosmicMergeGamesPlayed');
        return saved ? parseInt(saved) : 0;
    }

    /**
     * Save games played to localStorage
     */
    saveGamesPlayed() {
        localStorage.setItem('cosmicMergeGamesPlayed', this.gamesPlayed.toString());
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            currentScore: this.score,
            highScore: this.highScore,
            totalScore: this.totalScore,
            gamesPlayed: this.gamesPlayed,
            averageScore: this.gamesPlayed > 0 ? Math.floor(this.totalScore / this.gamesPlayed) : 0
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreManager;
}
