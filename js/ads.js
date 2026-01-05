/**
 * COSMIC MERGE - ADS MANAGER
 * Handles ad integration (Google AdSense)
 */

class AdsManager {
    constructor() {
        this.adsEnabled = true;
        this.adCount = 0;
        this.lastAdTime = 0;
        this.minAdInterval = 60000; // 1 minute between ads
        this.adSenseEnabled = false;
        
        this.init();
    }

    /**
     * Initialize ad system
     */
    async init() {
        try {
            // Check if AdSense is loaded (will be added after AdSense approval)
            if (typeof window.adsbygoogle !== 'undefined') {
                this.adSenseEnabled = true;
                console.log('✅ Google AdSense initialized');
            } else {
                console.log('⚠️ AdSense not loaded yet - Add after approval');
                console.log('📝 To enable ads:');
                console.log('1. Apply for Google AdSense');
                console.log('2. Get approved');
                console.log('3. Add AdSense code to index.html');
            }
            
            // Setup ad callbacks
            this.setupCallbacks();
        } catch (error) {
            console.error('Error initializing ads:', error);
            this.adsEnabled = false;
        }
    }

    /**
     * Setup ad callbacks
     */
    setupCallbacks() {
        // Setup rewarded ad button
        const rewardedBtn = document.getElementById('watchAdBtn');
        if (rewardedBtn) {
            rewardedBtn.addEventListener('click', () => {
                this.showRewardedAd();
            });
        }
    }

    /**
     * Show banner ad
     */
    showBannerAd() {
        if (!this.adsEnabled) {
            return;
        }

        try {
            // AdSense banner ads will be loaded automatically via HTML
            // This is just a placeholder for manual ad refresh if needed
            console.log('📺 Banner ad displayed');
            
            // If AdSense is enabled, refresh ads
            if (this.adSenseEnabled && typeof window.adsbygoogle !== 'undefined') {
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('Error showing banner ad:', error);
        }
    }

    /**
     * Show interstitial ad
     */
    async showInterstitialAd() {
        if (!this.adsEnabled) {
            return Promise.resolve();
        }

        // Check if enough time has passed since last ad
        const now = Date.now();
        if (now - this.lastAdTime < this.minAdInterval) {
            console.log('⏱️ Too soon for another ad');
            return Promise.resolve();
        }

        try {
            console.log('📺 Interstitial ad trigger point');
            
            // For AdSense, we'll use overlay ads
            // This creates a temporary fullscreen ad overlay
            if (this.adSenseEnabled) {
                await this.showAdOverlay();
            } else {
                console.log('⚠️ Ads not enabled yet - game continues');
            }

            this.adCount++;
            this.lastAdTime = now;
        } catch (error) {
            console.error('Error showing interstitial ad:', error);
        }
    }

    /**
     * Show ad overlay (for interstitial-style ads)
     */
    async showAdOverlay() {
        return new Promise((resolve) => {
            // Pause game
            this.onAdStarted();
            
            // Show ad container
            const adContainer = document.getElementById('interstitialAdContainer');
            if (adContainer) {
                adContainer.classList.remove('hidden');
            }
            
            // Auto-close after 5 seconds
            setTimeout(() => {
                if (adContainer) {
                    adContainer.classList.add('hidden');
                }
                this.onAdFinished();
                resolve();
            }, 5000);
        });
    }

    /**
     * Show rewarded video ad
     */
    async showRewardedAd() {
        console.log('📺 Rewarded ad requested');
        
        // For now, give reward directly (until AdSense rewarded ads are set up)
        // AdSense doesn't have native rewarded video ads like mobile SDKs
        // You'd need to integrate a video ad network separately
        
        if (this.adSenseEnabled) {
            // Show interstitial and give reward
            await this.showAdOverlay();
            this.giveReward();
        } else {
            console.log('⚠️ Ads not enabled - giving free reward for testing');
            this.giveReward();
        }

        this.adCount++;
    }

    /**
     * Give reward to player
     */
    giveReward() {
        console.log('Giving reward to player');
        
        // Give random power-up or retry
        const rewards = ['supernova', 'blackhole', 'timewarp', 'retry'];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        
        if (reward === 'retry') {
            // Give one retry
            this.giveRetry();
        } else {
            // Give power-up
            if (window.game && window.game.powerupManager) {
                window.game.powerupManager.addPowerup(reward);
            }
        }
        
        // Show reward notification
        this.showRewardNotification(reward);
    }

    /**
     * Give retry (restart game with current board)
     */
    giveRetry() {
        console.log('Giving retry');
        
        if (window.game) {
            // Close game over modal
            document.getElementById('gameOverModal').classList.add('hidden');
            
            // Resume game
            window.game.state = 'playing';
        }
    }

    /**
     * Show reward notification
     */
    showRewardNotification(reward) {
        const rewardNames = {
            supernova: '⚡ Supernova Blast',
            blackhole: '🌀 Black Hole',
            timewarp: '⏰ Time Warp',
            retry: '🔄 Continue Playing'
        };
        
        const notification = document.createElement('div');
        notification.className = 'achievement-popup';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">🎁</div>
                <div class="achievement-text">
                    Reward: ${rewardNames[reward] || reward}
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    /**
     * Called when ad starts
     */
    onAdStarted() {
        // Pause game
        if (window.game) {
            window.game.state = 'paused';
        }
        
        // Mute audio
        if (window.game && window.game.audioManager) {
            window.game.audioManager.stopMusic();
        }
    }

    /**
     * Called when ad finishes
     */
    onAdFinished() {
        // Resume game
        if (window.game && window.game.state !== 'gameover') {
            window.game.state = 'playing';
        }
        
        // Resume audio
        if (window.game && window.game.audioManager) {
            // window.game.audioManager.playMusic();
        }
    }

    /**
     * Called when ad has error
     */
    onAdError() {
        // Resume game
        if (window.game && window.game.state !== 'gameover') {
            window.game.state = 'playing';
        }
    }

    /**
     * Check if should show interstitial
     */
    shouldShowInterstitial() {
        // Show interstitial every 3-5 games
        const gamesThreshold = 3 + Math.floor(Math.random() * 3);
        
        if (this.adCount % gamesThreshold === 0) {
            const now = Date.now();
            return now - this.lastAdTime >= this.minAdInterval;
        }
        
        return false;
    }

    /**
     * Track game start (for analytics)
     */
    trackGameStart() {
        if (this.sdk && this.sdk.game) {
            this.sdk.game.gameplayStart();
        }
    }

    /**
     * Track game stop (for analytics)
     */
    trackGameStop() {
        if (this.sdk && this.sdk.game) {
            this.sdk.game.gameplayStop();
        }
    }

    /**
     * Track happy time (when player is engaged)
     */
    trackHappyTime() {
        if (this.sdk && this.sdk.game) {
            this.sdk.game.happytime();
        }
    }

    /**
     * Invite to share score
     */
    inviteToShare() {
        if (this.sdk && this.sdk.game) {
            // Some platforms support sharing
            console.log('Invite to share');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdsManager;
}

// Initialize ads manager globally
if (typeof window !== 'undefined') {
    window.adsManager = new AdsManager();
}
