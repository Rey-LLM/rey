# How to Download Files from GitHub

## Method 1: Download as ZIP (Easiest)

1. **Go to your repository:**
   - Open: https://github.com/Rey-LLM/rey

2. **Click the green "Code" button** (top right, next to "Add file")

3. **Click "Download ZIP"**
   - This will download the entire repository as a ZIP file

4. **Extract the ZIP file**
   - Right-click the downloaded file → "Extract All"
   - Choose a location to extract

5. **Done!** You now have all the files locally

---

## Method 2: Download Individual Files

1. **Go to the file you want** on GitHub
   - Example: https://github.com/Rey-LLM/rey/blob/main/server.js

2. **Click the "Raw" button** (top right of the file)

3. **Right-click → "Save As"** or press `Ctrl+S`
   - Save the file to your computer

---

## Method 3: Clone Repository (For Git Users)

If you have Git installed:

```bash
git clone https://github.com/Rey-LLM/rey.git
cd rey
```

This creates a folder with all files and keeps Git history.

---

## How to Verify Code is Updated

After uploading files to GitHub, check:

1. **Version number** in `package.json` - should be `1.1.0`
2. **README.md** - should have "Latest Updates" section
3. **UPDATE_LOG.md** - new file with update details
4. **routes/archives.js** - new file should exist
5. **server.js** - should have comment "Last updated: 2026-02-12"

---

## Quick Check List

After downloading, verify these files exist:
- ✅ `routes/archives.js` (NEW)
- ✅ `UPDATE_LOG.md` (NEW)
- ✅ `package.json` (version 1.1.0)
- ✅ `README.md` (with new features section)
- ✅ `server.js` (with archive routes)

If all files are present → Code is updated! ✅
