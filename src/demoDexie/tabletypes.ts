// TInsertType is used for add/put bulk version - NOT PASSED ON

import type {
  DBCoreTable,
  Dexie,
  PromiseExtended,
  TableHooks,
  TableSchema,
} from "dexie";
import type { DexieIndexes, DexieIndex, TableConfig } from "./tableBuilder";
import type { KeysOf, UpdateKeyPathValue } from "./better-dexie";
import type { WhereClause } from "./WhereClause";
import type { Collection } from "./Collection";

type AllowedIndexFields<S extends TableConfig<any, any, any, any>> =
  S["indices"][number];

export interface TableBase<
  TName extends string,
  T,
  TKey extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
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

  filter(fn: (obj: T) => boolean): Collection<T, TKey, TKey, TIndexes>;

  count(): PromiseExtended<number>;

  offset(n: number): Collection<T, TKey, TKey, TIndexes>;
  limit(n: number): Collection<T, TKey, TKey, TIndexes>;

  each(
    callback: (obj: T, cursor: { key: any; primaryKey: TKey }) => any
  ): PromiseExtended<void>;

  toArray(): PromiseExtended<Array<T>>;
  toCollection(): Collection<T, TKey, TKey, TIndexes>;
  orderBy(index: KeysOf<T>): Collection<T, TKey, TKey, TIndexes>;
  reverse(): Collection<T, TKey, TKey, TIndexes>;
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
  //

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

/*
Dexie where
		    where(index: string | string[]): WhereClause<T, TKey, TInsertType>;
		    where(equalityCriterias: {
		        [key: string]: any;
    }): Collection<T, TKey, TInsertType>;

  Better dexie where
    where<K extends KeysOf<T>>(index: K): WhereClause<T, K, TKey>
  where(equalityCriterias: Partial<T>): Collection<T, TKey>
*/

type KeyPathTable<
  TName extends string,
  T,
  TKey extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> = TableBase<TName, T, TKey, TIndexes> & {
  get(key: UpdateKeyPathValue<T, TKey>): PromiseExtended<T | undefined>;
  bulkGet(
    keys: UpdateKeyPathValue<T, TKey>[]
  ): PromiseExtended<(T | undefined)[]>;
  add(item: T): PromiseExtended<TKey>;
  where<K extends TIndexes[number]>(
    index: K
  ): WhereClause<T, TKey, K, TIndexes>;
};

type KeyPathAutoIncrementTable<
  TName extends string,
  T,
  TKey extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> = TableBase<TName, T, TKey, TIndexes> & {};
type HiddenTable<
  TName extends string,
  T,
  TKey extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> = TableBase<TName, T, TKey, TIndexes> & {};
type HiddenAutoIncrementTable<
  TName extends string,
  T,
  TKey extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> = TableBase<TName, T, TKey, TIndexes> & {};

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
        ? HiddenAutoIncrementTable<K, TRow, PK, AllowedIndexFields<TConfig[K]>>
        : HiddenTable<K, TRow, PK, AllowedIndexFields<TConfig[K]>>
      : Auto extends true
      ? KeyPathAutoIncrementTable<K, TRow, PK, AllowedIndexFields<TConfig[K]>>
      : KeyPathTable<K, TRow, PK, AllowedIndexFields<TConfig[K]>>
    : never;
};
