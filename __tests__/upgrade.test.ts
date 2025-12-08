import { upgrade } from "../src/demoDexie/upgrade";
import { mapToClass } from "../src/demoDexie/mapToClass";
import { configureStores } from "../src/demoDexie/configureStores";
import { TableConfig } from "../src/demoDexie/tableBuilder";

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
  it("should configure stores and map to class during upgrade", () => {
    const db: any = { my: "db" };
    const tableConfigs: Record<
      string,
      TableConfig<any, any, any, any, any, any, any, any>
    > = {
      users: {
        indicesSchema: "",
        pk: {
          key: "id",
          auto: true,
        },
      },
    };
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
});
