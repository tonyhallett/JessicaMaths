import { expect, describe, it } from "tstyche";
import type { ValidIndexedDBKeyPath } from "../ValidIndexedDBKeyPaths";
import type { NoDescend } from "../utilitytypes";

describe("ValidIndexedDBKeyPaths type", () => {
  it("should have path for leaf types at the root level", () => {
    type ValidPaths = ValidIndexedDBKeyPath<
      {
        strProp: string;
        numProp: number;
        dateProp: Date;
        arrBufferProp: ArrayBuffer;
        arrBufferViewProp: Uint8Array;
        dataViewProp: DataView;
        boolProp: boolean;
      },
      false,
      NoDescend,
      false
    >;
    expect<ValidPaths>().type.toBe<
      | "strProp"
      | "numProp"
      | "dateProp"
      | "arrBufferProp"
      | "arrBufferViewProp"
      | "dataViewProp"
    >();
  });

  describe("should have type specific properties when allowed at the root level", () => {
    it("should have string.length", () => {
      type ValidPaths = ValidIndexedDBKeyPath<
        {
          strProp: string;
        },
        true,
        NoDescend,
        false
      >;
      expect<ValidPaths>().type.toBe<"strProp" | "strProp.length">();
    });
    it("should have array.length", () => {
      type ValidPaths = ValidIndexedDBKeyPath<
        {
          arrProp: string[];
        },
        true,
        NoDescend,
        false
      >;
      expect<ValidPaths>().type.toBe<"arrProp" | "arrProp.length">();
    });
    it("should have blob.size and blob.type, but not the property path", () => {
      type ValidPaths = ValidIndexedDBKeyPath<
        {
          blobProp: Blob;
        },
        true,
        NoDescend,
        false
      >;
      expect<ValidPaths>().type.toBe<"blobProp.size" | "blobProp.type">();
    });
    it("should have file.size, file.type, file.name, file.lastModified, but not the property path", () => {
      type ValidPaths = ValidIndexedDBKeyPath<
        {
          fileProp: File;
        },
        true,
        NoDescend,
        false
      >;
      expect<ValidPaths>().type.toBe<
        | "fileProp.size"
        | "fileProp.type"
        | "fileProp.name"
        | "fileProp.lastModified"
      >();
    });
  });

  describe("Max Depth", () => {
    interface Nested {
      root: number;
      nested: {
        id: string;
      };
    }

    it("should descend into nested objects when max depth is I", () => {
      type ValidPaths = ValidIndexedDBKeyPath<Nested, false, "I", false>;
      expect<ValidPaths>().type.toBe<"root" | "nested.id">();
    });

    it("should descend into nested objects when max depth is I and have type specific properties when specified", () => {
      type ValidPathsWithTypeSpecific = ValidIndexedDBKeyPath<
        Nested,
        true,
        "I",
        false
      >;
      expect<ValidPathsWithTypeSpecific>().type.toBe<
        "root" | "nested.id" | "nested.id.length"
      >();
    });

    it("should not descend into nested objects when max depth is the default", () => {
      type ValidPathsDefaultExplicit = ValidIndexedDBKeyPath<
        Nested,
        false,
        "",
        false
      >;
      expect<ValidPathsDefaultExplicit>().type.toBe<"root">();

      type ValidPathsDefault = ValidIndexedDBKeyPath<Nested, false, "", false>;
      expect<ValidPathsDefault>().type.toBe<"root">();
    });
  });
});
