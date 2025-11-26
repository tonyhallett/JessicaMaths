import type {
  DexiePrimaryKeyPathOrPaths,
  PrimaryKey,
  PrimaryKeyPaths,
} from "./primarykey";
import type { UpdateSpec } from "./UpdateSpec";

/*
  Dexie does not allow updating primary key paths in bulkUpdate
  when the path is at the root
  https://github.com/dexie/Dexie.js/issues/2218
*/
type BulkUpdateChanges<
  T,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>,
  TMAXDEPTH extends string = "II"
> = Omit<UpdateSpec<T, TMAXDEPTH>, PrimaryKeyPaths<T, TPKeyPathOrPaths>>;

export interface BulkUpdate<
  T,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>,
  TMAXDEPTH extends string = "II"
> {
  key: PrimaryKey<T, TPKeyPathOrPaths>;
  changes: BulkUpdateChanges<T, TPKeyPathOrPaths, TMAXDEPTH>;
}
