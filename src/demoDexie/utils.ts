export function aliasMethodTs<
  TProto extends object,
  TAlias extends keyof TProto,
  TKey extends keyof TProto
>(proto: TProto, alias: TAlias, original: TKey) {
  aliasMethod(proto, alias, original);
}

export function aliasMethod<TProto extends object, TKey extends keyof TProto>(
  proto: TProto,
  alias: PropertyKey,
  original: TKey
) {
  type Fn = TProto[TKey] extends (...args: any[]) => any ? TProto[TKey] : never;

  const fn = proto[original] as Fn;

  (proto as any)[alias] = function (
    this: ThisParameterType<Fn>,
    ...args: Parameters<Fn>
  ): ReturnType<Fn> {
    return fn.apply(this, args);
  };
}

export function aliasMethodsTs<
  TProto extends object,
  TAliases extends readonly (keyof TProto)[],
  TKey extends keyof TProto
>(proto: TProto, aliases: TAliases, original: TKey) {
  aliasMethods(proto, aliases, original);
}

export function aliasMethods<TProto extends object, TKey extends keyof TProto>(
  proto: TProto,
  aliases: readonly PropertyKey[],
  original: TKey
) {
  aliases.forEach((alias) => {
    aliasMethod(proto, alias, original);
  });
}
