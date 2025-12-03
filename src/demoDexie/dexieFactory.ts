import { Dexie } from "dexie";
import { buildStores } from "./buildStores";
import type { TableConfig } from "./tableBuilder";
import { AddAutoReturnObjectAddon } from "./AddAutoReturnObjectAddOn";
import { TableBulkTupleAddOn } from "./TableBulkTupleAddOn";
import { WhereOrEqualityAddOn } from "./WhereOrEqualityAddOn";
import type { TypedDexie } from "./TypedDexie";

Dexie.addons.push(TableBulkTupleAddOn);
Dexie.addons.push(AddAutoReturnObjectAddon);
Dexie.addons.push(WhereOrEqualityAddOn);

export function dexieFactory<
  S extends Record<string, TableConfig<any, any, any, any, any, any, any>>
>(version: number, tableConfigs: S, databaseName: string) {
  const db = new Dexie(databaseName) as unknown as TypedDexie<S>;

  db.version(version).stores(buildStores(tableConfigs));
  for (const [name, cfg] of Object.entries(tableConfigs)) {
    if (cfg.mapToClass) {
      db.table(name).mapToClass(cfg.mapToClass);
    }
  }
  return db;
}
