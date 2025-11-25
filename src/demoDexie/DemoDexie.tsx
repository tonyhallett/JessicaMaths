import Button from "@mui/material/Button";
import { dexieFactory } from "./dexieFactory";
import { tableBuilder } from "./tableBuilder";

interface DexieDataItem {
  id: number;
  other: number;
}
class X implements DexieDataItem {
  constructor(public id: number) {}
  other: number = 0;
  method() {}
}

const db = dexieFactory(
  1,
  {
    data: tableBuilder<DexieDataItem>().autoIncrement("id").build(),
  },
  "DemoDexieAuto"
);

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

export const DemoDexie = () => {
  return (
    <Button
      onClick={async () => {
        await db.data.clear();
        // if it does not include number in auto pkey type then must supply...
        // or ensure that it is or is a union that includes number
        // otherwise should use the other format

        // otherwise is optional
        const newItem = { other: 1 };
        await db.data.add(new X(123));
        // allows adding with pkey
        // const newItem2: DexieDataItem = { other: 1, id: 2 };
        //const newItemNotAllowed = { other: 1, id: undefined };
        //db.data.add(newItemNotAllowed);
        await db.data.add(newItem);
        // const withPrimaryKey = await db.data.addObject(newItem);
        // const received = await db.data.get(2);
      }}
    >
      Demo Dexie
    </Button>
  );
};
