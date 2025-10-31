import {
  SingularInputAnswerQATemplate,
  MultipleInputAnswerQATemplate,
  MultipleQuestionsQATemplate,
  QuestionAnswerParameterType,
  QuestionParameterFormatType,
  AnswerParameterFormatType,
  AnswerType,
  QuestionAnswerTemplateType,
} from "../src/questionanswertemplates";
import { nthMonthOfTheYear } from "../src/months";
import { nthLetterOfTheAlphabet } from "../src/nthLetterOfTheAlphabet";
import { BoxPlaceholder } from "../src/replaceBoxPlaceholderWithLatex";

jest.mock("../src/replaceBoxPlaceholderWithLatex", () => ({
  replaceBoxPlaceholderWithLatex: (input: string) => {
    return input + "_boxreplaced";
  },
}));

import {
  MultipleQuestionAnswer,
  QuestionAnswerType,
  SingleQuestionAnswer,
  transformTemplate,
} from "../src/transformtemplate";

describe("QA Template Transform", () => {
  const expectQuestion = (question: string, expected: string) => {
    expect(question).toBe(expected + "_boxreplaced");
  };

  const expectSqaQuestion = (
    singleQuestionAnswer: SingleQuestionAnswer,
    expected: string
  ) => {
    expectQuestion(singleQuestionAnswer.question, expected);
  };

  describe("single question templates", () => {
    describe("Singular Input Template", () => {
      const questionAnswerTemplate: SingularInputAnswerQATemplate = {
        id: "Section 1, Test 1, Question 1",
        type: QuestionAnswerTemplateType.SingularInput,
        question: `{1} + {2} + {3}`,
        answer: {
          input: {
            type: AnswerType.Integer,
          },
          answerReplacement: "{1} + {2} + {3}",
        },
        parameters: [
          { type: QuestionAnswerParameterType.Number, testValue: "6" },
          { type: QuestionAnswerParameterType.Number, testValue: "4" },
          { type: QuestionAnswerParameterType.Number, testValue: "8" },
        ],
      };

      const transformDemoQA = () =>
        transformSingleInputQA(questionAnswerTemplate, ["5", "3", "2"]);

      const transformSingleInputQA = (
        template: SingularInputAnswerQATemplate,
        parameterValues: string[]
      ): SingleQuestionAnswer => {
        const questionAnswer = transformTemplate(template, parameterValues);
        expect(questionAnswer.type).toBe(QuestionAnswerType.Single);
        const singleQuestionAnswer = questionAnswer as SingleQuestionAnswer;
        expect(singleQuestionAnswer.answerInputs).toHaveLength(1);
        return singleQuestionAnswer;
      };

      const expectTransformSingleInputQA = (
        template: SingularInputAnswerQATemplate,
        parameterValues: string[],
        expectedQuestion: string,
        expectedAnswer: string
      ) => {
        const questionAnswer = transformSingleInputQA(
          template,
          parameterValues
        );
        expectSqaQuestion(questionAnswer, expectedQuestion);
        expectAnswer(questionAnswer, expectedAnswer);
      };

      const expectAnswer = (
        singleQuestionAnswer: SingleQuestionAnswer,
        expected: string
      ) => {
        expect(singleQuestionAnswer.answerInputs[0].answer).toBe(expected);
      };

      it("should set templateId", () => {
        const questionAnswer = transformDemoQA();
        expect(questionAnswer.templateId).toBe(questionAnswerTemplate.id);
      });

      it("should have the same answer type", () => {
        const questionAnswer = transformDemoQA();
        expect(questionAnswer.answerInputs[0].type).toBe(AnswerType.Integer);
      });

      it("should have prefix / suffix from template", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 1, Question 1",
          type: QuestionAnswerTemplateType.SingularInput,
          question: `{1} + {2} + {3}`,
          answer: {
            input: {
              type: AnswerType.Integer,
              prefix: "$",
              suffix: "dollars",
            },
            answerReplacement: "{1} + {2} + {3}",
          },
          parameters: [
            { type: QuestionAnswerParameterType.Number, testValue: "6" },
            { type: QuestionAnswerParameterType.Number, testValue: "4" },
            { type: QuestionAnswerParameterType.Number, testValue: "8" },
          ],
        };

        const singleQuestionAnswer = transformSingleInputQA(
          questionAnswerTemplate,
          ["1", "2", "3"]
        );
        expect(singleQuestionAnswer.answerInputs[0].prefix).toBe("$");
        expect(singleQuestionAnswer.answerInputs[0].suffix).toBe("dollars");
      });

      it("should replace question parameters, replacing box", () => {
        const questionAnswer = transformDemoQA();
        expectSqaQuestion(questionAnswer, "5 + 3 + 2");
      });

      it("should calculate answer with mathjs by default", () => {
        const questionAnswer = transformDemoQA();
        expectAnswer(questionAnswer, "10");
      });

      it("should replace time parameters to words", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 2, B 5 ",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "Write the time `{1}` in digital form",
          answer: {
            input: {
              type: AnswerType.Time,
            },
            answerReplacement: "{1}",
            noCalculation: true,
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.DigitalTime,
              testValue: "4:15",
              questionFormat: QuestionParameterFormatType.TimePastToWords,
            },
          ],
        };
        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["4:15"],
          "Write the time `quarter past four` in digital form",
          "4:15"
        );
      });

      it("should replace time parameters to words - am", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 3, Test 2, B 5 ",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "Write the time in digits: {1} in the {2}",
          answer: {
            input: {
              type: AnswerType.Words,
            },
            answerReplacement: "{1} {2}",
            noCalculation: true,
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.DigitalTime,
              testValue: "4:50",
              questionFormat: QuestionParameterFormatType.TimePastToWords,
            },
            {
              type: QuestionAnswerParameterType.AmPm,
              testValue: "p.m.",
              questionFormat:
                QuestionParameterFormatType.AfterNoonOrEveningWords,
            },
          ],
        };
        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["4:50", "p.m."],
          "Write the time in digits: ten to five in the afternoon",
          "4:50 p.m."
        );
      });

      it("should replace Nth parameters - letters of the alphabet", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 1, C 1",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "What is the {1} letter of the alphabet",
          answer: {
            input: {
              type: AnswerType.Letter,
            },
            answerReplacement: "{1}",
            customCalculationFunction: nthLetterOfTheAlphabet,
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.AlphabetPosition,
              testValue: "6",
              questionFormat: QuestionParameterFormatType.Nth,
            },
          ],
        };
        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["6"],
          "What is the sixth letter of the alphabet",
          "f"
        );
      });

      it("should replace Nth parameters - month of year", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 2, B 3",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "Write the {1} month of the year",
          answer: {
            input: {
              type: AnswerType.Words,
            },
            answerReplacement: "{1}",
            customCalculationFunction: nthMonthOfTheYear,
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.AlphabetPosition,
              testValue: "6",
              questionFormat: QuestionParameterFormatType.Nth,
            },
          ],
        };

        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["8"],
          "Write the eighth month of the year",
          "August"
        );
      });

      it("should replace denominator parameters - cut in - 2", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 1, C 3",
          type: QuestionAnswerTemplateType.SingularInput,
          question:
            "A piece of spaghetti {1}cm long is cut in {2}.  How long is one of the pieces ?",
          answer: {
            input: {
              type: AnswerType.Integer,
            },
            answerReplacement: "{1} / {2}",
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.Number,
              testValue: "18",
            },
            {
              type: QuestionAnswerParameterType.Denominator,
              testValue: "2",
              questionFormat: QuestionParameterFormatType.CutInDenominator,
            },
          ],
        };
        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["18", "2"],
          "A piece of spaghetti 18cm long is cut in half.  How long is one of the pieces ?",
          "9"
        );
      });

      it("should replace denominator parameters - cut in - 3", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 1, C 3",
          type: QuestionAnswerTemplateType.SingularInput,
          question:
            "A piece of spaghetti {1}cm long is cut in {2}.  How long is one of the pieces ?",
          answer: {
            input: {
              type: AnswerType.Integer,
            },
            answerReplacement: "{1} / {2}",
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.Number,
              testValue: "18",
            },
            {
              type: QuestionAnswerParameterType.Denominator,
              testValue: "2",
              questionFormat: QuestionParameterFormatType.CutInDenominator,
            },
          ],
        };

        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["18", "3"],
          "A piece of spaghetti 18cm long is cut in thirds.  How long is one of the pieces ?",
          "6"
        );
      });

      it("should replace denominator parameters - plural", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 1, C 3",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "How many {1} are in {2} whole ones ?",
          answer: {
            input: {
              type: AnswerType.Integer,
            },
            answerReplacement: "{2} / ( 1 / {1} )",
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.Denominator,
              questionFormat: QuestionParameterFormatType.DenominatorPlural,
              testValue: "2",
            },
            {
              type: QuestionAnswerParameterType.Number,
              testValue: "9",
            },
          ],
        };

        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["2", "9"],
          "How many halves are in 9 whole ones ?",
          "18"
        );
      });

      it("should replace denominator parameters - plural", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 1, C 3",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "How many {1} are in {2} whole ones ?",
          answer: {
            input: {
              type: AnswerType.Integer,
            },
            answerReplacement: "{2} / ( 1 / {1} )",
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.Denominator,
              questionFormat: QuestionParameterFormatType.DenominatorPlural,
              testValue: "2",
            },
            {
              type: QuestionAnswerParameterType.Number,
              testValue: "9",
            },
          ],
        };
        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["3", "9"],
          "How many thirds are in 9 whole ones ?",
          "27"
        );
      });

      it("should replace dashed fraction parameters", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 2, B 6",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "{1} of {2}",
          answer: {
            input: {
              type: AnswerType.Integer,
            },
            answerReplacement: "{1} * {2}",
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.Fraction,
              questionFormat: QuestionParameterFormatType.DashedFractionWord,
              testValue: "1/4",
            },
            {
              type: QuestionAnswerParameterType.Number,
              testValue: "20",
            },
          ],
        };
        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["1/4", "20"],
          "One-quarter of 20",
          "5"
        );
      });

      it("should replace answer fraction parameters", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 2, B 8",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "How many {1}-metres togther measure {2}m",
          answer: {
            input: {
              type: AnswerType.Integer,
            },
            answerReplacement: "{2} / (1/{1})",
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.Denominator,
              questionFormat: QuestionParameterFormatType.CutInDenominator,
              testValue: "2",
            },
            {
              type: QuestionAnswerParameterType.Fraction,
              testValue: "4 1/2",
              answerFormat: AnswerParameterFormatType.Fraction,
            },
          ],
        };
        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["2", "4 1/2"],
          "How many half-metres togther measure 4 1/2m",
          "9"
        );
      });

      it("should replace number with words and suffix - singular", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 1, C 2",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "How many days are there in {1} week{s1}?",
          answer: {
            input: {
              type: AnswerType.Integer,
            },
            answerReplacement: "{1} * 7",
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.Number,
              questionFormat: QuestionParameterFormatType.NumberWord,
              testValue: "3",
            },
          ],
        };

        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["1"],
          "How many days are there in one week?",
          "7"
        );
      });

      it("should replace number with words and suffix - plural", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 1, C 2",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "How many days are there in {1} week{s1}?",
          answer: {
            input: {
              type: AnswerType.Integer,
            },
            answerReplacement: "{1} * 7",
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.Number,
              questionFormat: QuestionParameterFormatType.NumberWord,
              testValue: "3",
            },
          ],
        };

        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["3"],
          "How many days are there in three weeks?",
          "21"
        );
      });

      it("should replace names", () => {
        const questionAnswerTemplate: SingularInputAnswerQATemplate = {
          id: "Section 1, Test 1, C 4",
          type: QuestionAnswerTemplateType.SingularInput,
          question:
            "{1} {2}{s1} are taken from a {3} of {4}. How many are left?",
          answer: {
            input: {
              type: AnswerType.Integer,
            },
            answerReplacement: "{4} - {1}",
          },
          parameters: [
            {
              type: QuestionAnswerParameterType.Number,
              questionFormat: QuestionParameterFormatType.NumberWord,
              testValue: "6",
            },
            {
              type: QuestionAnswerParameterType.Name,
              testValue: "chocolate truffles",
            },
            {
              type: QuestionAnswerParameterType.Name,
              testValue: "box",
            },
            {
              type: QuestionAnswerParameterType.Number,
              testValue: "20",
            },
          ],
        };

        expectTransformSingleInputQA(
          questionAnswerTemplate,
          ["6", "chocolate truffle", "box", "20"],
          "Six chocolate truffles are taken from a box of 20. How many are left?",
          "14"
        );
      });
    });

    describe("Multiple answer inputs template", () => {
      it("should work with customCalculationFunction", () => {
        const createQuestion = (prefix: string): string => {
          return `${prefix}ml = ${BoxPlaceholder}l ${BoxPlaceholder}ml`;
        };
        const questionAnswerTemplate: MultipleInputAnswerQATemplate = {
          id: "Section 1, Test 7, A 1",
          type: QuestionAnswerTemplateType.MultipleInput,
          question: createQuestion("{1}"),
          parameters: [
            {
              testValue: "1800",
              type: QuestionAnswerParameterType.Number,
            },
          ],
          answer: {
            type: "customCalculationFunction",
            inputs: [
              {
                type: AnswerType.Integer,
                suffix: "l",
              },
              {
                type: AnswerType.Integer,
                suffix: "ml",
              },
            ],
            answerReplacement: `{1}`,
            customCalculationFunction: (answer: string) => {
              const totalMl = parseInt(answer);
              const litres = Math.floor(totalMl / 1000);
              const millilitres = totalMl % 1000;
              return [litres.toString(), millilitres.toString()];
            },
          },
        };

        const singleQuestionAnswer = transformTemplate(questionAnswerTemplate, [
          "1800",
        ]) as SingleQuestionAnswer;
        expect(singleQuestionAnswer.templateId).toBe(questionAnswerTemplate.id);
        expectSqaQuestion(singleQuestionAnswer, createQuestion("1800"));
        expect(singleQuestionAnswer.answerInputs).toHaveLength(2);
        expect(singleQuestionAnswer.answerInputs[0].answer).toBe("1");
        expect(singleQuestionAnswer.answerInputs[1].answer).toBe("800");
        expect(singleQuestionAnswer.answerInputs[0].suffix).toBe("l");
        expect(singleQuestionAnswer.answerInputs[1].suffix).toBe("ml");
        expect(singleQuestionAnswer.answerInputs[0].type).toBe(
          AnswerType.Integer
        );
        expect(singleQuestionAnswer.answerInputs[1].type).toBe(
          AnswerType.Integer
        );
      });
    });
  });

  describe("Multiple questions template", () => {
    const questionAnswerTemplate: MultipleQuestionsQATemplate = {
      id: "Section 3, Test 3, B8",
      type: QuestionAnswerTemplateType.MultipleQuestions,
      questionHeader: "{1} pencil{s1} cost £{2}. What is the cost of",
      commonParameters: [
        {
          type: QuestionAnswerParameterType.Number,
          testValue: "5",
          questionFormat: QuestionParameterFormatType.NumberWord,
          placeholder: 1,
        },
        {
          type: QuestionAnswerParameterType.Number,
          testValue: "1",
          placeholder: 2,
        },
      ],
      questionAnswers: [
        {
          id: "Part A",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "{3} pencil{s3}",
          parameters: [
            {
              type: QuestionAnswerParameterType.Number,
              testValue: "1",
              questionFormat: QuestionParameterFormatType.NumberWord,
              placeholder: 3,
            },
          ],
          answer: {
            input: {
              type: AnswerType.Integer,
              prefix: "a",
              suffix: "p",
            },
            answerReplacement: "{2} / {1} * {3}",
          },
          isTextQuestion: true,
        },
        {
          id: "Part B",
          type: QuestionAnswerTemplateType.SingularInput,
          question: "{4} pencil{s4}",
          parameters: [
            {
              type: QuestionAnswerParameterType.Number,
              testValue: "4",
              questionFormat: QuestionParameterFormatType.NumberWord,
              placeholder: 4,
            },
          ],
          answer: {
            input: {
              type: AnswerType.Integer,
              prefix: "b",
              suffix: "p",
            },
            answerReplacement: "{2} / {1} * {4}",
          },
          isTextQuestion: true,
        },
      ],
    };

    const transformMultipleQuestions = () => {
      return transformMultipleQuestionsWithParams(questionAnswerTemplate, [
        "2",
        "4",
        "1",
        "4",
      ]);
    };

    const transformMultipleQuestionsWithParams = (
      multipleQuestionsQaTemplate: MultipleQuestionsQATemplate,
      parameters: string[]
    ) => {
      const multipleQuestionAnswer = transformTemplate(
        multipleQuestionsQaTemplate,
        parameters
      ) as MultipleQuestionAnswer;
      expect(multipleQuestionAnswer.type).toBe(QuestionAnswerType.Multiple);
      expect(multipleQuestionAnswer.questionAnswers).toHaveLength(2);
      return multipleQuestionAnswer;
    };

    it("should transform parameters in the question header", () => {
      const multipleQuestionAnswer = transformMultipleQuestions();
      expectQuestion(
        multipleQuestionAnswer.header!,
        "Two pencils cost £4. What is the cost of"
      );
    });

    it("should transform each question answer using common parameters too", () => {
      const multipleQuestionAnswer = transformMultipleQuestions();
      const questionAnswerA = multipleQuestionAnswer
        .questionAnswers[0] as SingleQuestionAnswer;
      const questionAnswerB = multipleQuestionAnswer
        .questionAnswers[1] as SingleQuestionAnswer;
      expect(questionAnswerA.type).toBe(QuestionAnswerType.Single);
      expect(questionAnswerB.type).toBe(QuestionAnswerType.Single);
      expectSqaQuestion(questionAnswerA, "One pencil");
      expectSqaQuestion(questionAnswerB, "Four pencils");
    });

    it("should work with calculated questions", () => {
      const questionAnswerTemplate: MultipleQuestionsQATemplate = {
        id: "Section 3, Test 12, A4",
        type: QuestionAnswerTemplateType.MultipleQuestions,
        questionHeader: "How many {1}{s1} are there in",
        commonParameters: [
          {
            type: QuestionAnswerParameterType.Number,
            testValue: "12",
          },
        ],
        questionAnswers: [
          {
            id: "Part A",
            type: QuestionAnswerTemplateType.SingularInput,
            question: (parameters) => {
              const howMany = parseInt(parameters[0]);
              return (howMany * 10).toString();
            },
            parameters: [],
            answer: {
              input: {
                type: AnswerType.Integer,
                prefix: "a",
              },
              answerReplacement: "10",
              noCalculation: true,
            },
            isTextQuestion: true,
          },
          {
            id: "Part B",
            type: QuestionAnswerTemplateType.SingularInput,
            question: (parameters) => {
              const howMany = parseInt(parameters[0]);
              return (howMany * 100).toString();
            },
            parameters: [],
            answer: {
              input: {
                type: AnswerType.Integer,
                prefix: "b",
              },
              answerReplacement: "100",
              noCalculation: true,
            },
            isTextQuestion: true,
          },
        ],
      };

      const multipleQuestionAnswer = transformMultipleQuestionsWithParams(
        questionAnswerTemplate,
        ["12"]
      );

      expectQuestion(
        multipleQuestionAnswer.header!,
        "How many 12s are there in"
      );
      const questionAnswerA = multipleQuestionAnswer
        .questionAnswers[0] as SingleQuestionAnswer;
      const questionAnswerB = multipleQuestionAnswer
        .questionAnswers[1] as SingleQuestionAnswer;
      expectSqaQuestion(questionAnswerA, "120");
      expectSqaQuestion(questionAnswerB, "1200");
    });

    test("Section 3, Test 12, B 9", () => {
      const questionAnswerTemplate: MultipleQuestionsQATemplate = {
        id: "Section 3, Test 12, A4",
        type: QuestionAnswerTemplateType.MultipleQuestions,
        questionHeader: "Bagels cost {1}p.  What is the cost of",
        commonParameters: [
          {
            type: QuestionAnswerParameterType.Number,
            testValue: "8",
          },
        ],
        questionAnswers: [
          {
            id: "Part A",
            type: QuestionAnswerTemplateType.SingularInput,
            question: "10",
            parameters: [],
            answer: {
              input: {
                type: AnswerType.Integer,
                prefix: "a",
              },
              answerReplacement: "10 * {1}",
            },
            isTextQuestion: true,
          },
          {
            id: "Part B",
            type: QuestionAnswerTemplateType.SingularInput,
            question: "100?",
            parameters: [],
            answer: {
              input: {
                type: AnswerType.Decimal,
                prefix: "b £",
              },
              answerReplacement: "{1}",
              noCalculation: true,
            },
            isTextQuestion: true,
          },
        ],
      };
      const multipleQuestionAnswer = transformMultipleQuestionsWithParams(
        questionAnswerTemplate,
        ["8"]
      );
      expect(
        multipleQuestionAnswer.questionAnswers[0].answerInputs[0].answer
      ).toBe("80");
      expect(
        multipleQuestionAnswer.questionAnswers[1].answerInputs[0].answer
      ).toBe("8");
    });

    test("Section 2, Test 6, C 8", () => {
      const questionAnswerTemplate: MultipleQuestionsQATemplate = {
        id: "Section 3, Test 12, A4",
        type: QuestionAnswerTemplateType.MultipleQuestions,
        questionHeader: "{1}kg{s1} costs {2}p.  What is the cost of",
        commonParameters: [
          {
            type: QuestionAnswerParameterType.Number,
            testValue: "1",
          },
          {
            type: QuestionAnswerParameterType.Number,
            testValue: "80",
          },
        ],
        questionAnswers: [
          {
            id: "Part A",
            type: QuestionAnswerTemplateType.SingularInput,
            question: "1/4 kg",
            parameters: [],
            answer: {
              input: {
                type: AnswerType.Integer,
                prefix: "a",
                suffix: "p",
              },
              answerReplacement: "{2} / {1} / 4",
            },
            isTextQuestion: true,
          },
          {
            id: "Part B",
            type: QuestionAnswerTemplateType.SingularInput,
            question: "3/4 kg",
            parameters: [],
            answer: {
              input: {
                type: AnswerType.Decimal,
                prefix: "b",
                suffix: "p",
              },
              answerReplacement: "{2} / {1} / 4 * 3",
            },
            isTextQuestion: true,
          },
        ],
      };

      const multipleQuestionAnswer = transformMultipleQuestionsWithParams(
        questionAnswerTemplate,
        ["1", "80"]
      );
      expect(
        multipleQuestionAnswer.questionAnswers[0].answerInputs[0].answer
      ).toBe("20");
      expect(
        multipleQuestionAnswer.questionAnswers[1].answerInputs[0].answer
      ).toBe("60");
    });

    test("Section 1, Test 11, B 10 - answer b depends on a parameters", () => {
      // this is one way of parameterizing
      const questionAnswerTemplate: MultipleQuestionsQATemplate = {
        id: "Section 3, Test 12, A4",
        type: QuestionAnswerTemplateType.MultipleQuestions,
        commonParameters: [
          {
            type: QuestionAnswerParameterType.Number,
            testValue: "6",
          },
          {
            type: QuestionAnswerParameterType.Number,
            testValue: "8",
          },
        ],
        questionAnswers: [
          {
            id: "Part A",
            type: QuestionAnswerTemplateType.SingularInput,
            question: (parameters) => {
              const buttonPrice = parseInt(parameters[0]);
              const totalBought = parseInt(parameters[1]);
              const boughtWith = totalBought * buttonPrice + 2;
              return `How many ${buttonPrice}p buttons can be bought for ${boughtWith}p?`;
            },
            parameters: [],
            answer: {
              input: {
                type: AnswerType.Integer,
                prefix: "a",
              },
              answerReplacement: "{2}",
              noCalculation: true,
            },
            isTextQuestion: true,
          },
          {
            id: "Part B",
            type: QuestionAnswerTemplateType.SingularInput,
            question: "What coin is given in change",
            parameters: [],
            answer: {
              input: {
                type: AnswerType.MultipleChoice, // todo the choices - Coins
                prefix: "b",
                suffix: "p",
              },
              answerReplacement: "2",
              noCalculation: true,
            },
            isTextQuestion: true,
          },
        ],
      };

      const multipleQuestionAnswer = transformMultipleQuestionsWithParams(
        questionAnswerTemplate,
        ["6", "8"]
      );

      const questionAnswerA = multipleQuestionAnswer
        .questionAnswers[0] as SingleQuestionAnswer;
      const questionAnswerB = multipleQuestionAnswer
        .questionAnswers[1] as SingleQuestionAnswer;
      expectSqaQuestion(
        questionAnswerA,
        "How many 6p buttons can be bought for 50p?"
      );
      expectSqaQuestion(questionAnswerB, "What coin is given in change");
      expect(questionAnswerA.answerInputs[0].answer).toBe("8");
      expect(questionAnswerB.answerInputs[0].answer).toBe("2");
    });
  });
});
