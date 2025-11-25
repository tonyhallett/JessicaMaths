import type { DexiePrimaryKeyPathOrPaths, PrimaryKey } from "./primarykey";
import type { NoExcessDataProperties } from "./utilitytypes";

export interface TableInboundAutoAdd<
  TDatabase,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TInsert
> {
  addObject<T extends TInsert>(
    item: NoExcessDataProperties<T, TInsert>
  ): Promise<
    T & {
      [K in TPKeyPathOrPaths & string]: PrimaryKey<TDatabase, TPKeyPathOrPaths>;
    }
  >;
}
