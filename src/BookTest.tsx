import type { BookTestSitting } from "./questions/booktests/booktestsitting";

export const BookTest = (props: { bookTestSitting: BookTestSitting }) => {
  return <div>{props.bookTestSitting.partA.length}</div>;
};
