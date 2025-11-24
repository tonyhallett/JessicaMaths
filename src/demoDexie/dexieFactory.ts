import { Dexie } from "dexie";
import { buildStores } from "./buildStores";
import type { DexieTypedTransaction } from "./DexieTypedTransaction";
import type { TableConfig } from "./tablebuilder";
import type { DBTables } from "./tabletypes";
import { AddAutoReturnObjectAddon } from "./AddAutoReturnObjectAddOn";

Dexie.addons.push(AddAutoReturnObjectAddon);

type TypedDexie<
  TConfig extends Record<string, TableConfig<any, any, any, any>>
> = DBTables<TConfig> & DexieTypedTransaction<TConfig>;

export function dexieFactory<
  S extends Record<string, TableConfig<any, any, any, any>>
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
