import {
  QuestionAnswerTemplateType,
  type AnswerInput,
  type QuestionAnswerTemplate,
} from "../questions/questionanswertemplates";
import { singularInputTransformTemplate } from "./singularInputTransformTemplate";
import { transformMultipleQuestionsTemplate } from "./transformMultipleQuestionsTemplate";
import { multipleInputTransformTemplate } from "./multipleInputTransformTemplate";

export type Answer = {
  answer: string;
};
export type AnswerInputSolution = AnswerInput & Answer;

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
