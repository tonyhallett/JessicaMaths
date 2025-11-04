import { addWordMultipleDigitsTemplateFactory } from "../../singlequestionfactories/addWordMultipleDigitsTemplateFactory";
import {
  minusOperator,
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import {
  IncreaseBy,
  SubtractFrom,
  wordOperateTemplateFactory,
} from "../../singlequestionfactories/wordOperateTemplateFactory";
import { penceSuffix } from "../../suffixes";
import type { BookTestTemplate } from "../booktesttemplates";

export const section1Test1: BookTestTemplate = {
  partA: [
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 1, Question 1",
      [plusOperator(6), plusOperator(4)],
      8
    ),
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 1, Question 2",
      [minusOperator(15)],
      8,
      penceSuffix
    ),
    // todo question 3
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 1, Question 4",
      [plusOperator(5), plusOperator(5), plusOperator(2)],
      2,
      penceSuffix
    ),
  ],
  partB: [
    addWordMultipleDigitsTemplateFactory("Section 1, Test 1, B1", [5, 4, 9]),
    wordOperateTemplateFactory("Section 1, Test 1, B2", 9, 7, SubtractFrom),
    // todo
    wordOperateTemplateFactory("Section 1, Test 1, B5", 7, 8, IncreaseBy),
  ],
  partC: [],
};
