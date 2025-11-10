import { Dexie } from "dexie";
import { type TableConfig } from "./tableBuilderOld";
import type { DBTables } from "./tabletypesold";
import { buildStores } from "./buildStores";
import type { DexieTypedTransaction } from "./DexieTypedTransactionold";

type TypedDexie<
  TConfig extends Record<string, TableConfig<any, any, any, any>>
> = DBTables<TConfig> & DexieTypedTransaction<TConfig>;

export function dexieFactory<
  S extends Record<string, TableConfig<any, any, any, any>>
>(version: number, tableConfigs: S, databaseName: string) {
  const db = new Dexie(databaseName) as unknown as TypedDexie<S>;

  db.version(version).stores(buildStores(tableConfigs));

  return db;
}
