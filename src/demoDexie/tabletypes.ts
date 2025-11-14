import type {
  DBCoreTable,
  KeyPathValue,
  PromiseExtended,
  PropModification,
  TableHooks,
  TableSchema,
  UpdateSpec,
} from "dexie";
import type { ChangeCallback, Collection } from "./Collection";
import type {
  CompoundIndex,
  DexieIndex,
  DexieIndexes,
  DexiePlainKey,
  MultiIndex,
  SingleIndex,
} from "./dexieindexes";
import type { WhereClausesFromIndexes } from "./where";
import type { TableConfig } from "./tableBuilder";
import type { DeletePrimaryKeys, RequiredOnlyDeep } from "./utilitytypes";

export type DBTables<
  TConfig extends Record<string, TableConfig<any, any, any, any>>
> = {
  [K in keyof TConfig & string]: TConfig[K] extends TableConfig<
    infer TRow,
    infer PK,
    infer Auto,
    any
  >
    ? PK extends never
      ? Auto extends true
        ? never
        : never
      : Auto extends true
      ? never
      : KeyPathTable<K, TRow, PK, TConfig[K]["indices"]>
    : never;
};

type IndexPath<T, I extends DexieIndex<T>> = I extends SingleIndex<T, infer P>
  ? I["path"]
  : I extends MultiIndex<T, infer P>
  ? I["path"]
  : I extends CompoundIndex<T, infer Ps>
  ? I["paths"]
  : never;

export type KeyForIndex<T, P> =
  // Single: key is the value stored at the path
  P extends SingleIndex<T, infer Path>
    ? KeyPathValue<T, Path>
    : // Multi: the index points to an array field; collection key should be the element type
    P extends MultiIndex<T, infer Path>
    ? KeyPathValue<T, Path> extends readonly (infer Elem)[]
      ? Elem
      : KeyPathValue<T, Path>
    : // Compound: tuple of the per-path key values
    P extends CompoundIndex<T, infer Paths>
    ? { [K in keyof Paths]: KeyPathValue<T, Paths[K] & string> } // keeps path order
    : never;

type ExtractSelectedIndex<
  T,
  TIndexes extends readonly DexieIndex<T>[],
  Path
> = TIndexes[number] extends infer I
  ? I extends SingleIndex<T, infer P>
    ? Path extends P
      ? I
      : never
    : I extends MultiIndex<T, infer P>
    ? Path extends P
      ? I
      : never
    : I extends CompoundIndex<T, infer Ps>
    ? Path extends Ps
      ? I
      : never
    : never
  : never;

export type PrimaryKey<
  T,
  TKey extends DexiePlainKey<T>
> = TKey extends readonly any[]
  ? { [I in keyof TKey]: KeyPathValue<T, TKey[I] & keyof T> }
  : KeyPathValue<T, TKey & keyof T>;

export type PrimaryKeyCollection<
  T,
  TKey extends DexiePlainKey<T>,
  TIndexes extends DexieIndexes<T>
> = Collection<T, PrimaryKey<T, TKey>, PrimaryKey<T, TKey>, TIndexes>;

/*
  missing the table methods:
    get / bulkGet
    ---

    add / bulkAdd

    put / bulkPut

*/
export interface TableBase<
  TName extends string,
  T,
  TKey extends DexiePlainKey<T>,
  TIndexes extends DexieIndexes<T>
> {
  //db: Dexie;
  name: TName;
  schema: TableSchema;
  hook: TableHooks<T, TKey>;
  core: DBCoreTable;

  filter(fn: (obj: T) => boolean): PrimaryKeyCollection<T, TKey, TIndexes>;

  count(): PromiseExtended<number>;

  offset(n: number): PrimaryKeyCollection<T, TKey, TIndexes>;
  limit(n: number): PrimaryKeyCollection<T, TKey, TIndexes>;

  // this.toCollection().each(callback);
  each: PrimaryKeyCollection<T, TKey, TIndexes>["each"];

  toArray(): PromiseExtended<Array<T>>;
  toCollection(): PrimaryKeyCollection<T, TKey, TIndexes>;
  orderBy<Path extends IndexPath<T, TIndexes[number]>>(
    index: Path
  ): Collection<
    T,
    KeyPathValue<T, TKey>,
    KeyForIndex<T, ExtractSelectedIndex<T, TIndexes, Path>>,
    TIndexes
  >;
  reverse(): PrimaryKeyCollection<T, TKey, TIndexes>;
  mapToClass(constructor: Function): Function;

  delete(key: PrimaryKey<T, TKey>): PromiseExtended<void>;
  bulkDelete(keys: PrimaryKey<T, TKey>[]): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
}

type PrimaryKeyPaths<
  T,
  TKey extends DexiePlainKey<T>
> = TKey extends readonly (infer U)[]
  ? U extends string
    ? U
    : never
  : TKey extends string
  ? TKey
  : never;
interface BulkUpdate<T, TKey extends DexiePlainKey<T>> {
  key: PrimaryKey<T, TKey>;
  changes: Omit<UpdateSpec<T>, PrimaryKeyPaths<T, TKey>>;
}

type KeyPathTable<
  TName extends string,
  T,
  TKey extends DexiePlainKey<T>,
  TIndexes extends DexieIndexes<T>
> = TableBase<TName, T, TKey, TIndexes> & {
  // todo object overload
  get(key: PrimaryKey<T, TKey>): PromiseExtended<T | undefined>;
  bulkGet(keys: KeyPathValue<T, TKey>[]): PromiseExtended<(T | undefined)[]>;

  add(item: T): PromiseExtended<TKey>;
  // can probably remove this overload - this table entries already have the primary key
  bulkAdd<B extends boolean>(
    items: readonly T[],
    options: {
      allKeys: B;
    }
  ): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkAdd(items: readonly T[]): PromiseExtended<TKey>;
  put(item: T): PromiseExtended<TKey>;
  // can probably remove this overload - this table entries already have the primary key
  bulkPut<B extends boolean>(
    items: readonly T[],
    options: {
      allKeys: B;
    }
  ): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkPut(items: readonly T[]): PromiseExtended<TKey>;

  // https://dexie.org/docs/Table/Table.update()
  update(
    key: PrimaryKey<T, TKey>,
    changes: UpdateSpec<T>
  ): PromiseExtended<0 | 1>;
  update(
    key: PrimaryKey<T, TKey>,
    changes: ChangeCallback<T>
  ): PromiseExtended<0 | 1>;
  // note that docs do not mention this ( as the key must exist on the object - so ok for this table type )
  update(object: T, changes: UpdateSpec<T>): PromiseExtended<0 | 1>;
  update(object: T, changes: ChangeCallback<T>): PromiseExtended<0 | 1>;
  bulkUpdate(changes: BulkUpdate<T, TKey>[]): PromiseExtended<number>;
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
    key: PrimaryKey<T, TKey>,
    spec: UpsertSpec<T, TKey>
  ): PromiseExtended<boolean>;
} & WhereClausesFromIndexes<T, KeyPathValue<T, TKey>, TIndexes>;

type UpsertSpec<T, TKey extends DexiePlainKey<T>> = DeletePrimaryKeys<
  {
    [K in keyof RequiredOnlyDeep<T>]:
      | RequiredOnlyDeep<T>[K]
      | PropModification<RequiredOnlyDeep<T>[K]>;
  },
  TKey
>;
