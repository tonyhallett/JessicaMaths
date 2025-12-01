import type { Collection } from "./Collection";
import type { DexiePrimaryKeyPathOrPaths } from "./primarykey";
import type { KeyLookup } from "./utilitytypes";

type KeyTypeForPath<TPathLookup extends KeyLookup, TPath> = Extract<
  TPathLookup[number],
  { path: TPath }
>["keyType"];

export interface WhereClauses<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKeyLookup extends KeyLookup,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey
> {
  // includes virtual indexes
  where<TPath extends TKeyLookup[number]["path"]>(
    indexOrPrimaryKeyPath: TPath
  ): WhereClause<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    KeyTypeForPath<TKeyLookup, TPath>,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey
  >;
}

type CollectionKey<TCurrent, TKey> = [TCurrent] extends [undefined]
  ? TKey
  : TCurrent | TKey;

export type WhereClause<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKey,
  TKeyLookup extends KeyLookup,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey // this will union with TKey,
> = WhereClauseNonStrings<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKey,
  TKeyLookup,
  TDexie,
  TPKeyPathOrPaths,
  CollectionKey<TCollectionKey, TKey> // necessary due to Collection or,
> & { db: TDexie } & (Extract<TKey, string> extends never
    ? {}
    : WhereStringClause<
        TGet,
        TDatabase,
        TInsert,
        TPKey,
        TKeyLookup,
        TDexie,
        TPKeyPathOrPaths,
        CollectionKey<TCollectionKey, string> // necessary due to Collection or
      >);
export interface WhereClauseNonStrings<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKey,
  TKeyLookup extends KeyLookup,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey
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
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.above()
  above(
    value: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.aboveOrEqual()
  aboveOrEqual(
    value: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.below()
  below(
    value: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.belowOrEqual()
  belowOrEqual(
    key: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.equals()
  equals(
    value: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.anyOf()

  anyOf: ValuesOf<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.notEqual()
  notEqual(
    value: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.noneOf()
  noneOf: ValuesOf<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey
  >;

  // https://dexie.org/docs/WhereClause/WhereClause.inAnyRange()
  inAnyRange(
    ranges: ReadonlyArray<[TKey, TKey]>,
    options?: {
      includeLowers?: boolean;
      includeUppers?: boolean;
    }
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
}

interface Prefixes<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKeyLookup extends KeyLookup,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey
> {
  (prefixes: string[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  (...prefixes: string[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
}

interface ValuesOf<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  Key,
  TKeyLookup extends KeyLookup,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey
> {
  (values: readonly Key[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  (...values: readonly Key[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    Key,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
}

interface WhereStringClause<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKeyLookup extends KeyLookup,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey
> {
  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  anyOfIgnoreCase: ValuesOf<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey
  >;

  // https://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
  equalsIgnoreCase(
    value: string
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWith()
  // goes throug between(str, str + maxString, true, true); where maxString = String.fromCharCode(65535);
  startsWith(
    prefix: string
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithIgnoreCase()
  startsWithIgnoreCase(
    prefix: string
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOf()
  startsWithAnyOf: Prefixes<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey
  >;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOfIgnoreCase()
  startsWithAnyOfIgnoreCase: Prefixes<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey
  >;
}
