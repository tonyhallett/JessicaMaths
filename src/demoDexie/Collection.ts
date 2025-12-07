import type { PromiseExtended, ThenShortcut } from "dexie";
import type { WherePaths } from "./where";
import type { UpdateSpec } from "./UpdateSpec";
import type { PathKeyTypes } from "./utilitytypes";
import type { EqualityRegistryLookup } from "./whereEquality";

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

export type Collection<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKey,
  TWherePathKeyTypes extends PathKeyTypes,
  TEqualityRegistryLookup extends EqualityRegistryLookup,
  TDexie,
  TPKeyPathOrPaths,
  TMaxDepth extends string
> = CollectionBase<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKey,
  TWherePathKeyTypes,
  TEqualityRegistryLookup,
  TDexie,
  TPKeyPathOrPaths,
  TMaxDepth
> & {
  or: WherePaths<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TWherePathKeyTypes,
    TEqualityRegistryLookup,
    TDexie,
    TPKeyPathOrPaths,
    TKey,
    TMaxDepth
  >["where"];
};

export interface Cursor<TKey, TPKey> {
  key: TKey;
  primaryKey: TPKey;
}

export interface EachKeyCallback<TKey, TCursorKey, TPKey> {
  (key: TKey, cursor: Cursor<TCursorKey, TPKey>): any;
}

export interface ChangeContext<TInsert, TPKey> {
  value?: TInsert;
  primkey: TPKey;
}

/*
  Note that obj is the same as ctx.value - it is what has come from the database
  but typing ChangeContext to TInsert due to docs "Sample Replacing Object"
  if you are replacing the object then it needs to be of type TInsert
  due to deleting value property in the ChangeContext has to be optional
*/
export interface ChangeCallback<TDatabase, TInsert, TPKey> {
  (
    this: ChangeContext<TInsert, TPKey>,
    obj: TDatabase,
    ctx: ChangeContext<TInsert, TPKey>
  ): void | boolean;
}

interface CollectionBase<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKey,
  TWherePathKeyTypes extends PathKeyTypes,
  TEqualityRegistryLookup extends EqualityRegistryLookup,
  TDexie,
  TPKeyPathOrPaths,
  TMaxDepth extends string
> {
  db: TDexie;
  clone(
    props?: Object
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TKey,
    TWherePathKeyTypes,
    TEqualityRegistryLookup,
    TDexie,
    TPKeyPathOrPaths,
    TMaxDepth
  >;

  count(): PromiseExtended<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;

  toArray(): PromiseExtended<Array<TGet>>;
  toArray<R>(thenShortcut: ThenShortcut<TGet[], R>): PromiseExtended<R>;
  // is toArray and sorts that
  sortBy(keyPath: DotKeyComparable<TGet>): PromiseExtended<TGet[]>;
  sortBy<R>(
    keyPath: DotKeyComparable<TGet>,
    thenShortcut: ThenShortcut<TGet[], R>
  ): PromiseExtended<R>;
  /*
      ***********************
      from https://dexie.org/docs/Collection/Collection.keys()
      Not possible to use keys(), uniqueKeys(), eachKey() or eachUniqueKey() when
      Collection instance is based on the primary key
    */
  // https://dexie.org/docs/Collection/Collection.each()
  each(
    callback: (obj: TGet, cursor: Cursor<TKey, TPKey>) => any
  ): PromiseExtended<void>;
  // https://dexie.org/docs/Collection/Collection.eachKey()
  // ***************
  eachKey(callback: EachKeyCallback<TKey, TKey, TPKey>): PromiseExtended<void>;
  // https://dexie.org/docs/Collection/Collection.eachUniqueKey()
  // ***************
  eachUniqueKey(
    callback: EachKeyCallback<TKey, TKey, TPKey>
  ): PromiseExtended<void>;

  eachPrimaryKey(
    callback: EachKeyCallback<TPKey, TKey, TPKey>
  ): PromiseExtended<void>;

  keys(): PromiseExtended<TKey[]>;
  keys<R>(thenShortcut: ThenShortcut<TKey[], R>): PromiseExtended<R>;
  uniqueKeys(): PromiseExtended<TKey[]>;
  uniqueKeys<R>(thenShortcut: ThenShortcut<TKey[], R>): PromiseExtended<R>;

  primaryKeys(): PromiseExtended<TPKey[]>;
  primaryKeys<R>(thenShortcut: ThenShortcut<TPKey[], R>): PromiseExtended<R>;

  first(): PromiseExtended<TGet | undefined>;
  first<R>(thenShortcut: ThenShortcut<TGet | undefined, R>): PromiseExtended<R>;
  last(): PromiseExtended<TGet | undefined>;
  last<R>(thenShortcut: ThenShortcut<TGet | undefined, R>): PromiseExtended<R>;
  limit(n: number): this;
  // https://dexie.org/docs/Collection/Collection.until()  works similar to limit
  until(
    filter: (value: TDatabase) => boolean,
    includeStopEntry?: boolean
  ): this;
  offset(n: number): this;
  and: this["filter"];
  filter(filter: (item: TDatabase) => boolean): this;
  distinct(): this;

  // alias
  reverse(): this;
  desc: this["reverse"];

  // Mutating methods
  delete(): PromiseExtended<number>;
  // https://dexie.org/docs/Collection/Collection.modify()
  modify(
    changeCallback: ChangeCallback<TDatabase, TInsert, TPKey>
  ): PromiseExtended<number>;
  modify(changes: UpdateSpec<TDatabase, TMaxDepth>): PromiseExtended<number>;

  // Other methods
  // https://dexie.org/docs/Collection/Collection.raw()
  raw(): Collection<
    TDatabase,
    TDatabase,
    TInsert,
    TPKey,
    TKey,
    TWherePathKeyTypes,
    TEqualityRegistryLookup,
    TDexie,
    TPKeyPathOrPaths,
    TMaxDepth
  >;
}
