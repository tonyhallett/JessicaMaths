import type { IndexableType, PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { TableBase } from "./TableBase";
import type { NoExcessDataProperties } from "./utilitytypes";

export type TableOutboundBase<
  TName extends string,
  TDatabase,
  TPKey extends IndexableType,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TDexie,
  TMaxDepth extends string
> = TableBase<
  TName,
  TGet,
  TDatabase,
  TDatabase,
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
  put<T extends TDatabase>(
    item: NoExcessDataProperties<T, TDatabase>,
    key: TPKey
  ): PromiseExtended<TPKey>;
};
