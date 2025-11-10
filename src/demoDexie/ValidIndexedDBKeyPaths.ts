// ---------- Helpers ----------
export type StringKey<T> = keyof T & string;
export type AllowedKeyLeaf =
  | string
  | number
  | Date
  | ArrayBuffer
  | ArrayBufferView
  | DataView;
export type IsAllowedLeaf<T> = [T] extends [AllowedKeyLeaf] ? true : false;
export type IsArray<T> = T extends readonly (infer E)[] ? true : false;
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;
export type IsFile<T> = T extends File ? true : false;
export type IsBlob<T> = T extends Blob ? true : false;

export type NoPefix = "";
export type WithSuffix<
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

export type WithKeyAndTypeSpecificPropertyPaths<
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

export type LeafPath<
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

export type BlobPathProperties<
  TPossiblePrefix extends string,
  TKey extends string,
  TAllowTypeSpecificProperties extends boolean
> = WithTypeSpecificPropertyPaths<
  TPossiblePrefix,
  TKey,
  ["size", "type"],
  TAllowTypeSpecificProperties
>;

export type FilePathProperties<
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
    : IsArray<T[P]> extends true
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
