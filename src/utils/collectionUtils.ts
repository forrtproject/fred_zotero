/**
 * Shared collection-management utilities.
 *
 * Every collection the plugin manages lives inside one top-level container
 * collection (default "FLoRA") so the library sidebar stays tidy:
 *
 *   FLoRA
 *     ├── FLoRA Replications
 *     ├── FLoRA Reproductions
 *     ├── FLoRA Originals linked to Replications
 *     ├── FLoRA Originals linked to Reproductions
 *     └── <Group name> [Read-Only]        (one per read-only source library)
 *
 * Libraries created by older versions kept these at the top level; they are
 * moved under the container once by `migrateCollectionsToRoot()` on startup.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollectionSpec {
  /** Preference key storing the user-chosen folder name. */
  namePrefKey: string;
  /** Preference key storing the JSON map of libraryID → collectionID. */
  idsPrefKey: string;
  /** Default name when no preference is set. */
  defaultName: string;
  /**
   * Old names that may exist in the library and should be migrated (renamed)
   * to `targetName` instead of creating a duplicate.
   * The current `targetName` is always excluded from this list automatically.
   */
  legacyNames: string[];
  /** Prefix for Zotero.debug() messages, e.g. "[ReplicationChecker]". */
  debugTag: string;
}

// ---------------------------------------------------------------------------
// Collection specs – one per managed folder type
// ---------------------------------------------------------------------------

/** Top-level container that holds every other managed collection. */
export const ROOT_SPEC: CollectionSpec = {
  namePrefKey: "replication-checker.rootFolderName",
  idsPrefKey: "replication-checker.rootCollectionIDs",
  defaultName: "FLoRA",
  legacyNames: [],
  debugTag: "[ReplicationChecker]",
};

export const REPLICATION_SPEC: CollectionSpec = {
  namePrefKey: "replication-checker.folderName",
  idsPrefKey: "replication-checker.collectionIDs",
  defaultName: "FLoRA Replications",
  legacyNames: ["FLoRA Replications", "Replication folder"],
  debugTag: "[ReplicationChecker]",
};

export const REPRODUCTION_SPEC: CollectionSpec = {
  namePrefKey: "replication-checker.reproductionFolderName",
  idsPrefKey: "replication-checker.reproductionCollectionIDs",
  defaultName: "FLoRA Reproductions",
  legacyNames: ["FLoRA Reproductions", "Reproduction folder"],
  debugTag: "[ReproductionHandler]",
};

/** Originals that were fetched via "Add Original" for a *replication* item. */
export const ORIGINALS_REPLICATION_SPEC: CollectionSpec = {
  namePrefKey: "replication-checker.originalsReplicationFolderName",
  idsPrefKey: "replication-checker.originalsReplicationCollectionIDs",
  defaultName: "FLoRA Originals linked to Replications",
  legacyNames: [],
  debugTag: "[ReplicationChecker]",
};

/** Originals that were fetched via "Add Original" for a *reproduction* item. */
export const ORIGINALS_REPRODUCTION_SPEC: CollectionSpec = {
  namePrefKey: "replication-checker.originalsReproductionFolderName",
  idsPrefKey: "replication-checker.originalsReproductionCollectionIDs",
  defaultName: "FLoRA Originals linked to Reproductions",
  legacyNames: [],
  debugTag: "[ReplicationChecker]",
};

/** All child collections managed via a spec (i.e. everything except the root). */
export const MANAGED_SPECS: CollectionSpec[] = [
  REPLICATION_SPEC,
  REPRODUCTION_SPEC,
  ORIGINALS_REPLICATION_SPEC,
  ORIGINALS_REPRODUCTION_SPEC,
];

/** Suffix used for the per-source-library copies of read-only originals. */
export const READONLY_SUFFIX = " [Read-Only]";

/**
 * Bumped whenever the collection layout changes; `migrateCollectionsToRoot()`
 * runs once per version. v1 = nest everything under the "FLoRA" container.
 */
const STRUCTURE_PREF = "replication-checker.collectionStructureVersion";
const STRUCTURE_VERSION = 1;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _getStoredIDs(idsPrefKey: string): Record<string, number> {
  try {
    const json = Zotero.Prefs.get(idsPrefKey) as string;
    if (json) return JSON.parse(json);
  } catch { /* ignore */ }
  return {};
}

function _saveID(idsPrefKey: string, libraryID: number, collectionID: number): void {
  const map = _getStoredIDs(idsPrefKey);
  map[String(libraryID)] = collectionID;
  try { Zotero.Prefs.set(idsPrefKey, JSON.stringify(map)); } catch { /* ignore */ }
}

function _clearStaleID(idsPrefKey: string, libraryID: number): void {
  const map = _getStoredIDs(idsPrefKey);
  delete map[String(libraryID)];
  try { Zotero.Prefs.set(idsPrefKey, JSON.stringify(map)); } catch { /* ignore */ }
}

/** Zotero stores "no parent" as `false`; normalise it to `null`. */
function _parentOf(collection: any): number | null {
  return collection.parentID || null;
}

/**
 * Resolutions currently in flight, keyed by library + collection.
 *
 * Find-or-create spans several `await`s, so two callers can both see "no
 * collection yet" and both create one. That is not hypothetical: a modal prompt
 * spins a nested event loop, so the item notifier or the scheduled auto-check
 * runs *while* the user is deciding, and a library ends up with two identically
 * named folders. Sharing one promise per key makes the whole find-or-create
 * atomic for every caller in this process.
 */
const _inFlight = new Map<string, Promise<any>>();

function _once(key: string, work: () => Promise<any>): Promise<any> {
  const existing = _inFlight.get(key);
  if (existing) return existing;

  const pending = work().finally(() => _inFlight.delete(key));
  _inFlight.set(key, pending);
  return pending;
}

/** Move `collection` under `parentID` if it isn't there already. */
async function _reparent(collection: any, parentID: number, debugTag: string): Promise<void> {
  if (_parentOf(collection) === parentID || collection.id === parentID) return;
  collection.parentID = parentID;
  await collection.saveTx();
  Zotero.debug(`${debugTag} Moved collection "${collection.name}" under container ${parentID}`);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read the user-configured folder name from preferences, falling back to the
 * spec's default when the pref is missing or empty.
 */
export function getCollectionFolderName(spec: CollectionSpec): string {
  try {
    const val = Zotero.Prefs.get(spec.namePrefKey);
    if (typeof val === "string" && val.trim().length > 0) return val.trim();
  } catch { /* ignore */ }
  return spec.defaultName;
}

/**
 * Locate an existing collection by trying, in order:
 *   1. Exact name match against `targetName` — preferring one already under
 *      `parentID`, then falling back to a top-level one left by an older version
 *   2. Stored collection ID (from preferences) — respects user renames in Zotero:
 *      if the collection name differs from the preference the user renamed it
 *      manually, so we update the preference to match rather than reverting.
 *   3. Any of `spec.legacyNames` — renames the found collection to `targetName`
 *
 * Existing collections are left wherever the user put them; only the one-time
 * `migrateCollectionsToRoot()` and freshly created collections are nested.
 *
 * @param collections - Result of `Zotero.Collections.getByLibrary(libraryID, true)`
 *   (only active / non-deleted collections; avoids stale in-memory cache objects).
 * @param targetName  - Desired name (typically from `getCollectionFolderName`).
 * @param libraryID   - Library being searched.
 * @param spec        - Configuration for this collection type.
 * @param parentID    - Container collection ID, or `null` for the container itself.
 * @returns The matched collection object, or `null` if nothing was found
 *   (caller should create a new collection in that case).
 */
export async function findOrRenameCollection(
  collections: any[],
  targetName: string,
  libraryID: number,
  spec: CollectionSpec,
  parentID: number | null = null,
): Promise<any | null> {

  const named = (name: string) =>
    collections.find((c: any) => c.name === name && _parentOf(c) === parentID)
    ?? collections.find((c: any) => c.name === name && _parentOf(c) === null);

  // 1. Exact name match.
  const exact = named(targetName);
  if (exact) {
    _saveID(spec.idsPrefKey, libraryID, exact.id);
    return exact;
  }

  // 2. Find by stored collection ID.
  //    We search within `collections` (from getByLibrary) rather than calling
  //    Zotero.Collections.get() directly so we never match stale in-memory
  //    objects that linger after a collection is deleted by sync or another client.
  const storedID = _getStoredIDs(spec.idsPrefKey)[String(libraryID)];
  if (storedID) {
    const byID = collections.find((c: any) => c.id === storedID);
    if (byID) {
      if (byID.name !== targetName) {
        // User manually renamed the collection in Zotero — honour that by updating
        // the preference to match instead of reverting the collection name.
        try { Zotero.Prefs.set(spec.namePrefKey, byID.name); } catch { /* ignore */ }
        Zotero.debug(
          `${spec.debugTag} Collection renamed by user to "${byID.name}"; ` +
          `updated preference (was "${targetName}")`
        );
      }
      _saveID(spec.idsPrefKey, libraryID, byID.id);
      return byID;
    }
    // Stored ID no longer points to a live collection — clear the stale entry.
    Zotero.debug(
      `${spec.debugTag} Stored collection ID ${storedID} not found in ` +
      `library ${libraryID} — clearing stale pref`
    );
    _clearStaleID(spec.idsPrefKey, libraryID);
  }

  // 3. Fall back to legacy / default names (rename instead of creating a duplicate).
  const fallbackNames = spec.legacyNames.filter((n) => n !== targetName);
  for (const legacyName of fallbackNames) {
    const old = named(legacyName);
    if (old) {
      old.name = targetName;
      await old.saveTx();
      _saveID(spec.idsPrefKey, libraryID, old.id);
      Zotero.debug(
        `${spec.debugTag} Renamed collection "${legacyName}" → "${targetName}" in library ${libraryID}`
      );
      return old;
    }
  }

  return null;
}

async function _resolve(
  libraryID: number,
  spec: CollectionSpec,
  parentID: number | null,
): Promise<any> {
  const targetName = getCollectionFolderName(spec);
  const allCollections = Zotero.Collections.getByLibrary(libraryID, true);
  let collection = await findOrRenameCollection(
    allCollections, targetName, libraryID, spec, parentID,
  );
  if (!collection) {
    collection = new Zotero.Collection({
      libraryID,
      name: targetName,
      ...(parentID !== null ? { parentID } : {}),
    });
    await collection.saveTx();
    _saveID(spec.idsPrefKey, libraryID, collection.id);
    Zotero.debug(
      `${spec.debugTag} Created new collection "${targetName}" in library ${libraryID}`
    );
  }
  return collection;
}

/** Resolve (or create) the top-level container collection for a library. */
export function getOrCreateRootCollection(libraryID: number): Promise<any> {
  return _once(`${libraryID}:${ROOT_SPEC.idsPrefKey}`, () =>
    _resolve(libraryID, ROOT_SPEC, null));
}

/**
 * Convenience wrapper: resolves (or creates) the collection described by `spec`
 * inside the container collection of `libraryID`. Saves the collection ID to
 * preferences automatically.
 */
export async function getOrCreateCollection(
  libraryID: number,
  spec: CollectionSpec,
): Promise<any> {
  const root = await getOrCreateRootCollection(libraryID);
  return _once(`${libraryID}:${spec.idsPrefKey}`, () =>
    _resolve(libraryID, spec, root.id));
}

/**
 * Resolve (or create) a plain child collection by name inside the container.
 * Used for the "<Library name> [Read-Only]" collections, whose names are
 * derived from the source library and so have no preference of their own.
 */
export async function getOrCreateChildCollection(
  libraryID: number,
  name: string,
  debugTag: string,
): Promise<any> {
  const root = await getOrCreateRootCollection(libraryID);

  return _once(`${libraryID}:child:${name}`, async () => {
    const collections = Zotero.Collections.getByLibrary(libraryID, true);
    const existing =
      collections.find((c: any) => c.name === name && _parentOf(c) === root.id)
      ?? collections.find((c: any) => c.name === name && _parentOf(c) === null);
    if (existing) return existing;

    const collection = new Zotero.Collection({ libraryID, name, parentID: root.id });
    await collection.saveTx();
    Zotero.debug(`${debugTag} Created "${name}" collection in library ${libraryID}`);
    return collection;
  });
}

/**
 * One-time migration: move managed collections left at the top level by older
 * versions into the container collection. Runs once per STRUCTURE_VERSION and
 * never creates a container in libraries that have no managed collections.
 */
export async function migrateCollectionsToRoot(): Promise<void> {
  try {
    if (Number(Zotero.Prefs.get(STRUCTURE_PREF) ?? 0) >= STRUCTURE_VERSION) return;

    const rootName = getCollectionFolderName(ROOT_SPEC);
    const managedNames = new Set(
      MANAGED_SPECS.flatMap((s) => [getCollectionFolderName(s), ...s.legacyNames]),
    );

    for (const library of Zotero.Libraries.getAll()) {
      if (!library.editable || library.libraryType === "feed") continue;
      const libraryID = library.libraryID;

      const storedIDs = new Set(
        MANAGED_SPECS.map((s) => _getStoredIDs(s.idsPrefKey)[String(libraryID)])
          .filter((id): id is number => typeof id === "number"),
      );

      const collections = Zotero.Collections.getByLibrary(libraryID, true);
      const orphans = collections.filter((c: any) =>
        _parentOf(c) === null &&
        c.name !== rootName &&
        (managedNames.has(c.name) || storedIDs.has(c.id) || c.name.endsWith(READONLY_SUFFIX)),
      );
      if (orphans.length === 0) continue;

      const root = await getOrCreateRootCollection(libraryID);
      for (const orphan of orphans) {
        await _reparent(orphan, root.id, "[ReplicationChecker]");
      }
      Zotero.debug(
        `[ReplicationChecker] Migrated ${orphans.length} collection(s) into "${root.name}" in library ${libraryID}`,
      );
    }

    Zotero.Prefs.set(STRUCTURE_PREF, STRUCTURE_VERSION);
  } catch (error) {
    Zotero.debug(`[ReplicationChecker] Collection structure migration failed: ${error}`);
  }
}
