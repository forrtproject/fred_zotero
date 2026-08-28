import { assert } from "chai";
import { extractDOI, setDOI } from "../../src/utils/zoteroIntegration";

/**
 * Minimal Zotero.Item stand-in. `hasDOIField: false` reproduces book / report /
 * thesis / document items, where setField("DOI") throws in real Zotero.
 */
function fakeItem(fields: Record<string, string>, hasDOIField = true): any {
  return {
    fields: { ...fields },
    getField(name: string) {
      if (name === "DOI" && !hasDOIField) return "";
      return this.fields[name] ?? "";
    },
    setField(name: string, value: string) {
      if (name === "DOI" && !hasDOIField) {
        throw new Error(`"DOI" is not a valid field for this item type`);
      }
      this.fields[name] = value;
    },
  };
}

describe("extractDOI", function () {
  it("reads the DOI field", function () {
    assert.equal(extractDOI(fakeItem({ DOI: "10.1177/0956797610383437" })), "10.1177/0956797610383437");
  });

  it("falls back to a DOI line in Extra", function () {
    const item = fakeItem({ extra: "Some note\nDOI: 10.1037/a0027598" }, false);
    assert.equal(extractDOI(item), "10.1037/a0027598");
  });

  it("falls back to a doi.org link in the URL field", function () {
    assert.equal(
      extractDOI(fakeItem({ url: "https://doi.org/10.1016/j.jesp.2015.10.012" }, false)),
      "10.1016/j.jesp.2015.10.012",
    );
    assert.equal(
      extractDOI(fakeItem({ url: "http://dx.doi.org/10.3758/s13428-021-01694-3" }, false)),
      "10.3758/s13428-021-01694-3",
    );
  });

  it("ignores non-doi.org URLs", function () {
    assert.isNull(extractDOI(fakeItem({ url: "https://example.com/paper.pdf" }, false)));
    assert.isNull(extractDOI(fakeItem({ url: "https://osf.io/abc123/" }, false)));
  });

  it("returns null when nothing carries a DOI", function () {
    assert.isNull(extractDOI(fakeItem({ title: "Untitled" }, false)));
  });
});

describe("setDOI", function () {
  it("writes to the DOI field when the item type has one", function () {
    const item = fakeItem({});
    setDOI(item, "10.1177/0956797610383437");
    assert.equal(item.fields.DOI, "10.1177/0956797610383437");
    assert.isUndefined(item.fields.extra);
  });

  it("falls back to Extra instead of throwing for types without a DOI field", function () {
    const item = fakeItem({}, false);
    setDOI(item, "10.1037/a0027598");
    assert.equal(item.fields.extra, "DOI: 10.1037/a0027598");
  });

  it("appends to existing Extra content rather than replacing it", function () {
    const item = fakeItem({ extra: "Replication Outcome: failure" }, false);
    setDOI(item, "10.1037/a0027598");
    assert.equal(item.fields.extra, "Replication Outcome: failure\nDOI: 10.1037/a0027598");
  });

  it("does not duplicate an existing Extra DOI line", function () {
    const item = fakeItem({ extra: "DOI: 10.1037/a0027598" }, false);
    setDOI(item, "10.1037/a0027598");
    assert.equal(item.fields.extra, "DOI: 10.1037/a0027598");
  });

  it("is a no-op for an empty DOI", function () {
    const item = fakeItem({}, false);
    setDOI(item, "");
    setDOI(item, null);
    assert.isUndefined(item.fields.extra);
  });

  it("round-trips through extractDOI for a type without a DOI field", function () {
    const item = fakeItem({}, false);
    setDOI(item, "10.3102/0013189X13507104");
    assert.equal(extractDOI(item), "10.3102/0013189X13507104");
  });
});
