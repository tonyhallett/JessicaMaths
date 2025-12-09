import { add as dexieAddPropModHelper, type PromiseExtended } from "dexie";
import { dexieFactory } from "../dexieFactory";
import {
  tableBuilder,
  tableClassBuilder,
  tableClassBuilderExcluded,
  type DuplicateIndexError,
  type DuplicateKeysError,
} from "../tableBuilder";
import { expect, describe, it } from "tstyche";
import type { ChangeCallback } from "../Collection";
import { add, ObjectPropModification } from "../propmodifications";
import type { NoDescend } from "../utilitytypes";
import type { Level2 } from "../UpdateSpec";
import { upgrade } from "../upgrade";

describe("tableBuilder", () => {
  describe("primary key selection", () => {
    it("should allow singular primaryKey of T", () => {
      const builder = tableBuilder<{ id: string }>();
      expect(builder.primaryKey).type.toBeCallableWith("id");
      expect(builder.primaryKey).type.not.toBeCallableWith("doesnotexist");
    });

    it("should allow nested primary key when opt in", () => {
      const builder = tableBuilder<{ nested: { id: string } }, "II", "I">();
      expect(builder.primaryKey).type.toBeCallableWith("nested.id");
      expect(builder.primaryKey).type.not.toBeCallableWith(
        "nested.doesnotexist"
      );
    });

    it("should not allow null or optional", () => {
      const builder = tableBuilder<{
        id: string;
        nullable: number | null;
        optional1?: number;
        optional2: number | undefined;
      }>();
      expect(builder.primaryKey).type.not.toBeCallableWith("nullable");
      expect(builder.primaryKey).type.not.toBeCallableWith("optional1");
      expect(builder.primaryKey).type.not.toBeCallableWith("optional2");
    });

    it("should allow primary key to be allowed properties of leaf object when specified", () => {
      interface TableItem {
        stringValue: string;
        blobValue: Blob;
        fileValue: File;
        arrayValue: string[];
      }
      const builder = tableBuilder<TableItem, NoDescend, NoDescend, true>();
      expect(builder.primaryKey).type.toBeCallableWith("stringValue.length");
      expect(builder.primaryKey).type.toBeCallableWith("blobValue.size");
      expect(builder.primaryKey).type.toBeCallableWith("blobValue.type");
      expect(builder.primaryKey).type.toBeCallableWith("fileValue.size");
      expect(builder.primaryKey).type.toBeCallableWith("fileValue.type");
      expect(builder.primaryKey).type.toBeCallableWith("fileValue.name");
      expect(builder.primaryKey).type.toBeCallableWith(
        "fileValue.lastModified"
      );
      expect(builder.primaryKey).type.toBeCallableWith("arrayValue.length");

      const builderNotAllowed = tableBuilder<TableItem>();
      expect(builderNotAllowed.primaryKey).type.not.toBeCallableWith(
        "stringValue.length"
      );
    });

    it("should use the MaxDepth for deep paths", () => {
      interface TableItem {
        levelDefault: {
          levelI: {
            levelII: {
              id: string;
            };
          };
        };
      }
      const builder = tableBuilder<TableItem>();
      expect(builder.primaryKey).type.not.toBeCallableWith(
        "levelDefault.levelI.levelII.id"
      );

      const builderDeeper = tableBuilder<TableItem, "I">();
      expect(builderDeeper.primaryKey).type.not.toBeCallableWith(
        "levelDefault.levelI.levelII.id"
      );

      const builderIncludes = tableBuilder<TableItem, "II">();
      expect(builderIncludes.primaryKey).type.not.toBeCallableWith(
        "levelDefault.levelI.levelII.id"
      );
    });

    it("should allow compound primary key", () => {
      const builder = tableBuilder<
        { id: string; nested: { id2: number } },
        "I",
        "I"
      >();
      expect(builder.compoundKey).type.toBeCallableWith("id", "nested.id2");
      expect(builder.compoundKey).type.not.toBeCallableWith("id");
      expect(builder.compoundKey).type.not.toBeCallableWith();
    });

    it("should allow compound primary key to be allowed properties of leaf object when specified", () => {
      const builder = tableBuilder<
        { leaf1: string; leaf2: string },
        NoDescend,
        NoDescend,
        true
      >();
      expect(builder.compoundKey).type.toBeCallableWith(
        "leaf1.length",
        "leaf2.length"
      );

      const builderNotAllowed = tableBuilder<{
        leaf1: string;
        leaf2: string;
      }>();
      expect(builderNotAllowed.compoundKey).type.not.toBeCallableWith(
        "leaf1.length",
        "leaf2.length"
      );
    });

    it("should not allow null or optional for compound", () => {
      const builder = tableBuilder<{
        id: string;
        index1: number;
        nullable: number | null;
        optional1?: number;
        optional2: number | undefined;
      }>();
      expect(builder.compoundKey).type.not.toBeCallableWith(
        "index1",
        "nullable"
      );
      expect(builder.compoundKey).type.not.toBeCallableWith(
        "index1",
        "optional1"
      );
      expect(builder.compoundKey).type.not.toBeCallableWith(
        "index1",
        "optional2"
      );
    });

    it("should not be possible to complete the chain when duplicate keys are used", () => {
      const builder = tableBuilder<{ id: string; nested: { id2: number } }>();
      expect(builder.compoundKey("id", "id")).type.toBe<DuplicateKeysError>();
    });
  });

  describe("autoIncrement typing", () => {
    it("should not allow autoincrement on leaf type specific property", () => {
      const builder = tableBuilder<{ stringValue: string }>();
      expect(builder.autoIncrement).type.not.toBeCallableWith(
        "stringValue.length"
      );
    });

    it("should not allow null or optional properties for autoIncrement", () => {
      const builder = tableBuilder<{
        id: number;
        optional1?: number;
        optional2: number | undefined;
        nullable: number | undefined;
      }>();
      expect(builder.autoIncrement).type.toBeCallableWith("id");
      expect(builder.autoIncrement).type.not.toBeCallableWith("optional1");
      expect(builder.autoIncrement).type.not.toBeCallableWith("optional2");
      expect(builder.autoIncrement).type.not.toBeCallableWith("nullable");
    });

    // otherwise have to supply the key every time as key generator is number
    it("should only allow primary key type number or includes number in a union", () => {
      const builder = tableBuilder<{ stringPkey: string }>();
      expect(builder.autoIncrement).type.not.toBeCallableWith("stringPkey");

      const builderNumber = tableBuilder<{ numberPkey: number }>();
      expect(builderNumber.autoIncrement).type.toBeCallableWith("numberPkey");

      const builderUnion = tableBuilder<{ unionPkey: string | number }>();
      expect(builderUnion.autoIncrement).type.toBeCallableWith("unionPkey");

      const builderBadUnion = tableBuilder<{
        badUnion: string | { obj: number };
      }>();
      expect(builderBadUnion.autoIncrement).type.not.toBeCallableWith(
        "badUnion"
      );
    });
  });

  describe("hidden auto", () => {
    const builder = tableBuilder<{ prop: string }>();
    it("should default to primary key type number", () => {
      expect(builder.hiddenAuto).type.toBeCallableWith();
    });

    it("should allow specifying a primary key type that is number", () => {
      expect(builder.hiddenAuto<number>).type.toBeCallableWith();
    });

    it("should allow specifying a primary key that is am IndexableType union with number", () => {
      expect(builder.hiddenAuto<string | number>).type.toBeCallableWith();
    });

    it("should not allow specifying a primary key that does not include number in a union", () => {
      expect(builder.hiddenAuto<string | Date>).type.not.toBeCallableWith();
    });
  });

  describe("hidden explicit", () => {
    const builder = tableBuilder<{ prop: string }>();
    it("should allow specifying a primary key type that is an IndexableType", () => {
      builder.hiddenExplicit(); // default to number

      builder.hiddenExplicit<string>();
      builder.hiddenExplicit<number>();
      builder.hiddenExplicit<Date>();
      builder.hiddenExplicit<ArrayBuffer>();
      builder.hiddenExplicit<string | Date>();
      // @ts-expect-error Type 'boolean' does not satisfy the constraint 'IndexableType'.
      builder.hiddenExplicit<boolean>();
      // @ts-expect-error Type 'string | boolean' does not satisfy the constraint 'IndexableType'....
      builder.hiddenExplicit<string | boolean>();
    });
  });

  describe("index path typing", () => {
    const builder = tableBuilder<
      {
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
        optionalIndex1: number | undefined;
        optionalIndex2?: number;
        nullable: number | null;
        nullableObject: { a: number } | null;
      },
      "I",
      "I"
    >().primaryKey("id");

    it("should allow valid index path", () => {
      expect(builder.index).type.toBeCallableWith("index");
      expect(builder.index).type.not.toBeCallableWith("doesnotexist");
    });

    it("should allow optional and nullable for index", () => {
      expect(builder.index).type.toBeCallableWith("optionalIndex1");
      expect(builder.index).type.toBeCallableWith("optionalIndex2");
      expect(builder.index).type.toBeCallableWith("nullable");
      expect(builder.index).type.toBeCallableWith("nullableObject.a");
    });

    it("should allow nested index path when MaxDepth allows", () => {
      interface Nested {
        id: string;
        nested: { index: string; multi: string[] };
      }
      const builder = tableBuilder<Nested, "I", "">().primaryKey("id");
      const builderDefault = tableBuilder<Nested, "I">().primaryKey("id");
      const builderLevel1 = tableBuilder<Nested, "I", "I">().primaryKey("id");

      expect(builder.index).type.not.toBeCallableWith("nested.index");
      expect(builderDefault.index).type.not.toBeCallableWith("nested.index");
      expect(builder.multi).type.not.toBeCallableWith("nested.multi");
      expect(builderDefault.multi).type.not.toBeCallableWith("nested.multi");

      expect(builderLevel1.index).type.toBeCallableWith("nested.index");
      expect(builderLevel1.multi).type.toBeCallableWith("nested.multi");
    });

    it("should allow index key to be allowed properties of leaf object when specified", () => {
      interface TableItem {
        id: string;
        stringValue: string;
        blobValue: Blob;
        fileValue: File;
        arrayValue: string[];
      }
      const builder = tableBuilder<
        TableItem,
        NoDescend,
        NoDescend,
        true
      >().primaryKey("id");
      expect(builder.index).type.toBeCallableWith("stringValue.length");
      expect(builder.index).type.toBeCallableWith("blobValue.size");
      expect(builder.index).type.toBeCallableWith("blobValue.type");
      expect(builder.index).type.toBeCallableWith("fileValue.size");
      expect(builder.index).type.toBeCallableWith("fileValue.type");
      expect(builder.index).type.toBeCallableWith("fileValue.name");
      expect(builder.index).type.toBeCallableWith("fileValue.lastModified");
      expect(builder.index).type.toBeCallableWith("arrayValue.length");

      const builderNotAllowed = tableBuilder<TableItem>().primaryKey("id");
      expect(builderNotAllowed.index).type.not.toBeCallableWith(
        "stringValue.length"
      );
    });

    it("should allow compound index key to be allowed properties of leaf object when specified", () => {
      interface TableItem {
        id: string;
        stringValue: string;
        blobValue: Blob;
        fileValue: File;
        arrayValue: string[];
      }
      const builder = tableBuilder<
        TableItem,
        NoDescend,
        NoDescend,
        true
      >().primaryKey("id");
      expect(builder.compound).type.toBeCallableWith(
        "stringValue.length",
        "blobValue.size",
        "blobValue.type",
        "fileValue.size",
        "fileValue.type",
        "fileValue.name",
        "fileValue.lastModified",
        "arrayValue.length"
      );
      const builderNotAllowed = tableBuilder<TableItem>().primaryKey("id");
      expect(builderNotAllowed.compound).type.not.toBeCallableWith(
        "stringValue.length",
        "blobValue.size",
        "blobValue.type",
        "fileValue.size",
        "fileValue.type",
        "fileValue.name",
        "fileValue.lastModified",
        "arrayValue.length"
      );
    });

    it("should not allow primary key as index", () => {
      expect(builder.index).type.not.toBeCallableWith("id");
    });

    it("should not allow primary key as unique index", () => {
      expect(builder.uniqueIndex).type.not.toBeCallableWith("id");
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
      const builder = tableBuilder<
        {
          id: string;
          id2: number;
          index: string;
        },
        "II",
        "I"
      >().compoundKey("id", "id2");
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

    it("should work with hiddenAuto and hiddenExplicit primary keys", () => {
      const builder = tableBuilder<{ prop: string }>();
      builder.hiddenAuto().index("prop");
      builder.hiddenExplicit<number>().index("prop");
    });
  });

  describe("tableClassBuilderExcluded", () => {
    it("should exclude properties from primary key / index key selection", () => {
      class EntityClass {
        constructor(id: number) {
          this.id = id;
        }
        id: number;
        str: string = "";
        other: string = "";
        method() {}
      }

      const builder =
        tableClassBuilderExcluded(EntityClass).excludedKeys<"str">(/* [
        "str",
      ] */);
      expect(builder.primaryKey).type.not.toBeCallableWith("str");
      expect(builder.primaryKey("id").index).type.not.toBeCallableWith("str");
    });
  });
});

describe("database typed transaction", () => {
  const db = dexieFactory(
    {
      string: tableBuilder<{ id: string }>().primaryKey("id").build(),
      number: tableBuilder<{ id: number }>().primaryKey("id").build(),
      date: tableBuilder<{ id: Date }>().primaryKey("id").build(),
    },
    "DemoDexie"
  );

  it("should include all tables on the transaction to on populate", () => {
    db.on("populate", (tx) => {
      expect(tx.string).type.toBe<typeof db.string>();
      expect(tx.number).type.toBe<typeof db.number>();
      expect(tx.date).type.toBe<typeof db.date>();
    });
  });

  describe("db.transaction transaction argument has only tables specified", () => {
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

interface Compound {
  stringPart: string;
  numberPart: number;
}

describe("table base", () => {
  const db = dexieFactory(
    {
      string: tableBuilder<StringId>().primaryKey("id").build(),
      stringMapped: tableClassBuilder(MappedStringId).primaryKey("id").build(),
      number: tableBuilder<NumberId>().primaryKey("id").build(),
      compound: tableBuilder<Compound>()
        .compoundKey("stringPart", "numberPart")
        .build(),
      leafPropertyTable: tableBuilder<StringId, NoDescend, NoDescend, true>()
        .primaryKey("id.length")
        .build(),
    },
    "DemoDexie"
  );

  it("should delete with correct primary key type", () => {
    expect(db.string.delete).type.toBeCallableWith("stringId");
    expect(db.string.delete).type.not.toBeCallableWith(123);
    expect(db.string.bulkDelete).type.toBeCallableWith(["stringId"]);
    expect(db.string.bulkDelete).type.not.toBeCallableWith("stringId");
    expect(db.stringMapped.delete).type.toBeCallableWith("stringId");
    expect(db.stringMapped.delete).type.not.toBeCallableWith(123);
    expect(db.number.delete).type.toBeCallableWith(123);
    expect(db.number.delete).type.not.toBeCallableWith("stringId");
    expect(db.number.bulkDelete).type.toBeCallableWith([123]);
    expect(db.number.bulkDelete).type.not.toBeCallableWith(123);

    // compound
  });

  it("should get with correct primary key type", () => {
    expect(db.string.get).type.toBeCallableWith("stringId");
    expect(db.string.get).type.not.toBeCallableWith(123);
    expect(db.string.bulkGet).type.toBeCallableWith(["stringId1", "stringId2"]);
    expect(db.string.bulkGet).type.not.toBeCallableWith([1, 2]);
    expect(db.stringMapped.get).type.toBeCallableWith("stringId");
    expect(db.stringMapped.get).type.not.toBeCallableWith(123);
    expect(db.stringMapped.bulkGet).type.toBeCallableWith([
      "stringId1",
      "stringId2",
    ]);
    expect(db.stringMapped.bulkGet).type.not.toBeCallableWith([1, 2]);
    expect(db.number.get).type.toBeCallableWith(123);
    expect(db.number.get).type.not.toBeCallableWith("stringId");
    expect(db.number.bulkGet).type.toBeCallableWith([123]);
    expect(db.number.bulkGet).type.not.toBeCallableWith(["stringId"]);
    expect(db.compound.get).type.toBeCallableWith(["string", 42]);
    expect(db.compound.get).type.not.toBeCallableWith(["string"]);
    expect(db.compound.get).type.not.toBeCallableWith([42, "string"]);
    expect(db.compound.bulkGet).type.toBeCallableWith([["string", 42]]);
    expect(db.compound.bulkGet).type.not.toBeCallableWith([[42, "string"]]);
    expect(db.leafPropertyTable.get).type.toBeCallableWith(5);
  });

  it("should get with equality", () => {
    interface TableItem {
      id: string;
      compound1: string;
      compound2: number;
      compound3: Date;
    }
    interface TableCompoundPKeyItem {
      pkString: string;
      pkNumber: number;
      compound1: string;
      compound2: number;
      compound3: Date;
    }
    const db = dexieFactory(
      {
        table: tableBuilder<TableItem>()
          .primaryKey("id")
          .compound("compound1", "compound2", "compound3")
          .build(),
        tableCompoundPk: tableBuilder<TableCompoundPKeyItem>()
          .compoundKey("pkString", "pkNumber")
          .build(),
      },
      ""
    );
    expect(db.table.get({ compound1: "value" })).type.toBe<
      PromiseExtended<TableItem | undefined>
    >();
    expect(db.table.get({ compound1: "value", compound2: 42 })).type.toBe<
      PromiseExtended<TableItem | undefined>
    >();
    expect(
      db.table.get({ compound1: "value", compound2: 42, compound3: new Date() })
    ).type.toBe<PromiseExtended<TableItem | undefined>>();
    expect(db.table.get({ id: "value" })).type.toBe<
      PromiseExtended<TableItem | undefined>
    >();

    expect(
      db.tableCompoundPk.get({ pkString: "value", pkNumber: 42 })
    ).type.toBe<PromiseExtended<TableCompoundPKeyItem | undefined>>();
    expect(db.tableCompoundPk.get({ pkString: "value" })).type.toBe<
      PromiseExtended<TableCompoundPKeyItem | undefined>
    >();
  });

  it("should get the correct type", () => {
    expect(db.string.get("stringId")).type.toBe<
      PromiseExtended<StringId | undefined>
    >();
    expect(db.string.bulkGet(["stringId"])).type.toBe<
      PromiseExtended<(StringId | undefined)[]>
    >();
    expect(db.stringMapped.get("stringId")).type.toBe<
      PromiseExtended<MappedStringId | undefined>
    >();
    expect(db.stringMapped.bulkGet(["stringId"])).type.toBe<
      PromiseExtended<(MappedStringId | undefined)[]>
    >();
    expect(db.number.get(123)).type.toBe<
      PromiseExtended<NumberId | undefined>
    >();
    expect(db.number.bulkGet([123])).type.toBe<
      PromiseExtended<(NumberId | undefined)[]>
    >();
    expect(db.compound.get(["string", 42])).type.toBe<
      PromiseExtended<Compound | undefined>
    >();
    expect(db.compound.bulkGet([["string", 42]])).type.toBe<
      PromiseExtended<(Compound | undefined)[]>
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
      db.compound.each((item, cursor) => {
        expect(item).type.toBe<Compound>();
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
      db.compound.each((item, cursor) => {
        expect(cursor.key).type.toBe<[string, number]>();
        expect(cursor.primaryKey).type.toBe<[string, number]>();
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
      });
      expect(pkCollection.keys()).type.toBe<PromiseExtended<string[]>>();
      expect(pkCollection.uniqueKeys()).type.toBe<PromiseExtended<string[]>>();
      expect(pkCollection.primaryKeys()).type.toBe<PromiseExtended<string[]>>();
    });

    const primaryKeyCompoundCollections = [
      db.compound.offset(10),
      db.compound.limit(5),
      db.compound.toCollection(),
      db.compound.reverse(),
    ];
    primaryKeyCompoundCollections.forEach((pkCollection) => {
      pkCollection.each((item, cursor) => {
        expect(cursor.key).type.toBe<[string, number]>();
        expect(cursor.primaryKey).type.toBe<[string, number]>();
      });
      expect(pkCollection.keys()).type.toBe<
        PromiseExtended<[string, number][]>
      >();
      expect(pkCollection.uniqueKeys()).type.toBe<
        PromiseExtended<[string, number][]>
      >();
      expect(pkCollection.primaryKeys()).type.toBe<
        PromiseExtended<[string, number][]>
      >();
    });
  });

  it("should have key type the index type when orderBy", () => {
    const db = dexieFactory(
      {
        table: tableBuilder<
          {
            id: string;
            stringIndex: string;
            numberIndex: number;
            nestedIndex: { subIndex: Date };
            notAnIndex: number;
          },
          "I",
          "II"
        >()
          .primaryKey("id")
          .index("stringIndex")
          .index("numberIndex")
          .index("nestedIndex.subIndex")
          .compound("stringIndex", "numberIndex")
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
    db.table.orderBy(["stringIndex", "numberIndex"]).each((item, cursor) => {
      expect(cursor.key).type.toBe<[string, number]>();
    });
  });

  it("shoould have key type the primary key type when orderBy :id", () => {
    const db = dexieFactory(
      {
        stringIdTable: tableBuilder<{
          id: string;
        }>()
          .primaryKey("id")
          .build(),
        numberIdTable: tableBuilder<{
          id: number;
        }>()
          .primaryKey("id")
          .build(),
        compoundIdTable: tableBuilder<{
          id1: number;
          id2: string;
        }>()
          .compoundKey("id1", "id2")
          .build(),
      },
      ""
    );

    db.stringIdTable.orderBy(":id").each((item, cursor) => {
      expect(cursor.key).type.toBe<string>();
    });
    db.numberIdTable.orderBy(":id").each((item, cursor) => {
      expect(cursor.key).type.toBe<number>();
    });
    db.compoundIdTable.orderBy(":id").each((item, cursor) => {
      expect(cursor.key).type.toBe<[number, string]>();
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
    interface TableItem {
      id: string;
      stringIndex: string;
      numberIndex: number;
      nestedIndex: { subIndex: number };
      notAnIndex: number;
      compound1: string;
      compound2: number;
      multiEntry: string[];
      unionIndex: string | number;
    }

    const db = dexieFactory(
      {
        table: tableBuilder<TableItem, "I", "II">()
          .primaryKey("id")
          .index("stringIndex")
          .index("numberIndex")
          .index("nestedIndex.subIndex")
          .index("unionIndex")
          .compound("compound1", "compound2")
          .multi("multiEntry")
          .build(),
        mappedTable: tableClassBuilder(MappedStringId)
          .primaryKey("id")
          .index("other")
          .build(),
      },
      ""
    );

    it("should have the typed db as a property of where clause and collection", () => {
      expect(db.table.where(":id").db).type.toBe<typeof db>();
      expect(db.table.where(":id").anyOf(["key1", "key2"]).db).type.toBe<
        typeof db
      >();
    });

    it("should accept index paths", () => {
      expect(db.table.where).type.toBeCallableWith("stringIndex");
      expect(db.table.where).type.toBeCallableWith("nestedIndex.subIndex");
      expect(db.table.where).type.not.toBeCallableWith("notAnIndex");
      expect(db.table.where).type.not.toBeCallableWith("nestedIndex.badPath");
    });

    it("should accept :id for primary key", () => {
      expect(db.table.where).type.toBeCallableWith(":id");
    });

    it("should accept the pkey", () => {
      const db = dexieFactory(
        {
          pkTable: tableBuilder<{ id: number }>().primaryKey("id").build(),
          pkCompoundTable: tableBuilder<{ id1: number; id2: string }>()
            .compoundKey("id1", "id2")
            .build(),
        },
        ""
      );
      expect(db.pkTable.where).type.toBeCallableWith("id");
      expect(db.pkCompoundTable.where).type.toBeCallableWith(["id1", "id2"]);
    });

    it("should accept virtual indexes", () => {
      const db = dexieFactory(
        {
          table: tableBuilder<{
            id: number;
            index1: number;
            index2: string;
            index3: Date;
          }>()
            .primaryKey("id")
            .compound("index1", "index2", "index3")
            .build(),
        },
        ""
      );
      expect(db.table.where).type.toBeCallableWith([
        "index1",
        "index2",
        "index3",
      ]);
      // virtual index subsets
      expect(db.table.where).type.toBeCallableWith(["index1", "index2"]);
      expect(db.table.where).type.toBeCallableWith("index1");
      // dexie does not support single in this manner though
      expect(db.table.where).type.not.toBeCallableWith(["index1"]);
    });

    it("should accept multiEntry index paths", () => {
      expect(db.table.where).type.toBeCallableWith("multiEntry");
    });

    it("should accept compound key paths", () => {
      expect(db.table.where).type.toBeCallableWith(["compound1", "compound2"]);
      expect(db.table.where).type.not.toBeCallableWith([
        "compound2",
        "compound1",
      ]);
    });

    it("should accept virtual compound primary key paths", () => {
      const db = dexieFactory(
        {
          table: tableBuilder<{ id1: number; id2: string; id3: Date }>()
            .compoundKey("id1", "id2", "id3")
            .build(),
        },
        ""
      );
      expect(db.table.where).type.toBeCallableWith(["id1", "id2", "id3"]);
      expect(db.table.where).type.toBeCallableWith(["id1", "id2"]);
      expect(db.table.where).type.toBeCallableWith("id1");
      expect(db.table.where).type.not.toBeCallableWith(["id2", "id1"]);
    });

    it("should have methods typed to the index type when using index", () => {
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
      expect(whereMultiEntry.anyOf).type.toBeCallableWith(["a", "b"]);
      expect(whereMultiEntry.noneOf).type.toBeCallableWith(["a", "b"]);
      expect(whereMultiEntry.equals).type.toBeCallableWith("a");

      const whereCompound = db.table.where(["compound1", "compound2"]);
      expect(whereCompound.equals).type.toBeCallableWith(["a", 1]);
      expect(whereCompound.equals).type.not.toBeCallableWith([1, "a"]);
      expect(whereCompound.equals).type.not.toBeCallableWith("a");

      expect(whereCompound.anyOf).type.toBeCallableWith([
        ["a", 1],
        ["b", 2],
      ]);
      expect(whereCompound.anyOf).type.not.toBeCallableWith([
        ["a", "b"],
        [1, 2],
      ]);

      const whereUnion = db.table.where("unionIndex");
      expect(whereUnion.equals).type.toBeCallableWith("stringValue");
      expect(whereUnion.equals).type.toBeCallableWith(123);

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

      expect(whereUnion).type.toHaveProperty("startsWith");
    });

    it("should have methods typed to the virtual index type when using virtul indexes", () => {
      const db = dexieFactory(
        {
          table: tableBuilder<{
            id: number;
            index1: number;
            index2: string;
            index3: Date;
          }>()
            .primaryKey("id")
            .compound("index1", "index2", "index3")
            .build(),
        },
        ""
      );
      db.table.where("index1").equals(123);
      db.table.where(["index1", "index2"]).equals([123, "stringValue"]);
    });

    describe("where equality or alias", () => {
      it("should accept single index object", () => {
        db.table.where({ stringIndex: "value" }).each((item, cursor) => {
          expect(cursor.key).type.toBe<string>();
        });
        db.table
          .whereEquality({ stringIndex: "value" })
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<string>();
          });
        expect(db.table.where).type.not.toBeCallableWith({ stringIndex: 42 });
        expect(db.table.where).type.not.toBeCallableWith({ notAnIndex: 123 });

        // where with filter
        db.table
          .whereEquality({ stringIndex: "value", notAnIndex: 123 })
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<string>();
          });
        db.table
          .whereEquality({ numberIndex: 1, notAnIndex: 123 })
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<number>();
          });

        // two indexes cannot determine the key type so union
        db.table
          .whereEquality({ numberIndex: 1, stringIndex: "" })
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<number | string>();
          });

        expect(
          db.table.whereEquality({ numberIndex: 1, notAPath: 123 })
        ).type.toBe<never>();

        // alias of whereEquality - only single allowed
        db.table
          .whereSingleEquality({ stringIndex: "value" })
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<string>();
          });

        expect(db.table.whereSingleEquality).type.not.toBeCallableWith({
          compound1: "a",
        });
        expect(
          db.table.whereSingleEquality({ numberIndex: 42, additional: 1 })
        ).type.toBe<never>();
      });

      it("should accept an equality filter", () => {
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
          {
            table: tableBuilder<TableItem, "I">()
              .primaryKey("id")
              .index("stringIndex")
              .index("numberIndex")
              .build(),
          },
          ""
        );
        db.table
          .whereSingleFilterEquality(
            { stringIndex: "value" },
            { multiEntry: ["a"] }
          )
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<string>();
          });

        expect(
          db.table.whereSingleFilterEquality(
            { stringIndex: "value", additional: 1 },
            { multiEntry: ["a"] }
          )
        ).type.toBe<never>();
      });

      it("should accept compound index object", () => {
        interface TableItem {
          id: string;
          compound1: string;
          compound2: number;
          compound3: Date;
        }
        const db = dexieFactory(
          {
            table: tableBuilder<TableItem, "I">()
              .primaryKey("id")
              .compound("compound1", "compound2", "compound3")
              .build(),
          },
          ""
        );
        db.table
          .where({ compound1: "a", compound2: 1, compound3: new Date() })
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<[string, number, Date]>();
          });
        // virtual multiple
        db.table
          .where({ compound1: "a", compound2: 1 })
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<[string, number]>();
          });

        // virtual singular
        db.table.where({ compound1: "a" }).each((item, cursor) => {
          expect(cursor.key).type.toBe<string>();
        });
        expect(db.table.where).type.not.toBeCallableWith({ compound2: 1 });

        expect(
          db.table.where({ compound1: "a", compound3: new Date() })
        ).type.toBe<never>();
        expect(
          db.table.where({ compound1: "a", additional: 1 })
        ).type.toBe<never>();

        // alias of whereEquality - only composite allowed

        db.table
          .whereCompositeEquality({
            compound1: "a",
            compound2: 1,
            compound3: new Date(),
          })
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<[string, number, Date]>();
          });
        // virtual multiple
        db.table
          .whereCompositeEquality({ compound1: "a", compound2: 1 })
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<[string, number]>();
          });

        // virtual singular
        db.table
          .whereCompositeEquality({ compound1: "a" })
          .each((item, cursor) => {
            expect(cursor.key).type.toBe<string>();
          });

        // not sigular index or pkey
        expect(db.table.whereCompositeEquality).type.not.toBeCallableWith({
          id: "",
        });
        expect(db.table.whereCompositeEquality).type.not.toBeCallableWith({
          compound2: 1,
        });
        expect(
          db.table.whereCompositeEquality({
            compound1: "a",
            compound3: new Date(),
          })
        ).type.toBe<never>();
        expect(
          db.table.whereCompositeEquality({ compound1: "a", additional: 1 })
        ).type.toBe<never>();
      });
    });

    it("should return collection with key typed to the index type when using index", () => {
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

      expect(
        stringCollectionKey.or(["compound1", "compound2"]).equals
      ).type.toBeCallableWith(["a", 1]);

      expect(numberCollectionKey.or(":id").above).type.toBeCallableWith(
        "pkeyid"
      );
      expect(numberCollectionKey.or("id").above).type.toBeCallableWith(
        "pkeyid"
      );

      expect(numberCollectionKey.or(":id").above).type.not.toBeCallableWith(1);
      expect(numberCollectionKey.or("id").above).type.not.toBeCallableWith(1);

      // or does not have equality
      expect(stringCollectionKey.or).type.not.toBeCallableWith({
        compound1: "a",
      });
    });

    it("should return collection with key typed to the primary type when using pkey", () => {
      interface TableItem {
        id1: string;
        id2: number;
      }
      const db = dexieFactory(
        {
          compound: tableBuilder<TableItem>().compoundKey("id1", "id2").build(),
          outbound: tableBuilder<TableItem>()
            .hiddenAuto()
            .index("id1")
            .index("id2")
            .build(),
        },
        ""
      );

      expect(db.compound.where(":id").above(["a", 1]).keys()).type.toBe<
        PromiseExtended<[string, number][]>
      >();
      expect(
        db.compound.where(["id1", "id2"]).above(["a", 1]).keys()
      ).type.toBe<PromiseExtended<[string, number][]>>();

      db.outbound
        .where(":id")
        .above(1)
        .each((item, cursor) => {
          expect(cursor.key).type.toBe<number>();
        });

      // should be a union of keys when or
      expect(
        db.outbound.where(":id").equals(42).or("id1").equals("value").keys()
      ).type.toBe<PromiseExtended<(string | number)[]>>();
    });

    it("should return collection with the primary key type", () => {
      expect(db.table.where("stringIndex").above("a").primaryKeys()).type.toBe<
        PromiseExtended<string[]>
      >();
      expect(db.table.where("numberIndex").above(1).primaryKeys()).type.toBe<
        PromiseExtended<string[]>
      >();
    });

    it("should return collection with the correct item type", () => {
      const stringCollection = db.table.where("stringIndex").above("a");
      const numberCollection = db.table.where("numberIndex").above(1);
      const mappedCollection = db.mappedTable.where("other").above(1);
      expect(mappedCollection.toArray()).type.toBe<
        PromiseExtended<MappedStringId[]>
      >();
      expect(stringCollection.toArray()).type.toBe<
        PromiseExtended<TableItem[]>
      >();
      expect(numberCollection.toArray()).type.toBe<
        PromiseExtended<TableItem[]>
      >();
      stringCollection.each((item, cursor) => {
        expect(item).type.toBe<TableItem>();
      });
      numberCollection.each((item, cursor) => {
        expect(item).type.toBe<TableItem>();
      });
      mappedCollection.each((item, cursor) => {
        expect(item).type.toBe<MappedStringId>();
      });
    });
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
      {
        table: tableBuilder<TableItem, "I", "II">()
          .primaryKey("id")
          .index("stringIndex")
          .index("numberIndex")
          .index("nestedIndex.subIndex")
          .compound("compound1", "compound2")
          .multi("multiEntry")
          .build(),
        mappedTabled: tableClassBuilder(MappedStringId)
          .primaryKey("id")
          .index("other")
          .build(),
      },
      ""
    );

    it("should return the first TGet or undefined", () => {
      const db = dexieFactory(
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

    it("should limit to the same collection type", () => {
      const collection = db.table.toCollection();
      expect(collection.limit(5)).type.toBe<typeof collection>();
    });

    it("should offset to the same collection type", () => {
      const collection = db.table.toCollection();
      expect(collection.offset(5)).type.toBe<typeof collection>();
    });

    it("should reverse to the same collection type", () => {
      const collection = db.table.toCollection();
      expect(collection.reverse()).type.toBe<typeof collection>();
    });

    it("should desc to the same collection type", () => {
      const collection = db.table.toCollection();
      expect(collection.desc()).type.toBe<typeof collection>();
    });

    it("should distinct to the same collection type", () => {
      const collection = db.table.toCollection();
      expect(collection.distinct()).type.toBe<typeof collection>();
    });

    describe("filtering", () => {
      const db = dexieFactory(
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

    it("should raw to a collection returning TDatabase and not TGet", () => {
      const mappedCollection = db.mappedTabled.toCollection();
      expect(mappedCollection.toArray()).type.toBe<
        PromiseExtended<MappedStringId[]>
      >();
      expect(mappedCollection.raw().toArray()).type.not.toBe<
        PromiseExtended<MappedStringId[]>
      >();
    });
  });
});

describe("Inbound - non auto", () => {
  interface TableItem {
    id: string;
    other: number;
    nested: {
      sub: number;
      deep: {
        level2: {
          level3: string;
        };
      };
    };
  }

  class EntityClass {
    constructor(id: number) {
      this.id = id;
    }
    id: number;
    excluded: string = "";
    method() {}
  }

  const tableItem: TableItem = {
    id: "id1",
    other: 42,
    nested: { sub: 1, deep: { level2: { level3: "level3" } } },
  };

  class TableItemAdditionalPropertyClass implements TableItem {
    id: string = "";
    other: number = 0;
    additionalProp: string = "";
    nested: {
      sub: number;
      deep: { level2: { level3: string } };
    } = { sub: 0, deep: { level2: { level3: "" } } };
  }

  class TableItemWithMethod implements TableItem {
    id: string = "";
    other: number = 0;
    nested: {
      sub: number;
      deep: { level2: { level3: string } };
    } = { sub: 0, deep: { level2: { level3: "" } } };
    method() {}
  }

  const db = dexieFactory(
    {
      table: tableBuilder<TableItem, Level2>().primaryKey("id").build(),
      mappedTable: tableClassBuilderExcluded(EntityClass)
        .excludedKeys<"excluded">()
        .primaryKey("id")
        .build(),
    },
    "DemoDexie"
  );

  describe("add, put, bulkAdd, bulkPut", () => {
    it("should add without primary key argument", () => {
      expect(db.table.add).type.toBeCallableWith(tableItem);
      expect(db.table.add).type.not.toBeCallableWith({});
      expect(db.table.add).type.not.toBeCallableWith(tableItem, "id1");
      expect(db.table.add).type.not.toBeCallableWith({ id: "id1" });
      const additionalDeep = {
        id: "id1",
        other: 42,
        nested: {
          sub: 1,
          deep: { level2: { level3: "level3" }, additionalProp: "value" },
        },
      };
      expect(db.table.add).type.not.toBeCallableWith(additionalDeep);
      expect(db.table.add).type.not.toBeCallableWith(
        new TableItemAdditionalPropertyClass()
      );
      expect(db.table.add).type.toBeCallableWith(new TableItemWithMethod());
    });

    it("should put without primary key argument", () => {
      expect(db.table.put).type.toBeCallableWith(tableItem);
      expect(db.table.put).type.not.toBeCallableWith(tableItem, "id1");
      expect(db.table.put).type.not.toBeCallableWith({ id: "id1" });
    });

    it("should bulk add without primary keys argument", () => {
      const tableItems = [tableItem, tableItem];
      expect(db.table.bulkAdd).type.toBeCallableWith(tableItems);

      expect(db.table.bulkAdd).type.toBeCallableWith([
        tableItem,
        new TableItemWithMethod(),
      ]);

      // should prevent primary keys argument
      expect(db.table.bulkAdd).type.not.toBeCallableWith(tableItems, [
        "id1",
        "id2",
      ]);

      expect(db.table.bulkAdd).type.not.toBeCallableWith([{ id: "id1" }]);

      // additional property checks only for bulkAddTuple
      const additionalDeep = {
        id: "id1",
        other: 42,
        nested: {
          sub: 1,
          deep: { level2: { level3: "level3" }, additionalProp: "value" },
        },
      };
      expect(db.table.bulkAdd).type.toBeCallableWith([additionalDeep]);
      expect(db.table.bulkAddTuple).type.not.toBeCallableWith([additionalDeep]);

      expect(db.table.bulkAdd).type.toBeCallableWith([
        tableItem,
        new TableItemAdditionalPropertyClass(),
      ]);
      expect(db.table.bulkAddTuple).type.not.toBeCallableWith([
        tableItem,
        new TableItemAdditionalPropertyClass(),
      ]);
    });

    it("should bulk put without primary keys argument", () => {
      expect(db.table.bulkPut).type.toBeCallableWith([tableItem, tableItem]);
      expect(db.table.bulkPut).type.not.toBeCallableWith(
        [tableItem, tableItem],
        ["id1", "id2"]
      );
      expect(db.table.bulkPut).type.not.toBeCallableWith([{ id: "id1" }]);
    });

    it("should not allow adding with excluded keys", () => {
      const dbEntityExclude = dexieFactory(
        {
          table: tableClassBuilderExcluded(EntityClass)
            .excludedKeys<"excluded">()
            .primaryKey("id")
            .build(),
        },
        "DemoDexieEntityExclude"
      );

      expect(dbEntityExclude.table.add).type.toBeCallableWith({ id: 1 });
      expect(dbEntityExclude.table.add).type.not.toBeCallableWith({
        id: 1,
        excluded: "value",
      });

      expect(dbEntityExclude.table.add).type.not.toBeCallableWith({
        id: 1,
        excessDataProperty: 123,
      });

      expect(dbEntityExclude.table.add).type.not.toBeCallableWith(
        new EntityClass(1)
      );
    });
  });

  describe("update, upsert", () => {
    it("should update with primary key argument and change callback - database type", () => {
      const changeCallback: ChangeCallback<TableItem, TableItem, string> =
        null as any;
      expect(db.table.update).type.toBeCallableWith("id1", changeCallback);
      expect(db.table.update).type.not.toBeCallableWith(1, changeCallback);
      db.mappedTable.update(1, (tInsert, ctx) => {
        expect(tInsert).type.not.toHaveProperty("excluded");
        expect(tInsert).type.toHaveProperty("id");
        delete ctx.value;
      });
    });

    it("should update with table entry argument and change callback - database type", () => {
      const changeCallback: ChangeCallback<TableItem, TableItem, string> =
        null as any;
      expect(db.table.update).type.toBeCallableWith(tableItem, changeCallback);
      expect(db.table.update).type.not.toBeCallableWith(
        { id: "" },
        changeCallback
      );
    });

    const nested: TableItem["nested"] = {
      sub: 5,
      deep: { level2: { level3: "level3" } },
    };

    it("should update with primary key argument and partial database type expressed with key paths", () => {
      expect(db.table.update).type.toBeCallableWith("id1", { "nested.sub": 5 });

      expect(db.table.update).type.toBeCallableWith("id1", {
        nested,
      });
      expect(db.table.update).type.not.toBeCallableWith(1, { "nested.sub": 5 });
      expect(db.table.update).type.not.toBeCallableWith("id1", {
        "nested.sub": "incorrect type",
      });
      expect(db.table.update).type.not.toBeCallableWith("id1", {
        "nested.doesnotexist": 1,
      });
    });

    it("should update with table entry argument and partial database type expressed with key paths", () => {
      expect(db.table.update).type.toBeCallableWith(tableItem, {
        "nested.sub": 5,
      });
      expect(db.table.update).type.not.toBeCallableWith(
        { id: "" },
        {
          "nested.sub": 5,
        }
      );
      expect(db.table.update).type.not.toBeCallableWith(tableItem, {
        "nested.sub": "incorrect type",
      });
      expect(db.table.update).type.not.toBeCallableWith(tableItem, {
        "nested.doesnotexist": 1,
      });
    });

    it("should allow delete and add by changing the primary key", () => {
      expect(db.table.update).type.toBeCallableWith(tableItem, { id: "newid" });
    });

    it("should update using max depth type parameter", () => {
      const noDescend = dexieFactory(
        {
          noDescend: tableBuilder<TableItem, "">().primaryKey("id").build(),
        },
        "NoDescend"
      ).noDescend;

      const level1 = dexieFactory(
        {
          level1: tableBuilder<TableItem, "I">().primaryKey("id").build(),
        },
        "Level1"
      ).level1;

      const level2 = dexieFactory(
        {
          level2: tableBuilder<TableItem, "II">().primaryKey("id").build(),
        },
        "Level2"
      ).level2;

      expect(noDescend.update).type.toBeCallableWith(tableItem, {
        nested,
      });
      expect(noDescend.update).type.not.toBeCallableWith(tableItem, {
        "nested.sub": 1,
      });
      expect(level1.update).type.toBeCallableWith(tableItem, {
        "nested.sub": nested.sub,
      });
      expect(level1.update).type.toBeCallableWith(tableItem, {
        "nested.deep": nested.deep,
      });
      expect(level1.update).type.not.toBeCallableWith(tableItem, {
        "nested.deep.level2": nested.deep.level2,
      });
      expect(level2.update).type.toBeCallableWith(tableItem, {
        "nested.deep.level2": nested.deep.level2,
      });
      expect(level2.update).type.not.toBeCallableWith(tableItem, {
        "nested.deep.level2.level3": nested.deep.level2.level3,
      });

      const allDepths = dexieFactory(
        {
          allDepths: tableBuilder<TableItem, "All">().primaryKey("id").build(),
        },
        "AllDepths"
      ).allDepths;

      expect(allDepths.update).type.toBeCallableWith(tableItem, {
        "nested.deep.level2.level3": nested.deep.level2.level3,
      });
    });

    it("should update with typed prop modifications", () => {
      expect(db.table.update).type.toBeCallableWith(tableItem, {
        nested: new ObjectPropModification<{
          sub: number;
          deep: {
            level2: {
              level3: string;
            };
          };
        }>((value) => value),
      });

      expect(db.table.update).type.not.toBeCallableWith(tableItem, {
        nested: new ObjectPropModification<{ sub: string }>((value) => ({
          sub: value.sub + 1,
        })),
      });

      expect(db.table.update).type.not.toBeCallableWith(tableItem, {
        "nested.sub": dexieAddPropModHelper([5]),
      });

      expect(db.table.update).type.toBeCallableWith(tableItem, {
        "nested.sub": add(1),
      });

      expect(db.table.update).type.not.toBeCallableWith(tableItem, {
        "nested.sub": add([1]),
      });
    });

    it("should bulkUpdate with objects containing primary key and partial database type expressed with key paths", () => {
      expect(db.table.bulkUpdate).type.toBeCallableWith([
        {
          key: "id1",
          changes: { "nested.sub": 5 },
        },
        {
          key: "id2",
          changes: { other: 10 },
        },
      ]);
      expect(db.table.bulkUpdate).type.not.toBeCallableWith([
        {
          key: 1,
          changes: { "nested.sub": 5 },
        },
      ]);
      expect(db.table.bulkUpdate).type.not.toBeCallableWith([
        {
          key: "id1",
          changes: { "nested.sub": 5 },
        },
        {
          key: "id2",
          changes: { other: "incorrect type" },
        },
      ]);
      expect(db.table.bulkUpdate).type.not.toBeCallableWith([
        {
          key: "id1",
          changes: { "nested.sub": 5 },
        },
        {
          key: "id2",
          changes: { doesNotExist: "" },
        },
      ]);
    });

    it("should not bulkUpdate if primary key path is provided", () => {
      interface TableItem {
        primaryKeyParent: {
          pkey: number;
        };
        other: number;
      }
      const db = dexieFactory(
        {
          table: tableBuilder<TableItem, "I", "II">()
            .primaryKey("primaryKeyParent.pkey")
            .build(),
        },
        "DemoDexie"
      );
      expect(db.table.bulkUpdate).type.not.toBeCallableWith([
        { key: 1, changes: { "primaryKeyParent.pkey": 2 } },
      ]);
      // https://github.com/dexie/Dexie.js/issues/2218
      expect(db.table.bulkUpdate).type.toBeCallableWith([
        { key: 1, changes: { primaryKeyParent: { pkey: 1 } } },
      ]);
    });

    describe("upsert", () => {
      interface UpsertItem {
        id: string;
        notOptional: number;
        optional?: number;
      }
      interface CompoundUpsertItem {
        part1: string;
        part2: number;
        notOptional: number;
        optional?: number;
      }
      const db = dexieFactory(
        {
          table: tableBuilder<UpsertItem>().primaryKey("id").build(),
          compoundTable: tableBuilder<CompoundUpsertItem>()
            .compoundKey("part1", "part2")
            .build(),
        },
        "DemoDexie"
      );

      it("should upsert with correct primary key type and all required properties deeply", () => {
        expect(db.table.upsert).type.toBeCallableWith("idValue", {
          notOptional: 42,
        });

        expect(db.table.upsert).type.not.toBeCallableWith(1, {
          notOptional: 42,
        });

        expect(db.table.upsert).type.not.toBeCallableWith("idValue", {
          optional: 42,
        });

        expect(db.table.upsert).type.toBeCallableWith("idValue", {
          notOptional: 42,
          optional: 42,
        });
      });

      it("should not allow upserting a change to primary key", () => {
        expect(db.table.upsert).type.not.toBeCallableWith("idValue", {
          id: "newIdValue",
          notOptional: 42,
          optional: 42,
        });
      });

      it("should allow prop modification values of the correct type", () => {
        expect(db.table.upsert).type.toBeCallableWith("idValue", {
          notOptional: add(5),
        });
        expect(db.table.upsert).type.not.toBeCallableWith("idValue", {
          notOptional: add(["array incorrect type"]),
        });
      });

      it("should work with compound primary keys", () => {
        expect(db.compoundTable.upsert).type.toBeCallableWith(
          ["part1Value", 2],
          {
            notOptional: add(5),
          }
        );
      });
    });
  });

  it("should have db property typed to the db type", () => {
    expect(db.table.db).type.toBe<typeof db>();
  });
});

describe("Inbound auto", () => {
  interface TableItem {
    id: number;
    numberValue: number;
  }
  const db = dexieFactory(
    {
      table: tableBuilder<TableItem>().autoIncrement("id").build(),
    },
    ""
  );
  it("should add without the primary key TInsert, no keys ", () => {
    expect(db.table.add).type.toBeCallableWith({ numberValue: 42 });
    expect(db.table.add).type.not.toBeCallableWith({ numberValue: 42 }, [1]);
  });

  it("should add with the primary key argument TInsert, no keys", () => {
    expect(db.table.add).type.toBeCallableWith({ id: 2, numberValue: 42 });
  });

  it("should put with the primary key not optional, TDatabase, no keys", () => {
    expect(db.table.put).type.toBeCallableWith({ id: 2, numberValue: 42 });
    expect(db.table.put).type.not.toBeCallableWith({ id: 2, numberValue: 42 }, [
      2,
    ]);
    expect(db.table.put).type.not.toBeCallableWith({ numberValue: 42 });
  });

  describe("addObject addon method", () => {
    it("should return object with primary key added", async () => {
      const withPk = await db.table.addObject({ numberValue: 42 });
      expect(withPk).type.toBeAssignableTo<{
        id: number;
        numberValue: number;
      }>();
      class InsertType {
        id?: number;
        numberValue!: number;
        method() {}
      }
      const classWithPk = await db.table.addObject(new InsertType());
      classWithPk.method();

      expect(db.table.addObject).type.not.toBeCallableWith({
        numberValue: 42,
        additional: 1,
      });
    });
  });

  it("should have db property typed to the db type", () => {
    expect(db.table.db).type.toBe<typeof db>();
  });
});

describe("Outbound - non auto", () => {
  interface TableItem {
    value: number;
  }
  const db = dexieFactory(
    {
      stringPKeyTable: tableBuilder<TableItem>()
        .hiddenExplicit<string>()
        .build(),
      numberPKeyTable: tableBuilder<TableItem>()
        .hiddenExplicit<number>()
        .build(),
      unionPKeyTable: tableBuilder<TableItem>()
        .hiddenExplicit<number | string>()
        .build(),
    },
    ""
  );

  it("should have primary key for TableBase operations typed to the TPKey", () => {
    expect(db.stringPKeyTable.get).type.toBeCallableWith("stringKey");
    expect(db.stringPKeyTable.get).type.not.toBeCallableWith(123);
    expect(db.numberPKeyTable.get).type.toBeCallableWith(123);
    expect(db.numberPKeyTable.get).type.not.toBeCallableWith("stringKey");
    expect(db.unionPKeyTable.get).type.toBeCallableWith("stringKey");
    expect(db.unionPKeyTable.get).type.toBeCallableWith(123);
    expect(db.unionPKeyTable.get).type.not.toBeCallableWith(new Date());

    expect(db.stringPKeyTable.bulkGet).type.toBeCallableWith(["stringKey"]);
    expect(db.stringPKeyTable.bulkGet).type.not.toBeCallableWith([123]);
    expect(db.unionPKeyTable.bulkGet).type.toBeCallableWith(["stringKey", 123]);

    expect(db.stringPKeyTable.delete).type.toBeCallableWith("stringKey");
    expect(db.stringPKeyTable.delete).type.not.toBeCallableWith(123);
    expect(db.numberPKeyTable.delete).type.toBeCallableWith(123);
    expect(db.numberPKeyTable.delete).type.not.toBeCallableWith("stringKey");
    expect(db.unionPKeyTable.delete).type.toBeCallableWith("stringKey");
    expect(db.unionPKeyTable.delete).type.toBeCallableWith(123);
    expect(db.unionPKeyTable.delete).type.not.toBeCallableWith(new Date());

    expect(db.stringPKeyTable.bulkDelete).type.toBeCallableWith(["stringKey"]);
    expect(db.stringPKeyTable.bulkDelete).type.not.toBeCallableWith([123]);
  });

  it("should require primary key for add, put", () => {
    const addItem: TableItem = { value: 42 };
    expect(db.stringPKeyTable.add).type.toBeCallableWith(addItem, "stringKey");
    expect(db.stringPKeyTable.add).type.not.toBeCallableWith(addItem, 42);
    expect(db.stringPKeyTable.add).type.not.toBeCallableWith(addItem);

    expect(db.numberPKeyTable.add).type.toBeCallableWith(addItem, 42);
    expect(db.numberPKeyTable.add).type.not.toBeCallableWith(
      addItem,
      "stringKey"
    );
    expect(db.numberPKeyTable.add).type.not.toBeCallableWith(addItem);

    expect(db.stringPKeyTable.put).type.toBeCallableWith(addItem, "stringKey");
    expect(db.stringPKeyTable.put).type.not.toBeCallableWith(addItem, 42);
    expect(db.stringPKeyTable.put).type.not.toBeCallableWith(addItem);

    expect(db.numberPKeyTable.put).type.toBeCallableWith(addItem, 42);
    expect(db.numberPKeyTable.put).type.not.toBeCallableWith(
      addItem,
      "stringKey"
    );
    expect(db.numberPKeyTable.put).type.not.toBeCallableWith(addItem);
  });

  it("should require primary keys for bulkAdd, bulkPut", () => {
    expect(db.stringPKeyTable.bulkAdd).type.toBeCallableWith(
      [{ value: 42 }, { value: 43 }],
      ["key1", "key2"]
    );
    expect(db.stringPKeyTable.bulkAdd).type.not.toBeCallableWith(
      [{ value: 42, additional: 1 }],
      ["key1", "key2"]
    );
    expect(db.stringPKeyTable.bulkAdd).type.not.toBeCallableWith(
      [{ value: 42 }, { value: 43 }],
      [1, 2]
    );
    expect(db.stringPKeyTable.bulkAdd).type.not.toBeCallableWith([
      { value: 42 },
      { value: 43 },
    ]);

    expect(db.stringPKeyTable.bulkPut).type.toBeCallableWith(
      [{ value: 42 }, { value: 43 }],
      ["key1", "key2"]
    );
    expect(db.stringPKeyTable.bulkPut).type.not.toBeCallableWith(
      [{ value: 42, additional: 1 }],
      ["key1", "key2"]
    );
    expect(db.stringPKeyTable.bulkPut).type.not.toBeCallableWith(
      [{ value: 42 }, { value: 43 }],
      [1, 2]
    );
    expect(db.stringPKeyTable.bulkPut).type.not.toBeCallableWith([
      { value: 42 },
      { value: 43 },
    ]);
  });

  it("should have db property typed to the db type", () => {
    expect(db.numberPKeyTable.db).type.toBe<typeof db>();
    expect(db.unionPKeyTable.db).type.toBe<typeof db>();
  });
});

describe("Outbound auto", () => {
  interface TableItem {
    value: number;
  }

  const db = dexieFactory(
    {
      numberPKeyTable: tableBuilder<TableItem>().hiddenAuto().build(),
      unionPKeyTable: tableBuilder<TableItem>()
        .hiddenAuto<number | string>()
        .build(),
    },
    ""
  );

  const addItem: TableItem = { value: 42 };

  it("should have primary key for TableBase operations typed to the TPKey", () => {
    expect(db.numberPKeyTable.get).type.toBeCallableWith(123);
    expect(db.numberPKeyTable.get).type.not.toBeCallableWith("stringKey");
    expect(db.unionPKeyTable.get).type.toBeCallableWith("stringKey");
    expect(db.unionPKeyTable.get).type.toBeCallableWith(123);
    expect(db.unionPKeyTable.get).type.not.toBeCallableWith(new Date());

    expect(db.numberPKeyTable.bulkGet).type.toBeCallableWith([123]);
    expect(db.numberPKeyTable.bulkGet).type.not.toBeCallableWith(["stringKey"]);

    expect(db.numberPKeyTable.delete).type.toBeCallableWith(123);
    expect(db.numberPKeyTable.delete).type.not.toBeCallableWith("stringKey");
    expect(db.unionPKeyTable.delete).type.toBeCallableWith("stringKey");
    expect(db.unionPKeyTable.delete).type.toBeCallableWith(123);
    expect(db.unionPKeyTable.delete).type.not.toBeCallableWith(new Date());

    expect(db.numberPKeyTable.bulkDelete).type.toBeCallableWith([123]);
    expect(db.numberPKeyTable.bulkDelete).type.not.toBeCallableWith([
      "stringKey",
    ]);
  });

  it("should have optional primary key for add", () => {
    expect(db.numberPKeyTable.add).type.toBeCallableWith(addItem);
    expect(db.numberPKeyTable.add).type.toBeCallableWith(addItem, 42);
    expect(db.numberPKeyTable.add).type.not.toBeCallableWith(
      addItem,
      "stringKey"
    );

    expect(db.unionPKeyTable.add).type.toBeCallableWith(addItem, 42);
    expect(db.unionPKeyTable.add).type.toBeCallableWith(addItem, "stringKey");
  });

  it("should require primary key for put", () => {
    expect(db.numberPKeyTable.put).type.toBeCallableWith(addItem, 42);
    expect(db.numberPKeyTable.put).type.not.toBeCallableWith(
      addItem,
      "stringKey"
    );
    expect(db.numberPKeyTable.put).type.not.toBeCallableWith(addItem);

    expect(db.unionPKeyTable.put).type.toBeCallableWith(addItem, 42);
    expect(db.unionPKeyTable.put).type.toBeCallableWith(addItem, "stringKey");
  });

  it("should have optional primary keys for bulkAdd, with optional options ", () => {
    expect(db.numberPKeyTable.bulkAdd([addItem])).type.toBe<
      PromiseExtended<number>
    >();
    expect(db.numberPKeyTable.bulkAdd([addItem], { allKeys: true })).type.toBe<
      PromiseExtended<number[]>
    >();

    expect(db.numberPKeyTable.bulkAdd([addItem], [42])).type.toBe<
      PromiseExtended<number>
    >();
    expect(
      db.numberPKeyTable.bulkAdd([addItem], [undefined], { allKeys: true })
    ).type.toBe<PromiseExtended<number[]>>();
  });

  it("should require primary keys for bulkPut unless options provided", () => {
    expect(db.numberPKeyTable.bulkPut([addItem], [42])).type.toBe<
      PromiseExtended<number>
    >();
    expect(db.numberPKeyTable.bulkPut).type.not.toBeCallableWith([addItem]);
    expect(db.numberPKeyTable.bulkPut).type.not.toBeCallableWith(
      [addItem, addItem],
      [1, undefined]
    );
    expect(
      db.numberPKeyTable.bulkPut([addItem], [undefined], { allKeys: true })
    ).type.toBe<PromiseExtended<number[]>>();
    expect(
      db.numberPKeyTable.bulkPut([addItem], [undefined], { allKeys: false })
    ).type.toBe<PromiseExtended<number>>();
  });

  it("should have db property typed to the db type", () => {
    expect(db.numberPKeyTable.db).type.toBe<typeof db>();
    expect(db.unionPKeyTable.db).type.toBe<typeof db>();
  });
});

describe("upgrade", () => {
  it("should return the new typed dexie", () => {
    interface TableRemain {
      id: string;
      stringIndex: string;
    }
    interface TableRemoved {
      id: number;
      other: string;
    }
    interface TableUpdate1 {
      id: string;
      v1: string;
    }
    const db = dexieFactory(
      {
        tableRemain: tableBuilder<TableRemain>()
          .primaryKey("id")
          .index("stringIndex")
          .build(),
        tableRemoved: tableBuilder<TableRemoved>()
          .primaryKey("id")
          .index("other")
          .build(),
        tableUpdate: tableBuilder<TableUpdate1>()
          .primaryKey("id")
          .index("v1")
          .build(),
      },
      ""
    );
    interface TableUpdate2 {
      id: string;
      v2: string;
    }
    const db2 = upgrade(
      db,
      {
        tableRemoved: null,
        tableUpdate: tableBuilder<TableUpdate2>()
          .primaryKey("id")
          .index("v2")
          .build(),
      },
      2,
      (tx) => {
        expect(tx).type.toHaveProperty("tableRemain");
        expect(tx).type.toHaveProperty("tableRemoved");
        tx.tableUpdate.toCollection().modify((item, ctx) => {
          ctx.value = {
            id: item.id,
            v2: item.v1,
          };
        });
      }
    );
    expect(db2).type.not.toHaveProperty("tableRemoved");
    expect(db2).type.toHaveProperty("tableRemain");
    expect(db2.tableUpdate.toArray()).type.toBe<
      PromiseExtended<TableUpdate2[]>
    >();
  });
});
