import type { KeyPathValue, PromiseExtended } from "dexie";
import type { PathKeyType } from "./utilitytypes";

export type PrimaryKey<T, TPKeyPathOrPaths> =
  TPKeyPathOrPaths extends readonly string[]
    ? {
        [I in keyof TPKeyPathOrPaths]: KeyPathValue<
          T,
          TPKeyPathOrPaths[I] & keyof T
        >;
      }
    : KeyPathValue<T, TPKeyPathOrPaths>;

export type PrimaryKeyPaths<T, TPKeyPathOrPths> =
  TPKeyPathOrPths extends readonly (infer U)[]
    ? U extends string
      ? U
      : never
    : TPKeyPathOrPths extends string
    ? TPKeyPathOrPths
    : never;

// Split a dotted key path into tuple
type Split<Path extends string> = Path extends `${infer Head}.${infer Rest}`
  ? [Head, ...Split<Rest>]
  : [Path];

// Recursively make the property at the path optional
type OptionalByPath<T, Parts extends readonly string[]> = Parts extends [
  infer Head,
  ...infer Rest
]
  ? Head extends keyof T
    ? Rest extends []
      ? Omit<T, Head> & { [K in Head]?: T[K] }
      : Omit<T, Head> & {
          [K in Head]: OptionalByPath<T[Head], Extract<Rest, string[]>>;
        }
    : T
  : T;

export type OptionalPrimaryKeys<T, TKey> = TKey extends readonly string[]
  ? TKey extends [infer First, ...infer Rest]
    ? First extends string
      ? Rest extends readonly string[]
        ? OptionalPrimaryKeys<OptionalByPath<T, Split<First>>, Rest>
        : OptionalByPath<T, Split<First>>
      : T
    : T
  : TKey extends string
  ? OptionalByPath<T, Split<TKey>>
  : T;

// Recursively remove a nested key path from T, preserving optionality
type DeleteByPath<T, Parts extends readonly string[]> = Parts extends [
  infer Head,
  ...infer Rest
]
  ? Head extends keyof T
    ? Rest extends []
      ? Omit<T, Head>
      : Omit<T, Head> & {
          [K in Head]: T[K] extends object
            ? DeleteByPath<T[K], Extract<Rest, string[]>>
            : T[K];
        } & (undefined extends T[Head] ? { [K in Head]?: never } : {})
    : T
  : T;

// Handles single string key or array of string keys
export type DeletePrimaryKeys<T, TKey> = TKey extends readonly string[]
  ? TKey extends [infer First, ...infer Rest]
    ? First extends string
      ? Rest extends readonly string[]
        ? DeletePrimaryKeys<DeleteByPath<T, Split<First>>, Rest>
        : DeleteByPath<T, Split<First>>
      : T
    : T
  : TKey extends string
  ? DeleteByPath<T, Split<TKey>>
  : T;

export type PromiseExtendedPKeyOrKeys<
  TPKey,
  B extends boolean
> = PromiseExtended<B extends true ? TPKey[] : TPKey>;

export type PrimaryKeyId = ":id";

type BuildPrimaryEntries<
  Paths extends readonly any[],
  KeyTypes extends readonly any[],
  AccP extends any[] = [],
  AccK extends any[] = []
> = Paths extends readonly [infer HPath, ...infer RPaths extends readonly any[]]
  ? HPath extends string
    ? KeyTypes extends readonly [
        infer HKey,
        ...infer RKeys extends readonly any[]
      ]
      ? AccP extends []
        ? [
            PathKeyType<HPath, HKey>,
            ...BuildPrimaryEntries<
              readonly [...RPaths],
              readonly [...RKeys],
              [HPath],
              [HKey]
            >
          ]
        : [
            PathKeyType<[...AccP, HPath], [...AccK, HKey]>,
            ...BuildPrimaryEntries<
              readonly [...RPaths],
              readonly [...RKeys],
              [...AccP, HPath],
              [...AccK, HKey]
            >
          ]
      : []
    : []
  : [];

export type PrimaryKeyRegistry<TPKeyPathOrPaths, TPrimaryKeyTypes> = [
  TPKeyPathOrPaths
] extends [never]
  ? readonly []
  : TPKeyPathOrPaths extends readonly string[]
  ? TPrimaryKeyTypes extends readonly any[]
    ? BuildPrimaryEntries<
        Extract<TPKeyPathOrPaths, readonly string[]>,
        Extract<TPrimaryKeyTypes, readonly any[]>
      >
    : readonly []
  : TPKeyPathOrPaths extends string
  ? readonly [PathKeyType<TPKeyPathOrPaths, TPrimaryKeyTypes>]
  : readonly [];
