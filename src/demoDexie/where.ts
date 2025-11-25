import type { KeyPathValue } from "dexie";
import type { Collection } from "./Collection";
import type {
  CompoundIndexPaths,
  DexieIndexPath,
  DexieIndexPaths,
  KeyForIndexPath,
  MultiIndexPath,
  SingleIndexPath,
} from "./indexpaths";
import type {
  CompoundKeyPaths,
  ValidIndexedDBKeyPath,
} from "./ValidIndexedDBKeyPaths";
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
  ? WhereForCompound<
      TGet,
      TDatabase,
      TInsert,
      TPKey,
      Ps,
      I,
      TIndexPaths,
      TMethodName
    >
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
    KeyForIndexPath<TInsert, I>,
    TIndexPaths
  >;
};

type WhereForCompound<
  TGet,
  TDatabase,
  TInsert,
  PKey,
  P extends CompoundKeyPaths<TInsert>,
  I extends CompoundIndexPaths<TInsert, P>,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TMethodName extends string
> = {
  where(
    paths: I["paths"]
  ): WhereClause<
    TGet,
    TDatabase,
    TInsert,
    PKey,
    KeyForIndexPath<TInsert, I>,
    TIndexPaths
  >;
};

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
  // goes throug between(str, str + maxString, true, true); where maxString = String.fromCharCode(65535);
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
  /*
    above, aboveOrEqual, below, belowOrEqual, between and equals all create dexie DBCoreKeyRange
    which become range property of the Collection ctx
    DBCoreRange is converted to IDBKeyRange 
    https://github.com/dexie/Dexie.js/blob/2a4d7b2aff3b4e9050110aa859279c1599f15d26/src/dbcore/dbcore-indexeddb.ts#L99
    The implementation of dexie's DBCoreTable converts in its query method
    https://github.com/dexie/Dexie.js/blob/2a4d7b2aff3b4e9050110aa859279c1599f15d26/src/dbcore/dbcore-indexeddb.ts#L296
    and openCursor method

    DBCoreRange is also used in 
    https://github.com/dexie/Dexie.js/blob/2a4d7b2aff3b4e9050110aa859279c1599f15d26/src/dbcore/virtual-index-middleware.ts#L95

    Relevant IndexedDB docs
    https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex/getAll
    https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange 
    https://w3c.github.io/IndexedDB/#keyrange
    https://w3c.github.io/IndexedDB/#in
    https://w3c.github.io/IndexedDB/#compare-two-keys
  */
  // https://dexie.org/docs/WhereClause/WhereClause.between()
  between(
    lower: Key,
    upper: Key,
    includeLower?: boolean,
    includeUpper?: boolean
  ): Collection<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;
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

  // https://dexie.org/docs/WhereClause/WhereClause.inAnyRange()
  inAnyRange(
    ranges: ReadonlyArray<[Key, Key]>,
    options?: {
      includeLowers?: boolean;
      includeUppers?: boolean;
    }
  ): Collection<TGet, TDatabase, TInsert, TPkey, Key, TIndexPaths>;
}
