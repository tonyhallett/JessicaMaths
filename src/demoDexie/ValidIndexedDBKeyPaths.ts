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
  TAllowTypeSpecificProperties extends boolean = true,
  TMaxDepth extends string = NoDescend
> = ValidIndexedDBKeyPathRecursive<
  T,
  NoPrefix,
  TAllowTypeSpecificProperties,
  TMaxDepth,
  NoDescend
>;

type PropertyKeyPaths<
  T,
  TKey extends StringKey<T>,
  TPrefix extends string,
  TAllowTypeSpecificProperties extends boolean,
  TMaxDepth extends string,
  TCurrDepth extends string,
  TDescend extends boolean
> = IsAllowedLeaf<T[TKey]> extends true
  ? LeafPath<TPrefix, T[TKey], TKey, TAllowTypeSpecificProperties>
  : IsFile<T[TKey]> extends true
  ? FilePathProperties<TPrefix, TKey, TAllowTypeSpecificProperties>
  : IsBlob<T[TKey]> extends true
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
  : T[TKey] extends object
  ? TDescend extends true
    ? ValidIndexedDBKeyPathRecursive<
        T[TKey],
        WithSuffix<TPrefix, TKey>,
        TAllowTypeSpecificProperties,
        TMaxDepth,
        NextDepth<TCurrDepth>
      >
    : never
  : never;

type ValidIndexedDBKeyPathRecursive<
  T,
  TPrefix extends string,
  TAllowTypeSpecificProperties extends boolean,
  TMaxDepth extends string,
  TCurrDepth extends string
> = {
  [P in StringKey<T>]: TCurrDepth extends TMaxDepth
    ? PropertyKeyPaths<
        T,
        P,
        TPrefix,
        TAllowTypeSpecificProperties,
        TMaxDepth,
        TCurrDepth,
        false
      >
    : PropertyKeyPaths<
        T,
        P,
        TPrefix,
        TAllowTypeSpecificProperties,
        TMaxDepth,
        TCurrDepth,
        true
      >;
}[StringKey<T>];

export type CompoundKeyPaths<
  T,
  TAllowTypeSpecificProperties extends boolean = true,
  TMaxDepth extends string = NoDescend
> = [
  ValidIndexedDBKeyPath<T, TAllowTypeSpecificProperties, TMaxDepth>,
  ValidIndexedDBKeyPath<T, TAllowTypeSpecificProperties, TMaxDepth>,
  ...ValidIndexedDBKeyPath<T, TAllowTypeSpecificProperties, TMaxDepth>[]
];
