import type {
  DBCoreTable,
  PromiseExtended,
  TableHooks,
  TableSchema,
} from "dexie";
import type { Collection } from "./Collection";
import type {
  CompoundIndex,
  DexieIndex,
  DexieIndexes,
  DexiePlainKey,
  MultiIndex,
  SingleIndex,
} from "./dexieindexes";
import type { UpdateKeyPathValue } from "./better-dexie";
import type { WhereClausesFromIndexes } from "./where";
import type { TableConfig } from "./tableBuilder";

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
    ? UpdateKeyPathValue<T, Path>
    : // Multi: the index points to an array field; collection key should be the element type
    P extends MultiIndex<T, infer Path>
    ? UpdateKeyPathValue<T, Path> extends readonly (infer Elem)[]
      ? Elem
      : UpdateKeyPathValue<T, Path>
    : // Compound: tuple of the per-path key values
    P extends CompoundIndex<T, infer Paths>
    ? { [K in keyof Paths]: UpdateKeyPathValue<T, Paths[K] & string> } // keeps path order
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
  ? { [I in keyof TKey]: UpdateKeyPathValue<T, TKey[I] & keyof T> }
  : UpdateKeyPathValue<T, TKey & keyof T>;

export type PrimaryKeyCollection<
  T,
  TKey extends DexiePlainKey<T>,
  TIndexes extends DexieIndexes<T>
> = Collection<T, PrimaryKey<T, TKey>, PrimaryKey<T, TKey>, TIndexes>;

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
    UpdateKeyPathValue<T, TKey>,
    KeyForIndex<T, ExtractSelectedIndex<T, TIndexes, Path>>,
    TIndexes
  >;
  reverse(): Collection<T, TKey, TKey, TIndexes>;
  mapToClass(constructor: Function): Function;

  delete(key: TKey): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
}

type KeyPathTable<
  TName extends string,
  T,
  TKey extends DexiePlainKey<T>,
  TIndexes extends DexieIndexes<T>
> = TableBase<TName, T, TKey, TIndexes> & {
  get(key: UpdateKeyPathValue<T, TKey>): PromiseExtended<T | undefined>;
  bulkGet(
    keys: UpdateKeyPathValue<T, TKey>[]
  ): PromiseExtended<(T | undefined)[]>;
  add(item: T): PromiseExtended<TKey>;
} & WhereClausesFromIndexes<T, UpdateKeyPathValue<T, TKey>, TIndexes>;
