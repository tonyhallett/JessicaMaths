import Button from "@mui/material/Button";
import { dexieFactory } from "./dexieFactory";
import { tableBuilder } from "./tableBuilder";

interface DexieDataItem {
  pk: number;
  indexString: string;
  indexNumber: number;
}

const db = dexieFactory(
  1,
  {
    demo: tableBuilder<DexieDataItem>()
      .primaryKey("pk")
      .index("indexNumber")
      .index("indexString")
      .build(),
  },
  "DemoDexieBulkUpdate"
);

db.demo.hook("updating", function (modifications, primKey, obj, transaction) {
  this.onsuccess = function (updateObject) {
    //
  };
  this.onerror = function (e) {};
});
db.demo.hook("deleting", function (primKey, obj, transaction) {
  this.onsuccess = function () {
    var args = arguments;
  };
  this.onerror = function (e) {};
});
db.demo.hook("creating", function (primKey, obj, transaction) {
  this.onsuccess = function (key) {
    //
  };
  this.onerror = function (e) {};
});
db.demo.hook("reading", function (value) {
  return value;
});

export const DemoDexie = () => {
  return (
    <Button
      onClick={async () => {
        await db.demo.clear();
        await db.demo.bulkAdd([
          { pk: 1, indexNumber: 1, indexString: "1" },
          { pk: 2, indexNumber: 2, indexString: "2" },
        ]);
        const keys = await db.demo
          .where("indexNumber")
          .equals(2)
          .or("indexString")
          .equals("2")
          .keys();
      }}
    >
      Demo Dexie
    </Button>
  );
};
