// ---------- Helpers ----------

import type { StringKey } from "./utilitytypes";

type IsValidKey<T> = T extends AllowedKeyLeaf
  ? true
  : T extends readonly any[]
  ? ArrayElement<T> extends infer Elem
    ? IsValidKey<Elem>
    : false
  : false;
export type AllowedKeyLeaf =
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

type NoPrefix = "";
type WithSuffix<
  TPossiblePrefix extends string,
  TSuffix extends string
> = TPossiblePrefix extends NoPrefix
  ? TSuffix
  : `${TPossiblePrefix}.${TSuffix}`;

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

export type KeyPathNoDescend = "";

export type ValidIndexedDBKeyPath<
  T,
  TAllowTypeSpecificProperties extends boolean = true,
  TMaxDepth extends string = KeyPathNoDescend
> = ValidIndexedDBKeyPathRecursive<
  T,
  NoPrefix,
  TAllowTypeSpecificProperties,
  TMaxDepth
>;

type PropertyKeyPaths<
  T,
  P extends StringKey<T>,
  Prefix extends string,
  TAllowTypeSpecificProperties extends boolean,
  MAXDEPTH extends string,
  CURRDEPTH extends string = "",
  Descend extends boolean = true
> = IsAllowedLeaf<T[P]> extends true
  ? LeafPath<Prefix, T[P], P, TAllowTypeSpecificProperties>
  : IsFile<T[P]> extends true
  ? FilePathProperties<Prefix, P, TAllowTypeSpecificProperties>
  : IsBlob<T[P]> extends true
  ? BlobPathProperties<Prefix, P, TAllowTypeSpecificProperties>
  : IsArray<T[P]> extends true
  ? ArrayElement<T[P]> extends infer Elem
    ? IsValidKey<Elem> extends true
      ? Elem extends string
        ? WithKeyAndTypeSpecificPropertyPaths<
            Prefix,
            P,
            ["length"],
            TAllowTypeSpecificProperties
          >
        : WithSuffix<Prefix, P>
      : never
    : never
  : T[P] extends object
  ? Descend extends true
    ? ValidIndexedDBKeyPathRecursive<
        T[P],
        WithSuffix<Prefix, P>,
        TAllowTypeSpecificProperties,
        MAXDEPTH,
        `${CURRDEPTH}I`
      >
    : never
  : never;

type ValidIndexedDBKeyPathRecursive<
  T,
  Prefix extends string,
  TAllowTypeSpecificProperties extends boolean,
  MAXDEPTH extends string,
  CURRDEPTH extends string = ""
> = {
  [P in StringKey<T>]: CURRDEPTH extends MAXDEPTH
    ? PropertyKeyPaths<
        T,
        P,
        Prefix,
        TAllowTypeSpecificProperties,
        MAXDEPTH,
        CURRDEPTH,
        false
      >
    : PropertyKeyPaths<
        T,
        P,
        Prefix,
        TAllowTypeSpecificProperties,
        MAXDEPTH,
        CURRDEPTH
      >;
}[StringKey<T>];

export type CompoundKeyPaths<
  T,
  TAllowTypeSpecificProperties extends boolean = true,
  TMaxDepth extends string = KeyPathNoDescend
> = [
  ValidIndexedDBKeyPath<T, TAllowTypeSpecificProperties, TMaxDepth>,
  ValidIndexedDBKeyPath<T, TAllowTypeSpecificProperties, TMaxDepth>,
  ...ValidIndexedDBKeyPath<T, TAllowTypeSpecificProperties, TMaxDepth>[]
];
