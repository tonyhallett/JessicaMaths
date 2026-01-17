import type { QuestionAnswerParameter } from "../questions/questionanswertemplates";
import { parameterTransformers } from "./parameterTransformers";

const replaceQuestionParameter = (
  parameterizedQuestion: string,
  parameter: QuestionAnswerParameter,
  parameterValue: string,
  placeholder: string
) => {
  if (parameter.questionFormat === undefined) {
    parameterizedQuestion = parameterizedQuestion.replace(
      placeholder,
      parameterValue
    );
  } else {
    const parameterConversion = parameterTransformers.get(
      parameter.questionFormat
    )!;
    parameterizedQuestion = parameterizedQuestion.replace(
      placeholder,
      parameterConversion(parameterValue)
    );
  }
  return parameterizedQuestion;
};

export default replaceQuestionParameter;
