import type { IndexableType, PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { NoExcessDataProperties } from "./utilitytypes";
import type { TableOutboundBase } from "./TableOutboundBase";

type PromiseExtendedKeyOrKeys<TPKey, B extends boolean> = PromiseExtended<
  B extends true ? TPKey[] : TPKey
>;

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

  bulkAdd<B extends boolean = false>(
    items: readonly TDatabase[],
    options?: {
      allKeys: B;
    }
  ): PromiseExtendedKeyOrKeys<TPKey, B>;

  bulkAdd<B extends boolean = false>(
    items: readonly TDatabase[],
    keys: (TPKey | undefined)[],
    options?: {
      allKeys: B;
    }
  ): PromiseExtendedKeyOrKeys<TPKey, B>;

  bulkPut(items: TDatabase[], keys: TPKey[]): PromiseExtended<TPKey>;

  bulkPut<B extends boolean = false>(
    items: TDatabase[],
    keys: (TPKey | undefined)[],
    options: { allKeys: B }
  ): PromiseExtendedKeyOrKeys<TPKey, B>;
}
