import {
  AnswerType,
  QuestionAnswerParameterType,
  QuestionAnswerTemplateType,
  type SingularInputAnswerQATemplate,
} from "../questionanswertemplates";

export const dividePoundIntegerToPenceTemplateFactory = (
  id: string,
  pounds: number,
  divideBy: number
): SingularInputAnswerQATemplate => {
  const questionAnswerTemplate: SingularInputAnswerQATemplate = {
    id,
    type: QuestionAnswerTemplateType.SingularInput,
    question: "Divide £{1}.00 by {2}.",
    answer: {
      input: {
        type: AnswerType.Integer,
        suffix: "p",
      },
      answerReplacement: "100 * {1} / {2}",
    },
    parameters: [
      {
        type: QuestionAnswerParameterType.Number,
        testValue: pounds.toString(),
      },
      {
        type: QuestionAnswerParameterType.Number,
        testValue: divideBy.toString(),
      },
    ],
    isTextQuestion: true,
  };
  return questionAnswerTemplate;
};
