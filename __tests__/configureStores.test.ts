import { buildStores } from "../src/demoDexie/buildStores";
import { configureStores } from "../src/demoDexie/configureStores";
import { TableConfig } from "../src/demoDexie/tableBuilder";

jest.mock("../src/demoDexie/buildStores", () => {
  return {
    buildStores: jest.fn().mockReturnValue("mockedStores"),
  };
});

describe("configureStores", () => {
  it("should version and set schema from tableConfigs", () => {
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
    const fakeDb = {
      versionNumber: undefined,
      version: jest.fn().mockReturnThis(),
      stores: jest.fn().mockReturnThis(),
      upgrade: jest.fn(),
    };
    configureStores(fakeDb as any, 9, tableConfigs);

    expect(fakeDb.version).toHaveBeenCalledWith(9);
    expect(fakeDb.stores).toHaveBeenCalledWith("mockedStores");

    expect(buildStores).toHaveBeenCalledWith(tableConfigs);
  });

  it("should set upgrade function when supplied", () => {
    const fakeDb = {
      versionNumber: undefined,
      version: jest.fn().mockReturnThis(),
      stores: jest.fn().mockReturnThis(),
      upgrade: jest.fn(),
    };
    const upgradeFunction = jest.fn();
    configureStores(fakeDb as any, 9, {}, upgradeFunction);
    expect(fakeDb.upgrade).toHaveBeenCalledWith(upgradeFunction);
  });
});
