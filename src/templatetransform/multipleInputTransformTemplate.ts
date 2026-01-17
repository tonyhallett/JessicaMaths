import type {
  MultipleInputAnswerQATemplate,
  QuestionAnswerParameter,
} from "../questions/questionanswertemplates";
import { mathjsEvaluate } from "./mathjsEvaluate";
import { replaceParameters } from "./replaceParameters";
import {
  type SingleQuestionAnswer,
  type AnswerInputSolution,
  QuestionAnswerType,
} from "./transformtemplate";

export function multipleInputTransformTemplate(
  template: MultipleInputAnswerQATemplate,
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

  const multipleInputsAnswer = template.answer;
  let answerParts: string[];
  if (multipleInputsAnswer.type === "customCalculationFunction") {
    answerParts =
      multipleInputsAnswer.customCalculationFunction(answerReplacement);
  } else {
    answerParts = multipleInputsAnswer.splitAnswerFunction(
      mathjsEvaluate(answerReplacement)
    );
  }
  if (answerParts.length !== multipleInputsAnswer.inputs.length) {
    throw new Error("Calculated answer parts do not match input parts");
  }
  const answerInputs: AnswerInputSolution[] = multipleInputsAnswer.inputs.map(
    (input, index) => ({
      ...input,
      answer: answerParts[index]!,
    })
  );
  return {
    type: QuestionAnswerType.Single,
    question,
    answerInputs,
    templateId: template.id,
  };
}
