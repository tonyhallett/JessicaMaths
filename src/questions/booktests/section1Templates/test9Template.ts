import {
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import type { BookTestTemplate } from "../types";

export const section1Test9: BookTestTemplate = {
  partA: [
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 9, Question 1",
      [plusOperator(300), plusOperator(60)],
      5
    ),
    // todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 9, Question 4",
      [plusOperator(34)],
      37
    ),
  ],
  partB: [],
  partC: [],
};
