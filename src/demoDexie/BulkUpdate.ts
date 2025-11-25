import type {
  DexiePrimaryKeyPathOrPaths,
  PrimaryKey,
  PrimaryKeyPaths,
} from "./primarykey";
import type { UpdateSpec } from "./UpdateSpec";

export interface BulkUpdate<
  T,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<T>,
  TMAXDEPTH extends string = "II"
> {
  key: PrimaryKey<T, TPKeyPathOrPaths>;
  changes: Omit<UpdateSpec<T, TMAXDEPTH>, PrimaryKeyPaths<T, TPKeyPathOrPaths>>;
}
