import {
  PropModification,
  type PropModSpec,
  replacePrefix as dexiereplacePrefix,
  add as dexieadd,
  remove as dexieremove,
} from "dexie";

export type AddRemoveNumberType = number | bigint;
export type AddRemoveValueType = AddRemoveNumberType | Array<string | number>;
export type PropModificationValueType = string | AddRemoveValueType;

export class PropModificationTyped<T> extends PropModification {
  private readonly __brand!: T;
  constructor(spec: PropModSpec) {
    super(spec);
  }
  //@ts-expect-error
  override execute(value: T): T {
    return super.execute(value) as T;
  }
}

export function replacePrefix(
  prefix: string,
  replaced: string
): PropModificationTyped<string> {
  return dexiereplacePrefix(prefix, replaced) as PropModificationTyped<string>;
}

export function add<T extends AddRemoveValueType>(
  value: T
): PropModificationTyped<T> {
  return dexieadd(value) as PropModificationTyped<T>;
}

export function remove<T extends AddRemoveValueType>(
  value: T
): PropModificationTyped<T> {
  return dexieremove(value) as PropModificationTyped<T>;
}

export class ObjectPropModification<T> extends PropModificationTyped<T> {
  executor: (value: T) => T;
  constructor(executor: (value: T) => T) {
    super(null as any);
    this.executor = executor;
  }
  override execute(value: T): T {
    return this.executor(value);
  }
}

export enum RemoveUndefinedBehaviour {
  LeaveUndefined,
  Zero,
  Negative,
}

export function safeRemoveNumber(
  num: number,
  undefinedBehaviour: RemoveUndefinedBehaviour = RemoveUndefinedBehaviour.LeaveUndefined
): ObjectPropModification<number | undefined> {
  return new ObjectPropModification<number | undefined>((value) => {
    if (value === undefined) {
      switch (undefinedBehaviour) {
        case RemoveUndefinedBehaviour.LeaveUndefined:
          return undefined;
        case RemoveUndefinedBehaviour.Zero:
          return 0;
        case RemoveUndefinedBehaviour.Negative:
          return -num;
      }
    }
    return value - num;
  });
}
