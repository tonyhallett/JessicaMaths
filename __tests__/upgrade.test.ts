import { upgrade } from "../src/demoDexie/upgrade";
import { mapToClass } from "../src/demoDexie/mapToClass";
import { configureStores } from "../src/demoDexie/configureStores";
import { TableConfig, TableConfigAny } from "../src/demoDexie/tableBuilder";

jest.mock("../src/demoDexie/configureStores", () => {
  return {
    configureStores: jest.fn(),
  };
});

jest.mock("../src/demoDexie/mapToClass", () => {
  return {
    mapToClass: jest.fn(),
  };
});

describe("upgrade", () => {
  const tableConfigs: Record<string, TableConfigAny> = {
    users: {
      indicesSchema: "",
      pk: {
        key: "id",
        auto: true,
      },
    },
  };
  it("should configure stores and map to class during upgrade", () => {
    const db: any = { my: "db" };

    const upgradeFunction = jest.fn();
    const dbUpgradedTs = upgrade(db, tableConfigs, 2, upgradeFunction);
    expect(configureStores).toHaveBeenCalledWith(
      db,
      2,
      tableConfigs,
      upgradeFunction
    );
    expect(mapToClass).toHaveBeenCalledWith(db, tableConfigs);
    expect(dbUpgradedTs).toBe(db);
  });

  it("should increment version if not provided", () => {
    const db: any = { my: "db", verno: 3 };
    const dbUpgradedTs = upgrade(db, tableConfigs);
    expect(configureStores).toHaveBeenCalledWith(
      db,
      4,
      tableConfigs,
      undefined
    );
  });

  it("should increment version if not provided and use the upgrader fn", () => {
    const db: any = { my: "db", verno: 2 };
    const upgradeFunction = jest.fn();
    const dbUpgradedTs = upgrade(db, tableConfigs, upgradeFunction);
    expect(configureStores).toHaveBeenCalledWith(
      db,
      3,
      tableConfigs,
      upgradeFunction
    );
  });
});
