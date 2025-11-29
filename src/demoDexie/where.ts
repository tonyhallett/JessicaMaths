import type { Collection } from "./Collection";
import type { DexieIndexPaths, IndexPathRegistry } from "./indexpaths";
import type {
  DexiePrimaryKeyPathOrPaths,
  PrimaryKeyId,
  PrimaryKeyRegistry,
} from "./primarykey";

export type KeyTypeForPath<
  TPathLookup extends readonly { path: any; keyType: any }[],
  TPath
> = Extract<TPathLookup[number], { path: TPath }>["keyType"];

export type WhereClauses<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKeyLookup extends IndexPathRegistry<TDatabase, DexieIndexPaths<TDatabase>>,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey,
  TPKeyLookup extends PrimaryKeyRegistry<TPKeyPathOrPaths, TPKey>
> = {
  /* where(
    primaryKey: TPKeyPathOrPaths
  ): WhereClause<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TPKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey
  >;*/
  where(
    primaryKeyId: PrimaryKeyId
  ): WhereClause<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TPKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey,
    TPKeyLookup
  >;
  where<TPKeyPath extends TPKeyLookup[number]["path"]>(
    index: TPKeyPath
  ): WhereClause<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    KeyTypeForPath<TPKeyLookup, TPKeyPath>,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey,
    TPKeyLookup
  >;
  // includes virtual indexes
  where<TIndex extends TKeyLookup[number]["path"]>(
    index: TIndex
  ): WhereClause<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    KeyTypeForPath<TKeyLookup, TIndex>,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey,
    TPKeyLookup
  >;
};

type CollectionKey<TCurrent, TKey> = [TCurrent] extends [undefined]
  ? TKey
  : TCurrent | TKey;

export type WhereClause<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  TKey,
  TKeyLookup extends IndexPathRegistry<TDatabase, DexieIndexPaths<TDatabase>>,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey, // this will union with TKey,
  TPKeyLookup extends PrimaryKeyRegistry<TPKeyPathOrPaths, TPkey>
> = WhereClauseNonStrings<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  TKey,
  TKeyLookup,
  TDexie,
  TPKeyPathOrPaths,
  CollectionKey<TCollectionKey, TKey>, // necessary due to Collection or,
  TPKeyLookup
> & { db: TDexie } & (Extract<TKey, string> extends never
    ? {}
    : WhereStringClause<
        TGet,
        TDatabase,
        TInsert,
        TPkey,
        TKeyLookup,
        TDexie,
        TPKeyPathOrPaths,
        CollectionKey<TCollectionKey, string>, // necessary due to Collection or
        TPKeyLookup
      >);
export interface WhereClauseNonStrings<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  TKey,
  TKeyLookup extends IndexPathRegistry<TDatabase, DexieIndexPaths<TDatabase>>,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey,
  TPKeyLookup extends PrimaryKeyRegistry<TPKeyPathOrPaths, TPkey>
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
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.above()
  above(
    value: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.aboveOrEqual()
  aboveOrEqual(
    value: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.below()
  below(
    value: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.belowOrEqual()
  belowOrEqual(
    key: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.equals()
  equals(
    value: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.anyOf()

  anyOf: ValuesOf<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.notEqual()
  notEqual(
    value: TKey
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.noneOf()
  noneOf: ValuesOf<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey,
    TPKeyLookup
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
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
}

interface Prefixes<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  TKeyLookup extends IndexPathRegistry<TDatabase, DexieIndexPaths<TDatabase>>,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey,
  TPKeyLookup extends PrimaryKeyRegistry<TPKeyPathOrPaths, TPkey>
> {
  (prefixes: string[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  (...prefixes: string[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
}

interface ValuesOf<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  Key,
  TKeyLookup extends IndexPathRegistry<TDatabase, DexieIndexPaths<TDatabase>>,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey,
  TPKeyLookup extends PrimaryKeyRegistry<TPKeyPathOrPaths, TPkey>
> {
  (values: readonly Key[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  (...values: readonly Key[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    Key,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
}

interface WhereStringClause<
  TGet,
  TDatabase,
  TInsert,
  TPkey,
  TKeyLookup extends IndexPathRegistry<TDatabase, DexieIndexPaths<TDatabase>>,
  TDexie,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TCollectionKey,
  TPKeyLookup extends PrimaryKeyRegistry<TPKeyPathOrPaths, TPkey>
> {
  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  anyOfIgnoreCase: ValuesOf<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey,
    TPKeyLookup
  >;

  // https://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
  equalsIgnoreCase(
    value: string
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWith()
  // goes throug between(str, str + maxString, true, true); where maxString = String.fromCharCode(65535);
  startsWith(
    prefix: string
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithIgnoreCase()
  startsWithIgnoreCase(
    prefix: string
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TCollectionKey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TPKeyLookup
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOf()
  startsWithAnyOf: Prefixes<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey,
    TPKeyLookup
  >;

  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOfIgnoreCase()
  startsWithAnyOfIgnoreCase: Prefixes<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey,
    TPKeyLookup
  >;
}
