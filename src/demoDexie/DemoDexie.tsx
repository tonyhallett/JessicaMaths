import Button from "@mui/material/Button";
import { tableBuilder } from "./tableBuilder";
import { dexieFactory } from "./dexieFactory";

interface DexieDataItem {
  id: number;
  numberValue: number;
  stringValue: string;
  multiEntry: string[];
  arrayKey: string[];
  nested: {
    level1: {
      numberValue: number;
      stringValue: string;
    };
  };
}

const nested: DexieDataItem["nested"] = {
  level1: {
    numberValue: 100,
    stringValue: "Nested Level 1",
  },
};

const dbCompound = dexieFactory(
  1,
  {
    data: tableBuilder<DexieDataItem>()
      .primaryKey("id")
      .compound("stringValue", "numberValue")
      .multi("multiEntry")
      .index("arrayKey")
      .build(),
  },
  "DemoDexieCompound"
);
dbCompound.on("populate", (tx) => {
  tx.data.add({
    id: 1,
    numberValue: 42,
    stringValue: "Hello",
    multiEntry: ["a", "b"],
    arrayKey: ["1", "2"],
    nested,
  });
  tx.data.add({
    id: 2,
    numberValue: 43,
    stringValue: "Hi",
    multiEntry: ["c", "d"],
    arrayKey: ["1", "2", "3"],
    nested,
  });
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

        await db.data.orderBy("stringValue").each((item, cursor) => {
          console.log("Ordered item:", item);
        });

        await db.data.orderBy("numberValue").each((item, cursor) => {
          console.log("Ordered item:", item);
        });

        await db.data.reverse().each((item) => {
          console.log("Reversed item:", item);
        });

        // where
        // db.data.where("XXX"); error
        await db.data
          .where("numberValue")
          .above(10)
          .each((item) => {
            console.log("above 10 item:", item);
          });

        await db.data
          .where("numberValue")
          .above(10)
          .eachPrimaryKey((key, cursor) => {
            key.toFixed(2);
            cursor.key.toFixed(2);
            cursor.primaryKey.toFixed(2);
          });

        await db.data
          .where("stringValue")
          .above("H")
          .eachPrimaryKey((key, cursor) => {
            key.toFixed(2);
            cursor.key.includes("H");
            cursor.primaryKey.toFixed(2);
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
          .noneOf(7, 42)
          .each((item) => {
            console.log("None of item:", item);
          });

        /* await db.data
          .where("numberValue")
          .noneOf("7", 42)  error */

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
          .anyOfIgnoreCase(["hello", "dexie"])
          .each((item) => {
            console.log("any of ignore case item:", item);
          });

        // db.data.where("numberValue").anyOfIgnoreCase(["hello"]); // error

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
            console.log("starts with any of ignore case item:", item);
          });

        await db.data
          .where("stringValue")
          .startsWithAnyOfIgnoreCase("W", "d")
          .each((item) => {
            console.log("starts with any of ignore case item:", item);
          });

        await db.data
          .where("stringValue")
          .startsWithAnyOf("W", "d")
          .each((item) => {
            console.log("starts with any of item:", item);
          });

        //db.data.where("numberValue").startsWithAnyOfIgnoreCase("d"); // error";
        //db.data.where("numberValue").startsWithAnyOfIgnoreCase(["d"]); // error
        //db.data.where("numberValue").startsWithAnyOf(["1"]);
        //db.data.where("numberValue").equalsIgnoreCase("42"); // error

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

        // typed sortBy
        const sorted = await db.data
          .toCollection()
          .sortBy("nested.level1.numberValue");
        sorted[0]?.numberValue;

        db.data
          .toCollection()
          .reverse()
          .each((item) => {
            console.log("Reversed collection item:", item.id);
          });

        db.data
          .toCollection()
          .distinct()
          .each((item) => {
            console.log("Distinct collection item:", item.id);
          });

        const limited = await db.data.toCollection().limit(1).toArray();
        limited[0]?.numberValue;

        db.data
          .toCollection()
          .offset(1)
          .each((item) => {
            console.log("Offset collection item:", item.id);
          });

        db.data
          .toCollection()
          .until((item) => item.numberValue === 13)
          .each((item) => {
            console.log("Until collection item:", item.id);
          });

        db.data
          .toCollection()
          .first()
          .then((firstItem) => {
            console.log("First item in data table:", firstItem?.id);
          });

        db.data
          .toCollection()
          .last()
          .then((lastItem) => {
            console.log("Last item in data table:", lastItem?.id);
          });

        db.data
          .toCollection()
          .filter((item) => item.id === 2)
          .each((item) => {
            console.log("Filtered collection item with id 2:", item.id);
          });

        db.data
          .toCollection()
          .and((item) => item.id === 2)
          .each((item) => {
            console.log("Filtered collection item with id 2:", item.id);
          });

        db.data.toCollection().eachKey((key, cursor) => {
          // key typed to primary key type (number)
          cursor.key.toFixed(2);
          cursor.primaryKey.toFixed(2);
          console.log("Collection eachKey key:", key);
        });
        db.data
          .where("stringValue")
          .equals("Hello")
          .eachKey((key, cursor) => {
            // key typed to string
            cursor.key.includes("H");
            cursor.primaryKey.toFixed(2);
            console.log("Collection eachKey key:", key);
          });

        db.data
          .where("stringValue")
          .equals("Hello")
          .each((obj, cursor) => {
            // key typed to string
            cursor.key.includes("H");
            cursor.primaryKey.toFixed(2);
            console.log("Collection each:", obj);
          });

        db.data
          .where("numberValue")
          .equals(42)
          .each((obj, cursor) => {
            cursor.key.toFixed(2);
            cursor.primaryKey.toFixed(2);
          });
        db.data
          .where("numberValue")
          .equals(42)
          .eachKey((key, cursor) => {
            // key typed to number
            cursor.key.toFixed(2);
            cursor.primaryKey.toFixed(2);
            console.log("Collection eachKey key:", key);
          });

        db.data
          .where("numberValue")
          .equals(42)
          .eachUniqueKey((key, cursor) => {
            // key typed to number
            cursor.key.toFixed(2);
            cursor.primaryKey.toFixed(2);
            console.log("Collection eachUniqueKey key:", key);
          });

        const pKeys = await db.data.toCollection().keys();
        pKeys[0]?.toFixed(2);
        const uniquePKeys = await db.data.toCollection().keys();
        uniquePKeys[0]?.toFixed(2);

        const numberKeys = await db.data.where("numberValue").equals(42).keys();
        numberKeys[0]?.toFixed(2);

        const stringKeys = await db.data
          .where("stringValue")
          .equals("Hello")
          .keys();
        stringKeys[0]?.includes("H");

        const uniqueStringKeys = await db.data
          .where("stringValue")
          .equals("Hello")
          .uniqueKeys();
        uniqueStringKeys[0]?.includes("H");

        const startsWithDCollectionBegin = db.data
          .where("stringValue")
          .startsWith("D");

        // db.data.where("numberValue").startsWith("D"); // error

        const startsWithDCollection = startsWithDCollectionBegin.clone();
        const orCollection = startsWithDCollectionBegin
          .or("stringValue")
          .startsWith("H");

        startsWithDCollectionBegin
          .or("numberValue")
          //.startsWith("D"); error
          //.equals("1") error
          .above(1);

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

        // compound - .compound(["stringValue", "numberValue"])

        /*  const whereClause = dbCompound.data.where([
          "numberValue",
          "stringValue",
        ]); error */
        // correct
        const whereClause = dbCompound.data.where([
          "stringValue",
          "numberValue",
        ]);

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
          console.log("Ordered by array key", key);
        });

        // incorrect typing for multientry
        dbCompound.data.orderBy("multiEntry").eachKey((key) => {
          console.log("Ordered by multiEntry key", key);
        });

        //whereClause.equals(["Hello", 42]);
        //whereClause.equals([42, "Hello"]); // error
      }}
    >
      Demo Dexie
    </Button>
  );
};
