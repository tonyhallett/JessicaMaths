import type { IndexableType, PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { NoExcessDataProperties } from "./utilitytypes";
import type { TableOutboundBase } from "./TableOutboundBase";

export interface TableOutboundAuto<
  TName extends string,
  TDatabase,
  TPKey extends IndexableType,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet
> extends TableOutboundBase<TName, TDatabase, TPKey, TIndexPaths, TGet> {
  add<T extends TDatabase>(
    item: NoExcessDataProperties<T, TDatabase>,
    key?: TPKey
  ): PromiseExtended<TPKey>;
}
