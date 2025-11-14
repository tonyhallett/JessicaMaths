import type { TableConfig } from "./tablebuilder";

export function buildStores(
  tableConfigs: Record<string, TableConfig<any, any, any, any>>
) {
  const stores: Record<string, string> = {};
  for (const [name, cfg] of Object.entries(tableConfigs)) {
    let indices = cfg.indicesSchema;
    const pk = cfg.pk;
    let pkKey = pk.key === null ? "" : pk.key;
    if (pk.auto) {
      pkKey = "++" + pkKey;
    }
    if (indices !== "") {
      pkKey = `${pkKey},`;
    }
    const schema = pkKey + indices;
    stores[name] = schema;
  }
  return stores;
}
