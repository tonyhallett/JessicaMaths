import type { KeyPathValue } from "dexie";
import type { DexieIndexPaths, KeyTypeBrand } from "./indexpaths";
import type { NextDepth, NoDescend } from "./utilitytypes";

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

type PrimaryKeyTypes<TPKeyPathOrPaths, TPkey extends any | readonly any[]> = {
  single: TPKeyPathOrPaths extends string
    ? PkEqualityEntries<TPKeyPathOrPaths, TPkey>
    : [];
  composite: TPKeyPathOrPaths extends readonly string[]
    ? PkEqualityEntries<TPKeyPathOrPaths, TPkey>
    : [];
};

type ComputePrimaryKeyTypes<
  TPKeyPathOrPaths,
  TPkey extends any | readonly any[]
> = PrimaryKeyTypes<TPKeyPathOrPaths, TPkey>;

type SplitEqualityKeyTypes = {
  single: EqualityKeyTypes;
  composite: EqualityKeyTypes;
};

type IndexAndNormalPaths<
  TNormalPaths,
  TIndexEqualityKeyTypes extends EqualityKeyTypes
> = TIndexEqualityKeyTypes extends readonly [infer First, ...infer Rest]
  ? First extends EqualityKeyType<infer E, infer K, infer I>
    ? Rest extends EqualityKeyTypes
      ? readonly [
          IndexAndNormalPathsEqualityKeyType<First, TNormalPaths>,
          ...IndexAndNormalPaths<TNormalPaths, Rest>
        ]
      : readonly [IndexAndNormalPathsEqualityKeyType<First, TNormalPaths>]
    : []
  : [];

export type WhereEqualityRegistryLookup<
  TDatabase,
  TPaths extends DexieIndexPaths<TDatabase>,
  TPKeyPathOrPaths,
  TPkey extends any | readonly any[],
  TMaxDepth extends string
> = ComputePrimaryKeyTypes<
  TPKeyPathOrPaths,
  TPkey
> extends infer PKs extends SplitEqualityKeyTypes
  ? IndexKeyTypesSplit<
      TDatabase,
      TPaths
    > extends infer IndexKeys extends SplitEqualityKeyTypes
    ? EqualityFilter<TDatabase, TMaxDepth> extends infer Filter
      ? {
          single: readonly [...PKs["single"], ...IndexKeys["single"]];
          composite: readonly [...PKs["composite"], ...IndexKeys["composite"]];

          all: readonly [
            ...PKs["single"],
            ...PKs["composite"],
            ...IndexKeys["single"],
            ...IndexKeys["composite"],
            ...IndexAndNormalPaths<Filter, IndexKeys["single"]>
          ];

          singleLookup: SingleIndexLookup<IndexKeys["single"]>;

          equalityFilterType: Filter;
        }
      : never
    : never
  : never;

type SingleIndexLookup<TEqualityKeyTypes extends EqualityKeyTypes> =
  TEqualityKeyTypes extends readonly [infer First, ...infer Rest]
    ? First extends EqualityKeyType<infer E, infer K, any>
      ? Rest extends EqualityKeyTypes
        ? E & SingleIndexLookup<Rest>
        : E
      : {}
    : {};

type PkEqualityEntries<
  TPKeyPathOrPaths extends string | readonly string[],
  TPkey extends any | readonly any[]
> = TPKeyPathOrPaths extends string
  ? readonly [EqualityKeyType<{ [K in TPKeyPathOrPaths]: TPkey }, TPkey>]
  : TPKeyPathOrPaths extends readonly string[]
  ? CompoundKeyLookupArray<TPKeyPathOrPaths, PKValueTuple<TPkey>>
  : readonly [];

export type EqualityKeyType<
  TEquality,
  TKey,
  TIndexProperty extends keyof TEquality | never = never
> = {
  readonly equality: TEquality;
  readonly keyType: TKey;
  readonly indexProperty: TIndexProperty;
};

type IndexAndNormalPathsEqualityKeyType<TEqualityKeyType, TNormalPaths> =
  TEqualityKeyType extends EqualityKeyType<infer E, infer K, infer I>
    ? EqualityKeyType<E & Omit<TNormalPaths, keyof E>, K, keyof E>
    : never;

export type EqualityKeyTypes = readonly EqualityKeyType<any, any, any>[];
export type EqualityRegistryLookup = {
  single: EqualityKeyTypes;
  composite: EqualityKeyTypes;
  all: EqualityKeyTypes;
  singleLookup: Record<string, any>;
  equalityFilterType: any;
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
  TSingleLookup extends Record<string, any>,
  TMatch extends Record<string, any>
> = T extends readonly [infer First, ...infer Rest]
  ? First extends EqualityKeyType<
      infer Equality,
      infer KeyType,
      infer IndexProperty
    >
    ? Condition<Equality, TMatch, IndexProperty> extends true
      ? HasOptionalProperties<Equality> extends true
        ? UnionOfMatchIndexTypes<TMatch, TSingleLookup>
        : KeyType
      : Rest extends any[]
      ? KeyTypeForEquality<Rest, TSingleLookup, TMatch>
      : never
    : never
  : never;

export type IsValidEquality<
  T extends EqualityKeyTypes,
  TSingleLookup extends Record<string, any>,
  TMatch extends Record<string, any>
> = KeyTypeForEquality<T, TSingleLookup, TMatch> extends never ? false : true;

type EqualityFilterPaths<
  T,
  TMaxDepth extends string,
  TCurrDepth extends string = NoDescend
> = {
  [P in keyof T]: P extends string
    ? TCurrDepth extends TMaxDepth
      ? P
      : T[P] extends Record<string, unknown>
      ?
          | P
          | `${P}.${EqualityFilterPaths<
              Required<T[P]>,
              TMaxDepth,
              NextDepth<TCurrDepth>
            >}`
      : P
    : never;
}[keyof T];
type EqualityFilter<T, TMaxDepth extends string> = {
  [KP in EqualityFilterPaths<Required<T>, TMaxDepth>]?: KeyPathValue<
    Required<T>,
    KP
  >;
};
