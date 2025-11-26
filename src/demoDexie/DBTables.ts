import type { TableConfig } from "./tableBuilder";
import type { TableInbound } from "./TableInbound";
import type { TableInboundAuto } from "./TableInboundAuto";
import type { TableOutbound } from "./TableOutbound";
import type { TableOutboundAuto } from "./TableOutboundAuto";
import type { TypedDexie } from "./TypedDexie";

export type DBTables<
  TConfig extends Record<string, TableConfig<any, any, any, any, any, any, any>>
> = {
  [TName in keyof TConfig as TName extends string
    ? TName
    : never]: TConfig[TName] extends TableConfig<
    infer TDatabase,
    infer TPKeyPathOrPaths,
    infer TAuto,
    infer TIndexPaths,
    infer TGet,
    infer TInsert,
    infer TOutboundKey
  >
    ? [TPKeyPathOrPaths] extends [never]
      ? TAuto extends true
        ? TableOutboundAuto<
            TName & string,
            TDatabase,
            TOutboundKey,
            TIndexPaths,
            TGet
          > & { db: TypedDexie<TConfig> }
        : TableOutbound<
            TName & string,
            TDatabase,
            TOutboundKey,
            TIndexPaths,
            TGet
          > & { db: TypedDexie<TConfig> }
      : TAuto extends true
      ? TableInboundAuto<
          TName & string,
          TDatabase,
          TPKeyPathOrPaths,
          TIndexPaths,
          TGet,
          TInsert
        > & { db: TypedDexie<TConfig> }
      : TableInbound<
          TName & string,
          TDatabase,
          TPKeyPathOrPaths,
          TIndexPaths,
          TGet,
          TInsert
        > & { db: TypedDexie<TConfig> }
    : never;
};
