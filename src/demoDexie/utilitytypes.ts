export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
export type StringKey<T> = keyof T & string;

export type HasNeverProperty<T> = {
  [K in keyof T]: [T[K]] extends [never]
    ? K
    : T[K] extends object
    ? T[K] extends (...args: any[]) => any
      ? never
      : HasNeverProperty<T[K]> extends never
      ? never
      : K
    : never;
}[keyof T];

type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

export type NoExcessDataProperties<T, U> = {
  [K in keyof T]: K extends keyof U
    ? IsFunction<T[K]> extends true
      ? T[K]
      : T[K] extends object
      ? U[K] extends object
        ? NoExcessDataProperties<T[K], U[K]>
        : T[K]
      : T[K]
    : IsFunction<T[K]> extends true
    ? T[K]
    : never;
};

export type NoExcessDataPropertiesArray<
  TArr extends readonly any[],
  TInsert
> = TArr extends readonly [infer First, ...infer Rest]
  ? First extends TInsert
    ? HasNeverProperty<NoExcessDataProperties<First, TInsert>> extends never
      ? Rest extends readonly []
        ? readonly [First]
        : readonly [First, ...NoExcessDataPropertiesArray<Rest, TInsert>]
      : never
    : never
  : readonly [];

export type StringKeyOf<T> = Extract<keyof T, string>;

export type IncludesNumberInUnion<T> = Extract<T, number> extends never
  ? false
  : true;

export type IncludesNumber<T> = [T] extends [number]
  ? true // exact number
  : Extract<T, number> extends never
  ? false
  : true; // number in union

export type ConstructorOf<T> = new (...args: any[]) => T;

export type NoDuplicates<T extends readonly any[]> = T extends readonly [
  infer First,
  ...infer Rest
]
  ? First extends Rest[number]
    ? never
    : Rest extends readonly any[]
    ? readonly [First, ...NoDuplicates<Rest>]
    : T
  : T;

export type TuplesEqual<A, B> = A extends readonly [...infer AItems]
  ? B extends readonly [...infer BItems]
    ? AItems["length"] extends BItems["length"]
      ? A extends B
        ? B extends A
          ? true
          : false
        : false
      : false
    : false
  : false;

export type NoDescend = "";

export type MaxDepth<S extends string> = S extends NoDescend
  ? S
  : S extends `I${infer Rest}` // starts with "I"
  ? Rest extends "" // if nothing left, ok
    ? S
    : MaxDepth<Rest> extends never // recursively check the rest
    ? never
    : S
  : never; // does not start with "I"

export type NextDepth<D extends string> = `${D}I`;

export type First<T extends readonly any[]> = T extends readonly [
  infer A,
  ...any[]
]
  ? A
  : never;

export type PathKeyType<TPath, TKey> = {
  readonly path: TPath;
  readonly keyType: TKey;
};
export type PathKeyTypes = readonly PathKeyType<any, any>[];
