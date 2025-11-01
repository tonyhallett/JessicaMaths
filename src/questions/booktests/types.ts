import type { QuestionAnswerTemplate } from "../questionanswertemplates";

export type BookTestTest = {
  partA: QuestionAnswerTemplate[];
  partB: QuestionAnswerTemplate[];
  partC: QuestionAnswerTemplate[];
};

export type BookTestSection = BookTestTest[];

export type BookTests = BookTestSection[];
