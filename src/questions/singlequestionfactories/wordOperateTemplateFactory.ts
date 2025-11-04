import {
  AnswerType,
  QuestionAnswerParameterType,
  QuestionAnswerTemplateType,
  type AnswerInput,
  type SingularInputAnswerQATemplate,
} from "../questionanswertemplates";
import {
  divide,
  minus,
  multiply,
  plus,
  type OperationType,
} from "../helpers/operators";

export type OperateWord = {
  operationType: OperationType;
  firstWord: string;
  secondWord: string;
};

export const SubtractFrom: OperateWord = {
  operationType: minus,
  firstWord: "Subtract",
  secondWord: "from",
};
export const IncreaseBy: OperateWord = {
  operationType: plus,
  firstWord: "Increase",
  secondWord: "by",
};

export const MultiplyBy: OperateWord = {
  operationType: multiply,
  firstWord: "Multiply",
  secondWord: "by",
};

export const DivideBy: OperateWord = {
  operationType: divide,
  firstWord: "Divide",
  secondWord: "by",
};

export const wordOperateTemplateFactory = (
  id: string,
  parameter1: number, // for division, subtraction this is the answer
  parameter2: number, // for division this is the divisor, for subtraction this is the subtrahend
  operateWord: OperateWord,
  suffix = ""
): SingularInputAnswerQATemplate => {
  const answerInput: AnswerInput = {
    type: AnswerType.Integer,
  };
  if (suffix !== "") {
    answerInput.suffix = suffix;
  }
  let answerReplacement: string;
  switch (operateWord.operationType) {
    case divide:
      answerReplacement = `{1}`;
      break;
    case minus:
      answerReplacement = `{1}`;
      break;
    default:
      answerReplacement = `{1} ${operateWord.operationType} {2}`;
  }
  let operandA = parameter1;
  let operandB = parameter2;
  switch (operateWord.operationType) {
    case divide:
      operandA = parameter1 * parameter2;
      break;
    case minus:
      operandA = parameter2;
      operandB = parameter1 + parameter2;
      break;
  }

  const question = `${operateWord.firstWord} ${operandA}${suffix} ${operateWord.secondWord} ${operandB}${suffix}.`;

  const template: SingularInputAnswerQATemplate = {
    id,
    question,
    type: QuestionAnswerTemplateType.SingularInput,
    isTextQuestion: true,
    answer: {
      input: answerInput,
      answerReplacement,
    },
    parameters: [
      {
        type: QuestionAnswerParameterType.Number,
        testValue: parameter1.toString(),
      },
      {
        type: QuestionAnswerParameterType.Number,
        testValue: parameter2.toString(),
      },
    ],
  };

  return template;
};
