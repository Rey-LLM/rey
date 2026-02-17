# Deploying to GitHub

## Steps to push your code to GitHub

### 1. Initialize Git (if not already done)
```bash
cd rey-main
git init
```

### 2. Add all files
```bash
git add .
```

### 3. Commit changes
```bash
git commit -m "feat: Add archive export/import functionality and project overview endpoint"
```

### 4. Add your GitHub repository as remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/rey.git
```

### 5. Push to GitHub
```bash
git push -u origin main
```

## New Features Added

### Archive Management (`/api/archives`)
- **Export project to ZIP**: `GET /api/archives/project/:projectId/export`
- **Export all projects**: `GET /api/archives/export-all`
- **Inspect archive contents**: `POST /api/archives/inspect`
- **Import archive to project**: `POST /api/archives/project/:projectId/import`

### Project Overview (`/api/projects/overview`)
- **Dashboard statistics**: `GET /api/projects/overview`
  - Total projects count
  - Total tasks count
  - Tasks by status
  - High priority tasks
  - Overdue tasks

## Dependencies Added
- `archiver` - For creating ZIP archives
- `unzipper` - For reading ZIP archives

## Installation
After cloning, run:
```bash
npm install
```

## Notes
- All comments and documentation are in English
- Archive functionality supports project export/import
- Maximum archive size: 100MB
