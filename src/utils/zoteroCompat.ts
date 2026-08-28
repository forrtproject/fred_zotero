/**
 * Compatibility shims for Zotero APIs that changed between major versions.
 *
 * Zotero 10 lets the user select several collections, saved searches or
 * libraries at once. The singular selection getters were not merely deprecated
 * — they now *throw*, with an error naming the plural replacement, so that a
 * plugin cannot silently operate on one arbitrary row of a multi-row selection.
 *
 * Each helper prefers the plural API and falls back to the singular one, so a
 * single build keeps working on Zotero 7, 8 and 9 as well as 10 and later.
 * Everything is probed at call time rather than cached, because a plugin can
 * outlive an in-place Zotero upgrade.
 */

/** `ZoteroPane`, which zotero-types models only for the version being built against. */
type Pane = ReturnType<typeof Zotero.getActiveZoteroPane> & Record<string, any>;

function pane(): Pane | null {
  try {
    return (Zotero.getActiveZoteroPane() as Pane) ?? null;
  } catch {
    return null;
  }
}

/**
 * Collections currently selected in the collections pane.
 *
 * @returns Selected collection objects; empty when a library, saved search or
 *   other non-collection row is selected.
 */
export function getSelectedCollections(): any[] {
  const zp = pane();
  if (!zp) return [];

  // Zotero 10+
  if (typeof zp.getSelectedCollections === "function") {
    try {
      return zp.getSelectedCollections() ?? [];
    } catch (error) {
      Zotero.debug(`[ReplicationChecker] getSelectedCollections() failed: ${error}`);
      return [];
    }
  }

  // Zotero 7–9
  try {
    const collection = zp.getSelectedCollection();
    return collection ? [collection] : [];
  } catch (error) {
    Zotero.debug(`[ReplicationChecker] getSelectedCollection() failed: ${error}`);
    return [];
  }
}

/**
 * Library ID of the row currently selected in the collections pane.
 *
 * With several libraries selected the first is returned: every caller here acts
 * on "the library the user is looking at", which has no meaning for more than
 * one at a time.
 *
 * @returns The library ID, or `undefined` when nothing usable is selected.
 */
export function getSelectedLibraryID(): number | undefined {
  const zp = pane();
  if (!zp) return undefined;

  // Zotero 10+
  if (typeof zp.getSelectedLibraryIDs === "function") {
    try {
      const ids = zp.getSelectedLibraryIDs() ?? [];
      return ids.length > 0 ? ids[0] : undefined;
    } catch (error) {
      Zotero.debug(`[ReplicationChecker] getSelectedLibraryIDs() failed: ${error}`);
      return undefined;
    }
  }

  // Zotero 7–9
  try {
    return zp.getSelectedLibraryID() ?? undefined;
  } catch (error) {
    Zotero.debug(`[ReplicationChecker] getSelectedLibraryID() failed: ${error}`);
    return undefined;
  }
}

/**
 * Library the plugin should act on: the selected one, falling back to the
 * personal library when the selection cannot be read.
 */
export function getActiveLibraryID(): number {
  return getSelectedLibraryID() ?? Zotero.Libraries.userLibraryID;
}
