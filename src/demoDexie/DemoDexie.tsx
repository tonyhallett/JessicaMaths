import Button from "@mui/material/Button";
import { dexieFactory } from "./dexieFactory";
import { tableBuilder } from "./tableBuilder";

interface DexieDataItem {
  pk: number;
}

const db = dexieFactory(
  1,
  {
    demo: tableBuilder<DexieDataItem>().primaryKey("pk").build(),
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
  return <Button onClick={async () => {}}>Demo Dexie</Button>;
};
