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

export interface IndexMethods<
  TInsert,
  PkPathOrPaths extends DexiePrimaryKeyPathOrPaths<TInsert>,
  Auto extends boolean,
  TIndexPaths extends DexieIndexPaths<TInsert>,
  TGet = TInsert
> {
  index<TIndexPath extends ValidIndexedDBKeyPath<TInsert>>(
    indexPath: TIndexPath
  ): IndexMethods<
    TInsert,
    PkPathOrPaths,
    Auto,
    [...TIndexPaths, SingleIndexPath<TInsert, TIndexPath>]
  >;
  unique<TIndexPath extends ValidIndexedDBKeyPath<TInsert>>(
    indexPath: TIndexPath
  ): IndexMethods<
    TInsert,
    PkPathOrPaths,
    Auto,
    [...TIndexPaths, SingleIndexPath<TInsert, TIndexPath>]
  >;
  multi<TIndexPath extends MultiEntryKeyPath<TInsert>>(
    indexPath: TIndexPath
  ): IndexMethods<
    TInsert,
    PkPathOrPaths,
    Auto,
    [...TIndexPaths, MultiIndexPath<TInsert, TIndexPath>]
  >;
  compound<TCompoundIndexPaths extends CompoundKeyPaths<TInsert>>(
    ...indexPaths: TCompoundIndexPaths
  ): IndexMethods<
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
        indexParts.push(indexKey);
        return createIndexMethods(key, auto, [
          ...indices,
          { kind: "single", path: indexKey, multi: false },
        ]);
      },
      unique(indexKey) {
        indexParts.push(`&${indexKey}`);
        return createIndexMethods(key, auto, [
          ...indices,
          { kind: "single", path: indexKey, multi: false },
        ]);
      },
      multi(indexKey) {
        indexParts.push(`*${indexKey}`);
        return createIndexMethods(key, auto, [
          ...indices,
          { kind: "multi", path: indexKey, multi: true },
        ]);
      },
      compound(...keys) {
        if (!isDistinctArray(keys)) {
          throw new Error("Duplicate keys in compound index are not allowed");
        }
        if (keys.length < 2) {
          throw new Error("Compound index must have at least two keys");
        }
        indexParts.push(`[${keys.join("+")}]`);
        return createIndexMethods(key, auto, [
          ...indices,
          { kind: "compound", paths: keys },
        ]);
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
      return createIndexMethods(key, true, []);
    },
    primaryKey<K extends ValidIndexedDBKeyPath<T>>(key: K) {
      return createIndexMethods(key, false, []);
    },
    compoundKey<const K extends CompoundKeyPaths<T>>(keys: K) {
      return createIndexMethods(keys, false, []);
    },
    hiddenAuto() {
      return createIndexMethods(null as never, true, []);
    },
    hiddenExplicit<K>() {
      return createIndexMethods(null as never, false, []);
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
