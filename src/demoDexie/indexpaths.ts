import type { KeyPathValue } from "dexie";
import type {
  CompoundKeyPaths,
  ValidIndexedDBKeyPath,
} from "./ValidIndexedDBKeyPaths";

export type SingleIndexPath<T, P extends ValidIndexedDBKeyPath<T>> = {
  //kind: "single";
  path: P;
  multi: false;
};

export type MultiIndexPath<T, P extends ValidIndexedDBKeyPath<T>> = {
  //kind: "multi";
  path: P;
  multi: true;
};

export type CompoundIndexPaths<T, PS extends CompoundKeyPaths<T>> = {
  //kind: "compound";
  paths: PS;
};

export type DexieIndexPath<T> =
  | SingleIndexPath<T, any>
  | MultiIndexPath<T, any>
  | CompoundIndexPaths<T, any>;

export type DexieIndexPaths<T> = readonly DexieIndexPath<T>[];

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
