import type { PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { DexiePrimaryKeyPathOrPaths, PrimaryKey } from "./primarykey";
import type { TableInboundAutoAdd } from "./TableInboundAutoAdd";
import type { TableInboundBase } from "./TableInboundBase";

export type TableInboundAuto<
  TName extends string,
  TDatabase,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TInsert
> = TableInboundBase<
  TName,
  TDatabase,
  TPKeyPathOrPaths,
  TIndexPaths,
  TGet,
  TInsert
> &
  TableInboundAutoAdd<TDatabase, TPKeyPathOrPaths, TInsert> & {
    bulkAdd<B extends boolean>(
      items: readonly TInsert[],
      options: {
        allKeys: B;
      }
    ): PromiseExtended<
      B extends true
        ? PrimaryKey<TDatabase, TPKeyPathOrPaths>[]
        : PrimaryKey<TDatabase, TPKeyPathOrPaths>
    >;

    put(
      item: TDatabase
    ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
    // no need for other overloads as the primary key is already present on TDatabase
    bulkPut(
      items: readonly TDatabase[]
    ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  };
