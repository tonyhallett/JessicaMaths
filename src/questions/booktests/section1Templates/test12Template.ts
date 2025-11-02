import { addWordMultipleDigitsTemplateFactory } from "../../singlequestionfactories/addWordMultipleDigitsTemplateFactory";
import {
  plusMinusOperatorIntegerTemplateFactory,
  minusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import {
  wordOperateTemplateFactory,
  SubtractFrom,
} from "../../singlequestionfactories/wordOperateTemplateFactory";
import { penceSuffix } from "../../suffixes";
import type { BookTestTemplate } from "../types";

export const section1Test12: BookTestTemplate = {
  partA: [
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 12, Question 8",
      [minusOperator(50)],
      32,
      penceSuffix
    ),
  ],
  partB: [
    addWordMultipleDigitsTemplateFactory("Section 1, Test 12, B1", [15, 0, 26]),
    //todo
    wordOperateTemplateFactory("Section 1, Test 12, B8", 5, 202, SubtractFrom),
  ],
  partC: [],
};
