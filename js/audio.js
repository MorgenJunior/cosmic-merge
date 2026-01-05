/**
 * COSMIC MERGE - AUDIO MANAGER
 * Handles sound effects and background music
 */

class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.muted = false;
        this.musicMuted = false;
        this.sfxMuted = false;
        this.volume = 0.5;
        this.musicVolume = 0.3;
        this.audioContext = null;
        this.useBeeps = false; // Fallback to beeps if files not found
        
        this.loadSettings();
    }

    /**
     * Initialize audio system
     */
    async init() {
        // Load settings from localStorage
        this.loadSettings();
        
        // Initialize Web Audio API for fallback beeps
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
        
        // Try to preload sound files
        this.sounds = {
            drop: new Audio('assets/sounds/tile_drop.mp3'),
            merge1: new Audio('assets/sounds/merge_1.mp3'),
            merge2: new Audio('assets/sounds/merge_2.mp3'),
            merge3: new Audio('assets/sounds/merge_3.mp3'),
            powerup: new Audio('assets/sounds/powerup_use.mp3'),
            gameover: new Audio('assets/sounds/game_over.mp3'),
            achievement: new Audio('assets/sounds/achievement.mp3'),
            click: new Audio('assets/sounds/ui_click.mp3'),
            combo: new Audio('assets/sounds/combo.mp3'),
            error: new Audio('assets/sounds/error.mp3')
        };
        
        // Check if files exist, if not use beeps
        let filesLoaded = 0;
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
            sound.addEventListener('canplaythrough', () => filesLoaded++, { once: true });
            sound.addEventListener('error', () => {
                this.useBeeps = true; // Switch to beep mode
            }, { once: true });
        });
        
        // Wait a bit to see if files load
        setTimeout(() => {
            if (filesLoaded === 0) {
                console.log('🔊 Audio files not found - using beep sounds instead');
                this.useBeeps = true;
            }
        }, 500);
        
        // Load background music
        this.music = new Audio('assets/music/background_music.mp3');
        this.music.loop = true;
        this.music.volume = this.musicVolume;
        this.music.addEventListener('error', () => {
            console.log('Music file not found (will run without music)');
        });
        
        console.log('Audio system initialized');
        
        // Setup UI listeners
        this.setupUIListeners();
    }

    /**
     * Play a beep sound (fallback when files not available)
     */
    playBeep(frequency, duration, type = 'sine') {
        if (!this.audioContext || this.sfxMuted || this.muted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    /**
     * Setup UI listeners for audio controls
     */
    setupUIListeners() {
        const musicToggle = document.getElementById('musicToggle');
        const sfxToggle = document.getElementById('sfxToggle');
        
        if (musicToggle) {
            musicToggle.checked = !this.musicMuted;
            musicToggle.addEventListener('change', (e) => {
                this.musicMuted = !e.target.checked;
                this.saveSettings();
                if (this.music) {
                    this.music.mute(this.musicMuted);
                }
            });
        }
        
        if (sfxToggle) {
            sfxToggle.checked = !this.sfxMuted;
            sfxToggle.addEventListener('change', (e) => {
                this.sfxMuted = !e.target.checked;
                this.saveSettings();
            });
        }
    }

    /**
     * Play a sound effect
     */
    play(soundName) {
        if (this.sfxMuted || this.muted) return;
        
        // If using beeps, play beep sounds instead
        if (this.useBeeps) {
            this.playBeepForSound(soundName);
            return;
        }
        
        const sound = this.sounds[soundName];
        if (!sound) {
            console.log(`Sound '${soundName}' not found`);
            return;
        }
        
        // Clone the audio to allow overlapping sounds
        const soundClone = sound.cloneNode();
        soundClone.volume = this.volume;
        soundClone.play().catch(err => {
            // Fallback to beep if play fails
            this.playBeepForSound(soundName);
        });
    }

    /**
     * Play appropriate beep for each sound type
     */
    playBeepForSound(soundName) {
        switch(soundName) {
            case 'drop':
                this.playBeep(200, 0.1, 'sine');
                break;
            case 'merge1':
                this.playBeep(400, 0.15, 'sine');
                break;
            case 'merge2':
                this.playBeep(600, 0.2, 'sine');
                break;
            case 'merge3':
                this.playBeep(800, 0.25, 'triangle');
                break;
            case 'powerup':
                this.playBeep(1000, 0.3, 'square');
                setTimeout(() => this.playBeep(1200, 0.2, 'square'), 100);
                break;
            case 'gameover':
                this.playBeep(400, 0.5, 'sawtooth');
                setTimeout(() => this.playBeep(200, 0.5, 'sawtooth'), 200);
                break;
            case 'achievement':
                this.playBeep(600, 0.1, 'sine');
                setTimeout(() => this.playBeep(800, 0.1, 'sine'), 100);
                setTimeout(() => this.playBeep(1000, 0.2, 'sine'), 200);
                break;
            case 'click':
                this.playBeep(800, 0.05, 'square');
                break;
            case 'combo':
                this.playBeep(1200, 0.2, 'triangle');
                break;
            case 'error':
                this.playBeep(150, 0.15, 'sawtooth');
                break;
        }
    }

    /**
     * Play merge sound based on tile value
     */
    playMerge(tileValue) {
        if (tileValue <= 8) {
            this.play('merge1');
        } else if (tileValue <= 64) {
            this.play('merge2');
        } else {
            this.play('merge3');
        }
    }

    /**
     * Load sound files
     */
    loadSound(name, path) {
        console.log(`Loading sound: ${name} from ${path}`);
    }

    /**
     * Load all sounds
     */
    loadAllSounds() {
        // Sounds are loaded in init()
        console.log('All sounds loaded');
    }

    /**
     * Play background music
     */
    playMusic(musicPath) {
        if (this.musicMuted || this.muted) return;
        
        if (musicPath) {
            this.music = new Audio(musicPath);
            this.music.loop = true;
            this.music.volume = this.musicVolume;
        }
        
        if (this.music) {
            this.music.play().catch(err => {
                console.log('Music play failed (user interaction required):', err.message);
            });
        }
    }

    /**
     * Stop background music
     */
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    /**
     * Toggle mute for all audio
     */
    toggleMute() {
        this.muted = !this.muted;
        this.musicMuted = this.muted;
        this.sfxMuted = this.muted;
        
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.textContent = this.muted ? '🔇' : '🔊';
        }
        
        if (this.music) {
            // this.music.mute(this.musicMuted);
        }
        
        this.saveSettings();
    }

    /**
     * Set volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
        
        this.saveSettings();
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
        
        this.saveSettings();
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const settings = localStorage.getItem('cosmicMergeAudioSettings');
        
        if (settings) {
            try {
                const data = JSON.parse(settings);
                this.muted = data.muted || false;
                this.musicMuted = data.musicMuted || false;
                this.sfxMuted = data.sfxMuted || false;
                this.volume = data.volume || 0.7;
                this.musicVolume = data.musicVolume || 0.2;
            } catch (error) {
                console.error('Error loading audio settings:', error);
            }
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        const settings = {
            muted: this.muted,
            musicMuted: this.musicMuted,
            sfxMuted: this.sfxMuted,
            volume: this.volume,
            musicVolume: this.musicVolume
        };
        
        localStorage.setItem('cosmicMergeAudioSettings', JSON.stringify(settings));
    }

    /**
     * Preload all audio assets
     */
    preloadAll() {
        // Sounds already loaded in init()
        if (!this.musicMuted && !this.muted) {
            this.playMusic();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
