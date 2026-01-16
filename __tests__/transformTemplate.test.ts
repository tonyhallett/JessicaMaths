import {
  transformTemplate,
  QuestionAnswerType,
  QuestionAnswer,
} from "../src/templatetransform/transformtemplate";
import {
  QuestionAnswerTemplateType,
  type QuestionAnswerTemplate,
} from "../src/questions/questionanswertemplates";

import { singularInputTransformTemplate } from "../src/templatetransform/singularInputTransformTemplate";
import { multipleInputTransformTemplate } from "../src/templatetransform/multipleInputTransformTemplate";
import { transformMultipleQuestionsTemplate } from "../src/templatetransform/transformMultipleQuestionsTemplate";

jest.mock("../src/templatetransform/singularInputTransformTemplate", () => ({
  singularInputTransformTemplate: jest.fn(),
}));

jest.mock("../src/templatetransform/multipleInputTransformTemplate", () => ({
  multipleInputTransformTemplate: jest.fn(),
}));

jest.mock(
  "../src/templatetransform/transformMultipleQuestionsTemplate",
  () => ({
    transformMultipleQuestionsTemplate: jest.fn(),
  })
);

describe("transformTemplate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("dispatches to singularInputTransformTemplate for SingularInput", () => {
    doTest(
      singularInputTransformTemplate,
      QuestionAnswerTemplateType.SingularInput
    );
  });

  it("dispatches to multipleInputTransformTemplate for MultipleInput", () => {
    doTest(
      multipleInputTransformTemplate,
      QuestionAnswerTemplateType.MultipleInput
    );
  });

  it("dispatches to transformMultipleQuestionsTemplate for MultipleQuestions", () => {
    doTest(
      transformMultipleQuestionsTemplate,
      QuestionAnswerTemplateType.MultipleQuestions
    );
  });

  function doTest(
    templateTransform: any,
    templateType: QuestionAnswerTemplateType
  ) {
    const parameters = ["2", "3"];
    const questionAnswer = {} as unknown as QuestionAnswer;

    const template: Pick<QuestionAnswerTemplate, "type"> = {
      type: templateType,
    };

    (templateTransform as jest.Mock).mockImplementation(
      (templateParameter, templateParameterValues) => {
        expect(template).toBe(templateParameter);
        expect(templateParameterValues).toBe(parameters);
        return questionAnswer;
      }
    );
    const qaTemplate = template as unknown as QuestionAnswerTemplate;

    const result = transformTemplate(qaTemplate, parameters);

    expect(result).toBe(questionAnswer);
  }
});
