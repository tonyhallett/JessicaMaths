import { section1Test1 } from "./section1Templates/test1Template";
import { section1Test2 } from "./section1Templates/test2Template";
import { section1Test3 } from "./section1Templates/test3Template";
import { section1Test4 } from "./section1Templates/test4Template";
import { section1Test5 } from "./section1Templates/test5Template";
import { section1Test6 } from "./section1Templates/test6Template";
import { section1Test7 } from "./section1Templates/test7Template";
import { section1Test8 } from "./section1Templates/test8Template";
import { section1Test9 } from "./section1Templates/test9Template";
import { section1Test10 } from "./section1Templates/test10Template";
import { section1Test11 } from "./section1Templates/test11Template";
import { section1Test12 } from "./section1Templates/test12Template";
import { type QuestionAnswerTemplate } from "../questionanswertemplates";

export type BookTestTemplate = {
  partA: QuestionAnswerTemplate[];
  partB: QuestionAnswerTemplate[];
  partC: QuestionAnswerTemplate[];
};

export type BookTestSectionTemplate = BookTestTemplate[];

export type BookTestTemplates = BookTestSectionTemplate[];

const section1Tests: BookTestSectionTemplate = [
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

export const bookTests: BookTestTemplates = [section1Tests];
