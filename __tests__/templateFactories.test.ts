import {
  AnswerType,
  QuestionAnswerParameterType,
  QuestionAnswerTemplateType,
} from "../src/questions/questionanswertemplates";
import {
  minusOperator,
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
} from "../src/questions/singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";

describe("template factories", () => {
  describe("single question factories", () => {
    describe("plusMinusOperatorIntegerTemplateFactory", () => {
      // id will be reconsidered

      it("should be singular input type", () => {
        const template = plusMinusOperatorIntegerTemplateFactory(
          "",
          [plusOperator(3), minusOperator(2)],
          0
        );

        expect(template.type).toBe(QuestionAnswerTemplateType.SingularInput);
      });

      it("should create a template with replaceable question based on operators and suffix", () => {
        const template = plusMinusOperatorIntegerTemplateFactory(
          "",
          [plusOperator(3), minusOperator(2)],
          0,
          "m"
        );
        expect(template.question).toBe("{1}m + {2}m - {3}m =");
      });

      it("should create a template with replaceable question based on operators alone", () => {
        const template = plusMinusOperatorIntegerTemplateFactory(
          "",
          [plusOperator(3), minusOperator(2)],
          0
        );
        expect(template.question).toBe("{1} + {2} - {3} =");
      });

      it("should create a template with answerReplacement based on operators", () => {
        const template = plusMinusOperatorIntegerTemplateFactory(
          "",
          [plusOperator(3), minusOperator(2)],
          0,
          "m"
        );
        expect(template.answer.answerReplacement).toBe("{1} + {2} - {3}");
      });

      it("should create a template with number parameters based on operators and last number", () => {
        const template = plusMinusOperatorIntegerTemplateFactory(
          "",
          [plusOperator(3), minusOperator(2)],
          9,
          "m"
        );
        expect(template.parameters.length).toBe(3);
        expect(template.parameters[0].testValue).toBe("3");
        expect(template.parameters[1].testValue).toBe("2");
        expect(template.parameters[2].testValue).toBe("9");
        expect(
          template.parameters.every(
            (p) => p.type === QuestionAnswerParameterType.Number
          )
        ).toBe(true);
      });

      it.each([
        {
          label: "with suffix",
          suffix: "m",
          expectedSuffix: "m",
          withSuffixArg: true,
        },
        {
          label: "without suffix",
          suffix: "",
          expectedSuffix: undefined,
          withSuffixArg: false,
        },
      ])(
        "should create a template with answer type integer and suffix if provided (%s)",
        ({ label, suffix, expectedSuffix, withSuffixArg }) => {
          const template = withSuffixArg
            ? plusMinusOperatorIntegerTemplateFactory(
                "",
                [plusOperator(3), minusOperator(2)],
                0,
                suffix
              )
            : plusMinusOperatorIntegerTemplateFactory(
                "",
                [plusOperator(3), minusOperator(2)],
                0
              );

          expect(template.answer.input.type).toBe(AnswerType.Integer);
          expect(template.answer.input.suffix).toBe(expectedSuffix);
        }
      );
    });
  });
});
