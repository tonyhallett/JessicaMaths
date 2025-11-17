import type {
  DBCoreTable,
  KeyPathValue,
  PromiseExtended,
  PropModification,
  DexieEvent,
  DexieEventSet,
  TableSchema,
  UpdateSpec,
  Transaction,
} from "dexie";
import type { ChangeCallback, Collection } from "./Collection";
import type {
  CompoundIndexPaths,
  DexieIndexPath,
  DexieIndexPaths,
  MultiIndexPath,
  SingleIndexPath,
} from "./dexieindexes";
import type { DexiePrimaryKeyPathOrPaths } from "./tablebuilder";
import type { WhereClausesFromIndexes } from "./where";
import type { TableConfig } from "./tablebuilder";
import type { DeletePrimaryKeys, RequiredOnlyDeep } from "./utilitytypes";

export type DBTables<
  TConfig extends Record<string, TableConfig<any, any, any, any, any>>
> = {
  [TName in keyof TConfig & string]: TConfig[TName] extends TableConfig<
    infer T,
    infer PK,
    infer Auto,
    infer Indices,
    infer TGet
  >
    ? PK extends never
      ? Auto extends true
        ? never
        : never
      : Auto extends true
      ? never
      : KeyPathTable<TName, T, PK, Indices, TGet>
    : never;
};

type IndexPath<T, I extends DexieIndexPath<T>> = I extends SingleIndexPath<
  T,
  infer P
>
  ? I["path"]
  : I extends MultiIndexPath<T, infer P>
  ? I["path"]
  : I extends CompoundIndexPaths<T, infer Ps>
  ? I["paths"]
  : never;

export type KeyForIndex<T, P> =
  // Single: key is the value stored at the path
  P extends SingleIndexPath<T, infer Path>
    ? KeyPathValue<T, Path>
    : // Multi: the index points to an array field; collection key should be the element type
    P extends MultiIndexPath<T, infer Path>
    ? KeyPathValue<T, Path> extends readonly (infer Elem)[]
      ? Elem
      : KeyPathValue<T, Path>
    : // Compound: tuple of the per-path key values
    P extends CompoundIndexPaths<T, infer Paths>
    ? { [K in keyof Paths]: KeyPathValue<T, Paths[K] & string> } // keeps path order
    : never;

type ExtractSelectedIndex<
  T,
  TIndexes extends readonly DexieIndexPath<T>[],
  Path
> = TIndexes[number] extends infer I
  ? I extends SingleIndexPath<T, infer P>
    ? Path extends P
      ? I
      : never
    : I extends MultiIndexPath<T, infer P>
    ? Path extends P
      ? I
      : never
    : I extends CompoundIndexPaths<T, infer Ps>
    ? Path extends Ps
      ? I
      : never
    : never
  : never;

export type PrimaryKey<
  T,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>
> = TPKeyPathOrPaths extends readonly any[]
  ? {
      [I in keyof TPKeyPathOrPaths]: KeyPathValue<
        T,
        TPKeyPathOrPaths[I] & keyof T
      >;
    }
  : KeyPathValue<T, TPKeyPathOrPaths & keyof T>;

export type PrimaryKeyCollection<
  T,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>,
  TIndexes extends DexieIndexPaths<T>
> = Collection<
  T,
  PrimaryKey<T, TPKeyPathOrPaths>,
  PrimaryKey<T, TPKeyPathOrPaths>,
  TIndexes
>;

/*
  missing the table methods:
    get / bulkGet
    ---

    add / bulkAdd

    put / bulkPut

*/

export interface CreatingHookContext<TPKey> {
  onsuccess?: (primKey: TPKey) => void;
  onerror?: (err: any) => void;
}
export interface UpdatingHookContext<T> {
  onsuccess?: (updatedObj: T) => void;
  onerror?: (err: any) => void;
}
export interface DeletingHookContext<TPKey> {
  onsuccess?: (primKey: TPKey) => void;
  onerror?: (err: any) => void;
}

/*
  considerations
  add, put, update, delete result in these hooks
  when not add dexie does DBCoreTable.getMany for existing object.
*/
export interface TableHooks<TInsert, TExisting, TPKey> extends DexieEventSet {
  (
    eventName: "creating",
    subscriber: (
      this: CreatingHookContext<TPKey>,
      primKey: TPKey,
      insert: TInsert,
      transaction: Transaction
    ) => void | undefined | TPKey
  ): void;
  (eventName: "reading", subscriber: (obj: any) => any): void;
  (
    eventName: "updating",
    /* 
       dexie merges the return value into the modifications for the
       next subscriber in the chain
       keyPaths are used on the return value but isn't that an issue with merging ?
    */
    subscriber: (
      this: UpdatingHookContext<TExisting>,
      modifications: Object,
      primKey: TPKey,
      existing: TExisting,
      transaction: Transaction
    ) => any
  ): void;
  (
    eventName: "deleting",
    subscriber: (
      this: DeletingHookContext<TPKey>,
      primKey: TPKey,
      existing: TExisting,
      transaction: Transaction
    ) => any
  ): void;
  creating: DexieEvent;
  reading: DexieEvent;
  updating: DexieEvent;
  deleting: DexieEvent;
}

export interface TableBase<
  TName extends string,
  TGet,
  TInsert,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TInsert>,
  TIndexPaths extends DexieIndexPaths<TInsert>
> {
  //db: Dexie;
  name: TName;
  schema: TableSchema;
  // todo TGet needs to be mapped to TExisting - TGet if entity class is incorrect
  hook: TableHooks<TInsert, TGet, PrimaryKey<TInsert, TPKeyPathOrPaths>>;
  core: DBCoreTable;

  // filter(fn: (obj: T) => boolean): PrimaryKeyCollection<T, TKey, TIndexes>;
  // this.toCollection().and(filterFunction);
  filter: PrimaryKeyCollection<TInsert, TPKeyPathOrPaths, TIndexPaths>["and"];
  count(): PromiseExtended<number>;

  offset(
    n: number
  ): PrimaryKeyCollection<TInsert, TPKeyPathOrPaths, TIndexPaths>;
  limit(
    n: number
  ): PrimaryKeyCollection<TInsert, TPKeyPathOrPaths, TIndexPaths>;

  // this.toCollection().each(callback);
  each: PrimaryKeyCollection<TInsert, TPKeyPathOrPaths, TIndexPaths>["each"];

  // this.toCollection().toArray(thenShortcut);
  // toArray(): PromiseExtended<Array<T>>;
  toArray: PrimaryKeyCollection<
    TInsert,
    TPKeyPathOrPaths,
    TIndexPaths
  >["toArray"];
  toCollection(): PrimaryKeyCollection<TInsert, TPKeyPathOrPaths, TIndexPaths>;
  orderBy<Path extends IndexPath<TInsert, TIndexPaths[number]>>(
    index: Path
  ): Collection<
    TInsert,
    KeyPathValue<TInsert, TPKeyPathOrPaths>,
    KeyForIndex<TInsert, ExtractSelectedIndex<TInsert, TIndexPaths, Path>>,
    TIndexPaths
  >;
  reverse(): PrimaryKeyCollection<TInsert, TPKeyPathOrPaths, TIndexPaths>;
  mapToClass(constructor: Function): Function;

  delete(key: PrimaryKey<TInsert, TPKeyPathOrPaths>): PromiseExtended<void>;
  bulkDelete(
    keys: PrimaryKey<TInsert, TPKeyPathOrPaths>[]
  ): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
}

type PrimaryKeyPaths<
  T,
  TPKeyPathOrPths extends DexiePrimaryKeyPathOrPaths<T>
> = TPKeyPathOrPths extends readonly (infer U)[]
  ? U extends string
    ? U
    : never
  : TPKeyPathOrPths extends string
  ? TPKeyPathOrPths
  : never;
interface BulkUpdate<
  T,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>
> {
  key: PrimaryKey<T, TPKeyPathOrPaths>;
  changes: Omit<UpdateSpec<T>, PrimaryKeyPaths<T, TPKeyPathOrPaths>>;
}

type KeyPathTable<
  TName extends string,
  TInsert,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TInsert>,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TGet
> = TableBase<TName, TGet, TInsert, TPKeyPathOrPaths, TIndexPaths> & {
  // todo object overload
  get(
    key: PrimaryKey<TInsert, TPKeyPathOrPaths>
  ): PromiseExtended<TGet | undefined>;
  bulkGet(
    keys: KeyPathValue<TInsert, TPKeyPathOrPaths>[]
  ): PromiseExtended<(TGet | undefined)[]>;

  add(item: TInsert): PromiseExtended<PrimaryKey<TInsert, TPKeyPathOrPaths>>;
  // can probably remove this overload - this table entries already have the primary key
  bulkAdd<B extends boolean>(
    items: readonly TInsert[],
    options: {
      allKeys: B;
    }
  ): PromiseExtended<
    B extends true
      ? PrimaryKey<TInsert, TPKeyPathOrPaths>[]
      : PrimaryKey<TInsert, TPKeyPathOrPaths>
  >;
  bulkAdd(
    items: readonly TInsert[]
  ): PromiseExtended<PrimaryKey<TInsert, TPKeyPathOrPaths>>;
  put(item: TInsert): PromiseExtended<PrimaryKey<TInsert, TPKeyPathOrPaths>>;
  // can probably remove this overload - this table entries already have the primary key
  bulkPut<B extends boolean>(
    items: readonly TInsert[],
    options: {
      allKeys: B;
    }
  ): PromiseExtended<
    B extends true
      ? PrimaryKey<TInsert, TPKeyPathOrPaths>[]
      : PrimaryKey<TInsert, TPKeyPathOrPaths>
  >;
  bulkPut(
    items: readonly TInsert[]
  ): PromiseExtended<PrimaryKey<TInsert, TPKeyPathOrPaths>>;

  // https://dexie.org/docs/Table/Table.update()
  update(
    key: PrimaryKey<TInsert, TPKeyPathOrPaths>,
    changes: UpdateSpec<TInsert>
  ): PromiseExtended<0 | 1>;
  update(
    key: PrimaryKey<TInsert, TPKeyPathOrPaths>,
    changes: ChangeCallback<TInsert>
  ): PromiseExtended<0 | 1>;
  // note that docs do not mention this ( as the key must exist on the object - so ok for this table type )
  update(object: TInsert, changes: UpdateSpec<TInsert>): PromiseExtended<0 | 1>;
  update(
    object: TInsert,
    changes: ChangeCallback<TInsert>
  ): PromiseExtended<0 | 1>;
  bulkUpdate(
    changes: BulkUpdate<TInsert, TPKeyPathOrPaths>[]
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
    key: PrimaryKey<TInsert, TPKeyPathOrPaths>,
    spec: UpsertSpec<TInsert, TPKeyPathOrPaths>
  ): PromiseExtended<boolean>;
} & WhereClausesFromIndexes<
    TInsert,
    KeyPathValue<TInsert, TPKeyPathOrPaths>,
    TIndexPaths
  >;

type UpsertSpec<
  T,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>
> = DeletePrimaryKeys<
  {
    [K in keyof RequiredOnlyDeep<T>]:
      | RequiredOnlyDeep<T>[K]
      | PropModification<RequiredOnlyDeep<T>[K]>;
  },
  TPKeyPathOrPaths
>;
