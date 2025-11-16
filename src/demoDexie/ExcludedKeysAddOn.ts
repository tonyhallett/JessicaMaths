import Dexie, { type Table } from "dexie";

const tableExcludedKeys = new Map<string, string[]>();

export function registerExcludedKeys(tableName: string, keys: string[]) {
  tableExcludedKeys.set(tableName, keys);
}

function throwIfExcluded(table: Table, item: any) {
  const excluded = tableExcludedKeys.get(table.name);
  if (excluded) {
    for (const key of excluded) {
      if (key in item) {
        throw new Error(
          `Property "${key}" is excluded from table "${table.name}"`
        );
      }
    }
  }
}

function filterItem(table: Table, item: any) {
  const excluded = tableExcludedKeys.get(table.name);
  if (excluded && item.constructor !== Object) {
    // Only transform class instances
    item = filterExcludedProperties(item, excluded);
  }
  return item;
}

function filterExcludedProperties<TEntity extends object>(
  instance: TEntity,
  excludedKeys: readonly (keyof TEntity)[]
) {
  const result: Partial<TEntity> = {};
  for (const key of Object.keys(instance) as (keyof TEntity)[]) {
    if (!excludedKeys.includes(key)) {
      result[key] = (instance as any)[key];
    }
  }
  return result;
}

function ExcludedKeysAddon(db: Dexie) {
  const originalAdd = db.Table.prototype.add;
  const originalPut = db.Table.prototype.put;

  db.Table.prototype.add = function (item: any, ...args: any[]) {
    return originalAdd.call(this, filterItem(this, item), ...args);
  };

  db.Table.prototype.put = function (item: any, ...args: any[]) {
    return originalPut.call(this, filterItem(this, item), ...args);
  };
}

// Register the addon to be included by default (optional)
Dexie.addons.push(ExcludedKeysAddon);
