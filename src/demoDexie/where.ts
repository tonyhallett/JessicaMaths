import type { Collection } from "./Collection";
import type { PrimaryKeyPathOrPaths } from "./primarykey";
import type { PathKeyTypes } from "./utilitytypes";
import type { EqualityKeyTypes, KeyTypeForEquality } from "./whereEquality";

type KeyTypeForPath<TPathLookup extends PathKeyTypes, TPath> = Extract<
  TPathLookup[number],
  { path: TPath }
>["keyType"];

type IsExactly<A, B> = (<T>() => T extends A ? 1 : 2) extends <
  T
>() => T extends B ? 1 : 2
  ? true
  : false;

/* type KeyTypeForEquality<
  TLookup extends EqualityKeyTypes,
  TEquality
> = TLookup[number] extends infer Entry
  ? Entry extends { equality: infer E; keyType: infer K }
    ? IsExactly<E, TEquality> extends true
      ? K
      : never
    : never
  : never; */

export interface WhereClauses<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TWherePathKeyTypes extends PathKeyTypes,
  TWhereEqualityKeyTypes extends EqualityKeyTypes,
  TDexie,
  TPKeyPathOrPaths extends PrimaryKeyPathOrPaths,
  TCollectionKey
> {
  where<TPath extends TWherePathKeyTypes[number]["path"]>(
    indexOrPrimaryKeyPath: TPath
  ): WhereClause<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    KeyTypeForPath<TWherePathKeyTypes, TPath>,
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey
  >;
}

export interface WhereClausesEquality<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TWherePathKeyTypes extends PathKeyTypes,
  TWhereEqualityKeyTypes extends EqualityKeyTypes,
  TDexie,
  TPKeyPathOrPaths extends PrimaryKeyPathOrPaths,
  TCollectionKey
> {
  where<
    TEquality extends TWhereEqualityKeyTypes[number]["equality"],
    TKey = KeyTypeForEquality<TWhereEqualityKeyTypes, TEquality>
  >(
    equality: TEquality
  ): [TKey] extends [never]
    ? never
    : Collection<
        TGet,
        TDatabase,
        TInsert,
        TPKey,
        CollectionKey<TCollectionKey, TKey>,
        TWherePathKeyTypes,
        TWhereEqualityKeyTypes,
        TDexie,
        TPKeyPathOrPaths
      >;
  whereEquality: this["where"];
}

type CollectionKey<TCurrent, TKey> = [TCurrent] extends [undefined]
  ? TKey
  : TCurrent | TKey;

export type PathsOf<Lookup extends PathKeyTypes> = Lookup[number]["path"];

export type WhereClause<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKey,
  TWherePathKeyTypes extends PathKeyTypes,
  TWhereEqualityKeyTypes extends EqualityKeyTypes,
  TDexie,
  TPKeyPathOrPaths extends PrimaryKeyPathOrPaths,
  TCollectionKey // this will union with TKey,
> = WhereClauseNonStrings<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TKey,
  TWherePathKeyTypes,
  TWhereEqualityKeyTypes,
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
        TWherePathKeyTypes,
        TWhereEqualityKeyTypes,
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
  TWherePathKeyTypes extends PathKeyTypes,
  TWhereEqualityKeyTypes extends EqualityKeyTypes,
  TDexie,
  TPKeyPathOrPaths extends PrimaryKeyPathOrPaths,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
    TDexie,
    TPKeyPathOrPaths
  >;
}

interface Prefixes<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TWherePathKeyTypes extends PathKeyTypes,
  TWhereEqualityKeyTypes extends EqualityKeyTypes,
  TDexie,
  TPKeyPathOrPaths extends PrimaryKeyPathOrPaths,
  TCollectionKey
> {
  (prefixes: string[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
    TDexie,
    TPKeyPathOrPaths
  >;
  (...prefixes: string[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
  TWherePathKeyTypes extends PathKeyTypes,
  TWhereEqualityKeyTypes extends EqualityKeyTypes,
  TDexie,
  TPKeyPathOrPaths extends PrimaryKeyPathOrPaths,
  TCollectionKey
> {
  (values: readonly Key[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
    TDexie,
    TPKeyPathOrPaths
  >;
  (...values: readonly Key[]): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    Key,
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
    TDexie,
    TPKeyPathOrPaths
  >;
}

interface WhereStringClause<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TWherePathKeyTypes extends PathKeyTypes,
  TWhereEqualityKeyTypes extends EqualityKeyTypes,
  TDexie,
  TPKeyPathOrPaths extends PrimaryKeyPathOrPaths,
  TCollectionKey
> {
  //https://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
  anyOfIgnoreCase: ValuesOf<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TCollectionKey,
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
    TDexie,
    TPKeyPathOrPaths
  >;
  // https://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOf()
  startsWithAnyOf: Prefixes<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
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
    TWherePathKeyTypes,
    TWhereEqualityKeyTypes,
    TDexie,
    TPKeyPathOrPaths,
    TCollectionKey
  >;
}
