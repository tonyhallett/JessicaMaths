import type { IndexableType } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";

export type TableOutbound<
  TName extends string,
  TDatabase,
  TPKey extends IndexableType,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TInsert
> = {};

export type TableOutboundAuto<
  TName extends string,
  TDatabase,
  TPKey extends IndexableType,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TInsert
> = {};
