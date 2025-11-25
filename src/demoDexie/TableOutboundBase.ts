import type { IndexableType, PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { TableBase } from "./TableBase";
import type { NoExcessDataProperties } from "./utilitytypes";

export interface TableOutboundBase<
  TName extends string,
  TDatabase,
  TPKey extends IndexableType,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet
> extends TableBase<
    TName,
    TGet,
    TDatabase,
    TDatabase,
    never,
    TIndexPaths,
    TPKey
  > {
  put<T extends TDatabase>(
    item: NoExcessDataProperties<T, TDatabase>,
    key: TPKey
  ): PromiseExtended<TPKey>;
}
