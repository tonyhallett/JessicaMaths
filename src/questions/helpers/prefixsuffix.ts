export type PrefixSuffix = {
  prefixOrSuffix: string;
  isPrefix: boolean;
};
export const createPrefix = (prefix: string): PrefixSuffix => {
  return { prefixOrSuffix: prefix, isPrefix: true };
};
export const createSuffix = (suffix: string): PrefixSuffix => {
  return { prefixOrSuffix: suffix, isPrefix: false };
};

export const applyPrefixSuffix = (
  value: string,
  prefixSuffix?: PrefixSuffix
) => {
  if (prefixSuffix) {
    return prefixSuffix.isPrefix
      ? `${prefixSuffix.prefixOrSuffix}${value}`
      : `${value}${prefixSuffix.prefixOrSuffix}`;
  }

  return value;
};
