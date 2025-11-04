import {
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
  minusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import { penceSuffix } from "../../suffixes";
import type { BookTestTemplate } from "../booktesttemplates";

export const section1Test4: BookTestTemplate = {
  partA: [
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 4, Question 2",
      [plusOperator(10), plusOperator(2), minusOperator(1)],
      6,
      penceSuffix
    ),
    //todo
  ],
  partB: [],
  partC: [],
};
