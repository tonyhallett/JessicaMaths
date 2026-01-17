import {
  QuestionAnswerParameter,
  QuestionAnswerParameterType,
} from "../src/questions/questionanswertemplates";
import { replaceParameters } from "../src/templatetransform/replaceParameters";
import replaceAnswerParameter from "../src/templatetransform/replaceAnswerParameter";
import replaceQuestionParameter from "../src/templatetransform/replaceQuestionParameter";
import { replaceBoxPlaceholderWithLatex } from "../src/templatetransform/replaceBoxPlaceholderWithLatex";
import upperCaseFirstLetter from "../src/helpers/upperCaseFirstLetter";
import replaceSuffixes from "../src/templatetransform/replaceSuffixes";

jest.mock("../src/templatetransform/replaceBoxPlaceholderWithLatex");
jest.mock("../src/helpers/upperCaseFirstLetter");
jest.mock("../src/templatetransform/replaceQuestionParameter");
jest.mock("../src/templatetransform/replaceAnswerParameter");
jest.mock("../src/templatetransform/replaceSuffixes");

describe("replaceParameters", () => {
  const mockedReplaceBoxPlaceholderWithLatex =
    replaceBoxPlaceholderWithLatex as jest.Mock;
  const mockedUpperCaseFirstLetter = upperCaseFirstLetter as jest.Mock;
  const mockedReplaceQuestionParameter = replaceQuestionParameter as jest.Mock;
  const mockedReplaceAnswerParameter = replaceAnswerParameter as jest.Mock;
  const mockedReplaceSuffixes = replaceSuffixes as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedReplaceBoxPlaceholderWithLatex.mockImplementation((a) => a);
    mockedUpperCaseFirstLetter.mockImplementation((a) => a);
    mockedReplaceSuffixes.mockImplementation((a) => a);
  });
  afterEach(() => jest.clearAllMocks());

  it("should invoke question with parameter values if it is a function", () => {
    const questionFunction = jest.fn().mockReturnValue("Question return");
    replaceParameters([], ["42"], questionFunction, "answer");
    expect(questionFunction).toHaveBeenCalledWith(["42"]);
  });

  enum PlaceholderIdInfo {
    Ordered,
    OutOfOrder,
    NotSpecified,
  }
  it.each([
    PlaceholderIdInfo.Ordered,
    PlaceholderIdInfo.OutOfOrder,
    PlaceholderIdInfo.NotSpecified,
  ])(
    "should replace each parameter in the question (placeholderId %s)",
    (placeholderIdInfo) => {
      const parameters: QuestionAnswerParameter[] = [
        {
          type: QuestionAnswerParameterType.Number,
          placeholderId:
            placeholderIdInfo === PlaceholderIdInfo.NotSpecified
              ? undefined
              : placeholderIdInfo === PlaceholderIdInfo.Ordered
                ? 1
                : 2,
          testValue: "1",
        },
        {
          type: QuestionAnswerParameterType.Number,
          placeholderId:
            placeholderIdInfo === PlaceholderIdInfo.NotSpecified
              ? undefined
              : placeholderIdInfo === PlaceholderIdInfo.Ordered
                ? 2
                : 1,
          testValue: "2",
        },
      ];

      mockedReplaceQuestionParameter
        .mockReturnValueOnce("q after first")
        .mockReturnValueOnce("q after second");

      const { question } = replaceParameters(
        parameters,
        ["42", "7"],
        "question",
        "answer",
      );

      expect(question).toBe("q after second");
      expect(mockedReplaceQuestionParameter).toHaveBeenCalledWith(
        "question",
        parameters[0],
        placeholderIdInfo === PlaceholderIdInfo.OutOfOrder ? "7" : "42",
        placeholderIdInfo === PlaceholderIdInfo.OutOfOrder ? "{2}" : "{1}",
      );
      expect(mockedReplaceQuestionParameter).toHaveBeenCalledWith(
        "q after first",
        parameters[1],
        placeholderIdInfo === PlaceholderIdInfo.OutOfOrder ? "42" : "7",
        placeholderIdInfo === PlaceholderIdInfo.OutOfOrder ? "{1}" : "{2}",
      );
    },
  );

  it("should replace each parameter in the answer", () => {
    const parameters: QuestionAnswerParameter[] = [
      {
        type: QuestionAnswerParameterType.Number,
        placeholderId: 1,
        testValue: "1",
      },
      {
        type: QuestionAnswerParameterType.Number,
        placeholderId: 2,
        testValue: "2",
      },
    ];

    mockedReplaceAnswerParameter
      .mockReturnValueOnce("a after first")
      .mockReturnValueOnce("a after second");

    const { answerReplacement } = replaceParameters(
      parameters,
      ["42", "7"],
      "question",
      "answer",
    );

    expect(answerReplacement).toBe("a after second");
    expect(mockedReplaceAnswerParameter).toHaveBeenCalledWith(
      "answer",
      parameters[0],
      "42",
      "{1}",
    );
    expect(mockedReplaceAnswerParameter).toHaveBeenCalledWith(
      "a after first",
      parameters[1],
      "7",
      "{2}",
    );
  });

  it("should call replaceSuffixes, replaceBoxPlaceholderWithLatex and upperCaseFirstLetter on the final question", () => {
    mockedReplaceQuestionParameter.mockReset();
    mockedReplaceQuestionParameter.mockImplementation(
      (a) => a + " after question param",
    );
    mockedReplaceSuffixes.mockImplementation((a) => a + " after suffixes");
    mockedReplaceBoxPlaceholderWithLatex.mockImplementation(
      (a) => a + " after box placeholder",
    );
    mockedUpperCaseFirstLetter.mockImplementation(
      (a) => a + " after upper case",
    );
    const { question } = replaceParameters(
      [
        {
          type: QuestionAnswerParameterType.Number,
          testValue: "1",
        },
      ],
      ["42"],
      "original question",
      "answer",
    );

    expect(question).toBe(
      "original question after question param after suffixes after box placeholder after upper case",
    );
  });
});
