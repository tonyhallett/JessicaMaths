export interface TableConfig<
  T,
  PK extends keyof T,
  Auto extends boolean,
  Indices extends DexieIndices<T>
> {
  readonly pk: { key: PK; auto: Auto };
  readonly indicesSchema: string;
  readonly indices: Indices;
}
type DexieCompoundIndex<T> = ValidIndexedDBKeyPaths<T>[];
type DexieIndex<T> = ValidIndexedDBKeyPaths<T> | DexieCompoundIndex<T>;
export type DexieIndices<T> = DexieIndex<T>[];

// ---------- Helpers ----------
type StringKey<T> = keyof T & string;
type AllowedKeyLeaf = string | number | Date | ArrayBuffer;
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
  TProperties extends readonly string[]
> = TProperties[number] extends infer P
  ? P extends string
    ? WithSuffix<TPossiblePrefix, `${TKey}.${P}`>
    : never
  : never;

type WithKeyAndTypeSpecificPropertyPaths<
  TPossiblePrefix extends string,
  TKey extends string,
  TProperties extends readonly string[]
> =
  | WithTypeSpecificPropertyPaths<TPossiblePrefix, TKey, TProperties>
  | WithSuffix<TPossiblePrefix, TKey>;

type LeafPath<
  PossiblePrefix extends string,
  TLeafType,
  TKey extends string
> = TLeafType extends string
  ? WithKeyAndTypeSpecificPropertyPaths<PossiblePrefix, TKey, ["length"]>
  : WithSuffix<PossiblePrefix, TKey>;

type BlobPathProperties<
  TPossiblePrefix extends string,
  TKey extends string
> = WithTypeSpecificPropertyPaths<TPossiblePrefix, TKey, ["size", "type"]>;

type FilePathProperties<TPossiblePrefix extends string, TKey extends string> =
  | WithTypeSpecificPropertyPaths<
      TPossiblePrefix,
      TKey,
      ["name", "lastModified"]
    >
  | BlobPathProperties<TPossiblePrefix, TKey>;

// ---------- Main recursive type ----------
export type ValidIndexedDBKeyPaths<T, Prefix extends string = NoPefix> = {
  [P in StringKey<T>]: IsAllowedLeaf<T[P]> extends true // Case A: Allowed leaf type
    ? LeafPath<Prefix, T[P], P>
    : IsFile<T[P]> extends true
    ? FilePathProperties<Prefix, P>
    : IsBlob<T[P]> extends true
    ? BlobPathProperties<Prefix, P>
    : // todo - this needs to be checked !
    IsArray<T[P]> extends true
    ? ArrayElement<T[P]> extends infer Elem
      ? Elem extends AllowedKeyLeaf
        ? WithSuffix<Prefix, P>
        : Elem extends string
        ? WithKeyAndTypeSpecificPropertyPaths<Prefix, P, ["length"]>
        : Elem extends object
        ? ValidIndexedDBKeyPaths<Elem, WithSuffix<Prefix, P>>
        : never
      : never
    : T[P] extends object
    ? ValidIndexedDBKeyPaths<T[P], WithSuffix<Prefix, P>>
    : never;
}[StringKey<T>];

export interface IndexMethods<
  T,
  K extends keyof T,
  Auto extends boolean,
  Indices extends DexieIndices<T>
> {
  index<I extends ValidIndexedDBKeyPaths<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, I]>;
  unique<I extends ValidIndexedDBKeyPaths<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, I]>;
  multi<I extends ValidIndexedDBKeyPaths<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, I]>;
  compound<I extends DexieCompoundIndex<T>>(
    indexKey: I
  ): IndexMethods<T, K, Auto, [...Indices, I]>;
  build(): TableConfig<T, K, Auto, Indices>;
}

export function tableBuilder<T>() {
  const indexParts: string[] = [];

  function createIndexMethods<
    K extends keyof T,
    Auto extends boolean,
    Indices extends DexieIndices<T>
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
        const distinctKeys = Array.from(new Set(keys));
        if (distinctKeys.length !== keys.length) {
          throw new Error("Duplicate keys in compound index are not allowed");
        }
        if (keys.length < 2) {
          throw new Error("Compound index must have at least two keys");
        }
        indexParts.push(`[${keys.join("+")}]`);
        return createIndexMethods(key, auto, [...indices, keys]);
      },
      build() {
        return {
          pk: { key, auto },
          indicesSchema: indexParts.join(", "),
          indices: indices,
        };
      },
    };
  }

  return {
    autoIncrement<K extends keyof T>(key: K) {
      return createIndexMethods(key, true, []);
    },
    primaryKey<K extends keyof T>(key: K) {
      return createIndexMethods(key, false, []);
    },
    hiddenAuto() {
      return createIndexMethods(null as never, true, []);
    },
    hiddenExplicit<K>() {
      return createIndexMethods(null as never, false, []);
    },
  };
}
