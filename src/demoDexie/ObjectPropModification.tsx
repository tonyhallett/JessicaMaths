import { PropModification } from "dexie";

export class ObjectPropModification<T> extends PropModification<T> {
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

export function safeRemove(
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
