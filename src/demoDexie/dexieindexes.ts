import type {
  CompoundKeyPaths,
  ValidIndexedDBKeyPath,
} from "./ValidIndexedDBKeyPaths";

export type SingleIndexPath<T, P extends ValidIndexedDBKeyPath<T>> = {
  kind: "single";
  path: P;
  multi: false;
};

export type MultiIndexPath<T, P extends ValidIndexedDBKeyPath<T>> = {
  kind: "multi";
  path: P;
  multi: true;
};

export type CompoundIndexPaths<T, PS extends CompoundKeyPaths<T>> = {
  kind: "compound";
  paths: PS;
};

export type DexieIndexPath<T> =
  | SingleIndexPath<T, any>
  | MultiIndexPath<T, any>
  | CompoundIndexPaths<T, any>;

export type DexieIndexPaths<T> = readonly DexieIndexPath<T>[];
