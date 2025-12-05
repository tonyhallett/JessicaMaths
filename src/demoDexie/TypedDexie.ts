import type { DBTables } from "./DBTables";
import type { DexieTypedTransaction } from "./DexieTypedTransaction";
import type { TableConfig } from "./tableBuilder";

export type TypedDexie<
  TConfig extends Record<
    string,
    TableConfig<any, any, any, any, any, any, any, any>
  >
> = DBTables<TConfig> & DexieTypedTransaction<TConfig>;
