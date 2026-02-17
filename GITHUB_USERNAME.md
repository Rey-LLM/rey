# How to Find Your GitHub Username

## Method 1: From GitHub Website
1. Go to **https://github.com**
2. Log in to your account
3. Look at the **top right corner** - you'll see your profile picture
4. Click on your profile picture
5. Your username is shown in the dropdown menu (it's the text that appears after `@`)

## Method 2: From Your Repository URL
If you already have a repository on GitHub:
- Your repository URL looks like: `https://github.com/YOUR_USERNAME/rey`
- The part after `github.com/` is your username

## Method 3: From GitHub Profile Page
1. Go to **https://github.com**
2. Click on your profile picture (top right)
3. Click **"Your profile"**
4. Look at the URL: `https://github.com/YOUR_USERNAME`
- The part after `/` is your username

## Example
If your GitHub profile URL is:
```
https://github.com/johnsmith
```

Then your username is: **`johnsmith`**

And your command will be:
```bash
git remote add origin https://github.com/johnsmith/rey.git
```

---

## Quick Check
After adding the remote, verify it:
```bash
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/rey.git (fetch)
origin  https://github.com/YOUR_USERNAME/rey.git (push)
```
