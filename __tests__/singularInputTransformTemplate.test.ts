import { singularInputTransformTemplate } from "../src/templatetransform/singularInputTransformTemplate";
import { QuestionAnswerType } from "../src/templatetransform/transformtemplate";
import {
  AnswerInput,
  AnswerType,
  QuestionAnswerParameterType,
  QuestionAnswerTemplateType,
  SingularAnswerTemplate,
  type QuestionAnswerParameter,
} from "../src/questions/questionanswertemplates";

import { replaceParameters } from "../src/templatetransform/replaceParameters";
import { calculateSingularAnswer } from "../src/templatetransform/calculateSingularAnswer";

jest.mock("../src/templatetransform/replaceParameters", () => ({
  replaceParameters: jest.fn(),
}));

jest.mock("../src/templatetransform/calculateSingularAnswer", () => ({
  calculateSingularAnswer: jest.fn(),
}));

describe("singularInputTransformTemplate", () => {
  const parameters = ["10", "5"];

  afterEach(() => {
    jest.clearAllMocks();
  });

  function makeParam(testValue: string): QuestionAnswerParameter {
    return {
      type: QuestionAnswerParameterType.Number,
      testValue,
    };
  }

  it("should have type QuestionAnswerType.Single", () => {
    mockReplaceParametersReturn("", "");

    const questionAnswer = singularInputTransformTemplate(
      {
        id: "t1",
        type: QuestionAnswerTemplateType.SingularInput,
        question: "{1} + {2} =",
        answer: {
          input: { type: AnswerType.Integer },
          answerReplacement: "",
        },
        parameters: [],
      },
      []
    );
    expect(questionAnswer.type).toBe(QuestionAnswerType.Single);
  });

  it("should replace parameters", () => {
    mockReplaceParametersReturn("replaced question", "replaced answer");
    const templateParameters = [makeParam("10"), makeParam("5")];
    const commonParameters = [makeParam("2")];

    singularInputTransformTemplate(
      {
        id: "t1",
        type: QuestionAnswerTemplateType.SingularInput,
        question: "question",
        answer: {
          input: { type: AnswerType.Integer },
          answerReplacement: "answer replacement",
        },
        parameters: templateParameters,
      },
      parameters,
      commonParameters
    );

    expect(replaceParameters).toHaveBeenCalledWith(
      [...commonParameters, ...templateParameters],
      parameters,
      "question",
      "answer replacement"
    );
  });

  it("should have question from replaceParameters", () => {
    mockReplaceParametersReturn("replaced question", "replaced answer");
    const templateParameters = [makeParam("10"), makeParam("5")];
    const commonParameters = [makeParam("2")];

    const questionAnswer = singularInputTransformTemplate(
      {
        id: "t1",
        type: QuestionAnswerTemplateType.SingularInput,
        question: "question",
        answer: {
          input: { type: AnswerType.Integer },
          answerReplacement: "answer replacement",
        },
        parameters: templateParameters,
      },
      parameters,
      commonParameters
    );

    expect(questionAnswer.question).toBe("replaced question");
  });

  it("should have single AnswerInput with answer calculated  using the replaceParameters.answerReplacement ", () => {
    const templateAnswer: SingularAnswerTemplate = {
      input: { type: AnswerType.Integer },
      answerReplacement: "answer replacement",
    };

    mockReplaceParametersReturn("replaced question", "replaced answer");
    const calculatedAnswer = "calculated answer";
    (calculateSingularAnswer as jest.Mock).mockImplementation(
      (answer, answerReplacement) => {
        expect(answer).toBe(templateAnswer);
        expect(answerReplacement).toBe("replaced answer");
        return calculatedAnswer;
      }
    );
    const templateParameters = [makeParam("10"), makeParam("5")];
    const commonParameters = [makeParam("2")];

    const questionAnswer = singularInputTransformTemplate(
      {
        id: "t1",
        type: QuestionAnswerTemplateType.SingularInput,
        question: "question",
        answer: templateAnswer,
        parameters: templateParameters,
      },
      parameters,
      commonParameters
    );

    expect(questionAnswer.answerInputs).toHaveLength(1);
    expect(questionAnswer.answerInputs[0].answer).toBe(calculatedAnswer);
  });

  it("should spread template.answer.input to the singlular answerInputs", () => {
    let answerInput: AnswerInput = {
      type: AnswerType.Integer,
      prefix: "$",
      suffix: "m",
    };

    mockReplaceParametersReturn("replaced question", "replaced answer");

    const questionAnswer = singularInputTransformTemplate(
      {
        id: "t1",
        type: QuestionAnswerTemplateType.SingularInput,
        question: "question",
        answer: {
          input: answerInput,
          answerReplacement: "answer replacement",
        },
        parameters: [],
      },
      parameters
    );

    expect(questionAnswer.answerInputs).toHaveLength(1);
    const qaAnswerInput = questionAnswer.answerInputs[0];
    expect(qaAnswerInput.type).toBe(AnswerType.Integer);
    expect(qaAnswerInput.prefix).toBe("$");
    expect(qaAnswerInput.suffix).toBe("m");
  });

  function mockReplaceParametersReturn(
    question: string,
    answerReplacement: string
  ) {
    (replaceParameters as jest.Mock).mockReturnValue({
      question,
      answerReplacement,
    });
  }
});
