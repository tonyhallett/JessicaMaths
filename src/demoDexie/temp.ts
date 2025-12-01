import type {
  CompoundIndexPaths,
  CompoundKeyPathsAsStr,
  DexieIndexPath,
  DexieIndexPaths,
  KeyTypeBrand,
  MultiIndexPath,
  SingleIndexPath,
} from "./indexpaths";
import type { DexiePrimaryKeyPathOrPaths } from "./primarykey";
import type { PathWithKey } from "./utilitytypes";

type SinglePropertyKeys<Lookup extends readonly PathWithKey<any, any>[]> =
  Lookup[number] extends PathWithKey<infer P, any>
    ? P extends readonly [infer F, ...any[]]
      ? F
      : P
    : never;

type CompoundKeys<Lookup extends readonly PathWithKey<any, any>[]> =
  Lookup[number] extends PathWithKey<infer P, any>
    ? P extends readonly any[]
      ? P
      : never
    : never;

// Value type lookup directly from KeyLookup
type ValueForPath<
  Lookup extends readonly PathWithKey<any, any>[],
  Path
> = Lookup[number] extends PathWithKey<infer P, infer K>
  ? P extends Path
    ? K
    : P extends readonly [infer F, ...any[]]
    ? F extends Path
      ? K extends readonly [infer FirstValue, ...any[]]
        ? FirstValue
        : never
      : never
    : never
  : never;

// Single-property object
type SinglePropertyObject<Lookup extends readonly PathWithKey<any, any>[]> = {
  [K in SinglePropertyKeys<Lookup> & string]: ValueForPath<Lookup, K>;
};

// Multi-property compound object
/* type CompoundObject<Lookup extends readonly PathWithKey<any, any>[]> =
  Lookup[number] extends PathWithKey<infer P, infer K>
    ? P extends readonly string[]
      ? { [I in keyof P]: K extends readonly any[] ? K[I] : never }
      : never
    : never; */

// Union of valid objects
/* type WhereEqualityObject<Lookup extends readonly PathWithKey<any, any>[]> =
  SinglePropertyObject<Lookup> | CompoundObject<Lookup>; */

/* declare function whereObj<Lookup extends readonly PathWithKey<any, any>[]>(
  obj: WhereEqualityObject<Lookup>
): void; */

type SingleKeyObject<Lookup extends readonly PathWithKey<any, any>[]> =
  Lookup[number] extends PathWithKey<infer P, infer K>
    ? P extends readonly any[] // compound key
      ? { [Key in P[0] & string]: K extends readonly any[] ? K[0] : never }
      : { [Key in P & string]: K extends readonly any[] ? never : K }
    : never;

type DemoLookup = readonly [
  PathWithKey<"index", number>,
  PathWithKey<["pkNumber", "pkString"], [number, string]>
];

type Result = SingleKeyObject<DemoLookup>;
const resultTest: Result = { index: 5 };
const resultTest2: Result = { pkNumber: 10 };
//const resultTest3: Result = { pkString: "test" }; // should error
// const resultTest4: Result = { index: 5,more:number };

type X =
  | { a: number; b: string }
  | { a: number; b: string; c: Date }
  | { a: number; b: string; c: Date; d: number };
const x = { a: 1, b: "two" };

type CompoundKeyObjectUnion<
  Keys extends readonly string[],
  Values extends readonly any[],
  Acc extends object = {}
> = Keys extends [infer K extends string, ...infer RestKeys extends string[]]
  ? Values extends [infer V, ...infer RestValues]
    ? // next accumulated object = Acc & { [K]: V }
      Acc & { [P in K]: V } extends infer Next extends object
      ? // union: this level OR recurse
        Flatten<Next> | CompoundKeyObjectUnion<RestKeys, RestValues, Next>
      : never
    : never
  : never;

type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};
type Test = CompoundKeyObjectUnion<
  ["a", "b", "c", "d"],
  [number, string, Date, number]
>;

type PKValueTuple<TPkey extends any | readonly any[]> =
  TPkey extends readonly any[] ? TPkey : never;

type PkEquality<
  TPKeyPathOrPaths extends string | readonly string[],
  TPkey extends any | readonly any[]
> =
  // --- CASE 2: Single PK path ----------------
  TPKeyPathOrPaths extends string
    ? { [K in TPKeyPathOrPaths]: TPkey }
    : // --- CASE 3: Composite PK -----------------
    TPKeyPathOrPaths extends readonly string[]
    ? CompoundKeyObjectUnion<TPKeyPathOrPaths, PKValueTuple<TPkey>, {}>
    : never;

// :id ?
type WhereEquality<
  TDatabase,
  TDexieIndexPaths extends DexieIndexPaths<TDatabase>,
  TPKeyPathOrPaths extends string | readonly string[],
  TPkey extends any | readonly any[]
> =
  // --- CASE 1: No primary key -----------------
  [TPkey] extends [never]
    ? EqualityFromDexieIndexPaths<TDatabase, TDexieIndexPaths>
    :
        | PkEquality<TPKeyPathOrPaths, TPkey>
        | EqualityFromDexieIndexPaths<TDatabase, TDexieIndexPaths>;

type EqualityFromDexieIndexPaths<
  TDatabase,
  TPaths extends DexieIndexPaths<TDatabase>
> = {
  [I in keyof TPaths]: TPaths[I] extends {
    path: infer P;
    [KeyTypeBrand]?: infer K;
  }
    ? { [KPath in P & string]: K }
    : TPaths[I] extends {
        paths: infer PS extends readonly string[];
        [KeyTypeBrand]?: infer K extends readonly any[];
      }
    ? CompoundKeyObjectUnion<PS, K>
    : never;
}[number];

interface MyDB {
  id: number;
  name: string;
  age: number;
  tag: string;
  compound1: string;
  compound2: number;
  compound3: Date;
}

type MyIndexes = [
  SingleIndexPath<MyDB, "name">,
  MultiIndexPath<MyDB, "tag">,
  CompoundIndexPaths<MyDB, ["compound1", "compound2", "compound3"]>
];

type MyPKPath = ["id", "name"];
type MyPKValue = [number, string];

type TestWhereEquality = WhereEquality<MyDB, MyIndexes, MyPKPath, MyPKValue>;
