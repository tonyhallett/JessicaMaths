import { PropModification, type PropModSpec } from "dexie";

type AddRemoveValueType = number | bigint | Array<string | number>;

export function typedAdd<TAdd extends AddRemoveValueType>(value: TAdd) {
  const spec: PropModSpec = { add: value };
  return new TypedPropModification<TAdd>(spec);
}

export function typedRemove<TRemove extends AddRemoveValueType>(
  value: TRemove
) {
  const spec: PropModSpec = { remove: value };
  return new TypedPropModification<TRemove>(spec);
}

export function typedReplacePrefix(prefix: string, replaced: string) {
  const spec: PropModSpec = { replacePrefix: [prefix, replaced] };
  return new TypedPropModification<string>(spec);
}

type PropModificationValueType = string | AddRemoveValueType;

export class TypedPropModification<
  T extends PropModificationValueType
> extends PropModification {
  constructor(spec: PropModSpec) {
    super(spec);
  }
  override execute<U>(value: U): U {
    return super.execute(value);
  }
}
