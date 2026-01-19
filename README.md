# Zotero Replication Checker

A privacy-first Zotero 7 plugin that discovers replication studies for items in your library using the [FORRT Replication Database (FReD)](https://forrt.org/replication-hub/). It scans your local library for DOIs, checks against FReD using privacy-preserving prefix matching, notifies you when replications exist, and allows easy addition to your library—all without sending identifiable data off your machine.

This plugin was developed as a [FORRT](https://forrt.org/) project to build a working prototype for the open science community. It helps researchers discover replication studies by identifying items with known replications and unobtrusively notifying them via tags and notes.

## Features

- 🔍 **Privacy-preserving matching**: Uses hash prefixes to query the database without exposing your library contents
- 📚 **Batch processing**: Checks entire library, selected items, or collections in one operation
- 📖 **Read-only library support**: Automatically detects read-only group libraries and offers to copy originals and replications to your Personal library
- 🏷️ **Automatic tagging**: Adds contextual tags including "Has Replication", "Is Replication", and "Original present in Read-Only Library"
- 📝 **Detailed notes**: Creates child notes with replication details (title, authors, journal, outcome, DOI)
- 🔗 **Smart organization**: Creates separate collections for originals from read-only libraries and their replications
- 🔄 **Bidirectional linking**: Automatically links original studies with their replications as related items
- 🚫 **Blacklist management**: Ban unwanted replications from being re-added during future checks
- 🌍 **Multi-language support**: Available in English and German, with easy localization for additional languages
- ⚡ **Fast**: Efficient hash-based lookup with collision handling

## Installation

### Prerequisites

Zotero version 7 or later. Guidance on installation and updating for Zotero is available at <https://www.zotero.org/support/installation>

### From XPI File

1. Download the latest `zotero-replication-checker.xpi` from releases
2. Open Zotero version 7+
3. Go to **Tools → Add-ons**
4. Click the gear icon (⚙️) → **Install Add-on From File**
5. Select `zotero-replication-checker.xpi`
6. Restart Zotero

### From Source

**Prerequisites:**

- Node.js v22.17.0 (or compatible version)
- npm 10.9.2+

**Build steps:**

```bash
# Install dependencies
npm install

# Build the plugin
npm run build
```

The built XPI file will be at `.scaffold/build/zotero-replication-checker.xpi`

Then install the generated XPI file following the steps above.

## Usage

### Check Current Library or Group Libraries

1. Go to **Tools → Check Current Library for Replications**
2. A progress window will show the scan status
3. Items with replications will be tagged and annotated

The command scans whichever library is currently selected in Zotero (personal, group, etc.).

**For editable libraries:**

- Original items get "Has Replication" tag and a replication note
- Replication items are added to "Replication folder" collection
- Items are automatically linked as related items

**For read-only group libraries:**

- Plugin detects the library is read-only
- Shows a confirmation dialog with the count of items with replications
- If you accept:
  - Original items are copied to a new collection named `{LibraryName} [Read-Only]` in your Personal library
  - Replication items are copied to "Replication folder" in your Personal library
  - Both originals and replications get tagged with "Original present in Read-Only Library"
  - All items are linked bidirectionally and replication notes are added

### Check Selected Items or Collections

1. Select one or more items in your library or collections
2. Right-click → **Check for Replications**
3. Selected items will be checked and tagged if replications are found

This works for both editable and read-only libraries, with the same behavior as library-wide checks.

### Check Newly Added Items

- The plugin automatically checks newly added items (enabled by default). You can turn this off from the Replication Checker preferences panel if you prefer to run all scans manually.

### Ban Replications

Sometimes you may want to prevent specific replications from being re-added to your library during future checks.

**To ban a replication:**

1. Right-click on a replication item (tagged with "Is Replication" or "Added by Replication Checker")
2. Select **Ban Replication**
3. Confirm the action
4. The item will be moved to trash and added to your blacklist

**Managing banned replications:**

1. Go to **Zotero → Preferences → Replication Checker for Zotero**
2. Scroll to the "Banned Replications" section
3. View all banned items in a table showing:
   - Replicated Article title
   - Original Article title
   - Date when banned
4. Select an entry and click **Remove Selected** to unban it
5. Click **Clear All Banned Replications** to reset the entire blacklist

**How it works:**

- Banned replications will never be re-added to your library during future checks
- The replication note on the original article still shows ALL replications (including banned ones)
- Only the automatic addition to the "Replication folder" is prevented
- Blacklist is stored locally in Zotero preferences

### Preferences

Open **Zotero → Preferences → Replication Checker for Zotero** to configure:

**Auto-Check Library for Replications:**

- **Frequency options**: Disabled, Daily, Weekly, or Monthly (default: Monthly)
- **Automatically check newly added items**: Enabled by default - items are scanned when added to your library

**Banned Replications:**

- View and manage replications you've banned from appearing in your library
- Remove individual entries or clear all banned replications at once

> **Note:** When you uninstall the plugin, all preferences (including the blacklist) are automatically cleared. This ensures a fresh start if you reinstall.

## How It Works

### Privacy-Preserving Architecture

1. **Hash Generation**: Plugin generates MD5 hash prefixes (first 3 characters) from your DOIs. 
2. **Batch Query**: Sends all prefixes in ONE query to the local database
3. **Local Verification**: Database returns all candidates matching those prefixes
4. **Exact Matching**: Plugin verifies locally which candidates actually match your DOIs

**Privacy guarantee**: The database only sees 3-character hash prefixes, not your actual DOIs. This means that the contents of your library are not shared at any time.

### What Gets Added to Zotero Items

When a replication is found:

**For editable libraries:**

- **Tags on original items**:
  - "Has Replication" (easily filter your library)
  - Outcome tags: "Replication: Successful", "Replication: Failure", or "Replication: Mixed"
- **Tags on replication items**:
  - "Is Replication"
- **Note**: Child note on original item with:
  - Replication title
  - Authors and year
  - Journal
  - DOI (clickable link)
  - Outcome (e.g., "successful", "failed", "mixed")
- **Collections**:
  - Replication items added to "Replication folder"
- **Related items**: Bidirectional links between originals and replications

**For read-only libraries:**

- **Tags on copied original items**:
  - "Has Replication"
  - "Original present in Read-Only Library"
  - Outcome tags
- **Tags on replication items**:
  - "Is Replication"
  - "Added by Replication Checker"
  - "Original present in Read-Only Library"
- **Collections**:
  - Original items added to `{LibraryName} [Read-Only]` collection in Personal library
  - Replication items added to "Replication folder" in Personal library
- **Note**: Same replication note structure as editable libraries
- **Related items**: Bidirectional links maintained

> **Note:** The replication note is automatically maintained by the plugin. Manual edits may be overwritten the next time the item is checked.

### What Does Replication Outcome Mean?

The plugin automatically creates a tag and an entry in the note based on the FReD Database outcome column. This is coded based on how authors interpreted their results. Tags are created only for outcomes "Replication: Successful", "Replication: Failure" and "Replication: Mixed". This is to enable filtering in Zotero based on the replication outcome. Full info about coding of this variable can be found [here](https://github.com/forrtproject/FReD-data/blob/main/cos_report.html).

### What Does it Mean if "The study has a linked report"

Some studies are linked to a separate URL. This happens in two cases:
- The study does not have a published version, therefore it does not have a DOI but a URL
- The study is part of a multi-study replication effort. The DOI links to the published study, while the URL links to a replication report in a public repositories (e.g. OSF, Zenodo)

## Data Source

Currently uses a live API endpoint (<https://rep-api.forrt.org/v1/prefix-lookup>) to query the FORRT Replication Database (FReD) for up-to-date replication studies. The API returns candidates based on 3-character MD5 hash prefixes, ensuring privacy by not requiring full DOIs.

## Localization

The plugin supports multiple languages and automatically uses your Zotero language preference.

**Currently available languages:**

- English (en-US) ✅
- German (de) ✅

**What gets translated:**

- All menu items and dialogs
- Progress messages and alerts
- Tags (e.g., "Has Replication" → "Hat Replikation" in German)
- Note headings and content
- Preference panel labels

**Adding new languages:**

Want to use the plugin in your language? See [LOCALIZATION.md](LOCALIZATION.md) for a complete guide on adding translations. Contributing a translation is easy - just copy the English `.ftl` file and translate the strings while preserving placeholders.

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
│   │   ├── dataSource.ts            # API communication (queries FReD database)
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
- **`src/modules/dataSource.ts`**: API communication with FReD database using privacy-preserving prefixes
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

## Feedback

Do you have feedback for us? Open an issue here if you encounter bugs or documentation issues. You can also [contact us anonymously about the Replication Checker](https://tinyurl.com/y5evebv9).
