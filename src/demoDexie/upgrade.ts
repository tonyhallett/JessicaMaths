import type { Transaction } from "dexie";
import type { TableConfig } from "./tableBuilder";
import type { StringKeyOf } from "./utilitytypes";
import type { DBTables } from "./DBTables";
import type { TypedDexie } from "./TypedDexie";
import { configureStores } from "./configureStores";
import { mapToClass } from "./mapToClass";

type AnyTableConfig = TableConfig<any, any, any, any, any, any, any>;

type KeepOldNotInNew<
  TOldConfig extends Record<string, AnyTableConfig>,
  TNewConfig extends Record<string, AnyTableConfig | null>
> = {
  [K in keyof TOldConfig as K extends keyof TNewConfig
    ? never
    : K]: TOldConfig[K];
};
type NewThatAreNotNull<
  TNewConfig extends Record<string, AnyTableConfig | null>
> = {
  // 2) Add keys from new config that are NOT null
  [K in keyof TNewConfig as TNewConfig[K] extends null ? never : K]: Exclude<
    TNewConfig[K],
    null
  >;
};

type MergedConfig<
  TOldConfig extends Record<string, AnyTableConfig>,
  TNewConfig extends Record<string, AnyTableConfig | null>
> = KeepOldNotInNew<TOldConfig, TNewConfig> & NewThatAreNotNull<TNewConfig>;

type UpgradedDexie<
  TOldConfig extends Record<string, AnyTableConfig>,
  TNewConfig extends Record<string, AnyTableConfig | null>
> = TypedDexie<MergedConfig<TOldConfig, TNewConfig>>;

type ReplaceInsert<
  T extends AnyTableConfig,
  TNewInsert
> = T extends TableConfig<
  infer TDatabase,
  infer TPKeyPathOrPaths,
  infer TAuto,
  infer TIndexPaths,
  infer TGet,
  any, // old insert ignored
  infer TOutboundPKey,
  infer TMaxDepth
>
  ? TableConfig<
      TDatabase,
      TPKeyPathOrPaths,
      TAuto,
      TIndexPaths,
      TGet,
      TNewInsert,
      TOutboundPKey,
      TMaxDepth
    >
  : never;

type UpgradeConfig<
  TOldConfig extends Record<string, AnyTableConfig>,
  TNewConfig extends Record<string, AnyTableConfig | null>
> = {
  [K in keyof TOldConfig]: K extends keyof TNewConfig
    ? TNewConfig[K] extends TableConfig<
        any,
        any,
        any,
        any,
        any,
        infer TNewInsert,
        any,
        any
      >
      ? ReplaceInsert<TOldConfig[K], TNewInsert>
      : TOldConfig[K] // null → unchanged
    : TOldConfig[K];
};

export type TransactionWithTables<
  TConfig extends Record<
    string,
    TableConfig<any, any, any, any, any, any, any, any>
  >
> = Omit<Transaction, "table"> &
  Pick<DBTables<TConfig>, StringKeyOf<DBTables<TConfig>>>;

type UpgradeTransaction<
  TOldConfig extends Record<string, AnyTableConfig>,
  TNewConfig extends Record<string, AnyTableConfig | null>
> = TransactionWithTables<UpgradeConfig<TOldConfig, TNewConfig>>;

type GetDexieConfig<TTypedDexie extends TypedDexie<any>> =
  TTypedDexie extends TypedDexie<infer TConfig> ? TConfig : never;

type UpgradeFunction<
  TTypedDexie extends TypedDexie<any>,
  TNewConfig extends Record<string, AnyTableConfig | null>
> = (
  trans: UpgradeTransaction<GetDexieConfig<TTypedDexie>, TNewConfig>
) => PromiseLike<any> | void;
export function upgrade<
  TTypedDexie extends TypedDexie<any>,
  TNewConfig extends Record<string, AnyTableConfig | null>
>(
  db: TTypedDexie,
  tableConfigs: TNewConfig
): UpgradedDexie<GetDexieConfig<TTypedDexie>, TNewConfig>;

export function upgrade<
  TTypedDexie extends TypedDexie<any>,
  TNewConfig extends Record<string, AnyTableConfig | null>
>(
  db: TTypedDexie,
  tableConfigs: TNewConfig,
  upgradeFunction: UpgradeFunction<TTypedDexie, TNewConfig>
): UpgradedDexie<GetDexieConfig<TTypedDexie>, TNewConfig>;

export function upgrade<
  TTypedDexie extends TypedDexie<any>,
  TNewConfig extends Record<string, AnyTableConfig | null>
>(
  db: TTypedDexie,
  tableConfigs: TNewConfig,
  version: number
): UpgradedDexie<GetDexieConfig<TTypedDexie>, TNewConfig>;

export function upgrade<
  TTypedDexie extends TypedDexie<any>,
  TNewConfig extends Record<string, AnyTableConfig | null>
>(
  db: TTypedDexie,
  tableConfigs: TNewConfig,
  version: number,
  upgradeFunction: UpgradeFunction<TTypedDexie, TNewConfig>
): UpgradedDexie<GetDexieConfig<TTypedDexie>, TNewConfig>;
export function upgrade<
  TTypedDexie extends TypedDexie<any>,
  TNewConfig extends Record<string, AnyTableConfig | null>
>(
  db: TTypedDexie,
  tableConfigs: TNewConfig,
  versionOrUpgrade?: number | UpgradeFunction<TTypedDexie, TNewConfig>,
  upgradeFunction?: UpgradeFunction<TTypedDexie, TNewConfig>
): UpgradedDexie<GetDexieConfig<TTypedDexie>, TNewConfig> {
  const incrementVersion = () => (db.verno || 0) + 1;
  let version: number;
  let upgradeFn: any;

  if (typeof versionOrUpgrade === "function") {
    version = incrementVersion();
    upgradeFn = versionOrUpgrade;
  } else {
    version = versionOrUpgrade ?? incrementVersion();
    upgradeFn = upgradeFunction;
  }
  configureStores(db, version, tableConfigs, upgradeFn);
  mapToClass(db, tableConfigs);
  return db as UpgradedDexie<GetDexieConfig<TTypedDexie>, TNewConfig>;
}
