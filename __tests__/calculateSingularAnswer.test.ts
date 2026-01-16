import { calculateSingularAnswer } from "../src/templatetransform/calculateSingularAnswer";

import { mathjsEvaluate } from "../src/templatetransform/mathjsEvaluate";

jest.mock("../src/templatetransform/mathjsEvaluate", () => ({
  mathjsEvaluate: jest.fn(),
}));

describe("calculateSingularAnswer", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns answerReplacement when noCalculation is true", () => {
    const answer: any = { noCalculation: true };
    const result = calculateSingularAnswer(answer, "replaced answer");
    expect(result).toBe("replaced answer");
    expect(mathjsEvaluate).not.toHaveBeenCalled();
  });

  it("uses customCalculationFunction when provided", () => {
    const customFn = jest.fn().mockReturnValue("custom-result");
    const answer: any = { customCalculationFunction: customFn };

    const result = calculateSingularAnswer(answer, "replaced answer");

    expect(customFn).toHaveBeenCalledTimes(1);
    expect(customFn).toHaveBeenCalledWith("replaced answer");
    expect(result).toBe("custom-result");
    expect(mathjsEvaluate).not.toHaveBeenCalled();
  });

  it("evaluates via mathjsEvaluate when no custom or noCalculation", () => {
    (mathjsEvaluate as jest.Mock).mockReturnValue("13");

    const answer: any = {};
    const result = calculateSingularAnswer(answer, "replaced answer");

    expect(mathjsEvaluate).toHaveBeenCalledTimes(1);
    expect(mathjsEvaluate).toHaveBeenCalledWith("replaced answer");
    expect(result).toBe("13");
  });
});
