import type { KeyPathValue } from "dexie";
import type { UnionToIntersection } from "./utilitytypes";

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

type First<T extends readonly any[]> = T extends readonly [infer A, ...any[]]
  ? A
  : never;

type Prefixes<T extends readonly any[]> = T extends readonly [infer A]
  ? readonly [A]
  : T extends readonly [infer A, ...infer Rest]
  ? readonly [A] | readonly [A, ...Prefixes<Rest>]
  : never;

type DemoPrefixes = Prefixes<["a", "b", "c", "d"]>;

/*
  Accumulate:
  - Brand is a tuple of key types corresponding to Paths (same length).
  - Produce a union beginning with the full tuple (Paths, Brand), then
    drop the last element from both Brand and Paths and include that shorter
    tuple, then repeat until only the single-path case would remain.
  - The single-path (first element) is emitted separately in IndexPathRegistry
    as a plain string, so Accumulate should stop when the remaining Paths would
    have length 1.
*/
type Accumulate<
  Brand extends readonly any[],
  Paths extends readonly string[]
> = Paths extends [
  ...infer RestPaths extends string[],
  infer _LastPath extends string
]
  ? Brand extends [...infer RestBrand extends any[], infer _LastBrand]
    ? // If RestPaths is a single-element tuple, include the current Paths (length 2)
      // and stop (single element handled separately).
      RestPaths extends readonly [any]
      ? { path: Paths; keyType: Brand }
      : // Otherwise include current full tuple and recurse dropping the last element.
        { path: Paths; keyType: Brand } | Accumulate<RestBrand, RestPaths>
    : never
  : never;

export type IndexPathRegistry<
  TInsert,
  TIndexPaths extends readonly DexieIndexPath<TInsert>[]
> = {
  [K in keyof TIndexPaths]: TIndexPaths[K] extends {
    path: infer P;
    [KeyTypeBrand]?: infer Brand;
  }
    ? {
        path: P;
        keyType: Brand;
      }
    : TIndexPaths[K] extends {
        paths: infer Paths extends readonly string[];
        [KeyTypeBrand]?: infer Brand extends readonly any[];
      }
    ? // note that single entry array is not supported
      | {
            path: First<Paths>;
            keyType: First<Brand>;
          }
        | Accumulate<Brand, Paths>
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
