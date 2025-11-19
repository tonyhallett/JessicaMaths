import { e, exp } from "mathjs";
import { dexieFactory } from "../dexieFactory";
import {
  tableBuilder,
  type DuplicateIndexError,
  type DuplicateKeysError,
} from "../tablebuilder";
import { expect, describe, it } from "tstyche";

describe("tableBuilder", () => {
  describe("primary key selection", () => {
    it("should allow singular primaryKey of T", () => {
      const builder = tableBuilder<{ id: string }>();
      expect(builder.primaryKey).type.toBeCallableWith("id");
      expect(builder.primaryKey).type.not.toBeCallableWith("doesnotexist");
    });

    it("should allow nested primary key ", () => {
      const builder = tableBuilder<{ nested: { id: string } }>();
      expect(builder.primaryKey).type.toBeCallableWith("nested.id");
      expect(builder.primaryKey).type.not.toBeCallableWith(
        "nested.doesnotexist"
      );
    });

    it("should allow compound primary key", () => {
      const builder = tableBuilder<{ id: string; nested: { id2: number } }>();
      expect(builder.compoundKey).type.toBeCallableWith("id", "nested.id2");
      expect(builder.compoundKey).type.not.toBeCallableWith("id");
      expect(builder.compoundKey).type.not.toBeCallableWith();
    });
    it("should not be possible to complete the chain when duplicate keys are used", () => {
      const builder = tableBuilder<{ id: string; nested: { id2: number } }>();
      expect(builder.compoundKey("id", "id")).type.toBe<DuplicateKeysError>();
    });
  });
});

describe("index path typing", () => {
  const builder = tableBuilder<{
    id: string;
    index: string;
    unionAllowed: string | number;
    unionDisallowed: string | { obj: number };
    number: number;
    date: Date;
    arrayBuffer: ArrayBuffer;
    arrayBufferView: Uint8Array;
    dataView: DataView;
    indexableArray: string[];
    indexableArray2: string[][];
    indexableArray3: (string | number)[];
    notIndexableArray: (string | { obj: number })[];
    multiEntry: string[];
    notAMultiEntry: string;
    notAMultiEntryArray: string[][];
    nested: { index: string };
    notAnIndex: { obj: string };
  }>().primaryKey("id");

  it("should allow valid index path", () => {
    expect(builder.index).type.toBeCallableWith("index");
    expect(builder.index).type.not.toBeCallableWith("doesnotexist");
  });

  it("should allow nested index path", () => {
    expect(builder.index).type.toBeCallableWith("nested.index");
    expect(builder.index).type.not.toBeCallableWith("nested.doesnotexist");
  });

  it("should not allow primary key as index", () => {
    expect(builder.index).type.not.toBeCallableWith("id");
  });

  it("should not allow primary key as unique index", () => {
    expect(builder.unique).type.not.toBeCallableWith("id");
  });

  it("should allow valid key types", () => {
    expect(builder.index).type.not.toBeCallableWith("notAnIndex");
    expect(builder.index).type.not.toBeCallableWith("unionDisallowed");
    expect(builder.index).type.not.toBeCallableWith("notIndexableArray");
    expect(builder.index).type.toBeCallableWith("number");
    expect(builder.index).type.toBeCallableWith("date");
    expect(builder.index).type.toBeCallableWith("arrayBuffer");
    expect(builder.index).type.toBeCallableWith("arrayBufferView");
    expect(builder.index).type.toBeCallableWith("dataView");
    expect(builder.index).type.toBeCallableWith("unionAllowed");
    expect(builder.index).type.toBeCallableWith("indexableArray");
    expect(builder.index).type.toBeCallableWith("indexableArray2");
    expect(builder.index).type.toBeCallableWith("indexableArray3");
  });

  it("should type multiEntry correctly", () => {
    expect(builder.multi).type.toBeCallableWith("multiEntry");
    expect(builder.multi).type.not.toBeCallableWith("notAMultiEntry");
    expect(builder.multi).type.not.toBeCallableWith("notAMultiEntryArray");
  });

  it("should allow compound keys", () => {
    expect(builder.compound).type.toBeCallableWith("index", "nested.index");
    expect(builder.compound).type.not.toBeCallableWith("index", "doesnotexist");
    expect(builder.compound).type.not.toBeCallableWith("index");
    expect(builder.compound).type.not.toBeCallableWith();
  });

  it("should not be possible to complete the chain when duplicate compound indexes are used", () => {
    expect(builder.compound("index", "index")).type.toBe<DuplicateKeysError>();
  });

  it("should not be possible to complete the chain when duplicate indexes are used", () => {
    expect(
      builder.index("index").index("index")
    ).type.toBe<DuplicateIndexError>();
  });
});

describe("table get primary key type argument is typed correctly", () => {
  const db = dexieFactory(
    1,
    {
      string: tableBuilder<{ id: string }>().primaryKey("id").build(),
      number: tableBuilder<{ id: number }>().primaryKey("id").build(),
    },
    "DemoDexie"
  );

  it("should accept correct primary key type for string table", () => {
    expect(db.string.get).type.toBeCallableWith("stringId");
    expect(db.string.get).type.not.toBeCallableWith(123);
  });

  it("should accept correct primary key type for number table", () => {
    expect(db.number.get).type.toBeCallableWith(123);
    expect(db.number.get).type.not.toBeCallableWith("stringId");
  });
});

describe("database typed transaction", () => {
  const db = dexieFactory(
    1,
    {
      string: tableBuilder<{ id: string }>().primaryKey("id").build(),
      number: tableBuilder<{ id: number }>().primaryKey("id").build(),
      date: tableBuilder<{ id: Date }>().primaryKey("id").build(),
    },
    "DemoDexie"
  );

  it("should work with table types", () => {
    db.transaction("rw", db.string, db.number, (tx) => {
      expect(tx).type.toHaveProperty("string");
      expect(tx).type.toHaveProperty("number");
      expect(tx).type.not.toHaveProperty("date");
    });
  });

  it("should work with table names", () => {
    db.transaction("rw", "string", "number", (tx) => {
      expect(tx).type.toHaveProperty("string");
      expect(tx).type.toHaveProperty("number");
      expect(tx).type.not.toHaveProperty("date");
    });
  });

  it("should work with table names and tables together", () => {
    db.transaction("rw", "string", db.number, (tx) => {
      expect(tx).type.toHaveProperty("string");
      expect(tx).type.toHaveProperty("number");
      expect(tx).type.not.toHaveProperty("date");
    });
  });

  it("should work with table names and tables together in an array", () => {
    db.transaction("rw", ["string", db.number], (tx) => {
      expect(tx).type.toHaveProperty("string");
      expect(tx).type.toHaveProperty("number");
      expect(tx).type.not.toHaveProperty("date");
    });
  });

  it("should not be callable with names that are not table names", () => {
    expect(db.transaction).type.not.toBeCallableWith(
      "rw",
      "doesnotexist",
      () => {}
    );
  });
  // todo - support db.transaction("rw", [db.data, "other"],"else", (tx) => {
});
