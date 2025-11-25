import type { TableSchema, DBCoreTable, PromiseExtended } from "dexie";
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
  bulkGet(
    keys: PrimaryKey<TDatabase, TPKeyPathOrPaths>[]
  ): PromiseExtended<(TGet | undefined)[]>;

  // filter(fn: (obj: T) => boolean): PrimaryKeyCollection<T, TKey, TIndexes>;
  // this.toCollection().and(filterFunction);
  filter: PrimaryKeyCollection<
    TGet,
    TDatabase,
    TInsert,
    TPKeyPathOrPaths,
    TIndexPaths
  >["and"];
  count(): PromiseExtended<number>;

  offset(
    n: number
  ): PrimaryKeyCollection<
    TGet,
    TDatabase,
    TInsert,
    TPKeyPathOrPaths,
    TIndexPaths
  >;
  limit(
    n: number
  ): PrimaryKeyCollection<
    TGet,
    TDatabase,
    TInsert,
    TPKeyPathOrPaths,
    TIndexPaths
  >;

  // this.toCollection().each(callback);
  each: PrimaryKeyCollection<
    TGet,
    TDatabase,
    TInsert,
    TPKeyPathOrPaths,
    TIndexPaths
  >["each"];

  // this.toCollection().toArray(thenShortcut);
  // toArray(): PromiseExtended<Array<T>>;
  toArray: PrimaryKeyCollection<
    TGet,
    TDatabase,
    TInsert,
    TPKeyPathOrPaths,
    TIndexPaths
  >["toArray"];
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
  reverse(): PrimaryKeyCollection<
    TGet,
    TDatabase,
    TInsert,
    TPKeyPathOrPaths,
    TIndexPaths
  >;
  // remove mapToClass as this is done with the builder / factory
  delete(key: PrimaryKey<TDatabase, TPKeyPathOrPaths>): PromiseExtended<void>;
  bulkDelete(
    keys: PrimaryKey<TDatabase, TPKeyPathOrPaths>[]
  ): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
}
