import type { UpdateKeyPathValue } from "./better-dexie";
import type { DexieIndex, DexieIndexes } from "./tableBuilder";
import type { Collection } from "./Collection";

export type StringWhenFn<
  T,
  TKey extends DexieIndex<T>,
  TFunc
> = UpdateKeyPathValue<T, TKey> extends string ? TFunc : never;

export type PrefixWhereFn<
  T,
  TPkey extends DexieIndex<T>,
  Key extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> = StringWhenFn<
  T,
  Key,
  (prefix: string) => Collection<T, TPkey, Key, TIndexes>
>;

export type EqualsIgnoreCaseWhereFn<
  T,
  TPkey extends DexieIndex<T>,
  Key extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> = StringWhenFn<
  T,
  Key,
  (value: string) => Collection<T, TPkey, Key, TIndexes>
>;
interface Prefixes<
  T,
  TPkey extends DexieIndex<T>,
  Key extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> {
  (prefixes: string[]): Collection<T, TPkey, Key, TIndexes>;
  (...prefixes: string[]): Collection<T, TPkey, Key, TIndexes>;
}

interface ValuesOf<
  T,
  TPkey extends DexieIndex<T>,
  Key extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>,
  TValue
> {
  (values: readonly TValue[]): Collection<T, TPkey, Key, TIndexes>;
  (...values: readonly TValue[]): Collection<T, TPkey, Key, TIndexes>;
}

export type PrefixesWhereFn<
  T,
  TPkey extends DexieIndex<T>,
  Key extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> = StringWhenFn<T, Key, Prefixes<T, TPkey, Key, TIndexes>>;

type KeyValues<
  T,
  TPkey extends DexieIndex<T>,
  Key extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>
> = ValuesOf<T, TPkey, Key, TIndexes, UpdateKeyPathValue<T, Key>>;

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
  anyOf: KeyValues<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.notEqual()
  notEqual(
    value: UpdateKeyPathValue<T, Key>
  ): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.noneOf()
  noneOf: KeyValues<T, TPkey, Key, TIndexes>;

  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  anyOfIgnoreCase: StringWhenFn<
    T,
    Key,
    ValuesOf<T, TPkey, Key, TIndexes, string>
  >;

  // https://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
  equalsIgnoreCase: EqualsIgnoreCaseWhereFn<T, TPkey, Key, TIndexes>;
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
