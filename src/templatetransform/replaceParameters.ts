import { upperCaseFirstLetter } from "../helpers/upperCaseFirstLetter";
import makePlaceholder from "../questions/makePlaceholder";
import {
  type QuestionAnswerParameter,
  type Question,
  AnswerParameterFormatType,
} from "../questions/questionanswertemplates";
import { convertFractionForMathjs } from "./mathjsEvaluate";
import { parameterTransformers } from "./parameterTransformers";
import { replaceBoxPlaceholderWithLatex } from "./replaceBoxPlaceholderWithLatex";

export function getParameterValueAndPlaceholderIdForParameter(
  parameterValues: string[],
  parameterIndex: number,
  placeholderId?: number
) {
  const placeholderIdOrFallback =
    placeholderId === undefined ? parameterIndex + 1 : placeholderId;

  return {
    parameterValue: parameterValues[placeholderIdOrFallback - 1]!,
    placeholder: makePlaceholder(placeholderIdOrFallback),
  };
}

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

const replaceSuffixes = (
  replacedQuestion: string,
  parameterValues: string[]
) => {
  // need to replace any suffixes in question - {s1} etc
  return replacedQuestion.replace(/{s(\d+)}/g, (match, p1) => {
    const suffixNumber = parseInt(p1, 10);
    const parameter = parameterValues[suffixNumber - 1];
    const isGreaterThanOne = parseFloat(parameter!) > 1;
    return isGreaterThanOne ? "s" : "";
  });
};

export function replaceParameters(
  qaParameters: QuestionAnswerParameter[],
  parameterValues: string[],
  question: Question,
  answerReplacement: string
) {
  let replacedQuestion =
    typeof question === "function" ? question(parameterValues) : question;

  qaParameters.forEach((parameter, index) => {
    let { parameterValue, placeholder } =
      getParameterValueAndPlaceholderIdForParameter(
        parameterValues,
        index,
        parameter.placeholderId
      );

    replacedQuestion = replaceQuestionParameter(
      replacedQuestion,
      parameter,
      parameterValue,
      placeholder
    );

    if (parameter.answerFormat === AnswerParameterFormatType.Fraction) {
      parameterValue = convertFractionForMathjs(parameterValue);
    }

    answerReplacement = replaceAnswerParameter(
      answerReplacement,
      parameter,
      parameterValue,
      placeholder
    );
  });

  // not for answer ?
  replacedQuestion = replaceSuffixes(replacedQuestion, parameterValues);

  replacedQuestion = upperCaseFirstLetter(
    replaceBoxPlaceholderWithLatex(replacedQuestion)
  );

  return { question: replacedQuestion, answerReplacement };
}
