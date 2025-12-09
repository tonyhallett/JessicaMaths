// ---------- Helpers ----------

import type { NextDepth, NoDescend, StringKey } from "./utilitytypes";

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

type IsAllowedLeaf<T, TIsIndexPath extends boolean> = [
  CleanForIndex<T, TIsIndexPath>
] extends [AllowedKeyLeaf]
  ? true
  : false;

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
  TPossiblePrefix extends string,
  TLeafType,
  TKey extends string,
  TAllowTypeSpecificProperties extends boolean
> = TLeafType extends string
  ? WithKeyAndTypeSpecificPropertyPaths<
      TPossiblePrefix,
      TKey,
      ["length"],
      TAllowTypeSpecificProperties
    >
  : WithSuffix<TPossiblePrefix, TKey>;

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

export type ValidIndexedDBKeyPath<
  T,
  TAllowTypeSpecificProperties extends boolean,
  TMaxDepth extends string,
  TIsIndexPath extends boolean
> = ValidIndexedDBKeyPathRecursive<
  T,
  NoPrefix,
  TAllowTypeSpecificProperties,
  TMaxDepth,
  NoDescend,
  TIsIndexPath
>;

type CleanForIndex<T, TIsIndexPath extends boolean> = TIsIndexPath extends true
  ? NonNullable<T>
  : T;

type PropertyKeyPaths<
  T,
  TKey extends StringKey<T>,
  TPrefix extends string,
  TAllowTypeSpecificProperties extends boolean,
  TMaxDepth extends string,
  TCurrDepth extends string,
  TDescend extends boolean,
  TIsIndexPath extends boolean
> = IsAllowedLeaf<T[TKey], TIsIndexPath> extends true
  ? LeafPath<TPrefix, T[TKey], TKey, TAllowTypeSpecificProperties>
  : IsFile<CleanForIndex<T[TKey], TIsIndexPath>> extends true
  ? FilePathProperties<TPrefix, TKey, TAllowTypeSpecificProperties>
  : IsBlob<CleanForIndex<T[TKey], TIsIndexPath>> extends true
  ? BlobPathProperties<TPrefix, TKey, TAllowTypeSpecificProperties>
  : IsArray<T[TKey]> extends true
  ? ArrayElement<T[TKey]> extends infer Elem
    ? IsValidKey<Elem> extends true
      ? Elem extends string
        ? WithKeyAndTypeSpecificPropertyPaths<
            TPrefix,
            TKey,
            ["length"],
            TAllowTypeSpecificProperties
          >
        : WithSuffix<TPrefix, TKey>
      : never
    : never
  : CleanForIndex<T[TKey], TIsIndexPath> extends object
  ? TDescend extends true
    ? ValidIndexedDBKeyPathRecursive<
        CleanForIndex<T[TKey], TIsIndexPath>,
        WithSuffix<TPrefix, TKey>,
        TAllowTypeSpecificProperties,
        TMaxDepth,
        NextDepth<TCurrDepth>,
        TIsIndexPath
      >
    : never
  : never;

type ValidIndexedDBKeyPathRecursive<
  T,
  TPrefix extends string,
  TAllowTypeSpecificProperties extends boolean,
  TMaxDepth extends string,
  TCurrDepth extends string,
  TIsIndexPath extends boolean
> = {
  [P in StringKey<T>]: TCurrDepth extends TMaxDepth
    ? PropertyKeyPaths<
        T,
        P,
        TPrefix,
        TAllowTypeSpecificProperties,
        TMaxDepth,
        TCurrDepth,
        false,
        TIsIndexPath
      >
    : PropertyKeyPaths<
        T,
        P,
        TPrefix,
        TAllowTypeSpecificProperties,
        TMaxDepth,
        TCurrDepth,
        true,
        TIsIndexPath
      >;
}[StringKey<T>];

export type CompoundKeyPaths<
  T,
  TAllowTypeSpecificProperties extends boolean,
  TMaxDepth extends string,
  TIsIndexPath extends boolean
> = [
  ValidIndexedDBKeyPath<
    T,
    TAllowTypeSpecificProperties,
    TMaxDepth,
    TIsIndexPath
  >,
  ValidIndexedDBKeyPath<
    T,
    TAllowTypeSpecificProperties,
    TMaxDepth,
    TIsIndexPath
  >,
  ...ValidIndexedDBKeyPath<
    T,
    TAllowTypeSpecificProperties,
    TMaxDepth,
    TIsIndexPath
  >[]
];
