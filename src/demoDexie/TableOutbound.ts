import type { IndexableType, PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { NoExcessDataProperties } from "./utilitytypes";
import type { TableOutboundBase } from "./TableOutboundBase";
import type { TableOutboundBulkTuple } from "./TableBulkTupleAddOn";

export type TableOutbound<
  TName extends string,
  TDatabase,
  TPKey extends IndexableType,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet
> = TableOutboundBase<TName, TDatabase, TPKey, TIndexPaths, TGet> &
  TableOutboundBulkTuple<TDatabase, TPKey> & {
    add<T extends TDatabase>(
      item: NoExcessDataProperties<T, TDatabase>,
      key: TPKey
    ): PromiseExtended<TPKey>;
    // no need for options overloads here as the keys are always provided
    bulkAdd(
      items: readonly TDatabase[],
      keys: readonly TPKey[]
    ): PromiseExtended<TPKey>;
    bulkPut(
      items: readonly TDatabase[],
      keys: readonly TPKey[]
    ): PromiseExtended<TPKey>;
  };
