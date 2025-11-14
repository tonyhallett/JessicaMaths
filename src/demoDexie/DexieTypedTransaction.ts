import type {
  Dexie,
  DexieCloseEvent,
  DexieEvent,
  DexieEventSet,
  DexieOnReadyEvent,
  DexiePopulateEvent,
  DexieVersionChangeEvent,
  PromiseExtended,
  Transaction,
  TransactionMode,
} from "dexie";
import type { TableConfig } from "./tablebuilder";
import type { DBTables } from "./tabletypes";

// Helper: the union of allowed argument shapes (either a table name key or a table instance)
type TableArg<TTablesMap extends Record<string, any>> =
  | (keyof TTablesMap & string)
  | TTablesMap[keyof TTablesMap];

// Extract the literal name for a single TableArg:
// - If it's a table object with 'name' literal -> use that literal
// - Otherwise if it's a string literal key -> use it
type NameOfArg<TTablesMap extends Record<string, any>, A> = A extends {
  name: infer N extends string;
}
  ? N
  : A extends keyof TTablesMap
  ? A
  : never;

// Get the union of names present in the TTables array/tuple
type TableNamesFromArgs<
  TTablesMap extends Record<string, any>,
  TTables extends readonly TableArg<TTablesMap>[]
> = NameOfArg<TTablesMap, TTables[number]>;

// Map a table name (key) to the proper table instance from the DB mapping
type TableInstanceForName<
  TTablesMap extends Record<string, any>,
  Name extends string
> = Name extends keyof TTablesMap ? TTablesMap[Name] : never;

// The result: TransactionWithTables exposes only the named tables from the DBTables mapping
type TransactionWithTables<
  TConfig extends Record<string, TableConfig<any, any, any, any>>,
  TTables extends readonly TableArg<DBTables<TConfig>>[]
> = Omit<Transaction, "table"> & {
  [N in TableNamesFromArgs<DBTables<TConfig>, TTables>]: TableInstanceForName<
    DBTables<TConfig>,
    N
  >;
};

type DexieWithoutTransactions = Omit<Dexie, "transaction" | "on">;

type TypedOn<TConfig extends Record<string, TableConfig<any, any, any, any>>> =
  {
    on: DexieEventSet & {
      // DbEventFns with typed transaction for 'populate' event
      (
        eventName: "populate",
        subscriber: (trans: Transaction & DBTables<TConfig>) => any
      ): void;
      (
        eventName: "blocked",
        subscriber: (event: IDBVersionChangeEvent) => any
      ): void;
      (
        eventName: "versionchange",
        subscriber: (event: IDBVersionChangeEvent) => any
      ): void;
      (eventName: "close", subscriber: (event: Event) => any): void;

      // from DbEvents
      (
        eventName: "ready",
        subscriber: (vipDb: Dexie) => any,
        bSticky?: boolean
      ): void;
      ready: DexieOnReadyEvent;
      populate: DexiePopulateEvent; // this is old style.
      blocked: DexieEvent;
      versionchange: DexieVersionChangeEvent;
      close: DexieCloseEvent;
    };
  };

// todo - suppport table array, table, table array args
type TypedTransaction<
  TConfig extends Record<string, TableConfig<any, any, any, any>>
> = {
  // Array form: transaction(mode, [tables], scope)
  transaction<U, TTables extends readonly TableArg<DBTables<TConfig>>[]>(
    mode: TransactionMode,
    tables: TTables,
    scope: (
      trans: TransactionWithTables<TConfig, TTables>
    ) => PromiseLike<U> | U
  ): PromiseExtended<U>;

  // Rest parameters form: transaction(mode, table1, table2, ..., scope)
  transaction<U, TTables extends readonly TableArg<DBTables<TConfig>>[]>(
    mode: TransactionMode,
    ...tablesAndScope: [
      ...TTables,
      (trans: TransactionWithTables<TConfig, TTables>) => PromiseLike<U> | U
    ]
  ): PromiseExtended<U>;
};
export type DexieTypedTransaction<
  TConfig extends Record<string, TableConfig<any, any, any, any>>
> = DexieWithoutTransactions & TypedTransaction<TConfig> & TypedOn<TConfig>;
