import type { DexieIndexPaths } from "./indexpaths";
import type { PrimaryKey, PromiseExtendedPKeyOrKeys } from "./primarykey";
import type { TableInboundBase } from "./TableInboundBase";
import type { TableInboundAutoAdd } from "./AddAutoReturnObjectAddOn";
import type { TableInboundAutoBulkTuple } from "./TableBulkTupleAddOn";

export type TableInboundAuto<
  TName extends string,
  TDatabase,
  TPKeyPathOrPaths,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TInsert,
  TDexie,
  TMaxDepth extends string
> = TableInboundBase<
  TName,
  TDatabase,
  TPKeyPathOrPaths,
  TIndexPaths,
  TGet,
  TInsert,
  TDexie,
  TMaxDepth
> &
  TableInboundAutoAdd<TDatabase, TPKeyPathOrPaths, TInsert> &
  TableInboundAutoBulkTuple<TDatabase, TPKeyPathOrPaths, TInsert> & {
    bulkAdd<B extends boolean>(
      items: readonly TInsert[],
      options: {
        allKeys: B;
      }
    ): PromiseExtendedPKeyOrKeys<PrimaryKey<TDatabase, TPKeyPathOrPaths>, B>;
    bulkPut<B extends boolean>(
      items: readonly TInsert[],
      options: { allKeys: B }
    ): PromiseExtendedPKeyOrKeys<PrimaryKey<TDatabase, TPKeyPathOrPaths>, B>;
  };
