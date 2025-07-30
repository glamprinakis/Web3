# 🗄️ Database Export via GitHub Actions

This GitHub Action processes your database exports and manages them automatically.

## 🚀 Setup Instructions

### Method 1: Server Push (Recommended)

On your server, export the database and push it to a special branch:

```bash
# Export database
mysqldump -u root -p --single-transaction --routines --triggers lamprinakis_eshop > lamprinakis_eshop.sql

# Navigate to your repo clone on server
cd /path/to/your/repo

# Create/switch to database updates branch
git checkout -B database-updates

# Copy the exported file
cp /path/to/lamprinakis_eshop.sql db/lamprinakis_eshop.sql

# Commit and push
git add db/lamprinakis_eshop.sql
git commit -m "🗄️ Database export - $(date)"
git push origin database-updates
```

**The GitHub Action will automatically:**
- Detect the push to `database-updates` branch
- Analyze the database file
- Merge changes to `main` branch
- Create a summary report

### Method 2: Manual Upload

1. Export your database: `mysqldump -u root -p lamprinakis_eshop > lamprinakis_eshop.sql`
2. Place the file in the `db/` folder of your repository
3. Go to **Actions** tab → **"🗄️ Process Database Export"**
4. Click **"Run workflow"**
5. Click **"Run workflow"** button

## 🎯 Workflow Features

✅ **Automatic processing** - Triggered by pushes to `database-updates` branch  
✅ **File validation** - Checks database file integrity  
✅ **Smart merging** - Automatically merges to main branch  
✅ **Analysis reports** - Creates database statistics  
✅ **Error handling** - Clear feedback on issues  
✅ **Branch management** - Keeps branches in sync  
## 📁 Files Created/Updated

- `db/lamprinakis_eshop.sql` - Your main database export
- `db/database_summary.md` - Analysis and statistics report

## 🔧 Server Setup (One-time)

Create this script on your server for easy database exports:

```bash
#!/bin/bash
# save as: export-db.sh

DB_NAME="lamprinakis_eshop"
REPO_PATH="/path/to/your/repo"  # Change this to your repo path

echo "🗄️ Exporting database..."

# Navigate to repo
cd "$REPO_PATH"

# Create/switch to database branch
git checkout main
git pull origin main
git checkout -B database-updates

# Export database
mysqldump -u root -p --single-transaction --routines --triggers "$DB_NAME" > db/lamprinakis_eshop.sql

# Check if export was successful
if [ $? -eq 0 ]; then
    echo "✅ Database exported successfully"
    
    # Commit and push
    git add db/lamprinakis_eshop.sql
    git commit -m "🗄️ Database export - $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin database-updates
    
    echo "🚀 Database pushed to GitHub"
    echo "🔄 GitHub Actions will process automatically"
else
    echo "❌ Database export failed"
fi
```

Make it executable: `chmod +x export-db.sh`

## 🎮 Usage Examples

### Quick Export from Server
```bash
./export-db.sh
```

### After Adding Products in phpMyAdmin
1. Run the export script: `./export-db.sh`
2. Check GitHub Actions tab to see processing
3. Database automatically merges to main branch

## 🆘 Troubleshooting

### Workflow Fails
- Check that `db/lamprinakis_eshop.sql` exists and is not empty
- Ensure the file contains valid MySQL dump data
- Check the Actions tab for detailed error messages

### File Not Found
- Make sure you're placing the export in the `db/` folder
- File should be named exactly `lamprinakis_eshop.sql`

### Merge Conflicts
- The workflow handles automatic merging
- If conflicts occur, manually resolve and push to `database-updates` branch

## 🔒 Security Benefits

✅ **No database credentials in GitHub** - Export happens on your server  
✅ **Secure file transfer** - Uses Git's secure protocols  
✅ **Access control** - Only repo collaborators can trigger workflows  
✅ **Audit trail** - All changes tracked in Git history
