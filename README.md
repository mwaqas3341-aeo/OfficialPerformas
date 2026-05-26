# 📄 Official Performas
### Government of Punjab — Education Department
### Digital Document Repository

---

## 📁 Project Structure

```
performas-project/
├── Code.gs           ← Google Apps Script backend (all server logic)
├── Index.html        ← Frontend web app (mobile-first UI)
├── appsscript.json   ← Apps Script project manifest
├── .clasp.json       ← clasp config (add your Script ID here)
├── .gitignore        ← Files to exclude from GitHub
└── README.md         ← This file
```

---

## ⚙️ First-Time Setup (Step by Step)

### STEP 1 — Create Your Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **Official Performas**
4. Note the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/ >>>YOUR_ID_HERE<<< /edit
   ```

---

### STEP 2 — Create the Google Apps Script Project

**Option A — Bound to Sheet (Recommended for beginners)**
1. Inside your Google Sheet, click **Extensions → Apps Script**
2. This creates a script bound to your sheet
3. You do NOT need to set `SPREADSHEET_ID` in `Code.gs`

**Option B — Standalone Script**
1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Copy your **Script ID** from the URL:
   ```
   https://script.google.com/home/projects/ >>>SCRIPT_ID_HERE<<< /edit
   ```
4. Paste it into `Code.gs` → `CONFIG.SPREADSHEET_ID`

---

### STEP 3 — Configure the Project

Open `Code.gs` and edit the `CONFIG` block at the top:

```javascript
var CONFIG = {
  SHEET_NAME:    "Performas",          // Sheet tab name
  DRIVE_FOLDER:  "Official Performas", // Google Drive folder
  ADMIN_PASS:    "YourStrongPass123!", // ← Change this!
  SPREADSHEET_ID: ""                   // ← Paste Sheet ID if standalone
};
```

> ⚠️ **Important:** Use a strong password. Anyone with it can upload/delete files.

---

### STEP 4 — Upload Files to Apps Script

**Manual Method (No coding tools needed):**

1. In Apps Script Editor, delete the default `Code.gs` content
2. Paste the entire content of your `Code.gs` file
3. Click **File → New → HTML File**, name it `Index`
4. Paste the entire content of `Index.html`
5. Click **Project Settings** (⚙️ gear icon)
6. Check **"Show appsscript.json manifest file"**
7. Replace its content with `appsscript.json`
8. Press **Ctrl+S** (or Cmd+S) to save all files

---

### STEP 5 — Deploy as Web App

1. In Apps Script, click **Deploy → New Deployment**
2. Click the **gear icon (⚙️)** next to "Select type" → choose **Web App**
3. Fill in:
   - Description: `Official Performas v1`
   - Execute as: **Me (your email)**
   - Who has access: **Anyone** (so staff can use it without login)
4. Click **Deploy**
5. **Copy the Web App URL** — this is your live app link!

> 📌 Share this URL with your staff. Bookmark it on mobiles.

---

### STEP 6 — Grant Drive & Sheets Permissions

On first run, Google will ask you to authorize:
- Click **Review Permissions**
- Choose your Google account
- Click **Advanced → Go to Official Performas (unsafe)** *(normal for self-made scripts)*
- Click **Allow**

---

## 🔄 Updating the App (After Changes)

Whenever you edit `Code.gs` or `Index.html`:

1. Save your changes in Apps Script Editor
2. Go to **Deploy → Manage Deployments**
3. Click **Edit (✏️)** on your deployment
4. Change version to **New Version**
5. Click **Deploy**

---

## 🐙 GitHub Setup (Version Control)

### Why GitHub?
- Backup your code safely in the cloud
- Track every change you make
- Revert to older versions if something breaks
- Collaborate with others

---

### Method A — GitHub Website (Easiest, No Installation)

1. Go to [github.com](https://github.com) → Sign up / Log in
2. Click **"New"** (green button) to create a repository
3. Name it: `official-performas`
4. Set to **Private** (recommended for government projects)
5. Click **Create Repository**
6. On the next page, click **"uploading an existing file"**
7. Drag and drop these files:
   - `Code.gs`
   - `Index.html`
   - `appsscript.json`
   - `.gitignore`
   - `README.md`
   - `.clasp.json` *(only after adding your Script ID)*
8. Write a commit message: `Initial upload — Official Performas`
9. Click **Commit changes**

✅ Your project is now on GitHub!

---

### Method B — clasp (Professional Sync, Apps Script ↔ GitHub)

`clasp` is Google's official tool to sync Apps Script projects with your computer and GitHub.

#### Install clasp
```bash
# Requires Node.js (download from nodejs.org)
npm install -g @google/clasp
```

#### Login to Google
```bash
clasp login
# Opens browser → allow access
```

#### Clone your existing Apps Script project
```bash
mkdir official-performas
cd official-performas
clasp clone YOUR_SCRIPT_ID
```

#### OR push local files to Apps Script
```bash
# In your project folder:
clasp push
```

#### Pull latest from Apps Script to local
```bash
clasp pull
```

#### Open Apps Script in browser
```bash
clasp open
```

---

### Connect clasp folder to GitHub

```bash
cd official-performas

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit — Official Performas"

# Connect to your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/official-performas.git

# Push to GitHub
git push -u origin main
```

#### Daily workflow after changes:
```bash
clasp pull           # Get latest from Apps Script
git add .
git commit -m "Updated upload form UI"
git push             # Push to GitHub
```

---

## 🔐 Security Checklist

- [ ] Change `ADMIN_PASS` from the default before deploying
- [ ] Keep your repository **Private** on GitHub
- [ ] Never commit `.clasprc.json` (it contains your Google login token)
- [ ] Don't share the Web App URL publicly — only with authorized staff
- [ ] Regularly change the admin password

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Script function not found" | Make sure function names in `Code.gs` match exactly |
| Blank white screen | Check browser console (F12) for errors |
| "Authorization required" | Run any function once manually in Apps Script editor |
| Files not showing | Check that sheet tab is named exactly `Performas` |
| Upload fails | Check Drive quota and file size (max ~50MB) |
| Password rejected | Verify `CONFIG.ADMIN_PASS` in `Code.gs` |

---

## 📞 Support

For Google Apps Script help: [developers.google.com/apps-script](https://developers.google.com/apps-script)  
For clasp documentation: [github.com/google/clasp](https://github.com/google/clasp)  
For GitHub help: [docs.github.com](https://docs.github.com)

---

*Official Performas — Government of Punjab, Pakistan*  
*Built with Google Apps Script + Google Drive + Google Sheets*
