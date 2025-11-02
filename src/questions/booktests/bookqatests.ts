import {
  transformTemplate,
  type QuestionAnswer,
} from "../../templatetransform/transformtemplate";
import {
  QuestionAnswerTemplateType,
  type MultipleQuestionsQATemplate,
  type QuestionAnswerTemplate,
} from "../questionanswertemplates";
import { bookTests } from "./booktesttemplates";

type BookTest = {
  partA: QuestionAnswer[];
  partB: QuestionAnswer[];
  partC: QuestionAnswer[];
};

export const bookQATests = bookTests.map((section) => {
  return section.map((bookTestTest) => {
    return {
      partA: transformABC(bookTestTest.partA),
      partB: transformABC(bookTestTest.partB),
      partC: transformABC(bookTestTest.partC),
    } as BookTest;
  });
});

export function transformABC(templates: QuestionAnswerTemplate[]) {
  return templates.map((template) => {
    const templateParameterValues: string[] =
      template.type === QuestionAnswerTemplateType.MultipleQuestions
        ? getMultipleQuestionsTemplateParameterValues(template)
        : template.parameters.map((p) => p.testValue);
    return transformTemplate(template, templateParameterValues);
  });
}

function getMultipleQuestionsTemplateParameterValues(
  template: MultipleQuestionsQATemplate
): string[] {
  const nonCommonParameterValues = template.questionAnswers.flatMap((qa) =>
    qa.parameters.map((p) => p.testValue)
  );
  if (template.commonParameters !== undefined) {
    return [
      ...template.commonParameters.map((p) => p.testValue),
      ...nonCommonParameterValues,
    ];
  }
  return nonCommonParameterValues;
}
