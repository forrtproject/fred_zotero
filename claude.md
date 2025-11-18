# Zotero Replication Checker - Build & Development Guide

## Build System Overview

This is a Zotero 7+ plugin using:
- **TypeScript** for source code
- **Zotero Plugin Scaffold** (`zotero-plugin-scaffold`) for building
- **npm** for package management
- **NVM** (Node Version Manager) for Node.js installation

## Prerequisites

- **Node.js v22.17.0** (via NVM)
- **npm 10.9.2** (installed with Node)
- **Dependencies** installed via `npm install`

## Building the Plugin

### Correct Build Process

The plugin is in TypeScript and must be compiled before use. The correct build command is:

```bash
npm run build
```

This runs: `zotero-plugin build && tsc --noEmit`
- First part: Bundles and packs the XPI file
- Second part: Type checks with TypeScript (errors are warnings, doesn't block build)

### Environment Setup (CRITICAL)

Node.js is installed via NVM and is NOT in the default PATH. Before running any npm commands:

```bash
export PATH="/Users/lukaswallrich/.nvm/versions/node/v22.17.0/bin:$PATH"
npm run build
```

**Alternatively**, use the full path:
```bash
/Users/lukaswallrich/.nvm/versions/node/v22.17.0/bin/npm run build
```

### Build Output

- **Success indicator**: Look for `✔ Build finished in X.XXs`
- **XPI file location**: `.scaffold/build/zotero-replication-checker.xpi` (472 KB)
- **TypeScript errors**: Listed after build, but do NOT prevent XPI creation
  - These are pre-existing type compatibility issues with Zotero API types
  - The plugin still works despite these errors

## Important Files for Building

| File | Purpose |
|------|---------|
| `package.json` | npm dependencies and build scripts |
| `tsconfig.json` | TypeScript configuration |
| `zotero-plugin.config.ts` | Zotero plugin scaffold config |
| `.scaffold/build/` | Output directory for built plugin |
| `addon/bootstrap.js` | Plugin lifecycle entry point |
| `src/` | TypeScript source code |

## Development Workflow

1. **Make code changes** in `src/` directory
2. **Run type check**: `npm run build` (sets up PATH first!)
3. **Check for errors** in output
4. **Install in Zotero**: Restart Zotero to load new XPI

## Key Source Files

- **`src/hooks.ts`**: Lifecycle hooks, UI registration (context menus, Tools menu)
- **`src/modules/replicationChecker.ts`**: Main plugin logic
- **`src/modules/dataSource.ts`**: API communication (queries FReD database)
- **`src/modules/batchMatcher.ts`**: Privacy-preserving DOI matching logic
- **`src/utils/zoteroIntegration.ts`**: Zotero API wrapper

## Recent Fixes

### 1. API Response Parsing (dataSource.ts)
**Issue**: "API query failed: results is not iterable" error
**Root cause**: API response wraps data in a `results` key; code wasn't extracting it
**Fix**: Added `const data = responseData.results || responseData;` to handle the response structure

### 2. Context Menu Registration (hooks.ts)
**Issue**: Right-click context menu items ("Check for Replications") weren't appearing
**Root cause**: Manually creating XUL elements and searching for popup elements by incorrect IDs
**Fix**: Switched to proper `ztoolkit.Menu.register()` API for "item" and "collection" menus

## TypeScript Compilation Errors (Pre-existing)

These do NOT prevent the build from succeeding:
- Services.prompt method signature mismatches
- Window type compatibility (MainWindow vs mozIDOMWindowProxy)
- Read-only property assignments (libraryID)
- HTML/TrustedHTML type mismatches

These are framework/type definition compatibility issues that don't affect runtime functionality.

## Testing the Build

After building:
1. Generated XPI is at: `.scaffold/build/zotero-replication-checker.xpi`
2. Install in Zotero: `Tools → Add-ons → Settings → Install Add-on From File`
3. Restart Zotero
4. Check debug output: `Help → Show Debug Output`
5. Look for `[ReplicationChecker]` messages in the console

## Debugging & Console Output

### Why Zotero.debug() doesn't work

The plugin builds in **production mode** by default, which disables `Zotero.debug()` logging via ztoolkit. To see debugging output, the plugin uses `console.log()` instead.

### View Console Output

In **Zotero Standalone**:
1. **Tools → Developer Tools** (or `Ctrl+Shift+I` / `Cmd+Shift+I`)
2. Click the **Console** tab
3. Run the replication check
4. Look for `[BatchMatcher]` and `[APIDataSource]` messages

### Expected Console Messages

When running "Check Library for Replications":
- `[BatchMatcher] Checking X DOIs...`
- `[BatchMatcher] Input DOIs: ...`
- `[BatchMatcher] Normalized to X valid DOIs`
- `[BatchMatcher] DOI: ... -> Prefix: ...`
- `[APIDataSource] Querying API with X prefixes`
- `[APIDataSource] Prefix 'XXX': X entries`
- `[BatchMatcher] Found X DOIs with replications out of X checked`

### Production vs Development Mode

- Current builds use **production mode** (default)
- Build happens in production mode but logging still works via `console.log()`
- All `Zotero.debug()` calls go to `console.log()` for visibility
