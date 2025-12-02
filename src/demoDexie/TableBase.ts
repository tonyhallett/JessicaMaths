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
  PrimaryKeyRegistry,
} from "./primarykey";
import type { TableHooks } from "./TableHooks";
import type { Level2, UpdateSpec } from "./UpdateSpec";
import type { BulkUpdate } from "./BulkUpdate";
import type { UpsertSpec } from "./UpsertSpec";
import type { WhereClauses } from "./where";
import type { PathKeyTypes, PathKeyType } from "./utilitytypes";

type PathRegistry<
  TDatabase,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TPKey
> = readonly [
  ...IndexPathRegistry<TDatabase, TIndexPaths>,
  ...PrimaryKeyRegistry<TPKeyPathOrPaths, TPKey>,
  PathKeyType<PrimaryKeyId, TPKey>
];

export interface TableCore<
  TName extends string,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TPKey,
  TPathKeyTypes extends PathKeyTypes,
  TDexie
> {
  db: TDexie;
  readonly name: TName;
  schema: TableSchema;
  // todo TGet needs to be mapped to TExisting - TGet if entity class is incorrect
  hook: TableHooks<TDatabase, TGet, TPKey>;
  core: DBCoreTable;

  // todo object overload
  get(key: TPKey): PromiseExtended<TGet | undefined>;
  get<R>(
    key: TPKey,
    thenShortcut: ThenShortcut<TGet | undefined, R>
  ): PromiseExtended<R>;
  bulkGet(keys: TPKey[]): PromiseExtended<(TGet | undefined)[]>;

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
    TPKey,
    TPKey,
    TPathKeyTypes,
    TDexie,
    TPKeyPathOrPaths
  >;
  orderBy<Path extends IndexPath<TDatabase, TIndexPaths[number]>>(
    index: Path
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    KeyForIndexPath<TDatabase, IndexPathForPath<TDatabase, TIndexPaths, Path>>,
    TPathKeyTypes,
    TDexie,
    TPKeyPathOrPaths
  >;
  orderBy(
    id: PrimaryKeyId
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TPKey,
    TPathKeyTypes,
    TDexie,
    TPKeyPathOrPaths
  >;
  reverse: ReturnType<this["toCollection"]>["reverse"];

  delete(key: TPKey): PromiseExtended<void>;
  bulkDelete(keys: TPKey[]): PromiseExtended<void>;
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
    key: TPKey,
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
  TPKey,
  TDexie = any,
  TPathKeyTypes extends PathKeyTypes = PathRegistry<
    TDatabase,
    TIndexPaths,
    TPKeyPathOrPaths,
    TPKey
  >
> = TableCore<
  TName,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths,
  TIndexPaths,
  TPKey,
  TPathKeyTypes,
  TDexie
> &
  WhereClauses<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TPathKeyTypes,
    TDexie,
    TPKeyPathOrPaths,
    undefined
  >;
