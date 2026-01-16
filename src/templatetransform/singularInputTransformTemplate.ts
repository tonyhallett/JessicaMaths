import type {
  SingularInputAnswerQATemplate,
  QuestionAnswerParameter,
} from "../questions/questionanswertemplates";
import { calculateSingularAnswer } from "./calculateSingularAnswer";
import {
  type SingleQuestionAnswer,
  QuestionAnswerType,
} from "./transformtemplate";
import { replaceParameters } from "./replaceParameters";

export function singularInputTransformTemplate(
  template: SingularInputAnswerQATemplate,
  parameters: string[],
  commonParameters?: QuestionAnswerParameter[]
): SingleQuestionAnswer {
  const allParameters = commonParameters
    ? [...commonParameters, ...template.parameters]
    : template.parameters;
  let { question, answerReplacement } = replaceParameters(
    allParameters,
    parameters,
    template.question,
    template.answer.answerReplacement
  );

  const answer = template.answer;

  return {
    type: QuestionAnswerType.Single,
    question,
    answerInputs: [
      {
        ...template.answer.input,
        answer: calculateSingularAnswer(answer, answerReplacement),
      },
    ],
    templateId: template.id,
  };
}
