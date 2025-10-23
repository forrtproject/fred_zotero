# Zotero Replication Checker

A privacy-first Zotero 7 plugin that discovers replication studies for items in your library using the [FORRT Replication Database (FReD)](https://forrt.org/replication-hub/). It scans your local library for DOIs, checks against FReD using privacy-preserving prefix matching, notifies you when replications exist, and allows easy addition to your library—all without sending identifiable data off your machine.

This plugin was developed as a [FORRT](https://forrt.org/) project to build a working prototype for the open science community. It helps researchers discover replication studies by identifying items with known replications and unobtrusively notifying them via tags and notes. 

## Features

- 🔍 **Privacy-preserving matching**: Uses hash prefixes to query the database without exposing your library contents
- 📚 **Batch processing**: Checks entire library or selected items in one operation
- 🏷️ **Automatic tagging**: Adds "Has Replication" tag to items with replications
- 📝 **Detailed notes**: Creates child notes with replication details (title, authors, journal, outcome, DOI)
- ⚡ **Fast**: Efficient hash-based lookup with collision handling

## Installation
### Prerequisites
Zotero version 7 or later. Guidance on installation and updating for Zotero is available here: https://www.zotero.org/support/installation

### From XPI File

1. Download `replication-checker.xpi`
2. Open Zotero version 7 +
3. Go to **Tools → Plugins**
4. Click the gear icon → **Install Plugin From File**
5. Select `replication-checker.xpi`
6. Restart Zotero

### From Source

For Windows
```bash
./build.bat
```

For macOS
```bash
./build.sh
```

Then install the generated replication-checker.xpi

## Usage

### Check Entire Library

1. Go to **Tools → Check Library for Replications**
2. A progress window will show the scan status
3. Items with replications will be tagged and annotated

This may take some time depending on the size of the library. While the plugin is scanning the library the Check Selected Items option won't work.

### Check Selected Items

1. Select one or more items in your library
2. Right-click → **Check for Replications**
3. Selected items will be checked and tagged if replications are found

## How It Works

### Privacy-Preserving Architecture

1. **Hash Generation**: Plugin generates MD5 hash prefixes (first 3 characters) from your DOIs. 
2. **Batch Query**: Sends all prefixes in ONE query to the local database
3. **Local Verification**: Database returns all candidates matching those prefixes
4. **Exact Matching**: Plugin verifies locally which candidates actually match your DOIs

**Privacy guarantee**: The database only sees 3-character hash prefixes, not your actual DOIs. This means that the contents of your library are not shared at any time.

### What Gets Added to Zotero Items

When a replication is found:
- **Tag**: "Has Replication" (easily filter your library)
- **Note**: Child note with:
  - Replication title
  - Authors and year
  - Journal
  - DOI (clickable link)
  - Outcome (e.g., "successful", "failed", "mixed")

#### What does replication outcome mean?

The plugin automatically creates a tag and an entry in the note based on the FReD Database outcome column. This is coded based on how authors interpreted their results. Tags are created only for outcomes "Replication: Succesful", "Replication: Failed" and "Replication: Mixed". This is to enable filtering in Zotero based on the replication outcome. Full info about coding of this variable can be found [here](https://github.com/forrtproject/FReD-data/blob/main/cos_report.html).

## Data Source

Currently uses a live API endpoint (https://ouj1xoiypb.execute-api.eu-central-1.amazonaws.com/v1/prefix-lookup) to query the FORRT Replication Database (FReD) for up-to-date replication studies. The API returns candidates based on 3-character MD5 hash prefixes, ensuring privacy by not requiring full DOIs.

## Development

### Project Structure

```
fred_zotero/
├── manifest.json                 # Plugin metadata
├── chrome.manifest              # Register UI overlays
├── chrome/
│   └── content/
│       ├── overlay.xhtml        # UI additions (menu items)
│       ├── data-source.js   # Data source abstraction
│       ├── batch-matcher.js # Core matching logic
│       ├── bootstrap.js     # Plugin lifecycle
│       ├── zotero-integration.js  # Zotero API wrapper
│       ├── replication-checker.js # Main plugin logic
│       └── scripts/
│           └── crypto-js.min.js      # MD5 hashing
│           
├── locale/
│   └── en-US/
│       └── overlay.dtd          # UI strings
└── data/
    └── fred_mini.csv            # Replication database 
```

### Key Components

### Debugging

Enable Zotero debug output:
1. **Help → Debug Output Logging** → Enable
2. **Help → Show Debug Output**
3. Look for console.log messages from the plugin

## Testing

### Manual Testing

## Roadmap

- [ ] Add caching to avoid re-checking items
- [ ] Support for checking new items automatically
- [ ] Export replication report

## Contributing
We welcome all forms of contribution! [Get in touch](https://forrt.org/about/get-involved/) if you want to get involved.

## Feedback
Do you have feedback for us? Open an issue here if you encounter bugs or documentation issues. You can also contact us anonymously about the Replication Checker Plug [here](https://tinyurl.com/y5evebv9).
