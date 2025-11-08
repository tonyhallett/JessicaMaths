// TInsertType is used for add/put bulk version - NOT PASSED ON

import type {
  DBCoreTable,
  Dexie,
  PromiseExtended,
  TableHooks,
  TableSchema,
} from "dexie";
import type { DexieIndices, TableConfig } from "./tableBuilder";
import type {
  Collection,
  KeysOf,
  UpdateKeyPathValue,
  WhereClause,
} from "./better-dexie";

type AllowedIndexFields<S extends TableConfig<any, any, any, any>> =
  S["indices"][number];

//export interface TableBase<T = any, TKey = any, TInsertType = T> {
export interface TableBase<
  TName extends string = string,
  T = any,
  TKey = any,
  TIndices extends DexieIndices<T> = any
> {
  db: Dexie;
  name: TName;
  schema: TableSchema;
  hook: TableHooks<T, TKey>;
  core: DBCoreTable;

  // Then shortcuts
  // get<R>(key: TKey, thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>
  // count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;
  // toArray<R>(thenShortcut: ThenShortcut<T[], R>): PromiseExtended<R>;
  // get<R>(equalityCriterias: Partial<T>, thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>

  // equality criterias
  // get(equalityCriterias: Partial<T>): PromiseExtended<T | undefined>

  where(equalityCriterias: Partial<T>): Collection<T, TKey>;
  where<K extends KeysOf<T>>(index: K): WhereClause<T, K, TKey>;
  //where(index: TIndices): WhereClause<T, K, TKey>;

  filter(fn: (obj: T) => boolean): Collection<T, TKey>;

  count(): PromiseExtended<number>;

  offset(n: number): Collection<T, TKey>;
  limit(n: number): Collection<T, TKey>;

  each(
    callback: (obj: T, cursor: { key: any; primaryKey: TKey }) => any
  ): PromiseExtended<void>;

  toArray(): PromiseExtended<Array<T>>;
  toCollection(): Collection<T, TKey>;
  orderBy(index: KeysOf<T>): Collection<T, TKey>;
  reverse(): Collection<T, TKey>;
  mapToClass(constructor: Function): Function;

  // table type dependent methods
  // add(item: TInsertType, key?: TKey): PromiseExtended<TKey>;

  //>>>>>>>>>>>>>>
  // get(key: TKey): PromiseExtended<T | undefined>;   ****************** might be able to default to string

  /*   update(
    key: TKey | T,
    changes:
      | UpdateSpec<T>
      | ((
          obj: T,
          ctx: { value: any; primKey: IndexableType }
        ) => void | boolean)
  ): PromiseExtended<number>; */
  // put(item: TInsertType, key?: TKey): PromiseExtended<TKey>;

  delete(key: TKey): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
  bulkGet(keys: TKey[]): PromiseExtended<(T | undefined)[]>;

  /* bulkAdd<B extends boolean>(
    items: readonly TInsertType[],
    keys: IndexableTypeArrayReadonly,
    options: { allKeys: B }
  ): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkAdd<B extends boolean>(
    items: readonly TInsertType[],
    options: { allKeys: B }
  ): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkAdd(
    items: readonly TInsertType[],
    keys?: IndexableTypeArrayReadonly,
    options?: { allKeys: boolean }
  ): PromiseExtended<TKey>; */

  /*   bulkPut<B extends boolean>(
    items: readonly TInsertType[],
    keys: IndexableTypeArrayReadonly,
    options: { allKeys: B }
  ): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkPut<B extends boolean>(
    items: readonly TInsertType[],
    options: { allKeys: B }
  ): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkPut(
    items: readonly TInsertType[],
    keys?: IndexableTypeArrayReadonly,
    options?: { allKeys: boolean }
  ): PromiseExtended<TKey>; */

  /*   bulkUpdate(
    keysAndChanges: ReadonlyArray<{ key: TKey; changes: UpdateSpec<T> }>
  ): PromiseExtended<number>; */

  // bulkDelete(keys: TKey[]): PromiseExtended<void>;
}

type KeyPathTable<
  TName extends string,
  T,
  TKey,
  TIndices extends DexieIndices<T>
> = TableBase<TName, T, TKey, TIndices> & {
  get(key: UpdateKeyPathValue<T, TKey>): PromiseExtended<T | undefined>;
  add(item: T): PromiseExtended<TKey>;
  // index methods to use TIndices for parameter type
};
type KeyPathAutoIncrementTable<TName extends string, T> = TableBase<
  TName,
  T
> & {};
type HiddenTable<TName extends string, T> = TableBase<TName, T> & {};
type HiddenAutoIncrementTable<TName extends string, T> = TableBase<
  TName,
  T
> & {};

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
        ? HiddenAutoIncrementTable<K, TRow>
        : HiddenTable<K, TRow>
      : Auto extends true
      ? KeyPathAutoIncrementTable<K, TRow>
      : KeyPathTable<K, TRow, PK, AllowedIndexFields<TConfig[K]>>
    : never;
};
