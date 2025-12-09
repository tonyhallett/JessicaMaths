import { Dexie, type DexieOptions } from "dexie";
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
>(tableConfigs: S, databaseName: string): TypedDexie<S>;

export function dexieFactory<
  S extends Record<string, TableConfig<any, any, any, any, any, any, any, any>>
>(tableConfigs: S, databaseName: string, version: number): TypedDexie<S>;

export function dexieFactory<
  S extends Record<string, TableConfig<any, any, any, any, any, any, any, any>>
>(tableConfigs: S, databaseName: string, options: DexieOptions): TypedDexie<S>;

export function dexieFactory<
  S extends Record<string, TableConfig<any, any, any, any, any, any, any, any>>
>(
  tableConfigs: S,
  databaseName: string,
  version: number,
  options: DexieOptions
): TypedDexie<S>;

export function dexieFactory<
  S extends Record<string, TableConfig<any, any, any, any, any, any, any, any>>
>(
  tableConfigs: S,
  databaseName: string,
  versionOrOptions?: number | DexieOptions,
  maybeOptions?: DexieOptions
) {
  const version = typeof versionOrOptions === "number" ? versionOrOptions : 1;
  const options =
    typeof versionOrOptions === "object" ? versionOrOptions : maybeOptions;
  const db = new Dexie(databaseName, options) as unknown as TypedDexie<S>;
  configureStores(db, version, tableConfigs);
  mapToClass(db, tableConfigs);
  return db;
}
