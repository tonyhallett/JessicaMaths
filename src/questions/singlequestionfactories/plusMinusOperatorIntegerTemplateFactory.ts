import {
  AnswerType,
  QuestionAnswerParameterType,
  QuestionAnswerTemplateType,
  type AnswerInput,
  type QuestionAnswerParameter,
  type SingularInputAnswerQATemplate,
} from "../questionanswertemplates";
import { plus, minus } from "../helpers/operators";

type NumberPlusMinus = {
  number: number;
  operator: typeof plus | typeof minus;
};

export const plusOperator = (number: number): NumberPlusMinus => {
  return { number, operator: plus };
};
export const minusOperator = (number: number): NumberPlusMinus => {
  return { number, operator: minus };
};

export const plusMinusOperatorIntegerTemplateFactory = (
  id: string,
  numberOperators: NumberPlusMinus[],
  lastNumber: number,
  suffix = ""
): SingularInputAnswerQATemplate => {
  const parameters: QuestionAnswerParameter[] = numberOperators.map((no) => {
    return {
      type: QuestionAnswerParameterType.Number,
      testValue: no.number.toString(),
    };
  });
  parameters.push({
    type: QuestionAnswerParameterType.Number,
    testValue: lastNumber.toString(),
  });
  let question = "";
  let answerReplacement = "";
  numberOperators.forEach((no, index) => {
    answerReplacement += `{${index + 1}} ${no.operator} `;
    question += `{${index + 1}}${suffix} ${no.operator} `;
  });
  answerReplacement += `{${numberOperators.length + 1}}`;
  question += `{${numberOperators.length + 1}}${suffix}`;
  const answerInput: AnswerInput = {
    type: AnswerType.Integer,
  };
  if (suffix !== "") {
    answerInput.suffix = suffix;
  }
  const questionAnswerTemplate: SingularInputAnswerQATemplate = {
    id,
    type: QuestionAnswerTemplateType.SingularInput,
    question: question + " =",
    answer: {
      input: answerInput,
      answerReplacement,
    },
    parameters,
  };
  return questionAnswerTemplate;
};
