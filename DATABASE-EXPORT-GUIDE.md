# 🗄️ Database Export via GitHub Actions

This GitHub Action allows you to automatically export your live database from the server and save it to your repository.

## 🚀 Setup Instructions

### 1. Add Secrets to GitHub Repository

Go to your repository → Settings → Secrets and Variables → Actions, and add these secrets:

```
DB_HOST=your.server.ip.address (e.g., 1.2.3.4)
DB_USER=root
DB_PASSWORD=xyz123
DB_NAME=lamprinakis_eshop
```

### 2. How to Use

#### Manual Export (Recommended)
1. Go to **Actions** tab in your GitHub repository
2. Click **"🗄️ Export Database from Server"**
3. Click **"Run workflow"**
4. Optionally add a custom commit message
5. Click **"Run workflow"** button

#### Automatic Export (Optional)
- The action runs every Sunday at 2 AM UTC automatically
- Remove the `schedule` section in the workflow file if you don't want this

### 3. What It Does

✅ **Connects to your live server database**  
✅ **Exports complete database structure and data**  
✅ **Creates human-readable SQL format**  
✅ **Generates products summary**  
✅ **Commits changes to repository automatically**  
✅ **Only commits if there are actual changes**  

### 4. Files Created/Updated

- `db/lamprinakis_eshop_exported.sql` - Complete database export
- `db/products_summary.txt` - Summary of products by category/brand

## 🎯 Workflow

### When You Add Products via phpMyAdmin:

1. **Add products** through phpMyAdmin on your server
2. **Go to GitHub Actions** tab
3. **Run the export workflow** manually
4. **Products are automatically saved** to your repository
5. **Deploy** using your normal process

### Benefits:

- ✅ **One-click export** from GitHub web interface
- ✅ **No server access needed** - runs from GitHub
- ✅ **Automatic backups** - everything saved in git
- ✅ **Team collaboration** - everyone gets latest data
- ✅ **Change tracking** - see what changed over time
- ✅ **Safe deployments** - never lose data again

## 🔧 Advanced Usage

### Custom Commit Messages
When running manually, you can add custom commit messages like:
- "Added new laptop products"
- "Updated product prices"
- "Monthly product backup"

### Scheduling
The workflow can run automatically. Current schedule:
- **Every Sunday at 2 AM UTC**

To change the schedule, edit the `cron` value in the workflow file:
```yaml
schedule:
  - cron: '0 2 * * 0'  # Every Sunday at 2 AM UTC
```

### Security
- Database credentials are stored as encrypted GitHub secrets
- Only repository collaborators can run the action
- All activity is logged in Actions tab

## 🆘 Troubleshooting

### Connection Issues
- Verify your server allows external MySQL connections
- Check that your secrets are correctly set
- Ensure your server firewall allows GitHub Actions IPs

### No Changes Detected
- This is normal if no data has changed since last export
- The action only commits when there are actual differences

### Large Databases
- The action handles large databases efficiently
- Uses single-transaction export for consistency
- Formats output for better readability
