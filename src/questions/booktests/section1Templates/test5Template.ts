import {
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
  minusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import {
  wordOperateTemplateFactory,
  MultiplyBy,
} from "../../singlequestionfactories/wordOperateTemplateFactory";
import { penceSuffix } from "../../suffixes";
import type { BookTestTemplate } from "../types";

export const section1Test5: BookTestTemplate = {
  partA: [
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 5, Question 7",
      [plusOperator(20), minusOperator(5)],
      6,
      penceSuffix
    ),
    //todo
  ],
  partB: [
    //todo
    wordOperateTemplateFactory("Section 1, Test 5, B2", 8, 6, MultiplyBy),
  ],
  partC: [],
};
