import type { IndexableType } from "dexie";
import type { UpdateKeyPathValue } from "./better-dexie";
import type { DexieIndex, DexieIndexes } from "./tableBuilder";
import type { Collection } from "./Collection";

export type PrefixWhereFn<
  T,
  TPkey extends DexieIndex<T>,
  Key extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> = UpdateKeyPathValue<T, Key> extends string
  ? (prefix: string) => Collection<T, TPkey, Key, TIndexes>
  : never;

interface Prefixes<
  T,
  TPkey extends DexieIndex<T>,
  Key extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> {
  (prefixes: string[]): Collection<T, TPkey, Key, TIndexes>;
  (...prefixes: string[]): Collection<T, TPkey, Key, TIndexes>;
}

export type PrefixesWhereFn<
  T,
  TPkey extends DexieIndex<T>,
  Key extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> = UpdateKeyPathValue<T, Key> extends string
  ? Prefixes<T, TPkey, Key, TIndexes>
  : never;

export interface WhereClause<
  T,
  TPkey extends DexieIndex<T>,
  Key extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> {
  // https://dexie.org/docs/WhereClause/WhereClause.above()
  above(value: UpdateKeyPathValue<T, Key>): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.aboveOrEqual()
  aboveOrEqual(
    value: UpdateKeyPathValue<T, Key>
  ): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.below()
  below(value: UpdateKeyPathValue<T, Key>): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.belowOrEqual()
  belowOrEqual(
    key: UpdateKeyPathValue<T, Key>
  ): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.equals()
  equals(
    value: UpdateKeyPathValue<T, Key>
  ): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.anyOf()
  // why does this not use ValuesOfKey?
  anyOf(
    values: ReadonlyArray<IndexableType>
  ): Collection<T, TPkey, Key, TIndexes>;
  anyOf(...values: Array<IndexableType>): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.notEqual()
  notEqual(
    value: UpdateKeyPathValue<T, Key>
  ): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.noneOf()
  noneOf(
    values: ReadonlyArray<UpdateKeyPathValue<T, Key>>
  ): Collection<T, TPkey, Key, TIndexes>;

  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  // this is incorrect as should be string values
  // so should type this to be never dependent upon Key
  // anyOfIgnoreCase(values: ValuesOfKey<T, Key>): Collection2<T, TKey>;
  anyOfIgnoreCase(...values: string[]): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
  // this is incorrect as should be string values
  // should type this to be never dependent upon Key
  //equalsIgnoreCase(value: ValuesOfKey<T, Key>): Collection2<T, TKey>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWith()
  startsWith: PrefixWhereFn<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithIgnoreCase()
  startsWithIgnoreCase: PrefixWhereFn<T, TPkey, Key, TIndexes>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOf()
  startsWithAnyOf: PrefixesWhereFn<T, TPkey, Key, TIndexes>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOfIgnoreCase()
  startsWithAnyOfIgnoreCase: PrefixesWhereFn<T, TPkey, Key, TIndexes>;

  // https://dexie.org/docs/WhereClause/WhereClause.between()
  between(
    lower: UpdateKeyPathValue<T, Key>,
    upper: UpdateKeyPathValue<T, Key>,
    includeLower?: boolean,
    includeUpper?: boolean
  ): Collection<T, TPkey, Key, TIndexes>;

  // https://dexie.org/docs/WhereClause/WhereClause.inAnyRange()
  inAnyRange(
    ranges: ReadonlyArray<
      [UpdateKeyPathValue<T, Key>, UpdateKeyPathValue<T, Key>]
    >,
    options?: {
      includeLowers?: boolean;
      includeUppers?: boolean;
    }
  ): Collection<T, TPkey, Key, TIndexes>;
}
