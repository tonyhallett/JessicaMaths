import { buildStores } from "../src/demoDexie/buildStores";

describe("buildStores", () => {
  it("should have just pk when no indices", () => {
    const storesFromTableConfig = buildStores({
      users: {
        pk: { key: "id", auto: false },
        indicesSchema: "",
      },
    });
    expect(storesFromTableConfig).toEqual({ users: "id" });
  });
  it("should have pk auto with ++", () => {
    const storesFromTableConfig = buildStores({
      users: {
        pk: { key: "id", auto: true },
        indicesSchema: "",
      },
    });
    expect(storesFromTableConfig).toEqual({ users: "++id" });
  });

  it("should concatenate pk and indices", () => {
    const storesFromTableConfig = buildStores({
      users: {
        pk: { key: "id", auto: true },
        indicesSchema: "index1,index2",
      },
    });
    expect(storesFromTableConfig).toEqual({ users: "++id,index1,index2" });
  });

  it("should handle outbound ", () => {
    const storesFromTableConfig = buildStores({
      users: {
        pk: { key: null, auto: false },
        indicesSchema: "index1,index2",
      },
    });
    expect(storesFromTableConfig).toEqual({ users: ",index1,index2" });
  });

  it("should handle outbound auto", () => {
    const storesFromTableConfig = buildStores({
      users: {
        pk: { key: null, auto: true },
        indicesSchema: "index1,index2",
      },
    });
    expect(storesFromTableConfig).toEqual({ users: "++,index1,index2" });
  });

  it("should handle table deletions", () => {
    const storesFromTableConfig = buildStores({
      deletedTable: null,
    });
    expect(storesFromTableConfig).toEqual({ deletedTable: null });
  });
});
