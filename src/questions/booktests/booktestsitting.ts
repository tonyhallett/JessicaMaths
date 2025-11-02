import type {
  Answer,
  AnswerInputSolution,
  QuestionAnswerType,
} from "../../templatetransform/transformtemplate";

type BookTestSittingBase<T> = {
  book: number;
  section: number;
  test: number;
  id?: string; // when create this create the store at the same time
  allowRepeatedAttempts?: boolean;
  partA: T[];
  partB: T[];
  partC: T[];
};

export type BookTestSitting = BookTestSittingBase<TestSittingQuestionAnswer>;

type TestSittingSingleQuestionAnswerBase<TAnswerInputs> = {
  questionNumber: number; // only necessary whilst do not have all questions templated
  question: string;
  type: QuestionAnswerType.Single;
  answerInputs: TAnswerInputs[];
};

export type TestSittingSingleQuestionAnswer =
  TestSittingSingleQuestionAnswerBase<TestSittingAnswerInput>;

export type TestSettingInput = {
  input?: string;
  attempts?: string[];
};

export type TestSittingAnswerInput = AnswerInputSolution & TestSettingInput;

type TestSittingMultipleQuestionAnswerBase<TQuestionAnswers> = {
  questionNumber: number; // only necessary whilst do not have all questions completed
  type: QuestionAnswerType.Multiple;
  header?: string;
  questionAnswers: TQuestionAnswers;
};

export type TestSittingMultipleQuestionAnswer =
  TestSittingMultipleQuestionAnswerBase<TestSittingSingleQuestionAnswer[]>;

export type TestSittingQuestionAnswer =
  | TestSittingSingleQuestionAnswer
  | TestSittingMultipleQuestionAnswer;

export enum AnswerStatus {
  Correct,
  Incorrect,
  Unanswered,
}

export type TestSittingStoreSingleQuestionAnswer =
  TestSittingSingleQuestionAnswerBase<TestSettingInput & Answer> & {
    answerStatus: AnswerStatus;
  };
export type TestSittingStoreMultipleQuestionAnswer =
  TestSittingMultipleQuestionAnswerBase<TestSittingStoreSingleQuestionAnswer>;
export type TestSittingStoreQuestionAnswer =
  | TestSittingStoreSingleQuestionAnswer
  | TestSittingStoreMultipleQuestionAnswer;
export type BookTestSittingStore =
  BookTestSittingBase<TestSittingStoreQuestionAnswer> & {
    complete: boolean;
    startedAt: number;
    updatedAt: number;
  };
