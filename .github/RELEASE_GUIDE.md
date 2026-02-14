# Release Guide

This guide explains how to create builds and releases for the Zotero Replication Checker plugin.

## 🔄 Automatic Builds (For Testing)

**When:** On every push to any branch

**What happens:**
1. Code is compiled with TypeScript
2. Plugin is bundled with `npm run build`
3. XPI file is created and uploaded as a GitHub artifact
4. Artifact is available for 30 days

**How to download:**
1. Go to the Actions tab
2. Click on the build workflow run
3. Scroll to "Artifacts" section
4. Download `zotero-replication-checker-build-[SHA]`

**Use case:** Testing builds before creating official releases

---

## 🚀 Creating Releases

### Method 1: Git Tag (Recommended)

**Step-by-step:**

1. **Update version in package.json**
   ```bash
   # Edit package.json and update version
   # Example: "version": "0.3.0" → "version": "0.4.0"
   ```

2. **Commit the version change**
   ```bash
   git add package.json
   git commit -m "Bump version to v0.4.0"
   ```

3. **Create and push a git tag**
   ```bash
   git tag v0.4.0
   git push origin v0.4.0
   ```

4. **GitHub Actions will automatically:**
   - Build the plugin with `npm run build`
   - Read version from `package.json`
   - Create XPI file named `zotero-replication-checker-v0.4.0.xpi`
   - Generate `update.json` for auto-updates
   - Create GitHub release with both files
   - Generate release notes from commits

**Result:** Release appears at `https://github.com/forrtproject/flora_zotero/releases`

---

### Method 2: Manual Trigger (GitHub UI)

**Step-by-step:**

1. Go to **Actions** tab on GitHub
2. Click **Create Release** workflow
3. Click **Run workflow** button
4. Enter version (e.g., `v0.4.0`)
5. Click **Run workflow**

**Note:** This method uses the version you specify, NOT package.json version

---

## 📦 Release Artifacts

Each release includes:

1. **`zotero-replication-checker-v[VERSION].xpi`** - Installable plugin file
2. **`update.json`** - Auto-update configuration file

---

## 🏷️ Version Naming

**Format:** `v[MAJOR].[MINOR].[PATCH]`

**Examples:**
- `v0.3.0` - Current release
- `v0.3.1` - Bug fix release
- `v0.4.0` - New features release
- `v1.0.0` - Major release
- `v1.0.0-beta.1` - Pre-release (marked as prerelease)
- `v1.0.0-alpha.1` - Early pre-release (marked as prerelease)

**Pre-releases:**
- Tags containing `alpha` or `beta` are automatically marked as pre-releases
- Example: `v0.4.0-beta.1`

---

## 📝 Release Checklist

Before creating a release:

- [ ] Update `package.json` version
- [ ] Test the build locally with `npm run build`
- [ ] Update CHANGELOG or release notes if needed
- [ ] Commit all changes
- [ ] Create and push git tag
- [ ] Verify release on GitHub
- [ ] Test downloading and installing the XPI
- [ ] Announce release (if applicable)

---

## 🔧 Troubleshooting

### Build fails in GitHub Actions

**Check:**
1. Does `npm run build` work locally?
2. Are all dependencies in `package.json`?
3. Check the Actions log for specific errors

### Release not created

**Check:**
1. Did you push the tag? `git push origin v0.X.Y`
2. Does the tag follow the `v*` pattern?
3. Check GitHub Actions permissions (Settings → Actions → General)

### Wrong version in release

**Fix:**
1. Delete the tag: `git tag -d v0.X.Y && git push origin :refs/tags/v0.X.Y`
2. Update `package.json` version
3. Commit and create new tag

---

## 🎯 Quick Reference

```bash
# Local build
npm run build

# Create release (full workflow)
# 1. Update version
vim package.json  # Change version to 0.4.0

# 2. Commit
git add package.json
git commit -m "Bump version to v0.4.0"

# 3. Tag and push
git tag v0.4.0
git push origin main
git push origin v0.4.0

# Done! Check GitHub releases page
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
- [Zotero Plugin Development](https://www.zotero.org/support/dev/zotero_7_for_developers)
