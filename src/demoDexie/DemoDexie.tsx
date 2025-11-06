import Button from "@mui/material/Button";
import { dexieFactoryWithBuilder } from "./dexieFactory";
import { tableBuilder } from "./tableBuilder";

interface DexieDataItem {
  id: number;
  numberValue: number;
  stringValue: string;
}

const db = dexieFactoryWithBuilder(1, {
  data: tableBuilder<DexieDataItem>()
    .primaryKey("id")
    .index("stringValue")
    .index("numberValue")
    .build(),
});

db.on("populate", () => {
  db.data.add({ id: 1, numberValue: 42, stringValue: "Hello" });
  db.data.add({ id: 2, numberValue: 7, stringValue: "World" });
  db.data.add({ id: 3, numberValue: 13, stringValue: "Dexie" });
});

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
