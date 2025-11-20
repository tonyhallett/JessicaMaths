import Button from "@mui/material/Button";
import { dexieFactory } from "./dexieFactory";
import { add } from "dexie";
import { tableBuilder, tableClassBuilder } from "./tablebuilder";

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

const db = dexieFactory(
  1,
  {
    data: tableBuilder<DexieDataItem>()
      .primaryKey("id")
      .index("stringValue")
      .index("numberValue")
      .index("arrayKey")
      .multi("multiEntry") // only arrays allowed
      .build(),
    other: tableBuilder<{ id: number }>().primaryKey("id").build(),
    notInTx: tableBuilder<{ id: number }>().primaryKey("id").build(),
  },
  "DemoDexie"
);

// typed transaction
db.on("populate", (tx) => {
  tx.data.add({
    id: 1,
    numberValue: 42,
    stringValue: "Hello",
    multiEntry: [],
    arrayKey: [],
    nested,
  });
  tx.data.add({
    id: 2,
    numberValue: 7,
    stringValue: "World",
    multiEntry: [],
    arrayKey: [],
    nested,
  });
  tx.data.add({
    id: 3,
    numberValue: 13,
    stringValue: "Dexie",
    multiEntry: [],
    arrayKey: [],
    nested,
  });
});

db.data.hook("updating", function (modifications, primKey, obj, transaction) {
  this.onsuccess = function (updateObject) {
    //
  };
  this.onerror = function (e) {};
});
db.data.hook("deleting", function (primKey, obj, transaction) {
  this.onsuccess = function () {
    var args = arguments;
  };
  this.onerror = function (e) {};
});
db.data.hook("creating", function (primKey, obj, transaction) {
  this.onsuccess = function (key) {
    //
  };
  this.onerror = function (e) {};
});
db.data.hook("reading", function (value) {
  return value;
});

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

/* db.data.upsert(1, {
  arrayKey: ["a", "b", "c"],
  numberValue: 100,
  stringValue: "Upserted",
  //id: 1, - not necessary
  multiEntry: ["x", "y"],
  nested: {
    level1: {
      numberValue: 100,
      stringValue: "Updated via upsert",
    },
  },
}); */

export const DemoDexie = () => {
  return (
    <Button
      onClick={async () => {
        db.data.add({
          id: 4,
          numberValue: 13,
          stringValue: "Dexie",
          multiEntry: [],
          arrayKey: [],
          nested,
        });

        db.data.bulkUpdate([
          {
            key: 4,
            changes: {
              numberValue: add(0),
              //id: omitted
            },
          },
        ]);
        await db.data.delete(4);

        db.data
          .where("numberValue")
          .between(10, 50)
          .each((item) => {
            console.log("between item:", item);
          });

        db.data
          .where("numberValue")
          .inAnyRange([
            [8, 15],
            [40, 50],
          ])
          .each((item) => {
            console.log("in any range item:", item);
          });
      }}
    >
      Demo Dexie
    </Button>
  );
};
