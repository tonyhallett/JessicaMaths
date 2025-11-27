import type { KeyPathValue } from "dexie";
import type { Collection } from "./Collection";
import type {
  CompoundIndexPaths,
  DexieIndexPaths,
  ExtractIndexPaths,
  KeyForIndexPath,
  MultiIndexPath,
  SingleIndexPath,
} from "./indexpaths";
import type { PrimaryKeyId } from "./primarykey";

type WhereClauseForPath<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TPath,
  TIndexPaths extends DexieIndexPaths<TInsert>
> = TIndexPaths[number] extends infer I
  ? I extends SingleIndexPath<TInsert, any>
    ? I["path"] extends TPath
      ? WhereClause<
          TGet,
          TDatabase,
          TInsert,
          TPKey,
          KeyPathValue<TInsert, I["path"]>,
          TIndexPaths
        >
      : never
    : I extends MultiIndexPath<TInsert, any>
    ? I["path"] extends TPath
      ? WhereClause<
          TGet,
          TDatabase,
          TInsert,
          TPKey,
          KeyForIndexPath<TInsert, I>,
          TIndexPaths
        >
      : never
    : I extends CompoundIndexPaths<TInsert, any>
    ? I["paths"] extends TPath
      ? WhereClause<
          TGet,
          TDatabase,
          TInsert,
          TPKey,
          KeyForIndexPath<TInsert, I>,
          TIndexPaths
        >
      : never
    : never
  : never;

export type IndexPathsOrPrimaryKeyId<
  TInsert,
  TIndexPaths extends DexieIndexPaths<TInsert>
> = PrimaryKeyId | ExtractIndexPaths<TInsert, TIndexPaths>;

export type WhereClausePicker<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TIndexOrId extends IndexPathsOrPrimaryKeyId<TInsert, TIndexPaths>
> = TIndexOrId extends PrimaryKeyId
  ? WhereClause<TGet, TDatabase, TInsert, TPKey, TPKey, TIndexPaths>
  : WhereClauseForPath<
      TGet,
      TDatabase,
      TInsert,
      TPKey,
      TIndexOrId,
      TIndexPaths
    >;

export type WhereClauses<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TIndexPaths extends DexieIndexPaths<TInsert>
> = {
  where<TIndexOrId extends IndexPathsOrPrimaryKeyId<TInsert, TIndexPaths>>(
    indexOrId: TIndexOrId
  ): WhereClausePicker<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TIndexPaths,
    TIndexOrId
  > /* TIndexOrId extends PrimaryKeyId
    ? WhereClause<TGet, TDatabase, TInsert, TPKey, TPKey, TIndexPaths>
    : TIndexOrId extends infer P
    ? P extends string
      ? WhereClauseForPath<TGet, TDatabase, TInsert, TPKey, P, TIndexPaths>
      : P extends readonly string[]
      ? WhereClauseForPath<TGet, TDatabase, TInsert, TPKey, P, TIndexPaths>
      : never
    : never; */;
};

export type WhereClause<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  TKey,
  TIndexPaths extends DexieIndexPaths<TInsert>
> = WhereClauseNonStrings<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths> &
  (Extract<TKey, string> extends never
    ? {}
    : WhereStringClause<TGet, TDatabase, TInsert, TPkey, TIndexPaths>);

export interface WhereClauseNonStrings<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  TKey,
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
    lower: TKey,
    upper: TKey,
    includeLower?: boolean,
    includeUpper?: boolean
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.above()
  above(
    value: TKey
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.aboveOrEqual()
  aboveOrEqual(
    value: TKey
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.below()
  below(
    value: TKey
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.belowOrEqual()
  belowOrEqual(
    key: TKey
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.equals()
  equals(
    value: TKey
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.anyOf()

  anyOf: ValuesOf<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.notEqual()
  notEqual(
    value: TKey
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
  // https://dexie.org/docs/WhereClause/WhereClause.noneOf()
  noneOf: ValuesOf<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;

  // https://dexie.org/docs/WhereClause/WhereClause.inAnyRange()
  inAnyRange(
    ranges: ReadonlyArray<[TKey, TKey]>,
    options?: {
      includeLowers?: boolean;
      includeUppers?: boolean;
    }
  ): Collection<TGet, TDatabase, TInsert, TPkey, TKey, TIndexPaths>;
}

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
