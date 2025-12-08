import type { IndexableType, PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { TableBase } from "./TableBase";
import type { NoExcessDataProperties } from "./utilitytypes";

export type TableOutboundBase<
  TName extends string,
  TDatabase,
  TInsert,
  TPKey extends IndexableType,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TDexie,
  TMaxDepth extends string
> = TableBase<
  TName,
  TGet,
  TDatabase,
  TInsert,
  never,
  TIndexPaths,
  TPKey,
  TDexie,
  TMaxDepth
> & {
  /*
   making the key required, although allowed by the spec to be optional for auto-increment keys
   use add without a key on TableOutboundAuto for that case
   */
  put<T extends TInsert>(
    item: NoExcessDataProperties<T, TInsert>,
    key: TPKey
  ): PromiseExtended<TPKey>;
};
