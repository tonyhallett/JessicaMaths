import type { KeyPathValue, InsertType, IndexableType } from "dexie";
import type {
  DexieIndexPaths,
  SingleIndexPath,
  MultiIndexPath,
  CompoundIndexPaths,
} from "./indexpaths";
import type {
  AllowedKeyLeaf,
  CompoundKeyPaths,
  ValidIndexedDBKeyPath,
} from "./ValidIndexedDBKeyPaths";
import type { DeletePrimaryKeys, OptionalPrimaryKeys } from "./primarykey";
import type {
  ConstructorOf,
  IncludesNumber,
  IncludesNumberInUnion,
  NoDescend,
  NoDuplicates,
  TuplesEqual,
} from "./utilitytypes";
import type { Level2 } from "./UpdateSpec";

interface PkConfig<TAuto extends boolean> {
  key: string | null;
  auto: TAuto;
}

export type TableConfigAny = TableConfig<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

export interface TableConfig<
  TDatabase,
  TPKeyPathOrPaths,
  TAuto extends boolean,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet = TDatabase,
  TInsert = TDatabase,
  TOutboundPKey extends IndexableType = never,
  TMaxDepth extends string = NoDescend
> {
  readonly pk: PkConfig<TAuto>;
  readonly indicesSchema: string;
  readonly mapToClass?: ConstructorOf<TDatabase>;
}

type IsMultiEntryArray<T> = T extends readonly (infer E)[]
  ? E extends AllowedKeyLeaf
    ? true
    : false
  : false;

type MultiEntryKeyPath<T, TMaxDepth extends string> = ValidIndexedDBKeyPath<
  T,
  false,
  TMaxDepth,
  true
> extends infer P
  ? P extends string
    ? IsMultiEntryArray<KeyPathValue<T, P>> extends true
      ? P
      : never
    : never
  : never;

export type DuplicateKeysError = {
  readonly error: "Duplicate keys in compound key are not allowed";
};

export const duplicateKeysErrorInstance: DuplicateKeysError = {
  error: "Duplicate keys in compound key are not allowed",
};

export type DuplicateIndexError = {
  readonly error: "Duplicate index name is not allowed";
};

export const duplicateIndexErrorInstance: DuplicateIndexError = {
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

type SingleIndexKeyPathExcludePrimaryKey<
  TDatabase,
  PkPathOrPaths,
  TAllowTypeSpecificProperties extends boolean,
  TMaxDepth extends string
> = ValidIndexedDBKeyPath<
  ApplySinglePkRemoval<TDatabase, PkPathOrPaths>,
  TAllowTypeSpecificProperties,
  TMaxDepth,
  true
>;

type MultiIndexKeyPathExcludePrimaryKey<
  TDatabase,
  PkPathOrPaths,
  TMaxDepth extends string
> = MultiEntryKeyPath<
  ApplySinglePkRemoval<TDatabase, PkPathOrPaths>,
  TMaxDepth
>;

type ApplySinglePkRemoval<TDatabase, PkPathOrPaths> = [PkPathOrPaths] extends [
  never
]
  ? TDatabase
  : PkPathOrPaths extends readonly string[]
  ? TDatabase
  : DeletePrimaryKeys<TDatabase, PkPathOrPaths>;

interface IndexMethods<
  TDatabase,
  PkPathOrPaths,
  Auto extends boolean,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet = TDatabase,
  // stored on object - https://dexie.org/docs/inbound
  TPKeyIsInbound extends boolean = false,
  TPKeyOutbound extends IndexableType = never,
  TAllowTypeSpecificProperties extends boolean = false,
  TKeyMaxDepth extends string = NoDescend,
  TMaxDepth extends string = Level2
> {
  index<
    TIndexPath extends SingleIndexKeyPathExcludePrimaryKey<
      TDatabase,
      PkPathOrPaths,
      TAllowTypeSpecificProperties,
      TKeyMaxDepth
    >
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
        TPKeyIsInbound,
        TPKeyOutbound,
        TAllowTypeSpecificProperties,
        TKeyMaxDepth,
        TMaxDepth
      >;
  uniqueIndex: this["index"];
  multi<
    TIndexPath extends MultiIndexKeyPathExcludePrimaryKey<
      TDatabase,
      PkPathOrPaths,
      TKeyMaxDepth
    >
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
        TPKeyIsInbound,
        TPKeyOutbound,
        TAllowTypeSpecificProperties,
        TKeyMaxDepth,
        TMaxDepth
      >;
  uniqueMulti: this["multi"];
  compound<
    const TCompoundIndexPaths extends CompoundKeyPaths<
      TDatabase,
      TAllowTypeSpecificProperties,
      TKeyMaxDepth,
      true
    >
  >(
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
        TPKeyIsInbound,
        TPKeyOutbound,
        TAllowTypeSpecificProperties,
        TKeyMaxDepth,
        TMaxDepth
      >;
  uniqueCompound: this["compound"];
  build(): TableConfig<
    TDatabase,
    PkPathOrPaths,
    Auto,
    TIndexPaths,
    TGet,
    TPKeyIsInbound extends true
      ? Auto extends true
        ? OptionalPrimaryKeys<TDatabase, PkPathOrPaths>
        : TDatabase
      : TDatabase,
    TPKeyOutbound,
    TMaxDepth
  >;
}

const isDistinctArray = (arr: readonly any[]): boolean => {
  return Array.from(new Set(arr)).length === arr.length;
};

type InboundAutoIncrementKeyPath<
  T,
  TMaxDepth extends string
> = ValidIndexedDBKeyPath<T, false, TMaxDepth, false> extends infer K
  ? K extends string
    ? IncludesNumber<KeyPathValue<T, K>> extends true
      ? K
      : never
    : never
  : never;

function createCompoundSchemaPart(keys: string[]): string {
  return `[${keys.join("+")}]`;
}

function createTableBuilder<
  TDatabase,
  TGet,
  TAllowTypeSpecificProperties extends boolean,
  TKeyMaxDepth extends string,
  TMaxDepth extends string
>(mapToClass?: ConstructorOf<TDatabase>) {
  const indexParts: string[] = [];
  const indexPartsNoUnique: string[] = [];

  function createIndexMethods<
    TPKeyPathOrPaths extends string | readonly string[] | null,
    TAuto extends boolean,
    TIndexPaths extends DexieIndexPaths<TDatabase>,
    TPKeyIsInbound extends boolean,
    TOutboundPKey extends IndexableType
  >(
    key: TPKeyPathOrPaths,
    auto: TAuto,
    indices: TIndexPaths,
    pkeyIsInbound: TPKeyIsInbound,
    outboundPKey: TOutboundPKey
  ): IndexMethods<
    TDatabase,
    TPKeyPathOrPaths,
    TAuto,
    TIndexPaths,
    TGet,
    TPKeyIsInbound,
    TOutboundPKey,
    TAllowTypeSpecificProperties,
    TKeyMaxDepth,
    TMaxDepth
  > {
    const addIfNotDuplicatePart = (part: string, unique: boolean) => {
      if (indexPartsNoUnique.includes(part)) {
        return duplicateIndexErrorInstance;
      }
      indexPartsNoUnique.push(part);
      indexParts.push(unique ? `&${part}` : part);
    };

    function doIndex<
      TIndexPath extends SingleIndexKeyPathExcludePrimaryKey<
        TDatabase,
        TPKeyPathOrPaths,
        TAllowTypeSpecificProperties,
        TKeyMaxDepth
      >
    >(indexKey: TIndexPath, unique: boolean) {
      return (
        addIfNotDuplicatePart(indexKey, unique) ||
        (createIndexMethods(
          key,
          auto,
          [
            ...indices,
            {
              kind: "single",
              path: indexKey,
              multi: false,
            },
          ],
          pkeyIsInbound,
          outboundPKey
        ) as any)
      );
    }

    function doMulti<
      TIndexPath extends MultiIndexKeyPathExcludePrimaryKey<
        TDatabase,
        TPKeyPathOrPaths,
        TKeyMaxDepth
      >
    >(indexKey: TIndexPath, unique: boolean) {
      return (
        addIfNotDuplicatePart(`*${indexKey}`, unique) ||
        (createIndexMethods(
          key,
          auto,
          [...indices, { kind: "multi", path: indexKey, multi: true }],
          pkeyIsInbound,
          outboundPKey
        ) as any)
      );
    }

    function doCompound<
      const TCompoundIndexPaths extends CompoundKeyPaths<
        TDatabase,
        TAllowTypeSpecificProperties,
        TKeyMaxDepth,
        true
      >
    >(unique: boolean, ...keys: TCompoundIndexPaths) {
      if (!isDistinctArray(keys)) {
        return duplicateKeysErrorInstance;
      }
      return (
        addIfNotDuplicatePart(createCompoundSchemaPart(keys), unique) ||
        (createIndexMethods(
          key,
          auto,
          [...indices, { kind: "compound", paths: keys }],
          pkeyIsInbound,
          outboundPKey
        ) as any)
      );
    }

    return {
      index(indexKey) {
        return doIndex(indexKey, false);
      },

      uniqueIndex(indexKey) {
        return doIndex(indexKey, true);
      },
      multi(indexKey) {
        return doMulti(indexKey, false);
      },
      uniqueMulti(indexKey) {
        return doMulti(indexKey, true);
      },
      compound(...keys) {
        return doCompound(false, ...keys);
      },
      uniqueCompound(...keys) {
        return doCompound(true, ...keys);
      },
      build() {
        const primaryKeyPart =
          key === null
            ? null
            : typeof key === "string"
            ? key
            : createCompoundSchemaPart(key as string[]);
        const pk: PkConfig<TAuto> = { key: primaryKeyPart, auto };
        const indicesSchema = indexParts.join(",");
        if (mapToClass) {
          const mapToClasstableConfig: TableConfig<
            TDatabase,
            TPKeyPathOrPaths,
            TAuto,
            TIndexPaths,
            TGet
          > = {
            pk,
            indicesSchema,
            mapToClass,
          };
          return mapToClasstableConfig;
        }

        const tableConfig: TableConfig<
          TDatabase,
          TPKeyPathOrPaths,
          TAuto,
          TIndexPaths,
          TGet
        > = {
          pk,
          indicesSchema,
        };
        return tableConfig;
      },
    };
  }

  return {
    autoIncrement<
      TPKeyPath extends InboundAutoIncrementKeyPath<TDatabase, TKeyMaxDepth>
    >(key: TPKeyPath) {
      return createIndexMethods(key, true, [] as const, true, null as never);
    },
    primaryKey<
      TPKeyPath extends ValidIndexedDBKeyPath<
        TDatabase,
        TAllowTypeSpecificProperties,
        TKeyMaxDepth,
        false
      > &
        string
    >(key: TPKeyPath) {
      return createIndexMethods(key, false, [] as const, true, null as never);
    },
    compoundKey<
      const TCompoundKeyPaths extends CompoundKeyPaths<
        TDatabase,
        TAllowTypeSpecificProperties,
        TKeyMaxDepth,
        false
      >
    >(
      ...keys: TCompoundKeyPaths
    ): NoDuplicates<TCompoundKeyPaths> extends never
      ? DuplicateKeysError
      : IndexMethods<
          TDatabase,
          TCompoundKeyPaths,
          false,
          [],
          TGet,
          false,
          never,
          TAllowTypeSpecificProperties,
          TKeyMaxDepth
        > {
      return createIndexMethods(
        keys,
        false,
        [] as const,
        true,
        null as never
      ) as any;
    },

    hiddenAuto<PKey extends IndexableType = number>(
      ...args: IncludesNumberInUnion<PKey> extends false
        ? PKey extends number
          ? []
          : [never] // Error: PKey must include number in union
        : []
    ) {
      return createIndexMethods(
        null,
        true,
        [] as const,
        false,
        null as unknown as PKey
      );
    },
    hiddenExplicit<PKey extends IndexableType = number>() {
      return createIndexMethods(
        null,
        false,
        [] as const,
        false,
        null as unknown as PKey
      );
    },
  };
}

export function tableBuilder<
  TDatabase,
  TMaxDepth extends string = Level2,
  TKeyMaxDepth extends string = NoDescend,
  TAllowTypeSpecificProperties extends boolean = false
>() {
  return createTableBuilder<
    TDatabase,
    TDatabase,
    TAllowTypeSpecificProperties,
    TKeyMaxDepth,
    TMaxDepth
  >();
}

export function tableClassBuilder<
  TGetCtor extends new (...args: any) => any,
  TMaxDepth extends string = Level2,
  TKeyMaxDepth extends string = NoDescend,
  TAllowTypeSpecificProperties extends boolean = false
>(ctor: TGetCtor) {
  type TEntity = InstanceType<TGetCtor>;
  type TDatabase = InsertType<TEntity, never>;

  return createTableBuilder<
    TDatabase,
    TEntity,
    TAllowTypeSpecificProperties,
    TKeyMaxDepth,
    TMaxDepth
  >(ctor);
}

export function tableClassBuilderExcluded<
  TGetCtor extends new (...args: any) => any,
  TMaxDepth extends string = Level2,
  TKeyMaxDepth extends string = NoDescend,
  TAllowTypeSpecificProperties extends boolean = false
>(ctor: TGetCtor) {
  type TGet = InstanceType<TGetCtor>;
  return {
    excludedKeys<TExcludeProps extends keyof TGet & string>() {
      type T = Omit<TGet, TExcludeProps>;
      type TDatabase = InsertType<T, never>;

      return createTableBuilder<
        TDatabase,
        TGet,
        TAllowTypeSpecificProperties,
        TKeyMaxDepth,
        TMaxDepth
      >(ctor);
    },
  };
}
