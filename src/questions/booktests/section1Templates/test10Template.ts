import { dividePoundIntegerToPenceTemplateFactory } from "../../singlequestionfactories/dividePoundIntegerToPenceTemplateFactory";
import {
  plusMinusOperatorIntegerTemplateFactory,
  plusOperator,
} from "../../singlequestionfactories/plusMinusOperatorIntegerTemplateFactory";
import type { BookTestTemplate } from "../types";

export const section1Test10: BookTestTemplate = {
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
