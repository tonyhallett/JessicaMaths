import { tableBuilder, TableConfig } from "../src/demoDexie/tableBuilder";

describe("tableBuilder", () => {
  describe("primary key only", () => {
    it("should build with just primary key", () => {
      const tableConfig = tableBuilder<{ id: number }>()
        .primaryKey("id")
        .build();
      expect(tableConfig.pk).toEqual({ key: "id", auto: false });
      expectNoSchemaOrMapToClass(tableConfig);
    });

    it("should build with just auto primary key", () => {
      const tableConfig = tableBuilder<{ id: number }>()
        .autoIncrement("id")
        .build();
      expect(tableConfig.pk).toEqual({ key: "id", auto: true });
      expectNoSchemaOrMapToClass(tableConfig);
    });

    it("should build with just compound primary key", () => {
      const tableConfig = tableBuilder<{ id1: number; id2: number }>()
        .compoundKey("id1", "id2")
        .build();

      expect(tableConfig.pk).toEqual({ key: "[id1+id2]", auto: false });
      expectNoSchemaOrMapToClass(tableConfig);
    });

    it("should build with just hiddenAuto", () => {
      const tableConfig = tableBuilder<{ id1: number }>().hiddenAuto().build();
      expectHiddenNoIndices(tableConfig, true);
    });

    it("should build with just hiddenExplicit", () => {
      const tableConfig = tableBuilder<{ id1: number }>()
        .hiddenExplicit()
        .build();
      expectHiddenNoIndices(tableConfig, false);
    });

    function expectHiddenNoIndices(
      tableConfig: TableConfig<any, any, any, any, any, any, any, any>,
      expectedAuto: boolean
    ) {
      expect(tableConfig.pk).toEqual({ key: null, auto: expectedAuto });
      expectNoSchemaOrMapToClass(tableConfig);
    }
    function expectNoSchemaOrMapToClass(
      tableConfig: TableConfig<any, any, any, any, any, any, any, any>
    ) {
      expect(tableConfig.indicesSchema).toBe("");
      expect(tableConfig.mapToClass).toBeUndefined();
    }
  });

  describe("should build with indexes", () => {
    it("should do single index", () => {
      const tableConfig = tableBuilder<{ id: number; theindex: string }>()
        .primaryKey("id")
        .index("theindex")
        .build();
      expect(tableConfig.indicesSchema).toBe("theindex");
    });
    // do I now need unique compound, multi
    it("should do unique single index", () => {
      const tableConfig = tableBuilder<{ id: number; theindex: string }>()
        .primaryKey("id")
        .unique("theindex")
        .build();
      expect(tableConfig.indicesSchema).toBe("&theindex");
    });

    it("should do multi index", () => {
      const tableConfig = tableBuilder<{ id: number; multi: string[] }>()
        .primaryKey("id")
        .multi("multi")
        .build();
      expect(tableConfig.indicesSchema).toBe("*multi");
    });
    it("should do compound index", () => {
      const tableConfig = tableBuilder<{
        id: number;
        compoundIndex1: string;
        compoundIndex2: string;
      }>()
        .primaryKey("id")
        .compound("compoundIndex1", "compoundIndex2")
        .build();
      expect(tableConfig.indicesSchema).toBe("[compoundIndex1+compoundIndex2]");
    });

    it("should join all indexes together", () => {
      const tableConfig = tableBuilder<{
        id: number;
        uniqueIndex: string;
        index2: string;
        compoundIndex1: string;
        compoundIndex2: string;
        multi: string[];
      }>()
        .primaryKey("id")
        .unique("uniqueIndex")
        .index("index2")
        .compound("compoundIndex1", "compoundIndex2")
        .multi("multi")
        .build();
      expect(tableConfig.indicesSchema).toBe(
        "&uniqueIndex,index2,[compoundIndex1+compoundIndex2],*multi"
      );
    });
  });
});
