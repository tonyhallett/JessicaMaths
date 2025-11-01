export const plus = "+";
export const minus = "-";
export const multiply = "*";
export const divide = "/";

export type OperationType =
  | typeof plus
  | typeof minus
  | typeof multiply
  | typeof divide;

export const OperationWords: { [key in OperationType]: string } = {
  [plus]: "plus",
  [minus]: "minus",
  [multiply]: "multiply",
  [divide]: "divide",
};
