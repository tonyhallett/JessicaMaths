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

type OrderBy<T, I extends DexieIndex<T>> = I extends SingleIndex<T, infer P>
  ? I["path"]
  : I extends MultiIndex<T, infer P>
  ? I["path"]
  : I extends CompoundIndex<T, infer Ps>
  ? I["paths"]
  : never;

export type PrimaryKeyCollection<
  T,
  TKey extends DexiePlainKey<T>,
  TIndexes extends DexieIndexes<T>
> = Collection<
  T,
  UpdateKeyPathValue<T, TKey>, // todo KeyValueForIndex
  UpdateKeyPathValue<T, TKey>, // todo KeyValueForIndex
  TIndexes
>;

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
  orderBy<I extends OrderBy<T, TIndexes[number]>>(
    index: I
  ): Collection<T, TKey, I, TIndexes>;
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
