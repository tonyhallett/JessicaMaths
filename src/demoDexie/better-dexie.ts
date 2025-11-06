// https://github.com/spion/dexie-better-types/blob/main/index.d.ts

import type { IndexableType, IndexableTypeArray, PromiseExtended } from "dexie";

type TupleKeys<T> =
  | [keyof T]
  | [keyof T, keyof T]
  | [keyof T, keyof T, keyof T]
  | [keyof T, keyof T, keyof T, keyof T]
  | [keyof T, keyof T, keyof T, keyof T, keyof T];
export type KeysOf<T> = keyof T | TupleKeys<T>;
type ValuesOfArrayKey<T, K extends TupleKeys<T>> = K extends [
  infer A,
  ...infer B
]
  ? A extends keyof T
    ? B extends TupleKeys<T>
      ? [T[A], ...ValuesOfArrayKey<T, B>]
      : B extends []
      ? [T[A]]
      : [{ a: never }]
    : [{ b: never }]
  : [{ c: never }];
type ValuesOfKey<T, K extends KeysOf<T>> = K extends keyof T
  ? T[K]
  : K extends TupleKeys<T>
  ? ValuesOfArrayKey<T, K>
  : never;

export type UpdateKeyPaths<T> = {
  [P in keyof T]: P extends string
    ? T[P] extends Array<infer K>
      ? K extends object // only drill into the array element if it's an object
        ? P | `${P}.${number}` | `${P}.${number}.${UpdateKeyPaths<K>}`
        : P | `${P}.${number}`
      : T[P] extends (...args: any[]) => any // Method
      ? never
      : T[P] extends object
      ? P | `${P}.${UpdateKeyPaths<T[P]>}`
      : P
    : never;
}[keyof T];

export type UpdateKeyPathValue<T, PATH> = PATH extends `${infer R}.${infer S}`
  ? R extends keyof T
    ? UpdateKeyPathValue<T[R], S>
    : T extends any[]
    ? PATH extends `${number}.${infer S}`
      ? UpdateKeyPathValue<T[number], S>
      : void
    : void
  : PATH extends `${number}`
  ? T extends any[]
    ? T[number]
    : void
  : PATH extends keyof T
  ? T[PATH]
  : void;

export interface WhereClause<T, Key extends KeysOf<T>, TKey = IndexableType> {
  above(value: ValuesOfKey<T, Key>): Collection<T, TKey>;
  aboveOrEqual(value: ValuesOfKey<T, Key>): Collection<T, TKey>;
  below(value: ValuesOfKey<T, Key>): Collection<T, TKey>;
  belowOrEqual(key: ValuesOfKey<T, Key>): Collection<T, TKey>;
  equals(value: ValuesOfKey<T, Key>): Collection<T, TKey>;
  // https://dexie.org/docs/WhereClause/WhereClause.anyOf()
  // why does this not use ValuesOfKey?
  anyOf(values: ReadonlyArray<IndexableType>): Collection<T, TKey>;
  anyOf(...values: Array<IndexableType>): Collection<T, TKey>;
  notEqual(value: ValuesOfKey<T, Key>): Collection<T, TKey>;
  noneOf(values: ReadonlyArray<ValuesOfKey<T, Key>>): Collection<T, TKey>;

  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  // this is incorrect as should be string values
  // so should type this to be never dependent upon Key
  anyOfIgnoreCase(values: ValuesOfKey<T, Key>): Collection<T, TKey>;
  anyOfIgnoreCase(...values: string[]): Collection<T, TKey>;
  // https://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
  // this is incorrect as should be string values
  // should type this to be never dependent upon Key
  equalsIgnoreCase(value: ValuesOfKey<T, Key>): Collection<T, TKey>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWith()
  // should type this to be never dependent upon Key

  startsWith(prefix: string): Collection<T, TKey>;
  startsWithAnyOf(prefixes: string[]): Collection<T, TKey>;
  startsWithAnyOf(...prefixes: string[]): Collection<T, TKey>;
  startsWithIgnoreCase(prefix: string): Collection<T, TKey>;
  startsWithAnyOfIgnoreCase(prefixes: string[]): Collection<T, TKey>;
  startsWithAnyOfIgnoreCase(...prefixes: string[]): Collection<T, TKey>;

  // https://dexie.org/docs/WhereClause/WhereClause.between()
  between(
    lower: ValuesOfKey<T, Key>,
    upper: ValuesOfKey<T, Key>,
    includeLower?: boolean,
    includeUpper?: boolean
  ): Collection<T, TKey>;

  // https://dexie.org/docs/WhereClause/WhereClause.inAnyRange()
  inAnyRange(
    ranges: ReadonlyArray<[ValuesOfKey<T, Key>, ValuesOfKey<T, Key>]>,
    options?: {
      includeLowers?: boolean;
      includeUppers?: boolean;
    }
  ): Collection<T, TKey>;
}

export interface Collection<T = any, TKey = IndexableType> {
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

  and(filter: (x: T) => boolean): Collection<T, TKey>;
  clone(props?: Object): Collection<T, TKey>;
  count(): PromiseExtended<number>;

  distinct(): Collection<T, TKey>;
  each(
    callback: (
      obj: T,
      cursor: {
        key: IndexableType;
        primaryKey: TKey;
      }
    ) => any
  ): PromiseExtended<void>;
  eachKey(
    callback: (
      key: IndexableType,
      cursor: {
        key: IndexableType;
        primaryKey: TKey;
      }
    ) => any
  ): PromiseExtended<void>;
  eachPrimaryKey(
    callback: (
      key: TKey,
      cursor: {
        key: IndexableType;
        primaryKey: TKey;
      }
    ) => any
  ): PromiseExtended<void>;
  eachUniqueKey(
    callback: (
      key: IndexableType,
      cursor: {
        key: IndexableType;
        primaryKey: TKey;
      }
    ) => any
  ): PromiseExtended<void>;
  filter(filter: (x: T) => boolean): Collection<T, TKey>;
  first(): PromiseExtended<T | undefined>;

  keys(): PromiseExtended<IndexableTypeArray>;

  primaryKeys(): PromiseExtended<TKey[]>;

  last(): PromiseExtended<T | undefined>;

  limit(n: number): Collection<T, TKey>;
  offset(n: number): Collection<T, TKey>;
  or<K extends KeysOf<T>>(indexOrPrimayKey: K): WhereClause<T, K, TKey>;
  raw(): Collection<T, TKey>;
  reverse(): Collection<T, TKey>;
  sortBy(keyPath: string): PromiseExtended<T[]>;

  toArray(): PromiseExtended<Array<T>>;

  uniqueKeys(): PromiseExtended<IndexableTypeArray>;

  until(
    filter: (value: T) => boolean,
    includeStopEntry?: boolean
  ): Collection<T, TKey>;
  // Mutating methods
  delete(): PromiseExtended<number>;
  modify(
    changeCallback: (
      obj: T,
      ctx: {
        value: T;
      }
    ) => void | boolean
  ): PromiseExtended<number>;
  modify(changes: { [keyPath: string]: any }): PromiseExtended<number>;
}
