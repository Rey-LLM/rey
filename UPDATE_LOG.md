# Update Log

## Version 1.1.0 - February 12, 2026

### ✨ New Features

#### Archive Management System
- **Export Project to ZIP**: `GET /api/archives/project/:projectId/export`
  - Downloads complete project data as ZIP archive
  - Includes all tasks, metadata, and README file
  
- **Export All Projects**: `GET /api/archives/export-all`
  - Exports all user projects in a single ZIP file
  - Organized by project folders

- **Inspect Archive**: `POST /api/archives/inspect`
  - View contents of ZIP archive without extracting
  - Shows file list, sizes, compression ratios

- **Import Archive**: `POST /api/archives/project/:projectId/import`
  - Upload and extract ZIP archive into project
  - Supports project data restoration

#### Project Overview Dashboard
- **Overview Statistics**: `GET /api/projects/overview`
  - Total projects count
  - Total tasks across all projects
  - Tasks grouped by status
  - High priority tasks count
  - Overdue tasks count

### 📦 Dependencies Added
- `archiver@^6.0.1` - ZIP archive creation
- `unzipper@^0.10.14` - ZIP archive reading

### 🔧 Files Modified
- `server.js` - Added archive routes
- `routes/projects.js` - Added overview endpoint
- `package.json` - Updated version to 1.1.0, added dependencies

### 📄 Files Created
- `routes/archives.js` - Complete archive management system

### 🎯 How to Use

#### Export a Project:
```bash
GET /api/archives/project/:projectId/export
# Returns ZIP file download
```

#### Get Project Overview:
```bash
GET /api/projects/overview
# Returns JSON with statistics
```

---

## Version 1.0.0 - Initial Release

- Full project management system
- User authentication
- Task management
- Document management
- Real-time updates
