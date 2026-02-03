# Localization Guide for Zotero Replication Checker

This plugin supports multiple languages through Fluent localization files. The plugin automatically detects the user's Zotero language preference and uses the appropriate translation.

## How Localization Works

1. **Automatic Detection**: The plugin detects the user's Zotero language setting (e.g., `de`, `fr`, `es`, `en-US`)
2. **Locale Loading**: It loads the corresponding `.ftl` file from `addon/locale/{language}/replication-checker.ftl`
3. **Fallback**: If a translation doesn't exist for the user's language, it falls back to English (`en-US`)
4. **Hardcoded Fallback**: If locale files can't be loaded, it uses hardcoded English strings

## Supported Languages

Currently supported languages:

- **English (en-US)**: `addon/locale/en-US/replication-checker.ftl` ✅
- **German (de)**: `addon/locale/de/replication-checker.ftl` ✅

## Adding a New Language

To add support for a new language, follow these steps:

### Step 1: Create a New Locale Directory

Create a new directory under `addon/locale/` with the language code:

```
addon/locale/{language-code}/
```

**Common language codes:**
- French: `fr`
- Spanish: `es`
- Portuguese: `pt-BR`
- Italian: `it`
- Chinese (Simplified): `zh-CN`
- Japanese: `ja`
- Russian: `ru`

### Step 2: Copy the English Template

Copy the English `.ftl` file as a starting point:

```bash
cp addon/locale/en-US/replication-checker.ftl addon/locale/{language-code}/replication-checker.ftl
```

### Step 3: Translate All Strings

Open `addon/locale/{language-code}/replication-checker.ftl` and translate all strings.

**Important guidelines:**

1. **Keep the key names unchanged** (e.g., `replication-checker-tools-menu`)
2. **Translate only the text after the `=` sign**
3. **Preserve placeholders** like `{ $itemCount }`, `{ $title }`, etc.
4. **Keep HTML tags** intact (e.g., `<a href="{ $url }">`)
5. **Maintain line breaks** (`\n`) in the same positions

### Step 4: Test the Translation

1. Build the plugin:
   ```bash
   npm run build
   ```

2. Install the built XPI in Zotero

3. Change Zotero's language:
   - Go to **Edit → Preferences → Advanced → General**
   - Set your language preference
   - Restart Zotero

4. Verify that all text appears in the new language

## Translation Example

**English (en-US):**
```ftl
replication-checker-tools-menu = Check Current Library for Replications
replication-checker-readonly-dialog-message =
    This library is read-only. We found { $itemCount } item(s) with { $replicationCount } replication(s).

    Would you like to copy the original articles and their replications to your Personal library's "Replication folder"?
```

**German (de):**
```ftl
replication-checker-tools-menu = Aktuelle Bibliothek auf Replikationen prüfen
replication-checker-readonly-dialog-message =
    Diese Bibliothek ist schreibgeschützt. Wir haben { $itemCount } Eintrag/Einträge mit { $replicationCount } Replikation(en) gefunden.

    Möchten Sie die Originalartikel und ihre Replikationen in den "Replikationsordner" Ihrer persönlichen Bibliothek kopieren?
```

## Special Considerations

### Tags and Notes

Tags and notes are also localized! When a user has Zotero set to German, they will see:

**Tags:**
- "Has Replication" → "Hat Replikation"
- "Is Replication" → "Ist Replikation"
- "Original present in Read-Only Library" → "Original in schreibgeschützter Bibliothek vorhanden"

**Note Content:**
The replication note's heading "Replications Found" → "Replikationen gefunden"

This means researchers can share their libraries with colleagues using different languages, and each person will see tags and notes in their preferred language.

### Performance

Localization has minimal overhead:
- Locale files are loaded once on startup
- String lookups are cached by Zotero
- Fallback to English is instant if a translation is missing

## Testing Your Translation

### Checklist

- [ ] All menu items appear correctly
- [ ] Dialog messages are properly formatted
- [ ] Progress messages display correctly
- [ ] Tags appear in the new language
- [ ] Notes are created with translated headings
- [ ] Placeholder values (like `{ $count }`) are properly substituted
- [ ] Multi-line messages maintain proper formatting
- [ ] No missing strings (check debug output for warnings)

### Debug Output

Enable Zotero debug output to verify locale loading:

1. **Help → Debug Output Logging** → Enable
2. Look for:
   ```
   [ReplicationChecker] Locale loaded: de
   ```
   or
   ```
   [ReplicationChecker] Fallback to en-US locale
   ```

## File Structure

```
addon/locale/
├── en-US/
│   └── replication-checker.ftl    # English (default)
├── de/
│   └── replication-checker.ftl    # German
├── fr/                             # Add more languages here
│   └── replication-checker.ftl
└── es/
    └── replication-checker.ftl
```

## Contributing Translations

We welcome translations! To contribute:

1. Fork the repository
2. Add your translation following the steps above
3. Test thoroughly with Zotero set to your language
4. Submit a pull request with:
   - Your new `.ftl` file
   - A note about which Zotero language code it corresponds to
   - Confirmation that you've tested all features

## Need Help?

- **Fluent Syntax Guide**: https://projectfluent.org/fluent/guide/
- **Zotero Localization**: https://www.zotero.org/support/dev/client_coding/localization
- **File an issue**: For help with translations or to report missing strings

## Complete String List

See `addon/locale/en-US/replication-checker.ftl` for the complete list of all translatable strings. The file includes:

- **Menu items** (2 strings)
- **Progress messages** (10 strings)
- **Alerts and errors** (7 strings)
- **Dialog messages** (8 strings)
- **Read-only library handling** (2 strings)
- **Result messages** (6 strings)
- **Tags** (7 strings)
- **Note template** (4 strings)
- **Replication item details** (7 strings)
- **First run prompt** (2 strings)

**Total: ~55 strings to translate**
