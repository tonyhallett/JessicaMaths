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
  TGet,
  TInsert,
  TPKey,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TMethodName extends string = "where"
> = UnionToIntersection<
  WhereClauseFor<
    TGet,
    TInsert,
    TPKey,
    TIndexPaths[number],
    TIndexPaths,
    TMethodName
  >
>;

type WhereClauseFor<
  TGet,
  TInsert,
  TPKey,
  I extends DexieIndexPath<TInsert>,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TMethodName extends string
> = I extends SingleIndexPath<TInsert, infer P>
  ? WhereForSingle<TGet, TInsert, TPKey, P, I, TIndexPaths, TMethodName>
  : I extends MultiIndexPath<TInsert, infer P>
  ? WhereForMulti<TGet, TInsert, TPKey, P, I, TIndexPaths, TMethodName>
  : I extends CompoundIndexPaths<TInsert, infer Ps>
  ? never //WhereForCompound<T, Ps, I>
  : never;

type WhereForSingle<
  TGet,
  TInsert,
  PKey,
  P extends ValidIndexedDBKeyPath<TInsert>,
  I extends SingleIndexPath<TInsert, P>,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TMethodName extends string
> = {
  [K in TMethodName]: (
    path: I["path"]
  ) => WhereClause<
    TGet,
    TInsert,
    PKey,
    KeyPathValue<TInsert, I["path"]>,
    TIndexPaths
  >;
};

type WhereForMulti<
  TGet,
  TInsert,
  PKey,
  P extends ValidIndexedDBKeyPath<TInsert>,
  I extends MultiIndexPath<TInsert, P>,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TMethodName extends string
> = {
  [K in TMethodName]: (
    path: I["path"]
  ) => WhereClause<TGet, TInsert, PKey, KeyForIndex<TInsert, I>, TIndexPaths>;
};

/* 

type WhereForCompound<
  T,
  PS extends readonly ValidIndexedDBKeyPaths<T>[],
  I extends CompoundIndex<T, PS>
> = {
  where(paths: I["paths"]): CompoundWhereClause<T>;
}; */

interface Prefixes<
  TGet,
  TInsert,
  TPkey,
  TIndexPaths extends DexieIndexPaths<TInsert>
> {
  (prefixes: string[]): Collection<TGet, TInsert, TPkey, string, TIndexPaths>;
  (...prefixes: string[]): Collection<
    TGet,
    TInsert,
    TPkey,
    string,
    TIndexPaths
  >;
}

interface ValuesOf<
  TGet,
  TInsert,
  TPkey,
  Key,
  TIndexPaths extends DexieIndexPaths<TInsert>
> {
  (values: readonly Key[]): Collection<TGet, TInsert, TPkey, Key, TIndexPaths>;
  (...values: readonly Key[]): Collection<
    TGet,
    TInsert,
    TPkey,
    Key,
    TIndexPaths
  >;
}

interface WhereStringClause<
  TGet,
  TInsert,
  TPkey,
  TIndexPaths extends DexieIndexPaths<TInsert>
> {
  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  anyOfIgnoreCase: ValuesOf<TGet, TInsert, TPkey, string, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
  equalsIgnoreCase(
    value: string
  ): Collection<TGet, TInsert, TPkey, string, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWith()
  startsWith(
    prefix: string
  ): Collection<TGet, TInsert, TPkey, string, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithIgnoreCase()
  startsWithIgnoreCase(
    prefix: string
  ): Collection<TGet, TInsert, TPkey, string, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOf()
  startsWithAnyOf: Prefixes<TGet, TInsert, TPkey, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOfIgnoreCase()
  startsWithAnyOfIgnoreCase: Prefixes<TGet, TInsert, TPkey, TIndexPaths>;
}

export type WhereClause<
  TGet,
  TInsert,
  TPkey,
  Key,
  TIndexPaths extends DexieIndexPaths<TInsert>
> = WhereClauseNonStrings<TGet, TInsert, TPkey, Key, TIndexPaths> &
  (Key extends string
    ? WhereStringClause<TGet, TInsert, TPkey, TIndexPaths>
    : {});

export interface WhereClauseNonStrings<
  TGet,
  TInsert,
  TPkey,
  Key,
  TIndexPaths extends DexieIndexPaths<TInsert>
> {
  // https://dexie.org/docs/WhereClause/WhereClause.above()
  above(value: Key): Collection<TGet, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.aboveOrEqual()
  aboveOrEqual(value: Key): Collection<TGet, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.below()
  below(value: Key): Collection<TGet, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.belowOrEqual()
  belowOrEqual(key: Key): Collection<TGet, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.equals()
  equals(value: Key): Collection<TGet, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.anyOf()

  anyOf: ValuesOf<TGet, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.notEqual()
  notEqual(value: Key): Collection<TGet, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.noneOf()
  noneOf: ValuesOf<TGet, TInsert, TPkey, Key, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.between()
  between(
    lower: Key,
    upper: Key,
    includeLower?: boolean,
    includeUpper?: boolean
  ): Collection<TGet, TInsert, TPkey, Key, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.inAnyRange()
  inAnyRange(
    ranges: ReadonlyArray<[Key, Key]>,
    options?: {
      includeLowers?: boolean;
      includeUppers?: boolean;
    }
  ): Collection<TGet, TInsert, TPkey, Key, TIndexPaths>;
}

type MultiWhereClause<T> = {
  multi(): void;
};

type CompoundWhereClause<T> = {
  compound(): void;
};
