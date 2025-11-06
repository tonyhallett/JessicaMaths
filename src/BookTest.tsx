import { useParams } from "react-router";
import { bookQATests } from "./questions/booktests/bookqatests";
export const BookTest = () => {
  const params = useParams();
  return (
    <CommonBookTest
      sectionNumber={Number(params.sectionIndex)}
      testNumber={Number(params.testIndex)}
      isHomework={false}
    />
  );
};

export const CommonBookTest = (props: {
  sectionNumber: number;
  testNumber: number;
  isHomework: boolean;
}) => {
  // check if the section/ test exists
  if (
    bookQATests[props.sectionNumber - 1] === undefined ||
    bookQATests[props.sectionNumber - 1]![props.testNumber - 1] === undefined
  ) {
    return <div>Test not found</div>;
  }

  return (
    <>
      <div>{`Section ${props.sectionNumber}`}</div>
      <div>{`Test ${props.testNumber}`}</div>
      <div>{`Is Homework: ${props.isHomework}`}</div>
    </>
  );
};
