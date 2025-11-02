import type {
  Answer,
  AnswerInputSolution,
  QuestionAnswerType,
} from "./templatetransform/transformtemplate";

type TestSittingBase<T> = {
  section: number;
  test: number;
  id?: string; // when create this create the store at the same time
  allowRepeatedAttempts?: boolean;
  partA: T[];
  partB: T[];
  partC: T[];
};

type TestSitting = TestSittingBase<TestSittingQuestionAnswer>;

type TestSittingSingleQuestionAnswerBase<TAnswerInputs> = {
  questionNumber: number; // only necessary whilst do not have all questions templated
  question: string;
  type: QuestionAnswerType.Single;
  answerInputs: TAnswerInputs;
};

type TestSittingSingleQuestionAnswer =
  TestSittingSingleQuestionAnswerBase<TestSittingAnswerInput>;

type TestSettingInput = {
  input?: string;
  attempts?: string[];
};

type TestSittingAnswerInput = AnswerInputSolution & TestSettingInput;

type TestSittingMultipleQuestionAnswerBase<TQuestionAnswers> = {
  questionNumber: number; // only necessary whilst do not have all questions completed
  type: QuestionAnswerType.Multiple;
  header?: string;
  questionAnswers: TQuestionAnswers;
};

type TestSittingMultipleQuestionAnswer = TestSittingMultipleQuestionAnswerBase<
  TestSittingSingleQuestionAnswer[]
>;

type TestSittingQuestionAnswer =
  | TestSittingSingleQuestionAnswer
  | TestSittingMultipleQuestionAnswer;

enum AnswerStatus {
  Correct,
  Incorrect,
  Unanswered,
}

type TestSittingStoreSingleQuestionAnswer = TestSittingSingleQuestionAnswerBase<
  TestSettingInput & Answer
> & { answerStatus: AnswerStatus };
type TestSittingStoreMultipleQuestionAnswer =
  TestSittingMultipleQuestionAnswerBase<TestSittingStoreSingleQuestionAnswer>;
type TestSittingStoreQuestionAnswer =
  | TestSittingStoreSingleQuestionAnswer
  | TestSittingStoreMultipleQuestionAnswer;
type TestSittingStore = TestSittingBase<TestSittingStoreQuestionAnswer> & {
  complete: boolean;
  startedAt: number;
  updatedAt: number;
};
