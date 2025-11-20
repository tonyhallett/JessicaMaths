import type { PromiseExtended } from "dexie";
import { dexieFactory } from "../dexieFactory";
import {
  tableBuilder,
  tableClassBuilder,
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

    it("should allow component of compound primary key as index", () => {
      const builder = tableBuilder<{
        id: string;
        id2: number;
        index: string;
      }>().compoundKey("id", "id2");

      expect(builder.index).type.toBeCallableWith("id");
      expect(builder.index).type.toBeCallableWith("id2");
    });

    it("should not allow compound key to be compound primary key", () => {
      const builder = tableBuilder<{
        id: string;
        id2: number;
        index: string;
      }>().compoundKey("id", "id2");
      expect(builder.compound).type.toBeCallableWith("id2", "id");
      expect(builder.compound).type.toBeCallableWith("id", "id2", "index");
      expect(builder.compound).type.not.toBeCallableWith("id", "id2");
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

    it("should not allow multi on primary key", () => {
      const builder = tableBuilder<{
        id: string[];
      }>().primaryKey("id");
      expect(builder.multi).type.not.toBeCallableWith("id");
    });

    it("should allow compound keys", () => {
      expect(builder.compound).type.toBeCallableWith("index", "nested.index");
      expect(builder.compound).type.not.toBeCallableWith(
        "index",
        "doesnotexist"
      );
      expect(builder.compound).type.not.toBeCallableWith("index");
      expect(builder.compound).type.not.toBeCallableWith();
    });

    it("should not be possible to complete the chain when duplicate compound indexes are used", () => {
      expect(
        builder.compound("index", "index")
      ).type.toBe<DuplicateKeysError>();
    });

    it("should not be possible to complete the chain when duplicate indexes are used", () => {
      expect(
        builder.index("index").index("index")
      ).type.toBe<DuplicateIndexError>();

      expect(
        builder.compound("index", "date").compound("index", "date")
      ).type.toBe<DuplicateIndexError>();
    });
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

interface StringId {
  id: string;
  other: number;
}

class MappedStringId {
  id!: string;
  other!: number;
  nested: { sub: number } = { sub: 0 };
  upperId() {
    return this.id.toUpperCase();
  }
}

interface NumberId {
  id: number;
}

describe("table base", () => {
  const db = dexieFactory(
    1,
    {
      string: tableBuilder<StringId>().primaryKey("id").build(),
      stringMapped: tableClassBuilder(MappedStringId).primaryKey("id").build(),
      number: tableBuilder<NumberId>().primaryKey("id").build(),
    },
    "DemoDexie"
  );

  it("should delete with correct primary key type", () => {
    expect(db.string.delete).type.toBeCallableWith("stringId");
    expect(db.string.delete).type.not.toBeCallableWith(123);
    expect(db.stringMapped.delete).type.toBeCallableWith("stringId");
    expect(db.stringMapped.delete).type.not.toBeCallableWith(123);
    expect(db.number.delete).type.toBeCallableWith(123);
    expect(db.number.delete).type.not.toBeCallableWith("stringId");
  });

  it("should get with correct primary key type", () => {
    expect(db.string.get).type.toBeCallableWith("stringId");
    expect(db.string.get).type.not.toBeCallableWith(123);
    expect(db.stringMapped.get).type.toBeCallableWith("stringId");
    expect(db.stringMapped.get).type.not.toBeCallableWith(123);
    expect(db.number.get).type.toBeCallableWith(123);
    expect(db.number.get).type.not.toBeCallableWith("stringId");
  });

  it("should get the correct type", () => {
    expect(db.string.get("stringId")).type.toBe<
      PromiseExtended<StringId | undefined>
    >();
    expect(db.stringMapped.get("stringId")).type.toBe<
      PromiseExtended<MappedStringId | undefined>
    >();
    expect(db.number.get(123)).type.toBe<
      PromiseExtended<NumberId | undefined>
    >();
  });

  it("should get all with toArray", () => {
    expect(db.string.toArray()).type.toBe<PromiseExtended<StringId[]>>();
    expect(db.stringMapped.toArray()).type.toBe<
      PromiseExtended<MappedStringId[]>
    >();
    expect(db.number.toArray()).type.toBe<PromiseExtended<NumberId[]>>();
  });

  describe("each", () => {
    it("should have item as the correct type", () => {
      db.number.each((item, cursor) => {
        expect(item).type.toBe<NumberId>();
      });
      db.string.each((item, cursor) => {
        expect(item).type.toBe<StringId>();
      });
      db.stringMapped.each((item, cursor) => {
        expect(item).type.toBe<MappedStringId>();
      });
    });
    it("should have cursor key the same as the primaryKey type", () => {
      expect(
        db.number.each((item, cursor) => {
          expect(cursor.key).type.toBe<number>();
          expect(cursor.primaryKey).type.toBe<number>();
        })
      ).type.toBe<PromiseExtended<void>>();
      db.string.each((item, cursor) => {
        expect(cursor.key).type.toBe<string>();
        expect(cursor.primaryKey).type.toBe<string>();
      });
    });
  });

  it("should return primary key collection for many methods", () => {
    const primaryKeyNumberCollections = [
      db.number.offset(10),
      db.number.limit(5),
      db.number.toCollection(),
      db.number.reverse(),
    ];
    primaryKeyNumberCollections.forEach((pkCollection) => {
      pkCollection.each((item, cursor) => {
        expect(cursor.key).type.toBe<number>();
        expect(cursor.primaryKey).type.toBe<number>();
      });
      expect(pkCollection.keys()).type.toBe<PromiseExtended<number[]>>();
      expect(pkCollection.uniqueKeys()).type.toBe<PromiseExtended<number[]>>();
      expect(pkCollection.primaryKeys()).type.toBe<PromiseExtended<number[]>>();
    });

    const primaryKeyStringCollections = [
      db.string.offset(10),
      db.string.limit(5),
      db.string.toCollection(),
      db.string.reverse(),
    ];
    primaryKeyStringCollections.forEach((pkCollection) => {
      pkCollection.each((item, cursor) => {
        expect(cursor.key).type.toBe<string>();
        expect(cursor.primaryKey).type.toBe<string>();
        expect(pkCollection.keys()).type.toBe<PromiseExtended<string[]>>();
        expect(pkCollection.uniqueKeys()).type.toBe<
          PromiseExtended<string[]>
        >();
        expect(pkCollection.primaryKeys()).type.toBe<
          PromiseExtended<string[]>
        >();
      });
    });
  });

  it("should have key type the index type when orderBy", () => {
    const db = dexieFactory(
      1,
      {
        table: tableBuilder<{
          id: string;
          stringIndex: string;
          numberIndex: number;
          nestedIndex: { subIndex: Date };
          notAnIndex: number;
        }>()
          .primaryKey("id")
          .index("stringIndex")
          .index("numberIndex")
          .index("nestedIndex.subIndex")
          .build(),
      },
      ""
    );
    expect(db.table.orderBy).type.not.toBeCallableWith("notAnIndex");
    db.table.orderBy("numberIndex").each((item, cursor) => {
      expect(cursor.key).type.toBe<number>();
    });
    db.table.orderBy("nestedIndex.subIndex").each((item, cursor) => {
      expect(cursor.key).type.toBe<Date>();
    });
    db.table.orderBy("stringIndex").each((item, cursor) => {
      expect(cursor.key).type.toBe<string>();
    });
  });

  it("should have the filter method with database item type", () => {
    db.stringMapped.filter((item) => {
      expect(item).type.not.toHaveProperty("upperId");
      expect(item).type.toHaveProperty("other");
      return true;
    });

    db.string.filter((item) => {
      expect(item).type.toBe<StringId>();
      return true;
    });
  });

  describe("where => collection", () => {
    const db = dexieFactory(
      1,
      {
        table: tableBuilder<{
          id: string;
          stringIndex: string;
          numberIndex: number;
          nestedIndex: { subIndex: number };
          notAnIndex: number;
          compound1: string;
          compound2: number;
          multiEntry: string[];
        }>()
          .primaryKey("id")
          .index("stringIndex")
          .index("numberIndex")
          .index("nestedIndex.subIndex")
          .compound("compound1", "compound2")
          .multi("multiEntry")
          .build(),
      },
      ""
    );
    it("should accept index paths", () => {
      expect(db.table.where).type.toBeCallableWith("stringIndex");
      expect(db.table.where).type.toBeCallableWith("nestedIndex.subIndex");
      expect(db.table.where).type.not.toBeCallableWith("notAnIndex");
      expect(db.table.where).type.not.toBeCallableWith("nestedIndex.badPath");
    });
    it("should accept multiEntry index paths", () => {
      expect(db.table.where).type.toBeCallableWith("multiEntry");
    });
    // it("should accept compound index paths", () => {

    it("should have methods typed to the index type", () => {
      const whereString = db.table.where("stringIndex");
      expect(whereString.above).type.toBeCallableWith("stringValue");
      expect(whereString.above).type.not.toBeCallableWith(42);
      expect(whereString.equals).type.toBeCallableWith("stringValue");
      expect(whereString.equals).type.not.toBeCallableWith(42);

      const whereNumber = db.table.where("numberIndex");
      expect(whereNumber.above).type.toBeCallableWith(123);
      expect(whereNumber.above).type.not.toBeCallableWith("stringValue");
      expect(whereNumber.aboveOrEqual).type.toBeCallableWith(123);
      expect(whereNumber.aboveOrEqual).type.not.toBeCallableWith("stringValue");
      expect(whereNumber.below).type.toBeCallableWith(123);
      expect(whereNumber.below).type.not.toBeCallableWith("stringValue");
      expect(whereNumber.belowOrEqual).type.toBeCallableWith(123);
      expect(whereNumber.belowOrEqual).type.not.toBeCallableWith("stringValue");
      expect(whereNumber.equals).type.toBeCallableWith(123);
      expect(whereNumber.equals).type.not.toBeCallableWith("stringValue");
      expect(whereNumber.notEqual).type.toBeCallableWith(123);
      expect(whereNumber.notEqual).type.not.toBeCallableWith("stringValue");
      expect(whereNumber.anyOf).type.toBeCallableWith([1, 2, 3]);
      expect(whereNumber.anyOf).type.not.toBeCallableWith(["stringValue"]);
      expect(whereNumber.noneOf).type.toBeCallableWith([1, 2, 3]);
      expect(whereNumber.noneOf).type.not.toBeCallableWith(["stringValue"]);

      const whereMultiEntry = db.table.where("multiEntry");
      expect(whereMultiEntry.above).type.toBeCallableWith("stringValue");
      expect(whereMultiEntry.equals).type.toBeCallableWith("stringValue");

      // string methods only available if the index type is string

      expect(whereString).type.toHaveProperty("anyOfIgnoreCase");
      expect(whereMultiEntry).type.toHaveProperty("anyOfIgnoreCase");
      expect(whereNumber).type.not.toHaveProperty("anyOfIgnoreCase");

      expect(whereString).type.toHaveProperty("equalsIgnoreCase");
      expect(whereMultiEntry).type.toHaveProperty("equalsIgnoreCase");
      expect(whereNumber).type.not.toHaveProperty("equalsIgnoreCase");

      expect(whereString).type.toHaveProperty("startsWith");
      expect(whereMultiEntry).type.toHaveProperty("startsWith");
      expect(whereNumber).type.not.toHaveProperty("startsWith");

      expect(whereString).type.toHaveProperty("startsWithIgnoreCase");
      expect(whereMultiEntry).type.toHaveProperty("startsWithIgnoreCase");
      expect(whereNumber).type.not.toHaveProperty("startsWithIgnoreCase");

      expect(whereString).type.toHaveProperty("startsWithAnyOf");
      expect(whereMultiEntry).type.toHaveProperty("startsWithAnyOf");
      expect(whereNumber).type.not.toHaveProperty("startsWithAnyOf");

      expect(whereString).type.toHaveProperty("startsWithAnyOfIgnoreCase");
      expect(whereMultiEntry).type.toHaveProperty("startsWithAnyOfIgnoreCase");
      expect(whereNumber).type.not.toHaveProperty("startsWithAnyOfIgnoreCase");
    });

    it("should return collection with key typed to the index type", () => {
      const stringCollectionKey = db.table.where("stringIndex").above("a");
      stringCollectionKey.each((item, cursor) => {
        expect(cursor.key).type.toBe<string>();
      });
      expect(stringCollectionKey.keys()).type.toBe<PromiseExtended<string[]>>();
      expect(stringCollectionKey.uniqueKeys()).type.toBe<
        PromiseExtended<string[]>
      >();
      stringCollectionKey.eachKey((key, cursor) => {
        expect(key).type.toBe<string>();
        expect(cursor.key).type.toBe<string>();
      });
      stringCollectionKey.eachUniqueKey((key, cursor) => {
        expect(key).type.toBe<string>();
        expect(cursor.key).type.toBe<string>();
      });
      stringCollectionKey.eachPrimaryKey((key, cursor) => {
        expect(cursor.key).type.toBe<string>();
      });
      const numberCollectionKey = db.table.where("numberIndex").above(1);
      numberCollectionKey.each((item, cursor) => {
        expect(cursor.key).type.toBe<number>();
      });
      expect(numberCollectionKey.keys()).type.toBe<PromiseExtended<number[]>>();
      expect(numberCollectionKey.uniqueKeys()).type.toBe<
        PromiseExtended<number[]>
      >();
      numberCollectionKey.eachKey((key, cursor) => {
        expect(key).type.toBe<number>();
        expect(cursor.key).type.toBe<number>();
      });
      numberCollectionKey.eachUniqueKey((key, cursor) => {
        expect(key).type.toBe<number>();
        expect(cursor.key).type.toBe<number>();
      });
      numberCollectionKey.eachPrimaryKey((key, cursor) => {
        expect(cursor.key).type.toBe<number>();
      });
      const multiEntryCollectionKey = db.table.where("multiEntry").above("a");
      multiEntryCollectionKey.each((item, cursor) => {
        expect(cursor.key).type.toBe<string>();
      });
      expect(multiEntryCollectionKey.keys()).type.toBe<
        PromiseExtended<string[]>
      >();
      expect(multiEntryCollectionKey.uniqueKeys()).type.toBe<
        PromiseExtended<string[]>
      >();
      multiEntryCollectionKey.eachKey((key, cursor) => {
        expect(key).type.toBe<string>();
        expect(cursor.key).type.toBe<string>();
      });
      multiEntryCollectionKey.eachUniqueKey((key, cursor) => {
        expect(key).type.toBe<string>();
        expect(cursor.key).type.toBe<string>();
      });
      multiEntryCollectionKey.eachPrimaryKey((key, cursor) => {
        expect(cursor.key).type.toBe<string>();
      });

      // cloning
      expect(stringCollectionKey.clone()).type.toBe<
        typeof stringCollectionKey
      >();
      expect(numberCollectionKey.clone()).type.toBe<
        typeof numberCollectionKey
      >();
      expect(multiEntryCollectionKey.clone()).type.toBe<
        typeof multiEntryCollectionKey
      >();

      // or - where clause
      expect(stringCollectionKey.or("numberIndex").above).type.toBeCallableWith(
        123
      );
      expect(
        stringCollectionKey.or("numberIndex").above
      ).type.not.toBeCallableWith("stringValue");
      expect(numberCollectionKey.or("stringIndex").above).type.toBeCallableWith(
        "stringValue"
      );
      expect(
        numberCollectionKey.or("stringIndex").above
      ).type.not.toBeCallableWith(123);
    });

    // the collection should have the primary key type
    // item type testing
  });

  describe("collection", () => {
    interface TableItem {
      id: string;
      stringIndex: string;
      numberIndex: number;
      nestedIndex: { subIndex: number };
      notAnIndex: number;
      compound1: string;
      compound2: number;
      multiEntry: string[];
    }
    const db = dexieFactory(
      1,
      {
        table: tableBuilder<TableItem>()
          .primaryKey("id")
          .index("stringIndex")
          .index("numberIndex")
          .index("nestedIndex.subIndex")
          .compound("compound1", "compound2")
          .multi("multiEntry")
          .build(),
      },
      ""
    );

    it("should return the first TGet or undefined", () => {
      const db = dexieFactory(
        1,
        {
          table: tableClassBuilder(MappedStringId).primaryKey("id").build(),
        },
        "DemoDexie"
      );
      expect(db.table.toCollection().first()).type.toBe<
        PromiseExtended<MappedStringId | undefined>
      >();
    });

    it("should return the last TGet or undefined", () => {
      const db = dexieFactory(
        1,
        {
          table: tableClassBuilder(MappedStringId).primaryKey("id").build(),
        },
        "DemoDexie"
      );
      expect(db.table.toCollection().last()).type.toBe<
        PromiseExtended<MappedStringId | undefined>
      >();
    });

    it("should be sortable with property path on TGet, returning TGet[]", async () => {
      const db = dexieFactory(
        1,
        {
          table: tableClassBuilder(MappedStringId).primaryKey("id").build(),
        },
        "DemoDexie"
      );
      const collection = db.table.toCollection();
      const sorted = await collection.sortBy("nested.sub");
      expect(sorted).type.toBe<MappedStringId[]>();
      expect(collection.sortBy).type.not.toBeCallableWith(
        "nestedIndex.badPath"
      );
    });

    describe("filtering", () => {
      const db = dexieFactory(
        1,
        {
          string: tableBuilder<StringId>().primaryKey("id").build(),
          stringMapped: tableClassBuilder(MappedStringId)
            .primaryKey("id")
            .build(),
        },
        "DemoDexie"
      );

      it("should have until method with correct item type", () => {
        const stringMappedCollection = db.stringMapped.toCollection();
        const untilCollection = stringMappedCollection.until((item) => {
          expect(item).type.not.toHaveProperty("upperId");
          expect(item).type.toHaveProperty("other");
          return false;
        });
        expect(untilCollection).type.toBe<typeof stringMappedCollection>();
      });

      it("should have the filter ( and alias and ) method with correct item type", () => {
        const stringMappedCollection = db.stringMapped.toCollection();
        const filteredStringMappedCollection = stringMappedCollection.filter(
          (item) => {
            expect(item).type.not.toHaveProperty("upperId");
            expect(item).type.toHaveProperty("other");
            return true;
          }
        );
        expect(filteredStringMappedCollection).type.toBe<
          typeof stringMappedCollection
        >();

        stringMappedCollection.and((item) => {
          expect(item).type.not.toHaveProperty("upperId");
          expect(item).type.toHaveProperty("other");
          return true;
        });

        db.string.toCollection().filter((item) => {
          expect(item).type.toBe<StringId>();
          return true;
        });
      });
    });
  });
});

describe("primary key on object table", () => {
  interface TableItem {
    id: string;
    other: number;
  }
  const tableItem: TableItem = { id: "id1", other: 42 };
  const db = dexieFactory(
    1,
    {
      table: tableBuilder<TableItem>().primaryKey("id").build(),
    },
    "DemoDexie"
  );
  it("should add without primary key argument", () => {
    expect(db.table.add).type.toBeCallableWith(tableItem);
    expect(db.table.add).type.not.toBeCallableWith(tableItem, "id1");
    expect(db.table.add).type.not.toBeCallableWith({ id: "id1" });
  });
  it("should put without primary key argument", () => {
    expect(db.table.put).type.toBeCallableWith(tableItem);
    expect(db.table.put).type.not.toBeCallableWith(tableItem, "id1");
    expect(db.table.put).type.not.toBeCallableWith({ id: "id1" });
  });
});
