import type {
  CompoundIndexPaths,
  DexieIndexPaths,
  KeyTypeBrand,
  SingleIndexPath,
} from "./indexpaths";

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

type IndexKeyTypesSplit<
  TDatabase,
  TPaths extends DexieIndexPaths<TDatabase>,
  Out extends SplitEqualityKeyTypes = {
    single: readonly [];
    composite: readonly [];
  }
> = TPaths extends readonly [
  infer H,
  ...infer R extends DexieIndexPaths<TDatabase>
]
  ? H extends { path: infer P extends string; [KeyTypeBrand]?: infer K }
    ? IndexKeyTypesSplit<
        TDatabase,
        R,
        {
          single: readonly [
            ...Out["single"],
            EqualityKeyType<{ [KPath in P]: K }, K>
          ];
          composite: Out["composite"];
        }
      >
    : H extends {
        paths: infer PS extends readonly string[];
        [KeyTypeBrand]?: infer KS extends readonly any[];
      }
    ? IndexKeyTypesSplit<
        TDatabase,
        R,
        {
          single: Out["single"];
          composite: readonly [
            ...Out["composite"],
            ...CompoundKeyLookupArray<PS, KS>
          ];
        }
      >
    : IndexKeyTypesSplit<TDatabase, R, Out>
  : Out;

type PrimaryKeyTypes<
  TPKeyPathOrPaths extends string | readonly string[],
  TPkey extends any | readonly any[]
> = {
  single: TPKeyPathOrPaths extends string
    ? PkEqualityEntries<TPKeyPathOrPaths, TPkey>
    : [];
  composite: TPKeyPathOrPaths extends readonly string[]
    ? PkEqualityEntries<TPKeyPathOrPaths, TPkey>
    : [];
};

type ComputePrimaryKeyTypes<
  TPKeyPathOrPaths extends string | readonly string[] | never,
  TPkey extends any | readonly any[]
> = PrimaryKeyTypes<TPKeyPathOrPaths, TPkey>;

type SplitEqualityKeyTypes = {
  single: EqualityKeyTypes;
  composite: EqualityKeyTypes;
};

export type WhereEqualityRegistryLookup<
  TDatabase,
  TPaths extends DexieIndexPaths<TDatabase>,
  TPKeyPathOrPaths extends string | readonly string[] | never,
  TPkey extends any | readonly any[]
> = ComputePrimaryKeyTypes<
  TPKeyPathOrPaths,
  TPkey
> extends infer PKs extends SplitEqualityKeyTypes
  ? IndexKeyTypesSplit<
      TDatabase,
      TPaths
    > extends infer IndexKeys extends SplitEqualityKeyTypes
    ? {
        single: readonly [...PKs["single"], ...IndexKeys["single"]];
        composite: readonly [...PKs["composite"], ...IndexKeys["composite"]];
        all: readonly [
          ...PKs["single"],
          ...PKs["composite"],
          ...IndexKeys["single"],
          ...IndexKeys["composite"]
        ];
      }
    : never
  : never;

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

export type EqualityKeyType<
  TEquality,
  TKey,
  TIndexProperty extends keyof TEquality | never = never
> = {
  readonly equality: TEquality;
  readonly keyType: TKey;
  readonly indexProperty: TIndexProperty;
};

export type EqualityKeyTypes = readonly EqualityKeyType<any, any, any>[];
export type EqualityRegistryLookup = {
  single: EqualityKeyTypes;
  composite: EqualityKeyTypes;
  all: EqualityKeyTypes;
};

type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? true
  : false;

type HasOptionalProperties<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? true : never;
}[keyof T] extends never
  ? false
  : true;

type UnionOfMatchIndexTypes<
  TMatch extends Record<string, any>,
  TIndexLookup
> = TIndexLookup extends Record<string, any>
  ? TIndexLookup[keyof Pick<TIndexLookup, keyof TMatch & keyof TIndexLookup>]
  : never;

type CorrectPropertyTypes<TEquality, TMatch> =
  keyof TMatch extends keyof TEquality
    ? false extends {
        [K in keyof TMatch]: Same<TMatch[K], Required<TEquality>[K]>;
      }[keyof TMatch]
      ? false
      : true
    : false;

type IndexPropertyIsNever<TIndexProperty> = [TIndexProperty] extends [never]
  ? true
  : false;

type Condition<
  TEquality,
  TMatch,
  TIndexProperty extends keyof TEquality
> = Same<TEquality, TMatch> extends true
  ? true
  : IndexPropertyIsNever<TIndexProperty> extends true
  ? false
  : TMatch extends { [K in TIndexProperty]: TEquality[TIndexProperty] }
  ? CorrectPropertyTypes<TEquality, TMatch> extends true
    ? true
    : false
  : false;

export type KeyTypeForEquality<
  T extends EqualityKeyTypes,
  TMatch extends Record<string, any>
> = T extends readonly [infer First, ...infer Rest]
  ? First extends EqualityKeyType<
      infer Equality,
      infer KeyType,
      infer IndexProperty
    >
    ? Condition<Equality, TMatch, IndexProperty> extends true
      ? HasOptionalProperties<Equality> extends true
        ? UnionOfMatchIndexTypes<TMatch, KeyType>
        : KeyType
      : Rest extends any[]
      ? KeyTypeForEquality<Rest, TMatch>
      : never
    : never
  : never;
