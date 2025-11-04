import {
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import type { BookTestTemplate } from "../booktesttemplates";

export const section1Test11: BookTestTemplate = {
  partA: [
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 11, Question 8",
      [plusOperator(17), plusOperator(18)],
      5
    ),
  ],
  partB: [],
  partC: [],
};
