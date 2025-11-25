import type { TableConfig } from "./tableBuilder";
import type { TableInbound } from "./TableInbound";
import type { TableInboundAuto } from "./TableInboundAuto";
import type { TableOutbound, TableOutboundAuto } from "./TableOutboundAuto";

export type DBTables<
  TConfig extends Record<string, TableConfig<any, any, any, any, any>>
> = {
  [TName in keyof TConfig & string]: TConfig[TName] extends TableConfig<
    infer TDatabase,
    infer TPKeyPathOrPaths,
    infer TAuto,
    infer TIndexPaths,
    infer TGet,
    infer TInsert,
    infer TOutboundKey
  >
    ? TPKeyPathOrPaths extends never
      ? TAuto extends true
        ? TableOutboundAuto<
            TName,
            TDatabase,
            TOutboundKey,
            TIndexPaths,
            TGet,
            TInsert
          >
        : TableOutbound<
            TName,
            TDatabase,
            TOutboundKey,
            TIndexPaths,
            TGet,
            TInsert
          >
      : TAuto extends true
      ? TableInboundAuto<
          TName,
          TDatabase,
          TPKeyPathOrPaths,
          TIndexPaths,
          TGet,
          TInsert
        >
      : TableInbound<
          TName,
          TDatabase,
          TPKeyPathOrPaths,
          TIndexPaths,
          TGet,
          TInsert
        >
    : never;
};
