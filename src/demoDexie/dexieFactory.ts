import { Dexie } from "dexie";
import type { TableConfig } from "./tableBuilder";
import type { DBTables } from "./tabletypes";
import { buildStores } from "./buildStores";

export function dexieFactoryWithBuilder<
  S extends Record<string, TableConfig<any, any, any, any>>
>(version: number, tableConfigs: S) {
  const db = new Dexie("MyDatabase") as Dexie & DBTables<S>;

  db.version(version).stores(buildStores(tableConfigs));

  return db;
}
