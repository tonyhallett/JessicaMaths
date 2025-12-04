import type { KeyPathValue } from "dexie";
import type { PathKeyType } from "./utilitytypes";

export declare const KeyTypeBrand: unique symbol;
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

export type CompoundKeyPathsAsStr = [string, string, ...string[]];

export type CompoundIndexPaths<T, PS extends CompoundKeyPathsAsStr> = {
  paths: PS;
  [KeyTypeBrand]?: { [K in keyof PS]: KeyPathValue<T, PS[K] & string> };
};

export type DexieIndexPath<T> =
  | SingleIndexPath<T, any>
  | MultiIndexPath<T, any>
  | CompoundIndexPaths<T, any>;

export type DexieIndexPaths<T> = readonly DexieIndexPath<T>[];

type Accumulate<
  Brand extends readonly any[],
  Paths extends readonly string[]
> = Paths extends [...infer Rest extends string[], infer Last extends string]
  ? Brand extends [...infer RestB extends any[], infer LastB]
    ? Rest["length"] extends 0
      ? readonly [PathKeyType<Last, LastB>] // single element tuple
      : readonly [...Accumulate<RestB, Rest>, PathKeyType<Paths, Brand>] // recurse dropping the last
    : []
  : [];

type PathWithKeysForDexieIndexPath<T extends DexieIndexPath<any>> = T extends {
  path: infer P extends string | readonly string[];
  [KeyTypeBrand]?: infer Brand;
}
  ? readonly [PathKeyType<P, Brand>]
  : T extends {
      paths: infer Paths extends readonly string[];
      [KeyTypeBrand]?: infer Brand extends readonly any[];
    }
  ? Accumulate<Brand, Paths>
  : [];

export type IndexPathRegistry<
  TDatabase,
  TIndexPaths extends readonly DexieIndexPath<TDatabase>[]
> = TIndexPaths extends readonly [infer H, ...infer Rest]
  ? H extends DexieIndexPath<TDatabase>
    ? Rest extends readonly DexieIndexPath<TDatabase>[]
      ? readonly [
          ...PathWithKeysForDexieIndexPath<H>,
          ...IndexPathRegistry<TDatabase, Rest>
        ]
      : []
    : []
  : [];

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
