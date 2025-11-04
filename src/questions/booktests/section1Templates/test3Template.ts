import {
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
  minusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import {
  wordOperateTemplateFactory,
  MultiplyBy,
  SubtractFrom,
} from "../../singlequestionfactories/wordOperateTemplateFactory";
import { penceSuffix } from "../../suffixes";
import type { BookTestTemplate } from "../booktesttemplates";

export const section1Test3: BookTestTemplate = {
  partA: [
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 3, Question 3",
      [plusOperator(8), minusOperator(7)],
      10
    ),
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 3, Question 5",
      [plusOperator(10), plusOperator(2), minusOperator(2)],
      7,
      penceSuffix
    ),
  ],
  partB: [
    wordOperateTemplateFactory("Section 1, Test 3, B1", 4, 7, MultiplyBy),
    //todo
    wordOperateTemplateFactory("Section 1, Test 3, B8", 17, 9, SubtractFrom),
  ],
  partC: [],
};
