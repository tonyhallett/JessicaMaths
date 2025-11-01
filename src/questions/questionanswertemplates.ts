// parameters type is for the UI.
export enum QuestionAnswerParameterType {
  Number = 1,
  Fraction = 2,
  Name = 3,
  DigitalTime = 4,
  AlphabetPosition,
  Denominator,
  AmPm,
  Numerator,
}

export enum QuestionParameterFormatType {
  TimePastToWords = 1,
  Nth,
  CutInDenominator,
  DenominatorPlural,
  DashedFractionWord,
  NumberWord,
  AfterNoonOrEveningWords,
}

export enum AnswerParameterFormatType {
  Fraction = 1,
}

export type QuestionAnswerParameter = {
  type: QuestionAnswerParameterType;
  questionFormat?: QuestionParameterFormatType;
  answerFormat?: AnswerParameterFormatType;
  testValue: string;
  placeholder?: number;
};

export enum AnswerType {
  Letter = 1,
  Words = 2,
  RomanNumeral = 3,
  Integer = 4,
  Decimal = 5,
  MultipleChoice = 6,
  Fraction = 7,
  Time = 8,
  AmPm = 9,
  DecimalOrdering = 10,
}

export type AnswerInput = {
  prefix?: string;
  suffix?: string;
  type: AnswerType;
};

export enum QuestionAnswerTemplateType {
  SingularInput = 1,
  MultipleInput = 2,
  MultipleQuestions = 3,
}

export type CalculatedQuestion = (parameterValues: string[]) => string;

export type Question = string | CalculatedQuestion;

export type SingularInputAnswerQATemplate = {
  id: string;
  question: Question;
  isTextQuestion?: boolean;
  type: QuestionAnswerTemplateType.SingularInput;
  answer: {
    input: AnswerInput;
    answerReplacement: string;
    noCalculation?: true;
    // this will change as proceed
    customCalculationFunction?: (input: string) => string;
  };

  parameters: QuestionAnswerParameter[];
};

type MultipleInputCustomCalculationFunction = {
  type: "customCalculationFunction";
  customCalculationFunction: (input: string) => string[];
};

type MultipleInputSplitAnswerFunction = {
  type: "splitAnswerFunction";
  splitAnswerFunction: (result: unknown) => string[];
};

type MultipleInputAnswerFunction =
  | MultipleInputCustomCalculationFunction
  | MultipleInputSplitAnswerFunction;

export type MultipleInputAnswerQATemplate = {
  id: string;
  question: string;
  isTextQuestion?: boolean;
  type: QuestionAnswerTemplateType.MultipleInput;
  answer: {
    inputs: AnswerInput[];
    answerReplacement: string;
  } & MultipleInputAnswerFunction;

  parameters: QuestionAnswerParameter[];
};

export type MultipleQuestionsQATemplate = {
  id: string;
  questionHeader?: string;
  commonParameters?: QuestionAnswerParameter[];
  type: QuestionAnswerTemplateType.MultipleQuestions;
  questionAnswers: SingleQuestionQATemplate[];
};

type SingleQuestionQATemplate =
  | SingularInputAnswerQATemplate
  | MultipleInputAnswerQATemplate;

export type QuestionAnswerTemplate =
  | SingleQuestionQATemplate
  | MultipleQuestionsQATemplate;
