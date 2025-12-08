import { mapToClass } from "../src/demoDexie/mapToClass";

describe("mapToClass", () => {
  it("maps tables to classes when mapToClass is defined", () => {
    const fakeDb = {
      table: jest.fn().mockReturnThis(),
      mapToClass: jest.fn(),
    };

    class MapToClass {}
    mapToClass(fakeDb as any, {
      users: {
        indicesSchema: "",
        pk: { key: null, auto: true },
        mapToClass: MapToClass,
      },
    });
    expect(fakeDb.table).toHaveBeenCalledWith("users");
    expect(fakeDb.mapToClass).toHaveBeenCalledWith(MapToClass);
  });

  it("should not throw if no map to class", () => {
    mapToClass(undefined as any, {
      users: {
        indicesSchema: "",
        pk: { key: null, auto: true },
      },
    });
  });
});
