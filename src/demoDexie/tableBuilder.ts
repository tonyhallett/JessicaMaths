import type { KeyPathValue } from "dexie";
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

export interface TableConfig<
  T,
  PK extends DexiePlainKey<T>,
  Auto extends boolean,
  Indices extends DexieIndexes<T>
> {
  readonly pk: { key: PK; auto: Auto };
  readonly indicesSchema: string;
  readonly indices: Indices;
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
  Indices extends DexieIndexes<T>
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
  build(): TableConfig<T, K, Auto, Indices>;
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
        return {
          pk: { key, auto },
          indicesSchema: indexParts.join(", "),
          indices,
        };
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
