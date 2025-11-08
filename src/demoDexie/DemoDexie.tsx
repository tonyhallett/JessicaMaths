import Button from "@mui/material/Button";
import { dexieFactory } from "./dexieFactory";
import { tableBuilder } from "./tableBuilder";

interface DexieDataItem {
  id: number;
  numberValue: number;
  stringValue: string;
  multiEntry: string[];
  arrayKey: string[];
}

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
  });
  tx.data.add({
    id: 1,
    numberValue: 42,
    stringValue: "Four",
    multiEntry: [],
    arrayKey: [],
  });
  /* tx.data.add({ id: 1, numberValue: 42, stringValue: "Same" }).catch((err) => {
    console.error("Failed to add item to db2:", err);
  }); */
});

db2.data.get(1).then((item) => {
  console.log("db2 item with key 1:", item);
});
db2.data.get(2).then((item) => {
  console.log("db2 item with key 2:", item);
});
db2.data.get(4).then((item) => {
  console.log("db2 item with key 4:", item);
});
// get is typed to the primary key type
//db2.data.get("string"); // error

// should not be able to autoincrement type specific property
/* const db3 = dexieFactoryWithBuilder(
  1,
  {
    data: tableBuilder<DexieDataItem>()
      .autoIncrement("stringValue.length")
      .build(),
  },
  "DemoDexie3"
); */

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
  });
  tx.data.add({
    id: 2,
    numberValue: 7,
    stringValue: "World",
    multiEntry: [],
    arrayKey: [],
  });
  tx.data.add({
    id: 3,
    numberValue: 13,
    stringValue: "Dexie",
    multiEntry: [],
    arrayKey: [],
  });
});

// typed transaction
db.transaction("rw", db.data, db.other, (tx) => {
  const dataTable = tx.data;
  const otherTable = tx.other;
  //const notInTxTable = tx.notInTx; error
});

// typed transaction
db.transaction("rw", db.data, "other", (tx) => {
  const dataTable = tx.data;
  const otherTable = tx.other;
  //const notInTxTable = tx.notInTx; error
});

// typed transaction
db.transaction("rw", [db.data, "other"], (tx) => {
  const dataTable = tx.data;
  const otherTable = tx.other;
  //const notInTxTable = tx.notInTx; error
});

// todo - support db.transaction("rw", [db.data, "other"],"else", (tx) => {

export const DemoDexie = () => {
  return (
    <Button
      onClick={async () => {
        const allData = await db.data.toArray();
        await db.data.each((item, cursor) => {
          console.log(
            `Item with key ${cursor.key}, primaryKey ${cursor.primaryKey}:`,
            item
          );
        });
        const filtered = await db.data
          .filter((item) => item.numberValue > 10)
          .toArray();
        filtered.forEach((item) => {
          console.log("Filtered item:", item);
        });
        await db.data.limit(2).each((item) => {
          console.log("Limited item:", item);
        });
        db.data.offset(1).each((item) => {
          console.log("Offset item:", item);
        });
        await db.data.orderBy("stringValue").each((item) => {
          console.log("Ordered item:", item);
        });
        await db.data.reverse().each((item) => {
          console.log("Reversed item:", item);
        });
        await db.data
          .where("numberValue")
          .above(10)
          .each((item) => {
            console.log("above 10 item:", item);
          });

        await db.data
          .where("stringValue")
          .above("Emu")
          .each((item) => {
            console.log("above Emu item:", item);
          });

        await db.data
          .where("stringValue")
          .above("emu")
          .each((item) => {
            console.log("above emu item:", item);
          });

        await db.data
          .where("numberValue")
          .notEqual(7)
          .each((item) => {
            console.log("Not equal item:", item);
          });

        await db.data
          .where("numberValue")
          .noneOf([7, 42])
          .each((item) => {
            console.log("None of item:", item);
          });

        await db.data
          .where("numberValue")
          .anyOf([7, 42])
          .each((item) => {
            console.log("any of item:", item);
          });

        await db.data
          .where("stringValue")
          .anyOfIgnoreCase("hello", "dexie")
          .each((item) => {
            console.log("any of ignore case item:", item);
          });

        await db.data
          .where("stringValue")
          .equals("World")
          .each((item) => {
            console.log("equals item:", item);
          });

        //db.data.where("stringValue").equals(10);

        await db.data
          .where("stringValue")
          .startsWithAnyOfIgnoreCase(["W", "d"])
          .each((item) => {
            console.log("starts with ignore case item:", item);
          });

        await db.data
          .where("numberValue")
          .between(10, 50)
          .each((item) => {
            console.log("between item:", item);
          });

        await db.data
          .where("numberValue")
          .inAnyRange([
            [8, 15],
            [40, 50],
          ])
          .each((item) => {
            console.log("in any range item:", item);
          });

        // collection operations

        const tableCount = await db.data.toCollection().count();
        console.log("Total count of items in data table:", tableCount);

        const startsWithDCollectionBegin = db.data
          .where("stringValue")
          .startsWith("D");
        const startsWithDCollection = startsWithDCollectionBegin.clone();
        const orCollection = startsWithDCollectionBegin
          .or("stringValue")
          .startsWith("H");
        const startsWithDCount = await startsWithDCollection.count();
        console.log(
          "Count of items with stringValue starting with 'D':",
          startsWithDCount
        );
        const orCount = await orCollection.count();
        console.log(
          "Count of items with stringValue starting with 'D' or 'H':",
          orCount
        );
      }}
    >
      Demo Dexie
    </Button>
  );
};
