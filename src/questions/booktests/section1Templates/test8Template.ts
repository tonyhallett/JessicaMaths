import {
  plusMinusOperatorIntegerTemplateFactory,
  minusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import {
  wordOperateTemplateFactory,
  IncreaseBy,
} from "../../singlequestionfactories/wordOperateTemplateFactory";
import type { BookTestTemplate } from "../booktesttemplates";

export const section1Test8: BookTestTemplate = {
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
