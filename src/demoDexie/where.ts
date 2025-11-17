import type { KeyPathValue } from "dexie";
import type { Collection } from "./Collection";
import type {
  CompoundIndexPaths,
  DexieIndexPath,
  DexieIndexPaths,
  MultiIndexPath,
  SingleIndexPath,
} from "./dexieindexes";
import type { KeyForIndex } from "./tabletypes";
import type { ValidIndexedDBKeyPath } from "./ValidIndexedDBKeyPaths";
import type { UnionToIntersection } from "./utilitytypes";

export type WhereClausesFromIndexes<
  T,
  TPKey,
  TIndexPaths extends DexieIndexPaths<T>,
  TMethodName extends string = "where"
> = UnionToIntersection<
  WhereClauseFor<T, TPKey, TIndexPaths[number], TIndexPaths, TMethodName>
>;

type WhereClauseFor<
  T,
  TPKey,
  I extends DexieIndexPath<T>,
  TIndexPaths extends DexieIndexPaths<T>,
  TMethodName extends string
> = I extends SingleIndexPath<T, infer P>
  ? WhereForSingle<T, TPKey, P, I, TIndexPaths, TMethodName>
  : I extends MultiIndexPath<T, infer P>
  ? WhereForMulti<T, TPKey, P, I, TIndexPaths, TMethodName>
  : I extends CompoundIndexPaths<T, infer Ps>
  ? never //WhereForCompound<T, Ps, I>
  : never;

type WhereForSingle<
  T,
  PKey,
  P extends ValidIndexedDBKeyPath<T>,
  I extends SingleIndexPath<T, P>,
  TIndexPaths extends DexieIndexPaths<T>,
  TMethodName extends string
> = {
  [K in TMethodName]: (
    path: I["path"]
  ) => WhereClause<T, PKey, KeyPathValue<T, I["path"]>, TIndexPaths>;
};

type WhereForMulti<
  T,
  PKey,
  P extends ValidIndexedDBKeyPath<T>,
  I extends MultiIndexPath<T, P>,
  TIndexPaths extends DexieIndexPaths<T>,
  TMethodName extends string
> = {
  [K in TMethodName]: (
    path: I["path"]
  ) => WhereClause<T, PKey, KeyForIndex<T, I>, TIndexPaths>;
};

/* 

type WhereForCompound<
  T,
  PS extends readonly ValidIndexedDBKeyPaths<T>[],
  I extends CompoundIndex<T, PS>
> = {
  where(paths: I["paths"]): CompoundWhereClause<T>;
}; */

interface Prefixes<T, TPkey, TIndexPaths extends DexieIndexPaths<T>> {
  (prefixes: string[]): Collection<T, TPkey, string, TIndexPaths>;
  (...prefixes: string[]): Collection<T, TPkey, string, TIndexPaths>;
}

interface ValuesOf<T, TPkey, Key, TIndexPaths extends DexieIndexPaths<T>> {
  (values: readonly Key[]): Collection<T, TPkey, Key, TIndexPaths>;
  (...values: readonly Key[]): Collection<T, TPkey, Key, TIndexPaths>;
}

interface WhereStringClause<T, TPkey, TIndexPaths extends DexieIndexPaths<T>> {
  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  anyOfIgnoreCase: ValuesOf<T, TPkey, string, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
  equalsIgnoreCase(value: string): Collection<T, TPkey, string, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWith()
  startsWith(prefix: string): Collection<T, TPkey, string, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithIgnoreCase()
  startsWithIgnoreCase(
    prefix: string
  ): Collection<T, TPkey, string, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOf()
  startsWithAnyOf: Prefixes<T, TPkey, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOfIgnoreCase()
  startsWithAnyOfIgnoreCase: Prefixes<T, TPkey, TIndexPaths>;
}

export type WhereClause<
  T,
  TPkey,
  Key,
  TIndexPaths extends DexieIndexPaths<T>
> = WhereClauseNonStrings<T, TPkey, Key, TIndexPaths> &
  (Key extends string ? WhereStringClause<T, TPkey, TIndexPaths> : {});

export interface WhereClauseNonStrings<
  T,
  TPkey,
  Key,
  TIndexPaths extends DexieIndexPaths<T>
> {
  // https://dexie.org/docs/WhereClause/WhereClause.above()
  above(value: Key): Collection<T, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.aboveOrEqual()
  aboveOrEqual(value: Key): Collection<T, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.below()
  below(value: Key): Collection<T, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.belowOrEqual()
  belowOrEqual(key: Key): Collection<T, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.equals()
  equals(value: Key): Collection<T, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.anyOf()

  anyOf: ValuesOf<T, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.notEqual()
  notEqual(value: Key): Collection<T, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.noneOf()
  noneOf: ValuesOf<T, TPkey, Key, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.between()
  between(
    lower: Key,
    upper: Key,
    includeLower?: boolean,
    includeUpper?: boolean
  ): Collection<T, TPkey, Key, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.inAnyRange()
  inAnyRange(
    ranges: ReadonlyArray<[Key, Key]>,
    options?: {
      includeLowers?: boolean;
      includeUppers?: boolean;
    }
  ): Collection<T, TPkey, Key, TIndexPaths>;
}

type MultiWhereClause<T> = {
  multi(): void;
};

type CompoundWhereClause<T> = {
  compound(): void;
};
