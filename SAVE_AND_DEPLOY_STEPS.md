# 📋 Step-by-Step: Save and Deploy to GitHub

## PART 1: SAVE ALL FILES

### Step 1.1: Save all open files
- Press `Ctrl + S` in each open file tab
- OR press `Ctrl + K`, then `S` to save all files at once
- Check that file tabs don't have a dot/asterisk (means they're saved)

### Step 1.2: Verify files are saved
- Look at the top of each file tab
- No white dot = file is saved ✅
- White dot = file needs saving ❌

---

## PART 2: PREPARE FOR GITHUB

### Step 2.1: Open Terminal in Cursor
- Press `` Ctrl + ` `` (backtick) OR
- Go to menu: `Terminal → New Terminal`
- Make sure you're in the project folder: `rey-main`

### Step 2.2: Check if Git is initialized
Type in terminal:
```bash
git status
```

**If you see:** "fatal: not a git repository"
→ Go to Step 2.3

**If you see:** list of files
→ Skip to Step 2.4

### Step 2.3: Initialize Git (only if needed)
```bash
git init
```

### Step 2.4: Check current Git remote
```bash
git remote -v
```

**If you see:** nothing or empty
→ Go to Step 2.5

**If you see:** `origin https://github.com/...`
→ Skip to Step 2.6

### Step 2.5: Add GitHub repository (if not connected)
Replace `YOUR_USERNAME` with your GitHub username:
```bash
git remote add origin https://github.com/YOUR_USERNAME/rey.git
```

**OR if you already have a repo:**
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/rey.git
```

---

## PART 3: COMMIT AND PUSH

### Step 3.1: Add all files to Git
```bash
git add .
```

### Step 3.2: Check what will be committed
```bash
git status
```
You should see all your files listed (green = will be added)

### Step 3.3: Commit changes
```bash
git commit -m "feat: Add archive export/import and project overview features"
```

### Step 3.4: Push to GitHub
```bash
git push -u origin main
```

**If you get error:** "branch 'main' does not exist"
Try:
```bash
git push -u origin master
```

**If you get error:** "authentication failed"
→ You need to set up GitHub authentication (see Step 4)

---

## PART 4: GITHUB AUTHENTICATION (if needed)

### Option A: Personal Access Token (Recommended)
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Give it a name: "rey-project"
4. Select scopes: `repo` (full control)
5. Copy the token
6. When Git asks for password, paste the token instead

### Option B: GitHub CLI
```bash
gh auth login
```
Follow the prompts

---

## PART 5: VERIFY ON GITHUB

1. Go to: `https://github.com/YOUR_USERNAME/rey`
2. Check that files are there:
   - `routes/archives.js` ✅
   - `server.js` (updated) ✅
   - `package.json` (updated) ✅
3. Check commit message shows your changes

---

## TROUBLESHOOTING

### Problem: "git: command not found"
**Solution:** Install Git from https://git-scm.com/download/win

### Problem: "Permission denied"
**Solution:** Set up authentication (see Part 4)

### Problem: "remote origin already exists"
**Solution:** 
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/rey.git
```

### Problem: Files not showing on GitHub
**Solution:** 
```bash
git add .
git commit -m "Update files"
git push origin main
```

---

## QUICK REFERENCE

```bash
# Complete workflow (if Git is already set up):
git add .
git commit -m "feat: Add archive features"
git push origin main
```
