import {
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
  minusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import {
  wordOperateTemplateFactory,
  MultiplyBy,
  DivideBy,
  SubtractFrom,
} from "../../singlequestionfactories/wordOperateTemplateFactory";
import { penceSuffix } from "../../suffixes";
import type { BookTestTemplate } from "../types";

export const section1Test2: BookTestTemplate = {
  partA: [
    // question 1 todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 2, Question 2",
      [plusOperator(10), plusOperator(6)],
      3,
      penceSuffix
    ),
    // todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 2, Question 8",
      [plusOperator(4), minusOperator(9)],
      7,
      penceSuffix
    ),
  ],
  partB: [
    wordOperateTemplateFactory("Section 1, Test 2, B1", 4, 8, MultiplyBy),
    wordOperateTemplateFactory("Section 1, Test 2, B2", 18, 3, DivideBy),
    // todo
    wordOperateTemplateFactory(
      "Section 1, Test 2, B7",
      16,
      25,
      SubtractFrom,
      penceSuffix
    ),
  ],
  partC: [],
};
