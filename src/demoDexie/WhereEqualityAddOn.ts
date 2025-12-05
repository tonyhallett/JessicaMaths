import type { Dexie, Table, ThenShortcut } from "dexie";
import type { TableGetEquality } from "./TableBase";
import type { WhereEquality } from "./where";
import type { ExcludeKeysTuple } from "./utilitytypes";
import { aliasMethodsTs } from "./utils";

type GetEqualityMethods = ExcludeKeysTuple<
  TableGetEquality<any, any, any>,
  "getSingleFilterEquality" | "get"
>;
const getMethods: GetEqualityMethods = [
  "getEquality",
  "getCompositeEquality",
  "getSingleEquality",
];
type WhereEqualityMethods = ExcludeKeysTuple<
  WhereEquality<any, any, any, any, any, any, any, any, any>,
  "whereSingleFilterEquality" | "where"
>;
const whereMethods: WhereEqualityMethods = [
  "whereEquality",
  "whereCompositeEquality",
  "whereSingleEquality",
];

export function WhereEqualityAddOn(db: Dexie) {
  const tablePrototype = db.Table.prototype as Table &
    TableGetEquality<any, any, any> &
    WhereEquality<any, any, any, any, any, any, any, any, any>;

  aliasMethodsTs(tablePrototype, whereMethods, "where");

  aliasMethodsTs(tablePrototype, getMethods, "get");

  tablePrototype.whereSingleFilterEquality = function (
    this: Table,
    index: Record<string, any>,
    filter: Record<string, any>
  ) {
    const equality = { ...index, ...filter };
    return tablePrototype.where.call(this, equality) as any;
  };
  const getSingleFilterEquality: (typeof tablePrototype)["getSingleFilterEquality"] =
    function (
      this: Table,
      index: any,
      filter: any,
      thenShortcut?: ThenShortcut<any, unknown>
    ) {
      const equality = { ...index, ...filter };
      return tablePrototype.get.call(this, equality, thenShortcut as any);
    };

  tablePrototype.getSingleFilterEquality = getSingleFilterEquality;
}
