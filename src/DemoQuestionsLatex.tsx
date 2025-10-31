import {
  questionAnswerTemplates,
  QuestionAnswerTemplateType,
  type QuestionAnswerTemplate,
} from "./questionanswertemplates";
import Latex from "react-latex";

import {
  transformTemplate,
  type SingleQuestionAnswer,
} from "./transformtemplate";
import { Fragment } from "react/jsx-runtime";

export const DemoQuestionsLatex = () => {
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
