import { create, all } from "mathjs";
import {
  AnswerParameterFormatType,
  QuestionAnswerTemplateType,
  type AnswerInput,
  type MultipleInputAnswerQATemplate,
  type MultipleQuestionsQATemplate,
  type Question,
  type QuestionAnswerParameter,
  type QuestionAnswerTemplate,
  type SingularInputAnswerQATemplate,
} from "../questions/questionanswertemplates";
import { replaceBoxPlaceholderWithLatex } from "./replaceBoxPlaceholderWithLatex";
import { parameterTransformers } from "./parameterTransformers";
import { upperCaseFirstLetter } from "../helpers/upperCaseFirstLetter";

export type AnswerInputSolution = AnswerInput & {
  answer: string;
};

export enum QuestionAnswerType {
  Single = 1,
  Multiple = 2,
}

export type SingleQuestionAnswer = {
  templateId: any;
  type: QuestionAnswerType.Single;
  question: string;
  answerInputs: AnswerInputSolution[];
};

export type MultipleQuestionAnswer = {
  templateId: any;
  header?: string;
  type: QuestionAnswerType.Multiple;
  questionAnswers: SingleQuestionAnswer[];
};

export type QuestionAnswer = SingleQuestionAnswer | MultipleQuestionAnswer;

function getParameterValuePlaceholder(
  parameterValues: string[],
  index: number,
  placeholder?: number
) {
  const parameterIndex = placeholder === undefined ? index : placeholder - 1;
  const placeholderIndex = placeholder === undefined ? index + 1 : placeholder;
  return {
    parameterValue: parameterValues[parameterIndex]!,
    placeholder: `{${placeholderIndex}}`,
  };
}

function replaceParameters(
  qaParameters: QuestionAnswerParameter[],
  parameterValues: string[],
  question: Question,
  answerReplacement: string
) {
  let replacedQuestion =
    typeof question === "function" ? question(parameterValues) : question;
  qaParameters.forEach((parameter, index) => {
    let { parameterValue, placeholder } = getParameterValuePlaceholder(
      parameterValues,
      index,
      parameter.placeholder
    );
    if (parameter.questionFormat === undefined) {
      replacedQuestion = replacedQuestion.replace(placeholder, parameterValue);
    } else {
      const parameterConversion = parameterTransformers.get(
        parameter.questionFormat
      )!;
      replacedQuestion = replacedQuestion.replace(
        placeholder,
        parameterConversion(parameterValue)
      );
    }
    if (parameter.answerFormat === AnswerParameterFormatType.Fraction) {
      parameterValue = convertFractionForMathjs(parameterValue);
    }
    answerReplacement = answerReplacement.replaceAll(
      placeholder,
      parameterValue
    );
  });
  // need to replace any suffixes in question - {s1} etc
  replacedQuestion = replacedQuestion.replace(/{s(\d+)}/g, (match, p1) => {
    const suffixNumber = parseInt(p1, 10);
    const parameter = parameterValues[suffixNumber - 1];
    const isGreaterThanOne = parseFloat(parameter!) > 1;
    return isGreaterThanOne ? "s" : "";
  });
  replacedQuestion = upperCaseFirstLetter(
    replaceBoxPlaceholderWithLatex(replacedQuestion)
  );
  return { question: replacedQuestion, answerReplacement };
}

function singularInputTransformTemplate(
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
  let calculatedAnswer = answer.noCalculation
    ? answerReplacement
    : answer.customCalculationFunction
    ? answer.customCalculationFunction(answerReplacement)
    : mathjsEvaluate(answerReplacement).toString();

  return {
    type: QuestionAnswerType.Single,
    question,
    answerInputs: [
      {
        ...template.answer.input,
        answer: calculatedAnswer,
      },
    ],
    templateId: template.id,
  };
}

function multipleInputTransformTemplate(
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

function transformMultipleQuestionsTemplate(
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

export function transformTemplate(
  template: QuestionAnswerTemplate,
  parameters: string[]
): QuestionAnswer {
  switch (template.type) {
    case QuestionAnswerTemplateType.SingularInput:
      return singularInputTransformTemplate(template, parameters);
    case QuestionAnswerTemplateType.MultipleInput:
      return multipleInputTransformTemplate(template, parameters);
    case QuestionAnswerTemplateType.MultipleQuestions:
      return transformMultipleQuestionsTemplate(template, parameters);
  }
}

function mathjsEvaluate(expression: string): string {
  const config = {};
  const math = create(all!, config);
  return math.evaluate(expression).toString();
}

function convertFractionForMathjs(fraction: string): string {
  if (fraction.includes(" ")) {
    const [wholeStr, fracStr] = fraction.split(" ");
    const whole = parseInt(wholeStr!);
    const [numeratorStr, denominatorStr] = fracStr!.split("/");
    const numerator = parseInt(numeratorStr!);
    const denominator = parseInt(denominatorStr!);
    const improperNumerator = whole * denominator + numerator;
    return `${improperNumerator}/${denominator}`;
  }
  return fraction;
}
