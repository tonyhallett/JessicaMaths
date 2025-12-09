import { dexieFactory } from "../src/demoDexie/dexieFactory";
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

describe("dexieFactory", () => {
  it("should create a Dexie database, configure stores and mapToClass", () => {
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
    const db = dexieFactory(tableConfigs, "TestDB");
    expect(db.name).toBe("TestDB");
    expect(configureStores).toHaveBeenCalledWith(db, 1, tableConfigs);
    expect(mapToClass).toHaveBeenCalledWith(db, tableConfigs);
  });

  xit("should add addons to Dexie", () => {
    // todo
  });
});
