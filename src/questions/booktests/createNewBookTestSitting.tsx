import { bookQATests } from "./bookqatests";
import type {
  BookTestSitting,
  TestSittingQuestionAnswer,
  TestSittingMultipleQuestionAnswer,
  TestSittingSingleQuestionAnswer,
} from "./booktestsitting";
import {
  type QuestionAnswer,
  QuestionAnswerType,
  type SingleQuestionAnswer,
} from "../../templatetransform/transformtemplate";

export const createNewBookTestSitting = (
  section: number,
  test: number,
  allowRepeatedAttempts: boolean
): BookTestSitting => {
  const bookTest = bookQATests[section - 1]![test - 1]!;
  return {
    book: 1,
    section,
    test,
    partA: bookTest.partA.map(createTestSittingQuestionAnswer),
    partB: bookTest.partB.map(createTestSittingQuestionAnswer),
    partC: bookTest.partC.map(createTestSittingQuestionAnswer),
    allowRepeatedAttempts,
    // id will be created when store is created
  };
};
const createTestSittingQuestionAnswer = (
  questionAnswer: QuestionAnswer,
  questionNumber: number
): TestSittingQuestionAnswer => {
  if (questionAnswer.type === QuestionAnswerType.Single) {
    return createTestSettingSingleQuestionAnswer(
      questionAnswer,
      questionNumber
    );
  } else {
    const mqa: TestSittingMultipleQuestionAnswer = {
      type: QuestionAnswerType.Multiple,
      questionNumber,
      questionAnswers: questionAnswer.questionAnswers.map(
        createTestSettingSingleQuestionAnswer
      ),
    };
    if (questionAnswer.header !== undefined) {
      mqa.header = questionAnswer.header;
    }
    return mqa;
  }
};
const createTestSettingSingleQuestionAnswer = (
  questionAnswer: SingleQuestionAnswer,
  questionNumber: number
): TestSittingSingleQuestionAnswer => {
  const qa: TestSittingSingleQuestionAnswer = {
    type: QuestionAnswerType.Single,
    question: questionAnswer.question,
    questionNumber,
    answerInputs: questionAnswer.answerInputs.map((ai) => ({
      ...ai,
    })),
  };
  return qa;
};
