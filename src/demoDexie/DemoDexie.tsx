import Button from "@mui/material/Button";
import { dexieFactory } from "./dexieFactory";
import { tableBuilder } from "./tablebuilder";

interface DexieDataItem {
  id: number;
}

const db = dexieFactory(
  1,
  {
    data: tableBuilder<DexieDataItem>().primaryKey("id").build(),
  },
  "DemoDexie"
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
  return <Button onClick={async () => {}}>Demo Dexie</Button>;
};
