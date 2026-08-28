import { assert } from "chai";
import {
  ROOT_SPEC,
  REPLICATION_SPEC,
  REPRODUCTION_SPEC,
  getOrCreateCollection,
  getOrCreateRootCollection,
  getOrCreateChildCollection,
  migrateCollectionsToRoot,
} from "../../src/utils/collectionUtils";

/**
 * In-memory stand-in for Zotero.Collection / Zotero.Collections.
 * Only what collectionUtils touches: id, name, libraryID, parentID, saveTx().
 */
class FakeCollection {
  static store: FakeCollection[] = [];
  static nextID = 1;

  id = 0;
  name = "";
  libraryID = 0;
  parentID: number | false = false;

  constructor(params: { libraryID: number; name: string; parentID?: number }) {
    this.libraryID = params.libraryID;
    this.name = params.name;
    if (params.parentID !== undefined) this.parentID = params.parentID;
  }

  async saveTx(): Promise<number> {
    if (!this.id) {
      this.id = FakeCollection.nextID++;
      FakeCollection.store.push(this);
    }
    return this.id;
  }
}

const LIBRARY_ID = 1;
const GROUP_ID = 2;

function resetStore(): void {
  FakeCollection.store = [];
  FakeCollection.nextID = 1;
}

function names(libraryID = LIBRARY_ID): string[] {
  return FakeCollection.store
    .filter((c) => c.libraryID === libraryID)
    .map((c) => c.name)
    .sort();
}

function byName(name: string, libraryID = LIBRARY_ID): FakeCollection | undefined {
  return FakeCollection.store.find((c) => c.libraryID === libraryID && c.name === name);
}

describe("collectionUtils", function () {
  before(function () {
    const Z = (globalThis as any).Zotero;
    Z.Collection = FakeCollection;
    Z.Collections = {
      getByLibrary: (libraryID: number) =>
        FakeCollection.store.filter((c) => c.libraryID === libraryID),
    };
    Z.Libraries = {
      userLibraryID: LIBRARY_ID,
      getAll: () => [
        { libraryID: LIBRARY_ID, name: "My Library", editable: true, libraryType: "user" },
        { libraryID: GROUP_ID, name: "Group", editable: true, libraryType: "group" },
      ],
    };
  });

  beforeEach(resetStore);

  describe("getOrCreateCollection", function () {
    it("creates the container and nests the collection inside it", async function () {
      const collection = await getOrCreateCollection(LIBRARY_ID, REPLICATION_SPEC);

      const root = byName(ROOT_SPEC.defaultName);
      assert.isDefined(root, "container collection should be created");
      assert.equal(collection.name, REPLICATION_SPEC.defaultName);
      assert.equal(collection.parentID, root!.id, "collection should sit under the container");
      assert.deepEqual(names(), [ROOT_SPEC.defaultName, REPLICATION_SPEC.defaultName].sort());
    });

    it("reuses the container for a second collection", async function () {
      await getOrCreateCollection(LIBRARY_ID, REPLICATION_SPEC);
      await getOrCreateCollection(LIBRARY_ID, REPRODUCTION_SPEC);

      const roots = FakeCollection.store.filter((c) => c.name === ROOT_SPEC.defaultName);
      assert.lengthOf(roots, 1, "only one container should exist");
      assert.equal(byName(REPRODUCTION_SPEC.defaultName)!.parentID, roots[0].id);
    });

    it("adopts a top-level collection left by an older version instead of duplicating", async function () {
      const legacy = new FakeCollection({
        libraryID: LIBRARY_ID,
        name: REPLICATION_SPEC.defaultName,
      });
      await legacy.saveTx();

      const collection = await getOrCreateCollection(LIBRARY_ID, REPLICATION_SPEC);

      assert.equal(collection.id, legacy.id, "existing collection should be reused");
      assert.lengthOf(
        FakeCollection.store.filter((c) => c.name === REPLICATION_SPEC.defaultName),
        1,
        "no duplicate should be created",
      );
    });

    it("renames a legacy-named collection rather than creating a new one", async function () {
      const legacy = new FakeCollection({ libraryID: LIBRARY_ID, name: "Replication folder" });
      await legacy.saveTx();

      const collection = await getOrCreateCollection(LIBRARY_ID, REPLICATION_SPEC);

      assert.equal(collection.id, legacy.id);
      assert.equal(collection.name, REPLICATION_SPEC.defaultName);
    });
  });

  describe("getOrCreateChildCollection", function () {
    it("creates read-only collections inside the container", async function () {
      const collection = await getOrCreateChildCollection(
        LIBRARY_ID, "Some Group [Read-Only]", "[test]",
      );
      const root = byName(ROOT_SPEC.defaultName);
      assert.equal(collection.parentID, root!.id);
    });

    it("returns the same collection on a second call", async function () {
      const first = await getOrCreateChildCollection(LIBRARY_ID, "Some Group [Read-Only]", "[test]");
      const second = await getOrCreateChildCollection(LIBRARY_ID, "Some Group [Read-Only]", "[test]");
      assert.equal(first.id, second.id);
    });
  });

  describe("migrateCollectionsToRoot", function () {
    it("moves pre-existing top-level collections under the container", async function () {
      const rep = new FakeCollection({ libraryID: LIBRARY_ID, name: REPLICATION_SPEC.defaultName });
      const repro = new FakeCollection({ libraryID: LIBRARY_ID, name: "Reproduction folder" });
      const readOnly = new FakeCollection({ libraryID: LIBRARY_ID, name: "Lab Group [Read-Only]" });
      const unrelated = new FakeCollection({ libraryID: LIBRARY_ID, name: "My Thesis" });
      for (const c of [rep, repro, readOnly, unrelated]) await c.saveTx();

      await migrateCollectionsToRoot();

      const root = byName(ROOT_SPEC.defaultName);
      assert.isDefined(root, "container should be created during migration");
      assert.equal(rep.parentID, root!.id);
      assert.equal(repro.parentID, root!.id, "legacy names should be migrated too");
      assert.equal(readOnly.parentID, root!.id, "[Read-Only] collections should be migrated too");
      assert.equal(unrelated.parentID, false, "unrelated collections must not be touched");
    });

    it("does not create a container in libraries with nothing to migrate", async function () {
      await migrateCollectionsToRoot();
      assert.lengthOf(FakeCollection.store, 0);
    });

    it("runs only once", async function () {
      const rep = new FakeCollection({ libraryID: LIBRARY_ID, name: REPLICATION_SPEC.defaultName });
      await rep.saveTx();

      await migrateCollectionsToRoot();
      const countAfterFirst = FakeCollection.store.length;

      // User drags the collection back out; migration must not fight them.
      rep.parentID = false;
      await migrateCollectionsToRoot();

      assert.equal(FakeCollection.store.length, countAfterFirst);
      assert.equal(rep.parentID, false, "second run must be a no-op");
    });

    it("migrates each library separately", async function () {
      const personal = new FakeCollection({ libraryID: LIBRARY_ID, name: REPLICATION_SPEC.defaultName });
      const group = new FakeCollection({ libraryID: GROUP_ID, name: REPLICATION_SPEC.defaultName });
      for (const c of [personal, group]) await c.saveTx();

      await migrateCollectionsToRoot();

      assert.equal(personal.parentID, byName(ROOT_SPEC.defaultName, LIBRARY_ID)!.id);
      assert.equal(group.parentID, byName(ROOT_SPEC.defaultName, GROUP_ID)!.id);
    });
  });

  describe("getOrCreateRootCollection", function () {
    it("honours a user rename of the container", async function () {
      const root = await getOrCreateRootCollection(LIBRARY_ID);
      root.name = "My FLoRA Stuff";

      const again = await getOrCreateRootCollection(LIBRARY_ID);

      assert.equal(again.id, root.id, "renamed container should be found by stored ID");
      assert.equal(
        Zotero.Prefs.get(ROOT_SPEC.namePrefKey),
        "My FLoRA Stuff",
        "preference should follow the user's rename",
      );
    });
  });
});
