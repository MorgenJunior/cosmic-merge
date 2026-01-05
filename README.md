# ⭐ COSMIC MERGE - Merge Puzzle Game

A space-themed merge puzzle game built with vanilla JavaScript, HTML5 Canvas, and CSS3. Drop cosmic tiles, merge planets, and create celestial bodies while aiming for the highest score!

## 🎮 Game Features

### Core Gameplay
- **8x8 Grid System** with physics-based tile dropping
- **Merge Mechanics** - Combine matching tiles to create higher-value planets
- **Chain Reactions** - Create combo multipliers with consecutive merges
- **Progressive Difficulty** - Tile spawn rates adapt to your score

### Tile Progression
```
2 🌑 → 4 🌍 → 8 🪐 → 16 ⭐ → 32 🌟 → 64 💫 → 128 🌌 → 256 🌠 → 512 🌊
```

### Power-Ups
- **⚡ Supernova Blast** - Destroy a 3x3 area of tiles (3 uses per game)
- **🌀 Black Hole** - Remove all tiles of one specific value (2 uses per game)
- **⏰ Time Warp** - Undo last 3 moves (1 use per game)

### Features
- 🏆 **Leaderboard System** (Global, Daily, Weekly)
- 📊 **Score Tracking** with high score persistence
- 🎵 **Audio System** (background music and sound effects)
- 💰 **Ad Integration** ready (CrazyGames SDK)
- 📱 **Responsive Design** for mobile and desktop
- ⚙️ **Settings** - Control sound, grid size, and controls
- 💾 **Auto-save** - Game progress saved automatically

## 🚀 Getting Started

### Quick Start
1. Clone or download this repository
2. Open `index.html` in a web browser
3. Start playing!

No build process or dependencies required - just open and play!

### For Development
If you want to test with audio files or deploy to a game portal:

1. **Add Audio Files** to `assets/sounds/` and `assets/music/`
   - tile_drop.mp3
   - merge_1.mp3, merge_2.mp3, merge_3.mp3
   - powerup_use.mp3
   - game_over.mp3
   - achievement.mp3
   - ui_click.mp3

2. **Configure Firebase** (Optional, for online leaderboard)
   - Create a Firebase project at https://firebase.google.com
   - Replace the config in `js/leaderboard.js` with your Firebase credentials
   - Set up Realtime Database with these rules:
   ```json
   {
     "rules": {
       "scores": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

3. **Deploy to CrazyGames/Poki**
   - Uncomment the CrazyGames SDK script in `index.html`
   - Follow their submission guidelines

## 📁 Project Structure

```
cosmic-merge/
├── index.html              # Main HTML file
├── css/
│   ├── style.css          # Main stylesheet
│   └── animations.css     # Animation definitions
├── js/
│   ├── main.js            # Game loop and controller
│   ├── grid.js            # Grid management
│   ├── tile.js            # Tile class
│   ├── physics.js         # Physics engine
│   ├── merge.js           # Merge detection
│   ├── score.js           # Score management
│   ├── powerups.js        # Power-up system
│   ├── audio.js           # Audio management
│   ├── leaderboard.js     # Firebase integration
│   └── ads.js             # Ad integration
├── assets/
│   ├── images/
│   │   ├── planets/       # Tile graphics (optional)
│   │   ├── ui/            # UI elements (optional)
│   │   └── backgrounds/   # Background images
│   ├── sounds/            # Sound effects
│   └── music/             # Background music
└── README.md              # This file
```

## 🎯 How to Play

### Desktop Controls
- **Click and Drag** - Move mouse left/right to choose column, release to drop
- **Tap Mode** (in settings) - Click column to drop tile directly
- **Arrow Keys** - Navigate (keyboard support)

### Mobile Controls
- **Drag** - Touch and drag to position tile
- **Tap** - Enable tap mode in settings for simpler controls

### Gameplay Tips
1. Plan ahead - preview the next tile before dropping
2. Create chains - consecutive merges increase your combo multiplier
3. Use power-ups strategically when stuck
4. Try to keep the grid balanced and avoid filling columns too quickly

## 🔧 Configuration

### Grid Size
Change grid size in settings (unlocked by score milestones):
- **6x6** - Easy mode (available from start)
- **8x8** - Normal mode (default)
- **10x10** - Hard mode (unlock at 20,000 points)

### Tile Spawn Rates
The game adjusts difficulty based on your score:
- **Early Game** (< 5,000): 70% 2s, 25% 4s, 5% 8s
- **Mid Game** (5,000-20,000): 60% 2s, 30% 4s, 10% 8s
- **Late Game** (> 20,000): 50% 2s, 35% 4s, 15% 8s

## 🎨 Customization

### Changing Colors
Edit `css/style.css` and modify the CSS variables:
```css
:root {
    --bg-dark-1: #0a0e27;
    --bg-dark-2: #1a1a3e;
    --grid-glow: #3d5af1;
    --neon-cyan: #00d9ff;
    --neon-purple: #b14aed;
}
```

### Adding Custom Tiles
Modify the tile emoji/colors in `js/tile.js`:
```javascript
getEmoji() {
    const emojis = {
        2: '🌑',   // Change these emojis
        4: '🌍',
        // ...
    };
}
```

## 📊 Analytics & Monetization

### Analytics (Google Analytics 4)
Add your GA4 tracking ID to track:
- Game starts/completions
- High scores achieved
- Power-up usage
- Ad interactions

### Monetization
The game includes ad integration placeholders for:
- **Banner Ads** (always visible)
- **Interstitial Ads** (every 3-5 games)
- **Rewarded Video Ads** (player choice for rewards)

## 🐛 Troubleshooting

### Game not loading?
- Check browser console for errors (F12)
- Ensure JavaScript is enabled
- Try a different browser (Chrome, Firefox recommended)

### No sound?
- Check that audio files are in `assets/sounds/`
- Verify browser allows autoplay
- Check audio settings in game

### Leaderboard not working?
- Verify Firebase configuration
- Check internet connection
- Local leaderboard works offline automatically

## 📝 Development Checklist

Week 1 - Core Game:
- [x] Project structure
- [x] Grid system (8x8)
- [x] Tile spawning
- [x] Drag/drop controls
- [x] Physics for falling tiles
- [x] Merge detection
- [x] Basic scoring
- [x] Game over detection

Week 2 - Features:
- [x] Power-ups system
- [x] Visual effects
- [x] Audio integration
- [x] Mobile controls
- [x] Responsive design
- [x] UI polish

Week 3 - Launch:
- [x] Ad integration framework
- [x] Firebase leaderboard setup
- [ ] Sound effects (need audio files)
- [ ] Background music (need audio files)
- [ ] Daily challenge system (TODO)
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Deploy to hosting

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is free to use for educational purposes. For commercial use, please add proper attribution.

## 🙏 Credits

- Font: [Orbitron](https://fonts.google.com/specimen/Orbitron) by Google Fonts
- Physics: [Matter.js](https://brm.io/matter-js/)
- Audio: [Howler.js](https://howlerjs.com/)
- Animations: [GSAP](https://greensock.com/gsap/)
- Backend: [Firebase](https://firebase.google.com/)

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch
4. Access at `https://yourusername.github.io/cosmic-merge`

### CrazyGames/Poki
1. Zip the entire project folder
2. Follow platform submission guidelines
3. Enable SDK integration in `index.html`
4. Test thoroughly before submission

## 📧 Support

For issues or questions:
- Create an issue on GitHub
- Check browser console for error messages
- Ensure all files are properly loaded

---

**Made with ⭐ for cosmic puzzle enthusiasts!**

Enjoy merging planets and reaching for the stars! 🌌
