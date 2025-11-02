import {
  QuestionAnswerTemplateType,
  type QuestionAnswerTemplate,
} from "./questions/questionanswertemplates";
import { bookTests } from "./questions/booktests/booktesttemplates";
import Latex from "react-latex";

import {
  transformTemplate,
  type SingleQuestionAnswer,
} from "./templatetransform/transformtemplate";

export default function LatexQuestion(props: {
  template: QuestionAnswerTemplate;
}) {
  const template = props.template;
  if (template.type === QuestionAnswerTemplateType.SingularInput) {
    const questionAnswer = transformTemplate(
      template,
      template.parameters.map((p) => p.testValue)
    ) as SingleQuestionAnswer;

    let latexQuestion: string;
    if (template.isTextQuestion) {
      latexQuestion = "$$\\text{" + questionAnswer.question + "}$$";
    } else {
      latexQuestion = `$${questionAnswer.question}$`;
    }

    return <Latex>{latexQuestion}</Latex>;
  }

  return <div>todo</div>;
}
