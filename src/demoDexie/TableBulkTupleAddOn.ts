import Dexie, {
  type IndexableType,
  type PromiseExtended,
  type Table,
} from "dexie";
import type { PrimaryKey, PromiseExtendedPKeyOrKeys } from "./primarykey";
import type { NoExcessDataPropertiesArray } from "./utilitytypes";
import { aliasMethodTs } from "./utils";

export interface TableInboundBaseBulkTuple<
  TDatabase,
  TPKeyPathOrPaths,
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
  TPKeyPathOrPaths,
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

export interface TableOutboundBulkTuple<TInsert, TPKey extends IndexableType> {
  bulkAddTuple<TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>,
    keys: readonly TPKey[]
  ): PromiseExtended<TPKey>;

  bulkPutTuple<TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>,
    keys: readonly TPKey[]
  ): PromiseExtended<TPKey>;
}

export interface TableOutboundAutoBulkTuple<
  TInsert,
  TPKey extends IndexableType
> {
  bulkAddTuple<TArr extends readonly [...any[]], B extends boolean = false>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>,
    options?: {
      allKeys: B;
    }
  ): PromiseExtendedPKeyOrKeys<TPKey, B>;

  bulkAddTuple<TArr extends readonly [...any[]], B extends boolean = false>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>,
    keys: readonly (TPKey | undefined)[],
    options?: {
      allKeys: B;
    }
  ): PromiseExtendedPKeyOrKeys<TPKey, B>;

  bulkPutTuple<TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>,
    keys: readonly TPKey[]
  ): PromiseExtended<TPKey>;

  bulkPutTuple<TArr extends readonly [...any[]], B extends boolean = false>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>,
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
  aliasMethodTs(tablePrototype, "bulkAddTuple", "bulkAdd");
  aliasMethodTs(tablePrototype, "bulkPutTuple", "bulkPut");
}
