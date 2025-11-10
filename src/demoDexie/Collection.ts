import type { PromiseExtended } from "dexie";
import type { DexieIndexes } from "./dexieindexes";
import type { WhereClausesFromIndexes } from "./where";

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

export type AndFilter<T, TPkey, TKey, TIndexes extends DexieIndexes<T>> = (
  filter: (x: T) => boolean
) => Collection<T, TPkey, TKey, TIndexes>;

export type Collection<
  T,
  PKey,
  TKey,
  TIndexes extends DexieIndexes<T>
> = CollectionBase<T, PKey, TKey, TIndexes> &
  WhereClausesFromIndexes<T, PKey, TIndexes, "or">;

interface CollectionBase<T, TPkey, TKey, TIndexes extends DexieIndexes<T>> {
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
  clone(props?: Object): Collection<T, TPkey, TKey, TIndexes>;

  count(): PromiseExtended<number>;

  toArray(): PromiseExtended<Array<T>>;

  /*
      ***********************
      from https://dexie.org/docs/Collection/Collection.keys()
      Not possible to use keys(), uniqueKeys(), eachKey() or eachUniqueKey() when
      Collection instance is based on the primary key
    */
  // https://dexie.org/docs/Collection/Collection.each()
  each(
    callback: (
      obj: T,
      cursor: {
        key: TKey; // IndexableType;
        primaryKey: TPkey;
      }
    ) => any
  ): PromiseExtended<void>;
  // https://dexie.org/docs/Collection/Collection.eachKey()
  // ***************
  eachKey(
    callback: (
      key: TKey,
      cursor: {
        key: TKey;
        primaryKey: TPkey;
      }
    ) => any
  ): PromiseExtended<void>;
  // https://dexie.org/docs/Collection/Collection.eachUniqueKey()
  // ***************
  eachUniqueKey(
    callback: (
      key: TKey,
      cursor: {
        key: TKey;
        primaryKey: TPkey;
      }
    ) => any
  ): PromiseExtended<void>;

  eachPrimaryKey(
    callback: (
      key: TPkey,
      cursor: {
        key: TKey;
        primaryKey: TPkey;
      }
    ) => any
  ): PromiseExtended<void>;

  keys(): PromiseExtended<TKey[]>;
  uniqueKeys(): PromiseExtended<TKey[]>;

  primaryKeys(): PromiseExtended<TPkey[]>;

  first(): PromiseExtended<T | undefined>;
  last(): PromiseExtended<T | undefined>;
  limit(n: number): Collection<T, TPkey, TKey, TIndexes>;
  // https://dexie.org/docs/Collection/Collection.until()  works similar to limit
  until(
    filter: (value: T) => boolean,
    includeStopEntry?: boolean
  ): Collection<T, TPkey, TKey, TIndexes>;
  offset(n: number): Collection<T, TPkey, TKey, TIndexes>;
  and: AndFilter<T, TPkey, TKey, TIndexes>;
  filter: AndFilter<T, TPkey, TKey, TIndexes>;
  distinct(): Collection<T, TPkey, TKey, TIndexes>;

  reverse(): Collection<T, TPkey, TKey, TIndexes>;
  sortBy(keyPath: DotKeyComparable<T>): PromiseExtended<T[]>;

  // Mutating methods
  delete(): PromiseExtended<number>;
  // https://dexie.org/docs/Collection/Collection.modify()
  modify(
    changeCallback: (
      obj: T,
      ctx: {
        value: T;
      }
    ) => void | boolean
  ): PromiseExtended<number>;
  modify(changes: { [keyPath: string]: any }): PromiseExtended<number>;

  // Other methods
  // https://dexie.org/docs/Collection/Collection.raw()
  raw(): Collection<T, TPkey, TKey, TIndexes>;
}
