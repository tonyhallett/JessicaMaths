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
  MaxDepth,
  NoDescend,
  NoDuplicates,
  TuplesEqual,
} from "./utilitytypes";

export interface TableConfig<
  TDatabase,
  TPKeyPathOrPaths,
  TAuto extends boolean,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet = TDatabase,
  TInsert = TDatabase,
  TOutboundPKey extends IndexableType = never
> {
  readonly pk: { key: string; auto: TAuto };
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
  TMaxDepth
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
  PkPathOrPaths /*  extends string | readonly string[] */,
  TAllowTypeSpecificProperties extends boolean,
  TMaxDepth extends string
> = TMaxDepth extends MaxDepth<TMaxDepth>
  ? ValidIndexedDBKeyPath<
      ApplySinglePkRemoval<TDatabase, PkPathOrPaths>,
      TAllowTypeSpecificProperties,
      TMaxDepth
    >
  : never;

type MultiIndexKeyPathExcludePrimaryKey<
  TDatabase,
  PkPathOrPaths /* extends string | readonly string[] */,
  TMaxDepth extends string
> = TMaxDepth extends MaxDepth<TMaxDepth>
  ? MultiEntryKeyPath<ApplySinglePkRemoval<TDatabase, PkPathOrPaths>, TMaxDepth>
  : never;

type ApplySinglePkRemoval<
  TDatabase,
  PkPathOrPaths /* extends string | readonly string[] */
> = [PkPathOrPaths] extends [never]
  ? TDatabase
  : PkPathOrPaths extends readonly string[]
  ? TDatabase
  : DeletePrimaryKeys<TDatabase, PkPathOrPaths>;

interface IndexMethods<
  TDatabase,
  PkPathOrPaths /*  extends string | readonly string[] */,
  Auto extends boolean,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet = TDatabase,
  // stored on object - https://dexie.org/docs/inbound
  TPKeyIsInbound extends boolean = false,
  TPKeyOutbound extends IndexableType = never,
  TAllowTypeSpecificProperties extends boolean = false,
  TMaxDepth extends string = NoDescend
> {
  index<
    TIndexPath extends SingleIndexKeyPathExcludePrimaryKey<
      TDatabase,
      PkPathOrPaths,
      TAllowTypeSpecificProperties,
      TMaxDepth
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
        TMaxDepth
      >;
  unique<
    TIndexPath extends SingleIndexKeyPathExcludePrimaryKey<
      TDatabase,
      PkPathOrPaths,
      TAllowTypeSpecificProperties,
      TMaxDepth
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
        TMaxDepth
      >;
  multi<
    TIndexPath extends MultiIndexKeyPathExcludePrimaryKey<
      TDatabase,
      PkPathOrPaths,
      TMaxDepth
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
        TMaxDepth
      >;
  compound<
    const TCompoundIndexPaths extends CompoundKeyPaths<
      TDatabase,
      TAllowTypeSpecificProperties,
      TMaxDepth
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
        TMaxDepth
      >;
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
    TPKeyOutbound
  >;
}

const isDistinctArray = (arr: readonly any[]): boolean => {
  return Array.from(new Set(arr)).length === arr.length;
};

type InboundAutoIncrementKeyPath<
  T,
  TMaxDepth extends string
> = ValidIndexedDBKeyPath<T, false, TMaxDepth> extends infer K
  ? K extends string
    ? IncludesNumber<KeyPathValue<T, K>> extends true
      ? K
      : never
    : never
  : never;

function creteCompoundSchemaPart(keys: string[]): string {
  return `[${keys.join("+")}]`;
}

function createTableBuilder<
  TDatabase,
  TGet,
  TAllowTypeSpecificProperties extends boolean,
  TMaxDepth extends string
>(mapToClass?: ConstructorOf<TDatabase>) {
  const indexParts: string[] = [];

  function createIndexMethods<
    TPKeyPathOrPaths extends string | readonly string[],
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
    TMaxDepth
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
      },
      unique(indexKey) {
        return (
          addIfNotDuplicatePart(`&${indexKey}`) ||
          (createIndexMethods(
            key,
            auto,
            [...indices, { kind: "single", path: indexKey, multi: false }],
            pkeyIsInbound,
            outboundPKey
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
            pkeyIsInbound,
            outboundPKey
          ) as any)
        );
      },
      compound(...keys) {
        if (!isDistinctArray(keys)) {
          return duplicateKeysErrorInstance;
        }
        return (
          addIfNotDuplicatePart(creteCompoundSchemaPart(keys)) ||
          (createIndexMethods(
            key,
            auto,
            [...indices, { kind: "compound", paths: keys }],
            pkeyIsInbound,
            outboundPKey
          ) as any)
        );
      },
      build() {
        const primaryKeyPart =
          typeof key === "string"
            ? key
            : creteCompoundSchemaPart(key as string[]);
        if (mapToClass) {
          const mapToClasstableConfig: TableConfig<
            TDatabase,
            TPKeyPathOrPaths,
            TAuto,
            TIndexPaths,
            TGet
          > = {
            pk: { key: primaryKeyPart, auto },
            indicesSchema: indexParts.join(", "),
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
          pk: { key: primaryKeyPart, auto },
          indicesSchema: indexParts.join(", "),
        };
        return tableConfig;
      },
    };
  }

  return {
    autoIncrement<
      TPKeyPath extends InboundAutoIncrementKeyPath<TDatabase, TMaxDepth>
    >(key: TPKeyPath) {
      return createIndexMethods(key, true, [] as const, true, null as never);
    },
    primaryKey<
      TPKeyPath extends ValidIndexedDBKeyPath<
        TDatabase,
        TAllowTypeSpecificProperties,
        TMaxDepth
      > &
        string
    >(key: TPKeyPath) {
      return createIndexMethods(key, false, [] as const, true, null as never);
    },
    compoundKey<
      const TCompoundKeyPaths extends CompoundKeyPaths<
        TDatabase,
        TAllowTypeSpecificProperties,
        TMaxDepth
      >
    >(
      ...keys: TCompoundKeyPaths
    ): NoDuplicates<TCompoundKeyPaths> extends never
      ? DuplicateKeysError
      : IndexMethods<TDatabase, TCompoundKeyPaths, false, [], TGet> {
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
        null as never,
        true,
        [] as const,
        false,
        null as unknown as PKey
      );
    },
    hiddenExplicit<PKey extends IndexableType = number>() {
      return createIndexMethods(
        null as never,
        false,
        [] as const,
        false,
        null as unknown as PKey
      );
    },
  };
}

export function tableBuilder<
  T,
  TMaxDepth extends string = NoDescend,
  TAllowTypeSpecificProperties extends boolean = false
>() {
  return createTableBuilder<T, T, TAllowTypeSpecificProperties, TMaxDepth>();
}

export function tableClassBuilder<
  TCtor extends new (...args: any) => any,
  TMaxDepth extends string = NoDescend,
  TAllowTypeSpecificProperties extends boolean = false
>(ctor: TCtor) {
  type TEntity = InstanceType<TCtor>;
  type TDatabase = InsertType<TEntity, never>;

  return createTableBuilder<
    TDatabase,
    TEntity,
    TAllowTypeSpecificProperties,
    TMaxDepth
  >(ctor);
}

export function tableClassBuilderExcluded<
  TCtor extends new (...args: any) => any,
  TMaxDepth extends string = NoDescend,
  TAllowTypeSpecificProperties extends boolean = false
>(ctor: TCtor) {
  type TEntity = InstanceType<TCtor>;
  return {
    excludedKeys<TExcludeProps extends keyof TEntity & string>() {
      type T = Omit<TEntity, TExcludeProps>;
      type TDatabase = InsertType<T, never>;

      return createTableBuilder<
        TDatabase,
        TEntity,
        TAllowTypeSpecificProperties,
        TMaxDepth
      >(ctor);
    },
  };
}
