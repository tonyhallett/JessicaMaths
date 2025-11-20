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
  TDatabase,
  TInsert,
  TPKey,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TMethodName extends string = "where"
> = UnionToIntersection<
  WhereClauseFor<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TIndexPaths[number],
    TIndexPaths,
    TMethodName
  >
>;

type WhereClauseFor<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  I extends DexieIndexPath<TInsert>,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TMethodName extends string
> = I extends SingleIndexPath<TInsert, infer P>
  ? WhereForSingle<
      TGet,
      TDatabase,
      TInsert,
      TPKey,
      P,
      I,
      TIndexPaths,
      TMethodName
    >
  : I extends MultiIndexPath<TInsert, infer P>
  ? WhereForMulti<
      TGet,
      TDatabase,
      TInsert,
      TPKey,
      P,
      I,
      TIndexPaths,
      TMethodName
    >
  : I extends CompoundIndexPaths<TInsert, infer Ps>
  ? never //WhereForCompound<T, Ps, I>
  : never;

type WhereForSingle<
  TGet,
  TDatabase,
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
    TDatabase,
    TInsert,
    PKey,
    KeyPathValue<TInsert, I["path"]>,
    TIndexPaths
  >;
};

type WhereForMulti<
  TGet,
  TDatabase,
  TInsert,
  PKey,
  P extends ValidIndexedDBKeyPath<TInsert>,
  I extends MultiIndexPath<TInsert, P>,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TMethodName extends string
> = {
  [K in TMethodName]: (
    path: I["path"]
  ) => WhereClause<
    TGet,
    TDatabase,
    TInsert,
    PKey,
    KeyForIndex<TInsert, I>,
    TIndexPaths
  >;
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
  TDatabase,
  TInsert,
  TPkey,
  TIndexPaths extends DexieIndexPaths<TInsert>
> {
  (prefixes: string[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    string,
    TIndexPaths
  >;
  (...prefixes: string[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    string,
    TIndexPaths
  >;
}

interface ValuesOf<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  Key,
  TIndexPaths extends DexieIndexPaths<TInsert>
> {
  (values: readonly Key[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    Key,
    TIndexPaths
  >;
  (...values: readonly Key[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    Key,
    TIndexPaths
  >;
}

interface WhereStringClause<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  TIndexPaths extends DexieIndexPaths<TInsert>
> {
  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  anyOfIgnoreCase: ValuesOf<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    string,
    TIndexPaths
  >;

  // https://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
  equalsIgnoreCase(
    value: string
  ): Collection<TGet, TDatabase, TInsert, TPkey, string, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWith()
  startsWith(
    prefix: string
  ): Collection<TGet, TDatabase, TInsert, TPkey, string, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithIgnoreCase()
  startsWithIgnoreCase(
    prefix: string
  ): Collection<TGet, TDatabase, TInsert, TPkey, string, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOf()
  startsWithAnyOf: Prefixes<TGet, TDatabase, TInsert, TPkey, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOfIgnoreCase()
  startsWithAnyOfIgnoreCase: Prefixes<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TIndexPaths
  >;
}

export type WhereClause<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  Key,
  TIndexPaths extends DexieIndexPaths<TInsert>
> = WhereClauseNonStrings<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths> &
  (Key extends string
    ? WhereStringClause<TGet, TDatabase, TInsert, TPkey, TIndexPaths>
    : {});

export interface WhereClauseNonStrings<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  Key,
  TIndexPaths extends DexieIndexPaths<TInsert>
> {
  // https://dexie.org/docs/WhereClause/WhereClause.above()
  above(
    value: Key
  ): Collection<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.aboveOrEqual()
  aboveOrEqual(
    value: Key
  ): Collection<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.below()
  below(
    value: Key
  ): Collection<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.belowOrEqual()
  belowOrEqual(
    key: Key
  ): Collection<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.equals()
  equals(
    value: Key
  ): Collection<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.anyOf()

  anyOf: ValuesOf<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.notEqual()
  notEqual(
    value: Key
  ): Collection<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.noneOf()
  noneOf: ValuesOf<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.between()
  between(
    lower: Key,
    upper: Key,
    includeLower?: boolean,
    includeUpper?: boolean
  ): Collection<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.inAnyRange()
  inAnyRange(
    ranges: ReadonlyArray<[Key, Key]>,
    options?: {
      includeLowers?: boolean;
      includeUppers?: boolean;
    }
  ): Collection<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;
}

type MultiWhereClause<T> = {
  multi(): void;
};

type CompoundWhereClause<T> = {
  compound(): void;
};
