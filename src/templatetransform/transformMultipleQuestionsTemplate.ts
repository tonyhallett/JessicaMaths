import {
  type MultipleQuestionsQATemplate,
  QuestionAnswerTemplateType,
} from "../questions/questionanswertemplates";
import { replaceParameters } from "./replaceParameters";
import { singularInputTransformTemplate } from "./singularInputTransformTemplate";
import {
  type MultipleQuestionAnswer,
  type SingleQuestionAnswer,
  QuestionAnswerType,
} from "./transformtemplate";
import { multipleInputTransformTemplate } from "./multipleInputTransformTemplate";

export function transformMultipleQuestionsTemplate(
  template: MultipleQuestionsQATemplate,
  parameters: string[]
): MultipleQuestionAnswer {
  const tranformedQuestionAnswers: SingleQuestionAnswer[] =
    template.questionAnswers.map((qaTemplate) => {
      switch (qaTemplate.type) {
        case QuestionAnswerTemplateType.SingularInput:
          return singularInputTransformTemplate(
            qaTemplate,
            parameters,
            template.commonParameters
          );
        case QuestionAnswerTemplateType.MultipleInput:
          return multipleInputTransformTemplate(
            qaTemplate,
            parameters,
            template.commonParameters
          );
      }
    });

  const multipleQuestionAnswer: MultipleQuestionAnswer = {
    questionAnswers: tranformedQuestionAnswers,
    type: QuestionAnswerType.Multiple,
    templateId: template.id,
  };

  if (
    template.questionHeader !== undefined &&
    template.commonParameters !== undefined
  ) {
    const questionHeader = replaceParameters(
      template.commonParameters,
      parameters,
      template.questionHeader,
      ""
    ).question;
    multipleQuestionAnswer.header = questionHeader;
  }

  return multipleQuestionAnswer;
}
