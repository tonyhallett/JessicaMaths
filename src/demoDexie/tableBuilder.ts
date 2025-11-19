import type { KeyPathValue, InsertType } from "dexie";
import type {
  DexieIndexPaths,
  SingleIndexPath,
  MultiIndexPath,
  CompoundIndexPaths,
} from "./dexieindexes";
import type {
  AllowedKeyLeaf,
  CompoundKeyPaths,
  ValidIndexedDBKeyPath,
} from "./ValidIndexedDBKeyPaths";

export type DexiePrimaryKeyPathOrPaths<T> =
  | ValidIndexedDBKeyPath<T>
  | CompoundKeyPaths<T>;

export interface TableConfig<
  T,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>,
  TAuto extends boolean,
  TIndexPaths extends DexieIndexPaths<T>,
  TGet = T
> {
  readonly pk: { key: TPKeyPathOrPaths; auto: TAuto };
  readonly indicesSchema: string;
  readonly mapToClass?: ConstructorOf<T>;
  excludedKeys: string[] | undefined;
}

type IsMultiEntryArray<T> = T extends readonly (infer E)[]
  ? E extends AllowedKeyLeaf
    ? true
    : false
  : false;

export type MultiEntryKeyPath<T> = ValidIndexedDBKeyPath<
  T,
  "",
  false
> extends infer P
  ? P extends string
    ? IsMultiEntryArray<KeyPathValue<T, P>> extends true
      ? P
      : never
    : never
  : never;

type NonPrimaryKeyPath<T, PkPathOrPaths> =
  PkPathOrPaths extends readonly string[]
    ? ValidIndexedDBKeyPath<T> // Compound PK: allow any single index
    : ValidIndexedDBKeyPath<T> extends infer P
    ? P extends PkPathOrPaths
      ? never
      : P
    : never;

type NoDuplicates<T extends readonly any[]> = T extends readonly [
  infer First,
  ...infer Rest
]
  ? First extends Rest[number]
    ? never
    : Rest extends readonly any[]
    ? readonly [First, ...NoDuplicates<Rest>]
    : T
  : T;

export type DuplicateKeysError = {
  readonly error: "Duplicate keys in compound key are not allowed";
};

const duplicateKeysErrorInstance: DuplicateKeysError = {
  error: "Duplicate keys in compound key are not allowed",
};

export type DuplicateIndexError = {
  readonly error: "Duplicate index name is not allowed";
};

const duplicateIndexErrorInstance: DuplicateIndexError = {
  error: "Duplicate index name is not allowed",
};

// Helper to extract index path identifier
type IndexName<TIndexPath> = TIndexPath extends SingleIndexPath<any, infer P>
  ? P
  : TIndexPath extends MultiIndexPath<any, infer P>
  ? P
  : TIndexPath extends CompoundIndexPaths<any, infer Paths>
  ? Paths
  : never;

// Extract all used index names as a union
type UsedIndexNames<TIndexPaths extends DexieIndexPaths<any>> =
  TIndexPaths extends readonly []
    ? never
    : TIndexPaths extends readonly [infer First, ...infer Rest]
    ? Rest extends DexieIndexPaths<any>
      ? IndexName<First> | UsedIndexNames<Rest>
      : IndexName<First>
    : never;

// union
type Test = UsedIndexNames<
  [
    SingleIndexPath<{ id: string; index: string }, "index">,
    SingleIndexPath<{ id: string; index: string }, "id">
  ]
>;
type TestIndexPaths = [SingleIndexPath<{ id: string; index: string }, "index">];

type IsIndexDuplicateTest = IsIndexDuplicate<"index", TestIndexPaths>;
type TestIndexPaths2 = [
  SingleIndexPath<{ id: string; index: string }, "index">,
  SingleIndexPath<{ id: string; index: string }, "id">
];
type IsIndexDuplicateTest2 = IsIndexDuplicate<"index", TestIndexPaths>;
type IsIndexDuplicateTest3 = IsIndexDuplicate<"!", TestIndexPaths>;

type IsIndexDuplicate<
  TIndexPath,
  TIndexPaths extends DexieIndexPaths<any>
> = UsedIndexNames<TIndexPaths> extends never
  ? false
  : UsedIndexNames<TIndexPaths> extends infer U
  ? U extends never
    ? false
    : TIndexPath extends U
    ? true
    : false
  : false;

export interface IndexMethods<
  TInsert,
  PkPathOrPaths extends DexiePrimaryKeyPathOrPaths<TInsert>,
  Auto extends boolean,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TGet = TInsert
> {
  index<
    TIndexPath extends NonPrimaryKeyPath<TInsert, PkPathOrPaths> &
      ValidIndexedDBKeyPath<TInsert>
  >(
    indexPath: TIndexPath
  ): IsIndexDuplicate<TIndexPath, TIndexPaths> extends true
    ? DuplicateIndexError
    : IndexMethods<
        TInsert,
        PkPathOrPaths,
        Auto,
        [...TIndexPaths, SingleIndexPath<TInsert, TIndexPath>]
      >;
  unique<
    TIndexPath extends NonPrimaryKeyPath<TInsert, PkPathOrPaths> &
      ValidIndexedDBKeyPath<TInsert>
  >(
    indexPath: TIndexPath
  ): IsIndexDuplicate<TIndexPath, TIndexPaths> extends true
    ? DuplicateIndexError
    : IndexMethods<
        TInsert,
        PkPathOrPaths,
        Auto,
        [...TIndexPaths, SingleIndexPath<TInsert, TIndexPath>]
      >;
  multi<TIndexPath extends MultiEntryKeyPath<TInsert>>(
    indexPath: TIndexPath
  ): IsIndexDuplicate<TIndexPath, TIndexPaths> extends true
    ? DuplicateIndexError
    : IndexMethods<
        TInsert,
        PkPathOrPaths,
        Auto,
        [...TIndexPaths, MultiIndexPath<TInsert, TIndexPath>]
      >;
  compound<TCompoundIndexPaths extends CompoundKeyPaths<TInsert>>(
    ...indexPaths: TCompoundIndexPaths
  ): NoDuplicates<TCompoundIndexPaths> extends never
    ? DuplicateKeysError
    : IndexMethods<
        TInsert,
        PkPathOrPaths,
        Auto,
        [...TIndexPaths, CompoundIndexPaths<TInsert, TCompoundIndexPaths>]
      >;
  build(): TableConfig<TInsert, PkPathOrPaths, Auto, TIndexPaths, TGet>;
}

const isDistinctArray = (arr: readonly any[]): boolean => {
  return Array.from(new Set(arr)).length === arr.length;
};

interface MapToClass<T> {
  ctor: ConstructorOf<T>;
  excludedKeys: string[];
}

function createTableBuilder<T, TGet>(mapToClass?: MapToClass<T>) {
  const indexParts: string[] = [];

  function createIndexMethods<
    TPkeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>,
    TAuto extends boolean,
    TIndexPaths extends DexieIndexPaths<T>
  >(
    key: TPkeyPathOrPaths,
    auto: TAuto,
    indices: TIndexPaths
  ): IndexMethods<T, TPkeyPathOrPaths, TAuto, TIndexPaths, TGet> {
    return {
      index(indexKey) {
        if (indexParts.includes(indexKey)) {
          return duplicateIndexErrorInstance as any;
        }
        indexParts.push(indexKey);
        return createIndexMethods(key, auto, [
          ...indices,
          { kind: "single", path: indexKey, multi: false },
        ]);
      },
      unique(indexKey) {
        if (indexParts.includes(indexKey)) {
          return duplicateIndexErrorInstance as any;
        }
        indexParts.push(`&${indexKey}`);
        return createIndexMethods(key, auto, [
          ...indices,
          { kind: "single", path: indexKey, multi: false },
        ]) as any;
      },
      multi(indexKey) {
        if (indexParts.includes(indexKey)) {
          return duplicateIndexErrorInstance as any;
        }
        indexParts.push(`*${indexKey}`);
        return createIndexMethods(key, auto, [
          ...indices,
          { kind: "multi", path: indexKey, multi: true },
        ]) as any;
      },
      compound(...keys) {
        if (!isDistinctArray(keys)) {
          return duplicateKeysErrorInstance;
        }
        indexParts.push(`[${keys.join("+")}]`);
        return createIndexMethods(key, auto, [
          ...indices,
          { kind: "compound", paths: keys },
        ]) as any;
      },
      build() {
        if (!isDistinctArray(indexParts)) {
          throw new Error("Duplicate indexes are not allowed");
        }
        if (mapToClass) {
          const tableConfig: TableConfig<
            T,
            TPkeyPathOrPaths,
            TAuto,
            TIndexPaths,
            TGet
          > = {
            pk: { key, auto },
            indicesSchema: indexParts.join(", "),
            mapToClass: mapToClass.ctor,
            excludedKeys: mapToClass.excludedKeys,
          };
          return tableConfig;
        }

        const tableConfig2: TableConfig<
          T,
          TPkeyPathOrPaths,
          TAuto,
          TIndexPaths,
          TGet
        > = {
          pk: { key, auto },
          indicesSchema: indexParts.join(", "),
          excludedKeys: undefined,
        };
        return tableConfig2;
      },
    };
  }

  return {
    autoIncrement<K extends ValidIndexedDBKeyPath<T, "", false>>(key: K) {
      return createIndexMethods(key, true, [] as const);
    },
    primaryKey<K extends ValidIndexedDBKeyPath<T>>(key: K) {
      return createIndexMethods(key, false, [] as const);
    },
    compoundKey<const K extends CompoundKeyPaths<T>>(
      ...keys: K
    ): NoDuplicates<K> extends never
      ? DuplicateKeysError
      : IndexMethods<T, K, false, [], TGet> {
      return createIndexMethods(keys, false, [] as const) as any;
    },

    hiddenAuto() {
      return createIndexMethods(null as never, true, [] as const);
    },
    hiddenExplicit<K>() {
      return createIndexMethods(null as never, false, [] as const);
    },
  };
}

export function tableBuilder<T>() {
  return createTableBuilder<T, T>();
}

export type ConstructorOf<T> = new (...args: any[]) => T;

export function tableClassBuilder<TCtor extends new (...args: any) => any>(
  ctor: TCtor
) {
  return tableClassBuilderExcluded(ctor).excludedKeys([]);
}

export function tableClassBuilderExcluded<
  TCtor extends new (...args: any) => any
>(ctor: TCtor) {
  type TEntity = InstanceType<TCtor>;
  return {
    excludedKeys<TExcludeProps extends (keyof TEntity & string)[]>(
      excludedKeys: readonly [...TExcludeProps]
    ) {
      type T = Omit<TEntity, TExcludeProps[number]>;
      type TInsert = InsertType<T, never>;

      return createTableBuilder<TInsert, TEntity>({
        ctor,
        excludedKeys: excludedKeys ? [...excludedKeys] : [],
      });
    },
  };
}
