import {
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import { subtractPenceFromPoundsTemplateFactory } from "../../singlequestionfactories/subtractPenceFromPoundsTemplateFactory";
import {
  wordOperateTemplateFactory,
  MultiplyBy,
} from "../../singlequestionfactories/wordOperateTemplateFactory";
import type { BookTestTemplate } from "../booktesttemplates";

export const section1Test7: BookTestTemplate = {
  partA: [
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 7, Question 2",
      [plusOperator(25)],
      15
    ),
    // todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 7, Question 5",
      [plusOperator(170)],
      40
    ),
  ],
  partB: [
    wordOperateTemplateFactory("Section 1, Test 7, B1", 0, 6, MultiplyBy),
    subtractPenceFromPoundsTemplateFactory("Section 1, Test 7, B2", 73, 1),
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 7, Question 3",
      [plusOperator(6), plusOperator(30)],
      400
    ),
  ],
  partC: [],
};
