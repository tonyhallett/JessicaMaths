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
  PrimaryKey,
  PrimaryKeyId,
  PrimaryKeyRegistry,
} from "./primarykey";
import type { TableHooks } from "./TableHooks";
import type { UpdateSpec } from "./UpdateSpec";
import type { BulkUpdate } from "./BulkUpdate";
import type { UpsertSpec } from "./UpsertSpec";
import type { WherePaths, WhereEquality } from "./where";
import type { PathKeyTypes, PathKeyType, NoDescend } from "./utilitytypes";
import type {
  EqualityRegistryLookup,
  IsValidEquality,
  WhereEqualityRegistryLookup,
} from "./whereEquality";

type PathRegistry<
  TDatabase,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TPKeyPathOrPaths,
  TPKey
> = readonly [
  ...IndexPathRegistry<TDatabase, TIndexPaths>,
  ...PrimaryKeyRegistry<TPKeyPathOrPaths, TPKey>,
  PathKeyType<PrimaryKeyId, TPKey>
];

export interface TableGetEquality<
  TDatabase,
  TGet,
  TEqualityRegistryLookup extends EqualityRegistryLookup
> {
  get<TEquality extends TEqualityRegistryLookup["all"][number]["equality"]>(
    equality: TEquality
  ): IsValidEquality<
    TEqualityRegistryLookup["all"],
    TEqualityRegistryLookup["singleLookup"],
    TEquality
  > extends true
    ? PromiseExtended<TGet | undefined>
    : never;
  get<R, TEquality extends TEqualityRegistryLookup["all"][number]["equality"]>(
    equality: TEquality,
    thenShortcut: ThenShortcut<TGet | undefined, R>
  ): IsValidEquality<
    TEqualityRegistryLookup["all"],
    TEqualityRegistryLookup["singleLookup"],
    TEquality
  > extends true
    ? PromiseExtended<R>
    : never;

  getEquality<
    TEquality extends TEqualityRegistryLookup["all"][number]["equality"]
  >(
    equality: TEquality
  ): IsValidEquality<
    TEqualityRegistryLookup["all"],
    TEqualityRegistryLookup["singleLookup"],
    TEquality
  > extends true
    ? PromiseExtended<TGet | undefined>
    : never;

  getEquality<
    R,
    TEquality extends TEqualityRegistryLookup["all"][number]["equality"]
  >(
    equality: TEquality,
    thenShortcut: ThenShortcut<TGet | undefined, R>
  ): IsValidEquality<
    TEqualityRegistryLookup["all"],
    TEqualityRegistryLookup["singleLookup"],
    TEquality
  > extends true
    ? PromiseExtended<R>
    : never;

  getCompositeEquality<
    TEquality extends TEqualityRegistryLookup["composite"][number]["equality"]
  >(
    equality: TEquality
  ): IsValidEquality<
    TEqualityRegistryLookup["composite"],
    TEqualityRegistryLookup["singleLookup"],
    TEquality
  > extends true
    ? PromiseExtended<TGet | undefined>
    : never;

  getCompositeEquality<
    R,
    TEquality extends TEqualityRegistryLookup["composite"][number]["equality"]
  >(
    equality: TEquality,
    thenShortcut: ThenShortcut<TGet | undefined, R>
  ): IsValidEquality<
    TEqualityRegistryLookup["composite"],
    TEqualityRegistryLookup["singleLookup"],
    TEquality
  > extends true
    ? PromiseExtended<R>
    : never;

  getSingleEquality<
    TEquality extends TEqualityRegistryLookup["single"][number]["equality"]
  >(
    equality: TEquality
  ): IsValidEquality<
    TEqualityRegistryLookup["single"],
    TEqualityRegistryLookup["singleLookup"],
    TEquality
  > extends true
    ? PromiseExtended<TGet | undefined>
    : never;

  getSingleEquality<
    R,
    TEquality extends TEqualityRegistryLookup["single"][number]["equality"]
  >(
    equality: TEquality,
    thenShortcut: ThenShortcut<TGet | undefined, R>
  ): IsValidEquality<
    TEqualityRegistryLookup["single"],
    TEqualityRegistryLookup["singleLookup"],
    TEquality
  > extends true
    ? PromiseExtended<R>
    : never;

  getSingleFilterEquality<
    TEquality extends TEqualityRegistryLookup["single"][number]["equality"]
  >(
    equality: TEquality,
    equalityFilter: TEqualityRegistryLookup["equalityFilterType"]
  ): IsValidEquality<
    TEqualityRegistryLookup["single"],
    TEqualityRegistryLookup["singleLookup"],
    TEquality
  > extends true
    ? PromiseExtended<TGet | undefined>
    : never;

  getSingleFilterEquality<
    R,
    TEquality extends TEqualityRegistryLookup["single"][number]["equality"]
  >(
    equality: TEquality,
    equalityFilter: TEqualityRegistryLookup["equalityFilterType"],
    thenShortcut: ThenShortcut<TGet | undefined, R>
  ): IsValidEquality<
    TEqualityRegistryLookup["single"],
    TEqualityRegistryLookup["singleLookup"],
    TEquality
  > extends true
    ? PromiseExtended<R>
    : never;
}

export interface TableGetKey<TGet, TPKey> {
  get(key: TPKey): PromiseExtended<TGet | undefined>;
  get<R>(
    key: TPKey,
    thenShortcut: ThenShortcut<TGet | undefined, R>
  ): PromiseExtended<R>;
  bulkGet(keys: TPKey[]): PromiseExtended<(TGet | undefined)[]>;
}

type TableGet<
  TDatabase,
  TGet,
  TPKey,
  TEqualityRegistryLookup extends EqualityRegistryLookup
> = TableGetKey<TGet, TPKey> &
  TableGetEquality<TDatabase, TGet, TEqualityRegistryLookup>;

export interface TableCore<
  TName extends string,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TPKey,
  TWherePathKeyTypes extends PathKeyTypes,
  TEqualityRegistryLookup extends EqualityRegistryLookup,
  TDexie,
  TMaxDepth extends string
> {
  db: TDexie;
  readonly name: TName;
  schema: TableSchema;
  hook: TableHooks<TDatabase, TGet, TPKey>;
  core: DBCoreTable;

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
    TWherePathKeyTypes,
    TEqualityRegistryLookup,
    TDexie,
    TPKeyPathOrPaths,
    TMaxDepth
  >;
  orderBy<Path extends IndexPath<TDatabase, TIndexPaths[number]>>(
    index: Path
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    KeyForIndexPath<TDatabase, IndexPathForPath<TDatabase, TIndexPaths, Path>>,
    TWherePathKeyTypes,
    TEqualityRegistryLookup,
    TDexie,
    TPKeyPathOrPaths,
    TMaxDepth
  >;
  orderBy(
    id: PrimaryKeyId
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TPKey,
    TWherePathKeyTypes,
    TEqualityRegistryLookup,
    TDexie,
    TPKeyPathOrPaths,
    TMaxDepth
  >;
  reverse: ReturnType<this["toCollection"]>["reverse"];

  delete(key: TPKey): PromiseExtended<void>;
  bulkDelete(keys: TPKey[]): PromiseExtended<void>;
  clear(): PromiseExtended<void>;

  update(
    key: PrimaryKey<TDatabase, TPKeyPathOrPaths>,
    changes: UpdateSpec<TDatabase, TMaxDepth>
  ): PromiseExtended<0 | 1>;
  update(
    key: PrimaryKey<TDatabase, TPKeyPathOrPaths>,
    changes: ChangeCallback<
      TDatabase,
      TInsert,
      PrimaryKey<TDatabase, TPKeyPathOrPaths>
    >
  ): PromiseExtended<0 | 1>;

  bulkUpdate(
    changes: BulkUpdate<TDatabase, TPKeyPathOrPaths, TMaxDepth>[]
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
  TPKeyPathOrPaths,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TPKey,
  TDexie = any,
  TMaxDepth extends string = NoDescend,
  TWherePathKeyTypes extends PathKeyTypes = PathRegistry<
    TDatabase,
    TIndexPaths,
    TPKeyPathOrPaths,
    TPKey
  >,
  TEqualityRegistryLookup extends EqualityRegistryLookup = WhereEqualityRegistryLookup<
    TDatabase,
    TIndexPaths,
    TPKeyPathOrPaths,
    TPKey,
    TMaxDepth
  >
> = TableCore<
  TName,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths,
  TIndexPaths,
  TPKey,
  TWherePathKeyTypes,
  TEqualityRegistryLookup,
  TDexie,
  TMaxDepth
> &
  TableWhere<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TWherePathKeyTypes,
    TEqualityRegistryLookup,
    TDexie,
    TPKeyPathOrPaths,
    TMaxDepth
  > &
  TableGet<TDatabase, TGet, TPKey, TEqualityRegistryLookup>;

type TableWhere<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TWherePathKeyTypes extends PathKeyTypes,
  TEqualityRegistryLookup extends EqualityRegistryLookup,
  TDexie,
  TPKeyPathOrPaths,
  TMaxDepth extends string
> = WherePaths<
  TGet,
  TDatabase,
  TInsert,
  TPKey,
  TWherePathKeyTypes,
  TEqualityRegistryLookup,
  TDexie,
  TPKeyPathOrPaths,
  undefined,
  TMaxDepth
> &
  WhereEquality<
    TGet,
    TDatabase,
    TInsert,
    TPKey,
    TWherePathKeyTypes,
    TEqualityRegistryLookup,
    TDexie,
    TPKeyPathOrPaths,
    TMaxDepth
  >;
