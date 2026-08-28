# Changelog

All notable changes to the Zotero Replication Checker are documented here.
Entries are added automatically by the release workflow from `docs/Release.md`.
Versions are listed newest-first.

---

## [v0.1.14] - 2026-08-28
- Added **Zotero 10 support**: the plugin now loads in Zotero 10 (`strict_max_version` raised to a high sentinel so future majors are covered), with full backward compatibility for Zotero 7, 8 and 9
- Fixed **Zotero 10 selection APIs**: Zotero 10 made `getSelectedCollection()` and `getSelectedLibraryID()` *throw* in favour of plural replacements, which broke the collection check, the library check and DOI extraction. A new compatibility layer prefers the plural API and falls back to the singular one, so a single build works across Zotero 7–10+
- Added **multi-collection checks**: Zotero 10 allows several collections to be selected at once; "Check for Replications" now scans all of them, deduplicating items that appear in more than one
- Fixed **auto-update never being offered**: `update.json` hardcoded `strict_max_version: "8.*"`, so Zotero 9 and 10 users were told no compatible update existed. The bounds are now read from the built manifest
- Added **single "FLoRA" container collection** (#99): every collection the plugin manages now lives inside one top-level collection instead of five separate ones. Libraries organised by earlier versions are migrated automatically on first start — collections and their items are moved, never recreated — and the container name is configurable alongside the others
- Fixed **stats always showing the personal library** (#100): the stats search combined a `libraryID` condition with a constructor scope that contradicted it, so group-library counts came back near-zero. Stats now scope correctly, and a **library picker** appears above the table for users who belong to group libraries
- Fixed **"Add Original" failing in group libraries** (#100): originals were always created in the personal library, then linked across a library boundary — which Zotero rejects, aborting the run after the collection had been created but before the item was added. Originals now go to the replication's own library when it is writable, falling back to the personal library only for read-only group libraries
- Fixed **items with both replications and reproductions showing only replications**: reproductions were processed silently behind the dialog, and an item with reproductions but no replications was never shown a dialog at all. One dialog now lists both, and declining skips both
- Fixed **DOI-less item types aborting item creation**: `setField("DOI")` throws on book, report, thesis, manuscript and document items, which FLoRA records of those types map onto. The DOI now falls back to an `Extra` line, which the plugin reads back on the next check
- Added **DOI detection from the URL field**: items saved by the browser connector often carry only a `doi.org` link, and were previously invisible to every check
- Changed **stats to count unique DOIs**: the "Articles" rows counted Zotero items, so the same paper saved twice counted twice and disagreed with what the Atlas button sends. Rows now count distinct normalised DOIs, with a persistent note reporting any tracked items excluded for having no usable DOI
- Fixed **duplicate collections being created**: a modal prompt spins a nested event loop, so a concurrent check could run mid-decision and create a second identically named folder. Find-or-create is now atomic
- Fixed **broken-image boxes in progress popups**: status lines were added via `addLines()` with an empty icon URI, rendering a broken image beside every line; they now use `addDescription()`
- Improved **FLoRA Atlas feedback**: the warning about items that cannot be sent now sits below the button, no longer disappears while the Atlas is opening, and is shown before clicking
- Added **onboarding v2**: a new "Your FLoRA Stats" screen covering the stats pane, library picker and Atlas. Shown once to existing users on update; the scan prompt remains first-install only
- Fixed **literal `\n` in reproduction dialog strings** across all eight non-English locales, which rendered as the characters `\` and `n`
- Updated **translations**: onboarding and the new dialog strings are translated in all nine supported languages
- **Internal**: removed dead code, deduplicated three copies of the result-grouping logic, added unit tests for collection management and DOI handling, and fixed the `test:unit` script quoting so it runs on Windows


## [v0.1.13] - 2026-04-20
- Added **Zotero 9 support**: the plugin now loads in Zotero 9 (`strict_max_version` bumped to `9.*`); full backward compatibility with Zotero 7 and 8 is retained
- Added **French (fr) language support**: the plugin is now fully translated into French, bringing total supported languages to 6 (English, German, Spanish, French, Portuguese Brazil, Portuguese Europe)
- Replaced **"Fetch from FLoRA" + "FLoRA Annotator" buttons** with a single **"Open in FLoRA Atlas ↗"** button in the Stats preferences pane: clicking it opens the [FLoRA Replication Atlas](https://forrt.org/flora-replication-atlas/) pre-loaded with your tracked original DOIs via URL (`?dois=doi1,doi2,...`); for libraries with many tracked originals the DOIs are copied to the clipboard instead and the Atlas opens at its homepage
- Fixed **integration test suite** for the Ban workflow: tests now inject items and confirmation state directly into `banSelectedItems` to bypass XPCOM dialogs that block Mocha's async runner in CI
- Updated **dependency versions**: `zotero-plugin-toolkit` 5.1.2, `zotero-plugin-scaffold` 0.8.6, `zotero-types` 4.1.2; menu registration rewritten to use direct XUL DOM manipulation after `ztoolkit.Menu` was removed in toolkit 5.1.x


## [v0.1.12] - 2026-03-31
- Fixed **"Ban Replication" context menu appearing on non-replication items**: the menu item is now visible only on items tagged `Is Replication` or `Is Reproduction`, removing the broader `Added by Replication Checker` condition that caused it to show on unrelated items
- Added **FLoRA Stats pane** in Preferences: shows live counts (total library items, originals tracked, articles with/identified as replications, articles with/identified as reproductions); updates automatically whenever items change in Zotero — no manual refresh needed; "Fetch from FLoRA" button posts tracked original DOIs to the FLoRA API and reports how many are known to FLoRA and their total replication/reproduction counts; "Open in FLoRA Annotator →" opens the FLoRA Annotator page for users to see the complete replication report
- **Updated FLoRA Stats tag hints**: the Preferences pane now shows "(Has Been Replicated) (Has Been Reproduced)" next to "Original articles tracked", "(Has Been Replicated)" next to "Articles with replications", and "(Has Been Reproduced)" next to "Articles with reproductions"
- Added **four configurable folder names** in Preferences: separate text fields for the Replications folder, Reproductions folder, Originals folder (linked to replications), and Originals folder (linked to reproductions) — all renamed live in Zotero without data loss
- Added **Select Originals dialog**: when multiple original studies are available for a replication, users are offered a choice dialog to select which originals to add rather than being forced to add all
- Improved **result notifications**: "added X new replication(s)" and "updated Y existing replication(s)" are now reported separately with the destination folder name, providing clearer feedback; same for original study additions
- **Merged "Has Replication" → "Has Been Replicated" and "Has Reproduction" → "Has Been Reproduced" tags**: items tagged by previous versions are still recognised via backward-compatible legacy lookups, so no manual re-tagging is required
- **Dynamic context menu label**: the "Add Original" menu item now reads "Add Original(s)" when the selected item has multiple originals (detected via `Replication: Multiple Originals` or `Reproduction: Multiple Originals` tags)
- **Improved "is replication" dialog flow**: when a single original is found the dialog shows a 2-button prompt ("Add Original" / Cancel); when multiple originals are found it shows a 3-button prompt ("Add All Originals" / "Select which originals to add" / Cancel)
- Added **Download button** and **"About the dataset" section** to Website.md and README.md with definitions of replications and reproductions, inclusion criteria, outcome coding, and the replication vs. reproduction distinction


## [v0.1.11] - 2026-03-21
- Added **Portuguese (Europe) language support** (pt-PT): The plugin is now available in five languages — English, German, Spanish, Portuguese (Brazil), and Portuguese (Europe)
- Fixed **snowballing library bug**: Repeated checks on selected items or collections no longer trigger automatic "add original articles?" prompts, which previously caused a cascading loop where each run would find new originals → replications → more originals, growing the library indefinitely. Originals can still be added explicitly via the right-click "Add Original" menu item; the auto-check for newly added items retains the prompt as a discovery feature
- Fixed **manual collection rename being reverted**: If the user renames the "FLoRA Replications" or "FLoRA Reproductions" collection directly in Zotero, the plugin now keeps their name instead of reverting it back on the next check
- Fixed **legacy collection name not recognised on upgrade**: Collections named "Replication folder" (from older plugin versions) are now correctly identified and migrated instead of creating a duplicate collection
- Added **translated tags**: Tags added to Zotero items (e.g. "Has Replication", "Is Replication", outcome tags) are now displayed in the user's language. Items tagged by older plugin versions (English tags) remain fully recognised for backward compatibility


## [v0.1.10] - 2026-03-15

- Added **Multiple Originals support**: replication/reproduction items with more than one original article now receive a dedicated "Original Articles" note listing each original's title, DOI, and outcome (fetched in a single batch API call after items are created)
- Added **Multiple Originals tags**: `Replication: Multiple Originals` / `Reproduction: Multiple Originals` tags applied instead of outcome tags when an item has more than one original
- Fixed **consecutive folder renames**: changing the Replication or Reproduction folder name multiple times in Preferences now correctly renames the same existing collection each time, instead of creating a new one on every rename
- **Fall back to full library check**: When a library (not a collection) is selected, the plugin now runs checkEntireLibrary() instead of showing a "no collection selected" error

## [v0.1.9] - 2026-03-04

- Added email parameter to API requests for usage tracking

## [v0.1.8] - 2026-03-03

- Added **outcome quote handling**: extended RelatedStudy with `outcome_quote_source`; when the quote source is "abstract", an outcome quote is displayed in the replication UI and stored in the item's Extra field
- Improved localization: minor wording fixes and clarifications in German, Spanish, and Brazilian Portuguese locale files

## [v0.1.7] - 2026-02-22

- Improved **deduplication**: more robust handling of BibTeX-imported items and edge cases in existing-item detection
- Added locales: French (fr), Korean (ko), Chinese Simplified (zh-CN), Arabic (ar)
- Fixed jq errors in GitHub Pages workflow when the latest release has no `update.json` asset

## [v0.1.6] - 2026-02-16

- Renamed project repository to **flora_zotero**
- Added **batch "Add to Library"**: users can add multiple replications in one step from the results dialog
- Added theme-aware icons that adapt to Zotero's light/dark theme
- Improved `update.json` fetching — always pulls from the latest GitHub release

## [v0.1.5] - 2026-02-10

- Added **SHA-512 hash verification** in `update.json` (`update_hash: "sha512:…"`) so Zotero can verify XPI integrity during auto-updates

## [v0.1.4] - 2026-02-10

- Fixed XPI filename in release workflow: use the scaffold-generated filename instead of a hardcoded name, preventing mismatches between the XPI and `update.json`/download links

## [v0.1.3] - 2026-02-10

- Switched data source from **FReD** to **FLoRA** (FORRT Library of Reproduction and Replication Attempts)
- Added **Reproduction support**: detects computational reproductions with dedicated notes and "Has Reproduction" / "Is Reproduction" tags

## [v0.1.2] - 2026-01-27

- Minor stability improvements and build fixes

## [v0.1.1] - 2026-01-27

- Added **"Add Original" feature**: right-click a replication to add its original article to your library
- Added **Ban Replications**: right-click to ban a replication from being re-added; manage the blacklist in Preferences
- Added **Auto-Check Library**: scheduled checks (daily/weekly/monthly) for new replications
- Added **Read-Only Library support**: detects read-only group libraries and copies originals/replications to your Personal library
- Improved onboarding flow

## [v0.1.0] - 2025-12-09

- Initial release of the Zotero Replication Checker
- Privacy-preserving DOI lookup via 3-character MD5 hash prefixes
- Replication detection with "Has Replication" / "Is Replication" tags and child notes
- Bidirectional related-item linking between originals and replications
- Configurable replication folder name in Preferences
- Auto-check for newly added items
- English and German localization
