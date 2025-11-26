import type { IndexableType, PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { NoExcessDataProperties } from "./utilitytypes";
import type { TableOutboundBase } from "./TableOutboundBase";

export interface TableOutbound<
  TName extends string,
  TDatabase,
  TPKey extends IndexableType,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet
> extends TableOutboundBase<TName, TDatabase, TPKey, TIndexPaths, TGet> {
  add<T extends TDatabase>(
    item: NoExcessDataProperties<T, TDatabase>,
    key: TPKey
  ): PromiseExtended<TPKey>;
  // no need for options overloads here as the keys are always provided
  bulkAdd(items: TDatabase[], keys: TPKey[]): PromiseExtended<TPKey>;
  bulkPut(items: TDatabase[], keys: TPKey[]): PromiseExtended<TPKey>;
}
