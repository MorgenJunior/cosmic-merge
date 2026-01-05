# 🚀 Deploying COSMIC MERGE to GitHub Pages

## Step 1: Create GitHub Account & Repository

1. Go to **github.com** and create a free account
2. Click **"New Repository"** (green button)
3. Settings:
   - Repository name: `cosmic-merge`
   - Description: "A space-themed merge puzzle game"
   - Public (not private)
   - ✅ Check "Add README file"
4. Click **"Create repository"**

---

## Step 2: Upload Your Game Files

### Option A: Using GitHub Website (Easiest)

1. In your repository, click **"Add file" → "Upload files"**
2. Drag ALL files from your `COSMIC MERGE` folder into the browser
3. Make sure you upload:
   - index.html
   - All CSS files (css/ folder)
   - All JS files (js/ folder)
   - Any images (egg.jpg, etc.)
   - README.md
4. Scroll down and click **"Commit changes"**

### Option B: Using Git Commands (Advanced)

Open PowerShell in your game folder and run:

```powershell
# Initialize git
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Cosmic Merge game"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/cosmic-merge.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** (top right)
3. Click **"Pages"** (left sidebar)
4. Under "Source":
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **"Save"**
6. Wait 1-2 minutes

**Your game will be live at:**
```
https://YOUR_USERNAME.github.io/cosmic-merge/
```

---

## Step 4: Test Your Game

1. Open the URL above in your browser
2. Test gameplay:
   - ✅ Game loads
   - ✅ Tiles drop
   - ✅ Merging works
   - ✅ Score counts
   - ✅ Game over works
3. Test on mobile (scan QR code or send link to phone)

---

## Step 5: Apply for Google AdSense

### Requirements:
- ✅ Original content (your game)
- ✅ Live website (GitHub Pages)
- ✅ 20-50 daily visitors (wait a few weeks)
- ✅ Privacy policy page

### Steps:

1. **Create Privacy Policy:**
   - Use generator: **https://www.privacypolicygenerator.info/**
   - Create a new file `privacy.html` in your repository
   - Link it in your game's footer

2. **Apply for AdSense:**
   - Go to **https://www.google.com/adsense**
   - Click "Get Started"
   - Enter your GitHub Pages URL
   - Fill out application
   - Add verification code to index.html `<head>` section
   - Submit

3. **Wait for Approval:**
   - Takes 1-7 days typically
   - Google will email you

4. **Add AdSense Code:**
   - Once approved, get your Publisher ID (ca-pub-XXXXXXXX)
   - Replace placeholders in `index.html`:
     - Line 18: Add AdSense script with your ID
     - Line 88: Add banner ad code
   - Commit and push changes

---

## Step 6: Drive Traffic

**Before you make money, you need visitors:**

### Free Marketing Ideas:

1. **Reddit:**
   - Post to r/WebGames
   - Post to r/incremental_games
   - Post to r/gamedev (Saturday self-promotion thread)

2. **Social Media:**
   - Share on Twitter/X with hashtags: #indiegame #HTML5game
   - Post gameplay clip on TikTok
   - Share on Facebook gaming groups

3. **Game Aggregators:**
   - Submit to itch.io (free hosting alternative)
   - Submit to GameJolt
   - Submit to Kongregate

4. **SEO:**
   - Add meta tags (already in index.html)
   - Share link in bio
   - Get friends to share

---

## Revenue Timeline Expectations

**Month 1-2:**
- 10-50 visitors/day
- $0-2/month
- Focus: Get traffic, not money

**Month 3-6:**
- 100-500 visitors/day (if marketing well)
- $10-50/month
- Google pays when you reach $100 total

**Month 6+:**
- 500-2,000 visitors/day (if viral)
- $50-500/month
- Sustainable passive income

---

## Troubleshooting

### Game doesn't load on GitHub Pages?
- Check browser console (F12) for errors
- Make sure all file paths are relative (no C:\ paths)
- Wait 5 minutes after enabling Pages

### AdSense not approved?
- Need 50+ daily visitors first
- Add privacy policy
- Make sure site has valuable content
- Wait 2-4 weeks before reapplying

### No traffic?
- Marketing is 80% of success
- Post weekly updates
- Engage with gaming communities
- Consider paid ads ($5-10 to test)

---

## Next Steps After Deployment

1. ✅ Deploy to GitHub Pages
2. ⏳ Share with friends/family
3. ⏳ Market on Reddit (1-2 posts/week)
4. ⏳ Wait for 50+ daily visitors
5. ⏳ Apply for AdSense
6. 💰 Get approved and start earning!

---

## Optional: Custom Domain

Want `cosmicmerge.com` instead of `username.github.io/cosmic-merge`?

1. Buy domain from Namecheap/GoDaddy ($10-15/year)
2. In GitHub Settings → Pages → Custom domain
3. Enter your domain
4. Update DNS settings at your registrar
5. Enable HTTPS

---

## Support

- **GitHub Pages Docs:** https://docs.github.com/pages
- **AdSense Help:** https://support.google.com/adsense
- **Web Game Marketing:** r/gamedev community

Good luck! 🚀🌟
