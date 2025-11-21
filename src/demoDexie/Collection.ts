import type { PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./dexieindexes";
import type { WhereClausesFromIndexes } from "./where";
import type { UpdateSpec } from "dexie";

type Comparable =
  | number
  | string
  | Date
  | Array<any>
  | Uint8Array
  | ArrayBuffer
  | DataView;
/** Helper to detect `any`. Returns true for `any`. */
type IsAny<T> = 0 extends 1 & T ? true : false;

type DotNestedKeys<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]:
        | K
        | (T[K] extends object ? `${K}.${DotNestedKeys<T[K]>}` : never);
    }[Extract<keyof T, string>]
  : string;

type DotKeysOfType<T, V> = T extends object
  ? {
      [K in Extract<keyof T, string>]: T[K] extends V
        ? K
        : T[K] extends object
        ? `${K}.${DotKeysOfType<T[K], V>}`
        : never;
    }[Extract<keyof T, string>]
  : never;

export type DotKeyComparable<TValue> = IsAny<TValue> extends true
  ? string
  : // the cmp function
    DotKeysOfType<TValue, Comparable>;

export type DotKey<T> = DotNestedKeys<T>;

export type AndFilter<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  TKey,
  TIndexPaths extends DexieIndexPaths<TInsert>
> = (
  filter: (item: TDatabase) => boolean
) => Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;

export type Collection<
  TGet,
  TDatabase,
  TInsert,
  PKey,
  TKey,
  TIndexPaths extends DexieIndexPaths<TInsert>
> = CollectionBase<TGet, TDatabase, TInsert, PKey, TKey, TIndexPaths> &
  WhereClausesFromIndexes<TGet, TDatabase, TInsert, PKey, TIndexPaths, "or">;

export interface Cursor<TKey, TPkey> {
  key: TKey;
  primaryKey: TPkey;
}

export interface EachKeyCallback<TKey, TCursorKey, TPkey> {
  (key: TKey, cursor: Cursor<TCursorKey, TPkey>): any;
}

export interface ChangeCallback<T> {
  (obj: T, ctx: { value: T }): void | boolean;
}

interface CollectionBase<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  TKey,
  TIndexPaths extends DexieIndexPaths<TInsert>
> {
  //db: Database;
  // then shortcuts
  // count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>
  // first<R>(thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>
  // keys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): PromiseExtended<R>
  // primaryKeys<R>(thenShortcut: ThenShortcut<TKey[], R>): PromiseExtended<R>
  // last<R>(thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>
  // sortBy<R>(keyPath: string, thenShortcut: ThenShortcut<T[], R>): PromiseExtended<R>
  // toArray<R>(thenShortcut: ThenShortcut<T[], R>): PromiseExtended<R>
  // uniqueKeys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): PromiseExtended<R>
  clone(
    props?: Object
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;

  count(): PromiseExtended<number>;

  toArray(): PromiseExtended<Array<TGet>>;
  // is toArray and sorts that
  sortBy(keyPath: DotKeyComparable<TGet>): PromiseExtended<TGet[]>;

  /*
      ***********************
      from https://dexie.org/docs/Collection/Collection.keys()
      Not possible to use keys(), uniqueKeys(), eachKey() or eachUniqueKey() when
      Collection instance is based on the primary key
    */
  // https://dexie.org/docs/Collection/Collection.each()
  each(
    callback: (obj: TGet, cursor: Cursor<TKey, TPkey>) => any
  ): PromiseExtended<void>;
  // https://dexie.org/docs/Collection/Collection.eachKey()
  // ***************
  eachKey(callback: EachKeyCallback<TKey, TKey, TPkey>): PromiseExtended<void>;
  // https://dexie.org/docs/Collection/Collection.eachUniqueKey()
  // ***************
  eachUniqueKey(
    callback: EachKeyCallback<TKey, TKey, TPkey>
  ): PromiseExtended<void>;

  eachPrimaryKey(
    callback: EachKeyCallback<TPkey, TKey, TPkey>
  ): PromiseExtended<void>;

  keys(): PromiseExtended<TKey[]>;
  uniqueKeys(): PromiseExtended<TKey[]>;

  primaryKeys(): PromiseExtended<TPkey[]>;

  first(): PromiseExtended<TGet | undefined>;
  last(): PromiseExtended<TGet | undefined>;
  limit(
    n: number
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  // https://dexie.org/docs/Collection/Collection.until()  works similar to limit
  until(
    filter: (value: TDatabase) => boolean,
    includeStopEntry?: boolean
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  offset(
    n: number
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  and: AndFilter<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  filter: AndFilter<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  distinct(): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;

  // alias for desc
  reverse(): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  desc(): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;

  // Mutating methods
  delete(): PromiseExtended<number>;
  // https://dexie.org/docs/Collection/Collection.modify()
  modify(changeCallback: ChangeCallback<TInsert>): PromiseExtended<number>;
  modify(changes: UpdateSpec<TInsert>): PromiseExtended<number>;

  // Other methods
  // https://dexie.org/docs/Collection/Collection.raw()
  raw(): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
}
