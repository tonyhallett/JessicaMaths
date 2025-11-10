import type {
  DBCoreTable,
  PromiseExtended,
  TableHooks,
  TableSchema,
} from "dexie";
import type { Collection } from "./Collection";
import type { DexieIndexes, DexiePlainKey } from "./dexieindexes";
import type { UpdateKeyPathValue } from "./better-dexie";
import type { WhereClausesFromIndexes } from "./where";
import type { TableConfig } from "./tableBuilder";

export type DBTables<
  TConfig extends Record<string, TableConfig<any, any, any, any>>
> = {
  [K in keyof TConfig & string]: TConfig[K] extends TableConfig<
    infer TRow,
    infer PK,
    infer Auto,
    any
  >
    ? PK extends never
      ? Auto extends true
        ? never
        : never
      : Auto extends true
      ? never
      : KeyPathTable<K, TRow, PK, TConfig[K]["indices"]>
    : never;
};

export interface TableBase<
  TName extends string,
  T,
  TKey extends DexiePlainKey<T>,
  TIndexes extends DexieIndexes<T>
> {
  //db: Dexie;
  name: TName;
  schema: TableSchema;
  hook: TableHooks<T, TKey>;
  core: DBCoreTable;

  filter(fn: (obj: T) => boolean): Collection<T, TKey, TKey, TIndexes>;

  count(): PromiseExtended<number>;

  offset(n: number): Collection<T, TKey, TKey, TIndexes>;
  limit(n: number): Collection<T, TKey, TKey, TIndexes>;

  each(
    callback: (obj: T, cursor: { key: any; primaryKey: TKey }) => any
  ): PromiseExtended<void>;

  toArray(): PromiseExtended<Array<T>>;
  toCollection(): Collection<T, TKey, TKey, TIndexes>;
  //orderBy(index: KeysOf<T>): Collection<T, TKey, TKey, TIndexes>;
  reverse(): Collection<T, TKey, TKey, TIndexes>;
  mapToClass(constructor: Function): Function;

  delete(key: TKey): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
}

type KeyPathTable<
  TName extends string,
  T,
  TKey extends DexiePlainKey<T>,
  TIndexes extends DexieIndexes<T>
> = TableBase<TName, T, TKey, TIndexes> & {
  get(key: UpdateKeyPathValue<T, TKey>): PromiseExtended<T | undefined>;
  bulkGet(
    keys: UpdateKeyPathValue<T, TKey>[]
  ): PromiseExtended<(T | undefined)[]>;
  add(item: T): PromiseExtended<TKey>;
} & WhereClausesFromIndexes<T, TKey, TIndexes>;
