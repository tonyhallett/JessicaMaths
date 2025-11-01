import { QuestionParameterFormatType } from "../questions/questionanswertemplates";
import { toWordsOrdinal, toWords } from "number-to-words";

export const parameterTransformers: Map<
  QuestionParameterFormatType,
  (input: string) => string
> = new Map([
  [QuestionParameterFormatType.TimePastToWords, convertTimeToWords],
  [QuestionParameterFormatType.Nth, convertToNth],
  [QuestionParameterFormatType.CutInDenominator, convertToDenonimatorWord],
  [
    QuestionParameterFormatType.DenominatorPlural,
    convertToDenonimatorWordPlural,
  ],
  [QuestionParameterFormatType.DashedFractionWord, convertToDashedFractionWord],
  [QuestionParameterFormatType.NumberWord, toWords],
  [
    QuestionParameterFormatType.AfterNoonOrEveningWords,
    (amOrPm) => {
      if (amOrPm == "a.m.") {
        return "morming";
      }
      return "afternoon";
    },
  ],
]);

function convertToDashedFractionWord(fraction: string): string {
  const [numerator, denominator] = fraction.split("/");
  const num = parseInt(numerator!.trim());
  return `${toWords(num)}-${denominatorWord(denominator!.trim(), num > 1)}`;
}

function convertToDenonimatorWordPlural(number: string): string {
  const num = parseInt(number);
  return num === 2 ? "halves" : convertToDenonimatorWord(number);
}

function convertToDenonimatorWord(number: string): string {
  return denominatorWord(number, true);
}

function addS(word: string, plural: boolean): string {
  return plural ? word + "s" : word;
}

function denominatorWord(number: string, plural: boolean): string {
  const num = parseInt(number);
  switch (num) {
    case 2:
      return "half";
    case 3:
      return addS("third", plural);
    case 4:
      return addS("quarter", plural);
    default:
      return addS(toWordsOrdinal(num), plural);
  }
}

function convertToNth(number: string): string {
  const num = parseInt(number);
  if (isNaN(num)) {
    throw new Error("Invalid number for Nth conversion");
  }
  return toWordsOrdinal(num);
}

function convertTimeToWords(parameterStr: string): string {
  const [hoursStr, minutesStr] = parameterStr.split(":");
  const minutes = parseInt(minutesStr!);
  const hours = parseInt(hoursStr!);
  switch (minutes) {
    case 0:
      return `${toWords(hours)} o'clock`;
    case 15:
      return `quarter past ${toWords(hours)}`;
    case 30:
      return `half past ${toWords(hours)}`;
    case 45:
      const toHour = nextHour(parseInt(hoursStr!));
      return `quarter to ${toWords(toHour)}`;
  }
  const hour = minutes > 30 ? nextHour(hours) : hours;
  const minuteWord = minutes > 30 ? 60 - minutes : minutes;
  const pastTo = minutes > 30 ? "to" : "past";
  return `${toWords(minuteWord)} ${pastTo} ${toWords(hour)}`;
}

function nextHour(hour: number): number {
  return (hour % 12) + 1;
}
