import type { PrimaryKey, PrimaryKeyPaths } from "./primarykey";
import type { Level2, UpdateSpec } from "./UpdateSpec";

/*
  Dexie does not allow updating primary key paths in bulkUpdate
  when the path is at the root
  https://github.com/dexie/Dexie.js/issues/2218
*/
type BulkUpdateChanges<
  T,
  TPKeyPathOrPaths,
  TMAXDEPTH extends string = Level2
> = Omit<UpdateSpec<T, TMAXDEPTH>, PrimaryKeyPaths<T, TPKeyPathOrPaths>>;

export interface BulkUpdate<
  T,
  TPKeyPathOrPaths,
  TMAXDEPTH extends string = Level2
> {
  key: PrimaryKey<T, TPKeyPathOrPaths>;
  changes: BulkUpdateChanges<T, TPKeyPathOrPaths, TMAXDEPTH>;
}
