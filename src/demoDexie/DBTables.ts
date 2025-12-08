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
    infer TOutboundKey,
    infer TMaxDepth
  >
    ? TPKeyPathOrPaths extends null
      ? TAuto extends true
        ? TableOutboundAuto<
            TName & string,
            TDatabase,
            TInsert, // to support upgrade
            TOutboundKey,
            TIndexPaths,
            TGet,
            TypedDexie<TConfig>,
            TMaxDepth
          >
        : TableOutbound<
            TName & string,
            TDatabase,
            TInsert, // to support upgrade
            TOutboundKey,
            TIndexPaths,
            TGet,
            TypedDexie<TConfig>,
            TMaxDepth
          >
      : TAuto extends true
      ? TableInboundAuto<
          TName & string,
          TDatabase,
          TPKeyPathOrPaths,
          TIndexPaths,
          TGet,
          TInsert,
          TypedDexie<TConfig>,
          TMaxDepth
        >
      : TableInbound<
          TName & string,
          TDatabase,
          TPKeyPathOrPaths,
          TIndexPaths,
          TGet,
          TInsert,
          TypedDexie<TConfig>,
          TMaxDepth
        >
    : never;
};
