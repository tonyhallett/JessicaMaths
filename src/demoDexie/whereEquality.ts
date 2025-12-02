import type { DexieIndexPaths, KeyTypeBrand } from "./indexpaths";

type CompoundType<T extends readonly any[]> = T extends readonly [infer Only]
  ? Only
  : T;

type CompoundKeyLookupArray<
  Keys extends readonly string[],
  Values extends readonly any[],
  AccObj extends object = {},
  AccTuple extends readonly any[] = [],
  Out extends readonly any[] = []
> = Keys extends [infer K extends string, ...infer RestKeys extends string[]]
  ? Values extends [infer V, ...infer RestValues]
    ? AccObj & { [P in K]: V } extends infer NextObj extends object
      ? CompoundKeyLookupArray<
          RestKeys,
          RestValues,
          NextObj,
          [...AccTuple, V],
          [
            ...Out,
            EqualityKeyType<Flatten<NextObj>, CompoundType<[...AccTuple, V]>>
          ]
        >
      : Out
    : Out
  : Out;

type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};

type PKValueTuple<TPkey extends any | readonly any[]> =
  TPkey extends readonly any[] ? TPkey : never;

export type WhereEqualityRegistry<
  TDatabase,
  TDexieIndexPaths extends DexieIndexPaths<TDatabase>,
  TPKeyPathOrPaths extends string | readonly string[] | never,
  TPkey extends any | readonly any[]
> = readonly [
  ...PkEqualityEntries<TPKeyPathOrPaths, TPkey>,
  ...IndexEqualityArray<TDatabase, TDexieIndexPaths>
];

type PkEqualityEntries<
  TPKeyPathOrPaths extends string | readonly string[],
  TPkey extends any | readonly any[]
> = TPKeyPathOrPaths extends string
  ? readonly [EqualityKeyType<{ [K in TPKeyPathOrPaths]: TPkey }, TPkey>]
  : TPKeyPathOrPaths extends readonly string[]
  ? CompoundKeyLookupArray<TPKeyPathOrPaths, PKValueTuple<TPkey>>
  : readonly [];

type IndexEqualityArray<
  TDatabase,
  TPaths extends DexieIndexPaths<TDatabase>,
  Out extends readonly EqualityKeyType<any, any>[] = []
> = TPaths extends [infer H, ...infer R extends DexieIndexPaths<TDatabase>]
  ? H extends { path: infer P extends string; [KeyTypeBrand]?: infer K }
    ? IndexEqualityArray<
        TDatabase,
        R,
        [...Out, EqualityKeyType<{ [KPath in P]: K }, CompoundType<[K]>>]
      >
    : H extends {
        paths: infer PS extends readonly string[];
        [KeyTypeBrand]?: infer KS extends readonly any[];
      }
    ? IndexEqualityArray<
        TDatabase,
        R,
        [...Out, ...CompoundKeyLookupArray<PS, KS>]
      >
    : IndexEqualityArray<TDatabase, R, Out>
  : Out;

export type EqualityKeyType<TEquality, TKey> = {
  readonly equality: TEquality;
  readonly keyType: TKey;
};
export type EqualityKeyTypes = readonly EqualityKeyType<any, any>[];
