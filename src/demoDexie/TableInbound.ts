import { type PromiseExtended } from "dexie";
import type { ChangeCallback } from "./Collection";
import type { DexieIndexPaths } from "./indexpaths";
import type { WhereClauses } from "./where";
import type { UpdateSpec } from "./UpdateSpec";
import type { DexiePrimaryKeyPathOrPaths, PrimaryKey } from "./primarykey";
import type { TableInboundBase } from "./TableInboundBase";

export type TableInbound<
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
> & {
  // note that docs do not mention this ( as the key must exist on the object - so ok for this table type )
  update<TMAXDEPTH extends string = "II">(
    object: TDatabase,
    changes: UpdateSpec<TDatabase, TMAXDEPTH>
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
