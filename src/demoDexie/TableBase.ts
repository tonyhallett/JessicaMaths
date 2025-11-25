import type {
  TableSchema,
  DBCoreTable,
  PromiseExtended,
  ThenShortcut,
} from "dexie";
import type { Collection } from "./Collection";
import type {
  DexieIndexPaths,
  IndexPath,
  KeyForIndexPath,
  IndexPathForPath,
} from "./indexpaths";
import type {
  DexiePrimaryKeyPathOrPaths,
  PrimaryKey,
  PrimaryKeyCollection,
} from "./primarykey";
import type { TableHooks } from "./TableHooks";

export interface TableBase<
  TName extends string,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TIndexPaths extends DexieIndexPaths<TDatabase>
> {
  //db: Dexie;
  name: TName;
  schema: TableSchema;
  // todo TGet needs to be mapped to TExisting - TGet if entity class is incorrect
  hook: TableHooks<TDatabase, TGet, PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  core: DBCoreTable;

  // todo object overload
  get(
    key: PrimaryKey<TDatabase, TPKeyPathOrPaths>
  ): PromiseExtended<TGet | undefined>;
  get<R>(
    key: PrimaryKey<TDatabase, TPKeyPathOrPaths>,
    thenShortcut: ThenShortcut<TGet | undefined, R>
  ): PromiseExtended<R>;
  bulkGet(
    keys: PrimaryKey<TDatabase, TPKeyPathOrPaths>[]
  ): PromiseExtended<(TGet | undefined)[]>;

  filter: ReturnType<this["toCollection"]>["and"];
  count: ReturnType<this["toCollection"]>["count"];

  offset: ReturnType<this["toCollection"]>["offset"];
  limit: ReturnType<this["toCollection"]>["limit"];

  each: ReturnType<this["toCollection"]>["each"];

  toArray: ReturnType<this["toCollection"]>["toArray"];
  toCollection(): PrimaryKeyCollection<
    TGet,
    TDatabase,
    TInsert,
    TPKeyPathOrPaths,
    TIndexPaths
  >;
  orderBy<Path extends IndexPath<TDatabase, TIndexPaths[number]>>(
    index: Path
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    PrimaryKey<TDatabase, TPKeyPathOrPaths>,
    KeyForIndexPath<TDatabase, IndexPathForPath<TDatabase, TIndexPaths, Path>>,
    TIndexPaths
  >;
  reverse: ReturnType<this["toCollection"]>["reverse"];
  // remove mapToClass as this is done with the builder / factory
  delete(key: PrimaryKey<TDatabase, TPKeyPathOrPaths>): PromiseExtended<void>;
  bulkDelete(
    keys: PrimaryKey<TDatabase, TPKeyPathOrPaths>[]
  ): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
}
