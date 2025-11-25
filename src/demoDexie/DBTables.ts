import type { TableConfig } from "./tableBuilder";
import type { TableInbound } from "./TableInbound";
import type { TableInboundAuto } from "./TableInboundAuto";

export type DBTables<
  TConfig extends Record<string, TableConfig<any, any, any, any, any>>
> = {
  [TName in keyof TConfig & string]: TConfig[TName] extends TableConfig<
    infer TDatabase,
    infer PK,
    infer Auto,
    infer Indices,
    infer TGet,
    infer TInsert
  >
    ? PK extends never
      ? Auto extends true
        ? never
        : never
      : Auto extends true
      ? TableInboundAuto<TName, TDatabase, PK, Indices, TGet, TInsert>
      : TableInbound<TName, TDatabase, PK, Indices, TGet, TInsert>
    : never;
};
