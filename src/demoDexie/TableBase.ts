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
import type { DexiePrimaryKeyPathOrPaths, PrimaryKey } from "./primarykey";
import type { TableHooks } from "./TableHooks";

export interface TableBase<
  TName extends string,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TPkey
> {
  //db: Dexie;
  name: TName;
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
    TIndexPaths
  >;
  orderBy<Path extends IndexPath<TDatabase, TIndexPaths[number]>>(
    index: Path
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPkey,
    KeyForIndexPath<TDatabase, IndexPathForPath<TDatabase, TIndexPaths, Path>>,
    TIndexPaths
  >;
  reverse: ReturnType<this["toCollection"]>["reverse"];
  // remove mapToClass as this is done with the builder / factory
  delete(key: TPkey): PromiseExtended<void>;
  bulkDelete(keys: TPkey[]): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
}
