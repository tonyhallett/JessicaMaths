import {
  QuestionAnswerTemplateType,
  type QuestionAnswerTemplate,
} from "./questions/questionanswertemplates";
import { bookTests } from "./questions/booktests/booktest";
import Latex from "react-latex";

import {
  transformTemplate,
  type SingleQuestionAnswer,
} from "./templatetransform/transformtemplate";
import { Fragment } from "react/jsx-runtime";

export const DemoQuestionsLatex = () => {
  const questionAnswerTemplates = bookTests
    .flatMap((bt) => bt)
    .flatMap((x) => x.partA.concat(x.partB).concat(x.partC));
  return questionAnswerTemplates.map((qaTemplate, index) => (
    <Fragment key={index}>
      <DemoQuestionLatex template={qaTemplate} />
      <br />
    </Fragment>
  ));
};

function DemoQuestionLatex(props: { template: QuestionAnswerTemplate }) {
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
