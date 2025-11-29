import type {
  TableSchema,
  DBCoreTable,
  PromiseExtended,
  ThenShortcut,
} from "dexie";
import type { ChangeCallback, Collection } from "./Collection";
import type {
  DexieIndexPaths,
  IndexPath,
  KeyForIndexPath,
  IndexPathForPath,
  IndexPathRegistry,
} from "./indexpaths";
import type {
  DexiePrimaryKeyPathOrPaths,
  PrimaryKey,
  PrimaryKeyId,
} from "./primarykey";
import type { TableHooks } from "./TableHooks";
import type { Level2, UpdateSpec } from "./UpdateSpec";
import type { BulkUpdate } from "./BulkUpdate";
import type { UpsertSpec } from "./UpsertSpec";
import type { WhereClauses } from "./where";

export interface TableCore<
  TName extends string,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TPkey,
  TKeyLookup extends IndexPathRegistry<TDatabase, TIndexPaths>,
  TDexie
> {
  db: TDexie;
  lookup: TKeyLookup;
  readonly name: TName;
  schema: TableSchema;
  // todo TGet needs to be mapped to TExisting - TGet if entity class is incorrect
  hook: TableHooks<TDatabase, TGet, TPkey>;
  core: DBCoreTable;

  // todo object overload
  get(key: TPkey): PromiseExtended<TGet | undefined>;
  get<R>(
    key: TPkey,
    thenShortcut: ThenShortcut<TGet | undefined, R>
  ): PromiseExtended<R>;
  bulkGet(keys: TPkey[]): PromiseExtended<(TGet | undefined)[]>;

  filter: ReturnType<this["toCollection"]>["and"];
  count: ReturnType<this["toCollection"]>["count"];

  offset: ReturnType<this["toCollection"]>["offset"];
  limit: ReturnType<this["toCollection"]>["limit"];

  each: ReturnType<this["toCollection"]>["each"];

  toArray: ReturnType<this["toCollection"]>["toArray"];
  toCollection(): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TPkey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  orderBy<Path extends IndexPath<TDatabase, TIndexPaths[number]>>(
    index: Path
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    KeyForIndexPath<TDatabase, IndexPathForPath<TDatabase, TIndexPaths, Path>>,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  orderBy(
    id: PrimaryKeyId
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TPkey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
  reverse: ReturnType<this["toCollection"]>["reverse"];

  delete(key: TPkey): PromiseExtended<void>;
  bulkDelete(keys: TPkey[]): PromiseExtended<void>;
  clear(): PromiseExtended<void>;

  // https://dexie.org/docs/Table/Table.update()
  update<TMAXDEPTH extends string = Level2>(
    key: PrimaryKey<TDatabase, TPKeyPathOrPaths>,
    changes: UpdateSpec<TDatabase, TMAXDEPTH>
  ): PromiseExtended<0 | 1>;
  update(
    key: PrimaryKey<TDatabase, TPKeyPathOrPaths>,
    changes: ChangeCallback<
      TDatabase,
      TInsert,
      PrimaryKey<TDatabase, TPKeyPathOrPaths>
    >
  ): PromiseExtended<0 | 1>;

  bulkUpdate<TMAXDEPTH extends string = Level2>(
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
    key: TPkey,
    spec: UpsertSpec<TDatabase, TPKeyPathOrPaths>
  ): PromiseExtended<boolean>;
}
export type TableBase<
  TName extends string,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TPkey,
  TDexie = any,
  TKeyLookup extends IndexPathRegistry<
    TDatabase,
    TIndexPaths
  > = IndexPathRegistry<TDatabase, TIndexPaths>
> = TableCore<
  TName,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths,
  TIndexPaths,
  TPkey,
  TKeyLookup,
  TDexie
> &
  WhereClauses<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    TKeyLookup,
    TDexie,
    TPKeyPathOrPaths
  >;
