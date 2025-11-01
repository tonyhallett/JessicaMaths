import { abQuestionId } from "./abQuestionId";
import { type PrefixSuffix, applyPrefixSuffix } from "../helpers/prefixsuffix";
import {
  type SingularInputAnswerQATemplate,
  QuestionAnswerTemplateType,
  QuestionAnswerParameterType,
  AnswerType,
  type MultipleQuestionsQATemplate,
} from "../questionanswertemplates";

export const numeratorsOfFactory = (
  id: string,
  of: number,
  aNumerator: number,
  bNumerator: number,
  ofPrefixSuffix?: PrefixSuffix,
  questionHeader?: string,
  questionASuffix: string = "",
  questionBSuffix: string = ""
) => {
  const createQuestion = (isPartA: boolean): SingularInputAnswerQATemplate => {
    const numerator = isPartA ? aNumerator : bNumerator;
    const placeholder = isPartA ? 2 : 3;
    const questionSuffix = isPartA ? questionASuffix : questionBSuffix;
    const template: SingularInputAnswerQATemplate = {
      id: abQuestionId(isPartA),
      type: QuestionAnswerTemplateType.SingularInput,
      question: `{${placeholder}}/3 of ${applyPrefixSuffix(
        "{1}",
        ofPrefixSuffix
      )}${questionSuffix}`,
      parameters: [
        {
          type: QuestionAnswerParameterType.Numerator,
          testValue: numerator.toString(),
          placeholder,
        },
      ],
      answer: {
        input: {
          type: AnswerType.Integer,
          suffix: "p",
        },
        answerReplacement: `{1} / 3 * {${placeholder}}`,
      },
      isTextQuestion: true,
    };
    return template;
  };

  const questionAnswerTemplate: MultipleQuestionsQATemplate = {
    id,
    type: QuestionAnswerTemplateType.MultipleQuestions,
    commonParameters: [
      {
        type: QuestionAnswerParameterType.Number,
        testValue: of.toString(),
        placeholder: 1,
      },
    ],
    questionAnswers: [createQuestion(true), createQuestion(false)],
  };
  if (questionHeader !== undefined) {
    questionAnswerTemplate.questionHeader = questionHeader;
  }
  return questionAnswerTemplate;
};
