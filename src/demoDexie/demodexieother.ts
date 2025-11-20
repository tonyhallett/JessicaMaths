import { dexieFactory } from "./dexieFactory";
import Dexie, { add, Entity, type EntityTable } from "dexie";
import {
  tableBuilder,
  tableClassBuilder,
  tableClassBuilderExcluded,
} from "./tablebuilder";
import { ObjectPropModification, safeRemove } from "./ObjectPropModification";
import type { UpdateSpec } from "./tabletypes";

interface DexieDataItem {
  id: number;
  numberValue: number;
  stringValue: string;
  optional?: string;
  optional2?: number;
  multiEntry: string[];
  arrayKey: string[];
  nested: {
    level1: {
      numberValue: number;
      stringValue: string;
      optional1?: string;
    };
  };
}

const nested: DexieDataItem["nested"] = {
  level1: {
    numberValue: 100,
    stringValue: "Nested Level 1",
  },
};

// should not be able to autoincrement type specific property - error
/* const db3 = dexieFactoryWithBuilder(
  1,
  {
    data: tableBuilder<DexieDataItem>()
      .autoIncrement("stringValue.length")
      .build(),
  },
  "DemoDexie3"
);  */

// cannot use my dexie type - Entity<typeof dbCompoundPrimary>
type DexieTs = Dexie & {
  custom: EntityTable<CustomEntity, "id">;
};

class CustomEntity extends Entity<DexieTs> {
  // cannot provide own ctor as have to call super which throws
  // so every field will need !
  id!: number;
  other!: string;
  save() {
    this.db.custom.put(this);
    // given above would you need to use this.table()
    // if you created own helper derivation
    this.db.table(this.table()).put(this);
  }
}

// new CustomEntityType() - cannot call ctor - only from db

type DexieDataItemUpdateSpecLevel2 = UpdateSpec<DexieDataItem, "II">;
const dexieDataItemUpdateSpecLevel2: DexieDataItemUpdateSpecLevel2 = {
  multiEntry: add(["newEntry"]),
  numberValue: add(5),
  // numberValue: add("5"), error
  optional: undefined, // delete optional property
  "nested.level1.numberValue": 8,
  nested: new ObjectPropModification((nested) => ({
    level1: { numberValue: 1, stringValue: "2" },
  })),
  // add is ok but dexie remove is not
  optional2: safeRemove(3),
};

type DexieDataItemUpdateSpecLevel1 = UpdateSpec<DexieDataItem, "I">;
const dexieDataItemUpdateSpecLevel1: DexieDataItemUpdateSpecLevel1 = {
  multiEntry: add(["newEntry"]),
  numberValue: add(5),
  // numberValue: add("5"), error
  optional: undefined, // delete optional property
  "nested.level1": {
    stringValue: "Updated String",
    numberValue: 8,
  },
  //"nested.level1.numberValue":8, error
};

const dbCompoundPrimary = dexieFactory(
  1,
  {
    data: tableBuilder<DexieDataItem>()
      .compoundKey("id", "stringValue")
      .build(),
  },
  "DemoDexieCompoundPrimary"
);

dbCompoundPrimary.data.toCollection().each((item, cursor) => {
  cursor.key[0].toFixed(2);
  cursor.key[1].toLowerCase();
});

dbCompoundPrimary.data.upsert([1, "Hello"], {
  numberValue: 200,
  multiEntry: ["x", "y"],
  arrayKey: ["a", "b"],
  nested: {
    level1: {
      numberValue: 200,
      stringValue: "Updated Nested",
    },
  },
});

const dbCompound = dexieFactory(
  1,
  {
    data: tableBuilder<DexieDataItem>()
      .primaryKey("id")
      .compound("stringValue", "numberValue")
      .index("nested.level1.numberValue")
      .multi("multiEntry")
      .index("arrayKey")
      .build(),
  },
  "DemoDexieCompound"
);
dbCompound.on("populate", async (tx) => {
  tx.data.add({
    id: 1,
    numberValue: 42,
    stringValue: "Hello",
    multiEntry: ["a", "b"],
    arrayKey: ["1", "2"],
    nested,
  });
  const key = await tx.data.add({
    id: 2,
    numberValue: 43,
    stringValue: "Hi",
    multiEntry: ["c", "d"],
    arrayKey: ["1", "2", "3"],
    nested,
  });
  key.toFixed(2);
});

/*  const whereClause = dbCompound.data.where([
          "numberValue",
          "stringValue",
        ]); error */

// todo - return to compound
// correct
/* const whereClause = dbCompound.data.where([
          "stringValue",
          "numberValue",
        ]); */

dbCompound.data
  .orderBy(["stringValue", "numberValue"])
  .eachKey((key) => {
    key[0].toLowerCase();
    key[1].toFixed(2);
    console.log("Ordered by compound key:", key);
  })
  .catch((err) => {
    console.error("Failed to orderBy compound key:", err);
  });

dbCompound.data.orderBy("arrayKey").eachKey((key) => {
  key.entries();
});

dbCompound.data.orderBy("multiEntry").eachKey((key) => {
  key.endsWith("a");
});

dbCompound.data.orderBy("nested.level1.numberValue").eachKey((key) => {
  key.toFixed(2);
});

//whereClause.equals(["Hello", 42]);
//whereClause.equals([42, "Hello"]); // error

// multiEntry where
const multiEntryWhere = dbCompound.data.where("multiEntry");
multiEntryWhere.equals("a").each((item, cursor) => {
  console.log("multiEntry where item:", item);
  cursor.key.endsWith("a");
  cursor.primaryKey.toFixed(2);
});

multiEntryWhere.anyOf(["a", "d"]).each((item, cursor) => {
  console.log("multiEntry anyOf where item:", item);
  cursor.key.endsWith("a");
  cursor.primaryKey.toFixed(2);
});

multiEntryWhere.startsWithIgnoreCase("A").each((item, cursor) => {
  console.log("multiEntry startsWithIgnoreCase where item:", item);
  cursor.key.endsWith("a");
  cursor.primaryKey.toFixed(2);
});

// demo that can have a primary key based on a property of the type
const db2 = dexieFactory(
  1,
  {
    data: tableBuilder<DexieDataItem>()
      .primaryKey("stringValue.length")
      .build(),
  },
  "DemoDexie2"
);
db2.open().catch((err) => {
  console.error("Failed to open db2:", err);
});
db2.on("populate", (tx) => {
  tx.data.add({
    id: 1,
    numberValue: 42,
    stringValue: "L2",
    multiEntry: [],
    arrayKey: [],
    nested,
  });
  tx.data.add({
    id: 1,
    numberValue: 42,
    stringValue: "Four",
    multiEntry: [],
    arrayKey: [],
    nested,
  });
  tx.data
    .add({
      id: 1,
      numberValue: 42,
      stringValue: "Same",
      arrayKey: [],
      multiEntry: [],
      nested,
    })
    .catch((err) => {
      console.error("Failed to add item to db2:", err);
    });
});

// although it is allowed I am using Dexie's KeyPathValue which disallows.
/* db2.data.get(1).then((item) => {
  console.log("db2 item with key 1:", item);
});
db2.data.get(2).then((item) => {
  console.log("db2 item with key 2:", item);
});
db2.data.get(4).then((item) => {
  console.log("db2 item with key 4:", item);
}); */

class EntityClass {
  constructor(id: number) {
    this.id = id;
  }
  id: number;
  str: string = "";
  method() {}
}

const dbEntity = dexieFactory(
  1,
  {
    data: tableClassBuilder(EntityClass).primaryKey("id").build(),
  },
  "DemoDexieEntity"
);
dbEntity.on("populate", (tx) => {
  tx.data.add({ id: 1, str: "Hello" });
  tx.data.add(new EntityClass(2));
  // tx.data.add({ str: "Hello" }); error - id is required
});

dbEntity.data.get(1).then((item) => {
  item?.method();
});

const dbEntityExclude = dexieFactory(
  1,
  {
    excludedEntity: tableClassBuilderExcluded(EntityClass)
      .excludedKeys(["str"])
      .primaryKey("id")
      .build(),
  },
  "DemoDexieEntityExclude"
);
dbEntityExclude.on("populate", (tx) => {
  tx.excludedEntity.add({ id: 1 });
  // tx.data.add({ id: 1, str: "Hello" }); error on excluded str property
  // Typescript allows add via instance - but addon will filter excluded keys
  tx.excludedEntity.add(new EntityClass(2));
});

dbEntityExclude.excludedEntity.get(1).then((item) => {
  item?.method();
});
