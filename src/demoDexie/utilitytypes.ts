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
