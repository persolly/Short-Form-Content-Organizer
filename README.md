# Reel Vault

I built this tool because I wanted a clean, private place to save all those Reels, TikToks, and Shorts I keep finding but never know where to put. 

I didn't want to use some heavy app that tracks me or requires a login, so this just lives in your browser.

## How it works
Everything you save—the links, your folders, all of it—is kept in your browser's `localStorage`. 

**This means:**
- **No data leaves your computer.** I can't see it, no server sees it, and nobody is tracking you. 
- **It's fast.** Since it's all local, it loads instantly.
- **Privacy.** If you want to wipe your data, just clear your browser history/data for this site, and it's gone forever.

## Limitations
- **No Syncing**: Because it's stored in your browser, it won't follow you from your phone to your laptop. It lives on the machine where you save it.
- **No Media Hosting**: This doesn't actually download the videos. If the original creator deletes a video, the link in your vault will stop working.
- **Browser Limits**: You can save thousands of links, but browsers have a small cap on how much `localStorage` one site can use (usually 5-10MB). You'll hit that long before you run out of practical space for text links.

## How to use it
It's just a static website. You can run it locally, or just upload the files to something like GitHub Pages or Netlify, and it works straight away. No database setup, no backend—just the files.

---
*Just a personal project. Use it however you want.*
