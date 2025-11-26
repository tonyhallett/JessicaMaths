import Dexie, {
  type IndexableType,
  type PromiseExtended,
  type Table,
} from "dexie";
import type {
  DexiePrimaryKeyPathOrPaths,
  PrimaryKey,
  PromiseExtendedPKeyOrKeys,
} from "./primarykey";
import type { NoExcessDataPropertiesArray } from "./utilitytypes";

export interface TableInboundBaseBulkTuple<
  TDatabase,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TInsert
> {
  bulkAddTuple<TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  bulkPutTuple<TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
}

export interface TableInboundAutoBulkTuple<
  TDatabase,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TInsert
> {
  bulkAddTuple<B extends boolean, TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>,
    options: {
      allKeys: B;
    }
  ): PromiseExtendedPKeyOrKeys<PrimaryKey<TDatabase, TPKeyPathOrPaths>, B>;
  bulkPutTuple<B extends boolean, TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>,
    options: {
      allKeys: B;
    }
  ): PromiseExtendedPKeyOrKeys<PrimaryKey<TDatabase, TPKeyPathOrPaths>, B>;
}

export interface TableOutboundBulkTuple<
  TDatabase,
  TPKey extends IndexableType
> {
  bulkAddTuple<TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TDatabase>,
    keys: readonly TPKey[]
  ): PromiseExtended<TPKey>;

  bulkPutTuple<TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TDatabase>,
    keys: readonly TPKey[]
  ): PromiseExtended<TPKey>;
}

export interface TableOutboundAutoBulkTuple<
  TDatabase,
  TPKey extends IndexableType
> {
  bulkAddTuple<TArr extends readonly [...any[]], B extends boolean = false>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TDatabase>,
    options?: {
      allKeys: B;
    }
  ): PromiseExtendedPKeyOrKeys<TPKey, B>;

  bulkAddTuple<TArr extends readonly [...any[]], B extends boolean = false>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TDatabase>,
    keys: readonly (TPKey | undefined)[],
    options?: {
      allKeys: B;
    }
  ): PromiseExtendedPKeyOrKeys<TPKey, B>;

  bulkPutTuple<TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TDatabase>,
    keys: readonly TPKey[]
  ): PromiseExtended<TPKey>;

  bulkPutTuple<TArr extends readonly [...any[]], B extends boolean = false>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TDatabase>,
    keys: readonly (TPKey | undefined)[],
    options: { allKeys: B }
  ): PromiseExtendedPKeyOrKeys<TPKey, B>;
}

export function TableBulkTupleAddOn(db: Dexie) {
  const tablePrototype = db.Table.prototype as Table &
    TableInboundBaseBulkTuple<any, any, any> &
    TableInboundAutoBulkTuple<any, any, any> &
    TableOutboundBulkTuple<any, any> &
    TableOutboundAutoBulkTuple<any, any>;

  tablePrototype.bulkAddTuple = function (
    this: Table,
    items: readonly any[],
    keysOrOptions?: any,
    options?: { allKeys: boolean }
  ): PromiseExtended<any> {
    return db.Table.prototype.bulkAdd.call(
      this,
      items,
      keysOrOptions,
      options as any
    );
  };
  tablePrototype.bulkPutTuple = function (
    this: Table,
    items: readonly any[],
    keysOrOptions?: any,
    options?: { allKeys: boolean }
  ): PromiseExtended<any> {
    return db.Table.prototype.bulkPut.call(
      this,
      items,
      keysOrOptions,
      options as any
    );
  };
}
