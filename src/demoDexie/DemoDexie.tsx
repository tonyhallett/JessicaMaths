import Button from "@mui/material/Button";
import { dexieFactory } from "./dexieFactory";
import { tableBuilder } from "./tableBuilder";

interface DexieDataItem {
  value: number;
}

const db = dexieFactory(
  1,
  {
    hiddenAuto: tableBuilder<DexieDataItem>().hiddenAuto().build(),
    hiddenExplicit: tableBuilder<DexieDataItem>().hiddenExplicit().build(),
  },
  "DemoDexieOutbound"
);

db.hiddenAuto.hook(
  "updating",
  function (modifications, primKey, obj, transaction) {
    this.onsuccess = function (updateObject) {
      //
    };
    this.onerror = function (e) {};
  }
);
db.hiddenAuto.hook("deleting", function (primKey, obj, transaction) {
  this.onsuccess = function () {
    var args = arguments;
  };
  this.onerror = function (e) {};
});
db.hiddenAuto.hook("creating", function (primKey, obj, transaction) {
  this.onsuccess = function (key) {
    //
  };
  this.onerror = function (e) {};
});
db.hiddenAuto.hook("reading", function (value) {
  return value;
});

export const DemoDexie = () => {
  return (
    <Button
      onClick={async () => {
        await db.hiddenAuto.clear();
        await db.hiddenExplicit.clear();
        const addAutoItem: DexieDataItem = { value: 1 };
        const addAutoItem2: DexieDataItem = { value: 2 };
        const hiddenAutoKey = await db.hiddenAuto.add(addAutoItem);
        const hiddenAutoKey2 = await db.hiddenAuto.add(addAutoItem2, 100);
        const addExplicitItem: DexieDataItem = { value: 1 };
        const hiddenExplicitKey = await db.hiddenExplicit.add(
          addExplicitItem,
          1
        );
      }}
    >
      Demo Dexie
    </Button>
  );
};
