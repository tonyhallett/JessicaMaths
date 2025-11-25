import { type KeyPathValue, type PromiseExtended } from "dexie";
import type { ChangeCallback } from "./Collection";
import type { DexieIndexPaths } from "./indexpaths";
import type { WhereClausesFromIndexes } from "./where";
import type { UpdateSpec } from "./UpdateSpec";
import type { DexiePrimaryKeyPathOrPaths, PrimaryKey } from "./primarykey";
import type { TableInboundBase } from "./TableInboundBase";
import type { UpsertSpec } from "./UpsertSpec";
import type { BulkUpdate } from "./BulkUpdate";

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
  // https://dexie.org/docs/Table/Table.update()
  update<TMAXDEPTH extends string = "II">(
    key: PrimaryKey<TDatabase, TPKeyPathOrPaths>,
    changes: UpdateSpec<TDatabase, TMAXDEPTH>
  ): PromiseExtended<0 | 1>;
  update(
    key: PrimaryKey<TDatabase, TPKeyPathOrPaths>,
    changes: ChangeCallback<TDatabase>
  ): PromiseExtended<0 | 1>;
  // note that docs do not mention this ( as the key must exist on the object - so ok for this table type )
  update<TMAXDEPTH extends string = "II">(
    object: TDatabase,
    changes: UpdateSpec<TDatabase, TMAXDEPTH>
  ): PromiseExtended<0 | 1>;
  update(
    object: TDatabase,
    changes: ChangeCallback<TDatabase>
  ): PromiseExtended<0 | 1>;
  bulkUpdate<TMAXDEPTH extends string = "II">(
    changes: BulkUpdate<TDatabase, TPKeyPathOrPaths, TMAXDEPTH>[]
  ): PromiseExtended<number>;
  /*
    dexie typescript incorrectly allows T for the key
    upsert(key: TKey | T, changes: UpdateSpec<TInsertType>): PromiseExtended<boolean>;
    dexie internal typescript
    https://github.com/dexie/Dexie.js/blob/761a93313b34640cc7ea8fb550ee67f1d8610f7c/src/classes/table/table.ts#L345
    upsert(key: IndexableType, modifications: { [keyPath: string]: any; }): PromiseExtended<boolean>

    purpose of UpsertSpec is to ensure that when there is no item with key
    we can only insert an item that is valid for the table
    todo look at typing with dotted paths too
  */
  upsert(
    key: PrimaryKey<TDatabase, TPKeyPathOrPaths>,
    spec: UpsertSpec<TDatabase, TPKeyPathOrPaths>
  ): PromiseExtended<boolean>;
} & WhereClausesFromIndexes<
    TGet,
    TDatabase,
    TDatabase,
    KeyPathValue<TDatabase, TPKeyPathOrPaths>,
    TIndexPaths
  >;
