import {
  type DBCoreTable,
  type KeyPathValue,
  type PromiseExtended,
  type DexieEvent,
  type DexieEventSet,
  type TableSchema,
  type Transaction,
  type KeyPathIgnoreObject,
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
import type { DeletePrimaryKeys } from "./utilitytypes";
import type { PropModificationTyped } from "./propmodifications";

type DexieKeyPaths<T, MAXDEPTH = "II", CURRDEPTH extends string = ""> = {
  [P in keyof T]: P extends string
    ? CURRDEPTH extends MAXDEPTH
      ? P
      : T[P] extends Array<infer K>
      ? K extends any[] // Array of arrays (issue #2026)
        ? P | `${P}.${number}` | `${P}.${number}.${number}`
        : K extends object // only drill into the array element if it's an object
        ? P | `${P}.${number}` | `${P}.${number}.${DexieKeyPaths<Required<K>>}`
        : P | `${P}.${number}`
      : T[P] extends (...args: any[]) => any // Method
      ? never
      : T[P] extends KeyPathIgnoreObject // Not valid in update spec or where clause (+ avoid circular reference)
      ? P
      : T[P] extends object
      ? P | `${P}.${DexieKeyPaths<Required<T[P]>, MAXDEPTH, `${CURRDEPTH}I`>}`
      : P
    : never;
}[keyof T];

type MaxDepth<S extends string> = S extends ""
  ? never // empty string is invalid
  : S extends `I${infer Rest}` // starts with "I"
  ? Rest extends "" // if nothing left, ok
    ? S
    : MaxDepth<Rest> extends never // recursively check the rest
    ? never
    : S
  : never; // does not start with "I"

export type KeyPaths<
  T,
  TMAXDEPTH extends string = "II"
> = TMAXDEPTH extends MaxDepth<TMAXDEPTH> ? DexieKeyPaths<T, TMAXDEPTH> : never;

export type UpdateSpec<
  T,
  TMAXDEPTH extends string = "II"
> = TMAXDEPTH extends MaxDepth<TMAXDEPTH>
  ? {
      [KP in KeyPaths<Required<T>, TMAXDEPTH>]?:
        | KeyPathValue<Required<T>, KP>
        | PropModificationTyped<KeyPathValue<T, KP>>
        | (undefined extends KeyPathValue<T, KP> ? undefined : never); // delete semantics
    }
  : never;

export type DBTables<
  TConfig extends Record<string, TableConfig<any, any, any, any, any>>
> = {
  [TName in keyof TConfig & string]: TConfig[TName] extends TableConfig<
    infer TDatabase,
    infer PK,
    infer Auto,
    infer Indices,
    infer TGet,
    infer TInsert
  >
    ? PK extends never
      ? Auto extends true
        ? never
        : never
      : Auto extends true
      ? TableInboundAuto<TName, TDatabase, PK, Indices, TGet, TInsert>
      : TableInbound<TName, TDatabase, PK, Indices, TGet, TInsert>
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
  : KeyPathValue<T, TPKeyPathOrPaths>;

export type PrimaryKeyCollection<
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TIndexes extends DexieIndexPaths<TDatabase>
> = Collection<
  TGet,
  TDatabase,
  TInsert,
  PrimaryKey<TDatabase, TPKeyPathOrPaths>,
  PrimaryKey<TDatabase, TPKeyPathOrPaths>,
  TIndexes
>;

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
  orderBy<Path extends IndexPath<TInsert, TIndexPaths[number]>>(
    index: Path
  ): Collection<
    TGet,
    TDatabase,
    TInsert,
    KeyPathValue<TInsert, TPKeyPathOrPaths>,
    KeyForIndex<TInsert, ExtractSelectedIndex<TInsert, TIndexPaths, Path>>,
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
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>,
  TMAXDEPTH extends string = "II"
> {
  key: PrimaryKey<T, TPKeyPathOrPaths>;
  changes: Omit<UpdateSpec<T, TMAXDEPTH>, PrimaryKeyPaths<T, TPKeyPathOrPaths>>;
}

export interface TableInboundAutoAdd<
  TDatabase,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TInsert
> {
  addObject<T extends TInsert>(
    item: NoExcessDataProperties<T, TInsert>
  ): Promise<
    T & {
      [K in TPKeyPathOrPaths & string]: PrimaryKey<TDatabase, TPKeyPathOrPaths>;
    }
  >;
}
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

type NoExcessDataProperties<T, U> = {
  [K in keyof T]: K extends keyof U
    ? T[K]
    : IsFunction<T[K]> extends true
    ? T[K]
    : never;
};

export type TableInboundAuto<
  TName extends string,
  TDatabase,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TInsert
> = TableBase<TName, TGet, TDatabase, TInsert, TPKeyPathOrPaths, TIndexPaths> &
  TableInboundAutoAdd<TDatabase, TPKeyPathOrPaths, TInsert> & {
    add(
      item: TInsert
    ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;

    bulkAdd(
      items: readonly TInsert[]
    ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
    bulkAdd<B extends boolean>(
      items: readonly TInsert[],
      options: {
        allKeys: B;
      }
    ): PromiseExtended<
      B extends true
        ? PrimaryKey<TDatabase, TPKeyPathOrPaths>[]
        : PrimaryKey<TDatabase, TPKeyPathOrPaths>
    >;

    put(
      item: TDatabase
    ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
    // no need for other overloads as the primary key is already present on TDatabase
    bulkPut(
      items: readonly TDatabase[]
    ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  };

type TableInbound<
  TName extends string,
  TDatabase,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TInsert
> = TableBase<
  TName,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths,
  TIndexPaths
> & {
  add(item: TInsert): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  // can probably remove this overload - this table entries already have the primary key
  /*   bulkAdd<B extends boolean>(
    items: readonly TInsert[],
    options: {
      allKeys: B;
    }
  ): PromiseExtended<
    B extends true
      ? PrimaryKey<TDatabase, TPKeyPathOrPaths>[]
      : PrimaryKey<TDatabase, TPKeyPathOrPaths>
  >; */
  bulkAdd(
    items: readonly TInsert[]
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  put(item: TInsert): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  // can probably remove this overload - this table entries already have the primary key
  /*   bulkPut<B extends boolean>(
    items: readonly TInsert[],
    options: {
      allKeys: B;
    }
  ): PromiseExtended<
    B extends true
      ? PrimaryKey<TDatabase, TPKeyPathOrPaths>[]
      : PrimaryKey<TDatabase, TPKeyPathOrPaths>
  >; */
  bulkPut(
    items: readonly TInsert[]
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;

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

type DeepPropertyOrModification<T> = T extends object
  ? T extends (...args: any[]) => any // Method
    ? T
    : T extends Array<any>
    ? T | PropModificationTyped<T>
    : {
        [K in keyof T]:
          | DeepPropertyOrModification<T[K]>
          | PropModificationTyped<T[K]>;
      }
  : T | PropModificationTyped<T>;

type UpsertSpec<
  T,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>
> = DeletePrimaryKeys<
  {
    [K in keyof T]:
      | DeepPropertyOrModification<T[K]>
      | PropModificationTyped<T[K]>;
  },
  TPKeyPathOrPaths
>;
