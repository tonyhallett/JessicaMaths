import { Dexie } from "dexie";
import { configureStores } from "./configureStores";
import type { TableConfig } from "./tableBuilder";
import { AddAutoReturnObjectAddon } from "./AddAutoReturnObjectAddOn";
import { TableBulkTupleAddOn } from "./TableBulkTupleAddOn";
import { WhereEqualityAddOn } from "./WhereEqualityAddOn";
import type { TypedDexie } from "./TypedDexie";
import { mapToClass } from "./mapToClass";

Dexie.addons.push(TableBulkTupleAddOn);
Dexie.addons.push(AddAutoReturnObjectAddon);
Dexie.addons.push(WhereEqualityAddOn);

export function dexieFactory<
  S extends Record<string, TableConfig<any, any, any, any, any, any, any, any>>
>(tableConfigs: S, databaseName: string, version = 1) {
  const db = new Dexie(databaseName) as unknown as TypedDexie<S>;
  configureStores(db, version, tableConfigs);
  mapToClass(db, tableConfigs);
  return db;
}
