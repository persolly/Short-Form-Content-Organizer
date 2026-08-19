# How to update your Reel Vault project

Whenever you make changes to your local files (e.g., editing style.css, script.js, or index.html), follow these steps to update your GitHub repository and live website.

### 1. Open your Terminal
Open your terminal and make sure you are inside your project folder:
`/home/alex/Desktop/Proiecte si probleme/Proiecte/Reel Saver/`

### 2. Stage your changes
Tell Git which files you have modified that you want to upload:
```bash
git add .
```

### 3. Commit your changes
Create a snapshot of your changes with a short, descriptive message about what you did:
```bash
git commit -m "Brief description of changes (e.g., Updated CSS styles)"
```

### 4. Push to GitHub
Upload the snapshot to your GitHub repository:
```bash
git push origin main
```

---

### What happens now?
- GitHub will receive your new code immediately.
- GitHub Pages will automatically detect the change and redeploy your live website. 
- Your live site at the GitHub Pages URL will update automatically within 1-2 minutes.

*Pro Tip: You can run `git status` at any time to see which files have been changed but not yet staged.*
