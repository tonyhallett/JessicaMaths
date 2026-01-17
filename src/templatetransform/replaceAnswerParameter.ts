import {
  type QuestionAnswerParameter,
  AnswerParameterFormatType,
} from "../questions/questionanswertemplates";
import { convertFractionForMathjs } from "./mathjsEvaluate";

const replaceAnswerParameter = (
  parameterizedAnswer: string,
  parameter: QuestionAnswerParameter,
  parameterValue: string,
  placeholderId: string
) => {
  if (parameter.answerFormat === AnswerParameterFormatType.Fraction) {
    parameterValue = convertFractionForMathjs(parameterValue);
  }

  return parameterizedAnswer.replaceAll(placeholderId, parameterValue);
};

export default replaceAnswerParameter;
