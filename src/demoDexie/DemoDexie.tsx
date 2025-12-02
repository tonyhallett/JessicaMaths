import Button from "@mui/material/Button";
import { dexieFactory } from "./dexieFactory";
import { tableBuilder } from "./tableBuilder";

interface DexieDataItem {
  pkNumber: number;
  pkString: string;
  indexString: string;
  indexNumber: number;
  indexDate: Date;
  index: number;
  notAnIndex: number;
}

const db = dexieFactory(
  1,
  {
    demo: tableBuilder<DexieDataItem>()
      .compoundKey("pkNumber", "pkString")
      .compound("indexNumber", "indexString", "indexDate")
      .index("index")
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
          {
            pkNumber: 1,
            pkString: "1",
            indexNumber: 1,
            indexString: "1",
            indexDate: new Date(),
            index: 1,
            notAnIndex: 10,
          },
          {
            pkNumber: 2,
            pkString: "2",
            indexNumber: 2,
            indexString: "2",
            indexDate: new Date(),
            index: 2,
            notAnIndex: 20,
          },
        ]);

        const primaryId = await db.demo.where(":id").equals([1, "1"]).first();
        const idShortcut = await (
          db.demo.where({ ":id": [1, "1"] } as any) as any
        ).first();

        const compoundVirtualSingularPk = await db.demo
          .where({ pkNumber: 1 })
          .keys();
        const compoundVirtualSingular = await db.demo
          .where({ indexNumber: 1 })
          .keys();
        /*         const compoundVirtualSingularBad = await (
          db.demo.where({ indexString: "1" } as any) as any
        ).first(); */
        const compoundVirtualMultiple = await db.demo
          .where({ indexNumber: 1, indexString: "1" })
          .keys();

        /* const noSingle = await (
          db.demo.where({ indexNumber: 1, notAnIndex: 1 } as any) as any
        ).first(); */

        //const keys = await db.demo.where("indexNumber").equals(1).keys();

        /*        
          suprisingly Dexie does not support this way of querying a virtual index, given that it supports the subset with two

          const virtualUsingSingleArray = await db.demo
          .where(["indexNumber"])
          .equals([1])
          .first(); */
        /*  const keys2 = await db.demo
          .where(["indexNumber", "indexString"])
          .equals([1, "1"])
          .keys(); */

        const x = "";
      }}
    >
      Demo Dexie
    </Button>
  );
};
