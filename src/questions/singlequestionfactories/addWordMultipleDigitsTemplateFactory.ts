import {
  type SingularInputAnswerQATemplate,
  QuestionAnswerParameterType,
  QuestionAnswerTemplateType,
  AnswerType,
} from "../questionanswertemplates";

const getSuffix = (numParameters: number, index: number) => {
  const isPenultimate = index === numParameters - 2;
  if (isPenultimate) {
    return " and ";
  }
  const isLast = index === numParameters - 1;
  if (isLast) {
    return "";
  }
  return ", ";
};

export const addWordMultipleDigitsTemplateFactory = (
  id: string,
  numbers: number[] // expect > 2
): SingularInputAnswerQATemplate => {
  let question = "Add ";
  let answerReplacement = "";
  const parameters = numbers.map((num, index) => {
    const placeholder = `{${index + 1}}`;
    if (index > 0) {
      answerReplacement += " + ";
    }
    answerReplacement += placeholder;
    question += `${placeholder}${getSuffix(numbers.length, index)}`;
    return {
      type: QuestionAnswerParameterType.Number,
      testValue: num.toString(),
    };
  });
  const template: SingularInputAnswerQATemplate = {
    id,
    question,
    type: QuestionAnswerTemplateType.SingularInput,
    isTextQuestion: true,
    answer: {
      input: {
        type: AnswerType.Integer,
      },
      answerReplacement,
    },
    parameters,
  };

  return template;
};
