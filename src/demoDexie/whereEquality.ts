import type { DexieIndexPaths, KeyTypeBrand } from "./indexpaths";

type CompoundType<T extends readonly any[]> = T extends readonly [infer Only]
  ? Only
  : T;

type CompoundKeyLookupUnion<
  Keys extends readonly string[],
  Values extends readonly any[],
  AccObj extends object = {},
  AccTuple extends readonly any[] = []
> = Keys extends [infer K extends string, ...infer RestKeys extends string[]]
  ? Values extends [infer V, ...infer RestValues]
    ? // next accumulated object and tuple
      AccObj & { [P in K]: V } extends infer NextObj extends object
      ? [...AccTuple, V] extends infer NextTuple extends readonly any[]
        ? // union: this level OR recurse
          | { equality: Flatten<NextObj>; keyType: CompoundType<NextTuple> }
            | CompoundKeyLookupUnion<RestKeys, RestValues, NextObj, NextTuple>
        : never
      : never
    : never
  : never;

type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};

type PKValueTuple<TPkey extends any | readonly any[]> =
  TPkey extends readonly any[] ? TPkey : never;

type PkLookupEquality<
  TPKeyPathOrPaths extends string | readonly string[],
  TPkey extends any | readonly any[]
> = TPKeyPathOrPaths extends string
  ? { equality: { [K in TPKeyPathOrPaths]: TPkey }; keyType: [TPkey] }
  : TPKeyPathOrPaths extends readonly string[]
  ? CompoundKeyLookupUnion<TPKeyPathOrPaths, PKValueTuple<TPkey>>
  : never;

export type WhereEqualityLookup<
  TDatabase,
  TDexieIndexPaths extends DexieIndexPaths<TDatabase>,
  TPKeyPathOrPaths extends string | readonly string[],
  TPkey extends any | readonly any[]
> = [TPkey] extends [never]
  ? EqualityLookupFromDexieIndexPaths<TDatabase, TDexieIndexPaths>
  :
      | PkLookupEquality<TPKeyPathOrPaths, TPkey>
      | EqualityLookupFromDexieIndexPaths<TDatabase, TDexieIndexPaths>;

export type EqualityLookupFromDexieIndexPaths<
  TDatabase,
  TPaths extends DexieIndexPaths<TDatabase>
> = {
  [I in keyof TPaths]: TPaths[I] extends {
    path: infer P;
    [KeyTypeBrand]?: infer K;
  }
    ? { equality: { [KPath in P & string]: K }; keyType: K }
    : TPaths[I] extends {
        paths: infer PS extends readonly string[];
        [KeyTypeBrand]?: infer K extends readonly any[];
      }
    ? CompoundKeyLookupUnion<PS, K>
    : never;
}[number];
