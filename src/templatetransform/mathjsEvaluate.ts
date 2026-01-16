import { create, all } from "mathjs";

export function mathjsEvaluate(expression: string): string {
  const config = {};
  const math = create(all!, config);
  return math.evaluate(expression).toString();
}

export function convertFractionForMathjs(fraction: string): string {
  if (fraction.includes(" ")) {
    const [wholeStr, fracStr] = fraction.split(" ");
    const whole = parseInt(wholeStr!);
    const [numeratorStr, denominatorStr] = fracStr!.split("/");
    const numerator = parseInt(numeratorStr!);
    const denominator = parseInt(denominatorStr!);
    const improperNumerator = whole * denominator + numerator;
    return `${improperNumerator}/${denominator}`;
  }
  return fraction;
}
