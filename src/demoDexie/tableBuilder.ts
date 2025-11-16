import type { KeyPathValue, InsertType } from "dexie";
import type {
  DexiePlainKey,
  DexieIndexes,
  SingleIndex,
  MultiIndex,
  CompoundIndex,
} from "./dexieindexes";
import type {
  AllowedKeyLeaf,
  ValidIndexedDBKeyPaths,
} from "./ValidIndexedDBKeyPaths";
import type { OptionalPrimaryKeys } from "./utilitytypes";

export interface TableConfig<
  T,
  PK extends DexiePlainKey<T>,
  Auto extends boolean,
  Indices extends DexieIndexes<T>,
  TInsert = T,
  TGet = T
> {
  readonly pk: { key: PK; auto: Auto };
  readonly indicesSchema: string;
  readonly mapToClass?: ConstructorOf<T>;
  excludedKeys: string[] | undefined;
}

type IsMultiEntryArray<T> = T extends readonly (infer E)[]
  ? E extends AllowedKeyLeaf
    ? true
    : false
  : false;

export type MultiEntryKeyPaths<T> = ValidIndexedDBKeyPaths<
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
  T,
  K extends DexiePlainKey<T>,
  Auto extends boolean,
  Indices extends DexieIndexes<T>,
  TInsert = T,
  TGet = T
> {
  index<I extends ValidIndexedDBKeyPaths<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, SingleIndex<T, I>]>;
  unique<I extends ValidIndexedDBKeyPaths<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, SingleIndex<T, I>]>;
  multi<I extends MultiEntryKeyPaths<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, MultiIndex<T, I>]>;
  compound<I extends ValidIndexedDBKeyPaths<T>[]>(
    ...indexKeys: I
  ): IndexMethods<T, K, Auto, [...Indices, CompoundIndex<T, I>]>;
  build(): TableConfig<T, K, Auto, Indices, TInsert, TGet>;
}

const isDistinctArray = (arr: readonly any[]): boolean => {
  return Array.from(new Set(arr)).length === arr.length;
};

export function tableBuilder<T>() {
  const indexParts: string[] = [];

  function createIndexMethods<
    K extends ValidIndexedDBKeyPaths<T> | ValidIndexedDBKeyPaths<T>[],
    Auto extends boolean,
    Indices extends DexieIndexes<T>
  >(key: K, auto: Auto, indices: Indices): IndexMethods<T, K, Auto, Indices> {
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
        const tableConfig: TableConfig<T, K, Auto, Indices> = {
          pk: { key, auto },
          indicesSchema: indexParts.join(", "),
          excludedKeys: undefined,
        };
        return tableConfig;
      },
    };
  }

  return {
    autoIncrement<K extends ValidIndexedDBKeyPaths<T, "", false>>(key: K) {
      return createIndexMethods(key, true, []);
    },
    primaryKey<K extends ValidIndexedDBKeyPaths<T>>(key: K) {
      return createIndexMethods(key, false, []);
    },
    compoundKey<const K extends ValidIndexedDBKeyPaths<T>[]>(keys: K) {
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
      const indexParts: string[] = [];

      type TInsert = InsertType<T, never>;

      function createIndexMethods<
        K extends ValidIndexedDBKeyPaths<T> | ValidIndexedDBKeyPaths<T>[],
        Auto extends boolean,
        Indices extends DexieIndexes<T>
      >(
        key: K,
        auto: Auto,
        indices: Indices
      ): IndexMethods<
        T,
        K,
        Auto,
        Indices,
        Auto extends true ? OptionalPrimaryKeys<TInsert, K> : TInsert,
        TEntity
      > {
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
              throw new Error(
                "Duplicate keys in compound index are not allowed"
              );
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
            const tableConfig: TableConfig<
              T,
              K,
              Auto,
              Indices,
              OptionalPrimaryKeys<TInsert, K>
            > = {
              pk: { key, auto },
              indicesSchema: indexParts.join(", "),
              mapToClass: ctor,
              excludedKeys: excludedKeys ? [...excludedKeys] : undefined,
            };

            return tableConfig;
          },
        };
      }

      return {
        autoIncrement<K extends ValidIndexedDBKeyPaths<T, "", false>>(key: K) {
          return createIndexMethods(key, true, []);
        },
        primaryKey<K extends ValidIndexedDBKeyPaths<T>>(key: K) {
          return createIndexMethods(key, false, []);
        },
        compoundKey<const K extends ValidIndexedDBKeyPaths<T>[]>(keys: K) {
          return createIndexMethods(keys, false, []);
        },
        hiddenAuto() {
          return createIndexMethods(null as never, true, []);
        },
        hiddenExplicit<K>() {
          return createIndexMethods(null as never, false, []);
        },
      };
    },
  };
}
