/**
 * COSMIC MERGE - LEADERBOARD MANAGER
 * Handles Firebase leaderboard integration
 */

class LeaderboardManager {
    constructor() {
        this.firebaseInitialized = false;
        this.currentTab = 'global';
        this.leaderboardData = {
            global: [],
            daily: [],
            weekly: []
        };
        
        this.setupTabs();
    }

    /**
     * Initialize Firebase
     */
    async initFirebase() {
        try {
            // Firebase configuration (replace with your own)
            const firebaseConfig = {
                apiKey: "YOUR_API_KEY",
                authDomain: "YOUR_AUTH_DOMAIN",
                databaseURL: "YOUR_DATABASE_URL",
                projectId: "YOUR_PROJECT_ID",
                storageBucket: "YOUR_STORAGE_BUCKET",
                messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
                appId: "YOUR_APP_ID"
            };
            
            // Check if Firebase is available
            if (typeof firebase !== 'undefined') {
                // Initialize Firebase (only if not already initialized)
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                
                this.database = firebase.database();
                this.firebaseInitialized = true;
                
                console.log('Firebase initialized successfully');
            } else {
                console.log('Firebase SDK not loaded, using local leaderboard');
                this.useLocalLeaderboard();
            }
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            this.useLocalLeaderboard();
        }
    }

    /**
     * Use local leaderboard (fallback)
     */
    useLocalLeaderboard() {
        this.loadLocalLeaderboard();
    }

    /**
     * Setup tab listeners
     */
    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                e.target.classList.add('active');
                
                // Update current tab
                this.currentTab = e.target.dataset.tab;
                
                // Refresh leaderboard
                this.displayLeaderboard();
            });
        });
    }

    /**
     * Submit score to leaderboard
     */
    async submitScore(score) {
        const userId = this.getUserId();
        const userName = this.getUserName();
        const timestamp = Date.now();
        
        const scoreData = {
            userId: userId,
            userName: userName,
            score: score,
            timestamp: timestamp
        };
        
        if (this.firebaseInitialized) {
            try {
                // Submit to Firebase
                await this.submitToFirebase(scoreData);
            } catch (error) {
                console.error('Error submitting to Firebase:', error);
                this.submitToLocal(scoreData);
            }
        } else {
            this.submitToLocal(scoreData);
        }
    }

    /**
     * Submit score to Firebase
     */
    async submitToFirebase(scoreData) {
        const scoresRef = this.database.ref('scores');
        
        // Add to global leaderboard
        await scoresRef.child('global').push(scoreData);
        
        // Add to daily leaderboard
        const today = new Date().toISOString().split('T')[0];
        await scoresRef.child('daily').child(today).push(scoreData);
        
        // Add to weekly leaderboard
        const weekNumber = this.getWeekNumber(new Date());
        await scoresRef.child('weekly').child(`week_${weekNumber}`).push(scoreData);
        
        console.log('Score submitted to Firebase');
    }

    /**
     * Submit score to local storage
     */
    submitToLocal(scoreData) {
        // Load existing scores
        const globalScores = this.loadLocalScores('global');
        const dailyScores = this.loadLocalScores('daily');
        const weeklyScores = this.loadLocalScores('weekly');
        
        // Add new score
        globalScores.push(scoreData);
        dailyScores.push(scoreData);
        weeklyScores.push(scoreData);
        
        // Sort by score (descending)
        globalScores.sort((a, b) => b.score - a.score);
        dailyScores.sort((a, b) => b.score - a.score);
        weeklyScores.sort((a, b) => b.score - a.score);
        
        // Keep only top 100
        globalScores.splice(100);
        dailyScores.splice(100);
        weeklyScores.splice(100);
        
        // Save to localStorage
        localStorage.setItem('cosmicMerge_leaderboard_global', JSON.stringify(globalScores));
        localStorage.setItem('cosmicMerge_leaderboard_daily', JSON.stringify(dailyScores));
        localStorage.setItem('cosmicMerge_leaderboard_weekly', JSON.stringify(weeklyScores));
        
        console.log('Score submitted to local storage');
    }

    /**
     * Load leaderboard
     */
    async loadLeaderboard() {
        if (this.firebaseInitialized) {
            try {
                await this.loadFromFirebase();
            } catch (error) {
                console.error('Error loading from Firebase:', error);
                this.loadLocalLeaderboard();
            }
        } else {
            this.loadLocalLeaderboard();
        }
        
        this.displayLeaderboard();
    }

    /**
     * Load from Firebase
     */
    async loadFromFirebase() {
        const scoresRef = this.database.ref('scores');
        
        // Load global
        const globalSnapshot = await scoresRef.child('global')
            .orderByChild('score')
            .limitToLast(100)
            .once('value');
        
        this.leaderboardData.global = this.snapshotToArray(globalSnapshot);
        
        // Load daily
        const today = new Date().toISOString().split('T')[0];
        const dailySnapshot = await scoresRef.child('daily').child(today)
            .orderByChild('score')
            .limitToLast(100)
            .once('value');
        
        this.leaderboardData.daily = this.snapshotToArray(dailySnapshot);
        
        // Load weekly
        const weekNumber = this.getWeekNumber(new Date());
        const weeklySnapshot = await scoresRef.child('weekly').child(`week_${weekNumber}`)
            .orderByChild('score')
            .limitToLast(100)
            .once('value');
        
        this.leaderboardData.weekly = this.snapshotToArray(weeklySnapshot);
    }

    /**
     * Load local leaderboard
     */
    loadLocalLeaderboard() {
        this.leaderboardData.global = this.loadLocalScores('global');
        this.leaderboardData.daily = this.loadLocalScores('daily');
        this.leaderboardData.weekly = this.loadLocalScores('weekly');
    }

    /**
     * Load scores from localStorage
     */
    loadLocalScores(type) {
        const key = `cosmicMerge_leaderboard_${type}`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Error loading local scores:', error);
                return [];
            }
        }
        
        return [];
    }

    /**
     * Display leaderboard
     */
    displayLeaderboard() {
        const container = document.querySelector('.leaderboard-list');
        const scores = this.leaderboardData[this.currentTab];
        const currentUserId = this.getUserId();
        
        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);
        
        // Clear container
        container.innerHTML = '';
        
        if (scores.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px; color: rgba(255,255,255,0.5);">No scores yet. Be the first!</p>';
            return;
        }
        
        // Create leaderboard items
        scores.forEach((score, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            if (score.userId === currentUserId) {
                item.classList.add('current-user');
            }
            
            const rank = index + 1;
            let rankEmoji = '';
            
            if (rank === 1) rankEmoji = '🥇';
            else if (rank === 2) rankEmoji = '🥈';
            else if (rank === 3) rankEmoji = '🥉';
            
            item.innerHTML = `
                <div class="leaderboard-rank">${rankEmoji || rank}</div>
                <div class="leaderboard-name">${this.escapeHtml(score.userName)}</div>
                <div class="leaderboard-score">${score.score.toLocaleString()}</div>
            `;
            
            container.appendChild(item);
        });
    }

    /**
     * Get or create user ID
     */
    getUserId() {
        let userId = localStorage.getItem('cosmicMerge_userId');
        
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cosmicMerge_userId', userId);
        }
        
        return userId;
    }

    /**
     * Get or create user name
     */
    getUserName() {
        let userName = localStorage.getItem('cosmicMerge_userName');
        
        if (!userName) {
            const adjectives = ['Cosmic', 'Stellar', 'Galactic', 'Lunar', 'Solar', 'Nebula', 'Quantum'];
            const nouns = ['Pilot', 'Explorer', 'Voyager', 'Navigator', 'Wanderer', 'Ranger'];
            
            userName = adjectives[Math.floor(Math.random() * adjectives.length)] + 
                      nouns[Math.floor(Math.random() * nouns.length)] + 
                      Math.floor(Math.random() * 1000);
            
            localStorage.setItem('cosmicMerge_userName', userName);
        }
        
        return userName;
    }

    /**
     * Convert Firebase snapshot to array
     */
    snapshotToArray(snapshot) {
        const array = [];
        snapshot.forEach(child => {
            array.push(child.val());
        });
        return array;
    }

    /**
     * Get week number of year
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeaderboardManager;
}
