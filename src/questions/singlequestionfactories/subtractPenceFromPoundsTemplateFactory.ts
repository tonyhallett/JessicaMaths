import { penceSuffix } from "../suffixes";
import {
  AnswerType,
  QuestionAnswerParameterType,
  QuestionAnswerTemplateType,
  type SingularInputAnswerQATemplate,
} from "../questionanswertemplates";

export const subtractPenceFromPoundsTemplateFactory = (
  id: string,
  pence: number,
  pounds: number
): SingularInputAnswerQATemplate => {
  const questionAnswerTemplate: SingularInputAnswerQATemplate = {
    id,
    type: QuestionAnswerTemplateType.SingularInput,
    question: "Subtract {1}p from £{2}.",
    answer: {
      input: {
        type: AnswerType.Integer,
        suffix: penceSuffix,
      },
      answerReplacement: "(100 * {2}) - {1}",
    },
    parameters: [
      {
        type: QuestionAnswerParameterType.Number,
        testValue: pence.toString(),
      },
      {
        type: QuestionAnswerParameterType.Number,
        testValue: pounds.toString(),
      },
    ],
    isTextQuestion: true,
  };
  return questionAnswerTemplate;
};
