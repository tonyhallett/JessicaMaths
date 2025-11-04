import {
  plusMinusOperatorIntegerTemplateFactory,
  minusOperator,
  plusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import { subtractPenceFromPoundsTemplateFactory } from "../../singlequestionfactories/subtractPenceFromPoundsTemplateFactory";
import { penceSuffix } from "../../suffixes";
import type { BookTestTemplate } from "../booktesttemplates";

export const section1Test6: BookTestTemplate = {
  partA: [
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 6, Question 1",
      [minusOperator(380)],
      60
    ),
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 6, Question 2",
      [plusOperator(28)],
      40
    ),
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 6, Question 5",
      [plusOperator(22)],
      35
    ),
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 6, Question 10",
      [minusOperator(50)],
      26,
      penceSuffix
    ),
  ],
  partB: [
    //todo
    subtractPenceFromPoundsTemplateFactory("Section 1, Test 6, B10", 25, 1),
  ],
  partC: [],
};
