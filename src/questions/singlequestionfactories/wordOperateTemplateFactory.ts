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
  questionFirst: number,
  questionSecond: number,
  operateWord: OperateWord,
  suffix = ""
): SingularInputAnswerQATemplate => {
  const answerInput: AnswerInput = {
    type: AnswerType.Integer,
  };
  if (suffix !== "") {
    answerInput.suffix = suffix;
  }
  const template: SingularInputAnswerQATemplate = {
    id,
    question: `${operateWord.firstWord} ${questionFirst}${suffix} ${operateWord.secondWord} ${questionSecond}${suffix}.`,
    type: QuestionAnswerTemplateType.SingularInput,
    isTextQuestion: true,
    answer: {
      input: answerInput,
      answerReplacement:
        operateWord.operationType === "-"
          ? `{2} ${operateWord.operationType} {1}`
          : `{1} ${operateWord.operationType} {2}`,
    },
    parameters: [
      {
        type: QuestionAnswerParameterType.Number,
        testValue: questionFirst.toString(),
      },
      {
        type: QuestionAnswerParameterType.Number,
        testValue: questionSecond.toString(),
      },
    ],
  };

  return template;
};
