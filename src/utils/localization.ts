/**
 * Custom localization loader for Zotero plugins
 * Manually loads and parses .ftl files since Zotero unprivileged extensions
 * cannot use the standard Firefox l10n mechanism
 */

type LocaleParams = Record<string, string | number>;

/**
 * Parse a Fluent .ftl file and extract message strings
 */
function parseFtlContent(content: string): Map<string, string> {
  const messages = new Map<string, string>();

  // Split by lines and process
  const lines = content.split('\n');
  let currentKey = '';
  let currentValue = '';
  let inMessage = false;

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') {
      currentKey = '';
      currentValue = '';
      inMessage = false;
      continue;
    }

    // Match key = value pattern
    const match = line.match(/^([a-zA-Z0-9\-_]+)\s*=\s*(.+)$/);
    if (match) {
      if (currentKey) {
        messages.set(currentKey, currentValue.trim());
      }
      currentKey = match[1];
      currentValue = match[2];
      inMessage = true;
    } else if (inMessage && line.trim().length > 0 && !line.startsWith(' ')) {
      // New section started
      if (currentKey) {
        messages.set(currentKey, currentValue.trim());
      }
      currentKey = '';
      currentValue = '';
      inMessage = false;
    } else if (inMessage && line.trim().length > 0) {
      // Continuation of multi-line value
      currentValue += '\n' + line;
    }
  }

  // Don't forget the last message
  if (currentKey && currentValue) {
    messages.set(currentKey, currentValue.trim());
  }

  return messages;
}

/**
 * Custom getString implementation that falls back to the localization map
 */
export class LocalizationManager {
  private messages: Map<string, string> = new Map();
  private originalGetString: ((key: string, substitutions?: any) => string) | null = null;

  /**
   * Load localization from the .ftl file in the plugin
   */
  async loadLocalization(localeFileUri: string): Promise<void> {
    try {
      // Try to load the file
      const xhr = new XMLHttpRequest();
      xhr.open('GET', localeFileUri, false);
      xhr.send(null);

      if (xhr.status === 200 && xhr.responseText) {
        this.messages = parseFtlContent(xhr.responseText);
        Zotero.debug(`[ReplicationChecker] Loaded ${this.messages.size} localization strings`);
      } else {
        Zotero.debug(`[ReplicationChecker] Failed to load localization file: ${xhr.status}`);
      }
    } catch (error) {
      Zotero.debug(`[ReplicationChecker] Error loading localization: ${error}`);
    }
  }

  /**
   * Override Zotero.getString to use our localization map as fallback
   */
  initializeStringOverride(): void {
    const originalGetString = Zotero.getString;
    const self = this;

    // @ts-expect-error - Overriding built-in function
    Zotero.getString = function(key: string, substitutions?: any): string {
      // First try to get from our map
      let value = self.messages.get(key);

      if (value) {
        // Handle substitutions like { $itemCount } and { $count }
        if (substitutions) {
          for (const [paramKey, paramValue] of Object.entries(substitutions)) {
            value = value.replace(new RegExp(`\\{\\s*\\$${paramKey}\\s*\\}`, 'g'), String(paramValue));
          }
        }
        return value;
      }

      // Fallback to original Zotero.getString
      try {
        return originalGetString.call(this, key, substitutions);
      } catch {
        // Return key as last resort
        return key;
      }
    };
  }
}

export const localizationManager = new LocalizationManager();
