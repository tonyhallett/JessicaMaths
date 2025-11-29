import Button from "@mui/material/Button";
import { dexieFactory } from "./dexieFactory";
import { tableBuilder } from "./tableBuilder";

interface DexieDataItem {
  pk: number;
  indexString: string;
  indexNumber: number;
  indexDate: Date;
}

const db = dexieFactory(
  1,
  {
    demo: tableBuilder<DexieDataItem>()
      .primaryKey("pk")
      .compound("indexNumber", "indexString", "indexDate")
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
          { pk: 1, indexNumber: 1, indexString: "1", indexDate: new Date() },
          { pk: 2, indexNumber: 2, indexString: "2", indexDate: new Date() },
        ]);
        const virtualUsingString = await db.demo
          .where("indexNumber")
          .equals(1)
          .first();

        /*        
          suprisingly Dexie does not support this way of querying a virtual index, given that it supports the subset with two

          const virtualUsingSingleArray = await db.demo
          .where(["indexNumber"])
          .equals([1])
          .first(); */
        const virtualUsingArray = await db.demo
          .where(["indexNumber", "indexString"])
          .equals([1, "1"])
          .first();
        const x = "";
      }}
    >
      Demo Dexie
    </Button>
  );
};
