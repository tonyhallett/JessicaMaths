import type { KeyPathValue } from "dexie";
import type { Collection } from "./Collection";
import type {
  CompoundIndex,
  DexieIndex,
  DexieIndexes,
  MultiIndex,
  SingleIndex,
} from "./dexieindexes";
import type { KeyForIndex } from "./tabletypes";
import type { ValidIndexedDBKeyPaths } from "./ValidIndexedDBKeyPaths";
import type { UnionToIntersection } from "./utilitytypes";

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
  ? WhereForMulti<T, TPKey, P, I, TIndexes, TMethodName>
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
  ) => WhereClause<T, PKey, KeyPathValue<T, I["path"]>, TIndexes>;
};

type WhereForMulti<
  T,
  PKey,
  P extends ValidIndexedDBKeyPaths<T>,
  I extends MultiIndex<T, P>,
  TIndexes extends DexieIndexes<T>,
  TMethodName extends string
> = {
  [K in TMethodName]: (
    path: I["path"]
  ) => WhereClause<T, PKey, KeyForIndex<T, I>, TIndexes>;
};

/* 

type WhereForCompound<
  T,
  PS extends readonly ValidIndexedDBKeyPaths<T>[],
  I extends CompoundIndex<T, PS>
> = {
  where(paths: I["paths"]): CompoundWhereClause<T>;
}; */

interface Prefixes<T, TPkey, TIndexes extends DexieIndexes<T>> {
  (prefixes: string[]): Collection<T, TPkey, string, TIndexes>;
  (...prefixes: string[]): Collection<T, TPkey, string, TIndexes>;
}

interface ValuesOf<T, TPkey, Key, TIndexes extends DexieIndexes<T>> {
  (values: readonly Key[]): Collection<T, TPkey, Key, TIndexes>;
  (...values: readonly Key[]): Collection<T, TPkey, Key, TIndexes>;
}

interface WhereStringClause<T, TPkey, TIndexes extends DexieIndexes<T>> {
  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  anyOfIgnoreCase: ValuesOf<T, TPkey, string, TIndexes>;

  // https://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
  equalsIgnoreCase(value: string): Collection<T, TPkey, string, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWith()
  startsWith(prefix: string): Collection<T, TPkey, string, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithIgnoreCase()
  startsWithIgnoreCase(prefix: string): Collection<T, TPkey, string, TIndexes>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOf()
  startsWithAnyOf: Prefixes<T, TPkey, TIndexes>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOfIgnoreCase()
  startsWithAnyOfIgnoreCase: Prefixes<T, TPkey, TIndexes>;
}

export type WhereClause<
  T,
  TPkey,
  Key,
  TIndexes extends DexieIndexes<T>
> = WhereClauseNonStrings<T, TPkey, Key, TIndexes> &
  (Key extends string ? WhereStringClause<T, TPkey, TIndexes> : {});

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

  anyOf: ValuesOf<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.notEqual()
  notEqual(value: Key): Collection<T, TPkey, Key, TIndexes>;
  // https://dexie.org/docs/WhereClause/WhereClause.noneOf()
  noneOf: ValuesOf<T, TPkey, Key, TIndexes>;

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
