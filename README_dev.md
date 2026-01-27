# Zotero Replication Checker - development
## Development

### Project Structure

```
fred_zotero/
├── addon/                       # Compiled assets packaged into the XPI
│   ├── bootstrap.js             # Bootstrap entry point
│   ├── content/
│   │   ├── icons/               # Extension icons
│   │   └── preferences.xhtml    # Preferences UI with blacklist management
│   ├── locale/
│   │   └── en-US/
│   │       └── replication-checker.ftl  # Fluent localization strings
│   ├── manifest.json            # Runtime manifest template
│   └── prefs.js                 # Default preference values
├── src/                         # TypeScript source
│   ├── modules/
│   │   ├── replicationChecker.ts    # Main plugin logic, library handling, ban functionality
│   │   ├── blacklistManager.ts      # Blacklist management with persistent storage
│   │   ├── dataSource.ts            # API communication (queries FLoRA database)
│   │   ├── batchMatcher.ts          # Privacy-preserving DOI matching logic
│   │   └── onboarding.ts            # First-run onboarding tour
│   ├── utils/
│   │   ├── zoteroIntegration.ts     # Zotero API wrappers
│   │   └── strings.ts               # Localization string helpers
│   ├── types/
│   │   └── replication.ts           # TypeScript type definitions
│   ├── addon.ts                 # Addon class
│   ├── hooks.ts                 # Lifecycle hooks, UI registration, blacklist UI
│   └── index.ts                 # Entry point registered by bootstrap.js
├── .scaffold/build/             # Output directory for built plugin
│   └── zotero-replication-checker.xpi
├── package.json                 # npm dependencies and build scripts
├── tsconfig.json                # TypeScript configuration
└── zotero-plugin.config.ts      # Zotero plugin scaffold build config
```

### Key Components

- **`src/hooks.ts`**: Lifecycle hooks, UI registration (context menus, Tools menu), blacklist UI initialization
- **`src/modules/replicationChecker.ts`**: Main plugin logic, handles both editable and read-only libraries, manages collections and tags, ban functionality
- **`src/modules/blacklistManager.ts`**: Manages banned replications with persistent storage and fast DOI lookup
- **`src/modules/dataSource.ts`**: API communication with FLoRA database using privacy-preserving prefixes
- **`src/modules/batchMatcher.ts`**: Privacy-preserving DOI matching using MD5 hash prefixes
- **`src/utils/zoteroIntegration.ts`**: Zotero API wrappers for DOI extraction, tagging, notes
- **`src/utils/strings.ts`**: Fluent localization string helpers
- **`addon/locale/en-US/replication-checker.ftl`**: All user-facing strings including read-only library messages and ban feature
- **`addon/content/preferences.xhtml`**: Preferences UI with auto-check settings and blacklist management table

### Building the Plugin

The plugin uses TypeScript and must be compiled before use:

```bash
npm run build
```

This command:

1. Bundles and packs the XPI file using `zotero-plugin-scaffold`
2. Type checks with TypeScript (errors are warnings, don't block build)

**Build output:**

- Success indicator: `✔ Build finished in X.XXs`
- XPI file location: `.scaffold/build/zotero-replication-checker.xpi`

**Install in Zotero:**

1. Go to **Tools → Add-ons → Settings** (gear icon)
2. Select **Install Add-on From File**
3. Choose the XPI file
4. Restart Zotero

### Debugging

The plugin outputs debug information to help troubleshoot issues.

**Enable Zotero debug output:**

1. **Help → Debug Output Logging** → Enable
2. **Help → Show Debug Output**
3. Look for `[ReplicationChecker]`, `[BatchMatcher]`, and `[APIDataSource]` entries

**Open Developer Tools (for detailed console output):**

1. **Tools → Developer Tools** (or `Ctrl+Shift+I` / `Cmd+Shift+I`)
2. Click the **Console** tab
3. Run a replication check
4. Look for detailed logging including DOI processing, API queries, and item creation

**Expected debug messages:**

- `[BatchMatcher] Checking X DOIs...`
- `[BatchMatcher] Normalized to X valid DOIs`
- `[APIDataSource] Querying API with X prefixes`
- `[APIDataSource] Prefix 'XXX': X entries`
- `[BatchMatcher] Found X DOIs with replications out of X checked`
- `[ReplicationChecker] Copied item X to library Y`
- `[ReplicationChecker] Created "{LibraryName} [Read-Only]" collection`

## Testing

### Manual Testing

**Test with editable library:**

1. Add items with DOIs that have known replications (e.g., DOI: `10.1037/pspa0000073`)
2. Run **Tools → Check Current Library for Replications**
3. Verify:
   - Items get "Has Replication" tag
   - Replication note is created
   - Replication items appear in "Replication folder"
   - Bidirectional related items links work

**Test with read-only group library:**

1. Join or create a read-only group library in Zotero
2. Add items with DOIs that have replications
3. Run **Tools → Check Current Library for Replications**
4. Verify:
   - Read-only dialog appears with correct counts
   - After accepting:
     - Original items copied to `{LibraryName} [Read-Only]` collection in Personal library
     - Replication items added to "Replication folder"
     - Tags applied correctly: "Original present in Read-Only Library"
     - Bidirectional links and notes created

**Test context menu:**

1. Select specific items
2. Right-click → **Check for Replications**
3. Verify same behavior as library-wide check

**Test collection check:**

1. Create a collection with items that have replications
2. Right-click collection → **Check for Replications**
3. Verify items in collection are processed correctly

**Test ban functionality:**

1. After running a replication check, right-click a replication item
2. Select **Ban Replication**
3. Confirm the action
4. Verify:
   - Item is moved to trash
   - Item appears in **Preferences → Replication Checker → Banned Replications** table
5. Run the check again on the same original item
6. Verify:
   - Replication note still shows the banned replication
   - Banned replication is NOT re-added to "Replication folder"
7. Go to preferences and click **Remove Selected** or **Clear All**
8. Run check again
9. Verify banned item is now re-added

## Roadmap

- [ ] Add caching to avoid re-checking items
- [x] Support for checking new items automatically
- [x] Support for read-only group libraries
- [x] Multi-language support (English & German)
- [ ] Export replication report
- [ ] Batch duplicate detection to avoid creating multiple copies
- [ ] Option to customize collection names
- [ ] Additional language translations (French, Spanish, etc.)