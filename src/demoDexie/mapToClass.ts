import type { TableConfig } from "./tableBuilder";
import type { TypedDexie } from "./TypedDexie";

export function mapToClass(
  db: TypedDexie<any>,
  tableConfigs: Record<
    string,
    TableConfig<any, any, any, any, any, any, any, any> | null
  >
) {
  for (const [name, cfg] of Object.entries(tableConfigs)) {
    if (cfg && cfg.mapToClass) {
      db.table(name).mapToClass(cfg.mapToClass);
    }
  }
  return db;
}
