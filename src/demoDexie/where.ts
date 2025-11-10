import type { UpdateKeyPathValue } from "./better-dexie";
import type { Collection } from "./Collection";
import type {
  CompoundIndex,
  DexieIndex,
  DexieIndexes,
  DexiePlainKey,
  MultiIndex,
  SingleIndex,
} from "./dexieindexes";
import type { ValidIndexedDBKeyPaths } from "./ValidIndexedDBKeyPaths";

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export type WhereClausesFromIndexes<
  T,
  TPKey,
  TIndexes extends DexieIndexes<T>,
  TMethodName extends string = "where"
> = UnionToIntersection<
  WhereClauseFor<T, TPKey, TIndexes[number], TIndexes, TMethodName>
>;

type WhereClauseFor<
  T,
  TPKey,
  I extends DexieIndex<T>,
  TIndexes extends DexieIndexes<T>,
  TMethodName extends string
> = I extends SingleIndex<T, infer P>
  ? WhereForSingle<T, TPKey, P, I, TIndexes, TMethodName>
  : I extends MultiIndex<T, infer P>
  ? never //WhereForMulti<T, P, I>
  : I extends CompoundIndex<T, infer Ps>
  ? never //WhereForCompound<T, Ps, I>
  : never;

type WhereForSingle<
  T,
  PKey,
  P extends ValidIndexedDBKeyPaths<T>,
  I extends SingleIndex<T, P>,
  TIndexes extends DexieIndexes<T>,
  TMethodName extends string
> = {
  [K in TMethodName]: (
    path: I["path"]
  ) => WhereClause<T, PKey, UpdateKeyPathValue<T, I["path"]>, TIndexes>;
};

/* type WhereForMulti<
  T,
  P extends ValidIndexedDBKeyPaths<T>,
  I extends MultiIndex<T, P>
> = {
  where(path: I["path"]): MultiWhereClause<T>;
};

type WhereForCompound<
  T,
  PS extends readonly ValidIndexedDBKeyPaths<T>[],
  I extends CompoundIndex<T, PS>
> = {
  where(paths: I["paths"]): CompoundWhereClause<T>;
}; */

interface Prefixes<T, TPkey, Key, TIndexes extends DexieIndexes<T>> {
  (prefixes: string[]): Collection<T, TPkey, Key, TIndexes>;
  (...prefixes: string[]): Collection<T, TPkey, Key, TIndexes>;
}

interface ValuesOf<T, TPkey, Key, TIndexes extends DexieIndexes<T>, TValue> {
  (values: readonly TValue[]): Collection<T, TPkey, Key, TIndexes>;
  (...values: readonly TValue[]): Collection<T, TPkey, Key, TIndexes>;
}

/* type KeyValues<
  T,
  TPkey extends DexiePlainKey<T>,
  Key extends DexiePlainKey<T>,
  TIndexes extends DexieIndexes<T>
> = ValuesOf<T, TPkey, Key, TIndexes, UpdateKeyPathValue<T, Key>>;

export type KeyValueForIndex<
  T,
  K extends DexiePlainKey<T>
> = K extends readonly [any, ...any[]] // compound
  ? { [I in keyof K]: UpdateKeyPathValue<T, K[I]> }
  : UpdateKeyPathValue<T, K>; // single */

interface WhereStringClause<T, TPkey, Key, TIndexes extends DexieIndexes<T>> {
  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  anyOfIgnoreCase: ValuesOf<T, TPkey, Key, TIndexes, string>;

  // https://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
  equalsIgnoreCase(value: string): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWith()
  startsWith(prefix: string): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithIgnoreCase()
  startsWithIgnoreCase(prefix: string): Collection<T, TPkey, Key, TIndexes>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOf()
  startsWithAnyOf: Prefixes<T, TPkey, Key, TIndexes>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOfIgnoreCase()
  startsWithAnyOfIgnoreCase: Prefixes<T, TPkey, Key, TIndexes>;
}

export type WhereClause<
  T,
  TPkey,
  Key,
  TIndexes extends DexieIndexes<T>
> = WhereClauseNonStrings<T, TPkey, Key, TIndexes> &
  (Key extends string ? WhereStringClause<T, TPkey, Key, TIndexes> : {});

export interface WhereClauseNonStrings<
  T,
  TPkey,
  Key,
  TIndexes extends DexieIndexes<T>
> {
  // https://dexie.org/docs/WhereClause/WhereClause.above()
  above(value: Key): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.aboveOrEqual()
  aboveOrEqual(value: Key): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.below()
  below(value: Key): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.belowOrEqual()
  belowOrEqual(key: Key): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.equals()
  equals(value: Key): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.anyOf()

  /*
interface ValuesOf<
  T,
  TPkey,
  Key,
  TIndexes extends DexieIndexes<T>,
  TValue
> {
  (values: readonly TValue[]): Collection<T, TPkey, Key, TIndexes>;
  (...values: readonly TValue[]): Collection<T, TPkey, Key, TIndexes>;
}

*/

  anyOf: ValuesOf<T, TPkey, Key, TIndexes, Key>;
  // https://dexie.org/docs/WhereClause/WhereClause.notEqual()
  notEqual(value: Key): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.noneOf()
  noneOf: ValuesOf<T, TPkey, Key, TIndexes, Key>;

  // https://dexie.org/docs/WhereClause/WhereClause.between()
  between(
    lower: Key,
    upper: Key,
    includeLower?: boolean,
    includeUpper?: boolean
  ): Collection<T, TPkey, Key, TIndexes>;

  // https://dexie.org/docs/WhereClause/WhereClause.inAnyRange()
  inAnyRange(
    ranges: ReadonlyArray<[Key, Key]>,
    options?: {
      includeLowers?: boolean;
      includeUppers?: boolean;
    }
  ): Collection<T, TPkey, Key, TIndexes>;
}

type MultiWhereClause<T> = {
  multi(): void;
};

type CompoundWhereClause<T> = {
  compound(): void;
};
