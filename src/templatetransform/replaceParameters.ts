import upperCaseFirstLetter from "../helpers/upperCaseFirstLetter";
import makePlaceholder from "../questions/makePlaceholder";
import {
  type QuestionAnswerParameter,
  type Question,
} from "../questions/questionanswertemplates";
import replaceAnswerParameter from "./replaceAnswerParameter";
import { replaceBoxPlaceholderWithLatex } from "./replaceBoxPlaceholderWithLatex";
import replaceQuestionParameter from "./replaceQuestionParameter";
import replaceSuffixes from "./replaceSuffixes";

export function getParameterValueAndPlaceholderIdForParameter(
  parameterValues: string[],
  parameterIndex: number,
  placeholderId?: number,
) {
  const placeholderIdOrFallback =
    placeholderId === undefined ? parameterIndex + 1 : placeholderId;

  return {
    parameterValue: parameterValues[placeholderIdOrFallback - 1]!,
    placeholder: makePlaceholder(placeholderIdOrFallback),
  };
}

export function replaceParameters(
  qaParameters: QuestionAnswerParameter[],
  parameterValues: string[],
  question: Question,
  answer: string,
) {
  let replacedQuestion =
    typeof question === "function" ? question(parameterValues) : question;

  qaParameters.forEach((parameter, index) => {
    let { parameterValue, placeholder } =
      getParameterValueAndPlaceholderIdForParameter(
        parameterValues,
        index,
        parameter.placeholderId,
      );

    replacedQuestion = replaceQuestionParameter(
      replacedQuestion,
      parameter,
      parameterValue,
      placeholder,
    );

    answer = replaceAnswerParameter(
      answer,
      parameter,
      parameterValue,
      placeholder,
    );
  });

  // not for answer ?
  replacedQuestion = replaceSuffixes(replacedQuestion, parameterValues);

  replacedQuestion = upperCaseFirstLetter(
    replaceBoxPlaceholderWithLatex(replacedQuestion),
  );

  return { question: replacedQuestion, answerReplacement: answer };
}
