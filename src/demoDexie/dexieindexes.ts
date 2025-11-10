import type { ValidIndexedDBKeyPaths } from "./ValidIndexedDBKeyPaths";

export type SingleIndex<T, P extends ValidIndexedDBKeyPaths<T>> = {
  kind: "single";
  path: P;
  multi: false;
};

export type MultiIndex<T, P extends ValidIndexedDBKeyPaths<T>> = {
  kind: "multi";
  path: P;
  multi: true;
};

export type CompoundIndex<
  T,
  PS extends readonly ValidIndexedDBKeyPaths<T>[]
> = {
  kind: "compound";
  paths: PS;
};

export type DexieIndex<T> =
  | SingleIndex<T, any>
  | MultiIndex<T, any>
  | CompoundIndex<T, any>;

export type DexieIndexes<T> = readonly DexieIndex<T>[];

export type DexiePlainKey<T> =
  | ValidIndexedDBKeyPaths<T>
  | readonly ValidIndexedDBKeyPaths<T>[];
