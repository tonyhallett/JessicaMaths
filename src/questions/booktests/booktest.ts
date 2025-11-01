import { penceSuffix } from "../suffixes";
import type { BookTests, BookTestSection, BookTestTest } from "./types";
import {
  minusOperator,
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
} from "../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import { addWordMultipleDigitsTemplateFactory } from "../singlequestionfactories/addWordMultipleDigitsTemplateFactory";
import {
  DivideBy,
  IncreaseBy,
  MultiplyBy,
  SubtractFrom,
  wordOperateTemplateFactory,
} from "../singlequestionfactories/wordOperateTemplateFactory";
import { subtractPenceFromPoundsTemplateFactory } from "../singlequestionfactories/subtractPenceFromPoundsTemplateFactory";
import { dividePoundIntegerToPenceTemplateFactory } from "../singlequestionfactories/dividePoundIntegerToPenceTemplateFactory";

const section1Test1: BookTestTest = {
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
    wordOperateTemplateFactory("Section 1, Test 1, B2", 7, 16, SubtractFrom),
    // todo
    wordOperateTemplateFactory("Section 1, Test 1, B5", 7, 8, IncreaseBy),
  ],
  partC: [],
};

const section1Test2: BookTestTest = {
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

const section1Test3: BookTestTest = {
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
    wordOperateTemplateFactory("Section 1, Test 3, B8", 9, 26, SubtractFrom),
  ],
  partC: [],
};

const section1Test4: BookTestTest = {
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

const section1Test5: BookTestTest = {
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

const section1Test6: BookTestTest = {
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

const section1Test7: BookTestTest = {
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

const section1Test8: BookTestTest = {
  partA: [
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 8, Question 7",
      [minusOperator(820)],
      40
    ),
  ],
  partB: [
    wordOperateTemplateFactory("Section 1, Test 8, B1", 52, 18, IncreaseBy),
  ],
  partC: [],
};

const section1Test9: BookTestTest = {
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

const section1Test10: BookTestTest = {
  partA: [
    //todo
    plusMinusOperatorIntegerTemplateFactory(
      "Section 1, Test 10, Question 6",
      [plusOperator(25)],
      66
    ),
  ],
  partB: [
    //todo
    dividePoundIntegerToPenceTemplateFactory("Section 1, Test 10, B10", 2, 10),
  ],
  partC: [],
};
const section1Test11: BookTestTest = {
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

const section1Test12: BookTestTest = {
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

const section1Tests: BookTestSection = [
  section1Test1,
  section1Test2,
  section1Test3,
  section1Test4,
  section1Test5,
  section1Test6,
  section1Test7,
  section1Test8,
  section1Test9,
  section1Test10,
  section1Test11,
  section1Test12,
];

export const bookTests: BookTests = [section1Tests];
