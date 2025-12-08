import {
  duplicateIndexErrorInstance,
  duplicateKeysErrorInstance,
  tableBuilder,
  TableConfig,
} from "../src/demoDexie/tableBuilder";

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

    it("should do unique single index", () => {
      const tableConfig = tableBuilder<{ id: number; theindex: string }>()
        .primaryKey("id")
        .uniqueIndex("theindex")
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

    it("should do unique multi index", () => {
      const tableConfig = tableBuilder<{ id: number; multi: string[] }>()
        .primaryKey("id")
        .uniqueMulti("multi")
        .build();
      expect(tableConfig.indicesSchema).toBe("&*multi");
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

    it("should do unique compound index", () => {
      const tableConfig = tableBuilder<{
        id: number;
        compoundIndex1: string;
        compoundIndex2: string;
      }>()
        .primaryKey("id")
        .uniqueCompound("compoundIndex1", "compoundIndex2")
        .build();
      expect(tableConfig.indicesSchema).toBe(
        "&[compoundIndex1+compoundIndex2]"
      );
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
        .uniqueIndex("uniqueIndex")
        .index("index2")
        .compound("compoundIndex1", "compoundIndex2")
        .multi("multi")
        .build();
      expect(tableConfig.indicesSchema).toBe(
        "&uniqueIndex,index2,[compoundIndex1+compoundIndex2],*multi"
      );
    });

    describe("error return cases", () => {
      it("should error on duplicate index", () => {
        const error = tableBuilder<{ id: number; index: string }>()
          .primaryKey("id")
          .index("index")
          .uniqueIndex("index");

        expect(error).toBe(duplicateIndexErrorInstance);
      });

      it("should error on duplicate compound entries", () => {
        const error = tableBuilder<{
          id: number;
          index1: string;
          index2: string;
        }>()
          .primaryKey("id")
          .compound("index1", "index1");

        expect(error).toBe(duplicateKeysErrorInstance);
      });
    });
  });
});
