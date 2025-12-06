import { type PromiseExtended } from "dexie";
import type { ChangeCallback } from "./Collection";
import type { DexieIndexPaths } from "./indexpaths";
import type { Level2, UpdateSpec } from "./UpdateSpec";
import type { PrimaryKey } from "./primarykey";
import type { TableInboundBase } from "./TableInboundBase";

export type TableInbound<
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
> & {
  // note that docs do not mention this ( as the key must exist on the object - so ok for this table type )
  update(
    object: TDatabase,
    changes: UpdateSpec<TDatabase, TMaxDepth>
  ): PromiseExtended<0 | 1>;
  update(
    object: TDatabase,
    changes: ChangeCallback<
      TDatabase,
      TInsert,
      PrimaryKey<TDatabase, TPKeyPathOrPaths>
    >
  ): PromiseExtended<0 | 1>;
};
