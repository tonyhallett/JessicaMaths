import type { KeyPathValue } from "dexie";

declare const KeyTypeBrand: unique symbol;
export type SingleIndexPath<T, P extends string> = {
  path: P;
  multi: false;
  [KeyTypeBrand]?: KeyPathValue<T, P>;
};

export type MultiIndexPath<T, P extends string> = {
  path: P;
  multi: true;
  [KeyTypeBrand]?: KeyPathValue<T, P> extends readonly (infer Elem)[]
    ? Elem
    : KeyPathValue<T, P>;
};

type CompoundKeyPathsAsStr = [string, string, ...string[]];

export type CompoundIndexPaths<T, PS extends CompoundKeyPathsAsStr> = {
  paths: PS;
  [KeyTypeBrand]?: { [K in keyof PS]: KeyPathValue<T, PS[K] & string> };
};

export type DexieIndexPath<T> =
  | SingleIndexPath<T, any>
  | MultiIndexPath<T, any>
  | CompoundIndexPaths<T, any>;

export type DexieIndexPaths<T> = readonly DexieIndexPath<T>[];

export type IndexPathRegistry<
  TInsert,
  TIndexPaths extends readonly DexieIndexPath<TInsert>[]
> = {
  [K in keyof TIndexPaths]: TIndexPaths[K] extends { path: infer P }
    ? {
        path: P;
        keyType: NonNullable<TIndexPaths[K][typeof KeyTypeBrand]>;
      }
    : TIndexPaths[K] extends { paths: infer Paths }
    ? {
        path: Paths;
        keyType: NonNullable<TIndexPaths[K][typeof KeyTypeBrand]>;
      }
    : never;
};

export type IndexPath<
  T,
  I extends DexieIndexPath<T>
> = I extends SingleIndexPath<T, infer P>
  ? I["path"]
  : I extends MultiIndexPath<T, infer P>
  ? I["path"]
  : I extends CompoundIndexPaths<T, infer Ps>
  ? I["paths"]
  : never;

export type IndexPathForPath<
  T,
  TIndexes extends readonly DexieIndexPath<T>[],
  Path
> = TIndexes[number] extends infer I
  ? I extends SingleIndexPath<T, infer P>
    ? Path extends P
      ? I
      : never
    : I extends MultiIndexPath<T, infer P>
    ? Path extends P
      ? I
      : never
    : I extends CompoundIndexPaths<T, infer Ps>
    ? Path extends Ps
      ? I
      : never
    : never
  : never;

export type KeyForIndexPath<T, TIndexPath> =
  // Single: key is the value stored at the path
  TIndexPath extends SingleIndexPath<T, infer Path>
    ? KeyPathValue<T, Path>
    : // Multi: the index points to an array field; collection key should be the element type
    TIndexPath extends MultiIndexPath<T, infer Path>
    ? KeyPathValue<T, Path> extends readonly (infer Elem)[]
      ? Elem
      : KeyPathValue<T, Path>
    : // Compound: tuple of the per-path key values
    TIndexPath extends CompoundIndexPaths<T, infer Paths>
    ? { [K in keyof Paths]: KeyPathValue<T, Paths[K] & string> } // keeps path order
    : never;

export type ExtractIndexPaths<
  TInsert,
  TIndexPaths extends DexieIndexPaths<TInsert>
> = TIndexPaths[number] extends infer I
  ? I extends SingleIndexPath<TInsert, any>
    ? I["path"]
    : I extends MultiIndexPath<TInsert, any>
    ? I["path"]
    : I extends CompoundIndexPaths<TInsert, any>
    ? I["paths"]
    : never
  : never;
