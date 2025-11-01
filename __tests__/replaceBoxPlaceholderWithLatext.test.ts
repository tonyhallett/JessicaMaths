import { replaceBoxPlaceholderWithLatex } from "../src/templatetransform/replaceBoxPlaceholderWithLatex";

describe("replaceBoxPlaceholderWithLatex", () => {
  it("should not replace regular question marks", () => {
    const input = "What is 2 + 2?";
    const output = replaceBoxPlaceholderWithLatex(input);
    expect(output).toBe(input);
  });
});
