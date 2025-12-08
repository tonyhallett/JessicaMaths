import { buildStores } from "./buildStores";
import type { TableConfig } from "./tableBuilder";
import type { TypedDexie } from "./TypedDexie";

export function configureStores(
  db: TypedDexie<any>,
  version: number,
  tableConfigs: Record<string, TableConfig<any, any, any, any> | null>,
  upgradeFunction?: any
) {
  const dexieVersion = db.version(version).stores(buildStores(tableConfigs));
  if (upgradeFunction) {
    dexieVersion.upgrade(upgradeFunction as any);
  }
}
