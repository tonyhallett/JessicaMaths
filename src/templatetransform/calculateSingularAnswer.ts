import type { SingularAnswerTemplate } from "../questions/questionanswertemplates";
import { mathjsEvaluate } from "./mathjsEvaluate";

export function calculateSingularAnswer(
  answer: SingularAnswerTemplate,
  answerReplacement: string
): string {
  return answer.noCalculation
    ? answerReplacement
    : answer.customCalculationFunction
    ? answer.customCalculationFunction(answerReplacement)
    : mathjsEvaluate(answerReplacement);
}
