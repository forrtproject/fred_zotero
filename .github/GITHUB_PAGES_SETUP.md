# GitHub Pages Setup Guide

This guide explains how to enable and configure GitHub Pages for the Zotero Replication Checker documentation.

## 🚀 One-Time Setup (Required)

You need to enable GitHub Pages in your repository settings **once**. After that, the workflow will automatically deploy on every push to main.

### Steps:

1. **Go to Repository Settings**
   - Navigate to https://github.com/forrtproject/fred_zotero/settings

2. **Find Pages Section**
   - In the left sidebar, click **Pages**

3. **Configure Source**
   - **Source**: Select "GitHub Actions"
   - ✅ That's it! No need to select a branch

4. **Save**
   - GitHub will automatically use the workflow in `.github/workflows/pages.yml`

---

## 📄 What Gets Published

The GitHub Pages workflow automatically publishes:

- **Homepage**: `README.md` → https://forrtproject.github.io/fred_zotero/
- **Release Guide**: `.github/RELEASE_GUIDE.md` → https://forrtproject.github.io/fred_zotero/release-guide
- **Contributing** (if exists): `CONTRIBUTING.md` → https://forrtproject.github.io/fred_zotero/contributing

---

## 🎨 Customization

The site uses:
- **Theme**: GitHub's Cayman theme (gradient purple header)
- **Style**: GitHub markdown CSS
- **Custom Layout**: Defined in the workflow

### Customizing the Theme

Edit `.github/workflows/pages.yml` and modify the `_config.yml` section:

```yaml
theme: jekyll-theme-cayman  # Change to: minimal, slate, etc.
```

Available themes:
- `jekyll-theme-cayman` (default - purple gradient)
- `jekyll-theme-minimal` (clean and simple)
- `jekyll-theme-slate` (dark theme)
- `jekyll-theme-architect`
- `jekyll-theme-time-machine`

---

## 🔗 Where the Homepage URL Appears

Once GitHub Pages is enabled, the homepage URL (`https://forrtproject.github.io/fred_zotero/`) will appear in:

1. **Plugin Metadata**
   - When users view plugin details in Zotero
   - Clickable link to documentation

2. **GitHub Repository**
   - Shows in the "About" section
   - Appears in search results

3. **Release Notes**
   - Automatically included in release descriptions

---

## 🧪 Testing

After enabling GitHub Pages:

1. **Push to main branch**
   ```bash
   git push origin main
   ```

2. **Check Actions tab**
   - Go to https://github.com/forrtproject/fred_zotero/actions
   - Look for "Deploy to GitHub Pages" workflow

3. **Wait 1-2 minutes**
   - First deployment takes slightly longer

4. **Visit the site**
   - https://forrtproject.github.io/fred_zotero/

---

## 🔄 Auto-Deploy

The workflow automatically runs when:
- ✅ You push to the `main` branch
- ✅ You manually trigger it (Actions → Deploy to GitHub Pages → Run workflow)

**What it does:**
1. Copies `README.md` to `docs/index.md`
2. Copies other documentation files
3. Builds the site with Jekyll
4. Deploys to GitHub Pages

---

## 📝 Adding New Pages

To add new documentation pages:

1. **Create a markdown file**
   ```bash
   # Example: Create a FAQ page
   touch FAQ.md
   ```

2. **Edit the workflow**
   ```yaml
   # In .github/workflows/pages.yml, add:
   if [ -f "FAQ.md" ]; then
     cp FAQ.md docs/faq.md
   fi
   ```

3. **Commit and push**
   ```bash
   git add FAQ.md .github/workflows/pages.yml
   git commit -m "Add FAQ page"
   git push origin main
   ```

4. **Access at**
   - https://forrtproject.github.io/fred_zotero/faq

---

## 🐛 Troubleshooting

### Pages Not Deploying

**Check:**
1. Is GitHub Pages enabled in Settings → Pages?
2. Source set to "GitHub Actions"?
3. Check Actions tab for errors

### 404 Error

**Fix:**
- Wait 2-3 minutes after first deployment
- Check workflow completed successfully
- Verify URL: https://forrtproject.github.io/fred_zotero/

### Old Content Showing

**Fix:**
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- GitHub Pages may cache for a few minutes
- Check workflow ran successfully

---

## 🎯 Quick Start Checklist

- [ ] Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)
- [ ] Push to main branch to trigger deployment
- [ ] Wait 1-2 minutes
- [ ] Visit https://forrtproject.github.io/fred_zotero/
- [ ] Check plugin metadata shows correct homepage
- [ ] Done! ✅

---

## 📚 Learn More

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Themes](https://pages.github.com/themes/)
- [GitHub Actions for Pages](https://github.com/actions/deploy-pages)
