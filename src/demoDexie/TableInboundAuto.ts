import type { PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { DexiePrimaryKeyPathOrPaths, PrimaryKey } from "./primarykey";
import type { TableInboundBase } from "./TableInboundBase";
import type { TableInboundAutoAdd } from "./AddAutoReturnObjectAddOn";

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
  };
