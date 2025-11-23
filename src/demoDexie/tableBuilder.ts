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
import type { OptionalPrimaryKeys } from "./utilitytypes";

export type DexiePrimaryKeyPathOrPaths<T> =
  | ValidIndexedDBKeyPath<T>
  | CompoundKeyPaths<T>;

export interface TableConfig<
  TDatabase,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TAuto extends boolean,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet = TDatabase,
  TInsert = TDatabase
> {
  readonly pk: { key: TPKeyPathOrPaths; auto: TAuto };
  readonly indicesSchema: string;
  readonly mapToClass?: ConstructorOf<TDatabase>;
  excludedKeys: string[] | undefined;
}

type IsMultiEntryArray<T> = T extends readonly (infer E)[]
  ? E extends AllowedKeyLeaf
    ? true
    : false
  : false;

type MultiEntryKeyPath<T> = ValidIndexedDBKeyPath<T, "", false> extends infer P
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
  ? Paths // Keep the tuple for compound indexes
  : never;

// Extract all used index names as a union
type UsedIndexNames<TIndexPaths extends DexieIndexPaths<any>> =
  TIndexPaths extends readonly [infer First, ...infer Rest]
    ? Rest extends DexieIndexPaths<any>
      ? IndexName<First> | UsedIndexNames<Rest>
      : IndexName<First>
    : never;

// Helper to check if two tuples are equal
type TuplesEqual<A, B> = A extends readonly [...infer AItems]
  ? B extends readonly [...infer BItems]
    ? AItems["length"] extends BItems["length"]
      ? A extends B
        ? B extends A
          ? true
          : false
        : false
      : false
    : false
  : false;

// Check if an index name is already used
type IsIndexDuplicate<
  TIndexPath,
  TIndexPaths extends DexieIndexPaths<any>
> = UsedIndexNames<TIndexPaths> extends never
  ? false
  : TIndexPath extends readonly any[] // Is it a compound index?
  ? UsedIndexNames<TIndexPaths> extends infer Used
    ? Used extends readonly any[] // Check against other compound indexes
      ? TuplesEqual<TIndexPath, Used>
      : false
    : false
  : TIndexPath extends UsedIndexNames<TIndexPaths> // Single index check
  ? true
  : false;

type CompoundMatchesPK<TCompound, PK> = PK extends readonly any[]
  ? TCompound extends readonly any[]
    ? PK["length"] extends TCompound["length"]
      ? TCompound["length"] extends PK["length"]
        ? PK extends readonly [...TCompound]
          ? TCompound extends readonly [...PK]
            ? true
            : false
          : false
        : false
      : false
    : false
  : false;

interface IndexMethods<
  TDatabase,
  PkPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  Auto extends boolean,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet = TDatabase,
  // stored on object - https://dexie.org/docs/inbound
  TPkeyInbound extends boolean = false
> {
  index<
    TIndexPath extends NonPrimaryKeyPath<TDatabase, PkPathOrPaths> &
      ValidIndexedDBKeyPath<TDatabase>
  >(
    indexPath: TIndexPath
  ): IsIndexDuplicate<TIndexPath, TIndexPaths> extends true
    ? DuplicateIndexError
    : IndexMethods<
        TDatabase,
        PkPathOrPaths,
        Auto,
        [...TIndexPaths, SingleIndexPath<TDatabase, TIndexPath>],
        TGet,
        TPkeyInbound
      >;
  unique<
    TIndexPath extends NonPrimaryKeyPath<TDatabase, PkPathOrPaths> &
      ValidIndexedDBKeyPath<TDatabase>
  >(
    indexPath: TIndexPath
  ): IsIndexDuplicate<TIndexPath, TIndexPaths> extends true
    ? DuplicateIndexError
    : IndexMethods<
        TDatabase,
        PkPathOrPaths,
        Auto,
        [...TIndexPaths, SingleIndexPath<TDatabase, TIndexPath>],
        TGet,
        TPkeyInbound
      >;
  multi<
    TIndexPath extends NonPrimaryKeyPath<TDatabase, PkPathOrPaths> &
      MultiEntryKeyPath<TDatabase>
  >(
    indexPath: TIndexPath
  ): IsIndexDuplicate<TIndexPath, TIndexPaths> extends true
    ? DuplicateIndexError
    : IndexMethods<
        TDatabase,
        PkPathOrPaths,
        Auto,
        [...TIndexPaths, MultiIndexPath<TDatabase, TIndexPath>],
        TGet,
        TPkeyInbound
      >;
  compound<const TCompoundIndexPaths extends CompoundKeyPaths<TDatabase>>(
    ...indexPaths: CompoundMatchesPK<
      TCompoundIndexPaths,
      PkPathOrPaths
    > extends true
      ? never
      : TCompoundIndexPaths
  ): NoDuplicates<TCompoundIndexPaths> extends never
    ? DuplicateKeysError
    : IsIndexDuplicate<TCompoundIndexPaths, TIndexPaths> extends true
    ? DuplicateIndexError
    : IndexMethods<
        TDatabase,
        PkPathOrPaths,
        Auto,
        [...TIndexPaths, CompoundIndexPaths<TDatabase, TCompoundIndexPaths>],
        TGet,
        TPkeyInbound
      >;
  build(): TableConfig<
    TDatabase,
    PkPathOrPaths,
    Auto,
    TIndexPaths,
    TGet,
    TPkeyInbound extends true
      ? Auto extends true
        ? OptionalPrimaryKeys<TDatabase, PkPathOrPaths>
        : TDatabase
      : TDatabase
  >;
}

const isDistinctArray = (arr: readonly any[]): boolean => {
  return Array.from(new Set(arr)).length === arr.length;
};

interface MapToClass<T> {
  ctor: ConstructorOf<T>;
  excludedKeys: string[];
}

function createTableBuilder<TDatabase, TGet>(
  mapToClass?: MapToClass<TDatabase>
) {
  const indexParts: string[] = [];

  function createIndexMethods<
    TPkeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
    TAuto extends boolean,
    TIndexPaths extends DexieIndexPaths<TDatabase>,
    TPkeyInbound extends boolean
  >(
    key: TPkeyPathOrPaths,
    auto: TAuto,
    indices: TIndexPaths,
    pkeyInbound: TPkeyInbound
  ): IndexMethods<
    TDatabase,
    TPkeyPathOrPaths,
    TAuto,
    TIndexPaths,
    TGet,
    TPkeyInbound
  > {
    const addIfNotDuplicatePart = (part: string) => {
      if (indexParts.includes(part)) {
        return duplicateIndexErrorInstance;
      }
      indexParts.push(part);
    };
    return {
      index(indexKey) {
        return (
          addIfNotDuplicatePart(indexKey) ||
          (createIndexMethods(
            key,
            auto,
            [...indices, { kind: "single", path: indexKey, multi: false }],
            pkeyInbound
          ) as any)
        );
      },
      unique(indexKey) {
        return (
          addIfNotDuplicatePart(`&${indexKey}`) ||
          (createIndexMethods(
            key,
            auto,
            [...indices, { kind: "single", path: indexKey, multi: false }],
            pkeyInbound
          ) as any)
        );
      },
      multi(indexKey) {
        return (
          addIfNotDuplicatePart(`*${indexKey}`) ||
          (createIndexMethods(
            key,
            auto,
            [...indices, { kind: "multi", path: indexKey, multi: true }],
            pkeyInbound
          ) as any)
        );
      },
      compound(...keys) {
        if (!isDistinctArray(keys)) {
          return duplicateKeysErrorInstance;
        }
        return (
          addIfNotDuplicatePart(`[${(keys as string[]).join("+")}]`) ||
          (createIndexMethods(
            key,
            auto,
            [...indices, { kind: "compound", paths: keys }],
            pkeyInbound
          ) as any)
        );
      },
      build() {
        if (mapToClass) {
          const mapToClasstableConfig: TableConfig<
            TDatabase,
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
          return mapToClasstableConfig;
        }

        const tableConfig: TableConfig<
          TDatabase,
          TPkeyPathOrPaths,
          TAuto,
          TIndexPaths,
          TGet
        > = {
          pk: { key, auto },
          indicesSchema: indexParts.join(", "),
          excludedKeys: undefined,
        };
        return tableConfig;
      },
    };
  }

  return {
    autoIncrement<K extends ValidIndexedDBKeyPath<TDatabase, "", false>>(
      key: K
    ) {
      return createIndexMethods(key, true, [] as const, true);
    },
    primaryKey<K extends ValidIndexedDBKeyPath<TDatabase>>(key: K) {
      return createIndexMethods(key, false, [] as const, true);
    },
    compoundKey<const K extends CompoundKeyPaths<TDatabase>>(
      ...keys: K
    ): NoDuplicates<K> extends never
      ? DuplicateKeysError
      : IndexMethods<TDatabase, K, false, [], TGet> {
      return createIndexMethods(keys, false, [] as const, true) as any;
    },

    hiddenAuto() {
      return createIndexMethods(null as never, true, [] as const, false);
    },
    hiddenExplicit<K>() {
      return createIndexMethods(null as never, false, [] as const, false);
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
  return tableClassBuilderExcluded(ctor).excludedKeys([] as const);
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
      type TDatabase = InsertType<T, never>;

      return createTableBuilder<TDatabase, TEntity>({
        ctor,
        excludedKeys: excludedKeys ? [...excludedKeys] : [],
      });
    },
  };
}
