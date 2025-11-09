import type { UpdateKeyPathValue } from "./better-dexie";

export interface TableConfig<
  T,
  PK extends DexieIndex<T>,
  Auto extends boolean,
  Indices extends DexieIndexes<T>
> {
  readonly pk: { key: PK; auto: Auto };
  readonly indicesSchema: string;
  readonly indices: Indices;
}
export type DexieCompoundIndex<T> = ValidIndexedDBKeyPaths<T>[];
export type DexieIndex<T> = ValidIndexedDBKeyPaths<T> | DexieCompoundIndex<T>;
export type DexieIndexes<T> = DexieIndex<T>[];

// ---------- Helpers ----------
type StringKey<T> = keyof T & string;
type AllowedKeyLeaf =
  | string
  | number
  | Date
  | ArrayBuffer
  | ArrayBufferView
  | DataView;
type IsAllowedLeaf<T> = [T] extends [AllowedKeyLeaf] ? true : false;
type IsArray<T> = T extends readonly (infer E)[] ? true : false;
type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;
type IsFile<T> = T extends File ? true : false;
type IsBlob<T> = T extends Blob ? true : false;

type NoPefix = "";
type WithSuffix<
  TPossiblePrefix extends string,
  TSuffix extends string
> = TPossiblePrefix extends NoPefix ? TSuffix : `${TPossiblePrefix}.${TSuffix}`;

type WithTypeSpecificPropertyPaths<
  TPossiblePrefix extends string,
  TKey extends string,
  TProperties extends readonly string[],
  TAllowTypeSpecificProperties extends boolean
> = TAllowTypeSpecificProperties extends true
  ? TProperties[number] extends infer P
    ? P extends string
      ? WithSuffix<TPossiblePrefix, `${TKey}.${P}`>
      : never
    : never
  : never;

type WithKeyAndTypeSpecificPropertyPaths<
  TPossiblePrefix extends string,
  TKey extends string,
  TProperties extends readonly string[],
  TAllowTypeSpecificProperties extends boolean
> =
  | WithTypeSpecificPropertyPaths<
      TPossiblePrefix,
      TKey,
      TProperties,
      TAllowTypeSpecificProperties
    >
  | WithSuffix<TPossiblePrefix, TKey>;

type LeafPath<
  PossiblePrefix extends string,
  TLeafType,
  TKey extends string,
  TAllowTypeSpecificProperties extends boolean
> = TLeafType extends string
  ? WithKeyAndTypeSpecificPropertyPaths<
      PossiblePrefix,
      TKey,
      ["length"],
      TAllowTypeSpecificProperties
    >
  : WithSuffix<PossiblePrefix, TKey>;

type BlobPathProperties<
  TPossiblePrefix extends string,
  TKey extends string,
  TAllowTypeSpecificProperties extends boolean
> = WithTypeSpecificPropertyPaths<
  TPossiblePrefix,
  TKey,
  ["size", "type"],
  TAllowTypeSpecificProperties
>;

type FilePathProperties<
  TPossiblePrefix extends string,
  TKey extends string,
  TAllowTypeSpecificProperties extends boolean
> =
  | WithTypeSpecificPropertyPaths<
      TPossiblePrefix,
      TKey,
      ["name", "lastModified"],
      TAllowTypeSpecificProperties
    >
  | BlobPathProperties<TPossiblePrefix, TKey, TAllowTypeSpecificProperties>;

// ---------- Main recursive type ----------
export type ValidIndexedDBKeyPaths<
  T,
  Prefix extends string = NoPefix,
  TAllowTypeSpecificProperties extends boolean = true
> = {
  [P in StringKey<T>]: IsAllowedLeaf<T[P]> extends true // Case A: Allowed leaf type
    ? LeafPath<Prefix, T[P], P, TAllowTypeSpecificProperties>
    : IsFile<T[P]> extends true
    ? FilePathProperties<Prefix, P, TAllowTypeSpecificProperties>
    : IsBlob<T[P]> extends true
    ? BlobPathProperties<Prefix, P, TAllowTypeSpecificProperties>
    : // todo - this needs to be checked !
    IsArray<T[P]> extends true
    ? ArrayElement<T[P]> extends infer Elem
      ? Elem extends AllowedKeyLeaf
        ? WithSuffix<Prefix, P>
        : Elem extends string
        ? WithKeyAndTypeSpecificPropertyPaths<
            Prefix,
            P,
            ["length"],
            TAllowTypeSpecificProperties
          >
        : Elem extends object
        ? ValidIndexedDBKeyPaths<
            Elem,
            WithSuffix<Prefix, P>,
            TAllowTypeSpecificProperties
          >
        : never
      : never
    : T[P] extends object
    ? ValidIndexedDBKeyPaths<
        T[P],
        WithSuffix<Prefix, P>,
        TAllowTypeSpecificProperties
      >
    : never;
}[StringKey<T>];

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
    ? IsMultiEntryArray<UpdateKeyPathValue<T, P>> extends true
      ? P
      : never
    : never
  : never;

export interface IndexMethods<
  T,
  K extends DexieIndex<T>,
  Auto extends boolean,
  Indices extends DexieIndexes<T>
> {
  index<I extends ValidIndexedDBKeyPaths<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, I]>;
  unique<I extends ValidIndexedDBKeyPaths<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, I]>;
  multi<I extends MultiEntryKeyPaths<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, I]>;
  compound<I extends DexieCompoundIndex<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, I]>;
  build(): TableConfig<T, K, Auto, Indices>;
}

const isDistinctArray = (arr: any[]): boolean => {
  return Array.from(new Set(arr)).length === arr.length;
};

export function tableBuilder<T>() {
  const indexParts: string[] = [];

  function createIndexMethods<
    K extends DexieIndex<T>,
    Auto extends boolean,
    Indices extends DexieIndexes<T>
  >(key: K, auto: Auto, indices: Indices): IndexMethods<T, K, Auto, Indices> {
    return {
      index(indexKey) {
        indexParts.push(indexKey);
        return createIndexMethods(key, auto, [...indices, indexKey]);
      },
      unique(indexKey) {
        indexParts.push(`&${indexKey}`);
        return createIndexMethods(key, auto, [...indices, indexKey]);
      },
      multi(indexKey) {
        indexParts.push(`*${indexKey}`);
        return createIndexMethods(key, auto, [...indices, indexKey]);
      },
      compound(keys) {
        if (!isDistinctArray(keys)) {
          throw new Error("Duplicate keys in compound index are not allowed");
        }
        if (keys.length < 2) {
          throw new Error("Compound index must have at least two keys");
        }
        indexParts.push(`[${keys.join("+")}]`);
        return createIndexMethods(key, auto, [...indices, keys]);
      },
      build() {
        if (!isDistinctArray(indexParts)) {
          throw new Error("Duplicate indexes are not allowed");
        }
        return {
          pk: { key, auto },
          indicesSchema: indexParts.join(", "),
          indices: indices,
        };
      },
    };
  }

  return {
    autoIncrement<K extends ValidIndexedDBKeyPaths<T, "", false>>(key: K) {
      return createIndexMethods(key, true, []);
    },
    primaryKey<K extends DexieIndex<T>>(key: K) {
      return createIndexMethods(key, false, []);
    },
    compoundKey<K extends DexieCompoundIndex<T>>(keys: K) {
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
